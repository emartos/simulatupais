import type { Dataset, EngineBuild, Experiment, Policy, PresetOrigin, Session, WorkerRequest, WorkerResponse } from './core/types.js';
import { selectBase, fingerprint } from './core/data.js';
import { MODEL_VERSION, MAX_MONTHS, ASSUMPTIONS } from './core/model.js';
import { baselinePolicy, BOUNDS } from './core/policy.js';
import { exportSession, validateSession } from './core/session.js';
import { loadLocal, saveLocal } from './ui/storage.js';
import { esc, num, signed, dateLabel, download, icon, percentagePointDelta } from './ui/format.js';
import { renderChart, METRICS } from './ui/chart.js';
import type { Metric } from './ui/chart.js';
import { WIZARD_QUESTIONS, guidedAnswerValue, wizardChoiceDetail, wizardPolicy } from './ui/wizard.js';
import { renderVideoTutorial, renderVideoTutorialDialog } from './ui/video-tutorial.js';
import type { VideoTutorialVariant } from './ui/video-tutorial.js';
import { ECONOMIC_DECISIONS, decisionValueChanged, economicDecisionChanges, formatDecisionDifference, formatDecisionSummary, formatDecisionValue } from './ui/economic-decisions.js';
import { calculateChangeOrientation, ECONOMIC_AXIS_METHOD } from './ui/economic-axis-method.js';
import { BUILD_INFO, LICENSE_URL, REPOSITORY_URL, buildReference } from './project.js';
import { POLITICAL_PRESETS, findPoliticalPreset } from './political-presets/catalog.js';
import { applyPoliticalPreset } from './political-presets/apply.js';
import { positionToControlValue } from './political-presets/coding.js';
import { changedPresetValues, POLITICAL_CONTROL_KEYS } from './political-presets/schema.js';
import type { PoliticalPreset } from './political-presets/schema.js';
import { readScenarioUrl, scenarioUrl, SCENARIO_URL_VERSION } from './ui/shared-scenario.js';
import { changedDecisionsCount, downloadScenarioCard, drawScenarioCard, scenarioMetrics, scenarioSummary, shareText, socialShareUrls } from './ui/scenario-share.js';
import { editorialSlug, findEditorialScenario } from './ui/editorial-scenarios.js';
import type { EditorialScenario } from './ui/editorial-scenarios.js';
import { emitGrowthEvent } from './ui/growth-events.js';
import type { ScenarioSource } from './ui/growth-events.js';

const root=document.querySelector<HTMLDivElement>('#app')!;
const worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
let dataset:Dataset, datasetHash='', exp:Experiment, draft:Policy;
const CURRENT_ENGINE_BUILD:EngineBuild={engineVersion:BUILD_INFO.engineVersion,commitSha:BUILD_INFO.commitSha};
let sessionEngineBuild:EngineBuild=CURRENT_ENGINE_BUILD;
let currentTab:'lab'|'model'|'sources'|'about'|'wizard'='lab';
type Appearance='system'|'light'|'dark';
let appearance:Appearance='system';
let activeViewPanel:'evolution'|'understand'|'technical'='evolution';
let decisionsOpen=false, decisionsMode:'questions'|'controls'='controls';
let settingsOpen=false,settingsReturnFocus:HTMLElement|null=null;
let tutorialOpen=false,tutorialReturnFocus:HTMLElement|null=null,tutorialReturnVariant:VideoTutorialVariant='intro';
let decisionsReturnFocus:HTMLElement|null=null;
let restoredSession=false;
let mobileMenuOpen=false;
let shareOpen=false,editorialActive:EditorialScenario|undefined,scenarioSource:ScenarioSource='default',preserveStoredSession=false;
let sharedModified=false,sharedSimulated=false,scenarioLoadError='';
let configTab:'economy'|'institutions'|'advanced'='economy';
let configuredBranchId:'A'|'B'='B', compareSourceId:'A'|'B'='B', observedBranchId:'A'|'B'='B';
let introOpen=true, wizardStep=0, wizardAnswers:(number|null)[]=Array(6).fill(null),wizardAnswered:boolean[]=Array(6).fill(true);
let firstRunSetup=false;
let pendingPrimaryPolicy:Policy|undefined, saveStatus:'idle'|'saving'|'saved'|'unavailable'='idle';
let metric:Metric='gdp', playing=false, busy=false, speed=1;
let timer:ReturnType<typeof setTimeout>|undefined;
let requestId=0, storageAvailable=true, saveReady=false, saveQueue=Promise.resolve();
let selectedTrace='output';
let pendingDialog:''|'reset'|'compare'='';
let pendingScenarioName='';
let wizardScenarioName='';
let presetStage:''|'list'|'detail'|'draft'='',selectedPresetId='';
let presetDraftOrigin:PresetOrigin|undefined,sessionPresetOrigin:PresetOrigin|undefined,sessionPresetBranchOrigins:Partial<Record<'A'|'B',PresetOrigin>>={};
let pendingPresetOrigin:PresetOrigin|undefined;
let presetReturnTab:'lab'|'wizard'='wizard';
let presetFromConfig=false;
let wizardDraftPolicy:Policy|undefined;
let dialogReturnFocus:HTMLElement|null=null;
let toastTimer:ReturnType<typeof setTimeout>|undefined;
let queuedLivePolicy:{branchId:'A'|'B';policy:Policy}|undefined;
function showToast(message:string,error=false):void {
  clearTimeout(toastTimer);document.querySelector('#toast')?.remove();
  const node=document.createElement('div');node.id='toast';node.className=`toast${error?' error':''}`;node.setAttribute('role',error?'alert':'status');node.textContent=message;document.body.append(node);toastTimer=setTimeout(()=>node.remove(),5000);
}
function saveLabel():string {return preserveStoredSession?'Escenario abierto desde enlace':saveStatus==='unavailable'?'Sin guardado automático':saveStatus==='saving'?'Guardando…':saveStatus==='idle'?'Aún sin guardar':'Guardado en este navegador';}
function saveHelpText():string {return preserveStoredSession?'Este escenario se mantiene en memoria. La sesión que ya tenías guardada en este navegador no se ha sustituido. Comparte el enlace o exporta la simulación para conservarlo.':saveStatus==='unavailable'?'El guardado automático no está disponible. La simulación funciona en memoria y puedes exportarla.':saveStatus==='idle'?'Aún no hay una configuración guardada. Se guardará en este navegador cuando empieces la simulación o cambies los controles.':'Tu configuración y el progreso se guardan en este navegador y dispositivo. No se sincronizan con otros dispositivos. Si borras los datos del sitio, usas navegación privada o el navegador elimina ese almacenamiento, podrías perderlos. Exporta la simulación para conservar una copia.';}
function saveControl():string {return `<section class="settings-storage" aria-labelledby="save-help-title"><h3 id="save-help-title">Guardado y archivos</h3><p><strong id="save-label" data-status="${saveStatus}">${saveLabel()}</strong></p><p id="save-help-text">${esc(saveHelpText())}</p><div class="settings-actions"><button data-action="export">Exportar simulación</button><button data-action="import">Importar simulación</button></div></section>`;}
function modelVerification():string {
  const ref=buildReference(sessionEngineBuild);
  const version=ref.shortSha?`Motor ${esc(ref.version)} · Código ${esc(ref.shortSha)}`:`Motor ${esc(ref.version)} · Código no registrado`;
  const exact=ref.url?`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">Ver esta versión del código ${icon('arrow',13)}<span class="visually-hidden"> (se abre en otra pestaña)</span></a>`:'';
  return `<aside class="model-verifiability" aria-labelledby="model-verifiability-title"><div><h3 id="model-verifiability-title">Modelo verificable</h3><p>Esta simulación se ha generado con el motor de Simula tu país. Puedes consultar su código fuente, sus supuestos y sus pruebas.</p><small>${version}</small></div><div class="model-verifiability-links">${exact}<a href="${esc(REPOSITORY_URL)}" target="_blank" rel="noopener noreferrer">Ver código del motor ${icon('arrow',13)}<span class="visually-hidden"> (se abre en otra pestaña)</span></a></div></aside>`;
}
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
  if(!saveReady || !storageAvailable || !exp || preserveStoredSession) return;
  const session=exportSession(exp,datasetHash,sessionEngineBuild,sessionPresetOrigin,sessionPresetBranchOrigins);if(saveStatus==='idle'){saveStatus='saving';updateSaveLabel();}
  saveQueue=saveQueue.then(()=>saveLocal(session)).then(()=>{saveStatus='saved';updateSaveLabel();}).catch(()=>{
    storageAvailable=false;saveStatus='unavailable';updateSaveLabel();showToast('No se pudo guardar automáticamente. La simulación sigue disponible en memoria; expórtala para conservarla.',true);
  });
}
function updateSaveLabel():void {
  const warning=document.querySelector<HTMLElement>('#storage-warning');if(warning)warning.hidden=saveStatus!=='unavailable';
  const el=document.querySelector('#save-label');if(!el)return;
  const label=saveLabel();
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
function appearanceControl():string {
  return `<div class="appearance-control" role="group" aria-label="Apariencia">${([['system','Sistema'],['light','Claro'],['dark','Oscuro']] as const).map(([value,label])=>`<button type="button" data-action="appearance" data-appearance="${value}" aria-pressed="${appearance===value}">${label}</button>`).join('')}</div>`;
}
function settingsDialog():string {
  if(!settingsOpen)return '';
  return `<div class="modal-backdrop settings-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="settings-title" class="modal settings-modal"><header><div><span class="eyebrow">SIMULA TU PAÍS</span><h2 id="settings-title">Ajustes</h2></div><button data-action="close-settings" aria-label="Cerrar ajustes">${icon('close')}</button></header><section><h3>Apariencia</h3>${appearanceControl()}</section>${saveControl()}${exp?`<section class="settings-actions"><button data-action="open-decisions">Configurar simulación ${icon('sliders',15)}</button><button data-action="open-advanced">Opciones avanzadas de la simulación</button><button data-action="reset">Empezar una nueva simulación</button></section>`:''}</section></div>`;
}
function setAppearance(mode:Appearance):void {
  appearance=mode;
  try{localStorage.setItem('polis-appearance',mode);}catch{}
  window.dispatchEvent(new CustomEvent('simula-appearance',{detail:mode}));
}
function activeBranch():Experiment['a'] {const id=exp.primaryId||'B';return id==='A'?exp.a:exp.b;}
function branch(id:'A'|'B'):Experiment['a'] {return id==='A'?exp.a:exp.b;}
function branchName(id:'A'|'B'):string {
  if(!exp.comparisonActive)return 'Tu simulación';
  const name=exp.branchNames?.[id];
  return name||(id===exp.primaryId?'Simulación original':'Alternativa');
}
function selectObservedBranch(id:'A'|'B'):void {
  if(id===observedBranchId)return;
  observedBranchId=id;configuredBranchId=id;draft={...branch(id).policy};
  try{localStorage.setItem('simula-observed-branch',id);}catch{}
  render();
}
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
  emitGrowthEvent({name:'simulation_started',...growthContext()});
  try {const before=activeBranch().state.month;exp=await command('ADVANCE',months);if(activeBranch().state.month!==before)markScenarioModified();emitGrowthEvent({name:'simulation_completed',...growthContext()});if(scenarioSource==='shared_url'&&sharedModified&&!sharedSimulated){sharedSimulated=true;emitGrowthEvent({name:'shared_scenario_simulated',country:dataset.countryCode,horizon:activeBranch().state.month,scenario_version:SCENARIO_URL_VERSION});}}
  catch(e){pause();showToast((e as Error).message,true);}
  finally{
    const queued=queuedLivePolicy;queuedLivePolicy=undefined;
    if(queued){try{exp=await command('CONFIGURE',{branchId:queued.branchId,policy:queued.policy});markScenarioModified();}catch(e){showToast((e as Error).message,true);}}
    draft={...branch(configuredBranchId).policy};persist();busy=false;if(activeBranch().state.month>=MAX_MONTHS)pause();render();schedule();
  }
}
function renderControls():void {
  const box=document.querySelector('#time-controls');if(box)patchElementHtml(box,timeControls());
}
function timeControls():string {
  const month=branch(observedBranchId).state.month,end=month>=MAX_MONTHS;
  return `<div class="transport"><button data-action="play" class="primary play-button" ${end?'disabled':''} aria-label="${playing?'Pausar simulación':'Reproducir simulación'}">${icon(playing?'pause':'play')}${playing?'Pausar':'Reproducir'}</button><button data-action="step" ${busy||end?'disabled':''}>+1 mes</button><button data-action="year" ${busy||end?'disabled':''}>+1 año</button><label class="speed">Velocidad<select id="speed" aria-label="Velocidad de reproducción" ${busy?'disabled':''}><option value="1" ${speed===1?'selected':''}>1×</option><option value="3" ${speed===3?'selected':''}>3×</option><option value="12" ${speed===12?'selected':''}>12×</option></select></label></div>${end?`<p class="limit-note" role="status">Has llegado al límite de esta versión.</p>`:''}`;
}
function economicDecisions(policy:Policy):string {
  // Compatible sessions are accepted only for this exact model and catalog fingerprint;
  // the original catalog reference is therefore reproducible without changing storage.
  const referenceAvailable=exp.base.datasetVersion===dataset.version;
  const reference=referenceAvailable?baselinePolicy(exp.base):null;
  const changes=reference?economicDecisionChanges(reference,policy):[];
  const orientation=reference?calculateChangeOrientation(reference,policy):null;
  const preview=changes.length?`<div class="economic-change-preview" aria-label="Cambios aplicados">${changes.map(change=>`<span>${esc(formatDecisionSummary(change))}</span>`).join('')}</div>`:'';
  const tableRows=reference?economicDecisionChanges(reference,policy).map(change=>`<tr><th scope="row">${esc(change.label)}</th><td>${esc(formatDecisionValue(change.key,change.reference,change.unit))}</td><td>${esc(formatDecisionValue(change.key,change.applied,change.unit))}</td><td>${esc(formatDecisionDifference(change))}</td><td>${esc(change.meaning)}</td></tr>`).join(''):'';
  const unchanged=reference&&changes.length===0?`<p class="economic-baseline">Configuración de partida</p><p class="economic-status">Mantienes las decisiones económicas definidas al iniciar este experimento. No representan necesariamente las políticas vigentes en España.</p>`:'';
  const status=reference&&changes.length?`<p class="economic-status"><strong>${changes.length} ${changes.length===1?'decisión económica modificada':'decisiones económicas modificadas'}</strong> respecto al punto de partida.</p>${preview}`:'';
  const unavailable=!reference?`<p class="economic-status">La referencia de esta sesión no está disponible. Se muestran los valores económicos aplicados, sin declarar que no haya cambios.</p>`:'';
  const rows=reference?economicDecisionChanges(reference,policy):[];
  const appliedRows=!reference?ECONOMIC_DECISIONS.map(({key,label,unit})=>`<tr><th scope="row">${esc(label)}</th><td colspan="3">${esc(formatDecisionValue(key,policy[key],unit))}</td><td>Referencia no disponible</td></tr>`).join(''):'';
  const zeroNote=`<p class="economic-detail-note">En los ajustes de impuestos sobre ingresos, diferencias entre grupos y ayudas, cero significa que no se aplica una variación adicional; no significa que no existan impuestos, diferencias o ayudas.</p>`;
  const baselineLabel=reference&&changes.length===0?'<p class="economic-baseline">Configuración de partida</p><p class="axis-state">Aún no has introducido cambios que permitan situarlos en este eje.</p>':'';
  const noIncludedChanges=reference&&changes.length>0&&orientation&&!orientation.hasIncludedChanges?'<p class="axis-state">Hay cambios aplicados, pero ninguno corresponde a las dimensiones incluidas en este eje.</p>':'';
  const unavailableOrientation=!reference?'<p class="axis-state">No se puede calcular la orientación porque la referencia de esta sesión no está disponible.</p>':'';
  const directionText=orientation?.direction==='center'?'Los cambios quedan cerca del centro de esta escala':orientation?.direction==='left'?`Orientación de los cambios: ${orientation.intensityPercent} % hacia la izquierda`:`Orientación de los cambios: ${orientation?.intensityPercent||0} % hacia la derecha`;
  const orientationText=orientation?.hasIncludedChanges?`<p class="axis-reading" aria-live="polite">${directionText}</p>`:'';
  const marker=orientation?.hasIncludedChanges?`<span class="economic-axis-marker" style="left:${orientation.position*100}%"></span>`:'';
  const trackLabel=orientation?.hasIncludedChanges?`Orientación de los cambios: ${orientation.direction==='center'?'cerca del centro':orientation.direction==='left'?`${orientation.intensityPercent} por ciento hacia la izquierda`:`${orientation.intensityPercent} por ciento hacia la derecha`}`:'Barra izquierda, centro y derecha; sin cambios incluidos no se marca una posición';
  const methodVariables=ECONOMIC_AXIS_METHOD.variables.map(v=>`<li><strong>${esc(v.label)}:</strong> aumentar significa ${esc(v.increaseMeans.toLowerCase())}; representa el lado ${v.directionOnIncrease==='left'?'izquierdo':'derecho'}. Escala fija de cambio: ${v.deltaScale} ${esc(v.unit)}; peso ${v.weight.toLocaleString('es-ES')} (${esc(v.rationale)})</li>`).join('');
  const methodMath=ECONOMIC_AXIS_METHOD.variables.map(v=>`<li>${esc(v.key)}: (aplicado − referencia) / ${v.deltaScale} ${esc(v.unit)} × ${v.directionOnIncrease==='left'?'−1':'1'} × ${v.weight.toLocaleString('es-ES')}</li>`).join('');
  return `<section class="axis-overview" aria-labelledby="economic-axis-title"><div class="axis-overview-identity">${icon('compass',25)}<div class="axis-overview-copy"><h2 id="economic-axis-title">Orientación económica de los cambios</h2><p class="axis-pending">Muestra hacia qué lado de esta escala se orientan, en conjunto, las decisiones que has cambiado respecto al punto de partida.</p><p class="axis-caveat">Describe la configuración, no tus ideas personales.</p>${baselineLabel}${noIncludedChanges}${unavailableOrientation}</div></div><div class="economic-axis"><div class="economic-axis-track" role="img" aria-label="${trackLabel}">${marker}</div><div class="economic-axis-labels"><span>Izquierda</span><span>Centro</span><span>Derecha</span></div>${orientationText}<div class="axis-overview-actions"><details class="axis-overview-help"><summary>${icon('info',15)}<span>Cómo se calcula</span></summary><div class="axis-method-help"><p>Metodología experimental ${esc(ECONOMIC_AXIS_METHOD.version)}. El punto de partida económico de este experimento es la referencia. Solo se consideran diferencias aplicadas, nunca borradores.</p><ul>${methodVariables}</ul><p>Los cambios normalizados se combinan con pesos iguales de 0,2. Esos pesos y las escalas fijas son convenciones descriptivas transparentes del indicador, no estimaciones científicas. El signo negativo señala el lado izquierdo y el positivo, el derecho. La magnitud se limita a la escala; cerca de cero se informa que los cambios quedan cerca de su centro, sin describir a la persona como centrista.</p><p>Quedan fuera los impuestos sobre compras y sobre beneficios porque, por sí solos, sus tipos no indican cómo se distribuye el esfuerzo o se usan los ingresos; la fricción de inversión porque representa una barrera, no el papel económico del Estado; y las opciones institucionales porque no tienen aquí un efecto económico cuantificado.</p><p>Es una escala descriptiva experimental cuya validación metodológica sigue pendiente; no es una clasificación científica de personas, partidos o países. Distintas combinaciones pueden dar un resultado parecido. El indicador no interviene en los resultados económicos del motor.</p><details class="axis-method-math"><summary>Detalle matemático</summary><p>Para cada dimensión: delta = valor aplicado − valor de referencia; delta normalizada = delta / escala fija. La coordenada = suma de (delta normalizada × dirección × peso), limitada a [−1, 1]. Aumentar una variable que apunta a la izquierda usa dirección −1; a la derecha usaría +1.</p><ul>${methodMath}</ul><p>La barra convierte la coordenada a una posición visual entre 0 y 1: (coordenada + 1) / 2. El porcentaje leído es el valor absoluto de la coordenada × 100; no es probabilidad ni suma de categorías.</p></details></div></details><div class="economic-details"><details><summary>Ver decisiones y cambios</summary><div class="economic-detail-content"><h3>Decisiones económicas de esta simulación</h3>${unchanged}${status}${unavailable}<div class="economic-table-wrap">${zeroNote}<table class="economic-table"><thead><tr><th>Decisión</th><th>Punto de partida</th><th>Valor aplicado</th><th>Diferencia</th><th>Unidad o alcance</th></tr></thead><tbody>${reference?(rows.length?tableRows:`<tr><td colspan="5">No hay cambios respecto a la configuración económica predeterminada de este experimento.</td></tr>`):appliedRows}</tbody></table></div><p class="economic-reference-note">La referencia es la configuración económica predeterminada de los mismos datos y versión del modelo con los que se inició esta sesión; no son necesariamente políticas vigentes en España.</p></div></details></div></div></div></section>`;
}
const labels:Record<string,{label:string;hint:string;unit:string}>={
  taxShift:{label:'Impuestos sobre ingresos',hint:'Ajusta los porcentajes de los tres grupos de hogares respecto a la configuración inicial. No son tipos legales vigentes.',unit:'pp'},
  progressivity:{label:'Cambio del diferencial entre grupos',hint:'Indica cuántos puntos porcentuales cambia la diferencia entre el tipo del grupo de mayores ingresos y el de menores. La mitad se resta al grupo bajo y la mitad se suma al alto; el grupo intermedio no cambia. Puede haber límites por los topes de los tipos.',unit:'pp'},
  consumptionTax:{label:'Impuesto medio sobre compras',hint:'Porcentaje simplificado aplicado a las compras; no representa el IVA de un producto concreto.',unit:'%'},
  corporateTax:{label:'Impuesto sobre beneficios',hint:'Porcentaje de referencia del modelo para las empresas; no es una descripción completa del sistema fiscal vigente.',unit:'%'},
  transfers:{label:'Ayudas a hogares',hint:'Variación del importe total de las transferencias respecto a la configuración inicial; no indica cuánto recibe cada persona.',unit:'%'},
  publicInvestment:{label:'Inversión pública',hint:'Formación de capital público. Entra en la inversión total y puede ampliar la capacidad productiva con retardo.',unit:'% PIB'},
  services:{label:'Gasto corriente en servicios públicos',hint:'Recursos corrientes para la provisión pública: aumentan gasto y demanda, sin efecto productivo directo en esta versión.',unit:'% PIB'},
  investmentFriction:{label:'Coste adicional de invertir',hint:'Representa barreras simplificadas al uso de activos productivos; no mide derechos.',unit:'pp'}
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
  const locked=busy;
  let content='';
  if(configTab==='economy')content=Object.keys(labels).map(k=>control(k as keyof typeof BOUNDS)).join('');
  else if(configTab==='institutions')content=`<div class="notice compact"><strong>Estas reglas solo describen procedimientos y generan eventos.</strong> En esta versión no tienen efectos económicos cuantificados.</div><label class="field-label" for="elections">Forma de selección del poder</label><select id="elections" data-policy="elections" ${locked?'disabled':''}><option value="competitive" ${draft.elections==='competitive'?'selected':''}>Competencia electoral</option><option value="single-party" ${draft.elections==='single-party'?'selected':''}>Selección dentro de un partido</option><option value="appointment" ${draft.elections==='appointment'?'selected':''}>Designación</option></select><label class="field-label" for="term">Cada cuánto se renueva el procedimiento</label><select id="term" data-policy="termMonths" ${locked?'disabled':''}>${[24,36,48,60,72].map(n=>`<option value="${n}" ${draft.termMonths===n?'selected':''}>Cada ${n/12} años</option>`).join('')}</select><label class="toggle-row"><span>Libertad de expresión<small>Condición descrita en las reglas</small></span><input type="checkbox" data-policy="expression" ${draft.expression?'checked':''} ${locked?'disabled':''}></label><label class="toggle-row"><span>Revisión judicial<small>Condición descrita en las reglas</small></span><input type="checkbox" data-policy="judicialReview" ${draft.judicialReview?'checked':''} ${locked?'disabled':''}></label>`;
  else content=`<label class="toggle-row"><span>Perturbaciones sintéticas<small>Son acontecimientos generados por el simulador para explorar escenarios. Su frecuencia y magnitud no representan una estimación estadística de acontecimientos reales.</small></span><input id="shocks-enabled" type="checkbox" ${exp.shocksEnabled?'checked':''} ${busy?'disabled':''}></label><details class="seed-details"><summary>Repetir los mismos sucesos</summary><p>Este ajuste permite repetir los mismos sucesos externos en el mismo orden. No necesitas cambiarlo para utilizar el simulador.</p><label class="field-label" for="seed">Semilla aleatoria</label><input id="seed" type="number" min="0" max="4294967295" step="1" value="${exp.seed}" ${activeBranch().state.month>0||exp.comparisonActive||busy?'disabled':''}><p class="tiny">Para repetir exactamente los resultados también deben conservarse la configuración, los datos y la versión del modelo y la opción de perturbaciones.</p></details>${exp.comparisonActive?`<p class="tiny">Las alternativas afrontan los mismos sucesos externos, para que puedas comparar el efecto de sus distintas decisiones.</p><label class="field-label" for="name-a">Nombre de ${esc(branchName('A'))}</label><input id="name-a" data-scenario-name="A" maxlength="60" value="${esc(branchName('A'))}"><label class="field-label" for="name-b">Nombre de ${esc(branchName('B'))}</label><input id="name-b" data-scenario-name="B" maxlength="60" value="${esc(branchName('B'))}">`:''}<details class="advanced-details"><summary>Detalles técnicos</summary><p>Semilla aleatoria: ${exp.seed}. Perturbaciones sintéticas: ${exp.shocksEnabled?'activadas':'desactivadas'}. Modelo ${MODEL_VERSION}; datos ${esc(dataset.version)}.</p></details><button data-action="export" class="full-button">${icon('download')} Exportar simulación</button><button data-action="import" class="full-button">${icon('upload')} Importar simulación</button>`;
  const tabs=[['economy','Economía'],['institutions','Instituciones'],['advanced','Opciones avanzadas']];
  const summary=decisionsSummary(),month=branch(observedBranchId).state.month;
  const timing=month>=MAX_MONTHS?'Has llegado al límite de esta simulación.':`Los cambios se aplicarán desde ${dateLabel(exp.base.year,month+1)}.${month>0?' Conservaremos lo ocurrido hasta ahora y crearemos una alternativa para compararla.':''}`;
  return `<div class="decisions-heading"><div><span class="eyebrow">CONFIGURAR DECISIONES</span><h2>Decisiones de: ${esc(branchName(observedBranchId))}</h2></div><button class="icon-button" data-action="close-decisions" aria-label="Cerrar decisiones">${icon('close')}</button></div>${summary?`<p class="decision-summary">Cambios preparados: ${esc(summary)}</p>`:''}<button type="button" class="full-button preset-config-entry" data-action="preset-open-from-config">Programa político</button><p class="preset-config-help">Usa un programa electoral real como punto de partida.</p><div class="decision-modes" role="group" aria-label="Forma de configurar"><button type="button" data-action="decision-mode" data-mode="questions" aria-pressed="${decisionsMode==='questions'}">Con preguntas</button><button type="button" data-action="decision-mode" data-mode="controls" aria-pressed="${decisionsMode==='controls'}">Con controles</button></div><p class="tiny decision-timing">${esc(timing)}</p>${decisionsMode==='questions'?questionSidebar():`<div class="config-tabs" role="tablist" aria-label="Grupos de controles">${tabs.map(([tab,label])=>`<button role="tab" aria-selected="${configTab===tab}" data-config-tab="${tab}" class="${configTab===tab?'active':''}">${label}</button>`).join('')}</div><div class="config-content">${content}</div>`}<div class="decision-actions"><button data-action="cancel-decisions">Cancelar</button><button class="primary" data-action="apply-decisions" ${busy?'disabled':''}>Confirmar cambios</button></div><div class="config-actions"><button data-action="compare" class="full-button">Comparar otra configuración</button><button data-action="reset" class="full-button">Empezar una nueva simulación</button></div>`;
}
function decisionsSummary():string {
  const p=draft,parts:string[]=[];
  if(p.taxShift)parts.push(`${p.taxShift>0?'Subir':'Bajar'} impuestos sobre ingresos`);
  if(p.progressivity)parts.push(`${p.progressivity>0?'Ampliar':'Reducir'} diferencias entre grupos`);
  if(p.transfers)parts.push(`${p.transfers>0?'Aumentar':'Reducir'} ayudas`);
  const reference=baselinePolicy(exp.base);
  if(decisionValueChanged('services',reference.services,p.services))parts.push('Cambiar gasto corriente en servicios públicos');
  if(p.publicInvestment!==reference.publicInvestment)parts.push('Cambiar inversión pública');
  if(p.consumptionTax!==reference.consumptionTax)parts.push('Cambiar impuestos sobre compras');
  return parts.length?parts.join(' · '):'';
}
function questionSidebar():string {
  const q=WIZARD_QUESTIONS[wizardStep]||WIZARD_QUESTIONS[0]!,selected=wizardAnswers[wizardStep];
  return `<section class="sidebar-question"><p class="eyebrow">PREGUNTA ${wizardStep+1} DE ${WIZARD_QUESTIONS.length}</p><h3>${esc(q.prompt)}</h3><p>${esc(q.explanation)}</p><fieldset><legend>Elige una opción</legend>${q.options.map((choice,i)=>`<label class="wizard-choice"><input type="radio" name="decision-answer" value="${i}" ${wizardAnswered[wizardStep]&&selected===choice.value?'checked':''}><span><strong>${esc(choice.label)}</strong><small>${esc(wizardChoiceDetail(exp.base,wizardStep,choice,wizardAnswers))}</small></span></label>`).join('')}</fieldset><div class="wizard-actions"><button data-action="sidebar-question-prev" ${wizardStep===0?'disabled':''}>Anterior</button><button data-action="sidebar-question-next" ${wizardStep===WIZARD_QUESTIONS.length-1?'disabled':''}>Siguiente</button></div></section>`;
}
function metricNumber(b:Experiment['a'],key:Metric):number {
  const state=b.state;
  if(key==='gdp')return state.gdpReal;if(key==='purchasingPower')return b.history.at(-1)!.purchasingPower;
  if(key==='inflation')return state.inflation*100;if(key==='unemployment')return state.unemployment*100;
  if(key==='debtRatio')return state.debt/state.gdpNominal*100;return state.investment;
}
function metricFormat(key:Metric,value:number):string {const raw=num(value,key==='purchasingPower'?0:1),[integer,decimals]=raw.split(','),formatted=key==='gdp'?`${integer!.replace(/\B(?=(\d{3})+(?!\d))/g,'.')}${decimals===undefined?'':`,${decimals}`}`:raw;return key==='purchasingPower'?`${formatted} €`:key==='inflation'||key==='unemployment'||key==='debtRatio'?`${formatted} %`:formatted;}
function metricUnitLabel(key:Metric):string {return ({gdp:'miles de millones de € · anualizados',purchasingPower:'€ por persona y año',inflation:'% interanual',unemployment:'% de la población activa',debtRatio:'% del PIB',investment:'miles de millones de € · anualizados'} as const)[key];}
function metricHelp(key:Metric):string {
  const hints:Record<Metric,string>={gdp:'Producción de España a precios del año de partida. El valor está expresado a ritmo anualizado, no es una suma acumulada.',purchasingPower:'Media anual de la renta disponible de los hogares simulados, ajustada por precios. No equivale al salario observado.',inflation:'Variación de precios frente al mismo mes del año anterior. Una tasa menor no significa que los precios hayan bajado.',unemployment:'Personas sin empleo como porcentaje de la población activa simulada, no de toda la población.',debtRatio:'Deuda al cierre en relación con la producción anualizada a precios actuales.',investment:'Inversión pública y privada del modelo, expresada a ritmo anualizado.'};return hints[key];
}
function kpi(title:string,key:Metric,primary:Experiment['a'],other?:Experiment['a']):string {
  const value=metricFormat(key,metricNumber(primary,key)),first=primary.history[0]!,last=primary.history.at(-1)!;
  const start=key==='debtRatio'?first.debtRatio:key==='investment'?first.investment:first[key],end=key==='debtRatio'?last.debtRatio:key==='investment'?last.investment:last[key];
  const change=start!==0?(end/start-1)*100:undefined,delta=key==='inflation'||key==='unemployment'||key==='debtRatio'?percentagePointDelta(end,start):end-start;
  const displayDelta=Math.abs(delta)<(key==='purchasingPower'?.5:.05)?0:delta;
  const directional=key==='gdp'||key==='purchasingPower'||key==='unemployment';
  const status=!directional||delta===0?'neutral':(key==='unemployment'?delta<0:delta>0)?'good':'bad';
  const changeLabel=change===undefined?'—':key==='unemployment'||key==='inflation'||key==='debtRatio'?`${signed(displayDelta,1)} pp desde el inicio`:`${signed(change,1)} % desde el inicio`;
  const changeLine=primary.state.month?`<div class="kpi-change ${status}" aria-label="Cambio desde el inicio: ${changeLabel}">${changeLabel}</div>`:'';
  const deltaUnit=key==='inflation'||key==='unemployment'||key==='debtRatio'?' pp':key==='purchasingPower'?' €':' miles de millones de euros';
  const comparisonUnit=key==='gdp'||key==='investment'?` ${metricUnitLabel(key)}`:key==='purchasingPower'?' por persona y año':'';
  const secondaryDelta=other?metricNumber(primary,key)-metricNumber(other,key):0,displaySecondaryDelta=Math.abs(secondaryDelta)<(key==='purchasingPower'?.5:.05)?0:secondaryDelta;
  const secondary=other?`<div class="kpi-compare"><button type="button" data-action="observe-branch" data-branch="${other.id}" aria-label="Ver ${esc(branchName(other.id))} como simulación observada: ${metricFormat(key,metricNumber(other,key))}${comparisonUnit}">Ver ${esc(branchName(other.id))}: ${metricFormat(key,metricNumber(other,key))}${comparisonUnit}</button><span class="delta">Diferencia respecto a ${esc(branchName(other.id))}: ${signed(displaySecondaryDelta,key==='purchasingPower'?0:1)}${deltaUnit}</span></div>`:'';
  return `<article class="kpi" data-metric="${key}" data-start-value="${start}" data-current-value="${end}"><button type="button" class="kpi-select" data-metric="${key}" aria-pressed="${metric===key}" aria-label="Mostrar ${esc(title)} en el gráfico: ${value} ${esc(metricUnitLabel(key))}${changeLabel?`; ${changeLabel}`:''}"><span class="kpi-label">${title.toLocaleUpperCase('es')}</span><span class="kpi-main ${status}">${value}</span><span class="kpi-explicit-unit">${esc(metricUnitLabel(key))}</span>${changeLine}</button>${secondary}<p class="kpi-unit">${esc(metricHelp(key))}</p></article>`;
}
function metricContextPanel(primary:Experiment['a'],key:Metric,trend:string,startGdp:number,currentGdp:number,startUnemployment:number,currentUnemployment:number):string {
  const first=primary.history[0]!,last=primary.history.at(-1)!,start=first[key],end=last[key],delta=end-start,isRate=key==='inflation'||key==='unemployment'||key==='debtRatio',relative=start!==0?(end/start-1)*100:undefined;
  const deltaLabel=isRate?`${signed(delta,1)} puntos porcentuales`:key==='purchasingPower'?`${signed(delta,0)} € por persona/año`:`${signed(delta,1)} mil M€ reales/año`;
  const relativeLabel=isRate||relative===undefined?'No aplicable':`${signed(relative,1)} %`;
  const subtitles:Record<Metric,string>={gdp:'PIB simulado',purchasingPower:'Renta disponible real por persona',inflation:'Inflación interanual',unemployment:'Porcentaje de la población activa',debtRatio:'Deuda pública relativa al PIB',investment:'Flujo anualizado de inversión'};
  const cautions:Record<Metric,string>={gdp:'Un mayor PIB no indica por sí solo cómo se distribuye la producción.',purchasingPower:'Es una media de hogares simulados y no describe a cada persona.',inflation:'Mide el ritmo de cambio de precios; no el nivel absoluto de precios.',unemployment:'Es un porcentaje calculado por el modelo, no un recuento de personas observadas.',debtRatio:'Una variación puede reflejar tanto deuda como cambios del PIB nominal.',investment:'Incluye componentes públicos y privados del modelo.'};
  const glyph:Record<Metric,string>={gdp:'chart',purchasingPower:'compass',inflation:'info',unemployment:'local',debtRatio:'calculator',investment:'arrow'};
  return `<aside class="metric-context" aria-label="Contexto del indicador activo" aria-live="polite"><div class="metric-context-title"><span class="metric-icon">${icon(glyph[key],18)}</span><div><span class="eyebrow">INDICADOR ACTIVO</span><h3>${esc(METRICS[key].label)}</h3><p>${esc(subtitles[key])}</p></div></div><div class="metric-current"><span>Valor actual · ${esc(dateLabel(exp.base.year,primary.state.month))}</span><strong>${metricFormat(key,end)}</strong><small>${esc(METRICS[key].unit)}</small></div><table class="metric-summary"><tbody><tr><th>Valor inicial</th><td>${metricFormat(key,start)}</td></tr><tr><th>Valor final</th><td>${metricFormat(key,end)}</td></tr><tr><th>Variación</th><td>${deltaLabel}</td></tr><tr><th>Variación relativa</th><td>${relativeLabel}</td></tr></tbody></table><p class="metric-explainer">${esc(metricHelp(key))}</p><p class="metric-caution">${esc(cautions[key])}</p><p class="trend-summary" data-gdp-start="${startGdp}" data-gdp-current="${currentGdp}" data-unemployment-start="${startUnemployment}" data-unemployment-current="${currentUnemployment}">${trend}</p></aside>`;
}
function mainDashboard():string {
  const primaryId=observedBranchId,primary=branch(primaryId),other=branch(primaryId==='A'?'B':'A'),paired=!!exp.comparisonActive;
  const cards=kpi('Producción económica','gdp',primary,paired?other:undefined)+kpi('Capacidad de compra','purchasingPower',primary,paired?other:undefined)+kpi('Precios (inflación)','inflation',primary,paired?other:undefined)+kpi('Desempleo','unemployment',primary,paired?other:undefined)+kpi('Deuda / PIB','debtRatio',primary,paired?other:undefined)+kpi('Inversión','investment',primary,paired?other:undefined);
  const start=primary.history[0]!,last=primary.history.at(-1)!;
  const gdpChange=start.gdp!==0?(last.gdp/start.gdp-1)*100:undefined,unemploymentChange=percentagePointDelta(last.unemployment,start.unemployment);
  const date=esc(dateLabel(exp.base.year,primary.state.month));
  const trend=primary.state.month?`Desde el inicio, la producción ${gdpChange===undefined||Math.abs(gdpChange)<0.05?'se ha mantenido prácticamente igual':gdpChange>0?'ha aumentado':'ha disminuido'}${gdpChange===undefined||Math.abs(gdpChange)<0.05?'':` un ${num(Math.abs(gdpChange),1)} %`} y la tasa de desempleo ${Math.abs(unemploymentChange)<0.05?'se ha mantenido prácticamente igual':unemploymentChange<0?'ha bajado':'ha subido'}${Math.abs(unemploymentChange)<0.05?'':` ${num(Math.abs(unemploymentChange),1)} puntos porcentuales`}.`:`La simulación parte de los datos de España para ${exp.base.year}. Avánzala para observar cómo cambian los indicadores.`;
  const insights=`<p class="trend-summary" data-gdp-start="${start.gdp}" data-gdp-current="${last.gdp}" data-unemployment-start="${start.unemployment}" data-unemployment-current="${last.unemployment}">${trend}</p>`;
  const viewHeader=(id:string,title:string,sub:string,iconName:string)=>`<header class="query-heading">${icon(iconName,22)}<div><h2 id="${id}">${title}</h2><p>${esc(branchName(primaryId))} · ${date}</p><span>${sub}</span></div><button data-view="evolution">Volver a la evolución</button></header>`;
  const evolution=`<section class="evolution-layout" id="view-panel-evolution" role="region" aria-labelledby="evolution-title"><div class="evolution-main query-panel"><header class="query-heading"><span class="query-icon">${icon('chart',22)}</span><div><h2 id="evolution-title">${esc(METRICS[metric].label)}</h2><p>${esc(branchName(primaryId))} · ${date} · ${esc(METRICS[metric].unit)}</p></div><div class="evolution-actions"><button data-action="compare" class="secondary">Comparar otra configuración</button><button data-action="csv" aria-label="Exportar serie comparativa CSV">${icon('download')} Exportar datos</button></div></header><div class="query-body"><div class="metric-tabs" role="tablist" aria-label="Indicador del gráfico">${Object.entries(METRICS).map(([key,m])=>`<button role="tab" aria-selected="${metric===key}" data-metric="${key}" class="${metric===key?'active':''}">${esc(m.label)}</button>`).join('')}</div>${renderChart(exp,metric,primaryId)}<details class="data-disclosure"><summary>Ver valores exactos del gráfico en tabla</summary><div class="table-scroll"><table><thead><tr><th>Simulación · periodo</th>${paired?`<th>${esc(branchName(primaryId))}</th><th>${esc(branchName(primaryId==='A'?'B':'A'))}</th>`:`<th>${esc(branchName(primaryId))}</th>`}</tr></thead><tbody>${primary.history.map((point,i)=>`<tr><td>${esc(branchName(primaryId))} · ${esc(dateLabel(exp.base.year,point.month,true))}</td><td>${num(point[metric],METRICS[metric].decimals)}</td>${paired?`<td>${num(other.history[i]![metric],METRICS[metric].decimals)}</td>`:''}</tr>`).join('')}</tbody></table></div></details><div class="recent-events-wrap"><h3>Acontecimientos recientes</h3>${recentEventsPanel()}</div></div></div>${metricContextPanel(primary,metric,trend,start.gdp,last.gdp,start.unemployment,last.unemployment)}</section>`;
  const traces=primary.state.trace;
  const mechanismText=primary.state.month&&traces.length?`<p>En ${date}, el modelo aplicó ${traces.length===1?'este mecanismo':'estos mecanismos'} en el último paso. Los cambios desde el inicio aparecen arriba y no se atribuyen solo a estas operaciones.</p><ul class="mechanism-list">${traces.map(t=>`<li><strong>${esc(t.title)}</strong><p>${esc(t.explanation)}</p><span>Resultado de esta operación: ${num(t.result,3)} ${esc(t.unit)}</span></li>`).join('')}</ul>`:`<p>En ${date} no hay una traza mensual de mecanismos conservada. Se puede consultar el estado y la configuración disponibles en Detalle técnico.</p>`;
  const understand=`<section class="query-panel explanation-panel" id="view-panel-understand" role="region" aria-labelledby="understand-title">${viewHeader('understand-title','Entender los resultados','Qué ha cambiado y qué influyó en los resultados','book')}<div class="query-body"><h3>Qué ha cambiado</h3>${insights}<h3>Qué influyó en el último periodo</h3>${mechanismText}${primary.state.households.length?`<h3>A quién afecta</h3><p>El modelo agrupa los hogares en grupos simulados; no son personas observadas. La tabla muestra la capacidad de compra en la fecha seleccionada.</p>${householdPanel()}`:''}<details><summary>Consultar datos del país y acontecimientos</summary><div class="lower-grid">${countryPanel()}${feedPanel()}</div></details>${modelVerification()}</div></section>`;
  const technical=`<section class="query-panel technical-panel" id="view-panel-technical" role="region" aria-labelledby="technical-title">${viewHeader('technical-title','Comprobar los cálculos','Consulta los valores, las reglas y las operaciones utilizadas en este periodo','calculator')}<div class="query-body"><h3>Datos de entrada</h3><p>${esc(branchName(primaryId))} · España · ${date}. Semilla aleatoria: ${exp.seed}; modelo ${MODEL_VERSION}; catálogo ${esc(dataset.version)}.</p><div class="technical-policy"><code>${esc(JSON.stringify(primary.policy,null,2))}</code></div><h3>Regla aplicada</h3>${tracePanel()}<h3>Resultado del periodo</h3><p class="period-note">${esc(branchName(primaryId))} · España · ${date}. Valores simulados, comparados con los datos de partida de ${esc(branchName(primaryId))}.</p>${countryPanel()}<details class="model-disclosure"><summary>Cómo funciona: ecuaciones y límites</summary>${modelPage()}</details></div></section>`;
  const view=activeViewPanel==='evolution'?evolution:activeViewPanel==='understand'?understand:technical;
  const sidebar=decisionsOpen?`<button class="decisions-scrim" data-action="close-decisions" aria-label="Cerrar decisiones" tabindex="-1"></button><aside class="decisions-sidebar" role="complementary" aria-label="Configurar decisiones">${configPanel()}</aside>`:'';
  return `<div class="workspace ${decisionsOpen?'with-decisions':''}">${sidebar}<div class="dashboard-content">${economicDecisions(primary.policy)}<section class="kpi-grid">${cards}</section>${shareSection()}${primary.state.constraints.length?`<div class="notice compact" role="status">Límite numérico del modelo: ${esc(primary.state.constraints.join(' '))} Los números finitos no garantizan que el escenario sea plausible.</div>`:''}<nav class="content-views" aria-label="Contenido de la simulación">${([['evolution','Evolución'],['understand','Explicación'],['technical','Detalle técnico']] as const).map(([id,label])=>`<button type="button" data-view="${id}" aria-pressed="${activeViewPanel===id}" class="${activeViewPanel===id?'active':''}">${label}</button>`).join('')}</nav><div class="view-content" id="active-view">${view}</div></div></div>`;
}

function countryPanel():string {
  const id=observedBranchId,selected=branch(id),s=selected.state,v=exp.base.values;
  const activeShare=(v.employed!/(1-v.unemployment!))/v.population!,employed=s.population*activeShare*(1-s.unemployment),p=selected.policy;
  const st=s.trace.find(t=>t.id==='services'),servicesReference=st?.inputs.gastoRealizadoReferencia??v.services!,servicesDelta=s.services-servicesReference;
  return `<section class="panel country-panel"><span class="eyebrow">DATOS Y RESULTADOS · ${esc(branchName(id))}</span><h2>España simulada</h2><div class="country-row"><span>Población simulada</span><strong>${num(s.population/1e6,2)} millones de personas</strong></div><div class="country-row"><span>Personas ocupadas simuladas</span><strong>${num(employed/1e6,2)} millones</strong></div><div class="country-row"><span>Recursos corrientes para servicios públicos</span><strong>${num(s.services,1)} mil M€ reales/año</strong></div><div class="country-row"><span>Diferencia respecto al gasto de referencia</span><strong>${signed(servicesDelta,1)} mil M€ reales/año</strong></div><div class="country-row"><span>Deuda al cierre</span><strong>${num(s.debt,1)} miles de millones de euros</strong></div><div class="country-row"><span>Deuda / PIB nominal anualizado</span><strong>${num(s.debt/s.gdpNominal*100,1)} %</strong></div><div class="country-row"><span>Saldo fiscal anualizado</span><strong>${signed(-s.deficit,1)} miles de millones de euros</strong></div><p class="tiny">Los recursos de servicios son gasto corriente realizado; no miden calidad ni bienestar. Stocks al cierre y flujos anualizados son magnitudes distintas.</p><div class="institution-summary"><h3>Procedimientos descritos</h3><p>${p.elections==='competitive'?'Competencia electoral':p.elections==='single-party'?'Selección dentro de un partido':'Designación'} · cada ${p.termMonths/12} años</p><p class="tiny">Estos controles producen procedimientos y eventos narrativos; no tienen efectos económicos cuantificados.</p></div></section>`;
}
function recentEventsPanel():string {
  const selected=branch(observedBranchId),events=[...selected.events].reverse().slice(0,3);
  return `<section class="recent-events" aria-label="Acontecimientos recientes">${events.length?events.map(e=>`<article class="recent-event"><time>${esc(dateLabel(exp.base.year,e.month,true))}</time><strong>${esc(e.title)}</strong><button class="text-button" data-event="${esc(e.id)}">Ver detalle</button></article>`).join(''):`<p class="muted">Todavía no hay acontecimientos simulados.</p>`}</section>`;
}
function feedPanel():string {
  const selected=branch(observedBranchId),events=[...selected.events].reverse().slice(0,30);
  return `<section class="panel feed-panel"><div class="feed-heading"><div><span class="eyebrow">EVENTOS · ${esc(branchName(selected.id))}</span><h2>Qué va ocurriendo</h2></div><span class="fiction-badge">SIMULADOS</span></div><div class="feed-list">${events.length?events.map(e=>`<article class="event"><div class="event-head"><i class="event-dot ${e.type}"></i><time>${esc(dateLabel(exp.base.year,e.month,true))}</time><span>${{external:'EXTERNO',economy:'ECONOMÍA',institution:'PROCEDIMIENTO',warning:'LÍMITE'}[e.type]}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p><button class="text-button" data-event="${esc(e.id)}">Ver cómo se generó ${icon('arrow',14)}</button></article>`).join(''):`<div class="empty-feed"><h3>La simulación comienza al avanzar.</h3><p>Los eventos se generan con reglas fijas; no son noticias reales.</p></div>`}</div><div class="feed-footer">No se simulan ganadores electorales ni sucesos reales.</div></section>`;
}
function householdPanel():string {
  const id=observedBranchId,selected=branch(id),other=branch(id==='A'?'B':'A'),paired=!!exp.comparisonActive;
  return `<section class="panel household-panel"><div><span class="eyebrow">HOGARES SIMULADOS</span><h2>Capacidad de compra por grupo</h2><p class="muted">Renta disponible real por persona y año. Grupos simulados; no son personas observadas ni representan deciles o salarios reales.</p></div><div class="table-scroll"><table><thead><tr><th>Grupo</th><th>Parte de la población</th><th>${esc(branchName(id))}</th>${paired?`<th>${esc(branchName(id==='A'?'B':'A'))}</th>`:''}</tr></thead><tbody>${selected.state.households.map((h,i)=>`<tr><td>${esc(h.label)}</td><td>${num(h.populationShare*100,0)} %</td><td>${num(h.realPerPerson,0)} euros/persona/año</td>${paired?`<td>${num(other.state.households[i]!.realPerPerson,0)} euros/persona/año</td>`:''}</tr>`).join('')}</tbody></table></div></section>`;
}
function tracePanel():string {
  const chosen=observedBranchId,current=branch(chosen),traces=current.state.trace,tr=traces.find(t=>t.id===selectedTrace)||traces[0];
  return `<section id="causes" class="trace-panel"><div class="chart-heading"><div><span class="eyebrow">MECANISMOS · ÚLTIMO PASO</span><h4>Cómo se obtuvo este resultado</h4></div><span>${esc(branchName(chosen))} · ${esc(dateLabel(exp.base.year,current.state.month))}</span></div>${tr?`<div class="mechanism-tabs">${traces.map(t=>`<button data-trace="${t.id}" class="${t.id===tr.id?'active':''}">${esc(t.title)}</button>`).join('')}</div><div class="trace-content"><span class="method-badge">${tr.assumption?'MECANISMO SIMPLIFICADO':'IDENTIDAD CONTABLE'}</span><h4>${esc(tr.title)}</h4><code>${esc(tr.equation)}</code><p>${esc(tr.explanation)}</p><div class="trace-inputs">${Object.entries(tr.inputs).map(([k,v])=>`<div><span>${esc(k)}</span><strong>${num(v,4)}</strong></div>`).join('')}<div class="trace-result"><span>Resultado · ${esc(tr.unit)}</span><strong>${num(tr.result,4)}</strong></div></div></div>`:`<p class="empty-trace">Avanza un mes para ver las reglas aplicadas y sus entradas.</p>`}</section>`;
}
function modelPage():string {
  return `<div class="page-body"><section class="panel prose"><span class="eyebrow">MODELO ${MODEL_VERSION}</span><h2>Las reglas est\u00e1n a la vista.</h2><p>El simulador parte de una situación inicial de España y calcula mes a mes qué ocurre al aplicar las decisiones que has elegido. Para hacerlo utiliza reglas que relacionan impuestos, ayudas, consumo, inversión, producción y precios. Aquí puedes entender esas relaciones y, más abajo, consultar las operaciones y los supuestos utilizados.</p><p>Es una representación simplificada: no reproduce todos los aspectos de un país y algunas relaciones todavía no están contrastadas con suficiente evidencia. Las opciones institucionales que solo generan acontecimientos están identificadas como tales.</p><div class="flow"><div>Impuestos y<br>transferencias</div><span>\u2192</span><div>Renta y<br>consumo</div><span>\u2192</span><div>Demanda y<br>producci\u00f3n</div><span>\u2192</span><div>Precios y<br>empleo</div></div><div class="flow"><div>Costes de<br>inversi\u00f3n</div><span>\u2192</span><div>Inversi\u00f3n<br>realizada</div><span>\u2192</span><div>Capital del<br>siguiente mes</div><span>\u2192</span><div>Capacidad<br>productiva</div></div><h3>Qu\u00e9 calcula y qu\u00e9 no</h3><p>El simulador representa de forma simplificada c\u00f3mo interact\u00faan la producci\u00f3n, los hogares, el sector p\u00fablico y el resto de la econom\u00eda. Mantiene relaciones b\u00e1sicas entre ingresos, gasto, deuda e inversi\u00f3n, pero no intenta reproducir todos los flujos financieros de una econom\u00eda real.</p><details class="model-disclosure"><summary>Detalle t\u00e9cnico</summary><p>T\u00e9cnicamente, el modelo no implementa un sistema stock-flow consistent completo: no cierra de forma expl\u00edcita todos los balances financieros de hogares, empresas, bancos, sector p\u00fablico y exterior.</p><p>Los impuestos directos cambian la renta disponible a ingresos constantes. El impuesto medio al consumo traslada de forma simplificada el 50 % del cambio mec\u00e1nico al nivel de precios; no suma inflaci\u00f3n subyacente cada mes. La rentabilidad neta y la fricci\u00f3n de invertir afectan a la inversi\u00f3n privada, que modifica capacidad con retardo. Las magnitudes de esas respuestas son hip\u00f3tesis editables en el c\u00f3digo, no resultados impuestos por una etiqueta.</p><p>Las reglas electorales, la libertad de expresi\u00f3n y la revisi\u00f3n judicial generan eventos o descripciones, <strong>sin efectos econ\u00f3micos cuantificados</strong>. No se modelan guerras, salida del euro, nacionalizaciones, transiciones constitucionales, corrupci\u00f3n, innovaci\u00f3n end\u00f3gena ni ganadores electorales.</p><h3>Interpretaci\u00f3n temporal</h3><p>La fotograf\u00eda inicial combina flujos del ejercicio y stocks a su cierre con fechas visibles. El primer mes simulado es enero del a\u00f1o siguiente. Los flujos mensuales se muestran a <strong>ritmo anualizado</strong>; no son el PIB anual realmente acumulado. La memoria inicial de precios se interpola geom\u00e9tricamente a partir de diciembre/diciembre.</p><p>Las medidas econ\u00f3micas se aplican en el primer paso de la rama, conservando deuda, poblaci\u00f3n y capital. No se modela un coste integral de transformaci\u00f3n del r\u00e9gimen. Los efectos del capital y de la producci\u00f3n incorporan retardos.</p><h3>Par\u00e1metros expl\u00edcitos</h3><div class="table-scroll"><table><thead><tr><th>Mecanismo</th><th>Valor</th><th>Alcance</th></tr></thead><tbody>${ASSUMPTIONS.map(([name,value,note])=>`<tr><td>${esc(name)}</td><td>${esc(value)}</td><td>${esc(note)}</td></tr>`).join('')}</tbody></table></div><h3>Decisiones económicas y su referencia</h3><p>El resumen de la simulación muestra las decisiones económicas aplicadas y sus diferencias respecto a la configuración económica predeterminada del experimento. Al omitir el cuestionario se parte de esa configuración; mantener todas las opciones también la conserva. Los valores cero de los controles de variación significan que no se añade un cambio, no que desaparezcan impuestos o ayudas.</p><p>La referencia se reconstruye con los mismos datos y la misma versión del modelo de la sesión. No equivale a las políticas vigentes en España ni a la trayectoria comparada. El indicador presenta orientación experimental de los cambios aplicados respecto al punto de partida, no clasifica la configuración inicial ni a la persona. Usa cinco cambios con escalas fijas y pesos iguales; no es una clasificación científica validada y no afecta a resultados económicos. La progresividad expresa el cambio en pp del diferencial alto menos bajo, con grupo intermedio sin cambio y topes que pueden limitarlo.</p><h3>Incertidumbre y dominio</h3><p>Una semilla produce una trayectoria. No se muestran intervalos estad\u00edsticos inventados. Los l\u00edmites de inflaci\u00f3n, paro y capacidad aparecen como avisos cuando se alcanzan; no equivalen a garant\u00edas del mundo real. Veinte a\u00f1os es un l\u00edmite t\u00e9cnico de exploraci\u00f3n, no un horizonte predictivo defendible.</p><h3>Datos locales y privacidad</h3><p>No hay cuentas, telemetr\u00eda, cookies de seguimiento, claves secretas ni llamadas a servicios de IA. El c\u00e1lculo ocurre en un worker del navegador. La sesi\u00f3n se conserva en IndexedDB cuando est\u00e1 disponible y puede exportarse. Al ocultar la pesta\u00f1a se pausa; un paso ya enviado puede terminar. No se recupera tiempo transcurrido con la aplicaci\u00f3n cerrada.</p></details></section></div>`;
}
function sourcesPage():string {
  const observations=exp.base.observations;
  return `<div class="page-body"><section class="panel prose"><span class="eyebrow">DATOS Y PROCEDENCIA</span><h2>Una fotograf\u00eda fechada, no una caja negra.</h2><p>Aquí puedes consultar de dónde salen los datos con los que comienza la simulación y a qué fecha corresponde cada uno. No todas las cifras se publican a la vez: por eso elegimos el último año para el que este catálogo reúne la información imprescindible. También distinguimos los datos de las fuentes de las cantidades que el simulador necesita estimar o construir.</p><p>La información está incluida en una versión revisada del catálogo y no se actualiza en directo durante la partida.</p><p>El código y los supuestos del motor también pueden revisarse en el <a href="${esc(REPOSITORY_URL)}" target="_blank" rel="noopener noreferrer" class="inline-link">repositorio del proyecto</a>.</p><div class="source-summary"><div><span>Año de los datos</span><strong>${exp.base.year}</strong></div><div><span>Datos incluidos</span><strong>${observations.length} / ${observations.length}</strong></div><div><span>Revisión de los datos</span><strong>${esc(dataset.reviewed)}</strong></div></div><p>Para elegir el a\u00f1o, usamos el m\u00e1s reciente del cat\u00e1logo que re\u00fane todos los datos necesarios y no depende de proyecciones. Tomamos la publicaci\u00f3n m\u00e1s reciente de cada serie y comprobamos que las partes del PIB sumen el total. <strong>La aplicaci\u00f3n no consulta fuentes en directo</strong> al abrir una partida. Para incorporar una publicaci\u00f3n nueva, revisamos el cat\u00e1logo y publicamos una versi\u00f3n actualizada.</p><p>Versi\u00f3n fijada: <code>${esc(dataset.version)}</code>. Los stocks de poblaci\u00f3n a 1 de enero del ejercicio siguiente se utilizan como cierre sin cambiar su fecha. Las estad\u00edsticas de encuesta y de cuentas nacionales conservan su car\u00e1cter estimado.</p><div class="table-scroll source-table"><table><thead><tr><th>Variable</th><th>Valor original</th><th>Referencia</th><th>Naturaleza</th><th>Fuente</th></tr></thead><tbody>${observations.map(o=>`<tr><td><strong>${esc(o.label)}</strong><small>${esc(o.note)}</small></td><td>${num(o.value,o.unit==='fraccion'?4:o.unit==='personas'?0:3)}<small>${esc(o.unit)}</small></td><td>${esc(o.referencePeriod)}</td><td><span class="tag">${o.kind==='observed'?'Observado':'Estimado por fuente'}</span></td><td><a href="${esc(o.source)}" target="_blank" rel="noopener noreferrer">${esc(o.sourceTitle)} \u2197</a><small>Publicaci\u00f3n: ${esc(o.published)}</small></td></tr>`).join('')}</tbody></table></div><h3>Lo que los datos no aportan por s\u00ed solos</h3><p>La distribuci\u00f3n de ingresos entre grupos, los tipos efectivos de impuestos, el capital inicial y la respuesta a los cambios son supuestos del modelo; no proceden de estas series. La ratio deuda/PIB se recalcula con el saldo redondeado y el PIB de la revisi\u00f3n seleccionada; puede diferir de la ratio de otra publicaci\u00f3n.</p><p>Se ha detectado una discrepancia entre el saldo vegetativo mencionado en el encabezamiento de la nota de nacimientos/defunciones y la resta de sus recuentos. Se utilizan los recuentos de la tabla y su resta expl\u00edcita. No se utiliza ese titular como dato.</p></section></div>`;
}
function dialog():string {
  if(!pendingDialog)return '';
  const isCompare=pendingDialog==='compare';
  const source=branch(compareSourceId),targetId=compareSourceId==='A'?'B':'A',date=dateLabel(exp.base.year,source.state.month);
  const title=isCompare?'Comparar otra configuración':'Empezar una nueva simulación';
  const message=isCompare?exp.comparisonActive?`Conservaremos «${branchName(compareSourceId)}» y sustituiremos «${branchName(targetId)}» por una alternativa que parte de ${date}. Se mantendrán lo ocurrido, la deuda, la población, el capital, los precios y los mismos sucesos externos. Los cambios empezarán en el paso siguiente.`:`Conservaremos «${branchName(compareSourceId)}» y crearemos una alternativa desde ${date} para que pruebes otras decisiones.`:pendingPresetOrigin?`Empezarás de nuevo desde los datos de partida. La simulación actual dejará de estar activa y se perderán su avance y sus comparaciones. La nueva usará el borrador preparado a partir de «${pendingPresetOrigin.partyName}». Puedes exportar una copia antes.`:`Empezarás de nuevo desde los datos de partida. La simulación actual dejará de estar activa y se perderán su avance y sus comparaciones. Puedes exportar una copia antes.`;
  return `<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" class="modal"><h2 id="dialog-title">${title}</h2><p>${message}</p>${isCompare&&exp.comparisonActive?`<p>Se conserva: <strong>${esc(branchName(compareSourceId))}</strong>. Se reemplaza: <strong>${esc(branchName(targetId))}</strong>.</p>`:''}<label class="field-label" for="new-scenario-name">Nombre de la ${isCompare?'comparación':'simulación'}</label><input id="new-scenario-name" maxlength="60" value="${esc(pendingScenarioName)}" autocomplete="off" placeholder="${isCompare?'Mi alternativa':'Mi simulación'}"><p class="muted">${isCompare?'La comparación no avanza el tiempo; los cambios empiezan en el siguiente paso.':'La nueva simulación parte de los datos iniciales del país.'}</p><div class="modal-actions"><button data-action="cancel-dialog">Cancelar</button><button data-action="export">Exportar</button><button class="primary" data-action="confirm-dialog">${isCompare?'Crear comparación':'Empezar de nuevo'}</button></div></section></div>`;
}
function presetStatus(status:'DOCUMENTED'|'APPROXIMATED'|'UNMAPPED',method:'DIRECT'|'STANDARDIZED_CODING'|'NONE'='DIRECT'):string {
  return status==='UNMAPPED'?'No se puede representar con claridad':method==='STANDARDIZED_CODING'?'Interpretación estandarizada del programa':'Propuesta cuantificada';
}
function presetCoverage(preset:PoliticalPreset):string {
  const values=Object.values(preset.policies),interpreted=values.filter(x=>x.mappingMethod!=='NONE').length,unmapped=values.length-interpreted;
  return `${interpreted} de ${values.length} decisiones representadas · ${unmapped} no representables con claridad`;
}
function presetActorLogo(preset:PoliticalPreset):string {
  if(!preset.logo)return '';
  const presentation=preset.logoPresentation,style=presentation?` style="--logo-scale:${presentation.scale??1};${presentation.maxWidth?`--logo-max-width:${presentation.maxWidth}px;`:''}${presentation.maxHeight?`--logo-max-height:${presentation.maxHeight}px;`:''}${presentation.objectPosition?`--logo-object-position:${presentation.objectPosition};`:''}"`:'';
  return `<span class="preset-logo"${style} aria-hidden="true"><img src="${esc(preset.logo.path)}" alt="" loading="eager"></span>`;
}
function presetValue(key:typeof POLITICAL_CONTROL_KEYS[number],preset:PoliticalPreset):string {
  const item=preset.policies[key];return item.status==='UNMAPPED'?'Se conserva el valor actual':valueLabel(key,item.mappingMethod==='STANDARDIZED_CODING'?positionToControlValue(exp.base,key,item.positionScore as Exclude<typeof item.positionScore,null>):item.value!);
}
function presetSourceDetails(preset:PoliticalPreset,sourceIds:string[]):string {
  if(!sourceIds.length)return '<p>No hay una propuesta cuantificable para este control en las fuentes revisadas.</p>';
  return sourceIds.map(id=>{const source=preset.sources.find(item=>item.id===id)!;return `<p><strong>${esc(source.title)}</strong><br>${esc(source.publisher)} · ${source.publishedAt?`publicada ${esc(source.publishedAt)}`:'fecha de publicación no indicada'} · consultada ${esc(source.accessedAt)}<br><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Consultar fuente oficial ↗</a></p>`;}).join('');
}
function presetDecisionRows(preset:PoliticalPreset):string {
  return POLITICAL_CONTROL_KEYS.map(key=>{
    const m=preset.policies[key],d=m.derivation;
    const why=m.status==='UNMAPPED'?`<p><strong>Motivo:</strong> ${esc(m.mappingRationale)}</p>`:'';
    const confidence=m.confidence==='HIGH'?'Alta':m.confidence==='MEDIUM'?'Media':m.confidence==='LOW'?'Baja':'No asignada';
    const artifactUrl=d?`${REPOSITORY_URL}/blob/main/docs/political-presets/derivations/${encodeURIComponent(d.id)}.json`:'';
    const derivation=d?`<section class="preset-derivation"><h4>Derivación reproducible · ${esc(d.id)}</h4><p><strong>Fórmula:</strong> <code>${esc(d.formula)}</code></p><ul>${d.officialInputs.map(input=>`<li>${esc(input.label)}: <strong>${esc(String(input.value))} ${esc(input.unit)}</strong> · ${esc(input.locator)} ${presetSourceDetails(preset,[input.sourceId])}</li>`).join('')}</ul><p><strong>Supuestos:</strong></p><ul>${d.assumptions.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p><strong>Resultado sin redondear:</strong> ${esc(d.rawResult.toPrecision(12))} ${esc(m.unit)} · <strong>aplicado:</strong> ${esc(String(d.result))} ${esc(m.unit)}.</p><p><strong>Sensibilidad:</strong> ${esc(d.sensitivity)}</p><p><strong>Confianza:</strong> ${confidence}. <a href="${esc(artifactUrl)}" target="_blank" rel="noopener noreferrer">Abrir artefacto de derivación ↗</a></p></section>`:'';
    const score=m.positionScore===null?'Sin score':`${m.positionScore>0?'+':''}${m.positionScore} · ${m.positionScore===-2?'fuerte reducción':m.positionScore===-1?'reducción':m.positionScore===0?'sin cambio claro':m.positionScore===1?'aumento':'fuerte aumento'}`;
    const evidence=m.evidence.length?`<p><strong>Medidas de evidencia:</strong> ${m.evidence.map(esc).join(', ')}</p>`:'';
    const review=m.reviewStatus?`<p><strong>Revisión humana:</strong> ${esc(m.reviewStatus==='APROBADO'?'APROBADO':'UNMAPPED_TRAS_REVISION')}</p>`:'';
    return `<article class="preset-decision"><div class="preset-decision-main"><strong>${esc(labels[key]!.label)}</strong><span>${esc(presetValue(key,preset))}</span><span class="preset-status">${esc(presetStatus(m.status,m.mappingMethod))}</span></div><details><summary>Por qué se ha aplicado este valor</summary><div class="preset-reason"><p><strong>Posición codificada:</strong> ${esc(score)}</p>${evidence}<p><strong>Evidencia programática:</strong> ${esc(m.sourceText)}</p><p><strong>Regla aplicada:</strong> ${esc(m.mappingRationale)}</p><p><strong>Valor final del control:</strong> ${esc(m.status==='UNMAPPED'?'Se conserva la configuración vigente':presetValue(key,preset))}</p><p><strong>Confianza:</strong> ${confidence}</p>${review}<p><strong>Fuente:</strong> ${esc(m.sourceLocator)}</p>${presetSourceDetails(preset,m.sourceIds)}${why}${derivation}</div></details></article>`;
  }).join('');
}
function presetDraftRows():string {
  const origin=presetDraftOrigin!;
  return POLITICAL_CONTROL_KEYS.map(key=>{const source=origin.originalPolicyValues[key]!,current=draft[key],status=origin.mappingStatuses[key]!,method=origin.mappingDetails?.[key]?.mappingMethod||'DIRECT',score=origin.mappingDetails?.[key]?.positionScore,changed=source!==current;return `<article class="preset-draft-row" data-preset-row="${key}">${control(key)}<div class="preset-draft-origin"><span class="preset-status">${esc(presetStatus(status,method))}</span><span>Valor inicial del borrador: <strong>${esc(valueLabel(key,source))}</strong></span><span data-preset-current="${key}">Valor actual: <strong>${esc(valueLabel(key,current))}</strong>${changed?' · Modificado manualmente':''}</span>${status==='UNMAPPED'?'<small>No se aplicó una propuesta; el borrador conserva el punto de partida hasta que lo edites.</small>':''}<details><summary>Por qué se ha aplicado este valor</summary><p>${status==='UNMAPPED'?'No hay una propuesta clara para asignar una posición; se mantienen los valores iniciales o los que ya tenías.':`Interpretación estandarizada del programa, score ${score==null?'no registrado':score>0?`+${score}`:score}.`}</p></details></div></article>`;}).join('');
}
function politicalPresetPage():string {
  if(presetStage==='list')return `<div class="page-body wizard-page"><section class="panel guided-setup political-preset-page"><div class="wizard-kicker"><span class="eyebrow">PROGRAMAS POLÍTICOS</span></div><h2>Elige un programa para revisar</h2><p class="wizard-explanation">Usa un programa electoral real como punto de partida. Aplicaremos únicamente las propuestas que podamos representar con los controles del simulador y te mostraremos cuáles no se han podido incorporar.</p><p class="preset-coverage-explanation">La cobertura indica cuántas decisiones del programa podemos representar en el simulador. No valora el programa ni anticipa sus resultados económicos.</p><div class="preset-cards">${POLITICAL_PRESETS.filter(p=>p.modelVersion===MODEL_VERSION).map(p=>`<article class="preset-card"><div><div class="preset-actor-heading">${presetActorLogo(p)}<h3>${esc(p.actorName)}</h3></div><p><strong>Elecciones generales · 23J 2023</strong></p><p>${esc(p.description)}</p><p class="preset-coverage">${esc(presetCoverage(p))}</p></div><button data-action="preset-select" data-preset-id="${esc(p.id)}">Revisar programa</button></article>`).join('')}</div><div class="wizard-actions"><button data-action="preset-back">Volver</button></div></section></div>`;
  const preset=findPoliticalPreset(selectedPresetId);
  if(presetStage==='detail'&&preset){const current=branch(observedBranchId).policy,diffRows=POLITICAL_CONTROL_KEYS.map(key=>{const m=preset.policies[key],next=m.status==='UNMAPPED'?current[key]:m.mappingMethod==='STANDARDIZED_CODING'?positionToControlValue(exp.base,key,m.positionScore as Exclude<typeof m.positionScore,null>):m.value!;return `<tr><th>${esc(labels[key]!.label)}</th><td>${esc(valueLabel(key,current[key]))}</td><td>${esc(m.status==='UNMAPPED'?'No hay una propuesta clara para esta decisión — se mantiene el valor actual':valueLabel(key,next))}</td><td>${esc(m.status==='UNMAPPED'?'Sin cambio':formatDecisionDifference({key,label:labels[key]!.label,unit:labels[key]!.unit,reference:current[key],applied:next,difference:next-current[key],meaning:''}))}</td></tr>`;}).join('');return `<div class="page-body wizard-page"><section class="panel guided-setup political-preset-page"><div class="wizard-kicker"><span class="eyebrow">REVISIÓN DEL PROGRAMA</span></div><div class="preset-detail-heading">${presetActorLogo(preset)}<h2>${esc(preset.actorName)} · programa electoral · 23J 2023</h2></div><p>${esc(preset.electionName)} · fecha ${esc(preset.electionDate)} · versión ${esc(preset.version)} · modelo ${esc(preset.modelVersion)}</p><p class="wizard-explanation">${esc(preset.description)}</p><p class="preset-coverage">${esc(presetCoverage(preset))}</p><p class="notice compact">Estos valores representan solo las propuestas del programa que podemos trasladar a los controles. No reproducen el programa completo.</p>${activeBranch().state.month>0||exp.comparisonActive?`<h3>Diferencias frente a ${esc(branchName(observedBranchId))} · ${esc(dateLabel(exp.base.year,activeBranch().state.month))}</h3><div class="table-scroll"><table><thead><tr><th>Decisión</th><th>Actual</th><th>Programa</th><th>Cambio</th></tr></thead><tbody>${diffRows}</tbody></table></div>`:''}<div class="preset-decision-list">${presetDecisionRows(preset)}</div><p class="preset-method-note">El modelo 0.3.0 aplica únicamente las posiciones codificadas con evidencia y no representa íntegramente los programas. Los resultados no son predicciones electorales ni valoraciones de los actores.</p><div class="wizard-actions"><button data-action="preset-list">Volver a programas</button><button class="primary" data-action="preset-apply" data-preset-id="${esc(preset.id)}">Usar este programa</button></div></section></div>`;}
  if(presetStage==='draft'&&preset&&presetDraftOrigin)return `<div class="page-body wizard-page"><section class="panel guided-setup political-preset-page preset-draft-page"><div class="wizard-kicker"><span class="eyebrow">BORRADOR EDITABLE · TODAVÍA SIN SIMULAR</span></div><h2>Revisa las decisiones</h2><p class="wizard-explanation">Origen: ${esc(preset.actorName)} · programa electoral 23J 2023. Edita libremente los ocho controles. La simulación o comparación no se creará hasta que confirmes.</p>${presetFromConfig&&activeBranch().state.month>0?`<p>Se mantendrá lo ocurrido hasta el mes ${activeBranch().state.month}; los cambios empezarán en el paso siguiente.</p>`:''}<div class="preset-draft-controls">${presetDraftRows()}</div><div class="wizard-actions"><button data-action="preset-detail">Volver al programa</button><button class="primary" data-action="preset-create">${presetFromConfig&&activeBranch().state.month>0?'Crear alternativa':'Confirmar configuración'}</button></div></section></div>`;
  return '';
}
function wizardPage():string {
  if(presetStage)return politicalPresetPage();
  if(wizardStep<0)return `<div class="page-body wizard-page"><section class="hero welcome-intro"><h1>¿Qué pasaría en España con otras decisiones?</h1><div class="intro-copy"><p>En Simula tu país puedes elegir distintas opciones sobre impuestos, ayudas, servicios públicos e inversión y observar cómo cambian la producción, los precios, el empleo y la capacidad de compra de los hogares. No necesitas saber economía para empezar: puedes responder un cuestionario o ajustar los controles directamente. Después podrás avanzar en el tiempo y comparar otra configuración desde la misma situación.</p><p>Partimos de datos sobre España y utilizamos reglas simplificadas para calcular los cambios. Los resultados sirven para explorar posibilidades, no para predecir lo que ocurrirá.</p>${renderVideoTutorial('intro')}</div></section><section class="panel guided-setup" aria-labelledby="wizard-intro-title"><h2 id="wizard-intro-title">Elige cómo configurar la simulación</h2><p class="wizard-explanation wizard-intro-copy">Puedes empezar desde cero, dejarte guiar por preguntas o usar un programa electoral real como punto de partida.</p><div class="setup-choice-cards"><article><h3>Configurar directamente</h3><p>Ajusta tú mismo impuestos, transferencias, inversión y el resto de decisiones antes de iniciar la simulación.</p><button data-action="wizard-cancel">Configurar directamente</button></article><article><h3>Responder un cuestionario</h3><p>Responde unas preguntas sencillas y obtendrás un borrador que podrás revisar y modificar antes de confirmar. No se ejecuta automáticamente.</p><button data-action="wizard-next">Iniciar el cuestionario</button></article><article><h3>Partir de un programa político</h3><p>Usa un programa electoral real como punto de partida. Verás qué propuestas podemos representar y cuáles no.</p><button data-action="preset-open">Ver programas políticos</button></article></div></section></div>`;
  if(wizardStep<WIZARD_QUESTIONS.length){
    const q=WIZARD_QUESTIONS[wizardStep]!,chosen=wizardAnswered[wizardStep]?wizardAnswers[wizardStep]:undefined;
    return `<div class="page-body wizard-page"><section class="panel guided-setup"><div class="wizard-kicker"><span class="eyebrow">CONFIGURACIÓN GUIADA</span><span class="wizard-count">Pregunta ${wizardStep+1} de ${WIZARD_QUESTIONS.length}</span></div><div class="wizard-progress" role="progressbar" aria-label="Progreso de las preguntas" aria-valuemin="1" aria-valuemax="${WIZARD_QUESTIONS.length}" aria-valuenow="${wizardStep+1}"><i style="width:${(wizardStep+1)/WIZARD_QUESTIONS.length*100}%"></i></div><h2>${q.prompt}</h2><p class="wizard-explanation">${q.explanation}</p><fieldset class="wizard-options"><legend class="visually-hidden">${esc(q.prompt)}</legend>${q.options.map((choice,index)=>`<label class="wizard-choice${wizardAnswered[wizardStep]&&chosen===choice.value?' active':''}"><input type="radio" name="wizard-choice" data-wizard-value="${choice.value===null?'keep':choice.value}" value="${index}" ${wizardAnswered[wizardStep]&&chosen===choice.value?'checked':''}><span><strong>${esc(choice.label)}</strong><small>${esc(wizardChoiceDetail(exp.base,wizardStep,choice,wizardAnswers))}</small></span></label>`).join('')}</fieldset><div class="wizard-actions"><button data-action="wizard-cancel">Cancelar</button><button data-action="wizard-back" ${wizardStep===0?'disabled':''}>Anterior</button><button class="primary" data-action="wizard-next" ${!wizardAnswered[wizardStep]?'disabled':''}>${wizardStep===WIZARD_QUESTIONS.length-1?'Ver resumen':'Siguiente'}</button></div></section></div>`;
  }
  if(wizardStep===WIZARD_QUESTIONS.length+1)return `<div class="page-body wizard-page"><section class="panel guided-setup"><div class="wizard-kicker"><span class="eyebrow">BORRADOR DEL CUESTIONARIO</span></div><h2>Revisa y modifica tu configuración</h2><p class="wizard-explanation">Las respuestas han generado este borrador. Puedes editar las decisiones antes de confirmar; la simulación no se ejecuta hasta que la crees.</p><div class="preset-draft-controls">${Object.keys(labels).map(k=>`<article class="preset-draft-row">${control(k as keyof typeof BOUNDS)}</article>`).join('')}</div><div class="wizard-actions"><button data-action="wizard-summary-back">Volver al resumen</button><button data-action="wizard-cancel">Cancelar</button><button class="primary" data-action="wizard-confirm-draft">Crear simulación</button></div></section></div>`;
  const summary=WIZARD_QUESTIONS.map((q,i)=>{const choice=q.options.find(item=>item.value===wizardAnswers[i]);return `<li><span>${esc(q.prompt)}</span><strong>${esc(choice?.label||'')}</strong><small>${esc(choice?wizardChoiceDetail(exp.base,i,choice,wizardAnswers):'')}</small><button data-action="wizard-review" data-step="${i}">Revisar</button></li>`;}).join('');
  const unchanged=WIZARD_QUESTIONS.every((_,i)=>wizardAnswers[i]===null);
  return `<div class="page-body wizard-page"><section class="panel guided-setup"><div class="wizard-kicker"><span class="eyebrow">RESUMEN DE TU CONFIGURACIÓN</span><span class="wizard-count">6 respuestas</span></div><h2>Así quedará tu simulación</h2><p class="wizard-explanation">${unchanged?'Vas a explorar la configuración inicial del simulador, sin cambios.':'Has elegido estos cambios para explorar. No anticipan resultados futuros.'}</p><details class="wizard-values"><summary>Ver valores</summary><ul class="wizard-summary">${summary}</ul></details><label class="field-label" for="wizard-scenario-name">Nombre de la simulación</label><input id="wizard-scenario-name" maxlength="60" value="${esc(wizardScenarioName)}" autocomplete="off" placeholder="Mi simulación"><div class="wizard-actions"><button data-action="wizard-back">Cambiar respuestas</button><button data-action="wizard-cancel">Cancelar</button><button class="primary" data-action="wizard-start">Crear simulación</button></div></section></div>`;
}
function aboutPage():string {
  return `<div class="page-body"><section class="panel prose"><span class="eyebrow">ACERCA DE SIMULA TU PAÍS</span><h2>Explora cómo cambia tu país</h2><p>Puedes empezar respondiendo el cuestionario o ajustando los controles directamente. Después avanza en el tiempo y compara otra configuración desde la misma situación para explorar cómo cambian los resultados. El simulador utiliza reglas simplificadas y sus resultados no son predicciones.</p><h3>Qué puedes probar</h3><p>Compara decisiones distintas desde los mismos datos de partida de España. Los grupos de hogares y las cuentas fiscales son representaciones simplificadas; no describen personas concretas. Puedes activar sucesos externos para explorar escenarios, pero no representan la frecuencia de acontecimientos reales.</p><h3>Cómo leer los resultados</h3><p>Los indicadores muestran lo que producen las reglas del simulador. Sirven para explorar posibilidades; no son predicciones, pruebas de causa y efecto ni recomendaciones. Que un resultado respete los límites del modelo no demuestra que ese escenario pueda ocurrir en la realidad.</p><h3>Transparencia y verificabilidad</h3><p>El motor puede inspeccionarse y el código fuente está disponible públicamente bajo la licencia del proyecto. Los resultados dependen de los datos, los supuestos y las relaciones definidas en el modelo. Consultar el código permite comprobar cómo se generan los escenarios, pero no convierte los resultados en predicciones ni garantiza que los supuestos sean correctos. Para una revisión técnica más profunda, puedes consultar el <a href="${esc(REPOSITORY_URL)}" target="_blank" rel="noopener noreferrer" class="inline-link">repositorio del proyecto</a> y la <a href="${esc(LICENSE_URL)}" target="_blank" rel="noopener noreferrer" class="inline-link">licencia</a>.</p><h3>Programas políticos</h3><p>Los presets son una interpretación estandarizada de las posiciones identificables en programas electorales: no reproducen íntegramente un programa ni estiman su coste presupuestario. Cada posición se vincula a evidencia y a los pasos ya existentes en los controles. Cuando falta evidencia suficiente, no se asigna una posición. Los resultados son los del modelo aplicado a esa configuración, no una predicción electoral ni una valoración de la candidatura.</p><h3>Privacidad y almacenamiento</h3><p>Los cálculos ocurren localmente en el navegador. La configuración se guarda en este navegador cuando está disponible; no se sincroniza. Exporta una copia si quieres conservarla.</p><h3>Versiones</h3><p>Aplicación ${esc(BUILD_INFO.appVersion)} · motor ${MODEL_VERSION}. La versión de datos y la fecha de revisión se detallan en <a href="#sources" data-tab="sources" class="inline-link">Datos y fuentes</a>; las ecuaciones, unidades y supuestos están en <a href="#model" data-tab="model" class="inline-link">Cómo funciona</a>.</p></section></div>`;
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
    if(oldElement instanceof HTMLInputElement&&oldElement.type==='radio'&&['decision-answer','wizard-choice'].includes(oldElement.name))oldElement.checked=(newElement as HTMLInputElement).checked;
    else if(oldElement instanceof HTMLInputElement&&document.activeElement!==oldElement){
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
function detailStateKey(detail:HTMLDetailsElement):string {
  const owner=detail.closest<HTMLElement>('[id]')?.id||detail.closest<HTMLElement>('section')?.className||'app';
  return `${owner}:${detail.querySelector(':scope > summary')?.textContent?.trim()||''}`;
}
function simulationIntro():string {
  const origin=sessionPresetBranchOrigins[observedBranchId]||(observedBranchId==='B'?sessionPresetOrigin:undefined);
  const originNote=origin?`<div class="preset-origin-note">Basada inicialmente en el programa electoral de ${esc(origin.actorName||origin.partyName)} · 23J 2023${changedPresetValues(origin,branch(observedBranchId).policy).length?` <details><summary>Ver cambios del usuario</summary><ul>${changedPresetValues(origin,branch(observedBranchId).policy).map(key=>`<li>${esc(labels[key]?.label||key)}: ${esc(valueLabel(key,origin.originalPolicyValues[key]!))} → ${esc(valueLabel(key,branch(observedBranchId).policy[key]))}</li>`).join('')}</ul></details>`:''}</div>`:'';
  return `<section class="hero welcome-intro"><h1>¿Qué pasaría en España con otras decisiones?</h1><div class="intro-copy"><p>En Simula tu país puedes elegir distintas opciones sobre impuestos, ayudas, servicios públicos e inversión y observar cómo cambian la producción, los precios, el empleo y la capacidad de compra de los hogares. No necesitas saber economía para empezar: puedes responder un cuestionario o ajustar los controles directamente. Después podrás avanzar en el tiempo y comparar otra configuración desde la misma situación.</p><p>Partimos de datos sobre España y utilizamos reglas simplificadas para calcular los cambios. Los resultados sirven para explorar posibilidades, no para predecir lo que ocurrirá.</p>${originNote}${introOpen&&!restoredSession?`<div class="intro-actions"><button data-action="wizard">Iniciar el cuestionario</button><button data-action="open-decisions">Configurar directamente</button><button data-action="preset-open">Partir de un programa político</button></div>`:''}${renderVideoTutorial('home')}</div></section>`;
}
function simulationControls():string {
  const primaryId=observedBranchId,primary=branch(primaryId),paired=!!exp.comparisonActive;
  const date=esc(dateLabel(exp.base.year,primary.state.month));
  const branchSelector=paired?`<label class="context-observed">Estás viendo<select id="observed-branch" aria-label="Estás viendo: selección de simulación"><option value="A" ${primaryId==='A'?'selected':''}>${esc(branchName('A'))}</option><option value="B" ${primaryId==='B'?'selected':''}>${esc(branchName('B'))}</option></select></label>`:`<div class="context-observed"><span>Estás viendo</span><strong>${esc(branchName(primaryId))}</strong></div>`;
  return `<section class="context-bar simulation-controls"><div class="simulation-state">${branchSelector}<div class="context-date"><span>Fecha simulada</span><strong id="sim-date">${date}</strong></div></div><button data-action="decisions-toggle" aria-expanded="${decisionsOpen}">${icon('sliders',17)}Configurar</button><div class="context-time"><div id="time-controls">${timeControls()}</div><div class="month-counter context-month" id="month-counter">${esc(monthText(primary.state.month))} · límite de ${MAX_MONTHS/12} años</div></div></section>`;
}

function shareSection():string {
  const id=observedBranchId,url=scenarioUrl(exp,datasetHash,dataset.countryCode,id,location.origin);
  const summary=scenarioSummary(exp,id),message=shareText(summary),social=socialShareUrls(url,message);
  const metrics=scenarioMetrics(branch(id));
  return `<section class="scenario-sharing" aria-labelledby="share-title"><div class="scenario-sharing-copy"><h2 id="share-title">Tu escenario</h2><p>${esc(summary)}</p><p>Este resultado corresponde a un escenario simulado. No es una predicción. <button data-tab="model" class="share-method-link">Cómo se calcula</button></p></div><div class="scenario-sharing-actions"><button type="button" data-action="share-primary" class="primary">Compartir escenario</button><button type="button" data-action="share-options" aria-expanded="${shareOpen}" aria-controls="share-options-panel">Opciones</button></div>${shareOpen?`<div class="share-options-panel" id="share-options-panel" role="group" aria-label="Opciones para compartir"><p>${esc(message)}</p>${metrics.length?`<p class="share-result-summary">${metrics.slice(0,3).map(item=>`${esc(item.label)}: ${esc(item.value)}`).join(' · ')}</p>`:''}<div class="share-option-buttons"><button type="button" data-action="share-copy">Copiar enlace</button><a href="${esc(social.whatsapp)}" data-share-method="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="${esc(social.x)}" data-share-method="x" target="_blank" rel="noopener noreferrer">X</a><button type="button" data-action="share-image">Descargar imagen</button></div><label for="share-url-manual">Enlace del escenario</label><input id="share-url-manual" type="text" readonly value="${esc(url)}"><canvas id="share-card-preview" width="1200" height="630" role="img" aria-label="Vista previa de la tarjeta del escenario"></canvas></div>`:''}</section>`;
}

function editorialPanel():string {
  if(!editorialActive)return '';
  const item=editorialActive,changes=economicDecisionChanges(baselinePolicy(exp.base),branch(observedBranchId).policy);
  return `<section class="editorial-scenario" aria-labelledby="editorial-title"><span class="eyebrow">ESCENARIO DE DEMOSTRACIÓN</span><h2 id="editorial-title">${esc(item.title)}</h2><p class="editorial-question">${esc(item.question)}</p><p>${esc(item.description)}</p><h3>Configuración</h3><ul>${changes.map(change=>`<li>${esc(formatDecisionSummary(change))}</li>`).join('')}</ul><p>${esc(scenarioSummary(exp,observedBranchId))}</p><button type="button" data-action="editorial-modify">Modificar este escenario</button></section>`;
}
function growthContext():{country:string;horizon:number;changed_decisions_count:number} {
  return {country:dataset.countryCode,horizon:branch(observedBranchId).state.month,changed_decisions_count:changedDecisionsCount(exp,observedBranchId)};
}
function markScenarioModified():void {
  editorialActive=undefined;
  if(scenarioSource==='shared_url'&&!sharedModified){
    sharedModified=true;emitGrowthEvent({name:'shared_scenario_modified',country:dataset.countryCode,horizon:branch(observedBranchId).state.month,scenario_version:SCENARIO_URL_VERSION});
  }
}
async function shareCurrentScenario():Promise<void> {
  const url=scenarioUrl(exp,datasetHash,dataset.countryCode,observedBranchId,location.origin);
  const text=shareText(scenarioSummary(exp,observedBranchId));
  if(typeof navigator.share==='function'){
    emitGrowthEvent({name:'share_clicked',method:'native'});
    try{await navigator.share({title:'Simula tu país',text,url});emitGrowthEvent({name:'share_completed',method:'native'});return;}
    catch(error){if((error as DOMException).name==='AbortError')return;}
  }
  shareOpen=true;render();document.querySelector<HTMLButtonElement>('[data-action="share-copy"]')?.focus();
}
async function copyScenarioUrl():Promise<void> {
  emitGrowthEvent({name:'share_clicked',method:'copy'});
  const url=scenarioUrl(exp,datasetHash,dataset.countryCode,observedBranchId,location.origin);
  try{await navigator.clipboard.writeText(url);showToast('Enlace copiado');emitGrowthEvent({name:'share_completed',method:'copy'});}
  catch{showToast('No se pudo copiar el enlace. Puedes copiarlo manualmente.',true);const input=document.querySelector<HTMLInputElement>('#share-url-manual');input?.focus();input?.select();}
}

function closeTutorial():void {
  document.querySelector<HTMLVideoElement>('#tutorial-video')?.pause();
  tutorialOpen=false;
  const origin=tutorialReturnFocus;tutorialReturnFocus=null;
  render();
  if(origin?.isConnected)origin.focus();
  else document.querySelector<HTMLButtonElement>(`[data-action="open-tutorial"][data-tutorial-variant="${tutorialReturnVariant}"]`)?.focus();
}

function render():void {
  if(!exp)return;
  const scrolls=[...document.querySelectorAll<HTMLElement>('.config-content,.feed-list')].map(e=>[e.className,e.scrollTop] as const);
  const openDetails=new Map([...document.querySelectorAll<HTMLDetailsElement>('#app details')].map(detail=>[detailStateKey(detail),detail.open]));
  const tabs:[string,string,string][]=[['lab','Simulador','chart'],['model','Cómo funciona','book'],['sources','Datos y fuentes','globe'],['about','Acerca de','info']];
  let page='';
  if(currentTab==='lab')page=`${editorialPanel()}<section class="simulation-header" aria-label="Introducción y controles de simulación"><div class="simulation-intro">${simulationIntro()}</div>${simulationControls()}</section><div class="lab-layout">${mainDashboard()}</div>`;
  else if(currentTab==='model')page=modelPage();else if(currentTab==='sources')page=sourcesPage();else if(currentTab==='about')page=aboutPage();else page=wizardPage();
  const countryContext=`<div class="global-country"><span class="spain-flag" aria-hidden="true"></span><div><strong>España</strong><span>Datos de partida: ${exp.base.year}</span></div><button data-tab="sources" aria-label="Consultar datos y fuentes de España">${icon('chevron',14)}</button></div>`;
  patchHtml(`<header class="topbar"><a class="brand" href="#" data-action="home" ${mobileMenuOpen?'inert':''}><span class="brand-mark">S</span><strong>Simula tu país</strong></a><button class="mobile-menu-toggle" type="button" data-action="menu-toggle" aria-controls="primary-navigation" aria-expanded="${mobileMenuOpen}" aria-label="Abrir menú" ${mobileMenuOpen?'inert':''}><span></span><span></span><span></span></button>${mobileMenuOpen?'<button class="mobile-nav-scrim" data-action="menu-close" aria-label="Cerrar menú" tabindex="-1"></button>':''}<nav id="primary-navigation" class="${mobileMenuOpen?'menu-open':''}" aria-label="Secciones" ${mobileMenuOpen?'role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title"':''}><div class="mobile-nav-heading"><strong id="mobile-nav-title">Menú</strong><button type="button" data-action="menu-close" aria-label="Cerrar menú">${icon('close',20)}</button></div><div class="mobile-nav-context">${countryContext}</div><button type="button" class="mobile-nav-configure" data-action="mobile-configure">${icon('sliders',16)}Configurar</button>${tabs.map(([id,label,ico])=>`<button aria-current="${currentTab===id||currentTab==='wizard'&&id==='lab'?'page':'false'}" data-tab="${id}" class="${currentTab===id||currentTab==='wizard'&&id==='lab'?'active':''}">${icon(ico,15)}${label}</button>`).join('')}<button type="button" class="mobile-nav-settings" data-action="open-settings">${icon('settings',16)}Preferencias</button></nav><div class="topbar-tools">${countryContext}<button data-action="open-settings" class="settings-trigger">${icon('settings',16)}Ajustes</button></div></header><div id="storage-warning" class="storage-warning" role="alert" ${saveStatus==='unavailable'?'':'hidden'} ${mobileMenuOpen?'inert':''}>No se está guardando esta simulación. <button data-action="export">Exportar ahora</button> o <button data-action="open-settings">consultar detalles</button>.</div><main ${mobileMenuOpen?'inert':''}>${page}<footer><span>Simula tu país · aplicación ${esc(BUILD_INFO.appVersion)} · modelo ${MODEL_VERSION} · catálogo ${esc(dataset.version)} · revisión ${esc(dataset.reviewed)}</span><nav aria-label="Enlaces del proyecto"><button data-tab="model">Metodología</button><button data-tab="sources">Fuentes</button><a href="${esc(REPOSITORY_URL)}" target="_blank" rel="noopener noreferrer">Código fuente</a><a href="${esc(LICENSE_URL)}" target="_blank" rel="noopener noreferrer">Licencia</a></nav></footer></main><input type="file" id="import-file" accept="application/json,.json" hidden>${settingsDialog()}${dialog()}${tutorialOpen?renderVideoTutorialDialog():''}`);
  document.body.classList.toggle('mobile-nav-open',mobileMenuOpen);
  for(const [cls,top]of scrolls){const e=document.getElementsByClassName(cls)[0];if(e)e.scrollTop=top;}
  document.querySelectorAll<HTMLDetailsElement>('#app details').forEach(detail=>{const open=openDetails.get(detailStateKey(detail));if(open!==undefined)detail.open=open;});
  const shareCanvas=document.querySelector<HTMLCanvasElement>('#share-card-preview');if(shareCanvas)drawScenarioCard(shareCanvas,exp,observedBranchId);
  if(tutorialOpen&&!document.querySelector('.tutorial-modal :focus'))document.querySelector<HTMLButtonElement>('[data-action="close-tutorial"]')?.focus();
  else if(pendingDialog)document.querySelector<HTMLButtonElement>('[data-action="cancel-dialog"]')?.focus();
  else if(settingsOpen&&!document.querySelector('.settings-modal button:focus'))document.querySelector<HTMLButtonElement>('.settings-modal [data-action="close-settings"]')?.focus();
  else if(!settingsOpen&&settingsReturnFocus){const focus=settingsReturnFocus;settingsReturnFocus=null;focus.focus();}
  else if(dialogReturnFocus&&!busy){const origin=dialogReturnFocus;dialogReturnFocus=null;const target=document.querySelector<HTMLInputElement>('[data-policy]:not(:disabled)');if(target)target.focus();else restoreDialogFocus(origin);}
  else if(mobileMenuOpen&&!document.querySelector('#primary-navigation :focus'))document.querySelector<HTMLButtonElement>('.mobile-nav-heading button')?.focus();
  installChartTooltip();
}
function installChartTooltip():void {
  const area=document.querySelector<HTMLElement>('#chart-area'),tip=document.querySelector<HTMLElement>('#chart-tip');if(!area||!tip)return;
  area.onpointermove=(event)=>{
    const id=observedBranchId,primary=branch(id),other=branch(id==='A'?'B':'A');if(!primary.state.month)return;
    const rect=area.getBoundingClientRect(),viewX=(event.clientX-rect.left)/rect.width*850;
    const month=Math.max(0,Math.min(primary.state.month,Math.round((viewX-84)/720*Math.max(12,primary.state.month))));
    const value=(b:Experiment['a'])=>`${num(b.history[month]![metric],METRICS[metric].decimals)} ${metricUnitLabel(metric)}`;
    tip.hidden=false;tip.textContent=exp.comparisonActive?`${dateLabel(exp.base.year,month,true)} · ${branchName(id)}: ${value(primary)} · ${branchName(id==='A'?'B':'A')}: ${value(other)}`:`${dateLabel(exp.base.year,month,true)} · ${branchName(id)}: ${value(primary)}`;
    tip.style.left=`${Math.max(8,Math.min(rect.width-300,event.clientX-rect.left-100))}px`;
  };area.onpointerleave=()=>{tip.hidden=true;};
}
async function applyDraft():Promise<void> {
  if(busy){if(playing)queuedLivePolicy={branchId:configuredBranchId,policy:{...draft}};return;}clearTimeout(timer);busy=true;document.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-policy]').forEach(el=>el.disabled=true);renderControls();
  const submitted={...draft},id=configuredBranchId;
  try{const changed=JSON.stringify(submitted)!==JSON.stringify(branch(id).policy);exp=await command('CONFIGURE',{branchId:id,policy:submitted});if(changed)markScenarioModified();draft={...branch(id).policy};firstRunSetup=false;markConfigured();persist();}
  catch(e){showToast((e as Error).message,true);draft={...branch(id).policy};}
  finally{busy=false;render();schedule();}
}
function exportCSV():void {
  const metrics=Object.keys(METRICS) as Metric[],id=observedBranchId,primary=branch(id),other=branch(id==='A'?'B':'A'),paired=!!exp.comparisonActive;
  const rows=[['mes','periodo',...metrics.flatMap(k=>paired?[`${METRICS[k].label} (${metricUnitLabel(k)})_${branchName(id)}`,`${METRICS[k].label} (${metricUnitLabel(k)})_${branchName(id==='A'?'B':'A')}`]:[`${METRICS[k].label} (${metricUnitLabel(k)})_${branchName(id)}`])].join(';'),...primary.history.map((point,i)=>[point.month,dateLabel(exp.base.year,point.month,true),...metrics.flatMap(k=>paired?[point[k],other.history[i]![k]]:[point[k]])].join(';'))];
  download(`simula-tu-pais-serie-${exp.seed}-mes-${primary.state.month}.csv`,'\ufeff'+rows.join('\n'),'text/csv;charset=utf-8');
}
root.addEventListener('input',e=>{
  const el=e.target as HTMLInputElement,key=el.dataset.policy;
  if(key&&el.type==='range'){
    const value=Number(el.value);(draft as unknown as Record<string,unknown>)[key]=value;const out=document.querySelector(`#out-${key}`);if(out)out.textContent=valueLabel(key,value);
    if(presetStage==='draft'&&presetDraftOrigin){const original=presetDraftOrigin.originalPolicyValues[key as typeof POLITICAL_CONTROL_KEYS[number]],live=document.querySelector<HTMLElement>(`[data-preset-current="${key}"]`);if(live&&original!==undefined)live.innerHTML=`Valor actual: <strong>${esc(valueLabel(key,value))}</strong>${original!==value?' · Modificado manualmente':''}`;}
  }
});
  root.addEventListener('change',e=>{
  const el=e.target as HTMLInputElement,key=el.dataset.policy;
  if(key){(draft as unknown as Record<string,unknown>)[key]=el.type==='checkbox'?el.checked:key==='elections'?el.value:Number(el.value);return;}
  if(el.id==='speed'){speed=Number(el.value);schedule();}
  if(el.id==='observed-branch'){observedBranchId=el.value as 'A'|'B';configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};try{localStorage.setItem('simula-observed-branch',observedBranchId);}catch{}render();}
  if(el.id==='compare-source'){compareSourceId=el.value as 'A'|'B';}
  if(el.dataset.scenarioName){const id=el.dataset.scenarioName as 'A'|'B',value=el.value.trim().slice(0,60);if(value){exp={...exp,branchNames:{...(exp.branchNames||{A:'Simulación original',B:'Alternativa'}),[id]:value}};persist();render();}}
  if(el.id==='seed')void (async()=>{if(busy||pending.size||activeBranch().state.month>0||exp.comparisonActive)return;pause();busy=true;const seed=Number(el.value),changed=seed!==exp.seed;try{exp=await command('INIT',{dataset,seed,policy:draft,primary:true});if(changed)markScenarioModified();draft={...exp.b.policy};persist();}catch(err){showToast((err as Error).message,true);}finally{busy=false;render();}})();
  if(el.id==='import-file'&&el.files?.[0])void importFile(el.files[0]);
});
async function importFile(file:File):Promise<void> {
  pause();if(busy)return;
  if(file.size>100_000){showToast('La sesi\u00f3n supera el l\u00edmite de 100 KB.',true);return;}
  busy=true;
  try{const s=validateSession(JSON.parse(await file.text()),exp.base,datasetHash);exp=await command('RESTORE',s);scenarioSource='local';preserveStoredSession=false;editorialActive=undefined;sessionEngineBuild=s.engineBuild||{engineVersion:s.modelVersion,commitSha:null};sessionPresetOrigin='presetOrigin' in s?s.presetOrigin:undefined;sessionPresetBranchOrigins='presetBranchOrigins' in s?s.presetBranchOrigins||{}:{};observedBranchId=exp.primaryId||'B';configuredBranchId=exp.comparisonActive?(observedBranchId==='A'?'B':'A'):observedBranchId;draft={...branch(configuredBranchId).policy};persist();showToast('Sesi\u00f3n importada y recalculada con el modelo fijado.');}
  catch(e){showToast((e as Error).message,true);}
  finally{busy=false;render();}
}
root.addEventListener('click',e=>{
  const el=(e.target as Element).closest<HTMLElement>('button,a');if(!el)return;
  const tab=el.dataset.tab,ct=el.dataset.configTab,mt=el.dataset.metric,tr=el.dataset.trace,eventId=el.dataset.event;
  if(tab){mobileMenuOpen=false;pause();if(currentTab==='lab'&&tab!=='lab'&&introOpen)dismissIntro();currentTab=tab==='lab'&&firstRunSetup?'wizard':tab as typeof currentTab;render();return;}
  if(ct){configTab=ct as typeof configTab;render();return;}
  if(mt){metric=mt as Metric;render();return;}
  if(tr){selectedTrace=tr;render();document.querySelector('#causes')?.scrollIntoView({block:'nearest'});return;}
  if(eventId){showEvent(eventId);return;}
  if(el.dataset.action==='appearance'){setAppearance(el.dataset.appearance as Appearance);render();return;}
  if(el.id==='save-help'){e.preventDefault();toggleSaveHelp();return;}
  if(el.dataset.view){activeViewPanel=el.dataset.view as typeof activeViewPanel;render();return;}
  if(el.dataset.shareMethod==='whatsapp'||el.dataset.shareMethod==='x'){emitGrowthEvent({name:'share_clicked',method:el.dataset.shareMethod});return;}
  const action=el.dataset.action;if(!action)return;e.preventDefault();
  if(action==='share-primary'){void shareCurrentScenario();return;}
  if(action==='share-options'){shareOpen=!shareOpen;render();if(shareOpen)document.querySelector<HTMLButtonElement>('[data-action="share-copy"]')?.focus();else document.querySelector<HTMLButtonElement>('[data-action="share-options"]')?.focus();return;}
  if(action==='share-copy'){void copyScenarioUrl();return;}
  if(action==='share-image'){void downloadScenarioCard(exp,observedBranchId).catch(error=>showToast((error as Error).message,true));return;}
  if(action==='editorial-modify'){decisionsReturnFocus=el;configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};decisionsOpen=true;render();document.querySelector<HTMLButtonElement>('[data-action="close-decisions"]')?.focus();return;}
  if(action==='open-tutorial'){tutorialReturnFocus=el;tutorialReturnVariant=el.dataset.tutorialVariant==='home'?'home':'intro';tutorialOpen=true;render();return;}
  if(action==='close-tutorial'){closeTutorial();return;}
  if(action==='open-settings'){settingsReturnFocus=mobileMenuOpen?document.querySelector<HTMLButtonElement>('.mobile-menu-toggle'):el;mobileMenuOpen=false;settingsOpen=true;render();return;}
  if(action==='close-settings'){settingsOpen=false;render();return;}
  if(action==='open-decisions'){settingsOpen=false;decisionsReturnFocus=settingsReturnFocus||el;settingsReturnFocus=null;configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};decisionsOpen=true;render();document.querySelector<HTMLButtonElement>('[data-action="close-decisions"]')?.focus();return;}
  if(action==='open-advanced'){settingsOpen=false;decisionsReturnFocus=settingsReturnFocus||el;settingsReturnFocus=null;configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};decisionsMode='controls';configTab='advanced';decisionsOpen=true;render();document.querySelector<HTMLButtonElement>('[data-action="close-decisions"]')?.focus();return;}
  if(action==='observe-branch'){selectObservedBranch(el.dataset.branch as 'A'|'B');return;}
  if(action==='menu-toggle'){mobileMenuOpen=true;render();return;}
  if(action==='menu-close'){mobileMenuOpen=false;render();document.querySelector<HTMLButtonElement>('.mobile-menu-toggle')?.focus();return;}
  if(action==='play'){if(playing){pause();renderControls();}else if(activeBranch().state.month<MAX_MONTHS){playing=true;renderControls();schedule();}}
  if(action==='step'){pause();renderControls();void advanceTime(1);}
  if(action==='year'){pause();renderControls();void advanceTime(12);}
  if(action==='export'){const month=activeBranch().state.month;download(`simula-tu-pais-sesion-${exp.seed}-mes-${month}.json`,JSON.stringify(exportSession(exp,datasetHash,sessionEngineBuild,sessionPresetOrigin,sessionPresetBranchOrigins),null,2));}
  if(action==='import')document.querySelector<HTMLInputElement>('#import-file')?.click();
  if(action==='csv')exportCSV();
  if(action==='decisions-toggle'||action==='mobile-configure'){decisionsReturnFocus=mobileMenuOpen?document.querySelector<HTMLButtonElement>('.mobile-menu-toggle'):el;mobileMenuOpen=false;configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};wizardStep=0;wizardAnswers=Array(6).fill(null);wizardAnswered=Array(6).fill(false);decisionsOpen=true;render();document.querySelector<HTMLButtonElement>('[data-action="close-decisions"]')?.focus();return;}
  if(action==='close-decisions'){decisionsOpen=false;render();decisionsReturnFocus?.focus();decisionsReturnFocus=null;return;}
  if(action==='decision-mode'){decisionsMode=el.dataset.mode as typeof decisionsMode;render();return;}
  if(action==='sidebar-question-prev'){wizardStep=Math.max(0,wizardStep-1);render();return;}
  if(action==='sidebar-question-next'){wizardStep=Math.min(WIZARD_QUESTIONS.length-1,wizardStep+1);render();return;}
  if(action==='cancel-decisions'){draft={...branch(configuredBranchId).policy};decisionsOpen=false;render();decisionsReturnFocus?.focus();decisionsReturnFocus=null;return;}
  if(action==='apply-decisions'){if(activeBranch().state.month>0||exp.comparisonActive){pendingPrimaryPolicy={...draft};pendingDialog='compare';compareSourceId=observedBranchId;dialogReturnFocus=el;render();}else void applyDraft();decisionsOpen=false;render();return;}
  if(action==='home'){mobileMenuOpen=false;pause();currentTab=firstRunSetup?'wizard':'lab';render();}
  if(action==='dismiss-intro'){dismissIntro();firstRunSetup=false;markConfigured();currentTab='lab';if(el.dataset.openDecisions){configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};decisionsOpen=true;}render();if(decisionsOpen)document.querySelector<HTMLButtonElement>('[data-action="close-decisions"]')?.focus();}
  if(action==='wizard'){dismissIntro();wizardAnswers=Array(6).fill(null);wizardAnswered=Array(6).fill(true);wizardScenarioName='';wizardStep=-1;currentTab='wizard';render();}
  if(action==='preset-open'||action==='preset-open-from-config'){pause();presetFromConfig=action==='preset-open-from-config';presetReturnTab=currentTab==='wizard'?'wizard':'lab';if(presetFromConfig)decisionsOpen=false;presetStage='list';currentTab='wizard';render();return;}
  if(action==='preset-back'){presetStage='';selectedPresetId='';currentTab=presetReturnTab;if(presetFromConfig){decisionsOpen=true;draft={...branch(observedBranchId).policy};}presetFromConfig=false;render();return;}
  if(action==='preset-select'){selectedPresetId=el.dataset.presetId||'';presetStage='detail';render();return;}
  if(action==='preset-list'){presetStage='list';render();return;}
  if(action==='preset-detail'){presetStage='detail';render();return;}
  if(action==='preset-apply'){
    const selected=findPoliticalPreset(el.dataset.presetId||'');if(!selected)return;
    try{const useCurrent=presetFromConfig&&(activeBranch().state.month>0||exp.comparisonActive),applied=applyPoliticalPreset(exp.base,selected,MODEL_VERSION,useCurrent?branch(observedBranchId).policy:undefined,useCurrent?activeBranch().state.month:0);draft={...applied.policy};presetDraftOrigin=applied.origin;presetStage='draft';render();}
    catch(error){showToast((error as Error).message,true);}return;
  }
  if(action==='preset-create'){if(!presetDraftOrigin)return;const appliedOrigin=presetDraftOrigin;if(presetFromConfig){if(activeBranch().state.month>0||exp.comparisonActive){pendingPrimaryPolicy={...draft};pendingPresetOrigin=appliedOrigin;pendingDialog='compare';compareSourceId=observedBranchId;dialogReturnFocus=el;presetStage='';presetFromConfig=false;render();return;}sessionPresetBranchOrigins[configuredBranchId]=appliedOrigin;sessionPresetOrigin=undefined;currentTab='lab';presetStage='';presetFromConfig=false;decisionsOpen=false;void applyDraft();return;}if(activeBranch().state.month>0||exp.comparisonActive){pendingPrimaryPolicy={...draft};pendingPresetOrigin=appliedOrigin;pendingDialog='reset';dialogReturnFocus=el;render();return;}const resultOrigin={...appliedOrigin};void startPrimary({...draft},exp.seed,'',resultOrigin);return;}
  if(action==='wizard-cancel'){presetStage='';presetDraftOrigin=undefined;currentTab='lab';dismissIntro();firstRunSetup=false;markConfigured();if(wizardStep<0){configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};decisionsOpen=true;}persist();render();if(decisionsOpen)document.querySelector<HTMLButtonElement>('[data-action="close-decisions"]')?.focus();}
  if(action==='wizard-back'){wizardStep=Math.max(-1,wizardStep-1);render();}
  if(action==='wizard-next'){if(wizardStep===-1||wizardAnswered[wizardStep]){wizardStep=Math.min(WIZARD_QUESTIONS.length,wizardStep+1);render();}}
  if(action==='wizard-start'){
    try{wizardDraftPolicy=wizardPolicy(exp.base,wizardAnswers);draft={...wizardDraftPolicy};wizardStep=WIZARD_QUESTIONS.length+1;render();}
    catch(err){showToast((err as Error).message,true);}
  }
  if(action==='wizard-summary-back'){wizardStep=WIZARD_QUESTIONS.length;render();}
  if(action==='wizard-confirm-draft'){
    try{pendingPrimaryPolicy={...draft};if(activeBranch().state.month>0||exp.comparisonActive){pendingDialog='reset';pendingScenarioName=wizardScenarioName;dialogReturnFocus=el;render();}else void startPrimary(pendingPrimaryPolicy,exp.seed,wizardScenarioName);}
    catch(err){showToast((err as Error).message,true);}
  }
  if(action==='compare'||action==='reset'){
    pause();renderControls();if(busy||pending.size){showToast('Espera a que termine el paso de simulación antes de confirmar esta acción.');return;}
    compareSourceId=exp.primaryId||'B';dialogReturnFocus=el;pendingPrimaryPolicy=undefined;pendingPresetOrigin=undefined;pendingDialog=action==='compare'?'compare':'reset';pendingScenarioName=action==='compare'?'Mi alternativa':'Mi simulación';render();
  }
  if(action==='cancel-dialog'){pendingDialog='';pendingPrimaryPolicy=undefined;pendingPresetOrigin=undefined;const origin=dialogReturnFocus;dialogReturnFocus=null;render();restoreDialogFocus(origin);}
  if(action==='confirm-dialog')void confirmDialog();
  if(action==='close-save-help'){toggleSaveHelp(false);}
  if(action==='wizard-review'){wizardStep=Number(el.dataset.step)||0;render();document.querySelector<HTMLInputElement>('input[name="wizard-choice"]:checked')?.focus();}
});
root.addEventListener('change',e=>{const el=e.target as HTMLInputElement;if(el.id==='shocks-enabled'){void (async()=>{const enabled=el.checked,changed=enabled!==exp.shocksEnabled;el.disabled=true;try{exp=await command('SHOCKS',enabled);if(changed)markScenarioModified();persist();render();}catch(err){showToast((err as Error).message,true);render();}})();return;}if(el.matches('input[data-wizard-value]')){const value=el.dataset.wizardValue==='keep'?null:Number(el.dataset.wizardValue);wizardAnswers[wizardStep]=value;wizardAnswered[wizardStep]=true;render();document.querySelector<HTMLInputElement>('input[name="wizard-choice"]:checked')?.focus();return;}if(el.matches('input[name="decision-answer"]')){const q=WIZARD_QUESTIONS[wizardStep]!,choice=q.options[Number(el.value)]!,key=q.key;wizardAnswers[wizardStep]=choice.value;wizardAnswered[wizardStep]=true;draft={...draft,[key]:guidedAnswerValue(exp.base,wizardStep,choice.value)};render();document.querySelector<HTMLInputElement>('input[name="decision-answer"]:checked')?.focus();return;}if(el.id==='observed-branch')selectObservedBranch(el.value as 'A'|'B');});
root.addEventListener('input',e=>{const el=e.target as HTMLInputElement;if(el.id==='new-scenario-name')pendingScenarioName=el.value.slice(0,60);if(el.id==='wizard-scenario-name')wizardScenarioName=el.value.slice(0,60);});
document.addEventListener('click',e=>{
  if((e.target as Element).closest('.local-status-wrap'))return;
  toggleSaveHelp(false);
});
function showEvent(id:string):void {
  const event=[...exp.a.events,...exp.b.events].find(e=>e.id===id);if(!event)return;pause();renderControls();document.querySelector('#event-modal')?.remove();
  const selected=branch(event.branch),savedTrace=selected.state.month===event.month?selected.state.trace:undefined;
  const modal=document.createElement('div');modal.id='event-modal';modal.className='modal-backdrop';
  modal.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="event-modal-title" class="modal"><span class="eyebrow">EVENTO SIMULADO · ${esc(branchName(event.branch))} · ${esc(dateLabel(exp.base.year,event.month))}</span><h2 id="event-modal-title">${esc(event.title)}</h2><p>${esc(event.text)}</p><h3>Mecanismos registrados</h3><p>${event.mechanisms.map(id=>`<code>${esc(id)}</code>`).join(' → ')}</p><p class="tiny">${savedTrace?'Las entradas corresponden al último paso de esta trayectoria.':'Este evento es anterior al último paso; no se dispone de un desglose histórico y no se le atribuyen cifras actuales.'}</p><button class="primary" id="close-event">Cerrar</button></section>`;
  document.body.append(modal);modal.querySelector<HTMLButtonElement>('#close-event')!.onclick=()=>modal.remove();modal.querySelector<HTMLButtonElement>('#close-event')!.focus();
}
async function startPrimary(policy:Policy,seed:number,name='',origin?:PresetOrigin):Promise<void> {
  if(busy||pending.size)return;pause();busy=true;try{await saveQueue;exp=await command('INIT',{dataset,seed,policy,primary:true});markScenarioModified();sessionEngineBuild=CURRENT_ENGINE_BUILD;sessionPresetOrigin=origin;sessionPresetBranchOrigins=origin?{B:origin}:{};const scenarioName=name.trim().slice(0,60);if(scenarioName)exp={...exp,branchNames:{A:scenarioName,B:scenarioName}};draft={...policy};configuredBranchId='B';compareSourceId='B';observedBranchId='B';pendingPrimaryPolicy=undefined;currentTab='lab';presetStage='';presetDraftOrigin=undefined;playing=false;markConfigured();if(firstRunSetup){firstRunSetup=false;introOpen=false;}else dismissIntro();persist();}
  catch(error){showToast((error as Error).message,true);}finally{busy=false;render();schedule();}
}
async function confirmDialog():Promise<void> {
  if(busy||pending.size)return;const action=pendingDialog;const setupWasPending=!!pendingPrimaryPolicy;if(!action)return;pendingDialog='';busy=true;const modal=document.querySelector<HTMLElement>('[role="dialog"]');modal?.setAttribute('aria-busy','true');modal?.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.disabled=true);
  try{
    await saveQueue;
    if(action==='compare'){
      const source=branch(compareSourceId),targetId=compareSourceId==='A'?'B':'A';
      exp=await command('COMPARE',{sourceId:compareSourceId,policy:source.policy});configuredBranchId=targetId;observedBranchId=setupWasPending?targetId:compareSourceId;
      if(pendingPrimaryPolicy){exp=await command('CONFIGURE',{branchId:targetId,policy:pendingPrimaryPolicy});draft={...branch(targetId).policy};pendingPrimaryPolicy=undefined;}
      else draft={...branch(targetId).policy};
      if(pendingPresetOrigin){sessionPresetBranchOrigins={...sessionPresetBranchOrigins,[targetId]:pendingPresetOrigin};pendingPresetOrigin=undefined;}
      const scenarioName=pendingScenarioName.trim().slice(0,60);if(scenarioName)exp={...exp,branchNames:{...(exp.branchNames||{A:branchName('A'),B:branchName('B')}),[targetId]:scenarioName}};
    }else{
      const policy=pendingPrimaryPolicy||baselinePolicy(exp.base);exp=await command('INIT',{dataset,seed:exp.seed,policy,primary:true});sessionEngineBuild=CURRENT_ENGINE_BUILD;sessionPresetOrigin=pendingPresetOrigin;sessionPresetBranchOrigins=pendingPresetOrigin?{B:pendingPresetOrigin}:{};pendingPresetOrigin=undefined;const scenarioName=pendingScenarioName.trim().slice(0,60);if(scenarioName)exp={...exp,branchNames:{A:scenarioName,B:scenarioName}};draft={...policy};configuredBranchId='B';compareSourceId='B';observedBranchId='B';pendingPrimaryPolicy=undefined;
    }
    markScenarioModified();configTab='economy';currentTab='lab';if(setupWasPending){playing=false;markConfigured();if(firstRunSetup){firstRunSetup=false;introOpen=false;}}persist();pendingScenarioName='';
  }catch(e){pendingDialog=action;showToast((e as Error).message,true);}
  finally{busy=false;render();schedule();}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();renderControls();persist();}});
window.addEventListener('pagehide',()=>{pause();persist();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&tutorialOpen){e.preventDefault();closeTutorial();return;}
  if(e.key==='Escape'&&settingsOpen){settingsOpen=false;render();return;}
  if(e.key==='Escape'){
    if(mobileMenuOpen){mobileMenuOpen=false;render();document.querySelector<HTMLButtonElement>('.mobile-menu-toggle')?.focus();return;}
    if(shareOpen){shareOpen=false;render();document.querySelector<HTMLButtonElement>('[data-action="share-options"]')?.focus();return;}
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
window.matchMedia('(min-width: 821px)').addEventListener('change',event=>{if(event.matches&&mobileMenuOpen){mobileMenuOpen=false;render();}});
window.addEventListener('hashchange',()=>{if(editorialActive||location.hash.startsWith('#/espana/'))location.reload();});
async function boot():Promise<void> {
  try{
    const response=await fetch(new URL('../data/spain.json',import.meta.url));
    if(!response.ok)throw new Error('No se pudo cargar la fotograf\u00eda inicial.');
    dataset=await response.json() as Dataset;datasetHash=fingerprint(JSON.stringify(dataset));const base=selectBase(dataset);
    exp=await command('INIT',{dataset,seed:1847,primary:true});draft={...exp.b.policy};configuredBranchId='B';compareSourceId='B';
    let restored=false,linked=false;
    if(new URL(location.href).searchParams.has('s')||new URL(location.href).searchParams.has('v')){
      linked=true;preserveStoredSession=true;
      try{
        const shared=readScenarioUrl(new URL(location.href),base,datasetHash,dataset.countryCode);
        if(!shared)throw new Error('El enlace del escenario está incompleto.');
        exp=await command('RESTORE',shared.session);observedBranchId=shared.viewedBranch;configuredBranchId=observedBranchId;compareSourceId=exp.comparisonOriginId||'B';draft={...branch(configuredBranchId).policy};
        scenarioSource='shared_url';restored=true;
      }catch(error){scenarioLoadError=(error as Error).message;}
    }else{
      try{
        const slug=editorialSlug(location.hash);
        if(slug){
          linked=true;preserveStoredSession=true;
          const item=findEditorialScenario(slug);if(!item)throw new Error('No existe ese escenario editorial.');
          exp=await command('INIT',{dataset,seed:item.scenario.seed,policy:item.scenario.policy(base),primary:true,shocksEnabled:item.scenario.shocksEnabled});
          if(item.scenario.months>0)exp=await command('ADVANCE',item.scenario.months);
          editorialActive=item;scenarioSource='editorial';observedBranchId='B';configuredBranchId='B';draft={...exp.b.policy};restored=true;
        }
      }catch(error){linked=true;preserveStoredSession=true;scenarioLoadError=(error as Error).message;exp=await command('INIT',{dataset,seed:1847,primary:true});}
    }
    if(!linked){
      try{const stored:Session|undefined=await loadLocal();if(stored){const session=validateSession(stored,base,datasetHash);exp=await command('RESTORE',session);sessionEngineBuild=session.engineBuild||{engineVersion:session.modelVersion,commitSha:null};sessionPresetOrigin='presetOrigin' in session?session.presetOrigin:undefined;sessionPresetBranchOrigins='presetBranchOrigins' in session?session.presetBranchOrigins||{}:{};observedBranchId=exp.primaryId||'B';if(exp.comparisonActive){try{const selected=localStorage.getItem('simula-observed-branch');if(selected==='A'||selected==='B')observedBranchId=selected;}catch{}}configuredBranchId=observedBranchId;draft={...branch(configuredBranchId).policy};compareSourceId=exp.primaryId||'B';restored=true;scenarioSource='local';}}
      catch(e){storageAvailable=false;showToast(`No se ha restaurado la sesi\u00f3n: ${(e as Error).message}`,true);}
    }
    let marked=false;try{marked=localStorage.getItem('polis-setup-complete')==='1';introOpen=localStorage.getItem('polis-intro-dismissed')!=='1';const savedAppearance=localStorage.getItem('polis-appearance');if(savedAppearance==='light'||savedAppearance==='dark'||savedAppearance==='system')appearance=savedAppearance;}catch{introOpen=true;}
    const baseline=baselinePolicy(exp.base),current=activeBranch().policy;
    const hasCustomPolicy=Object.keys(baseline).some(key=>baseline[key as keyof Policy]!==current[key as keyof Policy]);
    const configured=marked||exp.comparisonActive||activeBranch().state.month>0||hasCustomPolicy;
    if(linked){firstRunSetup=false;introOpen=false;currentTab='lab';}
    else if(configured){markConfigured();}else{firstRunSetup=true;introOpen=false;wizardStep=-1;currentTab='wizard';}
    restoredSession=restored;if(restoredSession)introOpen=false;
    saveReady=true;if(!restored&&storageAvailable)saveStatus='idle';render();if(restored)persist();
    emitGrowthEvent({name:'scenario_loaded',source:scenarioSource,country:dataset.countryCode,horizon:branch(observedBranchId).state.month,scenario_version:SCENARIO_URL_VERSION});
    if(scenarioSource==='shared_url')emitGrowthEvent({name:'shared_scenario_opened',country:dataset.countryCode,horizon:branch(observedBranchId).state.month,scenario_version:SCENARIO_URL_VERSION});
    if(scenarioLoadError)showToast(`No se pudo abrir el escenario: ${scenarioLoadError} Se ha cargado la configuración inicial.`,true);
  }catch(e){root.innerHTML=`<div class="boot"><div class="brand-mark">S</div><h1>No se pudo iniciar SIMULA TU PAÍS</h1><p>${esc((e as Error).message)}</p><p>Sirve la carpeta dist mediante HTTP. No abras index.html con file://.</p></div>`;}
}
void boot();
