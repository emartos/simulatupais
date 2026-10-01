import type { Experiment, Point } from '../core/types.js';
import { esc, num, dateLabel } from './format.js';
export type Metric='gdp'|'purchasingPower'|'inflation'|'unemployment'|'debtRatio'|'investment';
export const METRICS:Record<Metric,{label:string;unit:string;decimals:number}>= {
  gdp:{label:'Producción económica',unit:'Miles de millones de euros del año de partida · ritmo anualizado',decimals:1},
  purchasingPower:{label:'Capacidad de compra',unit:'Euros por persona y año · media de hogares simulados',decimals:0},
  inflation:{label:'Precios (inflación)',unit:'Variación frente al mismo mes del año anterior · porcentaje',decimals:1},
  unemployment:{label:'Desempleo',unit:'Porcentaje de la población activa',decimals:1},
  debtRatio:{label:'Deuda / PIB',unit:'Existencia de deuda al cierre / PIB nominal anualizado · porcentaje',decimals:1},
  investment:{label:'Inversión',unit:'Miles de millones de euros del año de partida · flujo anualizado',decimals:1}
};
export function renderChart(exp:Experiment,metric:Metric):string {
  const primaryId=exp.primaryId||'B',primary=primaryId==='A'?exp.a:exp.b,other=primaryId==='A'?exp.b:exp.a,paired=!!exp.comparisonActive;
  const series=paired?[primary,other]:[primary],values=series.flatMap(b=>b.history.map(p=>p[metric]));
  let min=Math.min(...values),max=Math.max(...values);const span=Math.max(max-min,Math.abs(max)*0.012,0.15);min-=span*.25;max+=span*.25;
  const left=84,top=26,w=720,h=230,total=850,month=primary.state.month,maxMonth=Math.max(12,month);
  const x=(m:number)=>left+m/maxMonth*w,y=(v:number)=>top+h-(v-min)/(max-min)*h;
  const path=(ps:Point[])=>ps.map((p,i)=>`${i?'L':'M'}${x(p.month).toFixed(2)},${y(p[metric]).toFixed(2)}`).join(' ');
  const grid=Array.from({length:5},(_,i)=>{const v=min+(max-min)*i/4,yy=y(v);return `<line x1="${left}" x2="${left+w}" y1="${yy}" y2="${yy}" class="gridline"/><text x="${left-12}" y="${yy+4}" text-anchor="end" class="axis-label">${esc(num(v,METRICS[metric].decimals))}</text>`;}).join('');
  const ticks=Array.from({length:5},(_,i)=>Math.round(maxMonth*i/4)),tickSvg=ticks.map(m=>`<text x="${x(m)}" y="${top+h+28}" text-anchor="middle" class="axis-label" data-tick-month="${m}">${esc(m===0?String(exp.base.year):dateLabel(exp.base.year,m,true))}</text>`).join('');
  const names=exp.branchNames||{A:'Simulación original',B:'Con estos cambios'};
  const markers=paired?[...new Set([...(exp.a.policyChanges||[]),...(exp.b.policyChanges||[])].map(c=>c.month).filter(m=>m>0))].sort((a,b)=>a-b).map(m=>`<line data-change-month="${m}" x1="${x(m)}" x2="${x(m)}" y1="${top}" y2="${top+h}" stroke="#d9ad74" stroke-dasharray="4 4"/><text x="${x(m)+5}" y="${top+14}" class="axis-label" data-change-label="${m}">Cambio de configuración · ${esc(dateLabel(exp.base.year,m,true))}; los efectos empiezan en el paso siguiente</text>`).join(''):'';
  const lines=series.map((b,i)=>`<path data-series="${b.id}" data-metric="${metric}" d="${path(b.history)}" fill="none" class="${paired?(i===0?'line-a':'line-b'):'line-single'}"/>`).join('');
  const points=series.map((b,i)=>{const last=b.history.at(-1)!;return `<circle data-series-point="${b.id}" data-month="${last.month}" cx="${x(last.month)}" cy="${y(last[metric])}" r="4" class="${paired?(i===0?'circle-a':'circle-b'):'circle-single'}"/>`;}).join('');
  const labels=series.map(b=>`<span><i class="dot ${b.id===primaryId?'alternative':'reference'}"></i>${esc(names[b.id])}</span>`).join('');
  const aria=paired?`Comparación de ${names[primaryId]} y ${names[primaryId==='A'?'B':'A']}. ${METRICS[metric].label}.`:`${names[primaryId]}. ${METRICS[metric].label}.`;
  return `<div class="chart-meta"><span>${esc(METRICS[metric].unit)}</span><span class="legend">${labels}</span></div><div class="chart-container" id="chart-area" data-metric="${metric}"><svg class="main-chart" viewBox="0 0 ${total} 305" role="img" aria-label="${esc(aria)} Valores disponibles en tabla.">${grid}${tickSvg}${markers}${lines}${points}${month===0?`<text x="450" y="122" text-anchor="middle" class="chart-empty">Configura tu simulación y avanza el tiempo.</text>`:''}</svg><div id="chart-tip" class="chart-tip" hidden></div></div>`;
}
