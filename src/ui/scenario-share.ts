import type { Branch, Experiment, Policy } from '../core/types.js';
import { baselinePolicy } from '../core/policy.js';
import { num } from './format.js';
import { economicDecisionChanges } from './economic-decisions.js';

export interface ShareMetric { label:string; value:string; unit:string; }
export function changedDecisionsCount(exp:Experiment,id:'A'|'B'):number {
  const policy=id==='A'?exp.a.policy:exp.b.policy,baseline=baselinePolicy(exp.base);
  const economic=economicDecisionChanges(baseline,policy).length;
  const institutional:(keyof Policy)[]=['elections','termMonths','expression','judicialReview'];
  return economic+institutional.filter(key=>policy[key]!==baseline[key]).length;
}
export function scenarioSummary(exp:Experiment,id:'A'|'B'):string {
  const branch=id==='A'?exp.a:exp.b,months=branch.state.month;
  const horizon=months%12===0&&months>0?`${months/12} ${months===12?'año':'años'}`:`${months} ${months===1?'mes':'meses'}`;
  const changes=changedDecisionsCount(exp,id);
  return `España · horizonte ${horizon} · ${changes} ${changes===1?'decisión modificada':'decisiones modificadas'}`;
}
export function scenarioMetrics(branch:Branch):ShareMetric[] {
  if(branch.state.month===0)return [];
  const last=branch.history.at(-1)!;
  return [
    {label:'Producción económica',value:num(last.gdp,1),unit:'miles de millones de € · ritmo anualizado'},
    {label:'Capacidad de compra',value:num(last.purchasingPower,0),unit:'€ por persona y año'},
    {label:'Precios (inflación)',value:`${num(last.inflation,1)} %`,unit:'interanual'},
    {label:'Desempleo',value:`${num(last.unemployment,1)} %`,unit:'población activa'}
  ];
}
export function shareText(summary:string):string {
  return `He probado este escenario en Simula tu país: ${summary}. ¿Qué cambiarías tú? Es un escenario simulado, no una predicción.`;
}
export function socialShareUrls(url:string,text:string):{whatsapp:string;x:string} {
  const whatsapp=new URL('https://api.whatsapp.com/send');whatsapp.searchParams.set('text',`${text} ${url}`);
  const x=new URL('https://twitter.com/intent/tweet');x.searchParams.set('text',text);x.searchParams.set('url',url);
  return {whatsapp:whatsapp.toString(),x:x.toString()};
}
export function drawScenarioCard(canvas:HTMLCanvasElement,exp:Experiment,id:'A'|'B'):void {
  canvas.width=1200;canvas.height=630;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Este navegador no puede generar la imagen.');
  const metrics=scenarioMetrics(id==='A'?exp.a:exp.b);
  ctx.fillStyle='#101820';ctx.fillRect(0,0,1200,630);
  ctx.fillStyle='#1c2834';ctx.fillRect(32,32,1136,566);
  ctx.fillStyle='#ffbf76';ctx.fillRect(72,70,64,64);
  ctx.fillStyle='#101820';ctx.font='bold 44px system-ui, sans-serif';ctx.fillText('S',91,118);
  ctx.fillStyle='#f5f7fa';ctx.font='bold 34px system-ui, sans-serif';ctx.fillText('SIMULA TU PAÍS',158,116);
  ctx.fillStyle='#a9bdcc';ctx.font='24px system-ui, sans-serif';ctx.fillText('Escenario de España',74,191);
  ctx.fillStyle='#f5f7fa';ctx.font='bold 40px system-ui, sans-serif';ctx.fillText(scenarioSummary(exp,id),74,249,1050);
  if(metrics.length){
    metrics.forEach((metric,index)=>{
      const x=74+(index%2)*540,y=293+Math.floor(index/2)*109;
      ctx.fillStyle='#a9bdcc';ctx.font='20px system-ui, sans-serif';ctx.fillText(metric.label,x,y);
      ctx.fillStyle='#f5f7fa';ctx.font='bold 36px system-ui, sans-serif';ctx.fillText(metric.value,x,y+43);
      ctx.fillStyle='#a9bdcc';ctx.font='17px system-ui, sans-serif';ctx.fillText(metric.unit,x,y+70,490);
    });
  }else{
    ctx.fillStyle='#a9bdcc';ctx.font='25px system-ui, sans-serif';ctx.fillText('Punto de partida · avanza la simulación para ver resultados',74,354,1050);
  }
  ctx.strokeStyle='#425363';ctx.beginPath();ctx.moveTo(74,532);ctx.lineTo(1126,532);ctx.stroke();
  ctx.fillStyle='#ffbf76';ctx.font='bold 22px system-ui, sans-serif';ctx.fillText('Escenario simulado, no predicción',74,570);
  ctx.fillStyle='#a9bdcc';ctx.font='21px system-ui, sans-serif';ctx.textAlign='right';ctx.fillText('simulatupais.org',1126,570);ctx.textAlign='left';
}
export async function downloadScenarioCard(exp:Experiment,id:'A'|'B'):Promise<void> {
  const canvas=document.createElement('canvas');drawScenarioCard(canvas,exp,id);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('No se pudo crear la imagen.')),'image/png'));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='simula-tu-pais-escenario.png';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
