// Isolated diagnostics only: clones the compiled core into OS temp directories and
// applies in-memory counterfactual edits there. Never edits the working tree/core.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]||'.'), dist=path.join(root,'dist/app/core'), tmp=fs.mkdtempSync(path.join(os.tmpdir(),'polis-diag-'));
const data=JSON.parse(fs.readFileSync(path.join(root,'public/data/spain.json'),'utf8'));
const sourceModel=fs.readFileSync(path.join(dist,'model.js'),'utf8'),sourceEngine=fs.readFileSync(path.join(dist,'engine.js'),'utf8');
const policyById={S13:{transfers:20,services:22,publicInvestment:4.5},S10:{services:23}};
const variants=[['BASE',{}],['C1',{headroom:.10}],['C2',{headroom:.20}],['C3',{capexDesired:true}],['C4',{unrationedInvestment:true}],['C5',{doubleCapacityInvestment:true}]];
async function loadVariant(id,v){const d=path.join(tmp,id);fs.mkdirSync(d);for(const f of fs.readdirSync(dist))if(f.endsWith('.js'))fs.copyFileSync(path.join(dist,f),path.join(d,f));let m=sourceModel,e=sourceEngine;
 if(v.headroom!==undefined)m=m.replace('capacityHeadroom: 0.05',`capacityHeadroom: ${v.headroom}`);
 if(v.capexDesired)e=e.replace('const capital = old.capital * (1 - M.depreciation / 12) + investment / 12;','const capital = old.capital * (1 - M.depreciation / 12) + investmentDesired / 12;');
 if(v.unrationedInvestment){e=e.replace('const investment = investmentDesired * realization;','const investment = investmentDesired;').replace('validateState(next, old);','/* diagnostic-only: EQ-002 intentionally not imposed when investment is unrationed */');}
 if(v.doubleCapacityInvestment)e=e.replace('const capital = old.capital * (1 - M.depreciation / 12) + investment / 12;','const capital = old.capital * (1 - M.depreciation / 12) + investment / 6;');
 fs.writeFileSync(path.join(d,'model.js'),m);fs.writeFileSync(path.join(d,'engine.js'),e);
 const [{selectBase},{createPrimaryExperiment,advance},{baselinePolicy}]=await Promise.all(['data.js','engine.js','policy.js'].map(x=>import(pathToFileURL(path.join(d,x)).href+`?case=${id}`)));
 return {base:selectBase(data),createPrimaryExperiment,advance,baselinePolicy};
}
function trace(state,id){return state.trace.find(x=>x.id===id);}
function clampEpisodes(series){const ms=series.filter(x=>x.clamp).map(x=>x.month),out=[];for(const m of ms){const z=out.at(-1);if(z&&z.end===m-1)z.end=m;else out.push({start:m,end:m});}return out.map(x=>({...x,duration:x.end-x.start+1}));}
const monthly={};
for(const sid of ['S00','S13','S01','S05','S10','S01-L']){const pol={...policyById[sid.replace('-L','')]};if(sid==='S01')pol.taxShift=-4;if(sid==='S01-L')pol.taxShift=-5.5;if(sid==='S05')pol.transfers=25;
 const mod=await loadVariant(`traj-${sid}`,{}),p={...mod.baselinePolicy(mod.base),...pol};let exp=mod.createPrimaryExperiment(mod.base,1847,p,true),rows=[];
 for(let month=1;month<=120;month++){const old=exp.b.state;exp=mod.advance(exp,1);const s=exp.b.state,o=trace(s,'output'),it=trace(s,'investment');rows.push({month,demand:o.inputs.demanda,capacity:o.inputs.capacidad,limit:o.inputs.capacidad*1.05,target:Math.min(o.inputs.demanda,o.inputs.capacidad*1.05),gdp:s.gdpReal,realization:o.inputs.factorRealizacion,investmentDesired:it.result,investment:s.investment,capital:s.capital,capacityGrowth:s.capacity/old.capacity-1,capitalGrowth:s.capital/old.capital-1,debtRatio:s.debt/s.gdpNominal*100,unemployment:s.unemployment*100,clamp:s.constraints.some(x=>x.includes('Demanda superior')),services:s.services,price:s.producerPrice,consumerPrice:s.consumerPrice,consumption:s.consumption,revenue:s.revenue,spending:s.spending,deficit:s.deficit,debt:s.debt});}
 monthly[sid]=rows;
}
const counterfactuals={};for(const sid of ['S13','S10'])for(const [name,v] of variants){const mod=await loadVariant(`${sid}-${name}`,v),p={...mod.baselinePolicy(mod.base),...policyById[sid]};let exp=mod.createPrimaryExperiment(mod.base,1847,p,true),series=[exp.b.state];for(let m=1;m<=120;m++){exp=mod.advance(exp,1);series.push(exp.b.state);}const r=series.slice(1).map((s,i)=>({month:i+1,clamp:s.constraints.some(x=>x.includes('Demanda superior'))}));const eps=clampEpisodes(r),clampMonths=r.filter(x=>x.clamp).length;counterfactuals[`${sid}-${name}`]={scenario:sid,variant:name,changes:v,clampMonths,first:eps[0]?.start??null,last:eps.at(-1)?.end??null,longest:Math.max(0,...eps.map(x=>x.duration)),at5:{gdp:series[60].gdpReal,investment:series[60].investment,capital:series[60].capital,capacity:series[60].capacity,debtRatio:series[60].debt/series[60].gdpNominal*100,unemployment:series[60].unemployment*100},at10:{gdp:series[120].gdpReal,investment:series[120].investment,capital:series[120].capital,capacity:series[120].capacity,debtRatio:series[120].debt/series[120].gdpNominal*100,unemployment:series[120].unemployment*100}};}
const output={model:'0.2.0',catalog:data.version,baseYear:2025,seed:1847,shocks:true,monthly,counterfactuals};
const out=path.join(root,'docs/model-validation/clamp-services-diagnostics-0.2.0.json');fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({monthly:Object.fromEntries(Object.entries(monthly).map(([k,a])=>{const c=a.filter(x=>x.clamp),episodes=clampEpisodes(a);return[k,{first:c[0]?.month??null,last:c.at(-1)?.month??null,total:c.length,longest:Math.max(0,...episodes.map(e=>e.duration)),maxDemandCapacity:Math.max(...a.map(x=>x.demand/x.capacity)),maxGDPoverCapacity:Math.max(...a.map(x=>x.gdp/x.capacity))}]})),counterfactuals},null,2));
