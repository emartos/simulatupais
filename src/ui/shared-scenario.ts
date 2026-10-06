import type { Base, Experiment, Policy, PolicyChange, SessionV2 } from '../core/types.js';
import { MODEL_VERSION } from '../core/model.js';
import { validatePolicy } from '../core/policy.js';
import { exportSession, validateSession } from '../core/session.js';

export const SCENARIO_URL_VERSION=1;
const MAX_PAYLOAD_LENGTH=150_000;
const ELECTIONS=['competitive','single-party','appointment'] as const;
type BranchRecipe=SessionV2['branches']['A'];
export interface SharedScenario { session:SessionV2; viewedBranch:'A'|'B'; }

function policyToWire(policy:Policy):unknown[] {
  return [policy.taxShift,policy.progressivity,policy.consumptionTax,policy.corporateTax,
    policy.transfers,policy.publicInvestment,policy.services,policy.investmentFriction,
    ELECTIONS.indexOf(policy.elections),policy.termMonths,Number(policy.expression),Number(policy.judicialReview)];
}
function policyFromWire(raw:unknown):Policy {
  if(!Array.isArray(raw)||raw.length!==12)throw new Error('La URL contiene decisiones incompletas.');
  const values=raw.slice(0,8);
  if(values.some(value=>typeof value!=='number'||!Number.isFinite(value)))throw new Error('La URL contiene decisiones no válidas.');
  const election=raw[8],term=raw[9],expression=raw[10],judicial=raw[11];
  if(!Number.isInteger(election)||typeof election!=='number'||election<0||election>=ELECTIONS.length||typeof term!=='number'||(expression!==0&&expression!==1)||(judicial!==0&&judicial!==1))throw new Error('La URL contiene decisiones no válidas.');
  return validatePolicy({taxShift:values[0],progressivity:values[1],consumptionTax:values[2],corporateTax:values[3],transfers:values[4],publicInvestment:values[5],services:values[6],investmentFriction:values[7],elections:ELECTIONS[election],termMonths:term,expression:expression===1,judicialReview:judicial===1});
}
function recipeToWire(recipe:BranchRecipe):unknown[] {
  return [policyToWire(recipe.initialPolicy),recipe.changes.map(change=>[change.month,policyToWire(change.policy)]),recipe.institutionOriginMonth];
}
function recipeFromWire(raw:unknown):BranchRecipe {
  if(!Array.isArray(raw)||raw.length!==3||!Array.isArray(raw[1]))throw new Error('La URL contiene un historial incompleto.');
  const changes:PolicyChange[]=raw[1].map((item:unknown)=>{
    if(!Array.isArray(item)||item.length!==2||typeof item[0]!=='number')throw new Error('La URL contiene un cambio no válido.');
    return {month:item[0],policy:policyFromWire(item[1])};
  });
  if(typeof raw[2]!=='number')throw new Error('La URL contiene una fecha no válida.');
  return {initialPolicy:policyFromWire(raw[0]),changes,institutionOriginMonth:raw[2]};
}
function encode(value:unknown):string {
  const bytes=new TextEncoder().encode(JSON.stringify(value));
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode(payload:string):unknown {
  if(!payload||payload.length>MAX_PAYLOAD_LENGTH||!/^[A-Za-z0-9_-]+$/.test(payload))throw new Error('El enlace del escenario no es válido.');
  const padded=payload.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(payload.length/4)*4,'=');
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(padded),char=>char.charCodeAt(0))));}
  catch{throw new Error('El enlace del escenario no se puede leer.');}
}
export function scenarioUrl(exp:Experiment,datasetHash:string,countryCode:string,viewedBranch:'A'|'B',origin:string):string {
  const session=exportSession(exp,datasetHash);
  const single=!session.comparisonActive;
  const wire=[countryCode,exp.base.year,session.modelVersion,session.datasetVersion,session.datasetHash,
    session.seed,Number(session.shocksEnabled),session.months,session.forkMonth,
    single?'B':session.primaryId,Number(session.comparisonActive),single?'B':session.comparisonOriginId,
    single?'B':viewedBranch,single?recipeToWire(session.branches.B):recipeToWire(session.branches.A),
    single?null:recipeToWire(session.branches.B)];
  const url=new URL('/',origin);url.searchParams.set('v',String(SCENARIO_URL_VERSION));url.searchParams.set('s',encode(wire));
  return url.toString();
}
export function readScenarioUrl(url:URL,base:Base,datasetHash:string,countryCode:string):SharedScenario|null {
  const version=url.searchParams.get('v'),payload=url.searchParams.get('s');
  if(version===null&&payload===null)return null;
  if(version!==String(SCENARIO_URL_VERSION))throw new Error('Esta versión del enlace no es compatible.');
  const raw=decode(payload||'');
  if(!Array.isArray(raw)||raw.length!==15)throw new Error('El enlace del escenario está incompleto.');
  const [country,year,modelVersion,datasetVersion,hash,seed,shocks,months,forkMonth,primaryId,comparison,comparisonOriginId,viewedBranch,a,b]=raw;
  if(country!==countryCode||year!==base.year||modelVersion!==MODEL_VERSION||datasetVersion!==base.datasetVersion||hash!==datasetHash)throw new Error('El enlace utiliza otro país, año o versión de datos y modelo.');
  if((shocks!==0&&shocks!==1)||(comparison!==0&&comparison!==1)||(primaryId!=='A'&&primaryId!=='B')||(comparisonOriginId!=='A'&&comparisonOriginId!=='B')||(viewedBranch!=='A'&&viewedBranch!=='B'))throw new Error('El enlace contiene opciones no válidas.');
  if(comparison===0&&(primaryId!=='B'||comparisonOriginId!=='B'||viewedBranch!=='B'||b!==null))throw new Error('El enlace contiene una comparación incoherente.');
  if(comparison===1&&b===null)throw new Error('El enlace contiene una comparación incompleta.');
  const first=recipeFromWire(a),second=comparison===0?first:recipeFromWire(b);
  const input={schema:2,modelVersion,datasetVersion,datasetHash:hash,seed,shocksEnabled:shocks===1,months,forkMonth,
    primaryId,comparisonActive:comparison===1,comparisonOriginId,branches:{A:first,B:second}};
  const session=validateSession(input,base,datasetHash);
  if(session.schema!==2)throw new Error('El formato del escenario no es compatible.');
  return {session,viewedBranch};
}
