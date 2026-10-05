import type { Policy } from '../core/types.js';

export type EconomicDecisionKey = 'taxShift'|'progressivity'|'consumptionTax'|'corporateTax'|'transfers'|'publicInvestment'|'services'|'investmentFriction';
export interface EconomicDecision {
  key:EconomicDecisionKey; label:string; unit:string; reference:number; applied:number; difference:number; meaning:string;
}

export const ECONOMIC_DECISIONS:ReadonlyArray<{key:EconomicDecisionKey;label:string;unit:string;meaning:string}>=[
  {key:'taxShift',label:'Ajuste general de impuestos sobre ingresos',unit:'pp',meaning:'Cambio común aplicado a los tipos sintéticos de los grupos de hogares; no es un tipo legal.'},
  {key:'progressivity',label:'Cambio del diferencial de tipo alto menos bajo',unit:'pp',meaning:'El valor cambia en esos puntos porcentuales la diferencia entre el tipo del grupo alto y el bajo: la mitad se resta al grupo bajo, la mitad se suma al alto y el grupo central no cambia. Los topes fiscales pueden reducir el cambio efectivo.'},
  {key:'consumptionTax',label:'Impuesto medio simplificado sobre compras',unit:'%',meaning:'Tipo medio antes de impuestos utilizado por el simulador; no representa el IVA de un producto concreto.'},
  {key:'corporateTax',label:'Impuesto de referencia sobre beneficios',unit:'%',meaning:'Parámetro simplificado para los beneficios empresariales; no describe por completo el sistema fiscal vigente.'},
  {key:'transfers',label:'Variación del importe total de ayudas',unit:'%',meaning:'Variación agregada frente al importe de partida; no indica cuánto recibe cada hogar.'},
  {key:'publicInvestment',label:'Inversión pública',unit:'% del PIB',meaning:'Parte de la producción destinada a ampliar o renovar capacidad productiva.'},
  {key:'services',label:'Gasto corriente en servicios públicos',unit:'% del PIB',meaning:'Recursos corrientes de provisión pública que elevan gasto y demanda; sin efecto productivo directo y sin medir calidad o bienestar.'},
  {key:'investmentFriction',label:'Coste adicional de invertir',unit:'pp',meaning:'Parámetro simplificado de barreras al uso de activos productivos.'},
];

export function economicDecisionChanges(reference:Policy,applied:Policy):EconomicDecision[] {
  return ECONOMIC_DECISIONS.flatMap(({key,label,unit,meaning})=>{
    const from=reference[key],to=applied[key];
    return typeof from==='number'&&typeof to==='number'&&from!==to
      ?[{key,label,unit,reference:from,applied:to,difference:to-from,meaning}]
      :[];
  });
}

export function formatDecisionValue(key:EconomicDecisionKey,value:number,unit:string):string {
  const digits=key==='services'?8:1;
  const formatted=new Intl.NumberFormat('es-ES',{maximumFractionDigits:digits}).format(value);
  const signed=['taxShift','progressivity','transfers'].includes(key)&&value>0?'+':'';
  const suffix=['taxShift','progressivity','investmentFriction'].includes(key)?` ${unit}`:key==='transfers'?` % (${signed}${formatted} respecto al importe inicial)`:` ${unit}`;
  if(key==='transfers')return `variación ${formatted}% del importe inicial`;
  return `${signed}${formatted}${suffix}`;
}

export function formatDecisionDifference(change:EconomicDecision):string {
  const digits=change.key==='services'?8:1;
  const value=new Intl.NumberFormat('es-ES',{maximumFractionDigits:digits}).format(Math.abs(change.difference));
  const sign=change.difference>0?'+':change.difference<0?'−':'';
  if(change.key==='transfers')return `${sign}${value} puntos porcentuales de variación`;
  return `${sign}${value} ${change.unit}`;
}

export function formatDecisionSummary(change:EconomicDecision):string {
  if(change.key==='taxShift'||change.key==='progressivity'||change.key==='transfers')return `${change.label}: ${formatDecisionDifference(change)}`;
  return `${change.label}: ${formatDecisionValue(change.key,change.reference,change.unit)} → ${formatDecisionValue(change.key,change.applied,change.unit)}`;
}
