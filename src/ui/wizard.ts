import type { Base, Policy } from '../core/types.js';
import { baselinePolicy, validatePolicy } from '../core/policy.js';
import { householdBudget } from '../core/engine.js';
import { M } from '../core/model.js';
import { positionToControlValue } from '../political-presets/coding.js';

export type WizardAnswer = number | null;
export interface WizardChoice { label:string; value:WizardAnswer; }
export interface WizardQuestion {
  key:keyof Policy;
  prompt:string;
  explanation:string;
  options:WizardChoice[];
}

// The wizard and program presets share the same discrete score-to-step mapping.
export const WIZARD_QUESTIONS:WizardQuestion[] = [
  { key:'taxShift', prompt:'¿Quieres bajar, mantener o subir los impuestos sobre los ingresos?', explanation:'El cambio se aplica a los impuestos de los grupos de hogares de esta simulación, respecto a la configuración inicial del catálogo.', options:[
    {label:'Bajarlos más',value:-2}, {label:'Bajarlos un poco',value:-1}, {label:'Mantenerlos',value:null}, {label:'Subirlos un poco',value:1}, {label:'Subirlos más',value:2}
  ]},
  { key:'progressivity', prompt:'¿Cuánto quieres cambiar la diferencia entre los tipos de los grupos con más y menos ingresos?', explanation:'Elige el cambio del diferencial alto menos bajo, en puntos porcentuales, respecto al punto de partida. La mitad del cambio se aplica a cada extremo y el grupo intermedio no cambia; los topes pueden limitarlo. La vista previa incluye también los impuestos generales.', options:[
    {label:'Reducirla más',value:-2}, {label:'Reducirla un poco',value:-1}, {label:'Mantener el reparto',value:null}, {label:'Ampliarla un poco',value:1}, {label:'Ampliarla más',value:2}
  ]},
  { key:'transfers', prompt:'¿Quieres aumentar o reducir el dinero que reciben los hogares en ayudas?', explanation:'Aquí decides cuánto dinero destina el Estado a los hogares mediante las transferencias que representa el simulador.', options:[
    {label:'Bastante menos',value:-2}, {label:'Algo menos',value:-1}, {label:'Mantener la cantidad',value:null}, {label:'Algo más',value:1}, {label:'Bastante más',value:2}
  ]},
  { key:'services', prompt:'¿Quieres dedicar menos, lo mismo o más gasto corriente a los servicios públicos?', explanation:'Este control representa gasto corriente de provisión. No implica un efecto directo sobre productividad o capacidad. La inversión en infraestructuras y capital público se configura por separado.', options:[
    {label:'Menos recursos',value:-1}, {label:'Mantener los recursos',value:null}, {label:'Más recursos',value:1}
  ]},
  { key:'publicInvestment', prompt:'¿Cuánto quieres dedicar a la inversión pública?', explanation:'La inversión pública entra en la inversión total, aumenta el stock de capital y puede elevar la capacidad productiva con retardo. Es distinta del gasto corriente para prestar servicios.', options:[
    {label:'Reducir más',value:-2}, {label:'Reducir un poco',value:-1}, {label:'Mantener la cantidad',value:null}, {label:'Aumentar un poco',value:1}, {label:'Aumentar más',value:2}
  ]},
  { key:'consumptionTax', prompt:'¿Quieres bajar, mantener o subir los impuestos sobre las compras?', explanation:'El simulador utiliza un impuesto medio simplificado; no es el IVA de un producto concreto.', options:[
    {label:'Bajarlos más',value:-2}, {label:'Bajarlos un poco',value:-1}, {label:'Mantenerlos',value:null}, {label:'Subirlos un poco',value:1}, {label:'Subirlos más',value:2}
  ]}
];

export function wizardPolicy(base:Base,answers:readonly WizardAnswer[]):Policy {
  if(answers.length!==WIZARD_QUESTIONS.length)throw new Error('Completa las seis preguntas para preparar la simulación.');
  const policy=baselinePolicy(base);
  for(let i=0;i<answers.length;i++){
    const answer=answers[i]!;if(answer===null)continue;
    const key=WIZARD_QUESTIONS[i]!.key;
    (policy as unknown as Record<string,number>)[key]=positionToControlValue(base,key as import('../political-presets/schema.js').PoliticalControlKey,answer as -2|-1|1|2);
  }
  return validatePolicy(policy);
}

const fmt=(n:number,digits=1)=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:digits}).format(n);

/** Human preview uses the same household tax calculation and bounds as the engine. */
export function wizardChoiceDetail(base:Base,questionIndex:number,choice:WizardChoice,answers:readonly WizardAnswer[]):string {
  const next=[...answers];next[questionIndex]=choice.value;
  const policy=wizardPolicy(base,next);
  const baseline=baselinePolicy(base);
  if(questionIndex===0||questionIndex===1){
    const groups=householdBudget(base.values.gdp!,base.values.population!,1,policy);
    const reference=householdBudget(base.values.gdp!,base.values.population!,1,baseline);
    const labels=['Menores ingresos','Ingresos intermedios','Mayores ingresos'];
    return groups.map((g,i)=>`${labels[i]}: ${fmt(reference[i]!.tax/reference[i]!.gross*100)} → ${fmt(g.tax/g.gross*100)} %`).join(' · ');
  }
  if(questionIndex===2){
    const start=M.transferGDPShare*100,amount=start*(1+policy.transfers/100);
    return `Importe total de referencia: ${fmt(start,2)} → ${fmt(amount,2)} % de la producción`;
  }
  if(questionIndex===3){
    const gdp=base.values.gdp!,reference=baseline.services/gdp*100,result=policy.services/gdp*100;
    return `${fmt(reference,2)} → ${fmt(result,2)} % de la producción · unos ${fmt(result)} € por cada 100 €`;
  }
  if(questionIndex===4){
    const result=policy.publicInvestment;
    return `${fmt(result)} % de la producción · unos ${fmt(result)} € por cada 100 €`;
  }
  return `Tipo medio de referencia: ${fmt(baseline.consumptionTax)} → ${fmt(policy.consumptionTax)} %`;
}
