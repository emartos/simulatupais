import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root=path.resolve('.'),temp=await mkdtemp(path.join(os.tmpdir(),'polis-growth-'));
const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'0',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
const browsers=[];
async function waitFor(fn,label){const end=Date.now()+20000;while(Date.now()<end){const value=await fn();if(value)return value;await delay(80);}throw new Error(`Tiempo agotado: ${label}`);}
async function startBrowser(label,width){
  const profile=path.join(temp,label),port=11000+(process.pid%1000)+browsers.length;
  await mkdir(profile,{recursive:true});
  const processHandle=spawn(process.env.CHROMIUM||'/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  browsers.push(processHandle);
  const target=await waitFor(async()=>{try{return (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item=>item.type==='page');}catch{return null;}},'Chromium');
  const ws=new WebSocket(target.webSocketDebuggerUrl);await once(ws,'open');
  let id=0;const pending=new Map(),errors=[];
  ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails?.text||'Error de página');if(message.id&&pending.has(message.id)){const p=pending.get(message.id);pending.delete(message.id);message.error?p.reject(new Error(message.error.message)):p.resolve(message.result);}});
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}));});
  const evaluate=async expression=>{const result=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result?.value;};
  const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
  const navigate=async url=>{await cdp('Page.navigate',{url});await waitFor(async()=>evaluate(`!!document.querySelector('.scenario-sharing,.wizard-page')`),'aplicación');};
  const screenshot=async name=>{await mkdir('artifacts',{recursive:true});const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`artifacts/${name}.png`,Buffer.from(shot.data,'base64'));};
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Page.setDownloadBehavior',{behavior:'allow',downloadPath:profile});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`window.__growth=[];window.addEventListener('simulatupais:growth',event=>window.__growth.push(event.detail));`});
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
  return {cdp,evaluate,click,navigate,screenshot,profile,errors,close:()=>ws.close()};
}
async function storedSession(browser){return browser.evaluate(`new Promise(resolve=>{const open=indexedDB.open('polis-local-v1',1);open.onupgradeneeded=()=>open.result.createObjectStore('sessions');open.onsuccess=()=>{const db=open.result,tx=db.transaction('sessions','readonly'),get=tx.objectStore('sessions').get('active');get.onsuccess=()=>{resolve(get.result?{seed:get.result.seed,months:get.result.months,policy:get.result.branches.B.initialPolicy}:null);db.close();};get.onerror=()=>resolve(null);};open.onerror=()=>resolve(null);})`);}
async function setPolicy(browser,key,value){await browser.evaluate(`(()=>{const input=document.querySelector('[data-policy="${key}"]');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));})()`);}
async function buildScenario(browser,baseUrl,label){
  await browser.navigate(baseUrl);
  if(await browser.evaluate(`!!document.querySelector('.wizard-page')`))await browser.click('[data-action="wizard-cancel"]');
  else await browser.click('[data-action="decisions-toggle"]');
  await waitFor(async()=>browser.evaluate(`!!document.querySelector('.decisions-sidebar [data-policy="taxShift"]')`),'controles');
  await setPolicy(browser,'taxShift','2');await setPolicy(browser,'transfers','10');await setPolicy(browser,'publicInvestment','3.3');
  await browser.click('[data-action="apply-decisions"]');
  await waitFor(async()=>browser.evaluate(`!document.querySelector('.decisions-sidebar')`),'configuración confirmada');
  await waitFor(async()=>{const stored=await storedSession(browser);return stored?.policy.taxShift===2&&stored?.policy.transfers===10;},'política guardada');
  for(let i=0;i<3;i++){
    const before=await browser.evaluate(`document.querySelector('#sim-date')?.textContent`);
    await browser.click('[data-action="year"]');
    await waitFor(async()=>browser.evaluate(`document.querySelector('#sim-date')?.textContent!==${JSON.stringify(before)}`),'avance anual');
  }
  await browser.click('[data-action="share-options"]');
  const url=await browser.evaluate(`document.querySelector('#share-url-manual')?.value`);
  assert.ok(url.includes('?v=1&s='),'URL compartible versionada');
  assert.equal(await browser.evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${label} sin overflow`);
  assert.equal(await browser.evaluate(`document.querySelector('#share-card-preview')?.width`),1200,'tarjeta Canvas generada');
  if(label==='mobile'){
    for(const width of [320,375,390]){
      await browser.cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:true});
      assert.equal(await browser.evaluate(`(()=>{const section=document.querySelector('.scenario-sharing'),button=section.querySelector('[data-action="share-primary"]'),panel=section.querySelector('.share-options-panel'),card=section.querySelector('canvas'),r=button.getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&section.getBoundingClientRect().right<=innerWidth+1&&panel.getBoundingClientRect().right<=innerWidth+1&&card.getBoundingClientRect().right<=innerWidth+1&&r.width>=44&&r.height>=44})()`),true,`compartir cabe y es táctil a ${width}px`);
      if(width===320){await browser.evaluate(`document.querySelector('.scenario-sharing').scrollIntoView({block:'center',behavior:'instant'})`);await browser.screenshot('growth-mobile-320');}
    }
  }
  await browser.evaluate(`document.querySelector('.scenario-sharing').scrollIntoView({block:'center',behavior:'instant'})`);await browser.screenshot(`growth-${label}-share`);
  const kpis=await browser.evaluate(`JSON.stringify([...document.querySelectorAll('.kpi-main')].map(item=>item.textContent))`);
  return {url,kpis};
}
async function runFlow(width,label,baseUrl){
  const author=await startBrowser(`${label}-autor`,width),recipient=await startBrowser(`${label}-visitante`,width);
  const original=await buildScenario(author,baseUrl,label);
  const localBefore=await waitFor(async()=>storedSession(author),'sesión local');
  assert.equal(localBefore.months,36);
  await author.evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}})`);
  await author.click('[data-action="share-copy"]');
  assert.equal(await author.evaluate(`window.__copied`),original.url);
  assert.equal(await author.evaluate(`document.querySelector('#toast')?.textContent`),'Enlace copiado');
  const social=await author.evaluate(`({whatsapp:document.querySelector('[data-share-method="whatsapp"]').href,x:document.querySelector('[data-share-method="x"]').href})`);
  assert.equal(new URL(social.x).searchParams.get('url'),original.url);assert.ok(new URL(social.whatsapp).searchParams.get('text').includes(original.url));
  await author.evaluate(`(()=>{for(const method of ['whatsapp','x']){const link=document.querySelector('[data-share-method="'+method+'"]');link.addEventListener('click',event=>event.preventDefault(),{capture:true});link.click();}})()`);
  assert.deepEqual(await author.evaluate(`window.__growth.filter(item=>item.name==='share_clicked').map(item=>item.method)`),['copy','whatsapp','x']);
  await author.evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}})`);
  await author.click('[data-action="share-copy"]');assert.match(await author.evaluate(`document.querySelector('#toast')?.textContent`),/No se pudo copiar/);
  assert.equal(await author.evaluate(`document.activeElement?.id`),'share-url-manual');
  await author.evaluate(`Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{window.__nativeShare=payload;}})`);
  await author.click('[data-action="share-primary"]');
  assert.equal(await author.evaluate(`window.__nativeShare?.url`),original.url,'hoja nativa prioritaria');
  assert.ok(await author.evaluate(`window.__growth.some(item=>item.name==='share_completed'&&item.method==='native')`));
  await author.click('[data-action="share-image"]');
  await waitFor(async()=>(await readdir(author.profile)).includes('simula-tu-pais-escenario.png'),'descarga PNG');
  if(label==='desktop'){
    const image=await author.evaluate(`document.querySelector('#share-card-preview').toDataURL('image/png')`);
    await writeFile('artifacts/growth-card.png',Buffer.from(image.split(',')[1],'base64'));
  }
  await recipient.navigate(original.url);
  await waitFor(async()=>recipient.evaluate(`!!document.querySelector('.kpi-main')`),'escenario compartido');
  assert.equal(await recipient.evaluate(`JSON.stringify([...document.querySelectorAll('.kpi-main')].map(item=>item.textContent))`),original.kpis,'visitante sin sesión reproduce todos los KPI');
  assert.equal(await storedSession(recipient),null,'abrir URL no escribe una sesión local');
  const recipientEvents=await recipient.evaluate(`window.__growth.map(item=>item.name)`);
  assert.ok(recipientEvents.includes('shared_scenario_opened')&&recipientEvents.includes('scenario_loaded'));
  await recipient.evaluate(`document.querySelector('.scenario-sharing').scrollIntoView({block:'center',behavior:'instant'})`);await recipient.screenshot(`growth-${label}-opened`);
  await recipient.click('[data-action="decisions-toggle"]');
  await setPolicy(recipient,'services','19.4');await recipient.click('[data-action="apply-decisions"]');
  await waitFor(async()=>recipient.evaluate(`!!document.querySelector('[data-action="confirm-dialog"]')`),'comparación');
  await recipient.click('[data-action="confirm-dialog"]');
  await waitFor(async()=>recipient.evaluate(`!!document.querySelector('#observed-branch')&&!document.querySelector('[data-action="confirm-dialog"]')`),'alternativa confirmada');
  await recipient.click('[data-action="step"]');
  await waitFor(async()=>recipient.evaluate(`window.__growth.some(item=>item.name==='shared_scenario_simulated')`),'simulación de variante');
  await recipient.click('[data-action="share-options"]');
  const variant=await recipient.evaluate(`document.querySelector('#share-url-manual')?.value`);
  assert.notEqual(variant,original.url,'la variante genera otra URL');
  assert.deepEqual(await recipient.evaluate(`window.__growth.filter(item=>item.name.startsWith('shared_scenario_')).map(item=>item.name)`),['shared_scenario_opened','shared_scenario_modified','shared_scenario_simulated']);
  await recipient.navigate(original.url);
  assert.equal(await recipient.evaluate(`JSON.stringify([...document.querySelectorAll('.kpi-main')].map(item=>item.textContent))`),original.kpis,'el escenario original sigue intacto');
  await author.navigate(variant);
  assert.notEqual(await author.evaluate(`JSON.stringify([...document.querySelectorAll('.kpi-main')].map(item=>item.textContent))`),original.kpis,'URL distinta prevalece sobre IndexedDB');
  assert.deepEqual(await storedSession(author),localBefore,'abrir enlace no destruye la sesión local previa');
  assert.deepEqual(author.errors,[]);assert.deepEqual(recipient.errors,[]);
  author.close();recipient.close();
  return {original:original.url,variant};
}
try{
  const baseUrl=await new Promise((resolve,reject)=>{let output='';server.stdout.on('data',chunk=>{output+=chunk;const found=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(found)resolve(found[0]);});server.on('error',reject);});
  const desktop=await runFlow(1280,'desktop',baseUrl);
  const mobile=await runFlow(390,'mobile',baseUrl);
  const editorial=await startBrowser('editorial',390);
  await editorial.navigate(`${baseUrl}/#/espana/inversion-publica-gradual`);
  assert.equal(await editorial.evaluate(`document.querySelector('#editorial-title')?.textContent`),'Inversión pública gradual');
  assert.ok(await editorial.evaluate(`document.querySelector('.editorial-scenario')?.textContent.includes('¿Qué muestra el modelo')`));
  await editorial.screenshot('growth-editorial-mobile');
  await editorial.click('[data-action="editorial-modify"]');assert.equal(await editorial.evaluate(`!!document.querySelector('.decisions-sidebar')`),true,'editorial editable');
  await editorial.navigate(`${baseUrl}/#/espana/no-existe`);
  assert.ok(await waitFor(async()=>editorial.evaluate(`document.querySelector('#toast')?.textContent.includes('No se pudo abrir el escenario')`),'error editorial'),'slug inexistente cae en baseline seguro');
  assert.equal(await editorial.evaluate(`!!document.querySelector('.scenario-sharing')`),true);
  assert.deepEqual(editorial.errors,[]);editorial.close();
  console.log(`PASS Growth E2E: desktop 1280 y móvil 390; URL original, variante, almacenamiento preservado, copia, Web Share, PNG, editoriales y analytics. Ejemplos: ${desktop.original} y ${mobile.variant}`);
}finally{
  await Promise.all(browsers.map(async browser=>{if(browser.exitCode===null){const exited=once(browser,'exit');browser.kill();await exited;}}));
  if(server.exitCode===null){const exited=once(server,'exit');server.kill();await exited;}
  await rm(temp,{recursive:true,force:true});
}
