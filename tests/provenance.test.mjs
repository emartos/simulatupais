import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectBase, fingerprint } from '../dist/app/core/data.js';
import { createExperiment } from '../dist/app/core/engine.js';
import { baselinePolicy } from '../dist/app/core/policy.js';
import { exportSession, validateSession } from '../dist/app/core/session.js';

const sha='a1b2c3d4e5f60718293a4b5c6d7e8f9012345678';
const buildInfo=JSON.parse(readFileSync(new URL('../dist/build-info.json',import.meta.url),'utf8'));
globalThis.__PROJECT_CONFIG__={repositoryUrl:'https://github.com/emartos/simulatupais',licensePath:'LICENSE',build:buildInfo};
const { REPOSITORY_URL, LICENSE_URL, commitUrl, buildReference }=await import('../dist/app/project.js');

test('la configuración enlaza al repositorio y su archivo de licencia',()=>{
  assert.equal(REPOSITORY_URL,'https://github.com/emartos/simulatupais');
  assert.equal(LICENSE_URL,'https://github.com/emartos/simulatupais/blob/main/LICENSE');
});

test('el SHA completo produce un enlace al commit y se presenta abreviado',()=>{
  const ref=buildReference({engineVersion:'0.3.0',commitSha:sha});
  assert.equal(ref.shortSha,'a1b2c3d');
  assert.equal(ref.url,`https://github.com/emartos/simulatupais/commit/${sha}`);
  assert.equal(commitUrl(sha),ref.url);
});

test('una build sin SHA y una sesión antigua se muestran sin fingir trazabilidad',()=>{
  assert.equal(buildReference({engineVersion:'0.3.0',commitSha:null}).url,null);
  assert.equal(buildReference({engineVersion:'0.3.0',commitSha:null}).shortSha,null);
  assert.equal(buildReference(undefined).version,'Versión no registrada');
  if(buildInfo.commitSha) assert.equal(buildReference({engineVersion:buildInfo.engineVersion,commitSha:buildInfo.commitSha}).url,buildInfo.commitUrl);
});

test('las sesiones nuevas conservan la versión y el commit al validar e importar',()=>{
  const data=JSON.parse(readFileSync(new URL('../public/data/spain.json',import.meta.url),'utf8'));
  const base=selectBase(data), hash=fingerprint(JSON.stringify(data));
  const exp=createExperiment(base,123,baselinePolicy(base));
  const original=exportSession(exp,hash,{engineVersion:'0.3.0',commitSha:sha});
  assert.deepEqual(validateSession(original,base,hash).engineBuild,{engineVersion:'0.3.0',commitSha:sha});
  const {engineBuild:_,...legacy}=original;
  assert.deepEqual(validateSession(legacy,base,hash).engineBuild,{engineVersion:original.modelVersion,commitSha:null});
});
