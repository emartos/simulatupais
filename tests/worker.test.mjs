import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
const dataset=JSON.parse(readFileSync(new URL('../public/data/spain.json',import.meta.url),'utf8'));
test('protocolo completo del worker en un hilo aislado',async t=>{
 const worker=new Worker(new URL('./worker-harness.mjs',import.meta.url));t.after(()=>worker.terminate());let counter=0;
 const send=(type,payload)=>new Promise((resolve,reject)=>{
  const id=++counter;const timeout=setTimeout(()=>reject(new Error('Tiempo de espera del worker')),5000);
  const handler=message=>{if(message.id===id){clearTimeout(timeout);worker.off('message',handler);resolve(message);}};
  worker.on('message',handler);worker.once('error',reject);worker.postMessage({id,type,payload});
 });
 const initial=await send('INIT',{dataset,seed:42});assert.equal(initial.ok,true);assert.equal(initial.experiment.a.state.month,0);
 const first=await send('ADVANCE',12);assert.equal(first.ok,true);assert.equal(first.experiment.b.state.month,12);
 const configuredInFlight=await send('CONFIGURE',{...first.experiment.b.policy,taxShift:2});assert.equal(configuredInFlight.ok,true);assert.equal(configuredInFlight.experiment.b.state.month,12);
 const forked=await send('FORK',{...first.experiment.b.policy,taxShift:4});assert.equal(forked.ok,true);assert.equal(forked.experiment.forkMonth,12);
 const configured=await send('CONFIGURE',{...forked.experiment.b.policy,taxShift:3});assert.equal(configured.ok,true);
 const advanced=await send('ADVANCE',1);assert.equal(advanced.ok,true);assert.equal(advanced.experiment.b.state.month,13);assert.notEqual(advanced.experiment.a.state.households[0].realPerPerson,advanced.experiment.b.state.households[0].realPerPerson);
 const invalid=await send('UNKNOWN');assert.equal(invalid.ok,false);
 const recovery=await send('ADVANCE',1);assert.equal(recovery.ok,true);assert.equal(recovery.experiment.b.state.month,14);
});
