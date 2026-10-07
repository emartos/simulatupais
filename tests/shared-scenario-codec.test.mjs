import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { decodeLegacyScenarioPayload, decodeScenarioPayload, encodeScenarioPayload } from '../dist/app/ui/shared-scenario-codec.js';

test('DEFLATE + Base64url hace round-trip, conserva Unicode y es determinista',()=>{
  const value=['España','¿Qué cambiarías tú?','ámbito & prueba',123,[0,1,2]];
  const first=encodeScenarioPayload(value);
  assert.match(first,/^[A-Za-z0-9_-]+$/);
  assert.equal(first,encodeScenarioPayload(value));
  assert.deepEqual(decodeScenarioPayload(first),value);
  assert.deepEqual(decodeScenarioPayload(deflateSync(JSON.stringify(value)).toString('base64url')),value,'zlib estándar también es decodificable');
});
test('rechaza payload vacío, Base64url inválido, DEFLATE y checksum corruptos, JSON inválido',()=>{
  assert.throws(()=>decodeScenarioPayload(''),/payload/);
  assert.throws(()=>decodeScenarioPayload('%%'),/payload/);
  assert.throws(()=>decodeScenarioPayload('A'),/payload/);
  assert.throws(()=>decodeScenarioPayload(Buffer.from([1,2,3]).toString('base64url')),/DEFLATE/);
  const good=Buffer.from(encodeScenarioPayload(['válido']),'base64url');good[good.length-1]^=1;
  assert.throws(()=>decodeScenarioPayload(good.toString('base64url')),/DEFLATE/);
  assert.throws(()=>decodeScenarioPayload(deflateSync('{').toString('base64url')),/JSON/);
  assert.deepEqual(decodeLegacyScenarioPayload(Buffer.from(JSON.stringify(['legacy'])).toString('base64url')),['legacy']);
});
test('limita la expansión antes de parsear JSON',()=>{
  const bomb=deflateSync(JSON.stringify(['x'.repeat(140_000)])).toString('base64url');
  assert.throws(()=>decodeScenarioPayload(bomb),/demasiado grande/);
});
