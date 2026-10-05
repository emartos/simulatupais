import { BOUNDS } from '../core/policy.js';
import type { Policy, PresetOrigin } from '../core/types.js';

export const POLITICAL_CONTROL_KEYS = [
  'taxShift','progressivity','consumptionTax','corporateTax','transfers',
  'publicInvestment','services','investmentFriction'
] as const;
export type PoliticalControlKey = typeof POLITICAL_CONTROL_KEYS[number];
export type MappingStatus = 'DOCUMENTED'|'APPROXIMATED'|'UNMAPPED';
export type MappingConfidence = 'HIGH'|'MEDIUM'|'LOW';
export type UnmappedReason='QUALITATIVE_ONLY'|'NO_OFFICIAL_INPUTS'|'SEMANTIC_MISMATCH'|'TOO_MANY_UNOBSERVED_ASSUMPTIONS'|'TERRITORIAL_NOT_SCALABLE'|'NO_RELEVANT_PROPOSAL'|'DOUBLE_COUNTING'|'OUTSIDE_MODEL_SCOPE'|'INSUFFICIENT_TEXTUAL_EVIDENCE';
export type MappingMethod='DIRECT'|'STANDARDIZED_CODING'|'NONE';
export type PoliticalPositionScore=-2|-1|0|1|2|null;
export type HumanReviewStatus='APROBADO'|'UNMAPPED_TRAS_REVISION';
export interface DerivationInput { id:string; label:string; value:number; unit:string; sourceId:string; locator:string; }
export interface PoliticalDerivation { id:string; version:string; formula:string; officialInputs:DerivationInput[]; assumptions:string[]; result:number; rawResult:number; sensitivity:string; calculatedAt:string; }
export interface PresetSource { id:string; title:string; url:string; publisher:string; publishedAt:string|null; accessedAt:string; }
export interface PoliticalLogo { path:string; sourceUrl:string; sourceType:'OFFICIAL_WEBSITE'|'OFFICIAL_IDENTITY_GUIDE'; retrievedAt:string; }
export interface PoliticalLogoPresentation { scale?:number; maxWidth?:number; maxHeight?:number; objectPosition?:string; }
export interface PoliticalMapping {
  status:MappingStatus; value:number|null; unit:string; sourceIds:string[]; mappingMethod:MappingMethod;
  positionScore:PoliticalPositionScore; evidence:string[];
  sourceSummary:string; sourceLocator:string; sourceText:string; mappingRationale:string; confidence:MappingConfidence|null;
  reviewStatus?:HumanReviewStatus; unmappedReason?:UnmappedReason; derivation?:PoliticalDerivation;
}
export type PoliticalPolicies = Record<PoliticalControlKey,PoliticalMapping>;
export type PoliticalActorType='PARTY'|'COALITION'|'FEDERATION';
export interface PoliticalPreset {
  id:string; country:'ES'; actorName:string; actorType:PoliticalActorType; partyName:string; electionName:string; electionDate:string;
  version:string; modelVersion:string; cutoffDate:string; title:string; description:string;
  sources:PresetSource[]; policies:PoliticalPolicies; doubleCountingCheck:'PASS'; logo:PoliticalLogo|null; logoFallback:string; logoPresentation?:PoliticalLogoPresentation; congressSeats?:number;
}

export const POLITICAL_CONTROL_UNITS:Record<PoliticalControlKey,string>={
  taxShift:'pp',progressivity:'pp',consumptionTax:'%',corporateTax:'%',transfers:'%',
  publicInvestment:'% PIB',services:'% PIB',investmentFriction:'pp'
};

const strings=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=500;
const date=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(`${x}T00:00:00Z`));
const own=(x:object,key:PropertyKey)=>Object.prototype.hasOwnProperty.call(x,key);

export function validatePoliticalPreset(input:unknown):PoliticalPreset {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Preset político no válido.');
  const p=input as Record<string,unknown>;
  for(const key of ['id','partyName','electionName','version','modelVersion','title','description'] as const)if(!strings(p[key]))throw new Error(`Falta un campo válido en el preset: ${key}.`);
  if(!/^preset-[a-z0-9-]+$/.test(p.id as string))throw new Error('Identificador de preset no válido.');
  if(p.country!=='ES')throw new Error('País del preset no compatible.');
  if(!date(p.electionDate)||!date(p.cutoffDate))throw new Error('Fecha del preset no válida.');
  if(!Array.isArray(p.sources))throw new Error('Fuentes del preset no válidas.');
  const sources= p.sources.map((raw,index)=>{
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error(`Fuente ${index+1} no válida.`);
    const s=raw as Record<string,unknown>;
    for(const key of ['id','title','url','publisher'] as const)if(!strings(s[key]))throw new Error(`Campo de fuente no válido: ${key}.`);
    if((s.publishedAt!==null&&!date(s.publishedAt))||!date(s.accessedAt))throw new Error('Fecha de fuente no válida.');
    return {id:s.id as string,title:s.title as string,url:s.url as string,publisher:s.publisher as string,publishedAt:s.publishedAt as string|null,accessedAt:s.accessedAt};
  });
  if(new Set(sources.map(s=>s.id)).size!==sources.length)throw new Error('Hay identificadores de fuente duplicados.');
  if(!p.policies||typeof p.policies!=='object'||Array.isArray(p.policies))throw new Error('Faltan las políticas del preset.');
  const rawPolicies=p.policies as Record<string,unknown>;
  const keys=Object.keys(rawPolicies);
  if(keys.length!==POLITICAL_CONTROL_KEYS.length||keys.some(key=>!(POLITICAL_CONTROL_KEYS as readonly string[]).includes(key)))throw new Error('El preset debe definir exactamente los ocho controles económicos soportados.');
  const policies={} as PoliticalPolicies;
  for(const key of POLITICAL_CONTROL_KEYS){
    const raw=rawPolicies[key];
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error(`Mapeo no válido: ${key}.`);
    const m=raw as Record<string,unknown>;
    if(!['DOCUMENTED','APPROXIMATED','UNMAPPED'].includes(String(m.status)))throw new Error(`Estado de mapeo desconocido: ${key}.`);
    if(m.unit!==POLITICAL_CONTROL_UNITS[key])throw new Error(`Unidad incompatible: ${key}.`);
    if(!Array.isArray(m.sourceIds)||m.sourceIds.some(id=>typeof id!=='string'||!sources.some(source=>source.id===id)))throw new Error(`Fuente referenciada no disponible: ${key}.`);
    if(!strings(m.sourceSummary)||!strings(m.sourceLocator)||!strings(m.sourceText)||!strings(m.mappingRationale))throw new Error(`Falta la explicación o localizador del mapeo: ${key}.`);
    if(m.confidence!==null&&!['HIGH','MEDIUM','LOW'].includes(String(m.confidence)))throw new Error(`Confianza no válida: ${key}.`);
    if(m.reviewStatus!==undefined&&!['APROBADO','UNMAPPED_TRAS_REVISION'].includes(String(m.reviewStatus)))throw new Error(`Estado de revisión humana no válido: ${key}.`);
    if(!['DIRECT','STANDARDIZED_CODING','NONE'].includes(String(m.mappingMethod))||!Array.isArray(m.evidence)||m.evidence.some(item=>!strings(item)))throw new Error(`Método o evidencia de mapeo no válida: ${key}.`);
    if(m.positionScore!==null&&(!Number.isInteger(m.positionScore)||![-2,-1,0,1,2].includes(Number(m.positionScore))))throw new Error(`Score de posición no válido: ${key}.`);
    if(m.status==='UNMAPPED'){
      if(m.value!==null)throw new Error(`Un control sin correspondencia debe tener value=null: ${key}.`);
      if(m.mappingMethod!=='NONE'||m.positionScore!==null||m.evidence.length||m.confidence!==null)throw new Error(`UNMAPPED debe usar NONE, score/evidencia/confianza null o vacíos: ${key}.`);
      if(!['QUALITATIVE_ONLY','NO_OFFICIAL_INPUTS','SEMANTIC_MISMATCH','TOO_MANY_UNOBSERVED_ASSUMPTIONS','TERRITORIAL_NOT_SCALABLE','NO_RELEVANT_PROPOSAL','DOUBLE_COUNTING','OUTSIDE_MODEL_SCOPE','INSUFFICIENT_TEXTUAL_EVIDENCE'].includes(String(m.unmappedReason)))throw new Error(`Motivo UNMAPPED no válido: ${key}.`);
    }else{
      if(m.mappingMethod==='STANDARDIZED_CODING'){
        if(m.status!=='APPROXIMATED'||typeof m.positionScore!=='number'||!m.evidence.length||m.confidence===null)throw new Error(`La codificación estandarizada necesita score, evidencia y confianza: ${key}.`);
        if(m.derivation!==undefined)throw new Error(`La codificación estandarizada no usa derivaciones fiscales: ${key}.`);
        if(m.value!==null)throw new Error(`El valor codificado se calcula desde el baseline al aplicar: ${key}.`);
      }else{
        if(m.mappingMethod!=='DIRECT'||m.status!=='DOCUMENTED'||typeof m.value!=='number'||!Number.isFinite(m.value))throw new Error(`Una equivalencia directa necesita DOCUMENTED y valor: ${key}.`);
        const [min,max,step]=BOUNDS[key];
        if(m.value<min||m.value>max||Math.abs((m.value-min)/step-Math.round((m.value-min)/step))>1e-7)throw new Error(`Valor fuera de rango o paso permitido: ${key}.`);
        if(!m.sourceIds.length)throw new Error(`El mapeo necesita al menos una fuente: ${key}.`);
      }
      if(m.unmappedReason!==undefined)throw new Error(`Un mapeo representable no puede tener motivo UNMAPPED: ${key}.`);
    }
    let derivation:PoliticalDerivation|undefined;
    if(m.status==='APPROXIMATED'&&m.mappingMethod!=='STANDARDIZED_CODING'){
      const d=m.derivation as Record<string,unknown>|undefined;
      if(!d||!strings(d.id)||!strings(d.version)||!strings(d.formula)||!Array.isArray(d.officialInputs)||!d.officialInputs.length||!Array.isArray(d.assumptions)||!d.assumptions.length||typeof d.result!=='number'||!Number.isFinite(d.result)||typeof d.rawResult!=='number'||!Number.isFinite(d.rawResult)||!strings(d.sensitivity)||!date(d.calculatedAt))throw new Error(`Falta una derivación cuantitativa reproducible: ${key}.`);
      if(Math.abs(Number(d.result)-Number(m.value))>1e-9||d.officialInputs.some(item=>!item||typeof item!=='object'||!strings((item as Record<string,unknown>).id)||!strings((item as Record<string,unknown>).label)||typeof (item as Record<string,unknown>).value!=='number'||!Number.isFinite((item as Record<string,unknown>).value)||!strings((item as Record<string,unknown>).unit)||!strings((item as Record<string,unknown>).sourceId)||!sources.some(s=>s.id===(item as Record<string,unknown>).sourceId)||!strings((item as Record<string,unknown>).locator))||d.assumptions.some(item=>!strings(item)))throw new Error(`Derivación inconsistente: ${key}.`);
      derivation={id:d.id as string,version:d.version as string,formula:d.formula as string,officialInputs:d.officialInputs as DerivationInput[],assumptions:d.assumptions as string[],result:d.result as number,rawResult:d.rawResult as number,sensitivity:d.sensitivity as string,calculatedAt:d.calculatedAt as string};
    }else if(m.derivation!==undefined)throw new Error(`Solo APPROXIMATED puede declarar una derivación: ${key}.`);
    policies[key]={status:m.status as MappingStatus,value:m.value as number|null,unit:m.unit as string,sourceIds:[...m.sourceIds] as string[],mappingMethod:m.mappingMethod as MappingMethod,positionScore:m.positionScore as PoliticalPositionScore,evidence:[...m.evidence] as string[],sourceSummary:m.sourceSummary as string,sourceLocator:m.sourceLocator as string,sourceText:m.sourceText as string,mappingRationale:m.mappingRationale as string,confidence:m.confidence as MappingConfidence|null,...(m.reviewStatus?{reviewStatus:m.reviewStatus as HumanReviewStatus}:{}),...(m.unmappedReason?{unmappedReason:m.unmappedReason as UnmappedReason}:{}),...(derivation?{derivation}:{})};
  }
  if(!strings(p.actorName)||!['PARTY','COALITION','FEDERATION'].includes(String(p.actorType)))throw new Error('Actor político no válido.');
  let logo:PoliticalLogo|null=null;
  if(p.logo!==null){if(!p.logo||typeof p.logo!=='object'||Array.isArray(p.logo))throw new Error('Logo del preset no válido.');const l=p.logo as Record<string,unknown>;if(!strings(l.path)||!/^\/assets\/political-parties\/[a-z0-9-]+\.(svg|png)$/.test(l.path)||!strings(l.sourceUrl)||!['OFFICIAL_WEBSITE','OFFICIAL_IDENTITY_GUIDE'].includes(String(l.sourceType))||!date(l.retrievedAt))throw new Error('Metadatos del logo no válidos.');let sourceHost='';try{sourceHost=new URL(l.sourceUrl as string).hostname;}catch{throw new Error('URL de origen del logo no válida.');}if(!sourceHost||!sourceHost.includes('.'))throw new Error('El logo debe tener una fuente oficial.');logo={path:l.path as string,sourceUrl:l.sourceUrl as string,sourceType:l.sourceType as PoliticalLogo['sourceType'],retrievedAt:l.retrievedAt as string};}
  if(!strings(p.logoFallback))throw new Error('Debe definirse un fallback textual del logo.');
  let logoPresentation:PoliticalLogoPresentation|undefined;
  if(p.logoPresentation!==undefined){if(!p.logoPresentation||typeof p.logoPresentation!=='object'||Array.isArray(p.logoPresentation))throw new Error('Presentación del logo no válida.');const v=p.logoPresentation as Record<string,unknown>;if(v.scale!==undefined&&(typeof v.scale!=='number'||!Number.isFinite(v.scale)||v.scale<0.75||v.scale>2))throw new Error('Escala de logo no válida.');for(const key of ['maxWidth','maxHeight'] as const)if(v[key]!==undefined&&(typeof v[key]!=='number'||!Number.isFinite(v[key])||v[key]<16||v[key]>120))throw new Error(`Dimensión de presentación no válida: ${key}.`);if(v.objectPosition!==undefined&&(!strings(v.objectPosition)||!/^(center|left|right|top|bottom)(\s+(center|left|right|top|bottom))?$/.test(v.objectPosition)))throw new Error('Posición del logo no válida.');logoPresentation={...(v.scale!==undefined?{scale:v.scale as number}:{}),...(v.maxWidth!==undefined?{maxWidth:v.maxWidth as number}:{}),...(v.maxHeight!==undefined?{maxHeight:v.maxHeight as number}:{}),...(v.objectPosition!==undefined?{objectPosition:v.objectPosition as string}:{})};}
  if(p.doubleCountingCheck!=='PASS')throw new Error('Debe declararse la revisión de doble contabilización.');
  if(p.congressSeats!==undefined&&(!Number.isInteger(p.congressSeats)||Number(p.congressSeats)<1||Number(p.congressSeats)>350))throw new Error('Número de escaños no válido.');
  return {id:p.id as string,country:'ES',actorName:p.actorName as string,actorType:p.actorType as PoliticalActorType,partyName:p.actorName as string,electionName:p.electionName as string,electionDate:p.electionDate as string,version:p.version as string,modelVersion:p.modelVersion as string,cutoffDate:p.cutoffDate as string,title:p.title as string,description:p.description as string,sources:sources as PresetSource[],policies,doubleCountingCheck:'PASS',logo,logoFallback:p.logoFallback as string,...(logoPresentation?{logoPresentation}:{}),congressSeats:Number(p.congressSeats)};
}

export function validatePresetCatalog(input:unknown):PoliticalPreset[] {
  if(!Array.isArray(input))throw new Error('Catálogo de presets no válido.');
  const presets=input.map(validatePoliticalPreset);
  if(new Set(presets.map(p=>p.id)).size!==presets.length)throw new Error('Hay identificadores de preset duplicados.');
  return presets;
}

export function validatePresetOrigin(input:unknown):PresetOrigin|undefined {
  if(input===undefined)return undefined;
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Procedencia del preset no válida.');
  const o=input as Record<string,unknown>;
  for(const key of ['presetId','presetVersion','partyName','electionName','modelVersion'] as const)if(!strings(o[key]))throw new Error(`Procedencia incompleta: ${key}.`);
  if(!/^preset-[a-z0-9-]+$/.test(o.presetId as string)||typeof o.appliedAt!=='string'||o.appliedAt.length>40||Number.isNaN(Date.parse(o.appliedAt)))throw new Error('Procedencia del preset no válida.');
  const values=o.originalPolicyValues,states=o.mappingStatuses;
  if(!values||typeof values!=='object'||Array.isArray(values)||!states||typeof states!=='object'||Array.isArray(states))throw new Error('Trazabilidad de controles no válida.');
  const cleanValues:PresetOrigin['originalPolicyValues']={},cleanStates:PresetOrigin['mappingStatuses']={},cleanDetails:NonNullable<PresetOrigin['mappingDetails']>={};
  for(const key of POLITICAL_CONTROL_KEYS){
    if(own(values,key)){const v=(values as Record<string,unknown>)[key],[min,max]=BOUNDS[key];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error(`Valor original no válido: ${key}.`);cleanValues[key]=v;}
    if(own(states,key)){const s=(states as Record<string,unknown>)[key];if(!['DOCUMENTED','APPROXIMATED','UNMAPPED'].includes(String(s)))throw new Error(`Estado original no válido: ${key}.`);cleanStates[key]=s as MappingStatus;}
    if(o.mappingDetails&&typeof o.mappingDetails==='object'&&!Array.isArray(o.mappingDetails)&&own(o.mappingDetails as object,key)){const item=(o.mappingDetails as Record<string,unknown>)[key];if(!item||typeof item!=='object'||Array.isArray(item))throw new Error(`Detalle de mapeo no válido: ${key}.`);const d=item as Record<string,unknown>;if(!['DOCUMENTED','APPROXIMATED','UNMAPPED'].includes(String(d.mappingStatus))||!strings(d.mappingVersion)||(d.derivationId!==undefined&&!strings(d.derivationId))||(d.mappingStatus==='APPROXIMATED'&&d.mappingMethod!=='STANDARDIZED_CODING'&&!strings(d.derivationId))||(d.mappingMethod!==undefined&&!['DIRECT','STANDARDIZED_CODING','NONE'].includes(String(d.mappingMethod)))||(d.positionScore!==undefined&&d.positionScore!==null&&(!Number.isInteger(d.positionScore)||![-2,-1,0,1,2].includes(Number(d.positionScore)))))throw new Error(`Detalle de mapeo no válido: ${key}.`);cleanDetails[key]={mappingStatus:d.mappingStatus as MappingStatus,mappingVersion:d.mappingVersion as string,...(d.derivationId?{derivationId:d.derivationId as string}:{}),...(d.mappingMethod?{mappingMethod:d.mappingMethod as 'DIRECT'|'STANDARDIZED_CODING'|'NONE'}:{}),...(d.positionScore!==undefined?{positionScore:d.positionScore as -2|-1|0|1|2|null}:{})};}
  }
  if(Object.keys(values).some(k=>!(POLITICAL_CONTROL_KEYS as readonly string[]).includes(k))||Object.keys(states).some(k=>!(POLITICAL_CONTROL_KEYS as readonly string[]).includes(k)))throw new Error('Hay controles desconocidos en la procedencia.');
  if(o.appliedAtMonth!==undefined&&(!Number.isInteger(o.appliedAtMonth)||Number(o.appliedAtMonth)<0||Number(o.appliedAtMonth)>240))throw new Error('Mes de aplicación no válido.');
  if(o.actorType!==undefined&&!['PARTY','COALITION','FEDERATION'].includes(String(o.actorType)))throw new Error('Tipo de actor no válido.');
  if(o.electionDate!==undefined&&!date(o.electionDate))throw new Error('Fecha electoral no válida.');
  if(o.mappingDetails!==undefined&&(!o.mappingDetails||typeof o.mappingDetails!=='object'||Array.isArray(o.mappingDetails)||Object.keys(o.mappingDetails).some(k=>!(POLITICAL_CONTROL_KEYS as readonly string[]).includes(k))))throw new Error('Detalle de mapeo no válido.');
  return {presetId:o.presetId as string,presetVersion:o.presetVersion as string,partyName:o.partyName as string,actorName:strings(o.actorName)?o.actorName:undefined,actorType:o.actorType as PresetOrigin['actorType'],electionDate:o.electionDate as string|undefined,appliedAtMonth:o.appliedAtMonth as number|undefined,electionName:o.electionName as string,modelVersion:o.modelVersion as string,appliedAt:o.appliedAt as string,originalPolicyValues:cleanValues,mappingStatuses:cleanStates,...(Object.keys(cleanDetails).length?{mappingDetails:cleanDetails}:{})};
}

export function changedPresetValues(origin:PresetOrigin,current:Policy):PoliticalControlKey[] {
  return POLITICAL_CONTROL_KEYS.filter(key=>origin.originalPolicyValues[key]!==undefined&&origin.originalPolicyValues[key]!==current[key]);
}
