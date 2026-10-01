import type { Dataset, Experiment, Policy, Session, WorkerRequest, WorkerResponse } from './core/types.js';
import { selectBase, fingerprint } from './core/data.js';
import { MODEL_VERSION, MAX_MONTHS, ASSUMPTIONS } from './core/model.js';
import { baselinePolicy, BOUNDS, economicProximity } from './core/policy.js';
import { exportSession } from './core/session.js';
import { loadLocal, saveLocal } from './ui/storage.js';
import { esc, num, signed, dateLabel, download, icon } from './ui/format.js';
import { renderChart, METRICS } from './ui/chart.js';
import type { Metric } from './ui/chart.js';
import { WIZARD_QUESTIONS, wizardChoiceDetail, wizardPolicy } from './ui/wizard.js';

const root=document.querySelector<HTMLDivElement>('#app')!;
const worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
let dataset:Dataset, datasetHash='', exp:Experiment, draft:Policy;
let currentTab:'lab'|'model'|'sources'|'about'|'wizard'='lab';
let mobileMenuOpen=false;
let configTab:'economy'|'institutions'|'advanced'='economy';
let configuredBranchId:'A'|'B'='B', compareSourceId:'A'|'B'='B';
let introOpen=true, wizardStep=0, wizardAnswers:(number|null)[]=Array(6).fill(null),wizardAnswered:boolean[]=Array(6).fill(true);
let firstRunSetup=false, setupGuidanceOpen=false;
let pendingPrimaryPolicy:Policy|undefined, saveStatus:'idle'|'saving'|'saved'|'unavailable'='idle';
let metric:Metric='gdp', playing=false, busy=false, speed=1;
let timer:ReturnType<typeof setTimeout>|undefined;
let requestId=0, storageAvailable=true, saveReady=false, saveQueue=Promise.resolve();
let selectedTrace='output', traceBranch:'A'|'B'='B';
let pendingDialog:''|'reset'|'compare'='';
let dialogReturnFocus:HTMLElement|null=null;
let toastTimer:ReturnType<typeof setTimeout>|undefined;
let queuedLivePolicy:{branchId:'A'|'B';policy:Policy}|undefined;
function showToast(message:string,error=false):void {
  clearTimeout(toastTimer);document.querySelector('#toast')?.remove();
  const node=document.createElement('div');node.id='toast';node.className=`toast${error?' error':''}`;node.setAttribute('role',error?'alert':'status');node.textContent=message;document.body.append(node);toastTimer=setTimeout(()=>node.remove(),5000);
}
function saveLabel():string {return saveStatus==='unavailable'?'Sin guardado automático':saveStatus==='saving'?'Guardando…':saveStatus==='idle'?'Aún sin guardar':'Guardado en este navegador';}
function saveHelpText():string {return saveStatus==='unavailable'?'El guardado automático no está disponible. La simulación funciona en memoria y puedes exportarla.':saveStatus==='idle'?'Aún no hay una configuración guardada. Se guardará en este navegador cuando empieces la simulación o cambies los controles.':'Tu configuración y el progreso se guardan en este navegador y dispositivo. No se sincronizan con otros dispositivos. Si borras los datos del sitio, usas navegación privada o el navegador elimina ese almacenamiento, podrías perderlos. Exporta la simulación para conservar una copia.';}
function saveControl():string {return `<div class="local-status-wrap"><button id="save-help" class="local-status" aria-haspopup="dialog" aria-expanded="false"><span id="save-label">${saveLabel()}</span><span class="status-dot"></span></button><section id="save-help-popover" role="dialog" aria-labelledby="save-help-title" hidden><h2 id="save-help-title">${saveLabel()}</h2><p id="save-help-text">${esc(saveHelpText())}</p><button data-action="export">Exportar simulación</button><button data-action="close-save-help">Cerrar</button></section></div>`;}
const pending=new Map<number,{resolve:(e:Experiment)=>void;reject:(e:Error)=>void}>();
worker.onmessage=(e:MessageEvent<WorkerResponse>)=>{
  const message=e.data, p=pending.get(message.id); if(!p) return;
  pending.delete(message.id);
  if(message.ok && message.experiment) p.resolve(message.experiment);
  else p.reject(new Error(message.error||'Error del motor.'));
};
worker.onerror=(e)=>{
  pause(); busy=false;
  for(const p of pending.values())p.reject(new Error(e.message||'El motor no est\u00e1 disponible.'));
  pending.clear(); showToast('Error del worker. Exporta la sesi\u00f3n antes de recargar.',true);
};
function command(type:WorkerRequest['type'],payload?:unknown):Promise<Experiment> {
  return new Promise((resolve,reject)=>{
    const id=++requestId;pending.set(id,{resolve,reject});worker.postMessage({id,type,payload});
  });
}
function persist():void {
  if(!saveReady || !storageAvailable || !exp) return;
  const session=exportSession(exp,datasetHash);if(saveStatus==='idle'){saveStatus='saving';updateSaveLabel();}
  saveQueue=saveQueue.then(()=>saveLocal(session)).then(()=>{saveStatus='saved';updateSaveLabel();}).catch(()=>{
    storageAvailable=false;saveStatus='unavailable';updateSaveLabel();showToast('No se pudo guardar automáticamente. La simulación sigue disponible en memoria; expórtala para conservarla.',true);
  });
}
function updateSaveLabel():void {
  const el=document.querySelector('#save-label');if(!el)return;
  const label=saveStatus==='unavailable'?'Sin guardado automático':saveStatus==='saving'?'Guardando…':saveStatus==='idle'?'Aún sin guardar':'Guardado en este navegador';
  if(el.textContent!==label)el.textContent=label;
  el.setAttribute('data-status',saveStatus);
  const title=document.querySelector('#save-help-title'),text=document.querySelector('#save-help-text');if(title&&title.textContent!==label)title.textContent=label;const help=saveHelpText();if(text&&text.textContent!==help)text.textContent=help;
}
function restoreDialogFocus(origin:HTMLElement|null):void {
  const selector=origin?.closest('.lock-note')?'.lock-note [data-action=\"compare\"]':'.config-actions [data-action=\"compare\"]';
  document.querySelector<HTMLButtonElement>(selector)?.focus();
}
function toggleSaveHelp(show?:boolean):void {
  const panel=document.querySelector<HTMLElement>('#save-help-popover'),button=document.querySelector<HTMLButtonElement>('#save-help');if(!panel||!button)return;
  const open=show??panel.hidden;panel.hidden=!open;button.setAttribute('aria-expanded',String(open));
}
function dismissIntro():void {introOpen=false;try{localStorage.setItem('polis-intro-dismissed','1');}catch{}}
function markConfigured():void {try{localStorage.setItem('polis-setup-complete','1');}catch{}}
function activeBranch():Experiment['a'] {const id=exp.primaryId||'B';return id==='A'?exp.a:exp.b;}
function branch(id:'A'|'B'):Experiment['a'] {return id==='A'?exp.a:exp.b;}
function branchName(id:'A'|'B'):string {
  if(!exp.comparisonActive)return 'Tu simulación';
  const name=exp.branchNames?.[id];
  if(name==='Con estos cambios')return id===exp.primaryId?'Simulación original':'Alternativa';
  return name||(id===exp.primaryId?'Simulación original':'Alternativa');
}
function targetBranchId(): 'A'|'B' {return exp.comparisonActive?(exp.primaryId==='A'?'B':'A'):(exp.primaryId||'B');}
function monthText(month:number):string {
  if(month===0)return 'Aún no has avanzado';
  const years=Math.floor(month/12),months=month%12,parts:string[]=[];
  if(years)parts.push(`${years} ${years===1?'año':'años'}`);if(months)parts.push(`${months} ${months===1?'mes':'meses'}`);
  return `${parts.join(' y ')} simulados`;
}
function pause():void {playing=false;clearTimeout(timer);}
function schedule():void {
  clearTimeout(timer);
  if(!playing || document.hidden || activeBranch().state.month>=MAX_MONTHS){pause();return;}
  if(busy){timer=setTimeout(schedule,100);return;}
  timer=setTimeout(()=>void advanceTime(speed),900);
}
async function advanceTime(months:number):Promise<void> {
  if(busy)return;
  busy=true;
  try {exp=await command('ADVANCE',months);}
  catch(e){pause();showToast((e as Error).message,true);}
  finally{
    const queued=queuedLivePolicy;queuedLivePolicy=undefined;
    if(queued){try{exp=await command('CONFIGURE',{branchId:queued.branchId,policy:queued.policy});}catch(e){showToast((e as Error).message,true);}}
    draft={...branch(configuredBranchId).policy};persist();busy=false;if(activeBranch().state.month>=MAX_MONTHS)pause();render();schedule();
  }
}
function renderControls():void {
  const box=document.querySelector('#time-controls');if(box)patchElementHtml(box,timeControls());
}
function timeControls():string {
  const month=activeBranch().state.month,end=month>=MAX_MONTHS;
  return `<div class="sim-date"><span>TIEMPO SIMULADO</span><strong id="sim-date">${esc(dateLabel(exp.base.year,month))}</strong></div><div class="transport"><button data-action="play" class="primary play-button" ${end?'disabled':''} aria-label="${playing?'Pausar simulación':'Reproducir simulación'}">${icon(playing?'pause':'play')}${playing?'Pausar':'Reproducir'}</button><button data-action="step" ${busy||end?'disabled':''}>+1 mes</button><button data-action="year" ${busy||end?'disabled':''}>+1 año</button><label class="speed">Velocidad<select id="speed" aria-label="Velocidad de reproducción" ${busy?'disabled':''}><option value="1" ${speed===1?'selected':''}>1×</option><option value="3" ${speed===3?'selected':''}>3×</option><option value="12" ${speed===12?'selected':''}>12×</option></select></label></div><span class="month-counter" id="month-counter">${esc(monthText(month))} · Hasta ${MAX_MONTHS/12} años en esta versión</span>${end?`<p class="limit-note" role="status">Has llegado al límite de esta versión. Exporta la simulación o crea una nueva.</p>`:''}`;
}
function axis():string {
  const a=economicProximity(draft);
  return `<div class="axis-title">Eje econ\u00f3mico descriptivo <button class="icon-button" data-action="axis-info" aria-label="Metodolog\u00eda del eje">${icon('info',15)}</button></div><div class="political-track"><i style="left:${a.position*100}%"></i></div><div class="axis-labels">${['Izquierda','Centro','Derecha'].map((label,i)=>`<div><span>${label}</span><strong>${a.values[i]}<small>%</small></strong></div>`).join('')}</div><p class="tiny">Proximidad a referencias sint\u00e9ticas, no una valoraci\u00f3n pol\u00edtica. No altera el motor.</p>`;
}
const labels:Record<string,{label:string;hint:string;unit:string}>={
  taxShift:{label:'Impuestos directos',hint:'Variaci\u00f3n sobre tipos efectivos sint\u00e9ticos de 8 / 18 / 28 %.',unit:'pp'},
  progressivity:{label:'Progresividad',hint:'Desplaza tipos entre los grupos de renta inferior y superior.',unit:'pp'},
  consumptionTax:{label:'Impuesto al consumo',hint:'Tipo efectivo agregado; no es el tipo legal del IVA.',unit:'%'},
  corporateTax:{label:'Impuesto sobre beneficios',hint:'Tipo efectivo hipot\u00e9tico, no el tipo legal espa\u00f1ol.',unit:'%'},
  transfers:{label:'Transferencias a hogares',hint:'Cambio respecto a la base sint\u00e9tica del 17 % del PIB.',unit:'%'},
  publicInvestment:{label:'Inversi\u00f3n p\u00fablica',hint:'Parte del producto destinada a ampliar capital.',unit:'% PIB'},
  services:{label:'Servicios p\u00fablicos',hint:'Consumo final p\u00fablico, no gasto p\u00fablico total.',unit:'% PIB'},
  investmentFriction:{label:'Coste adicional de invertir',hint:'Fricci\u00f3n en el acceso y uso de activos productivos; no mide derechos.',unit:'pp'}
};
function valueLabel(k:string,value:number):string {
  const sign=['taxShift','progressivity','transfers'].includes(k)&&value>0?'+':'';
  return `${sign}${num(value,k==='transfers'?0:1)} ${labels[k]?.unit||''}`;
}
function control(k:keyof typeof BOUNDS):string {
  const l=labels[k]!,[min,max,step]=BOUNDS[k],locked=busy;
  return `<div class="range-control"><div class="range-heading"><label for="p-${k}">${esc(l.label)}</label><output id="out-${k}" for="p-${k}">${esc(valueLabel(k,draft[k] as number))}</output></div><input id="p-${k}" data-policy="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${draft[k]}" ${locked?'disabled':''}><p>${esc(l.hint)}</p></div>`;
}
function configPanel():string {
  const id=configuredBranchId,locked=busy;
  let content='';
  if(configTab==='economy')content=Object.keys(labels).map(k=>control(k as keyof typeof BOUNDS)).join('');
  else if(configTab==='institutions')content=`<div class="notice compact"><strong>Estas reglas solo describen procedimientos y generan eventos.</strong> En esta versión no tienen efectos económicos cuantificados.</div><label class="field-label" for="elections">Forma de selección del poder</label><select id="elections" data-policy="elections" ${locked?'disabled':''}><option value="competitive" ${draft.elections==='competitive'?'selected':''}>Competencia electoral</option><option value="single-party" ${draft.elections==='single-party'?'selected':''}>Selección dentro de un partido</option><option value="appointment" ${draft.elections==='appointment'?'selected':''}>Designación</option></select><label class="field-label" for="term">Cada cuánto se renueva el procedimiento</label><select id="term" data-policy="termMonths" ${locked?'disabled':''}>${[24,36,48,60,72].map(n=>`<option value="${n}" ${draft.termMonths===n?'selected':''}>Cada ${n/12} años</option>`).join('')}</select><label class="toggle-row"><span>Libertad de expresión<small>Condición descrita en las reglas</small></span><input type="checkbox" data-policy="expression" ${draft.expression?'checked':''} ${locked?'disabled':''}></label><label class="toggle-row"><span>Revisión judicial<small>Condición descrita en las reglas</small></span><input type="checkbox" data-policy="judicialReview" ${draft.judicialReview?'checked':''} ${locked?'disabled':''}></label>`;
  else content=`<label class="field-label" for="seed">Código de acontecimientos</label><input id="seed" type="number" min="0" max="4294967295" step="1" value="${exp.seed}" ${activeBranch().state.month>0||exp.comparisonActive||busy?'disabled':''}><p class="tiny">Este número permite repetir la misma secuencia de acontecimientos externos. Con los mismos datos, reglas, configuración y código, la simulación se puede reproducir. Las alternativas comparadas comparten esos acontecimientos para que puedas examinar sus diferencias.</p>${exp.comparisonActive?`<label class="field-label" for="name-a">Nombre de ${esc(branchName('A'))}</label><input id="name-a" data-scenario-name="A" maxlength="60" value="${esc(branchName('A'))}"><label class="field-label" for="name-b">Nombre de ${esc(branchName('B'))}</label><input id="name-b" data-scenario-name="B" maxlength="60" value="${esc(branchName('B'))}">`:''}<details class="advanced-details"><summary>Detalles técnicos</summary><p>Semilla aleatoria: ${exp.seed}. Modelo ${MODEL_VERSION}; datos ${esc(dataset.version)}. La misma semilla con configuraciones diferentes no implica resultados idénticos.</p></details><button data-action="export" class="full-button">${icon('download')} Exportar simulación</button><button data-action="import" class="full-button">${icon('upload')} Importar simulación</button>`;
  const tabs=[['economy','Economía'],['institutions','Instituciones'],['advanced','Opciones avanzadas']];
  return `<aside class="panel config-panel"><div class="panel-heading"><div><span class="eyebrow">CONFIGURACIÓN</span><h2>${esc(exp.comparisonActive?branchName(id):'Tu simulación')}</h2></div>${icon('sliders')}</div><button data-action="wizard" class="wizard-launch">Volver a configurar con preguntas</button>${exp.comparisonActive?`<div class="compare-source"><label for="compare-source">Crear comparación desde</label><select id="compare-source"><option value="A" ${compareSourceId==='A'?'selected':''}>${esc(branchName('A'))} · ${esc(dateLabel(exp.base.year,exp.a.state.month))}</option><option value="B" ${compareSourceId==='B'?'selected':''}>${esc(branchName('B'))} · ${esc(dateLabel(exp.base.year,exp.b.state.month))}</option></select></div>`:''}<div class="config-tabs" role="tablist" aria-label="Configuración">${tabs.map(([tab,label])=>`<button role="tab" aria-selected="${configTab===tab}" data-config-tab="${tab}" class="${configTab===tab?'active':''}">${label}</button>`).join('')}</div><div class="config-content">${content}</div><div id="axis" class="axis-card">${axis()}</div><div class="config-actions"><button data-action="compare" class="full-button">Comparar otra configuración</button><button data-action="reset" class="full-button">Nueva simulación</button></div></aside>`;
}
function metricNumber(b:Experiment['a'],key:Metric):number {
  const state=b.state;
  if(key==='gdp')return state.gdpReal;if(key==='purchasingPower')return b.history.at(-1)!.purchasingPower;
  if(key==='inflation')return state.inflation*100;if(key==='unemployment')return state.unemployment*100;
  if(key==='debtRatio')return state.debt/state.gdpNominal*100;return state.investment;
}
function metricFormat(key:Metric,value:number):string {return key==='purchasingPower'?`${num(value,0)} €`:key==='inflation'||key==='unemployment'||key==='debtRatio'?`${num(value,1)} %`:num(value,1);}
function kpi(title:string,key:Metric,primary:Experiment['a'],other?:Experiment['a']):string {
  const value=metricFormat(key,metricNumber(primary,key)),first=primary.history[0]!,last=primary.history.at(-1)!;
  const start=key==='debtRatio'?first.debtRatio:key==='investment'?first.investment:first[key],end=key==='debtRatio'?last.debtRatio:key==='investment'?last.investment:last[key];
  const change=start!==0?(end/start-1)*100:undefined,delta=end-start;
  const directional=key==='gdp'||key==='purchasingPower'||key==='unemployment';
  const status=!directional||delta===0?'neutral':(key==='unemployment'?delta<0:delta>0)?'good':'bad';
  const changeLabel=change===undefined?'—':key==='unemployment'||key==='inflation'||key==='debtRatio'?`${signed(delta,1)} pp desde el inicio`:`${signed(change,1)} % desde el inicio`;
  const changeLine=primary.state.month?`<div class="kpi-change ${status}" aria-label="Cambio desde el inicio: ${changeLabel}">${changeLabel}</div>`:'';
  const secondary=other?`<div class="kpi-compare"><span>${esc(branchName(other.id))}: ${metricFormat(key,metricNumber(other,key))}</span><span class="delta">${key==='inflation'||key==='unemployment'||key==='debtRatio'?signed(metricNumber(other,key)-metricNumber(primary,key),1)+' pp':signed(metricNumber(other,key)-metricNumber(primary,key),1)}</span></div>`:'';
  const hints:Record<string,string>={gdp:'PIB simulado. Miles de millones de euros a precios del año de partida; ritmo anualizado, no acumulado desde enero.',purchasingPower:'Renta disponible ajustada por precios y población. Media de hogares simulados por persona y año; no es salario ni renta observada.',inflation:'Cambio de precios frente al mismo mes del año anterior. Una inflación menor no significa que los precios hayan bajado.',unemployment:'Personas sin empleo como porcentaje de la población activa, no de toda la población.',debtRatio:'Existencia de deuda al cierre dividida por el PIB nominal anualizado del periodo.',investment:'Flujo de inversión a ritmo anualizado, en miles de millones de euros constantes del año de partida.'};
  return `<article class="kpi"><div class="kpi-label">${title.toLocaleUpperCase('es')}</div><div class="kpi-main ${status}">${value}</div>${changeLine}${secondary}<p class="kpi-unit">${esc(hints[key]||'')}</p></article>`;
}
function mainDashboard():string {
  const primaryId=exp.primaryId||'B',primary=branch(primaryId),other=branch(primaryId==='A'?'B':'A'),paired=!!exp.comparisonActive;
  const cards=kpi('Producción económica','gdp',primary,paired?other:undefined)+kpi('Capacidad de compra','purchasingPower',primary,paired?other:undefined)+kpi('Precios (inflación)','inflation',primary,paired?other:undefined)+kpi('Desempleo','unemployment',primary,paired?other:undefined);
  const start=primary.history[0]!,last=primary.history.at(-1)!;
  const metricStart=metric==='debtRatio'?start.debtRatio:metric==='investment'?start.investment:start[metric],metricEnd=metric==='debtRatio'?last.debtRatio:metric==='investment'?last.investment:last[metric];
  const metricPct=metricStart!==0?(metricEnd/metricStart-1)*100:undefined,metricDelta=metricEnd-metricStart;
  const metricStatus=metric==='gdp'||metric==='purchasingPower'||metric==='unemployment'?(metricDelta===0?'neutral':(metric==='unemployment'?metricDelta<0:metricDelta>0)?'good':'bad'):'neutral';
  const metricChange=metric==='unemployment'||metric==='inflation'||metric==='debtRatio'?`${signed(metricDelta,1)} pp desde el inicio`:metricPct===undefined?'—':`${signed(metricPct,1)} % desde el inicio`;
  const gdpChange=start.gdp!==0?(last.gdp/start.gdp-1)*100:undefined,unemploymentChange=last.unemployment-start.unemployment;
  const insights=primary.state.month?`<p class="trend-summary" data-testid="trend-summary">Desde el inicio, la producción cambia ${gdpChange===undefined?'—':`${signed(gdpChange,1)} %`} y el desempleo ${signed(unemploymentChange,1)} puntos porcentuales.</p>`:'<p class="trend-summary">Avanza la simulación para observar cómo evolucionan los indicadores desde los datos de partida.</p>';
  return `<div class="workspace">${insights}<p class="color-legend">El verde y el rojo muestran la dirección desde el inicio en producción, capacidad de compra y desempleo. Los demás indicadores muestran su variación sin valoración.</p><section class="kpi-grid">${cards}</section>${primary.state.constraints.length?`<div class="notice compact" role="status">Límite numérico del modelo: ${esc(primary.state.constraints.join(' '))} Los números finitos no garantizan que el escenario sea plausible.</div>`:''}<section class="panel chart-panel"><div class="chart-heading"><div><span class="eyebrow">EVOLUCIÓN DE LA SIMULACIÓN</span><h2>${paired?'Dos posibilidades desde la misma situación':'Tu simulación'}</h2></div><button data-action="csv" class="icon-button" aria-label="Exportar serie comparativa CSV" title="Exportar serie CSV">${icon('download')}</button></div>${paired?`<div class="scenario-names"><strong>${esc(branchName(primaryId))}</strong><strong>${esc(branchName(primaryId==='A'?'B':'A'))}</strong></div>`:''}<div class="metric-tabs" role="tablist" aria-label="Indicador del gráfico">${Object.entries(METRICS).map(([key,m])=>`<button role="tab" aria-selected="${metric===key}" data-metric="${key}" class="${metric===key?'active':''}">${esc(m.label)}</button>`).join('')}</div>${primary.state.month?`<p class="metric-change ${metricStatus}">${esc(metricChange)}</p>`:''}${renderChart(exp,metric)}<div class="chart-footer"><span>Datos de partida: ${exp.base.year} · ${esc(METRICS[metric].unit)}</span><span>Código ${exp.seed} · ${monthText(primary.state.month)}</span></div><details class="data-disclosure"><summary>Ver valores exactos del gráfico en tabla</summary><div class="table-scroll"><table><thead><tr><th>Periodo</th>${paired?`<th>${esc(branchName(primaryId))}</th><th>${esc(branchName(primaryId==='A'?'B':'A'))}</th>`:`<th>${esc(branchName(primaryId))}</th>`}</tr></thead><tbody>${primary.history.map((point,i)=>`<tr><td>${esc(dateLabel(exp.base.year,point.month,true))}</td><td>${num(point[metric],metric==='purchasingPower'?0:2)}</td>${paired?`<td>${num(other.history[i]![metric],metric==='purchasingPower'?0:2)}</td>`:''}</tr>`).join('')}</tbody></table></div></details></section><div class="lower-grid">${countryPanel()}${feedPanel()}</div>${householdPanel()}${tracePanel()}</div>`;
}
function countryPanel():string {
  const id=exp.primaryId||'B',selected=branch(id),s=selected.state,v=exp.base.values;
  const activeShare=(v.employed!/(1-v.unemployment!))/v.population!,employed=s.population*activeShare*(1-s.unemployment),p=selected.policy;
  return `<section class="panel country-panel"><span class="eyebrow">DATOS Y RESULTADOS · ${esc(branchName(id))}</span><h2>España simulada</h2><div class="country-row"><span>Población simulada</span><strong>${num(s.population/1e6,2)} millones de personas</strong></div><div class="country-row"><span>Personas ocupadas simuladas</span><strong>${num(employed/1e6,2)} millones</strong></div><div class="country-row"><span>Deuda al cierre</span><strong>${num(s.debt,1)} miles de millones de euros</strong></div><div class="country-row"><span>Deuda / PIB nominal anualizado</span><strong>${num(s.debt/s.gdpNominal*100,1)} %</strong></div><div class="country-row"><span>Saldo fiscal anualizado</span><strong>${signed(-s.deficit,1)} miles de millones de euros</strong></div><p class="tiny">Stocks al cierre y flujos anualizados son magnitudes distintas. Valores simulados, no estadísticas oficiales.</p><div class="institution-summary"><h3>Procedimientos descritos</h3><p>${p.elections==='competitive'?'Competencia electoral':p.elections==='single-party'?'Selección dentro de un partido':'Designación'} · cada ${p.termMonths/12} años</p><p class="tiny">Estos controles producen procedimientos y eventos narrativos; no tienen efectos económicos cuantificados.</p></div></section>`;
}
function feedPanel():string {
  const selected=branch(exp.primaryId||'B'),events=[...selected.events].reverse().slice(0,30);
  return `<section class="panel feed-panel"><div class="feed-heading"><div><span class="eyebrow">EVENTOS · ${esc(branchName(selected.id))}</span><h2>Qué va ocurriendo</h2></div><span class="fiction-badge">SIMULADOS</span></div><div class="feed-list">${events.length?events.map(e=>`<article class="event"><div class="event-head"><i class="event-dot ${e.type}"></i><time>${esc(dateLabel(exp.base.year,e.month,true))}</time><span>${{external:'EXTERNO',economy:'ECONOMÍA',institution:'PROCEDIMIENTO',warning:'LÍMITE'}[e.type]}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p><button class="text-button" data-event="${esc(e.id)}">Ver cómo se generó ${icon('arrow',14)}</button></article>`).join(''):`<div class="empty-feed"><h3>La simulación comienza al avanzar.</h3><p>Los eventos se generan con reglas fijas; no son noticias reales.</p></div>`}</div><div class="feed-footer">No se simulan ganadores electorales ni sucesos reales.</div></section>`;
}
function householdPanel():string {
  const id=exp.primaryId||'B',selected=branch(id),other=branch(id==='A'?'B':'A'),paired=!!exp.comparisonActive;
  return `<section class="panel household-panel"><div><span class="eyebrow">HOGARES SIMULADOS</span><h2>Capacidad de compra por grupo</h2><p class="muted">Renta disponible real por persona y año. Grupos sintéticos; no son deciles ni salarios observados.</p></div><div class="table-scroll"><table><thead><tr><th>Grupo</th><th>Parte de la población</th><th>${esc(branchName(id))}</th>${paired?`<th>${esc(branchName(id==='A'?'B':'A'))}</th>`:''}</tr></thead><tbody>${selected.state.households.map((h,i)=>`<tr><td>${esc(h.label)}</td><td>${num(h.populationShare*100,0)} %</td><td>${num(h.realPerPerson,0)} euros/persona/año</td>${paired?`<td>${num(other.state.households[i]!.realPerPerson,0)} euros/persona/año</td>`:''}</tr>`).join('')}</tbody></table></div></section>`;
}
function tracePanel():string {
  const chosen=exp.comparisonActive?traceBranch:(exp.primaryId||'B'),current=branch(chosen),traces=current.state.trace,tr=traces.find(t=>t.id===selectedTrace)||traces[0];
  return `<section id="causes" class="panel trace-panel"><div class="chart-heading"><div><span class="eyebrow">MECANISMOS · ÚLTIMO PASO</span><h2>Cómo se obtuvo este resultado</h2></div>${exp.comparisonActive?`<select id="trace-branch" aria-label="Trayectoria explicada"><option value="${chosen}">${esc(branchName(chosen))}</option><option value="${chosen==='A'?'B':'A'}">${esc(branchName(chosen==='A'?'B':'A'))}</option></select>`:`<span>${esc(branchName(chosen))}</span>`}</div>${tr?`<div class="mechanism-tabs">${traces.map(t=>`<button data-trace="${t.id}" class="${t.id===tr.id?'active':''}">${esc(t.title)}</button>`).join('')}</div><div class="trace-content"><span class="method-badge">${tr.assumption?'MECANISMO SIMPLIFICADO':'IDENTIDAD CONTABLE'}</span><h3>${esc(tr.title)}</h3><code>${esc(tr.equation)}</code><p>${esc(tr.explanation)}</p><div class="trace-inputs">${Object.entries(tr.inputs).map(([k,v])=>`<div><span>${esc(k)}</span><strong>${num(v,4)}</strong></div>`).join('')}<div class="trace-result"><span>Resultado · ${esc(tr.unit)}</span><strong>${num(tr.result,4)}</strong></div></div></div>`:`<p class="empty-trace">Avanza un mes para ver los mecanismos y sus entradas.</p>`}</section>`;
}
function modelPage():string {
  return `<div class="page-body"><section class="panel prose"><span class="eyebrow">MODELO ${MODEL_VERSION}</span><h2>Las reglas est\u00e1n a la vista.</h2><p>POLIS es un laboratorio exploratorio, no un predictor ni una demostraci\u00f3n de qu\u00e9 sistema pol\u00edtico es preferible. Parte de agregados espa\u00f1oles observados y utiliza mecanismos de comportamiento <strong>todav\u00eda no calibrados causalmente</strong>.</p><div class="flow"><div>Impuestos y<br>transferencias</div><span>\u2192</span><div>Renta y<br>consumo</div><span>\u2192</span><div>Demanda y<br>producci\u00f3n</div><span>\u2192</span><div>Precios y<br>empleo</div></div><div class="flow"><div>Costes de<br>inversi\u00f3n</div><span>\u2192</span><div>Inversi\u00f3n<br>realizada</div><span>\u2192</span><div>Capital del<br>siguiente mes</div><span>\u2192</span><div>Capacidad<br>productiva</div></div><h3>Qu\u00e9 calcula y qu\u00e9 no</h3><p>El motor tiene un sector productivo agregado, tres grupos de hogares sint\u00e9ticos, una cuenta p\u00fablica y un exterior simplificado. Conserva las identidades de demanda, renta disponible, deuda neta y capital. <strong>No es un modelo stock-flow consistent completo:</strong> no se cierran todos los balances bancarios, empresariales y exteriores.</p><p>Los impuestos directos cambian la renta disponible a ingresos constantes. Los tipos al consumo modifican el nivel de precios al consumidor. La rentabilidad neta y la fricci\u00f3n de invertir afectan a la inversi\u00f3n privada, que modifica capacidad con retardo. Las magnitudes de esas respuestas son hip\u00f3tesis editables en el c\u00f3digo, no resultados impuestos por una etiqueta.</p><p>Las reglas electorales, la libertad de expresi\u00f3n y la revisi\u00f3n judicial generan eventos o descripciones, <strong>sin efectos econ\u00f3micos cuantificados</strong>. No se modelan guerras, salida del euro, nacionalizaciones, transiciones constitucionales, corrupci\u00f3n, innovaci\u00f3n end\u00f3gena ni ganadores electorales.</p><h3>Interpretaci\u00f3n temporal</h3><p>La fotograf\u00eda inicial combina flujos del ejercicio y stocks a su cierre con fechas visibles. El primer mes simulado es enero del a\u00f1o siguiente. Los flujos mensuales se muestran a <strong>ritmo anualizado</strong>; no son el PIB anual realmente acumulado. La memoria inicial de precios se interpola geom\u00e9tricamente a partir de diciembre/diciembre.</p><p>Las medidas econ\u00f3micas se aplican en el primer paso de la rama, conservando deuda, poblaci\u00f3n y capital. No se modela un coste integral de transformaci\u00f3n del r\u00e9gimen. Los efectos del capital y de la producci\u00f3n incorporan retardos.</p><h3>Par\u00e1metros expl\u00edcitos</h3><div class="table-scroll"><table><thead><tr><th>Mecanismo</th><th>Valor</th><th>Alcance</th></tr></thead><tbody>${ASSUMPTIONS.map(([name,value,note])=>`<tr><td>${esc(name)}</td><td>${esc(value)}</td><td>${esc(note)}</td></tr>`).join('')}</tbody></table></div><h3 id="axis-method">El eje izquierda \u2013 centro \u2013 derecha</h3><p>Es una <strong>coordenada econ\u00f3mica descriptiva experimental</strong>, no una evaluaci\u00f3n de sistemas ni una clasificaci\u00f3n de partidos. Se normalizan impuestos directos, progresividad, transferencias e inversi\u00f3n p\u00fablica entre sus m\u00ednimos y m\u00e1ximos; las cuatro dimensiones pesan lo mismo. La coordenada es uno menos su media.</p><code>proximidad = 100 * (1 - abs(coordenada - referencia))</code><p>Las referencias sint\u00e9ticas son 0, 0,5 y 1. Los tres porcentajes <strong>no son probabilidades, no tienen que sumar 100 y no representan certeza</strong>. Ni la barra ni sus etiquetas se utilizan para calcular econom\u00eda. Una misma media puede ocultar combinaciones diferentes: se mantienen visibles los cuatro controles. No incorpora la dimensi\u00f3n cultural ni constituye una taxonom\u00eda universal.</p><h3>Incertidumbre y dominio</h3><p>Una semilla produce una trayectoria. No se muestran intervalos estad\u00edsticos inventados. Los l\u00edmites de inflaci\u00f3n, paro y capacidad aparecen como avisos cuando se alcanzan; no equivalen a garant\u00edas del mundo real. Veinte a\u00f1os es un l\u00edmite t\u00e9cnico de exploraci\u00f3n, no un horizonte predictivo defendible.</p><h3>Datos locales y privacidad</h3><p>No hay cuentas, telemetr\u00eda, cookies de seguimiento, claves secretas ni llamadas a servicios de IA. El c\u00e1lculo ocurre en un worker del navegador. La sesi\u00f3n se conserva en IndexedDB cuando est\u00e1 disponible y puede exportarse. Al ocultar la pesta\u00f1a se pausa; un paso ya enviado puede terminar. No se recupera tiempo transcurrido con la aplicaci\u00f3n cerrada.</p></section></div>`;
}
function sourcesPage():string {
  const observations=exp.base.observations;
  return `<div class="page-body"><section class="panel prose"><span class="eyebrow">DATOS Y PROCEDENCIA</span><h2>Una fotograf\u00eda fechada, no una caja negra.</h2><div class="source-summary"><div><span>Ejercicio seleccionado</span><strong>${exp.base.year}</strong></div><div><span>Variables imprescindibles</span><strong>${observations.length} / ${observations.length}</strong></div><div><span>Revisi\u00f3n del cat\u00e1logo</span><strong>${esc(dataset.reviewed)}</strong></div></div><p>El selector toma el \u00faltimo a\u00f1o con todas las variables imprescindibles no proyectadas. Usa la publicaci\u00f3n m\u00e1s reciente de cada serie dentro del cat\u00e1logo y comprueba que los componentes del PIB concilian. <strong>No consulta fuentes en directo</strong> al abrir una partida. Una nueva publicaci\u00f3n requiere revisar el cat\u00e1logo y desplegar una nueva versi\u00f3n.</p><p>Versi\u00f3n fijada: <code>${esc(dataset.version)}</code>. Los stocks de poblaci\u00f3n a 1 de enero del ejercicio siguiente se utilizan como cierre sin cambiar su fecha. Las estad\u00edsticas de encuesta y de cuentas nacionales conservan su car\u00e1cter estimado.</p><div class="table-scroll source-table"><table><thead><tr><th>Variable</th><th>Valor original</th><th>Referencia</th><th>Naturaleza</th><th>Fuente</th></tr></thead><tbody>${observations.map(o=>`<tr><td><strong>${esc(o.label)}</strong><small>${esc(o.note)}</small></td><td>${num(o.value,o.unit==='fraccion'?4:o.unit==='personas'?0:3)}<small>${esc(o.unit)}</small></td><td>${esc(o.referencePeriod)}</td><td><span class="tag">${o.kind==='observed'?'Observado':'Estimado por fuente'}</span></td><td><a href="${esc(o.source)}" target="_blank" rel="noopener noreferrer">${esc(o.sourceTitle)} \u2197</a><small>Publicaci\u00f3n: ${esc(o.published)}</small></td></tr>`).join('')}</tbody></table></div><h3>Lo que los datos no aportan por s\u00ed solos</h3><p>La distribuci\u00f3n de renta entre grupos, las tasas fiscales efectivas sint\u00e9ticas, el stock inicial de capital y los coeficientes de respuesta son hip\u00f3tesis del modelo. No proceden de estas series. La ratio deuda/PIB se recalcula con el saldo redondeado y el PIB de la revisi\u00f3n seleccionada; puede diferir de la ratio de otra publicaci\u00f3n.</p><p>Se ha detectado una discrepancia entre el saldo vegetativo mencionado en el encabezamiento de la nota de nacimientos/defunciones y la resta de sus recuentos. Se utilizan los recuentos de la tabla y su resta expl\u00edcita. No se utiliza ese titular como dato.</p></section></div>`;
}
function dialog():string {
  if(!pendingDialog)return '';
  const isCompare=pendingDialog==='compare';
  const source=branch(compareSourceId),targetId=compareSourceId==='A'?'B':'A',date=dateLabel(exp.base.year,source.state.month);
  const title=isCompare?'Comparar otra configuración':'Crear nueva simulación';
  const message=isCompare?exp.comparisonActive?`Conservaremos «${branchName(compareSourceId)}» y sustituiremos «${branchName(targetId)}» por una copia desde su estado en ${date}. Se mantendrán historia, deuda, población, capital, precios, código de acontecimientos y calendario institucional. Los cambios que configures se aplicarán desde el paso siguiente.`:`Conservaremos «${branchName(compareSourceId)}» y crearemos otra desde ${date} para que pruebes otros cambios.`:`Se descartará el progreso y las comparaciones actuales si confirmas. La nueva simulación usará la configuración de partida del catálogo y conservará el código de acontecimientos ${exp.seed}. Puedes exportar antes.`;
  return `<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" class="modal"><h2 id="dialog-title">${title}</h2><p>${message}</p>${isCompare&&exp.comparisonActive?`<p>Origen: <strong>${esc(branchName(compareSourceId))}</strong>. Trayectoria que se sustituye: <strong>${esc(branchName(targetId))}</strong>.</p>`:''}<p class="muted">${isCompare?'La creación no avanza el tiempo. Las nuevas reglas se aplican en el siguiente paso.':'Los datos observados y el año de partida proceden del catálogo actual.'}</p><div class="modal-actions"><button data-action="cancel-dialog">Cancelar</button><button data-action="export">Exportar</button><button class="primary" data-action="confirm-dialog">${isCompare?'Crear comparación':'Crear nueva simulación'}</button></div></section></div>`;
}
function introBlock():string {
  if(setupGuidanceOpen)return `<section class="welcome-intro" aria-labelledby="welcome-title"><button class="intro-dismiss" data-action="dismiss-intro" aria-label="Ocultar esta ayuda">×</button><h2 id="welcome-title">Ya tienes una configuración inicial</h2><p>Para volver a responder las preguntas, usa <strong>«Volver a configurar con preguntas»</strong> en el panel Configuración. Para ajustar el sistema a mano, cambia los controles de ese panel; los cambios se aplican al instante.</p><div class="intro-actions"><button class="primary" data-action="wizard">Volver a responder las preguntas</button><button data-action="dismiss-intro">Ajustar los controles manualmente</button></div></section>`;
  return `<section class="welcome-intro" aria-labelledby="welcome-title"><button class="intro-dismiss" data-action="dismiss-intro" aria-label="Ocultar introducción">×</button><h2 id="welcome-title">Antes de empezar</h2><p>POLIS te permite probar distintas decisiones sobre impuestos, ayudas, servicios públicos e inversión y observar cómo evoluciona una España simulada. Partes de datos reales, eliges una configuración y avanzas en el tiempo para seguir los cambios en los precios, el empleo, la producción y la capacidad de compra de los hogares. Puedes empezar con ayuda de unas preguntas o ajustar los controles directamente. También puedes comparar dos alternativas desde la misma situación. Los resultados dependen de las reglas del simulador: sirven para explorar posibilidades, no para predecir qué ocurrirá.</p><div class="intro-actions"><button class="primary" data-action="wizard">Configurar con preguntas</button><button data-action="dismiss-intro">Ajustar los controles directamente</button><button class="text-button" data-tab="model">Cómo funciona</button></div></section>`;
}
function wizardPage():string {
  if(wizardStep<0)return `<div class="page-body wizard-page"><section class="panel guided-setup" aria-labelledby="wizard-intro-title"><h2 id="wizard-intro-title">¿Quieres saber cómo funcionaría España si tú tomaras las decisiones?</h2><p class="wizard-explanation wizard-intro-copy">Este proyecto ayuda a visualizar cómo puede evolucionar España gracias a simulaciones que puedes configurar. En función de cómo equilibres impuestos e inversión pública, así evolucionarán la producción, los precios, el empleo y la capacidad de compra. Es una manera de poner a prueba si tus convicciones políticas y económicas funcionan o no.</p><p class="wizard-explanation wizard-intro-copy">Te haremos seis preguntas para convertir lo que te importa en opciones concretas del simulador. No hay respuestas correctas y no hace falta saber economía. Al final, podrás revisar la configuración antes de empezar. Después podrás volver a responder o cambiar los controles a mano.</p><div class="wizard-actions"><button data-action="wizard-cancel">Volver al simulador</button><button class="primary" data-action="wizard-next">Empezar las preguntas</button></div></section></div>`;
  if(wizardStep<WIZARD_QUESTIONS.length){
    const q=WIZARD_QUESTIONS[wizardStep]!,chosen=wizardAnswered[wizardStep]?wizardAnswers[wizardStep]:undefined;
    return `<div class="page-body wizard-page"><section class="panel guided-setup"><div class="wizard-kicker"><span class="eyebrow">CONFIGURACIÓN GUIADA</span><span class="wizard-count">Pregunta ${wizardStep+1} de ${WIZARD_QUESTIONS.length}</span></div><div class="wizard-progress" role="progressbar" aria-label="Progreso de las preguntas" aria-valuemin="1" aria-valuemax="${WIZARD_QUESTIONS.length}" aria-valuenow="${wizardStep+1}"><i style="width:${(wizardStep+1)/WIZARD_QUESTIONS.length*100}%"></i></div><h2>${q.prompt}</h2><p class="wizard-explanation">${q.explanation}</p><div role="radiogroup" aria-label="${esc(q.prompt)}" class="wizard-options">${q.options.map(choice=>`<button type="button" role="radio" aria-checked="${wizardAnswered[wizardStep]&&chosen===choice.value}" data-wizard-value="${choice.value===null?'keep':choice.value}" class="wizard-choice${wizardAnswered[wizardStep]&&chosen===choice.value?' active':''}"><strong>${esc(choice.label)}</strong><small>${esc(wizardChoiceDetail(exp.base,q,choice))}</small></button>`).join('')}</div><p class="wizard-footnote">Unidad: ${esc(q.unit)}. Las respuestas describen reglas del simulador; no anticipan un resultado.</p><div class="wizard-actions"><button data-action="wizard-cancel">Cancelar</button><button data-action="wizard-back" ${wizardStep===0?'disabled':''}>Anterior</button><button class="primary" data-action="wizard-next" ${!wizardAnswered[wizardStep]?'disabled':''}>${wizardStep===WIZARD_QUESTIONS.length-1?'Ver resumen':'Siguiente'}</button></div></section></div>`;
  }
  const summary=WIZARD_QUESTIONS.map((q,i)=>{const choice=q.options.find(item=>item.value===wizardAnswers[i]);return `<li><span>${esc(labels[q.key]?.label||q.key)}</span><strong>${esc(choice?.label||'')}</strong><small>${esc(choice?wizardChoiceDetail(exp.base,q,choice):'')}</small></li>`;}).join('');
  return `<div class="page-body wizard-page"><section class="panel guided-setup"><div class="wizard-kicker"><span class="eyebrow">RESUMEN DE TU CONFIGURACIÓN</span><span class="wizard-count">6 respuestas</span></div><h2>Así quedará tu simulación</h2><p class="wizard-explanation">Revisa los valores y su referencia. Puedes volver a cambiar las respuestas o ajustar estos controles después.</p><ul class="wizard-summary">${summary}</ul><p class="wizard-footnote">Las respuestas «Punto de partida» conservan internamente los valores con su precisión completa. Al comenzar, la simulación se reproducirá automáticamente; podrás pausarla cuando quieras.</p><div class="wizard-actions"><button data-action="wizard-back">Cambiar respuestas</button><button data-action="wizard-cancel">Cancelar</button><button class="primary" data-action="wizard-start">Comenzar y reproducir</button></div></section></div>`;
}
function aboutPage():string {
  return `<div class="page-body"><section class="panel prose"><span class="eyebrow">ACERCA DE POLIS</span><h2>Un simulador para explorar posibilidades</h2><p>POLIS permite probar configuraciones económicas sobre una simulación de España. Parte de un catálogo con datos observados o estimados por sus fuentes; la distribución de hogares, algunos stocks y las reglas de respuesta son hipótesis del modelo.</p><h3>Qué puedes probar</h3><p>Impuestos, ayudas y transferencias, servicios públicos, inversión y algunos procedimientos institucionales. Estos últimos generan descripciones y eventos; hoy no tienen efectos económicos cuantificados.</p><h3>Cómo leer los resultados</h3><p>Los indicadores muestran resultados calculados por mecanismos simplificados. No son predicciones, efectos causales demostrados ni recomendaciones. Un límite numérico o una trayectoria finita tampoco demuestra que un escenario sea plausible.</p><h3>Privacidad y almacenamiento</h3><p>Los cálculos ocurren localmente en el navegador. La configuración se guarda en IndexedDB de este navegador cuando está disponible; no se sincroniza. Exporta una copia si quieres conservarla.</p><h3>Versiones</h3><p>Aplicación ${MODEL_VERSION}. La versión de datos y la fecha de revisión se detallan en <a href="#sources" data-tab="sources" class="inline-link">Datos y fuentes</a>; las ecuaciones, unidades y supuestos están en <a href="#model" data-tab="model" class="inline-link">Cómo funciona</a>.</p></section></div>`;
}
function reconcileChildren(current:Node,desired:Node):void {
  const oldChildren=current.childNodes,newChildren=desired.childNodes;
  for(let i=0;i<newChildren.length;i++){
    const incoming=newChildren[i]!,existing=oldChildren[i];
    if(!existing){current.appendChild(incoming.cloneNode(true));continue;}
    if(existing.nodeType!==incoming.nodeType||existing.nodeName!==incoming.nodeName){current.replaceChild(incoming.cloneNode(true),existing);continue;}
    if(existing.nodeType===Node.TEXT_NODE){if(existing.nodeValue!==incoming.nodeValue)existing.nodeValue=incoming.nodeValue;continue;}
    if(existing.nodeType!==Node.ELEMENT_NODE)continue;
    const oldElement=existing as Element,newElement=incoming as Element;
    for(const attr of [...oldElement.attributes])if(!newElement.hasAttribute(attr.name))oldElement.removeAttribute(attr.name);
    for(const attr of [...newElement.attributes])if(oldElement.getAttribute(attr.name)!==attr.value)oldElement.setAttribute(attr.name,attr.value);
    if(oldElement instanceof HTMLInputElement&&document.activeElement!==oldElement){
      if(oldElement.type==='checkbox'||oldElement.type==='radio')oldElement.checked=(newElement as HTMLInputElement).checked;
      else oldElement.value=(newElement as HTMLInputElement).value;
    }else if(oldElement instanceof HTMLSelectElement&&document.activeElement!==oldElement)oldElement.value=(newElement as HTMLSelectElement).value;
    reconcileChildren(oldElement,newElement);
  }
  while(current.childNodes.length>newChildren.length)current.lastChild?.remove();
}
function patchHtml(markup:string):void {
  patchElementHtml(root,markup);
}
function patchElementHtml(target:Element,markup:string):void {
  const template=document.createElement('template');template.innerHTML=markup;
  reconcileChildren(target,template.content);
}
function render():void {
  if(!exp)return;
  const scrolls=[...document.querySelectorAll<HTMLElement>('.config-content,.feed-list')].map(e=>[e.className,e.scrollTop] as const);
  const tabs:[string,string,string][]=[['lab','Simulador','chart'],['model','Cómo funciona','book'],['sources','Datos y fuentes','globe'],['about','Acerca de','info']];
  let page='';
  if(currentTab==='lab')page=`<section class="hero"><div><h1>¿Qué pasaría en España con otras decisiones?</h1><p>Prueba una configuración, avanza el tiempo y observa sus resultados.</p></div><div class="country-badge"><span class="spain-flag" aria-hidden="true"></span><div class="country-copy"><strong>España</strong><span>Datos de partida: ${exp.base.year}</span></div><a href="#sources" data-tab="sources" class="country-source-link">Ver datos y fuentes ${icon('chevron',15)}</a></div></section>${introOpen?introBlock():''}<section class="timebar"><div id="time-controls">${timeControls()}</div><button data-action="reset" class="icon-button" aria-label="Crear nueva simulación" title="Nueva simulación">${icon('reset')}</button></section><div class="lab-layout">${configPanel()}${mainDashboard()}</div>`;
  else if(currentTab==='model')page=modelPage();else if(currentTab==='sources')page=sourcesPage();else if(currentTab==='about')page=aboutPage();else page=wizardPage();
  patchHtml(`<header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-mark">S</span><strong>SIMULA TU PAÍS</strong></a><nav id="primary-navigation" class="${mobileMenuOpen?'menu-open':''}" aria-label="Secciones">${tabs.map(([id,label,ico])=>`<button aria-current="${currentTab===id||currentTab==='wizard'&&id==='lab'?'page':'false'}" data-tab="${id}" class="${currentTab===id||currentTab==='wizard'&&id==='lab'?'active':''}">${icon(ico,15)}${label}</button>`).join('')}${saveControl()}</nav><button class="mobile-menu-toggle" type="button" data-action="menu-toggle" aria-controls="primary-navigation" aria-expanded="${mobileMenuOpen}" aria-label="${mobileMenuOpen?'Cerrar menú':'Abrir menú'}"><span></span><span></span><span></span></button></header><main>${page}<footer><span>POLIS · aplicación ${MODEL_VERSION} · modelo ${MODEL_VERSION} · catálogo ${esc(dataset.version)} · revisión ${esc(dataset.reviewed)}</span><button data-action="export">Exportar simulación ${icon('download',14)}</button></footer></main><input type="file" id="import-file" accept="application/json,.json" hidden>${dialog()}`);
  for(const [cls,top]of scrolls){const e=document.getElementsByClassName(cls)[0];if(e)e.scrollTop=top;}
  if(pendingDialog)document.querySelector<HTMLButtonElement>('[data-action="cancel-dialog"]')?.focus();
  else if(dialogReturnFocus&&!busy){const origin=dialogReturnFocus;dialogReturnFocus=null;const target=document.querySelector<HTMLInputElement>('[data-policy]:not(:disabled)');if(target)target.focus();else restoreDialogFocus(origin);}
  installChartTooltip();
}
function installChartTooltip():void {
  const area=document.querySelector<HTMLElement>('#chart-area'),tip=document.querySelector<HTMLElement>('#chart-tip');if(!area||!tip)return;
  area.onpointermove=(event)=>{
    const id=exp.primaryId||'B',primary=branch(id),other=branch(id==='A'?'B':'A');if(!primary.state.month)return;
    const rect=area.getBoundingClientRect(),viewX=(event.clientX-rect.left)/rect.width*850;
    const month=Math.max(0,Math.min(primary.state.month,Math.round((viewX-84)/720*Math.max(12,primary.state.month))));
    const value=(b:Experiment['a'])=>num(b.history[month]![metric],METRICS[metric].decimals);
    tip.hidden=false;tip.textContent=exp.comparisonActive?`${dateLabel(exp.base.year,month,true)} · ${branchName(id)}: ${value(primary)} · ${branchName(id==='A'?'B':'A')}: ${value(other)}`:`${dateLabel(exp.base.year,month,true)} · ${branchName(id)}: ${value(primary)}`;
    tip.style.left=`${Math.max(8,Math.min(rect.width-300,event.clientX-rect.left-100))}px`;
  };area.onpointerleave=()=>{tip.hidden=true;};
}
async function applyDraft():Promise<void> {
  if(busy){if(playing)queuedLivePolicy={branchId:configuredBranchId,policy:{...draft}};return;}clearTimeout(timer);busy=true;document.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-policy]').forEach(el=>el.disabled=true);renderControls();
  const submitted={...draft},id=configuredBranchId;
  try{exp=await command('CONFIGURE',{branchId:id,policy:submitted});draft={...branch(id).policy};firstRunSetup=false;markConfigured();persist();}
  catch(e){showToast((e as Error).message,true);draft={...branch(id).policy};}
  finally{busy=false;render();schedule();}
}
function exportCSV():void {
  const metrics=Object.keys(METRICS) as Metric[],id=exp.primaryId||'B',primary=branch(id),other=branch(id==='A'?'B':'A'),paired=!!exp.comparisonActive;
  const rows=[['mes','periodo',...metrics.flatMap(k=>paired?[`${METRICS[k].label}_${branchName(id)}`,`${METRICS[k].label}_${branchName(id==='A'?'B':'A')}`]:[`${METRICS[k].label}_${branchName(id)}`])].join(';'),...primary.history.map((point,i)=>[point.month,dateLabel(exp.base.year,point.month,true),...metrics.flatMap(k=>paired?[point[k],other.history[i]![k]]:[point[k]])].join(';'))];
  download(`polis-serie-${exp.seed}-mes-${primary.state.month}.csv`,'\ufeff'+rows.join('\n'),'text/csv;charset=utf-8');
}
root.addEventListener('input',e=>{
  const el=e.target as HTMLInputElement,key=el.dataset.policy;
  if(key&&el.type==='range'){
    (draft as unknown as Record<string,unknown>)[key]=Number(el.value);const out=document.querySelector(`#out-${key}`);if(out)out.textContent=valueLabel(key,Number(el.value));
    const axisEl=document.querySelector('#axis');if(axisEl)axisEl.innerHTML=axis();
  }
});
root.addEventListener('change',e=>{
  const el=e.target as HTMLInputElement,key=el.dataset.policy;
  if(key){(draft as unknown as Record<string,unknown>)[key]=el.type==='checkbox'?el.checked:key==='elections'?el.value:Number(el.value);void applyDraft();return;}
  if(el.id==='speed'){speed=Number(el.value);schedule();}
  if(el.id==='trace-branch'){traceBranch=el.value as 'A'|'B';render();}
  if(el.id==='compare-source'){compareSourceId=el.value as 'A'|'B';}
  if(el.dataset.scenarioName){const id=el.dataset.scenarioName as 'A'|'B',value=el.value.trim().slice(0,60);if(value){exp={...exp,branchNames:{...(exp.branchNames||{A:'Simulación original',B:'Alternativa'}),[id]:value}};persist();render();}}
  if(el.id==='seed')void (async()=>{if(busy||pending.size||activeBranch().state.month>0||exp.comparisonActive)return;pause();busy=true;const seed=Number(el.value);try{exp=await command('INIT',{dataset,seed,policy:draft,primary:true});draft={...exp.b.policy};persist();}catch(err){showToast((err as Error).message,true);}finally{busy=false;render();}})();
  if(el.id==='import-file'&&el.files?.[0])void importFile(el.files[0]);
});
async function importFile(file:File):Promise<void> {
  pause();if(busy)return;
  if(file.size>100_000){showToast('La sesi\u00f3n supera el l\u00edmite de 100 KB.',true);return;}
  busy=true;
  try{const s:unknown=JSON.parse(await file.text());exp=await command('RESTORE',s);draft={...exp.b.policy};persist();showToast('Sesi\u00f3n importada y recalculada con el modelo fijado.');}
  catch(e){showToast((e as Error).message,true);}
  finally{busy=false;render();}
}
root.addEventListener('click',e=>{
  const el=(e.target as Element).closest<HTMLElement>('button,a');if(!el)return;
  const tab=el.dataset.tab,ct=el.dataset.configTab,mt=el.dataset.metric,tr=el.dataset.trace,eventId=el.dataset.event,wizardValue=el.dataset.wizardValue;
  if(tab){mobileMenuOpen=false;pause();if(currentTab==='lab'&&tab!=='lab'&&introOpen)dismissIntro();currentTab=tab==='lab'&&firstRunSetup?'wizard':tab as typeof currentTab;render();return;}
  if(ct){configTab=ct as typeof configTab;render();return;}
  if(mt){metric=mt as Metric;render();return;}
  if(tr){selectedTrace=tr;render();document.querySelector('#causes')?.scrollIntoView({block:'nearest'});return;}
  if(eventId){showEvent(eventId);return;}
  if(wizardValue!==undefined){const value=wizardValue==='keep'?null:Number(wizardValue);wizardAnswers[wizardStep]=value;wizardAnswered[wizardStep]=true;render();return;}
  if(el.id==='save-help'){e.preventDefault();toggleSaveHelp();return;}
  const action=el.dataset.action;if(!action)return;e.preventDefault();
  if(action==='menu-toggle'){mobileMenuOpen=!mobileMenuOpen;render();return;}
  if(action==='play'){if(playing){pause();renderControls();}else if(activeBranch().state.month<MAX_MONTHS){playing=true;renderControls();schedule();}}
  if(action==='step'){pause();renderControls();void advanceTime(1);}
  if(action==='year'){pause();renderControls();void advanceTime(12);}
  if(action==='export'){const month=activeBranch().state.month;download(`polis-sesion-${exp.seed}-mes-${month}.json`,JSON.stringify(exportSession(exp,datasetHash),null,2));}
  if(action==='import')document.querySelector<HTMLInputElement>('#import-file')?.click();
  if(action==='csv')exportCSV();
  if(action==='home'){mobileMenuOpen=false;pause();currentTab=firstRunSetup?'wizard':'lab';render();}
  if(action==='dismiss-intro'){dismissIntro();setupGuidanceOpen=false;firstRunSetup=false;markConfigured();currentTab='lab';render();}
    if(action==='wizard'){dismissIntro();wizardAnswers=Array(6).fill(null);wizardAnswered=Array(6).fill(true);wizardStep=-1;currentTab='wizard';render();}
  if(action==='wizard-cancel'){currentTab='lab';dismissIntro();setupGuidanceOpen=false;firstRunSetup=false;markConfigured();persist();render();}
  if(action==='wizard-back'){wizardStep=Math.max(-1,wizardStep-1);render();}
  if(action==='wizard-next'){if(wizardStep===-1||wizardAnswered[wizardStep]){wizardStep=Math.min(WIZARD_QUESTIONS.length,wizardStep+1);render();}}
  if(action==='wizard-start'){
    try{pendingPrimaryPolicy=wizardPolicy(exp.base,wizardAnswers);if(activeBranch().state.month>0||exp.comparisonActive){pendingDialog='reset';dialogReturnFocus=el;render();}else void startPrimary(pendingPrimaryPolicy,exp.seed);}
    catch(err){showToast((err as Error).message,true);}
  }
  if(action==='compare'||action==='reset'){
    pause();renderControls();if(busy||pending.size){showToast('Espera a que termine el paso de simulación antes de confirmar esta acción.');return;}
    compareSourceId=exp.primaryId||'B';dialogReturnFocus=el;pendingPrimaryPolicy=undefined;pendingDialog=action==='compare'?'compare':'reset';render();
  }
  if(action==='cancel-dialog'){pendingDialog='';pendingPrimaryPolicy=undefined;const origin=dialogReturnFocus;dialogReturnFocus=null;render();restoreDialogFocus(origin);}
  if(action==='confirm-dialog')void confirmDialog();
  if(action==='close-save-help'){toggleSaveHelp(false);document.querySelector<HTMLButtonElement>('#save-help')?.focus();}
});
document.addEventListener('click',e=>{
  if((e.target as Element).closest('.local-status-wrap'))return;
  toggleSaveHelp(false);
});
function showEvent(id:string):void {
  const event=[...exp.a.events,...exp.b.events].find(e=>e.id===id);if(!event)return;pause();renderControls();document.querySelector('#event-modal')?.remove();
  const selected=branch(event.branch),savedTrace=selected.state.month===event.month?selected.state.trace:undefined;
  const modal=document.createElement('div');modal.id='event-modal';modal.className='modal-backdrop';
  modal.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="event-modal-title" class="modal"><span class="eyebrow">EVENTO SIMULADO · ${esc(dateLabel(exp.base.year,event.month))}</span><h2 id="event-modal-title">${esc(event.title)}</h2><p>${esc(event.text)}</p><h3>Mecanismos registrados</h3><p>${event.mechanisms.map(id=>`<code>${esc(id)}</code>`).join(' → ')}</p><p class="tiny">${savedTrace?'Las entradas corresponden al último paso de esta trayectoria.':'Este evento es anterior al último paso; no se le atribuyen cifras actuales.'}</p><button class="primary" id="close-event">Cerrar</button></section>`;
  document.body.append(modal);modal.querySelector<HTMLButtonElement>('#close-event')!.onclick=()=>modal.remove();modal.querySelector<HTMLButtonElement>('#close-event')!.focus();
}
async function startPrimary(policy:Policy,seed:number):Promise<void> {
  if(busy||pending.size)return;pause();busy=true;try{await saveQueue;exp=await command('INIT',{dataset,seed,policy,primary:true});draft={...policy};configuredBranchId='B';compareSourceId='B';pendingPrimaryPolicy=undefined;currentTab='lab';playing=true;markConfigured();if(firstRunSetup){firstRunSetup=false;setupGuidanceOpen=true;introOpen=true;}else dismissIntro();persist();}
  catch(error){showToast((error as Error).message,true);}finally{busy=false;render();schedule();}
}
async function confirmDialog():Promise<void> {
  if(busy||pending.size)return;const action=pendingDialog;if(!action)return;const autoplayAfterSetup=!!pendingPrimaryPolicy;pendingDialog='';busy=true;const modal=document.querySelector<HTMLElement>('[role="dialog"]');modal?.setAttribute('aria-busy','true');modal?.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.disabled=true);
  try{
    await saveQueue;
    if(action==='compare'){
      const source=branch(compareSourceId),targetId=compareSourceId==='A'?'B':'A';
      exp=await command('COMPARE',{sourceId:compareSourceId,policy:source.policy});configuredBranchId=targetId;draft={...branch(targetId).policy};
    }else{
      const policy=pendingPrimaryPolicy||baselinePolicy(exp.base);exp=await command('INIT',{dataset,seed:exp.seed,policy,primary:true});draft={...policy};configuredBranchId='B';compareSourceId='B';pendingPrimaryPolicy=undefined;
    }
    configTab='economy';currentTab='lab';if(autoplayAfterSetup){playing=true;markConfigured();if(firstRunSetup){firstRunSetup=false;setupGuidanceOpen=true;introOpen=true;}persist();}
  }catch(e){pendingDialog=action;showToast((e as Error).message,true);}
  finally{busy=false;render();schedule();}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();renderControls();persist();}});
window.addEventListener('pagehide',()=>{pause();persist();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(mobileMenuOpen){mobileMenuOpen=false;render();document.querySelector<HTMLButtonElement>('.mobile-menu-toggle')?.focus();return;}
    const help=document.querySelector<HTMLElement>('#save-help-popover');
    if(help&&!help.hidden){toggleSaveHelp(false);document.querySelector<HTMLButtonElement>('#save-help')?.focus();return;}
  }
  if(e.key==='Escape'&&pendingDialog){pendingDialog='';const focus=dialogReturnFocus;dialogReturnFocus=null;render();restoreDialogFocus(focus);return;}
  if(e.key==='Escape'){document.querySelector('#event-modal')?.remove();render();}
  if(e.key==='Tab'){
    const dialogEl=document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');if(!dialogEl)return;
    const focusable=[...dialogEl.querySelectorAll<HTMLElement>('button,[href],input,select,[tabindex="0"]')].filter(el=>!el.hasAttribute('disabled'));
    const first=focusable[0],last=focusable.at(-1);
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }
});
async function boot():Promise<void> {
  try{
    const response=await fetch(new URL('../data/spain.json',import.meta.url));
    if(!response.ok)throw new Error('No se pudo cargar la fotograf\u00eda inicial.');
    dataset=await response.json() as Dataset;datasetHash=fingerprint(JSON.stringify(dataset));selectBase(dataset);
    exp=await command('INIT',{dataset,seed:1847,primary:true});draft={...exp.b.policy};configuredBranchId='B';compareSourceId='B';
    let restored=false;
    try{const stored:Session|undefined=await loadLocal();if(stored){exp=await command('RESTORE',stored);configuredBranchId=targetBranchId();draft={...branch(configuredBranchId).policy};compareSourceId=exp.primaryId||'B';restored=true;}}
    catch(e){storageAvailable=false;showToast(`No se ha restaurado la sesi\u00f3n: ${(e as Error).message}`,true);}
    let marked=false;try{marked=localStorage.getItem('polis-setup-complete')==='1';introOpen=localStorage.getItem('polis-intro-dismissed')!=='1';}catch{introOpen=true;}
    const baseline=baselinePolicy(exp.base),current=activeBranch().policy;
    const hasCustomPolicy=Object.keys(baseline).some(key=>baseline[key as keyof Policy]!==current[key as keyof Policy]);
    const configured=marked||exp.comparisonActive||activeBranch().state.month>0||hasCustomPolicy;
    if(configured){markConfigured();}else{firstRunSetup=true;introOpen=false;wizardStep=-1;currentTab='wizard';}
    saveReady=true;if(!restored&&storageAvailable)saveStatus='idle';render();if(restored)persist();
  }catch(e){root.innerHTML=`<div class="boot"><div class="brand-mark">S</div><h1>No se pudo iniciar SIMULA TU PAÍS</h1><p>${esc((e as Error).message)}</p><p>Sirve la carpeta dist mediante HTTP. No abras index.html con file://.</p></div>`;}
}
void boot();
