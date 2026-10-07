import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { archiveReplay, verifyArchivedRuntime } from '../scripts/replay-archive-lib.mjs';
import { replayRuntimeId } from '../scripts/replay-runtime.mjs';

test('la identidad cubre worker, datos y restauración, pero no CSS o UI',()=>{
  const worker=Buffer.from('worker A'),data=Buffer.from('dataset A'),restore=Buffer.from('restore A');
  const id=replayRuntimeId(worker,data,restore);
  assert.equal(id,replayRuntimeId(worker,data,restore));
  assert.match(id,/^rt-[a-f0-9]{32}$/);
  assert.notEqual(id,replayRuntimeId(Buffer.from('worker B'),data,restore));
  assert.notEqual(id,replayRuntimeId(worker,Buffer.from('dataset B'),restore));
  assert.notEqual(id,replayRuntimeId(worker,data,Buffer.from('restore B')));
  const current=JSON.parse(readFileSync('dist/build-info.json','utf8'));
  assert.equal(current.replayRuntimeId,replayRuntimeId(readFileSync('dist/app/worker.js'),readFileSync('dist/data/spain.json'),readFileSync('dist/app/replay-kernel.js')));
});

test('el archivador es idempotente y rechaza modificar un snapshot existente',()=>{
  const root=mkdtempSync(join(tmpdir(),'polis-replay-test-')),build=join(root,'build'),archive=join(root,'replay');
  try{
    for(const dir of ['app','data','assets','media','licenses'])mkdirSync(join(build,dir),{recursive:true});
    const worker=Buffer.from('worker fixture'),data=Buffer.from('{"countryCode":"ES","version":"fixture"}'),kernel=Buffer.from('replay fixture');
    const id=replayRuntimeId(worker,data,kernel);
    for(const [name,bytes] of [['app/worker.js',worker],['data/spain.json',data],['app/replay-kernel.js',kernel]])writeFileSync(join(build,name),bytes);
    writeFileSync(join(build,'build-info.json'),JSON.stringify({replayRuntimeId:id,engineVersion:'0.3.0'}));
    for(const name of ['index.html','style.css','theme.js','icon.svg','share-preview.png','share-preview.svg','app/main.js','app/replay-entry.js'])writeFileSync(join(build,name),name);
    writeFileSync(join(build,'assets','flag.png'),'asset');writeFileSync(join(build,'media','video.mp4'),'media');writeFileSync(join(build,'licenses','codec-LICENSE'),'MIT');
    const first=archiveReplay(build,archive),second=archiveReplay(build,archive);
    assert.equal(first.created,true);assert.equal(second.created,false);
    assert.equal(first.contentSha256,second.contentSha256);
    assert.equal(verifyArchivedRuntime(build,archive).id,id);
    assert.equal(JSON.parse(readFileSync(join(archive,'runtime-manifest.json'))).runtimes[id].path,`/replay/${id}/`);
    assert.equal(existsSync(join(archive,id,'media','video.mp4')),false,'el snapshot no duplica el vídeo');
    assert.equal(existsSync(join(archive,id,'assets','flag.png')),false,'el snapshot no duplica el logo');
    writeFileSync(join(build,'style.css'),'nueva interfaz');
    assert.throws(()=>archiveReplay(build,archive),/contenido diferente/);
    assert.equal(verifyArchivedRuntime(build,archive).id,id,'una release visual reutiliza el snapshot intacto');
    writeFileSync(join(archive,id,'style.css'),'mutado');
    assert.throws(()=>archiveReplay(build,archive),/ha cambiado/);
    assert.throws(()=>verifyArchivedRuntime(build,archive),/ha cambiado/);
  }finally{rmSync(root,{recursive:true,force:true});}
});

function fixtureBuild(root,label,video){
  const build=join(root,label);
  for(const dir of ['app','data','assets','media','licenses'])mkdirSync(join(build,dir),{recursive:true});
  const worker=Buffer.from(`worker ${label}`),data=Buffer.from('{"countryCode":"ES","version":"fixture"}'),kernel=Buffer.from('replay fixture');
  const id=replayRuntimeId(worker,data,kernel);
  for(const [name,bytes] of [['app/worker.js',worker],['data/spain.json',data],['app/replay-kernel.js',kernel]])writeFileSync(join(build,name),bytes);
  writeFileSync(join(build,'build-info.json'),JSON.stringify({replayRuntimeId:id,engineVersion:'0.3.0'}));
  for(const name of ['style.css','theme.js','app/replay-entry.js'])writeFileSync(join(build,name),name);
  writeFileSync(join(build,'index.html'),'<link rel="icon" href="./icon.svg"><meta property="og:image" content="https://simulatupais.org/share-preview.png">');
  writeFileSync(join(build,'app/main.js'),'const video="/media/video.mp4",logo="/assets/flag.png";');
  for(const name of ['icon.svg','share-preview.png','share-preview.svg'])writeFileSync(join(build,name),name);
  writeFileSync(join(build,'assets','flag.png'),'same logo');
  writeFileSync(join(build,'media','video.mp4'),video);
  writeFileSync(join(build,'licenses','codec-LICENSE'),'MIT');
  return {build,id};
}

test('dos runtimes comparten blobs idénticos, pero un vídeo cambiado conserva su propio hash',()=>{
  const root=mkdtempSync(join(tmpdir(),'polis-replay-blobs-')),archive=join(root,'replay');
  try{
    const a=fixtureBuild(root,'A','video X'),b=fixtureBuild(root,'B','video X'),c=fixtureBuild(root,'C','video Y');
    for(const {build} of [a,b,c])assert.equal(archiveReplay(build,archive).created,true);
    const manifest=id=>JSON.parse(readFileSync(join(archive,id,'asset-manifest.json'))).assets;
    const assetA=manifest(a.id),assetB=manifest(b.id),assetC=manifest(c.id);
    assert.equal(assetA['media/video.mp4'].path,assetB['media/video.mp4'].path,'A y B reutilizan el mismo vídeo');
    assert.notEqual(assetA['media/video.mp4'].path,assetC['media/video.mp4'].path,'C conserva su vídeo distinto');
    assert.equal(assetA['assets/flag.png'].path,assetB['assets/flag.png'].path);
    assert.equal(assetA['assets/flag.png'].path,assetC['assets/flag.png'].path);
    assert.equal(readdirSync(join(archive,'blobs')).length,6,'tres assets de cabecera, un logo y dos vídeos');
    for(const {id,build} of [a,b,c]){
      assert.equal(verifyArchivedRuntime(build,archive).id,id);
      assert.equal(existsSync(join(archive,id,'media')),false);
      const main=readFileSync(join(archive,id,'app/main.js'),'utf8');
      assert.ok(main.includes('"/media/video.mp4"'),'el catálogo conserva la ruta lógica que valida el esquema');
      assert.ok(main.includes('"/assets/flag.png"'));
    }
    const blob=join(archive,assetA['media/video.mp4'].path.slice('/replay/'.length));
    assert.equal(readFileSync(blob,'utf8'),'video X');
    writeFileSync(blob,'corrupto');
    assert.throws(()=>verifyArchivedRuntime(a.build,archive),/blob|SHA-256/);
    writeFileSync(blob,'video X');
    rmSync(blob);
    assert.throws(()=>verifyArchivedRuntime(a.build,archive),/blob/);
    writeFileSync(blob,'video X');
    const assetManifest=join(archive,a.id,'asset-manifest.json');
    const originalManifest=readFileSync(assetManifest,'utf8');
    writeFileSync(assetManifest,`${originalManifest}\n`);
    assert.throws(()=>verifyArchivedRuntime(a.build,archive),/ha cambiado/,'hasta un cambio semánticamente neutro del manifest altera el digest');
    writeFileSync(assetManifest,originalManifest.replace('"schema": 1','"schema": 2'));
    assert.throws(()=>verifyArchivedRuntime(a.build,archive),/Manifest de assets/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
