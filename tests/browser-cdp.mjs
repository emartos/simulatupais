import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const dir=await mkdtemp(path.join(os.tmpdir(),'polis-browser-'));
const port=Number(process.env.PORT||5177);
const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:path.resolve('.'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1'},stdio:'ignore'});
let browser;
try {
 await waitFor(async()=>{try{return (await fetch(`http://127.0.0.1:${port}/`)).ok;}catch{return false;}});
 const debugPort=9222+(process.pid%1000);
 browser=spawn(process.env.CHROMIUM||'/snap/bin/chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${dir}`,'about:blank'],{stdio:'inherit'});
 browser.on('error',error=>console.error(error));
 const targets=await waitFor(async()=>{try{return await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();}catch{return false;}});
 const target=targets.find(x=>x.type==='page'); assert.ok(target,'Chromium page target');
 const ws=new WebSocket(target.webSocketDebuggerUrl); await once(ws,'open');
 let id=0;const pending=new Map(),pageErrors=[];
 ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')pageErrors.push(m.params.exceptionDetails?.text||'Error de página');if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')pageErrors.push(m.params.entry.text);});
 ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);} });
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}));});
 const evaluate=async(expression)=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result?.value;};
 const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
 const screenshot=async name=>{await mkdir('artifacts',{recursive:true});const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`artifacts/${name}.png`,Buffer.from(shot.data,'base64'));};
 const waitForApp=()=>waitFor(async()=>evaluate(`!!document.querySelector('[data-action="step"]')`));
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Log.enable');const browserVersion=await cdp('Browser.getVersion');await cdp('Page.navigate',{url:`http://127.0.0.1:${port}/`});
 await waitFor(async()=>evaluate(`!!document.querySelector('[data-action="step"]')||!!document.querySelector('.wizard-page')`));
 if(await evaluate(`!!document.querySelector('.wizard-page')`)){await click('[data-action="wizard-cancel"]');await waitForApp();}
 assert.equal(await evaluate(`performance.getEntriesByType('resource').some(r=>r.name.includes('/app/worker.js'))`),true,'worker nativo cargado');
 await screenshot('polis-inicio-1280');
 await click('[data-action="wizard"]');await waitFor(async()=>evaluate(`!!document.querySelector('.guided-setup')`));await screenshot('polis-cuestionario-1280');
 await click('[data-action="wizard-cancel"]');await click('[data-action="dismiss-intro"]');await screenshot('polis-simulacion-unica-1280');
 await click('#save-help');await waitFor(async()=>evaluate(`!document.querySelector('#save-help-popover').hidden`));await screenshot('polis-ayuda-guardado-1280');await click('[data-action="close-save-help"]');
 await click('[data-tab="about"]');await waitFor(async()=>evaluate(`!!document.querySelector('.prose')`));await screenshot('polis-acerca-1280');await click('[data-tab="lab"]');
 await click('[data-action="step"]'); await waitFor(async()=>evaluate(`!!document.querySelector('#sim-date')`));
 for(const width of [360,390,1280]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
  const layout=await evaluate(`(()=>{const b=document.querySelector('.config-actions [data-action="compare"]');return {button:!!b,visible:!!b&&b.getBoundingClientRect().width>0&&b.getBoundingClientRect().right<=innerWidth,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
  assert.equal(layout.button,true,`acción de comparación ${width}px`);assert.equal(layout.visible,true,`acción visible ${width}px`);assert.equal(layout.overflow,false,`sin overflow ${width}px`);
  if(width===360||width===1280){if(width===360)await evaluate(`window.scrollTo(0,document.querySelector('.config-panel').getBoundingClientRect().top+scrollY-18)`);else await evaluate('window.scrollTo(0,0)');await screenshot(`bifurcacion-${width}`);}
  for(const tab of ['economy','institutions','advanced']){await click(`[data-config-tab="${tab}"]`);assert.equal(await evaluate(`!!document.querySelector('.config-actions [data-action="compare"]')`),true,`botón en ${tab}`);}
 }
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
 const month=await evaluate(`document.querySelector('#sim-date').textContent`);
 await click('.config-actions [data-action="compare"]');assert.match(await evaluate(`document.querySelector('[aria-modal="true"] p').textContent`),/conservaremos|crearemos otra/i);
 await click('[data-action="cancel-dialog"]');assert.equal(await evaluate(`document.querySelector('#sim-date').textContent`),month,'cancelar conserva el estado');assert.equal(await evaluate(`document.activeElement===document.querySelector('.config-actions [data-action=\"compare\"]')`),true,'cancelar devuelve el foco al control de comparación');
 await click('.config-actions [data-action="compare"]');await screenshot('polis-dialogo-comparacion-1280');await click('[data-action="confirm-dialog"]');
 await click('[data-config-tab="economy"]');
 await waitFor(async()=>evaluate(`!document.querySelector('[aria-modal="true"]') && document.querySelector('[data-policy="taxShift"]')?.disabled===false`));
 assert.equal(await evaluate(`document.querySelector('#sim-date').textContent`),month,'FORK no avanza el mes');
 await evaluate(`(()=>{const e=document.querySelector('[data-policy="taxShift"]');e.value='4';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 await waitFor(async()=>evaluate(`document.querySelector('[data-policy="taxShift"]')?.value==='4'`));
 await click('[data-action="step"]');await waitFor(async()=>evaluate(`document.querySelector('#sim-date')?.textContent!==${JSON.stringify(month)}`));
 assert.equal(await evaluate(`indexedDB.databases().then(d=>d.some(x=>x.name==='polis-local-v1'))`),true,'IndexedDB existe');
 await waitFor(async()=>evaluate(`new Promise((resolve)=>{const r=indexedDB.open('polis-local-v1');r.onsuccess=()=>{const q=r.result.transaction('sessions','readonly').objectStore('sessions').get('active');q.onsuccess=()=>resolve(q.result?.months===2);};r.onerror=()=>resolve(false)})`));
 const saved=await evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.open('polis-local-v1');r.onsuccess=()=>{const db=r.result,tx=db.transaction('sessions','readonly'),q=tx.objectStore('sessions').get('active');q.onsuccess=()=>resolve(q.result?.months);q.onerror=()=>reject(q.error);};r.onerror=()=>reject(r.error)})`);
 assert.equal(saved,2,'IndexedDB contiene el mes y la bifurcación');
 const advancedMonth=await evaluate(`document.querySelector('#sim-date').textContent`);
 await click('[data-action="play"]');await cdp('Page.reload');await waitForApp();
 await waitFor(async()=>evaluate(`document.querySelector('#sim-date')?.textContent!==${JSON.stringify(month)}`));
 assert.equal(await evaluate(`document.querySelector('#sim-date').textContent`),advancedMonth,'la recarga conserva el mes guardado');
 assert.equal(await evaluate(`document.querySelector('[data-action="play"]').textContent.includes('Reproducir')`),true,'recarga inicia pausada');
 assert.equal(await evaluate(`document.querySelector('[data-policy="taxShift"]')?.value`),'4','configuración B restaurada');
 console.log('PASS Chromium real: HTTP, Web Worker, navegación inicial y layout 360/390/1280, cancelación, comparación, cambio, avance, IndexedDB y recarga pausada.');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await screenshot('polis-comparacion-1280');
 console.log(`Navegador: ${browserVersion.product}; errores de consola/página: ${JSON.stringify(pageErrors)}`);
 console.log('Capturas: inicio, cuestionario, simulación única, comparación, ayuda, Acerca de y vistas en móvil y escritorio, en artifacts/.');
 ws.close();
} finally {
 server.kill();
 if(browser){const exited=once(browser,'exit').catch(()=>{});browser.kill();await Promise.race([exited,delay(3000)]);}
 await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
async function waitFor(fn){const end=Date.now()+15000;while(Date.now()<end){const value=await fn();if(value)return value;await delay(100);}throw new Error('Tiempo de espera agotado en browser test');}
