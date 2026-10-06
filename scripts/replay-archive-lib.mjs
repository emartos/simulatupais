import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { replayRuntimeId, RUNTIME_ID_PATTERN } from './replay-runtime.mjs';

const SNAPSHOT_FILES=['index.html','style.css','theme.js','icon.svg','share-preview.png','share-preview.svg',
  'build-info.json','app/main.js','app/worker.js','app/replay-entry.js','app/replay-kernel.js','data/spain.json'];
const SNAPSHOT_DIRS=['assets','media'];

function filesUnder(root){
  const visit=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?visit(join(dir,item.name)):[relative(root,join(dir,item.name))]);
  return visit(root).sort();
}
export function digestTree(root){
  const hash=createHash('sha256');
  for(const name of filesUnder(root)){
    const bytes=readFileSync(join(root,name));
    hash.update(name).update('\0').update(String(bytes.length)).update('\0').update(bytes);
  }
  return hash.digest('hex');
}
function copySnapshot(buildRoot,target){
  mkdirSync(target,{recursive:true});
  for(const name of SNAPSHOT_FILES){
    if(!existsSync(join(buildRoot,name)))throw new Error(`Falta un asset del snapshot: ${name}`);
    mkdirSync(join(target,name,'..'),{recursive:true});cpSync(join(buildRoot,name),join(target,name));
  }
  for(const name of SNAPSHOT_DIRS){
    if(!existsSync(join(buildRoot,name)))throw new Error(`Falta un directorio de assets: ${name}`);
    cpSync(join(buildRoot,name),join(target,name),{recursive:true});
  }
}

export function verifyArchivedRuntime(buildRoot,archiveRoot){
  const info=JSON.parse(readFileSync(join(buildRoot,'build-info.json'),'utf8'));
  const id=info.replayRuntimeId;
  if(!RUNTIME_ID_PATTERN.test(id))throw new Error('El build no contiene un replayRuntimeId válido.');
  const computed=replayRuntimeId(readFileSync(join(buildRoot,'app/worker.js')),readFileSync(join(buildRoot,'data/spain.json')),readFileSync(join(buildRoot,'app/replay-kernel.js')));
  if(computed!==id)throw new Error('El runtime ID del build no coincide con sus bytes.');
  const manifest=JSON.parse(readFileSync(join(archiveRoot,'runtime-manifest.json'),'utf8'));
  const entry=manifest.runtimes?.[id],target=join(archiveRoot,id);
  if(manifest.schema!==1||entry?.path!==`/replay/${id}/`||!existsSync(target))throw new Error(`Falta el snapshot archivado de ${id}.`);
  const digest=digestTree(target);
  if(digest!==entry.contentSha256)throw new Error(`El snapshot de ${id} ha cambiado.`);
  const archivedId=replayRuntimeId(readFileSync(join(target,'app/worker.js')),readFileSync(join(target,'data/spain.json')),readFileSync(join(target,'app/replay-kernel.js')));
  if(archivedId!==id)throw new Error(`El snapshot de ${id} no corresponde a su runtime ID.`);
  return {id,contentSha256:digest};
}

export function archiveReplay(buildRoot,archiveRoot){
  const info=JSON.parse(readFileSync(join(buildRoot,'build-info.json'),'utf8'));
  const id=info.replayRuntimeId;
  if(!RUNTIME_ID_PATTERN.test(id))throw new Error('El build no contiene un replayRuntimeId válido.');
  const computed=replayRuntimeId(readFileSync(join(buildRoot,'app/worker.js')),readFileSync(join(buildRoot,'data/spain.json')),readFileSync(join(buildRoot,'app/replay-kernel.js')));
  if(computed!==id)throw new Error('El runtime ID no coincide con el worker, el dataset y el replay kernel.');
  mkdirSync(archiveRoot,{recursive:true});
  const manifestPath=join(archiveRoot,'runtime-manifest.json');
  const manifest=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):{schema:1,runtimes:{}};
  if(manifest.schema!==1||!manifest.runtimes||typeof manifest.runtimes!=='object')throw new Error('Manifest de replay no válido.');
  const target=join(archiveRoot,id),temporary=join(archiveRoot,`.pending-${id}`);
  if(existsSync(temporary))throw new Error('Hay un archivado de replay incompleto.');
  try{
    copySnapshot(buildRoot,temporary);
    const candidateDigest=digestTree(temporary),existing=manifest.runtimes[id];
    if(existsSync(target)){
      if(!existing||existing.contentSha256!==digestTree(target)||candidateDigest!==existing.contentSha256)throw new Error(`El runtime ${id} ya existe con contenido diferente. No se sobrescribe.`);
      return {id,contentSha256:candidateDigest,created:false};
    }
    if(existing)throw new Error(`El manifest menciona ${id}, pero falta su snapshot.`);
    const datasetBytes=readFileSync(join(buildRoot,'data/spain.json'));
    const dataset=JSON.parse(datasetBytes.toString('utf8'));
    manifest.runtimes[id]={path:`/replay/${id}/`,country:dataset.countryCode,modelVersion:info.engineVersion,
      datasetVersion:dataset.version,datasetHash:createHash('sha256').update(datasetBytes).digest('hex'),contentSha256:candidateDigest};
    renameSync(temporary,target);
    const manifestTemporary=`${manifestPath}.pending`;
    try{writeFileSync(manifestTemporary,`${JSON.stringify(manifest,null,2)}\n`);renameSync(manifestTemporary,manifestPath);}
    catch(error){rmSync(target,{recursive:true,force:true});rmSync(manifestTemporary,{force:true});throw error;}
    return {id,contentSha256:candidateDigest,created:true};
  }finally{rmSync(temporary,{recursive:true,force:true});}
}
