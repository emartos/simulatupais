import type { Base, EngineBuild, Experiment, PolicyChange, PresetOrigin, Session, SessionV1, SessionV2 } from './types.js';
import { MODEL_VERSION, MAX_MONTHS } from './model.js';
import { validatePolicy } from './policy.js';
import { advance, compareFrom, configureBranch, createExperiment, createPrimaryExperiment, fork } from './engine.js';
import { validatePresetOrigin } from '../political-presets/schema.js';
function recipe(branch:Experiment['a']) {
  return {initialPolicy:branch.initialPolicy||branch.policy,changes:branch.policyChanges||[],institutionOriginMonth:branch.institutionOriginMonth||0};
}
export function exportSession(exp:Experiment,datasetHash:string,engineBuild:EngineBuild={engineVersion:MODEL_VERSION,commitSha:null},presetOrigin?:PresetOrigin,presetBranchOrigins?:SessionV2['presetBranchOrigins']):SessionV2 {
  return {schema:2,modelVersion:MODEL_VERSION,datasetVersion:exp.base.datasetVersion,datasetHash,seed:exp.seed,shocksEnabled:exp.shocksEnabled,
    engineBuild,
    ...(presetOrigin?{presetOrigin}:{}),...(presetBranchOrigins&&Object.keys(presetBranchOrigins).length?{presetBranchOrigins}:{}),months:exp.a.state.month,forkMonth:exp.forkMonth,primaryId:exp.primaryId||'B',comparisonActive:!!exp.comparisonActive,
    comparisonOriginId:exp.comparisonOriginId||exp.primaryId||'B',...(exp.branchNames?{branchNames:exp.branchNames}:{}),branches:{A:recipe(exp.a),B:recipe(exp.b)}};
}
function validateCommon(s:Record<string,unknown>,base:Base,datasetHash:string):void {
  if(s.modelVersion!==MODEL_VERSION) throw new Error('Versi\u00f3n del modelo incompatible. Conserva el paquete original para abrir esta sesi\u00f3n.');
  if(s.datasetVersion!==base.datasetVersion || s.datasetHash!==datasetHash) throw new Error('La sesi\u00f3n utiliza otra fotograf\u00eda de datos. No se reinterpretar\u00e1 silenciosamente.');
}
function validatedEngineBuild(s:Record<string,unknown>):EngineBuild {
  const raw=s.engineBuild&&typeof s.engineBuild==='object'?s.engineBuild as Record<string,unknown>:undefined;
  const engineVersion=raw&&typeof raw.engineVersion==='string'&&raw.engineVersion.length<=40&&raw.engineVersion.trim()?raw.engineVersion:s.modelVersion as string;
  const commitSha=raw&&typeof raw.commitSha==='string'&&/^[a-f\d]{40}$/i.test(raw.commitSha)?raw.commitSha.toLowerCase():null;
  return {engineVersion,commitSha};
}
function integer(s:Record<string,unknown>,key:string,min:number,max:number):number {
  const n=s[key];if(typeof n!=='number'||!Number.isInteger(n)||n<min||n>max)throw new Error(`Valor de sesi\u00f3n no v\u00e1lido: ${key}.`);return n;
}
export function validateSession(input:unknown,base:Base,datasetHash:string):Session {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Archivo de sesi\u00f3n no v\u00e1lido.');
  const s=input as Record<string,unknown>;validateCommon(s,base,datasetHash);
  const months=integer(s,'months',0,MAX_MONTHS),seed=integer(s,'seed',0,4294967295);
  if(s.schema===2&&typeof s.shocksEnabled!=='boolean')throw new Error('Falta la opción de perturbaciones sintéticas.');
  if(s.schema===1){
    const forkMonth=integer(s,'forkMonth',0,months);
    return {schema:1,modelVersion:MODEL_VERSION,datasetVersion:base.datasetVersion,datasetHash,seed,months,forkMonth,policy:validatePolicy(s.policy),engineBuild:validatedEngineBuild(s),...(typeof s.shocksEnabled==='boolean'?{shocksEnabled:s.shocksEnabled}:{})};
  }
  if(s.schema!==2)throw new Error('Formato de sesi\u00f3n no compatible.');
  const forkMonth=integer(s,'forkMonth',0,months);
  if((s.primaryId!=='A'&&s.primaryId!=='B')||(s.comparisonOriginId!=='A'&&s.comparisonOriginId!=='B')||typeof s.comparisonActive!=='boolean')throw new Error('Metadatos de comparaci\u00f3n no v\u00e1lidos.');
  if(!s.branches||typeof s.branches!=='object')throw new Error('Faltan las configuraciones de las trayectorias.');
  const source=s.branches as Record<string,unknown>;
  const clean=(id:'A'|'B')=>{
    const raw=source[id];if(!raw||typeof raw!=='object')throw new Error(`Falta la receta de la trayectoria ${id}.`);
    const r=raw as Record<string,unknown>,originMonth=r.institutionOriginMonth;
    if(typeof originMonth!=='number'||!Number.isInteger(originMonth)||originMonth<0||originMonth>months)throw new Error('Origen de calendario institucional no v\u00e1lido.');
    if(!Array.isArray(r.changes)||r.changes.length>MAX_MONTHS)throw new Error('Historial de cambios no v\u00e1lido.');
    const changes:PolicyChange[]=r.changes.map((c:unknown)=>{
      if(!c||typeof c!=='object')throw new Error('Cambio de configuraci\u00f3n no v\u00e1lido.');
      const item=c as Record<string,unknown>,month=item.month;
      if(typeof month!=='number'||!Number.isInteger(month)||month<1||month>months)throw new Error('Fecha de cambio no v\u00e1lida.');
      return {month,policy:validatePolicy(item.policy)};
    }).sort((a,b)=>a.month-b.month);
    if(new Set(changes.map(c=>c.month)).size!==changes.length)throw new Error('Hay cambios duplicados en un mismo mes.');
    return {initialPolicy:validatePolicy(r.initialPolicy),changes,institutionOriginMonth:originMonth};
  };
  const branches={A:clean('A'),B:clean('B')};
  const presetOrigin=validatePresetOrigin(s.presetOrigin);
  const rawBranchOrigins=s.presetBranchOrigins&&typeof s.presetBranchOrigins==='object'?s.presetBranchOrigins as Record<string,unknown>:{};
  if(Object.keys(rawBranchOrigins).some(key=>key!=='A'&&key!=='B'))throw new Error('Procedencia de rama no válida.');
  const presetBranchOrigins:NonNullable<SessionV2['presetBranchOrigins']>={};
  for(const id of ['A','B'] as const){const origin=validatePresetOrigin(rawBranchOrigins[id]);if(origin)presetBranchOrigins[id]=origin;}
  const names=s.branchNames&&typeof s.branchNames==='object'?s.branchNames as Record<string,unknown>:{A:'Simulaci\u00f3n original',B:'Alternativa'};
  if(typeof names.A!=='string'||typeof names.B!=='string'||names.A.length>60||names.B.length>60)throw new Error('Nombre de trayectoria no v\u00e1lido.');
  return {schema:2,modelVersion:MODEL_VERSION,datasetVersion:base.datasetVersion,datasetHash,seed,shocksEnabled:s.shocksEnabled as boolean,months,forkMonth,
    primaryId:s.primaryId,comparisonActive:s.comparisonActive,comparisonOriginId:s.comparisonOriginId,branchNames:{A:names.A,B:names.B},branches,engineBuild:validatedEngineBuild(s),...(presetOrigin?{presetOrigin}:{}),...(Object.keys(presetBranchOrigins).length?{presetBranchOrigins}:{})};
}
function restoreV1(s:SessionV1,base:Base):Experiment {
  let exp=createExperiment(base,s.seed,undefined,s.shocksEnabled??true);
  if(s.forkMonth>0)exp=advance(exp,s.forkMonth);
  exp=fork(exp,s.policy);
  if(s.months>s.forkMonth)exp=advance(exp,s.months-s.forkMonth);
  return {...exp,comparisonActive:true,primaryId:'A',comparisonOriginId:'A'};
}
function restoreV2(s:SessionV2,base:Base):Experiment {
  const sourceId=s.comparisonOriginId,targetId=sourceId==='A'?'B':'A';
  const sourceRecipe=s.branches[sourceId],targetRecipe=s.branches[targetId];
  let exp:Experiment;
  if(s.comparisonActive) exp=createPrimaryExperiment(base,s.seed,sourceRecipe.initialPolicy,s.shocksEnabled);
  else {
    exp=createExperiment(base,s.seed,s.branches.B.initialPolicy,s.shocksEnabled);
    exp={...exp,a:{...exp.a,policy:s.branches.A.initialPolicy,initialPolicy:s.branches.A.initialPolicy,policyChanges:[]},
      b:{...exp.b,policy:s.branches.B.initialPolicy,initialPolicy:s.branches.B.initialPolicy,policyChanges:[]},primaryId:s.primaryId,comparisonOriginId:s.comparisonOriginId};
  }
  const applyAt=(month:number,id:'A'|'B')=>{const change=s.branches[id].changes.find(c=>c.month===month);if(change)exp=configureBranch(exp,id,change.policy);};
  if(!s.comparisonActive){
    for(let month=0;month<s.months;month++){applyAt(month,s.primaryId);exp=advance(exp,1);}
  }else{
    for(let month=0;month<s.forkMonth;month++){applyAt(month,sourceId);exp=advance(exp,1);}
    const forkPolicy=targetRecipe.changes.find(c=>c.month===s.forkMonth)?.policy||targetRecipe.initialPolicy;
    exp=compareFrom(exp,sourceId,forkPolicy);
    exp={...exp,[targetId==='A'?'a':'b']:{...targetId==='A'?exp.a:exp.b,institutionOriginMonth:targetRecipe.institutionOriginMonth}};
    for(let month=s.forkMonth;month<s.months;month++){
      applyAt(month,targetId);applyAt(month,sourceId);exp=advance(exp,1);
    }
  }
  exp={...exp,comparisonActive:s.comparisonActive,primaryId:s.primaryId,comparisonOriginId:s.comparisonOriginId,
    ...(s.branchNames?{branchNames:s.branchNames}:{}),forkMonth:s.forkMonth,
    a:{...exp.a,institutionOriginMonth:s.branches.A.institutionOriginMonth},b:{...exp.b,institutionOriginMonth:s.branches.B.institutionOriginMonth}};
  if(!s.branchNames){const clean={...exp};delete clean.branchNames;exp=clean;}
  return exp;
}
export function restoreSession(s:Session,base:Base):Experiment {
  return s.schema===1?restoreV1(s,base):restoreV2(s,base);
}
