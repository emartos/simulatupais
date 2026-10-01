import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
test('servidor estatico: recursos, MIME, CSP y rechazo de escritura',async t=>{
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill());let text='';const url=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('Servidor no disponible')),5000);
  child.stdout.on('data',chunk=>{text+=chunk;const m=text.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timeout);resolve(m[0]);}});child.on('error',reject);
 });
 for(const [file,mime] of [['/','text/html'],['/app/main.js','text/javascript'],['/app/worker.js','text/javascript'],['/data/spain.json','application/json'],['/style.css','text/css']]){
  const response=await fetch(url+file);assert.equal(response.status,200,file);assert.ok(response.headers.get('Content-Type').startsWith(mime));assert.match(response.headers.get('Content-Security-Policy'),/worker-src 'self'/);assert.ok((await response.text()).length>0);
 }
 assert.equal((await fetch(url+'/missing')).status,404);
 assert.equal((await fetch(url+'/',{method:'POST'})).status,405);
 assert.equal((await fetch(url+'/',{method:'HEAD'})).status,200);
 assert.equal((await fetch(url+'/%2e%2e%2fpackage.json')).status,403);
});
