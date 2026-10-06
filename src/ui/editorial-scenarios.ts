import type { Base, Policy } from '../core/types.js';
import { baselinePolicy, validatePolicy } from '../core/policy.js';

export interface EditorialScenario {
  slug:string;title:string;question:string;description:string;
  scenario:{months:number;seed:number;shocksEnabled:boolean;policy:(base:Base)=>Policy};
}
export const EDITORIAL_SCENARIOS:readonly EditorialScenario[]=[
  {
    slug:'inversion-publica-gradual',title:'Inversión pública gradual',
    question:'¿Qué muestra el modelo si aumenta ligeramente la inversión pública?',
    description:'Escenario de demostración con un aumento de 0,2 puntos del PIB en inversión pública. El resto de decisiones se mantiene en la referencia del simulador.',
    scenario:{months:60,seed:1847,shocksEnabled:true,policy:base=>validatePolicy({...baselinePolicy(base),publicInvestment:baselinePolicy(base).publicInvestment+0.2})}
  },
  {
    slug:'servicios-publicos-gradual',title:'Servicios públicos graduales',
    question:'¿Qué muestra el modelo si aumenta ligeramente el gasto corriente en servicios públicos?',
    description:'Escenario de demostración con un aumento de 0,2 puntos del PIB en servicios públicos. El resto de decisiones se mantiene en la referencia del simulador.',
    scenario:{months:60,seed:1847,shocksEnabled:true,policy:base=>validatePolicy({...baselinePolicy(base),services:baselinePolicy(base).services+0.2})}
  }
];
export function editorialSlug(hash:string):string|null {
  if(!hash.startsWith('#/espana/'))return null;
  const slug=hash.slice('#/espana/'.length);
  if(!/^[a-z0-9-]{1,80}$/.test(slug))throw new Error('La dirección del escenario editorial no es válida.');
  return slug;
}
export function findEditorialScenario(slug:string):EditorialScenario|undefined {
  return EDITORIAL_SCENARIOS.find(item=>item.slug===slug);
}
