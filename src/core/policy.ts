import type { Base, Policy } from './types.js';
import { M } from './model.js';
export const BOUNDS = {
  taxShift: [-6, 8, 0.5], progressivity: [-4, 6, 0.5], consumptionTax: [5, 18, 0.5],
  corporateTax: [10, 35, 0.5], transfers: [-25, 35, 1], publicInvestment: [1, 6, 0.1],
  services: [15, 25, 0.1], investmentFriction: [0, 8, 0.25], termMonths: [24, 72, 12]
} as const;
export function baselinePolicy(base: Base): Policy {
  return { taxShift:0, progressivity:0, consumptionTax:M.baselineConsumptionTax*100,
    corporateTax:M.baselineCorporateTax*100, transfers:0, publicInvestment:M.baselinePublicInvestment*100,
    services:base.values.services!/base.values.gdp!*100, investmentFriction:0,
    elections:'competitive', termMonths:48, expression:true, judicialReview:true };
}
export function validatePolicy(input: unknown): Policy {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Configuraci\u00f3n no v\u00e1lida.');
  const p = input as Record<string,unknown>;
  const out: Record<string,unknown> = {};
  for (const [key,[min,max]] of Object.entries(BOUNDS)) {
    const v=p[key];
    if (typeof v!=='number' || !Number.isFinite(v) || v<min || v>max) throw new Error(`Par\u00e1metro fuera de rango: ${key}.`);
    if (key==='termMonths' && (!Number.isInteger(v) || v % 12 !== 0)) throw new Error('El mandato debe expresarse en a\u00f1os completos.');
    out[key]=v;
  }
  if (!['competitive','single-party','appointment'].includes(String(p.elections))) throw new Error('Procedimiento institucional no v\u00e1lido.');
  for (const k of ['expression','judicialReview']) if (typeof p[k]!=='boolean') throw new Error('Garant\u00eda institucional no v\u00e1lida.');
  out.elections=p.elections; out.expression=p.expression; out.judicialReview=p.judicialReview;
  return out as unknown as Policy;
}
// A descriptive, user-visible coordinate only. NEVER called by the numerical engine.
// Synthetic anchors, not scores of parties, political quality, or an empirical classification.
export function economicProximity(p: Policy): { position:number; values:number[]; components:number[] } {
  const components = [
    (p.taxShift+6)/14, (p.progressivity+4)/10, (p.transfers+25)/60, (p.publicInvestment-1)/5
  ];
  const position = Math.max(0,Math.min(1,1-components.reduce((a,b)=>a+b,0)/components.length));
  const values = [0,0.5,1].map(anchor=>Math.round(100*(1-Math.abs(position-anchor))));
  return {position,values,components};
}
