import type { Base, Policy } from '../core/types.js';
import { baselinePolicy, validatePolicy } from '../core/policy.js';

export type WizardAnswer = number | null;
export interface WizardChoice { label:string; value:WizardAnswer; detail:string; }
export interface WizardQuestion {
  key:keyof Policy;
  prompt:string;
  unit:string;
  explanation:string;
  options:WizardChoice[];
}
export const WIZARD_QUESTIONS:WizardQuestion[] = [
  { key:'taxShift', prompt:'Respecto al punto de partida, ¿qué nivel de impuestos sobre los ingresos prefieres probar?', unit:'puntos porcentuales (pp)', explanation:'Cada opción cambia los tipos efectivos sintéticos respecto al punto de partida. “Punto de partida” los conserva tal cual; los puntos entre paréntesis son cambios absolutos, no porcentajes relativos.', options:[
    {label:'Muy bajos',value:-4,detail:'−4 pp respecto al inicio'},
    {label:'Bajos',value:-2,detail:'−2 pp respecto al inicio'},
    {label:'Punto de partida',value:null,detail:'Mantener los tipos iniciales'},
    {label:'Altos',value:2,detail:'+2 pp respecto al inicio'},
    {label:'Muy altos',value:4,detail:'+4 pp respecto al inicio'}
  ]},
  { key:'progressivity', prompt:'¿Qué diferencia quieres entre los impuestos de los grupos con menores y mayores ingresos?', unit:'puntos del parámetro de progresividad', explanation:'Esto modifica la diferencia entre los tipos sintéticos de los grupos; no añade esa cantidad al tipo general. El reparto inicial se conserva exactamente al elegir “Punto de partida”.', options:[
    {label:'Menor diferencia',value:-4,detail:'−4 puntos del parámetro'},
    {label:'Algo menor',value:-2,detail:'−2 puntos del parámetro'},
    {label:'Reparto de partida',value:null,detail:'Mantener la distribución inicial'},
    {label:'Algo mayor',value:2,detail:'+2 puntos del parámetro'},
    {label:'Mayor diferencia',value:4,detail:'+4 puntos del parámetro'}
  ]},
  { key:'transfers', prompt:'¿Qué cantidad de ayudas y transferencias quieres probar para los hogares?', unit:'porcentaje de la cantidad de referencia', explanation:'El porcentaje se aplica a la cantidad de transferencias de referencia (17 % del PIB). No son puntos porcentuales del PIB.', options:[
    {label:'Muy pocas',value:-20,detail:'−20 % de la cantidad de referencia'},
    {label:'Pocas',value:-10,detail:'−10 % de la cantidad de referencia'},
    {label:'Cantidad de partida',value:null,detail:'Mantener la referencia'},
    {label:'Muchas',value:10,detail:'+10 % de la cantidad de referencia'},
    {label:'Muchas más',value:20,detail:'+20 % de la cantidad de referencia'}
  ]},
  { key:'services', prompt:'¿Qué nivel de recursos quieres dedicar a los servicios públicos?', unit:'porcentaje del PIB', explanation:'Las cantidades se expresan como puntos del PIB respecto al valor inicial. El punto de partida interno se conserva con toda su precisión.', options:[
    {label:'Menos recursos',value:-1,detail:'Un punto del PIB menos'},
    {label:'Punto de partida',value:null,detail:'Mantener el valor inicial exacto'},
    {label:'Más recursos',value:1,detail:'Un punto del PIB más'}
  ]},
  { key:'publicInvestment', prompt:'¿Qué nivel de inversión pública quieres establecer?', unit:'porcentaje del PIB', explanation:'Aquí eliges una proporción del PIB. Son valores del parámetro del modelo, no una medición de inversión pública observada.', options:[
    {label:'Muy baja',value:1,detail:'1 % del PIB'},
    {label:'Baja',value:2,detail:'2 % del PIB'},
    {label:'Punto de partida',value:null,detail:'Mantener el 3 % del PIB inicial'},
    {label:'Alta',value:4,detail:'4 % del PIB'},
    {label:'Muy alta',value:5,detail:'5 % del PIB'}
  ]},
  { key:'consumptionTax', prompt:'¿Qué nivel quieres probar para los impuestos aplicados al consumo?', unit:'tipo efectivo porcentual', explanation:'Es un tipo agregado efectivo usado por el modelo; no es el tipo legal del IVA. “Punto de partida” conserva el valor inicial exacto.', options:[
    {label:'Muy bajo',value:9,detail:'9 % efectivo'},
    {label:'Punto de partida',value:null,detail:'Mantener el tipo efectivo inicial'},
    {label:'Alto',value:13,detail:'13 % efectivo'},
    {label:'Muy alto',value:15,detail:'15 % efectivo'}
  ]}
];

export function wizardPolicy(base:Base,answers:readonly WizardAnswer[]):Policy {
  if(answers.length!==WIZARD_QUESTIONS.length)throw new Error('Completa las seis preguntas para preparar la simulación.');
  const policy=baselinePolicy(base);
  for(let i=0;i<answers.length;i++){
    const answer=answers[i]!;if(answer===null)continue;
    const key=WIZARD_QUESTIONS[i]!.key;
    if(key==='services')policy.services+=answer;
    else (policy as unknown as Record<string,number>)[key]=answer;
  }
  return validatePolicy(policy);
}

export function wizardChoiceDetail(base:Base,question:WizardQuestion,choice:WizardChoice):string {
  if(question.key!=='services')return choice.detail;
  const exact=baselinePolicy(base).services+(choice.value??0);
  const shown=new Intl.NumberFormat('es-ES',{maximumFractionDigits:4}).format(exact);
  return `${shown} % del PIB · ${choice.detail}${choice.value===null?' (se conserva el valor interno exacto)':''}`;
}
