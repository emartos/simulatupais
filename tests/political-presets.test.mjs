import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { POLITICAL_PRESETS, POLITICAL_PRESET_BLOCKERS } from '../dist/app/political-presets/catalog.js';
import { validatePoliticalPreset, validatePresetCatalog, changedPresetValues } from '../dist/app/political-presets/schema.js';
import { applyPoliticalPreset, editPresetDraft, presetCompatibility } from '../dist/app/political-presets/apply.js';
import { selectBase, fingerprint } from '../dist/app/core/data.js';
import { baselinePolicy } from '../dist/app/core/policy.js';
import { advance, compareFrom, createExperiment } from '../dist/app/core/engine.js';
import { exportSession, restoreSession, validateSession } from '../dist/app/core/session.js';
import { POLITICAL_CODING } from '../dist/app/political-presets/coding-data.js';
import { positionToControlValue } from '../dist/app/political-presets/coding.js';
import { WIZARD_QUESTIONS, wizardPolicy } from '../dist/app/ui/wizard.js';

const dataset=JSON.parse(readFileSync(new URL('../public/data/spain.json',import.meta.url),'utf8'));
const base=selectBase(dataset),hash=fingerprint(JSON.stringify(dataset));
const clone=x=>JSON.parse(JSON.stringify(x));
const unit={taxShift:'pp',progressivity:'pp',consumptionTax:'%',corporateTax:'%',transfers:'%',publicInvestment:'% PIB',services:'% PIB',investmentFriction:'pp'};
const fixture=(id)=>({id:`preset-test-${id}`,country:'ES',actorName:`Actor interno ${id}`,actorType:'PARTY',partyName:`Actor interno ${id}`,electionName:'Elección de prueba interna',electionDate:'2023-07-23',version:'test-1',modelVersion:'0.3.0',cutoffDate:'2023-07-23',title:'Fixture interno de tests',description:'Datos inventados exclusivamente para pruebas; no se importan al catálogo de producto.',sources:[{id:`source-${id}`,title:'Fuente interna de prueba',url:`urn:test:${id}`,publisher:'Tests',publishedAt:'2023-07-23',accessedAt:'2023-07-23'}],doubleCountingCheck:'PASS',logo:{path:'/assets/political-parties/pp.svg',sourceUrl:'https://www.pp.es/wp-content/uploads/2022/08/logo-short.svg',sourceType:'OFFICIAL_WEBSITE',retrievedAt:'2026-10-05'},logoFallback:'TEST',congressSeats:1,policies:Object.fromEntries(Object.keys(unit).map(key=>[key,{status:'UNMAPPED',value:null,unit:unit[key],sourceIds:[`source-${id}`],mappingMethod:'NONE',positionScore:null,evidence:[],sourceSummary:'Evidencia ficticia del fixture.',sourceLocator:'Caso artificial de prueba.',sourceText:'Sin propuesta de producción.',mappingRationale:'Se prueba el baseline.',confidence:null,unmappedReason:'INSUFFICIENT_TEXTUAL_EVIDENCE'}]))});
const a=fixture('a'),b=fixture('b');
a.policies.taxShift={...a.policies.taxShift,status:'DOCUMENTED',value:2,mappingMethod:'DIRECT',sourceText:'Cambio numérico explícito ficticio.',mappingRationale:'Copia directa usada solo por test.',confidence:'MEDIUM',unmappedReason:undefined};
a.policies.progressivity={...a.policies.progressivity,status:'APPROXIMATED',value:null,mappingMethod:'STANDARDIZED_CODING',positionScore:1,evidence:['FIXTURE-001'],sourceText:'Propuesta artificial.',mappingRationale:'Una unidad de intensidad equivale a un paso del control, solo para el fixture.',confidence:'LOW',unmappedReason:undefined};

const targetActors=['Partido Popular (PP)','Partido Socialista Obrero Español (PSOE)','VOX','Coalición Sumar','Esquerra Republicana de Catalunya (ERC)','Junts per Catalunya (Junts)','Euskal Herria Bildu (EH Bildu)','EAJ-PNV','Bloque Nacionalista Galego (BNG)','Coalición Canaria (CC)','Unión del Pueblo Navarro (UPN)'];
const presetActiveCount=p=>Object.values(p.policies).filter(m=>m.status!=='UNMAPPED').length;
test('el catálogo de producción contiene programas oficiales verificables y no publica actores ficticios',()=>{
  assert.equal(POLITICAL_PRESETS.length,11);
  assert.ok(POLITICAL_PRESETS.every(p=>p.modelVersion==='0.3.0'&&p.electionDate==='2023-07-23'&&p.electionName.includes('23J')));
  assert.equal(POLITICAL_PRESETS.some(p=>/Horizonte|Acuerdo Cívico|ficticio/i.test(`${p.actorName} ${p.title}`)),false);
  assert.equal(validatePresetCatalog(POLITICAL_PRESETS).length,11);
});
test('los once logos usan caja blanca; los assets quedan intactos y solo ERC/BNG escalan ópticamente',()=>{
  const css=readFileSync(new URL('../public/polish.css',import.meta.url),'utf8');
  assert.match(css,/\.preset-logo\s*\{[^}]*background:\s*#fff/i);assert.match(css,/\.preset-logo img\s*\{[^}]*object-fit:\s*contain/i);assert.match(css,/\.preset-logo img\s*\{[^}]*transform:\s*scale\(var\(--logo-scale,1\)\)/i);
  for(const preset of POLITICAL_PRESETS){assert.ok(preset.logo);assert.ok(existsSync(new URL(`../public${preset.logo.path}`,import.meta.url)));}
  const erc=readFileSync(new URL('../public/assets/political-parties/erc.png',import.meta.url));assert.equal(createHash('sha256').update(erc).digest('hex'),'8b3103033850d5bb897c7f84748ec607459bfdab85246bf62df04569f5edc8aa');
  assert.deepEqual(POLITICAL_PRESETS.filter(p=>p.logoPresentation).map(p=>[p.id,p.logoPresentation.scale]),[['preset-es-erc-23j-2023-v1',1.35],['preset-es-bng-23j-2023-v1',1.55]]);
});
test('la revisión focalizada cubre los cinco actores y los ocho controles con el cierre humano aplicado',()=>{
  const report=readFileSync(new URL('../docs/political-presets/23J-2023-SECONDARY-REVIEW.md',import.meta.url),'utf8');
  for(const actor of ['Junts per Catalunya','Euskal Herria Bildu','Coalición Canaria','EAJ-PNV','Unión del Pueblo Navarro'])assert.ok(report.includes(actor));
  for(const control of Object.keys(unit))assert.ok(report.includes(`| ${control} |`));
  assert.match(report,/UPN \| taxShift \|[^\n]*\| STATE_GENERAL \| — \| −1/);assert.match(report,/EAJ-PNV \| investmentFriction \|[^\n]*sin step representable/);
  assert.match(report,/Coalición Canaria \| transfers \|[^\n]*null[^\n]*UNMAPPED_TRAS_REVISION/);
  assert.match(report,/URL oficial 23J no accesible/);assert.match(report,/Pág\. impresa 15, adaptación del sistema tributario estatal/);
  assert.equal(POLITICAL_PRESETS.find(p=>p.id==='preset-es-junts-23j-2023-v1').policies.consumptionTax.status,'UNMAPPED','Junts no conserva una posición cuyo documento oficial no se pudo verificar');
  const expected={upn:['APROBADO','UNMAPPED_TRAS_REVISION'],pnv:['APROBADO','APROBADO','UNMAPPED_TRAS_REVISION'],bildu:['APROBADO','APROBADO','APROBADO','UNMAPPED_TRAS_REVISION'],cc:'UNMAPPED_TRAS_REVISION',junts:'UNMAPPED_TRAS_REVISION'};
  const byId=id=>POLITICAL_PRESETS.find(p=>p.id===`preset-es-${id}-23j-2023-v1`);
  assert.deepEqual([byId('upn').policies.taxShift.reviewStatus,byId('upn').policies.transfers.reviewStatus],expected.upn);
  assert.deepEqual([byId('pnv').policies.progressivity.reviewStatus,byId('pnv').policies.publicInvestment.reviewStatus,byId('pnv').policies.transfers.reviewStatus],expected.pnv);
  assert.deepEqual([byId('eh-bildu').policies.progressivity.reviewStatus,byId('eh-bildu').policies.transfers.reviewStatus,byId('eh-bildu').policies.services.reviewStatus,byId('eh-bildu').policies.publicInvestment.reviewStatus],expected.bildu);
  assert.equal(byId('cc').policies.transfers.reviewStatus,expected.cc);assert.equal(byId('junts').policies.consumptionTax.reviewStatus,expected.junts);
});
test('decisiones humanas 23J y valores aprobados quedan aplicados exactamente',()=>{
  const p=id=>POLITICAL_PRESETS.find(x=>x.id===`preset-es-${id}-23j-2023-v1`);
  assert.equal(p('pp').policies.taxShift.positionScore,-1);assert.equal(p('pp').policies.taxShift.confidence,'MEDIUM');assert.equal(p('pp').policies.publicInvestment.positionScore,1);assert.equal(p('pp').policies.consumptionTax.status,'UNMAPPED');assert.equal(p('pp').policies.consumptionTax.mappingMethod,'NONE');assert.match(p('pp').policies.consumptionTax.mappingRationale,/parciales y\/o temporales/);
  assert.equal(p('psoe').policies.transfers.positionScore,1);assert.equal(p('psoe').policies.transfers.confidence,'HIGH');assert.equal(p('psoe').policies.publicInvestment.positionScore,2);assert.equal(p('psoe').policies.services.positionScore,2);
  assert.equal(p('sumar').policies.consumptionTax.status,'UNMAPPED');assert.equal(p('sumar').policies.consumptionTax.mappingMethod,'NONE');assert.match(p('sumar').policies.consumptionTax.mappingRationale,/dirección neta/);
  assert.equal(p('erc').policies.progressivity.positionScore,1);assert.equal(p('erc').policies.progressivity.confidence,'MEDIUM');
  assert.deepEqual(['taxShift','progressivity','consumptionTax','corporateTax'].map(k=>[p('vox').policies[k].positionScore,p('vox').policies[k].confidence]),[[-2,'HIGH'],[-1,'MEDIUM'],[-2,'MEDIUM'],[-2,'HIGH']]);
  assert.deepEqual(['taxShift','progressivity','corporateTax','transfers','publicInvestment','services'].map(k=>p('sumar').policies[k].positionScore),[1,2,2,2,2,2]);assert.equal(p('bng').policies.transfers.positionScore,1);assert.equal(p('pnv').policies.taxShift.status,'UNMAPPED');assert.equal(p('upn').policies.transfers.status,'UNMAPPED');
  const approved=(preset,key,score,confidence)=>{const m=p(preset).policies[key];assert.equal(m.status,'APPROXIMATED');assert.equal(m.positionScore,score);assert.equal(m.confidence,confidence);assert.equal(m.mappingMethod,'STANDARDIZED_CODING');assert.equal(m.reviewStatus,'APROBADO');};
  approved('upn','taxShift',-1,'MEDIUM');approved('pnv','progressivity',1,'MEDIUM');approved('pnv','publicInvestment',1,'MEDIUM');approved('eh-bildu','progressivity',1,'MEDIUM');approved('eh-bildu','transfers',1,'HIGH');approved('eh-bildu','services',1,'MEDIUM');
  for(const [actor,key] of [['upn','transfers'],['pnv','transfers'],['eh-bildu','publicInvestment'],['cc','transfers'],['junts','consumptionTax']]){assert.equal(p(actor).policies[key].status,'UNMAPPED');assert.equal(p(actor).policies[key].positionScore,null);assert.equal(p(actor).policies[key].mappingMethod,'NONE');assert.equal(p(actor).policies[key].reviewStatus,'UNMAPPED_TRAS_REVISION');}
  const protectedScores={pp:[-1,null,null,null,null,1,null,null],psoe:[null,null,null,null,1,2,2,null],vox:[-2,-1,-2,-2,null,null,null,null],sumar:[1,2,null,2,2,2,2,null],erc:[null,1,null,null,null,null,null,null],bng:[null,null,null,null,1,null,null,null]};for(const [actor,scores] of Object.entries(protectedScores))assert.deepEqual(Object.keys(p(actor).policies).map(key=>p(actor).policies[key].positionScore),scores,`${actor} conserva los scores cerrados`);
});
test('todos los presets tienen logo oficial local sin hotlinks runtime ni fallbacks',()=>{
  const officialHosts=new Set(['www.pp.es','www.psoe.es','www.voxespana.es','movimientosumar.es','www.eaj-pnv.eus','www.bng.gal','www.upn.org','staticen.esquerra.cat','junts.cat','ehbildu.eus','coalicioncanaria.org']);for(const p of POLITICAL_PRESETS){assert.ok(p.logo,`${p.actorName} necesita logo`);assert.ok(p.logo.path.startsWith('/assets/political-parties/'));assert.equal(/^https?:/i.test(p.logo.path),false);assert.ok(existsSync(new URL(`../public${p.logo.path}`,import.meta.url)),`${p.actorName} asset existe`);assert.match(p.logo.sourceUrl,/^https:\/\//);assert.ok(officialHosts.has(new URL(p.logo.sourceUrl).hostname),`${p.actorName}: fuente en dominio oficial`);assert.equal(p.logo.retrievedAt,'2026-10-05');}
  const pp=POLITICAL_PRESETS.find(p=>p.id==='preset-es-pp-23j-2023-v1');assert.equal(pp.logo.path,'/assets/political-parties/pp.png');assert.equal(pp.logo.sourceUrl,'https://www.pp.es/wp-content/uploads/2024/12/logo-azul-e1734337769627.png');
});
test('el catálogo de producción contiene exactamente las once candidaturas, ordenadas por escaños',()=>{
  const represented=POLITICAL_PRESETS.map(p=>p.actorName);
  for(const actor of targetActors)assert.ok(represented.some(name=>name===actor||name.includes(actor.replace(/ \(.+\)/,''))),`falta ${actor}`);
  assert.equal(POLITICAL_PRESETS.length,11);assert.equal(POLITICAL_PRESET_BLOCKERS.length,0);assert.deepEqual(POLITICAL_PRESETS.map(p=>p.congressSeats),[137,121,33,31,7,7,6,5,1,1,1]);
});
test('los mapeos distinguen codificación estandarizada de falta de evidencia y conservan sus IDs',()=>{
  for(const p of POLITICAL_PRESETS)for(const [key,m] of Object.entries(p.policies)){
    assert.ok(m.sourceIds.length>0&&m.sourceIds.every(id=>p.sources.some(s=>s.id===id)),`${p.actorName} ${key} source refs`);
    assert.ok(m.sourceSummary&&m.sourceLocator&&m.mappingRationale);
    assert.equal(p.doubleCountingCheck,'PASS');if(m.status==='UNMAPPED'){assert.equal(m.value,null);assert.equal(m.mappingMethod,'NONE');assert.equal(m.positionScore,null);assert.deepEqual(m.evidence,[]);assert.equal(m.confidence,null);}else{assert.equal(m.status,'APPROXIMATED');assert.equal(m.mappingMethod,'STANDARDIZED_CODING');assert.equal(m.value,null);assert.ok([-2,-1,0,1,2].includes(m.positionScore));assert.ok(m.evidence.length>0);assert.ok(m.confidence);}
  }
});
test('valida DIRECT, codificación estandarizada y NONE en fixtures internos',()=>{
  assert.equal(validatePoliticalPreset(a).policies.taxShift.status,'DOCUMENTED');
  assert.equal(validatePoliticalPreset(a).policies.progressivity.status,'APPROXIMATED');
  assert.equal(validatePoliticalPreset(a).policies.progressivity.mappingMethod,'STANDARDIZED_CODING');
  assert.equal(validatePoliticalPreset(a).policies.consumptionTax.value,null);
});
test('el catálogo rechaza IDs duplicados',()=>assert.throws(()=>validatePresetCatalog([a,a]),/duplicados/));
test('el esquema rechaza controles desconocidos y campos de política ausentes',()=>{
  const unknown=clone(a);unknown.policies.extra={};assert.throws(()=>validatePoliticalPreset(unknown),/ocho controles/);
  const missing=clone(a);delete missing.policies.services;assert.throws(()=>validatePoliticalPreset(missing),/ocho controles/);
});
test('rechaza valores fuera de rango, scores inválidos, estado desconocido, fuente rota, modelo ausente y unidad incompatible',()=>{
  const range=clone(a);range.policies.taxShift.value=999;assert.throws(()=>validatePoliticalPreset(range),/rango/);
  const score=clone(a);score.policies.progressivity.positionScore=3;assert.throws(()=>validatePoliticalPreset(score),/score/i);
  const status=clone(a);status.policies.taxShift.status='INVENTED';assert.throws(()=>validatePoliticalPreset(status),/desconocido/);
  const source=clone(a);source.policies.taxShift.sourceIds=['missing'];assert.throws(()=>validatePoliticalPreset(source),/Fuente referenciada/);
  const version=clone(a);delete version.modelVersion;assert.throws(()=>validatePoliticalPreset(version),/modelVersion/);
  const unitError=clone(a);unitError.policies.taxShift.unit='%';assert.throws(()=>validatePoliticalPreset(unitError),/Unidad incompatible/);
});
test('UNMAPPED exige null pero conserva referencias a fuente de contexto válidas',()=>{
  const value=clone(a);value.policies.consumptionTax.value=12;assert.throws(()=>validatePoliticalPreset(value),/value=null/);
  const source=clone(a);source.policies.consumptionTax.sourceIds=['missing'];assert.throws(()=>validatePoliticalPreset(source),/Fuente referenciada/);
});
test('el catálogo activa posiciones con codificación y mantiene análisis de componentes separado',()=>{
  const active=POLITICAL_PRESETS.flatMap(p=>Object.entries(p.policies).filter(([,m])=>m.status!=='UNMAPPED').map(([key,m])=>({p,key,m})));
  assert.equal(active.length,23);
  const counts=Object.fromEntries(POLITICAL_PRESETS.map(p=>[p.actorName,presetActiveCount(p)]));
  assert.deepEqual(Object.values(counts),[2,3,4,6,1,0,3,2,1,0,1]);
  const junts=POLITICAL_PRESETS.find(p=>p.id==='preset-es-junts-23j-2023-v1'),bildu=POLITICAL_PRESETS.find(p=>p.id==='preset-es-eh-bildu-23j-2023-v1'),cc=POLITICAL_PRESETS.find(p=>p.id==='preset-es-cc-23j-2023-v1'),pnv=POLITICAL_PRESETS.find(p=>p.id==='preset-es-pnv-23j-2023-v1'),upn=POLITICAL_PRESETS.find(p=>p.id==='preset-es-upn-23j-2023-v1');assert.equal(junts.policies.consumptionTax.status,'UNMAPPED');assert.equal(bildu.policies.progressivity.positionScore,1);assert.equal(bildu.policies.transfers.positionScore,1);assert.equal(bildu.policies.services.positionScore,1);assert.equal(bildu.policies.publicInvestment.status,'UNMAPPED');assert.equal(pnv.policies.progressivity.positionScore,1);assert.equal(pnv.policies.publicInvestment.positionScore,1);assert.equal(pnv.policies.transfers.status,'UNMAPPED');assert.equal(upn.policies.taxShift.positionScore,-1);assert.equal(upn.policies.transfers.status,'UNMAPPED');assert.equal(presetActiveCount(cc),0);
  const review=readFileSync(new URL('../docs/political-presets/23J-2023-CODING-REVIEW.md',import.meta.url),'utf8');assert.match(review,/Junts per Catalunya \(Junts\).*UNMAPPED_TRAS_REVISION/);assert.match(review,/EH Bildu \| `services` \| \+1[^\n]*APROBADO/);assert.match(review,/Coalición Canaria \(CCa\).*UNMAPPED_TRAS_REVISION/);
  const sumar=POLITICAL_PRESETS.find(p=>p.actorName==='Coalición Sumar');assert.equal(sumar.policies.transfers.positionScore,2);assert.equal(sumar.policies.publicInvestment.positionScore,2);
  const artifact=JSON.parse(readFileSync(new URL('../docs/political-presets/derivations/sumar-transfers-components-23j-2023.json',import.meta.url),'utf8'));
  assert.equal(artifact.presetId,sumar.id);assert.equal(artifact.control,'transfers');assert.equal(artifact.status,'component-analysis-only');assert.equal(artifact.aggregateResult,null);
  assert.deepEqual(artifact.measures.map(x=>x.id),['SUMAR-TRANSFERS-001','SUMAR-TRANSFERS-002','SUMAR-TRANSFERS-003','SUMAR-TRANSFERS-004','SUMAR-TRANSFERS-005','SUMAR-TRANSFERS-006','SUMAR-TRANSFERS-007']);
  const expected=20000*(262775+246143)/(.17*(1498324*1e6))*100;assert.equal(expected,artifact.componentResults[1].rawBaselinePercent);assert.ok(artifact.componentResults.every(c=>c.appliedControlValue===null));assert.equal(sumar.doubleCountingCheck,'PASS');
});
test('cada programa tiene inventario y clasificación de los ocho controles',()=>{
  const slugs=['pp','psoe','vox','sumar','erc','eaj-pnv','bng','upn'];
  const allIds=[];for(const slug of slugs){const doc=readFileSync(new URL(`../docs/political-presets/inventory/${slug}-23j-2023.md`,import.meta.url),'utf8');assert.match(doc,/\| ID \| Medida \| Localizador/);assert.match(doc,/## Clasificación por control/);assert.match(doc,/## (?:Fase )?D–G: agregación y resultado/);for(const key of Object.keys(unit))assert.ok(doc.includes(key),`${slug} carece clasificación ${key}`);allIds.push(...[...doc.matchAll(/^\| ([A-Z]+-[A-Z]+-\d{3}) \|/gm)].map(match=>match[1]));}
  assert.equal(new Set(allIds).size,allIds.length,'los IDs de medidas son estables y no duplicados entre inventarios');
});
test('las revisiones críticas de Sumar y VOX constan en los inventarios',()=>{
  const sumar=readFileSync(new URL('../docs/political-presets/inventory/sumar-23j-2023.md',import.meta.url),'utf8'),vox=readFileSync(new URL('../docs/political-presets/inventory/vox-23j-2023.md',import.meta.url),'utf8');
  for(const id of ['SUMAR-TRANSFERS-001','SUMAR-TRANSFERS-002','SUMAR-TRANSFERS-003','SUMAR-TRANSFERS-004','SUMAR-TRANSFERS-005','SUMAR-TRANSFERS-006','SUMAR-TRANSFERS-007','SUMAR-PUBINV-001','SUMAR-PUBINV-002','SUMAR-PUBINV-003','SUMAR-PUBINV-004'])assert.ok(sumar.includes(id),`falta ${id}`);
  for(const id of ['VOX-IRPF-001','VOX-IRPF-002','VOX-IRPF-003','VOX-IRPF-004','VOX-IRPF-005','VOX-IVA-001','VOX-SOC-001'])assert.ok(vox.includes(id),`falta ${id}`);
});
test('DIRECT no se confunde con codificación y toda posición estandarizada necesita evidencia',()=>{
  const direct=clone(a);direct.policies.taxShift.mappingMethod='STANDARDIZED_CODING';assert.throws(()=>validatePoliticalPreset(direct),/codificación estandarizada/);
  const noReason=clone(a);delete noReason.policies.services.unmappedReason;assert.throws(()=>validatePoliticalPreset(noReason),/Motivo UNMAPPED/);
  const noEvidence=clone(a);noEvidence.policies.progressivity.evidence=[];assert.throws(()=>validatePoliticalPreset(noEvidence),/score, evidencia y confianza/);
  const wrongStatus=clone(a);wrongStatus.policies.progressivity.status='DOCUMENTED';assert.throws(()=>validatePoliticalPreset(wrongStatus),/codificación estandarizada/);
  const noDoubleCount=clone(a);noDoubleCount.doubleCountingCheck='FAIL';assert.throws(()=>validatePoliticalPreset(noDoubleCount),/doble contabilización/);
});
test('un modelo distinto se comunica y no aplica el preset',()=>{
  const older={...a,modelVersion:'0.2.0'};assert.equal(presetCompatibility(older),false);
  assert.throws(()=>applyPoliticalPreset(base,older),/otra versión del modelo/);
});
test('scores permitidos convierten ±1/±2 exactamente con steps disponibles y respetan límites',()=>{
  const policy=baselinePolicy(base);
  for(const key of Object.keys(unit).filter(key=>key!=='investmentFriction')){
    const step=({taxShift:.5,progressivity:.5,consumptionTax:.5,corporateTax:.5,transfers:1,publicInvestment:.1,services:.1,investmentFriction:.25})[key];
    for(const score of [-2,-1,1,2])assert.equal(positionToControlValue(base,key,score),policy[key]+step*score,`${key} score ${score}`);
    for(const score of [-2,-1,0,1,2]){const value=positionToControlValue(base,key,score);assert.ok(value>=({taxShift:-6,progressivity:-4,consumptionTax:5,corporateTax:10,transfers:-25,publicInvestment:1,services:15,investmentFriction:0})[key]);assert.ok(value<=({taxShift:8,progressivity:6,consumptionTax:18,corporateTax:35,transfers:35,publicInvestment:6,services:25,investmentFriction:8})[key]);}
  }
  for(const score of [0,1,2]){const value=positionToControlValue(base,'investmentFriction',score);assert.ok(value>=0&&value<=8);}
  assert.equal(positionToControlValue(base,'investmentFriction',-1),0,'el baseline 0 impide representar menos fricción');
});
test('score cero mantiene el baseline y es distinto de UNMAPPED',()=>{
  const neutral=clone(a);for(const key of Object.keys(unit))neutral.policies[key]={...neutral.policies[key],status:'APPROXIMATED',value:null,mappingMethod:'STANDARDIZED_CODING',positionScore:0,evidence:['FIXTURE-001'],confidence:'MEDIUM',unmappedReason:undefined};
  const current={...baselinePolicy(base),taxShift:2},result=applyPoliticalPreset(base,neutral,'0.3.0',current,12);
  assert.equal(result.policy.taxShift,baselinePolicy(base).taxShift);assert.equal(result.origin.mappingStatuses.taxShift,'APPROXIMATED');
  const noEvidence=applyPoliticalPreset(base,a,'0.3.0',current,12);assert.equal(noEvidence.policy.consumptionTax,current.consumptionTax);assert.equal(noEvidence.origin.mappingStatuses.consumptionTax,'UNMAPPED');
});
test('el mismo score produce el mismo delta sin depender del actor',()=>{
  const expected=Object.fromEntries(Object.keys(unit).map(key=>[key,positionToControlValue(base,key,1)-baselinePolicy(base)[key]]));
  for(const coding of Object.values(POLITICAL_CODING))for(const key of Object.keys(expected)){const score=coding[key].score;if(score===1)assert.equal(positionToControlValue(base,key,score)-baselinePolicy(base)[key],expected[key]);}
  const sameScore=clone(a);for(const key of Object.keys(unit))sameScore.policies[key]={...sameScore.policies[key],status:'APPROXIMATED',value:null,mappingMethod:'STANDARDIZED_CODING',positionScore:1,evidence:['FIXTURE-001'],confidence:'MEDIUM',unmappedReason:undefined};
  const renamed={...sameScore,actorName:'Actor distinto',partyName:'Actor distinto'};assert.deepEqual(applyPoliticalPreset(base,sameScore).policy,applyPoliticalPreset(base,renamed).policy);const logoChanged={...sameScore,logo:null,logoFallback:'OTRAS SIGLAS'};assert.deepEqual(applyPoliticalPreset(base,sameScore).policy,applyPoliticalPreset(base,logoChanged).policy);
});
test('codificación neutral y respuestas neutrales del cuestionario producen la misma Policy',()=>{
  const neutral=clone(a);for(const key of Object.keys(unit))neutral.policies[key]={...neutral.policies[key],status:'APPROXIMATED',value:null,mappingMethod:'STANDARDIZED_CODING',positionScore:0,evidence:['FIXTURE-001'],confidence:'MEDIUM',unmappedReason:undefined};
  assert.deepEqual(applyPoliticalPreset(base,neutral).policy,wizardPolicy(base,Array(WIZARD_QUESTIONS.length).fill(null)));
});
test('las mismas posiciones del cuestionario y del preset producen la misma Policy',()=>{
  const keys=['taxShift','progressivity','transfers','services','publicInvestment','consumptionTax'],answers=[1,-1,2,-1,1,-2],preset=clone(a);
  for(const key of keys){const score=answers[keys.indexOf(key)];preset.policies[key]={...preset.policies[key],status:'APPROXIMATED',value:null,mappingMethod:'STANDARDIZED_CODING',positionScore:score,evidence:['FIXTURE-001'],confidence:'MEDIUM',unmappedReason:undefined};}
  assert.deepEqual(applyPoliticalPreset(base,preset).policy,wizardPolicy(base,answers));
});
test('artefactos JSON reflejan la codificación runtime y cada evidencia remite al inventario del actor',()=>{
  const files={'preset-es-pp-23j-2023-v1':'pp-23j-2023','preset-es-psoe-23j-2023-v1':'psoe-23j-2023','preset-es-vox-23j-2023-v1':'vox-23j-2023','preset-es-sumar-23j-2023-v1':'sumar-23j-2023','preset-es-erc-23j-2023-v1':'erc-23j-2023','preset-es-pnv-23j-2023-v1':'eaj-pnv-23j-2023','preset-es-bng-23j-2023-v1':'bng-23j-2023','preset-es-upn-23j-2023-v1':'upn-23j-2023'};
  for(const [id,slug] of Object.entries(files)){const artifact=JSON.parse(readFileSync(new URL(`../docs/political-presets/coding/${slug}.json`,import.meta.url),'utf8')),inventory=readFileSync(new URL(`../docs/political-presets/inventory/${slug}.md`,import.meta.url),'utf8');assert.deepEqual(artifact.controls,POLITICAL_CODING[id]);assert.equal(artifact.codingVersion,'1.0.0');for(const mapping of Object.values(artifact.controls)){for(const evidence of mapping.evidence)assert.ok(inventory.includes(evidence),`${slug} evidencia ${evidence}`);if(mapping.score===null){assert.deepEqual(mapping.evidence,[]);assert.equal(mapping.confidence,null);}else assert.ok([-2,-1,0,1,2].includes(mapping.score));assert.doesNotMatch(mapping.rationale,/familia ideológica|izquierda|derecha|reputación del partido/i);}}
});
test('aplicar preset en mes cero asigna mapeos y mantiene baseline cuando UNMAPPED',()=>{
  const baseline=baselinePolicy(base),{policy}=applyPoliticalPreset(base,a);
  for(const [key,mapping] of Object.entries(a.policies))assert.equal(policy[key],mapping.status==='UNMAPPED'?baseline[key]:mapping.mappingMethod==='STANDARDIZED_CODING'?positionToControlValue(base,key,mapping.positionScore):mapping.value,key);
});
test('UNMAPPED conserva la configuración vigente cuando se prepara una alternativa posterior',()=>{
  const current={...baselinePolicy(base),taxShift:3},result=applyPoliticalPreset(base,a,'0.3.0',current,36);
  assert.equal(result.policy.taxShift,2);assert.equal(result.policy.consumptionTax,current.consumptionTax);assert.equal(result.origin.appliedAtMonth,36);
});
test('el borrador admite edición y registra diferencias frente al valor original',()=>{
  const {policy,origin}=applyPoliticalPreset(base,a),edited=editPresetDraft(policy,'taxShift',4);
  assert.equal(edited.taxShift,4);assert.equal(policy.taxShift,2);assert.deepEqual(changedPresetValues(origin,edited),['taxShift']);
});
test('la comparación bifurca desde el mes solicitado y conserva el historial exacto hasta el fork',()=>{
  const initial=createExperiment(base,4821,baselinePolicy(base),true),at36=advance(initial,36),forked=compareFrom(at36,'B',{...at36.b.policy,taxShift:2});
  assert.equal(forked.a.state.month,36);assert.equal(forked.b.state.month,36);assert.equal(forked.forkMonth,36);
  assert.deepEqual(forked.a.history,at36.b.history);assert.deepEqual(forked.b.history,at36.b.history);
  const next=advance(forked,1);assert.equal(next.a.history[36].month,36);assert.equal(next.b.history[36].month,36);
});
test('misma policy y condiciones producen igual trayectoria sin importar el origen',()=>{
  const {policy}=applyPoliticalPreset(base,a),manual=createExperiment(base,4821,policy,true),fromPreset=createExperiment(base,4821,{...policy},true);
  const left=advance(manual,24),right=advance(fromPreset,24);
  assert.deepEqual(left.a.history,right.a.history);assert.deepEqual(left.b.history,right.b.history);
  assert.deepEqual(left.a.events,right.a.events);assert.deepEqual(left.b.events,right.b.events);
});
test('el nombre del actor no afecta cálculos ni policy; solo cambian metadatos',()=>{
  const one=applyPoliticalPreset(base,a),two=applyPoliticalPreset(base,{...a,actorName:'Otro nombre',partyName:'Otro nombre'});
  assert.deepEqual(one.policy,two.policy);assert.equal(one.origin.actorName,'Actor interno a');assert.equal(two.origin.actorName,'Otro nombre');
  assert.deepEqual(advance(createExperiment(base,42,one.policy,true),12).b.history,advance(createExperiment(base,42,two.policy,true),12).b.history);
});
test('export/import conserva provenance de preset y rama; sesiones antiguas sin campos son válidas',()=>{
  const real=POLITICAL_PRESETS.find(p=>p.actorName==='Coalición Sumar'),{policy,origin}=applyPoliticalPreset(base,real),exp=createExperiment(base,4821,policy,true),branchOrigins={A:{...origin,presetId:'preset-test-b',partyName:'Actor B'}};
  const session=exportSession(exp,hash,undefined,origin,branchOrigins),validated=validateSession(session,base,hash);
  assert.deepEqual(validated.presetOrigin,origin);assert.deepEqual(validated.presetBranchOrigins,branchOrigins);assert.equal(origin.mappingDetails.transfers.mappingStatus,'APPROXIMATED');assert.equal(origin.mappingDetails.transfers.mappingMethod,'STANDARDIZED_CODING');assert.equal(origin.mappingDetails.transfers.positionScore,2);assert.equal(origin.mappingDetails.transfers.mappingVersion,'4.0.0');assert.equal(origin.mappingDetails.transfers.derivationId,undefined);
  const restored=restoreSession(validated,base);assert.deepEqual(restored.b.policy,policy);
  const legacy=exportSession(exp,hash);delete legacy.presetOrigin;delete legacy.presetBranchOrigins;
  assert.equal('presetOrigin' in validateSession(legacy,base,hash),false);
});
