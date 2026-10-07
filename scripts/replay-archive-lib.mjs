import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { replayRuntimeId, RUNTIME_ID_PATTERN } from './replay-runtime.mjs';

const SNAPSHOT_FILES=['index.html','style.css','theme.js','build-info.json',
  'app/main.js','app/worker.js','app/replay-entry.js','app/replay-kernel.js','data/spain.json'];
const SNAPSHOT_DIRS=['licenses'];
const ASSET_FILES=['icon.svg','share-preview.png','share-preview.svg'];
const ASSET_DIRS=['assets','media'];
const REWRITABLE_FILES=['index.html','style.css','theme.js','app/replay-entry.js'];
const SHA256_PATTERN=/^[a-f0-9]{64}$/;
const BLOB_PATH_PATTERN=/^\/replay\/blobs\/([a-f0-9]{64})\/asset\.(mp4|webp|png|svg)$/;
const ASSET_EXTENSIONS=new Set(['.mp4','.webp','.png','.svg']);

function sha256(bytes){return createHash('sha256').update(bytes).digest('hex');}
function filesUnder(root){
  const visit=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
    const name=join(dir,item.name);
    if(item.isDirectory())return visit(name);
    if(!item.isFile())throw new Error(`El archivo de replay no admite enlaces simbólicos: ${name}`);
    return [relative(root,name)];
  });
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
function assetNames(buildRoot){
  for(const name of ASSET_FILES)if(!existsSync(join(buildRoot,name)))throw new Error(`Falta un asset del snapshot: ${name}`);
  const names=[...ASSET_FILES];
  for(const dir of ASSET_DIRS){
    if(!existsSync(join(buildRoot,dir)))throw new Error(`Falta un directorio de assets: ${dir}`);
    names.push(...filesUnder(join(buildRoot,dir)).map(name=>`${dir}/${name}`));
  }
  return names.sort();
}
function blobOnDisk(archiveRoot,hash){
  const directory=join(archiveRoot,'blobs',hash);
  if(!existsSync(directory))return null;
  if(!lstatSync(directory).isDirectory())throw new Error(`Blob inválido: ${hash}`);
  const entries=readdirSync(directory);
  if(entries.length!==1||!/^asset\.(mp4|webp|png|svg)$/.test(entries[0]))throw new Error(`Directorio de blob inválido: ${hash}`);
  const filename=join(directory,entries[0]);
  if(!lstatSync(filename).isFile()||sha256(readFileSync(filename))!==hash)throw new Error(`El blob ${hash} no coincide con su SHA-256.`);
  return {path:`/replay/blobs/${hash}/${entries[0]}`,filename};
}
function prepareAssets(buildRoot,archiveRoot){
  const assets={},bytesByHash=new Map(),newBlobs=new Map();
  for(const name of assetNames(buildRoot)){
    const ext=extname(name).toLowerCase();
    if(!ASSET_EXTENSIONS.has(ext))throw new Error(`Tipo de asset no admitido: ${name}`);
    const bytes=readFileSync(join(buildRoot,name)),hash=sha256(bytes);
    const existing=blobOnDisk(archiveRoot,hash);
    const previous=bytesByHash.get(hash);
    if(previous&&!previous.equals(bytes))throw new Error(`Colisión de SHA-256: ${name}`);
    bytesByHash.set(hash,bytes);
    const path=existing?.path||newBlobs.get(hash)?.path||`/replay/blobs/${hash}/asset${ext}`;
    if(existing&&!readFileSync(existing.filename).equals(bytes))throw new Error(`El blob ${hash} contiene otros bytes.`);
    if(!existing)newBlobs.set(hash,{path,bytes});
    assets[name]={sha256:hash,path};
  }
  return {manifest:{schema:1,assets},bytesByHash,newBlobs};
}
function validateAssetManifest(snapshotRoot){
  const manifest=JSON.parse(readFileSync(join(snapshotRoot,'asset-manifest.json'),'utf8'));
  if(manifest.schema!==1||!manifest.assets||typeof manifest.assets!=='object'||Array.isArray(manifest.assets))throw new Error('Manifest de assets no válido.');
  for(const [name,asset] of Object.entries(manifest.assets)){
    const match=typeof asset?.path==='string'&&asset.path.match(BLOB_PATH_PATTERN);
    const validName=(name.startsWith('assets/')||name.startsWith('media/')||ASSET_FILES.includes(name))&&
      name.split('/').every(part=>part!=='.'&&part!=='..'&&part.length>0)&&!name.includes('\\');
    if(!validName||!SHA256_PATTERN.test(asset?.sha256)||!match||match[1]!==asset.sha256)throw new Error(`Referencia de blob no válida: ${name}`);
  }
  return manifest;
}
function digestRuntimeSnapshot(snapshotRoot,archiveRoot,stagedBytes){
  const manifest=validateAssetManifest(snapshotRoot),hash=createHash('sha256');
  hash.update(digestTree(snapshotRoot));
  for(const [name,asset] of Object.entries(manifest.assets).sort(([a],[b])=>a<b?-1:a>b?1:0)){
    const stored=stagedBytes?null:blobOnDisk(archiveRoot,asset.sha256);
    if(!stagedBytes&&(!stored||stored.path!==asset.path))throw new Error(`Falta el blob ${asset.sha256} del snapshot.`);
    const bytes=stagedBytes?.get(asset.sha256)||readFileSync(stored.filename);
    if(sha256(bytes)!==asset.sha256)throw new Error(`El blob ${asset.sha256} no coincide con su SHA-256.`);
    hash.update(name).update('\0').update(asset.path).update('\0').update(bytes);
  }
  return hash.digest('hex');
}
function copySnapshot(buildRoot,target,assetManifest){
  mkdirSync(target,{recursive:true});
  for(const name of SNAPSHOT_FILES){
    if(!existsSync(join(buildRoot,name)))throw new Error(`Falta un archivo del snapshot: ${name}`);
    mkdirSync(join(target,name,'..'),{recursive:true});cpSync(join(buildRoot,name),join(target,name));
  }
  for(const name of SNAPSHOT_DIRS){
    if(!existsSync(join(buildRoot,name)))throw new Error(`Falta un directorio del snapshot: ${name}`);
    cpSync(join(buildRoot,name),join(target,name),{recursive:true});
  }
  writeFileSync(join(target,'asset-manifest.json'),`${JSON.stringify(assetManifest,null,2)}\n`);
  for(const name of REWRITABLE_FILES){
    const file=join(target,name);
    let contents=readFileSync(file,'utf8');
    for(const [logical,asset] of Object.entries(assetManifest.assets)){
      if(ASSET_FILES.includes(logical))contents=contents.replaceAll(`./${logical}`,asset.path);
      contents=contents.replaceAll(`/${logical}`,asset.path);
    }
    writeFileSync(file,contents);
  }
}
function writeNewBlobs(archiveRoot,newBlobs){
  for(const [hash,{path,bytes}] of newBlobs){
    const existing=blobOnDisk(archiveRoot,hash);
    if(existing){if(!readFileSync(existing.filename).equals(bytes)||existing.path!==path)throw new Error(`El blob ${hash} ya existe con contenido diferente.`);continue;}
    const filename=join(archiveRoot,'blobs',hash,path.split('/').at(-1));
    mkdirSync(join(archiveRoot,'blobs',hash),{recursive:true});
    writeFileSync(filename,bytes,{flag:'wx'});
  }
}
function runtimeIdFromBuild(buildRoot){
  const info=JSON.parse(readFileSync(join(buildRoot,'build-info.json'),'utf8'));
  const id=info.replayRuntimeId;
  if(!RUNTIME_ID_PATTERN.test(id))throw new Error('El build no contiene un replayRuntimeId válido.');
  const computed=replayRuntimeId(readFileSync(join(buildRoot,'app/worker.js')),readFileSync(join(buildRoot,'data/spain.json')),readFileSync(join(buildRoot,'app/replay-kernel.js')));
  if(computed!==id)throw new Error('El runtime ID no coincide con el worker, el dataset y el replay kernel.');
  return {id,info};
}
function readAndVerifyArchive(archiveRoot){
  const manifest=JSON.parse(readFileSync(join(archiveRoot,'runtime-manifest.json'),'utf8'));
  if(manifest.schema!==1||!manifest.runtimes||typeof manifest.runtimes!=='object'||Array.isArray(manifest.runtimes))throw new Error('Manifest de replay no válido.');
  for(const [id,entry] of Object.entries(manifest.runtimes)){
    const target=join(archiveRoot,id);
    if(!RUNTIME_ID_PATTERN.test(id)||entry?.path!==`/replay/${id}/`||!existsSync(target))throw new Error(`Falta el snapshot archivado de ${id}.`);
    if(digestRuntimeSnapshot(target,archiveRoot)!==entry.contentSha256)throw new Error(`El snapshot de ${id} ha cambiado.`);
    const archivedId=replayRuntimeId(readFileSync(join(target,'app/worker.js')),readFileSync(join(target,'data/spain.json')),readFileSync(join(target,'app/replay-kernel.js')));
    if(archivedId!==id)throw new Error(`El snapshot de ${id} no corresponde a su runtime ID.`);
  }
  return manifest;
}

export function verifyArchivedRuntime(buildRoot,archiveRoot){
  const {id}=runtimeIdFromBuild(buildRoot);
  const manifest=readAndVerifyArchive(archiveRoot),entry=manifest.runtimes[id];
  if(!entry)throw new Error(`Falta el snapshot archivado de ${id}.`);
  return {id,contentSha256:entry.contentSha256};
}

export function archiveReplay(buildRoot,archiveRoot){
  const {id,info}=runtimeIdFromBuild(buildRoot);
  mkdirSync(archiveRoot,{recursive:true});
  const manifestPath=join(archiveRoot,'runtime-manifest.json');
  const manifest=existsSync(manifestPath)?readAndVerifyArchive(archiveRoot):{schema:1,runtimes:{}};
  const target=join(archiveRoot,id),temporary=join(archiveRoot,`.pending-${id}`);
  if(existsSync(temporary))throw new Error('Hay un archivado de replay incompleto.');
  try{
    const prepared=prepareAssets(buildRoot,archiveRoot);
    copySnapshot(buildRoot,temporary,prepared.manifest);
    const candidateDigest=digestRuntimeSnapshot(temporary,archiveRoot,prepared.bytesByHash),existing=manifest.runtimes[id];
    if(existsSync(target)){
      if(!existing||existing.contentSha256!==digestRuntimeSnapshot(target,archiveRoot)||candidateDigest!==existing.contentSha256)throw new Error(`El runtime ${id} ya existe con contenido diferente. No se sobrescribe.`);
      return {id,contentSha256:candidateDigest,created:false};
    }
    if(existing)throw new Error(`El manifest menciona ${id}, pero falta su snapshot.`);
    writeNewBlobs(archiveRoot,prepared.newBlobs);
    if(digestRuntimeSnapshot(temporary,archiveRoot)!==candidateDigest)throw new Error('Los blobs archivados no coinciden con el snapshot.');
    const datasetBytes=readFileSync(join(buildRoot,'data/spain.json'));
    const dataset=JSON.parse(datasetBytes.toString('utf8'));
    manifest.runtimes[id]={path:`/replay/${id}/`,country:dataset.countryCode,modelVersion:info.engineVersion,
      datasetVersion:dataset.version,datasetHash:sha256(datasetBytes),contentSha256:candidateDigest};
    renameSync(temporary,target);
    const manifestTemporary=`${manifestPath}.pending`;
    try{writeFileSync(manifestTemporary,`${JSON.stringify(manifest,null,2)}\n`);renameSync(manifestTemporary,manifestPath);}
    catch(error){rmSync(target,{recursive:true,force:true});rmSync(manifestTemporary,{force:true});throw error;}
    return {id,contentSha256:candidateDigest,created:true};
  }finally{rmSync(temporary,{recursive:true,force:true});}
}
