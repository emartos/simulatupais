import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
    writeFileSync(join(build,'style.css'),'nueva interfaz');
    assert.throws(()=>archiveReplay(build,archive),/contenido diferente/);
    assert.equal(verifyArchivedRuntime(build,archive).id,id,'una release visual reutiliza el snapshot intacto');
    writeFileSync(join(archive,id,'style.css'),'mutado');
    assert.throws(()=>archiveReplay(build,archive),/contenido diferente/);
    assert.throws(()=>verifyArchivedRuntime(build,archive),/ha cambiado/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
