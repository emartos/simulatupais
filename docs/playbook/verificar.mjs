// External, read-only regression check. Never rewrites expected values or app files.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url));
if(!process.argv[2]){console.error('Uso: node verificar.mjs /ruta/a/polis-espana');process.exit(2);}
try {
 const root=path.resolve(process.argv[2]);
 const load=(f)=>import(pathToFileURL(path.join(root,'dist/app',f)).href);
 const {selectBase,fingerprint}=await load('core/data.js');
 const {createExperiment,advance,fork,point,householdBudget,validateState}=await load('core/engine.js');
 const {baselinePolicy}=await load('core/policy.js');
 const {validateSession,restoreSession,exportSession}=await load('core/session.js');
 const {M,MODEL_VERSION}=await load('core/model.js');
 const data=JSON.parse(fs.readFileSync(path.join(root,'dist/data/spain.json'),'utf8'));
 const expected=JSON.parse(fs.readFileSync(path.join(here,'evidencias/resultados.json'),'utf8'));
 const base=selectBase(data),hash=fingerprint(JSON.stringify(data));
 assert.equal(MODEL_VERSION,expected.manifest.appVersion,'Version de modelo distinta: no regenerar expectativas automaticamente.');
 assert.equal(hash,expected.manifest.datasetHash,'Catalogo distinto: esta bateria fija su version.');
 assert.equal(base.year,expected.manifest.baseYear);
 let values=0,cases=0;
 function near(actual,wanted,label){
  assert.ok(Number.isFinite(actual)&&Number.isFinite(wanted),label+': valor no finito');
  assert.ok(Math.abs(actual-wanted)<=1e-8+1e-10*Math.abs(wanted),label+': '+actual+' != '+wanted);values++;
 }
 for(const scenario of expected.cases){
  const session=validateSession(JSON.parse(fs.readFileSync(path.join(here,scenario.fixture),'utf8')),base,hash);
  let exp=restoreSession(session,base);
  for(const snapshot of scenario.snapshots){
   if(snapshot.month>exp.a.state.month)exp=advance(exp,snapshot.month-exp.a.state.month);
   for(const [key,b] of [['A',exp.a],['B',exp.b]]){
    validateState(b.state);
    for(const [metric,wanted] of Object.entries(snapshot[key].point))near(point(b.state)[metric],wanted,scenario.id+' / '+snapshot.month+' / '+key+' / '+metric);
    for(const metric of ['capacity','capital','debt'])near(b.state[metric],snapshot[key][metric],scenario.id+' / '+metric);
    near(b.state.consumerPrice*100,snapshot[key].consumerPriceIndex,scenario.id+' / IPC');
    b.state.households.forEach((h,i)=>{
     for(const k of ['gross','tax','transfers','disposable','realPerPerson'])near(h[k],snapshot[key].households[i][k],scenario.id+' / household '+i+' / '+k);
    });
    for(const trace of snapshot[key].trace){
     const t=b.state.trace.find(x=>x.id===trace.id);assert.ok(t,trace.id);
     near(t.result,trace.result,scenario.id+' / trace '+trace.id);
     for(const [k,v] of Object.entries(trace.inputs))near(t.inputs[k],v,scenario.id+' / trace '+trace.id+' / '+k);
    }
    assert.deepEqual(b.events.filter(e=>e.type==='institution').map(e=>({month:e.month,title:e.title,text:e.text})),snapshot[key].institutionEvents);
    assert.deepEqual(b.events.filter(e=>e.type==='external').map(e=>({month:e.month,title:e.title,text:e.text})),snapshot[key].externalEvents);
   }
   assert.deepEqual(restoreSession(exportSession(exp,hash),base),exp);
  }
  let monthly=restoreSession(session,base),annual=advance(restoreSession(session,base),12);
  for(let i=0;i<12;i++)monthly=advance(monthly,1);
  assert.deepEqual(monthly,annual);
  console.log('PASS '+scenario.id+' ('+scenario.snapshots.length+' fechas)');cases++;
 }
 // Independent accounting oracle: fixed hypothetical income and population.
 const p=baselinePolicy(base),fixedGDP=1000,population=50000000;
 const h0=householdBudget(fixedGDP,population,1,p);
 const ht=householdBudget(fixedGDP,population,1,{...p,taxShift:4});
 const hc=householdBudget(fixedGDP,population,1,{...p,taxShift:4,transfers:20});
 for(let i=0;i<3;i++)near(h0[i].disposable-ht[i].disposable,h0[i].gross*.04,'identidad impuesto / '+i);
 near(hc.reduce((s,h)=>s+h.disposable,0)-h0.reduce((s,h)=>s+h.disposable,0),7.6,'identidad combinada a ingresos fijos');
 const e=advance(createExperiment(base,1847,{...p,investmentFriction:4}),1);
 near(e.a.state.capacity,e.b.state.capacity,'retardo del capital mes 1');
 near(e.b.state.trace.find(t=>t.id==='investment').inputs.factorFriccion,Math.exp(-.12),'factor friccion');
 const b0=advance(createExperiment(base,1847),12),f=fork(b0,{...p,taxShift:4});
 assert.deepEqual(f.a,b0.a);assert.deepEqual(f.b.state,b0.a.state);assert.deepEqual(f.b.history,b0.a.history);
 console.log('PASS '+cases+' escenarios, '+values+' comparaciones numericas; identidades y bifurcacion.');
 console.log('No se ha probado la interfaz ni IndexedDB en un navegador con este script.');
} catch(error){console.error('FAIL: '+(error?.stack||error));process.exitCode=1;}
