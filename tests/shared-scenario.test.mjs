import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { selectBase, fingerprint } from '../dist/app/core/data.js';
import { createPrimaryExperiment, advance, configureBranch, compareFrom } from '../dist/app/core/engine.js';
import { baselinePolicy } from '../dist/app/core/policy.js';
import { restoreSession } from '../dist/app/core/session.js';
import { readScenarioUrl, scenarioUrl } from '../dist/app/ui/shared-scenario.js';
import { changedDecisionsCount, scenarioMetrics, scenarioSummary, shareText, socialShareUrls } from '../dist/app/ui/scenario-share.js';
import { EDITORIAL_SCENARIOS, editorialSlug, findEditorialScenario } from '../dist/app/ui/editorial-scenarios.js';
import { emitGrowthEvent } from '../dist/app/ui/growth-events.js';

const dataset=JSON.parse(readFileSync(new URL('../public/data/spain.json',import.meta.url)));
const base=selectBase(dataset),hash=fingerprint(JSON.stringify(dataset)),origin='https://simulatupais.org';
const policy=baselinePolicy(base);
const urlFor=(exp,view='B')=>scenarioUrl(exp,hash,dataset.countryCode,view,origin);
const read=url=>readScenarioUrl(new URL(url),base,hash,dataset.countryCode);
const raw=url=>JSON.parse(Buffer.from(new URL(url).searchParams.get('s'),'base64url').toString());
const withRaw=(url,wire)=>{const next=new URL(url);next.searchParams.set('s',Buffer.from(JSON.stringify(wire)).toString('base64url'));return next.toString();};

test('un escenario simple conserva inputs, trayectoria y recarga sin almacenamiento',()=>{
  let exp=createPrimaryExperiment(base,1847,{...policy,taxShift:2,transfers:10,services:19.3},false);
  exp=advance(exp,12);exp=configureBranch(exp,'B',{...exp.b.policy,publicInvestment:3.3});exp=advance(exp,24);
  const url=urlFor(exp),shared=read(url),replayed=restoreSession(shared.session,base);
  assert.equal(new URL(url).searchParams.get('v'),'1');assert.equal(shared.viewedBranch,'B');
  assert.equal(replayed.seed,exp.seed);assert.equal(replayed.shocksEnabled,exp.shocksEnabled);
  assert.deepEqual(replayed.b.initialPolicy,exp.b.initialPolicy);assert.deepEqual(replayed.b.policyChanges,exp.b.policyChanges);
  assert.deepEqual(replayed.b.history,exp.b.history);assert.deepEqual(replayed.b.state,exp.b.state);
  assert.equal(urlFor(replayed),url,'una recarga produce la misma URL canónica');
});
test('una comparación conserva bifurcación, políticas y ambas trayectorias',()=>{
  let exp=advance(createPrimaryExperiment(base,778,{...policy,consumptionTax:15}),12);
  exp=compareFrom(exp,'B',{...exp.b.policy,services:19.3,publicInvestment:3.4});
  exp=advance(exp,18);exp=configureBranch(exp,'A',{...exp.a.policy,transfers:10});exp=advance(exp,6);
  const shared=read(urlFor(exp,'A')),replayed=restoreSession(shared.session,base);
  assert.equal(shared.viewedBranch,'A');assert.equal(replayed.forkMonth,12);
  for(const id of ['a','b']){assert.deepEqual(replayed[id].history,exp[id].history);assert.deepEqual(replayed[id].state,exp[id].state);assert.deepEqual(replayed[id].policy,exp[id].policy);}
});
test('la representación es canónica y excluye nombres y metadatos privados',()=>{
  const exp=advance(createPrimaryExperiment(base,1847,{...policy,taxShift:2}),24);
  const renamed={...exp,branchNames:{A:'Correo privado persona@example.com',B:'Sesión 1234'}};
  const shuffled={...exp,b:{...exp.b,initialPolicy:Object.fromEntries(Object.entries(exp.b.initialPolicy).reverse())}};
  const url=urlFor(exp);
  assert.equal(urlFor(renamed),url);assert.equal(urlFor(shuffled),url);
  assert.ok(!url.includes('persona')&&!JSON.stringify(raw(url)).includes('persona@example.com'));
  assert.deepEqual([...new URL(url).searchParams.keys()],['v','s']);
  assert.equal(raw(url)[0],dataset.countryCode);assert.equal(raw(url)[1],base.year);
});
test('versiones, tipos, rangos y estado incompleto fallan de forma controlada',()=>{
  const url=urlFor(createPrimaryExperiment(base,1847,policy));
  const wrongVersion=new URL(url);wrongVersion.searchParams.set('v','99');assert.throws(()=>read(wrongVersion),/versión/);
  const unknown=new URL(url);unknown.searchParams.set('tema','ámbito & prueba');assert.equal(read(unknown).session.seed,1847);
  const corrupt=new URL(url);corrupt.searchParams.set('s','%%');assert.throws(()=>read(corrupt),/válido/);
  const wire=raw(url);wire[5]=-1;assert.throws(()=>read(withRaw(url,wire)),/seed|semilla/i);
  wire[5]=1847;wire[13][0][0]=99;assert.throws(()=>read(withRaw(url,wire)),/rango/i);
  wire[13][0][0]='2';assert.throws(()=>read(withRaw(url,wire)),/válidas/i);
  assert.throws(()=>read(withRaw(url,wire.slice(0,8))),/incompleto/i);
  const wrongYear=raw(url);wrongYear[1]=2024;assert.throws(()=>read(withRaw(url,wrongYear)),/otro país, año/);
});
test('resumen y enlaces sociales son neutros y deterministas',()=>{
  const exp=advance(createPrimaryExperiment(base,1847,{...policy,taxShift:2,transfers:10}),120);
  assert.equal(changedDecisionsCount(exp,'B'),2);
  assert.match(scenarioSummary(exp,'B'),/España · horizonte 10 años · 2 decisiones modificadas/);
  assert.equal(scenarioMetrics(exp.b).length,4);
  const text=shareText(scenarioSummary(exp,'B'));assert.match(text,/escenario simulado, no una predicción/);
  const links=socialShareUrls(urlFor(exp),text);
  assert.equal(new URL(links.whatsapp).searchParams.get('text'),`${text} ${urlFor(exp)}`);
  assert.equal(new URL(links.x).searchParams.get('url'),urlFor(exp));
});
test('dos escenarios editoriales declarativos son válidos y sus rutas son estables',()=>{
  assert.equal(EDITORIAL_SCENARIOS.length,2);
  for(const item of EDITORIAL_SCENARIOS){
    assert.equal(editorialSlug(`#/espana/${item.slug}`),item.slug);
    assert.equal(findEditorialScenario(item.slug),item);
    assert.ok(item.title&&item.question&&item.description);
    assert.equal(item.scenario.months,60);
    const exp=advance(createPrimaryExperiment(base,item.scenario.seed,item.scenario.policy(base),item.scenario.shocksEnabled),item.scenario.months);
    assert.equal(read(urlFor(exp)).session.months,60);
  }
  assert.equal(findEditorialScenario('no-existe'),undefined);
  assert.throws(()=>editorialSlug('#/espana/%3Cscript%3E'),/válida/);
});
test('la capa de eventos solo publica propiedades permitidas y no hace red',()=>{
  const before=globalThis.window,window=new EventTarget(),received=[];
  globalThis.window=window;window.addEventListener('simulatupais:growth',event=>received.push(event.detail));
  try{
    emitGrowthEvent({name:'shared_scenario_opened',country:'ES',horizon:12,scenario_version:1});
    emitGrowthEvent({name:'shared_scenario_modified',country:'ES',horizon:12,scenario_version:1});
    emitGrowthEvent({name:'shared_scenario_simulated',country:'ES',horizon:13,scenario_version:1});
    emitGrowthEvent({name:'share_clicked',method:'copy'});
    assert.deepEqual(received.map(item=>item.name),['shared_scenario_opened','shared_scenario_modified','shared_scenario_simulated','share_clicked']);
    assert.ok(received.every(item=>!('session_id' in item)&&!('email' in item)));
  }finally{if(before===undefined)delete globalThis.window;else globalThis.window=before;}
});
test('metadatos sociales y preview PNG están incluidos en la compilación',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  for(const name of ['og:title','og:description','og:image','og:url','twitter:card'])assert.ok(html.includes(name),name);
  assert.ok(statSync(new URL('../dist/share-preview.png',import.meta.url)).size>0);
});
