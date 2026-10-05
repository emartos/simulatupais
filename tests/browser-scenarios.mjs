import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root=path.resolve('.');
const profile=await mkdtemp(path.join(os.tmpdir(),'polis-browser-scenarios-'));
const port=Number(process.env.PORT||5189),baseUrl=process.env.BASE_URL||`http://127.0.0.1:${port}`;
const server=process.env.BASE_URL?null:spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1'},stdio:'ignore'});
let browser;
try {
  await waitFor(async()=>{try{return (await fetch(`${baseUrl}/`)).ok;}catch{return false;}});
  const debugPort=10200+(process.pid%1000);
  browser=spawn(process.env.CHROMIUM||'/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  const targets=await waitFor(async()=>{try{return await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();}catch{return false;}});
  const target=targets.find(item=>item.type==='page');assert.ok(target,'Chromium page target');
  const ws=new WebSocket(target.webSocketDebuggerUrl);await once(ws,'open');
  let id=0;const pending=new Map(),errors=[];
  ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails?.text||'page exception');if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}});
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}));});
  const evaluate=async expression=>{const result=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result?.value;};
  const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
  const waitApp=()=>waitFor(async()=>evaluate(`!!document.querySelector('.wizard-page')||!!document.querySelector('[data-action="step"]')`));
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Page.setDownloadBehavior',{behavior:'allow',downloadPath:profile});await cdp('Page.navigate',{url:baseUrl});await waitApp();

  const golden=JSON.parse(await readFile(path.join(root,'docs/playbook/evidencias/resultados.json'),'utf8'));
  const goldenManifest=golden.manifest;
  const oracleFiles={
    E02:'e02-p03-m60.json',E03:'e03-p04-m120.json',E05:'e05-bifurcacion-m36.json',
  };
  const reviewedOracles=Object.fromEntries(await Promise.all(Object.entries(oracleFiles).map(async([id,file])=>[id,JSON.parse(await readFile(path.join(root,'docs/playbook/oracles',file),'utf8'))])));
  for(const oracle of Object.values(reviewedOracles)){
    assert.equal(oracle.modelVersion,goldenManifest.appVersion,`${oracle.id}: versión de modelo`);
    assert.equal(oracle.catalogVersion,goldenManifest.datasetVersion,`${oracle.id}: versión de catálogo`);
    assert.equal(oracle.catalogHash,goldenManifest.datasetHash,`${oracle.id}: huella de catálogo`);
    assert.equal(oracle.baseYear,goldenManifest.baseYear,`${oracle.id}: año base`);
    assert.equal(oracle.seed,goldenManifest.seed,`${oracle.id}: semilla`);
  }
  const cases=[
    {id:'01-impuestos-4',fixture:'01-impuestos-4.json',change:{taxShift:4},horizons:[12,60],caseId:'P02'},
    {id:'04-impuestos-4-transferencias-20',fixture:'04-impuestos-4-transferencias-20.json',change:{taxShift:4,transfers:20},horizons:[12,60],caseId:'P05'},
    {id:'02-consumo-15',fixture:'02-consumo-15.json',change:{consumptionTax:15},horizons:[12,60],caseId:'E02'},
    {id:'03-coste-inversion-4',fixture:'03-coste-inversion-4.json',change:{investmentFriction:4},horizons:[12,60,120],caseId:'E03'},
  ];
  const baselineFixture=JSON.parse(await readFile(path.join(root,'docs/playbook/sesiones/00-base.json'),'utf8'));
  for(const oracle of Object.values(reviewedOracles))assert.deepEqual(oracle.initialPolicy,baselineFixture.policy,`${oracle.id}: la referencia es la política inicial del experimento`);
  const servedDataset=await (await fetch(`${baseUrl}/data/spain.json`)).json();
  assert.equal(servedDataset.version,goldenManifest.datasetVersion,'catálogo real servido por HTTP');
  assert.equal(fingerprint(JSON.stringify(servedDataset)),goldenManifest.datasetHash,'huella del catálogo del oráculo y aplicación');
  assert.equal(baselineFixture.seed,goldenManifest.seed,'semilla del escenario base y del oráculo');
  assert.equal(baselineFixture.modelVersion,goldenManifest.appVersion,'modelo del escenario base y del oráculo');
  assert.equal(baselineFixture.datasetVersion,goldenManifest.datasetVersion,'catálogo del escenario base y del oráculo');
  assert.equal(await evaluate(`document.querySelector('footer')?.textContent.includes('modelo ${goldenManifest.appVersion}')`),true,'versión del modelo visible en la aplicación');
  assert.equal(await evaluate(`document.querySelector('footer')?.textContent.includes('${goldenManifest.datasetVersion}')`),true,'versión del catálogo visible en la aplicación');
  assert.equal(await evaluate(`document.querySelector('.global-country')?.textContent.includes('Datos de partida: ${goldenManifest.baseYear}')`),true,'año visible de la base inicial');
  assert.equal(await evaluate(`performance.getEntriesByType('resource').some(r=>r.name.includes('/app/worker.js'))`),true,'worker real cargado por HTTP');
  if(await evaluate(`!!document.querySelector('.wizard-page')`))await click('[data-action="wizard-cancel"]');
  await waitFor(async()=>evaluate(`!!document.querySelector('[data-action="step"]')`));
  await click('[data-action="open-settings"]');await waitFor(async()=>evaluate(`!!document.querySelector('.settings-modal')`));
  await click('.settings-modal [data-action="open-advanced"]');await waitFor(async()=>evaluate(`document.querySelector('#seed')?.value==='${goldenManifest.seed}'`));
  await click('[data-action="cancel-decisions"]');await waitFor(async()=>evaluate(`!document.querySelector('.decisions-sidebar')`));

  // E01: configuración de partida ejecutada desde la UI, sin importar sesiones.
  const baselineExpected=golden.cases.find(item=>item.id==='00-base');assert.ok(baselineExpected,'oráculo versionado 00-base');
  const ensureTable=async()=>{if(!await evaluate(`document.querySelector('.data-disclosure')?.open`))await click('.data-disclosure summary');};
  const metrics=['gdp','purchasingPower','inflation','unemployment','debtRatio','investment'];
  const exportCsv=async()=>{
    const before=new Set(await readdir(profile));await click('[data-action="csv"]');
    const name=await waitFor(async()=>{try{return (await readdir(profile)).find(item=>!before.has(item)&&item.endsWith('.csv')&&!item.endsWith('.crdownload'))||false;}catch{return false;}});
    const rows=(await readFile(path.join(profile,name),'utf8')).replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.split(';'));
    await rm(path.join(profile,name));return rows;
  };
  const verifyRawOracle=async(oracle,horizons,label)=>{
    const rows=await exportCsv(),headers=rows[0];
    assert.equal(headers.length,14,`${label}: CSV UI contiene seis métricas en A/B`);
    assert.ok(headers[2].endsWith(`_${oracle.seriesMapping.B.csvColumn}`),`${label}: la primera columna se asigna a la serie B del oráculo`);
    assert.ok(headers[3].endsWith(`_${oracle.seriesMapping.A.csvColumn}`),`${label}: la segunda columna se asigna a la serie A del oráculo`);
    for(const month of horizons){
      const row=rows.find(item=>Number(item[0])===month),snapshot=oracle.snapshots.find(item=>item.month===month);
      assert.ok(row&&snapshot,`${label}: fila y golden versionado del mes ${month}`);
      assert.equal(row[1],snapshot.date,`${label}: fecha CSV del mes ${month}`);
      for(let i=0;i<metrics.length;i++){
        const metric=metrics[i],a=Number(row[3+i*2]),b=Number(row[2+i*2]);
        assert.ok(Number.isFinite(a)&&Number.isFinite(b),`${label} mes ${month}: número crudo ${metric}`);
        near(a,snapshot.A.point[metric],Math.max(1,Math.abs(snapshot.A.point[metric]))*1e-9,`${label} mes ${month} CSV A ${metric}`);
        near(b,snapshot.B.point[metric],Math.max(1,Math.abs(snapshot.B.point[metric]))*1e-9,`${label} mes ${month} CSV B ${metric}`);
      }
    }
  };
  const readSingleMetric=async(month,metric)=>{
    await click(`.metric-tabs button[data-metric="${metric}"]`);
    await waitFor(async()=>evaluate(`document.querySelector('#chart-area')?.dataset.metric==='${metric}'`));
    await ensureTable();
    const data=await evaluate(`(()=>{const rows=[...document.querySelectorAll('.data-disclosure tbody tr')],points=[...document.querySelectorAll('#chart-area [data-series-point]')],paths=[...document.querySelectorAll('#chart-area path[data-series]')];return {rows:rows.length,cells:[...rows.at(-1).children].map(e=>e.textContent.trim()),points:points.map(e=>({id:e.dataset.seriesPoint,month:Number(e.dataset.month)})),paths:paths.map(e=>({id:e.dataset.series,metric:e.dataset.metric}))}})()`);
    assert.equal(data.rows,month+1,`E01 ${metric}: cantidad de periodos`);
    assert.deepEqual(data.points.map(p=>p.id),['B'],`E01 ${metric}: trayectoria única de partida`);
    assert.ok(data.points.every(p=>p.month===month),`E01 ${metric}: periodo representado`);
    assert.deepEqual(data.paths.map(p=>p.id),['B'],`E01 ${metric}: curva de partida`);
    assert.ok(data.paths.every(p=>p.metric===metric),`E01 ${metric}: métrica de la curva`);
    const expected=baselineExpected.snapshots.find(s=>s.month===month);assert.ok(expected,`E01 golden mes ${month}`);
    const key=metric==='purchasingPower'?'purchasingPower':metric;
    near(parseSpanishNumber(data.cells[1]),expected.B.point[key],displayTolerance(metric),`E01 mes ${month} serie ${metric}`);
  };
  const waitSingleMonth=month=>waitFor(async()=>evaluate(`document.querySelector('#chart-area [data-series-point="B"]')?.dataset.month==='${month}'`));
  let baselineMonth=0;
  for(const horizon of [12,60]){
    const years=(horizon-baselineMonth)/12;for(let i=0;i<years;i++){baselineMonth+=12;await click('[data-action="year"]');await waitSingleMonth(baselineMonth);}
    const expected=baselineExpected.snapshots.find(s=>s.month===horizon);
    const cards=await evaluate(`Object.fromEntries([...document.querySelectorAll('.kpi[data-metric]')].map(e=>[e.dataset.metric,e.querySelector('.kpi-main')?.textContent.trim()]))`);
    for(const [key,uiKey] of [['gdp','activity'],['purchasingPower','purchasingPower'],['inflation','inflation'],['unemployment','unemployment']])near(parseSpanishNumber(cards[key]),parseSpanishNumber(expected.B.ui[uiKey]),0.051,`E01 mes ${horizon} tarjeta ${key}`);
    for(const metric of ['gdp','purchasingPower','inflation','unemployment','debtRatio','investment'])await readSingleMetric(horizon,metric);
    console.log(`PASS E01 · configuración de partida · mes ${horizon} · tarjetas y 6 series · golden 00-base`);
  }
  await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
  await click('.config-actions [data-action="reset"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] [data-action="confirm-dialog"]')`));
  await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&document.querySelector('#chart-area [data-series-point="B"]')?.dataset.month==='0'`));
  await click('[data-action="cancel-decisions"]');await waitFor(async()=>evaluate(`!document.querySelector('.decisions-sidebar')`));

  for(let caseIndex=0;caseIndex<cases.length;caseIndex++){
    const scenario=cases[caseIndex],session=JSON.parse(await readFile(path.join(root,'docs/playbook/sesiones',scenario.fixture),'utf8'));
    const expected=golden.cases.find(item=>item.id===scenario.id);assert.ok(expected,`oráculo versionado ${scenario.id}`);
    assert.equal(session.modelVersion,goldenManifest.appVersion,`${scenario.id}: versión del modelo`);
    assert.equal(session.datasetVersion,goldenManifest.datasetVersion,`${scenario.id}: catálogo`);
    assert.equal(session.seed,goldenManifest.seed,`${scenario.id}: semilla`);
    assert.equal(session.months,0,`${scenario.id}: inicio en mes cero`);
    assert.equal(session.forkMonth,0,`${scenario.id}: configuración aplicada desde mes cero`);
    assert.deepEqual(Object.fromEntries(Object.keys(scenario.change).map(key=>[key,session.policy[key]])),scenario.change,`${scenario.id}: cambios del fixture`);
    const scenarioOracle=reviewedOracles[scenario.caseId];
    if(scenarioOracle){
      assert.equal(scenarioOracle.sourceFixture,`docs/playbook/sesiones/${scenario.fixture}`,`${scenario.id}: fixture de receta documentado`);
      assert.equal(scenarioOracle.appliedAtMonth,0,`${scenario.id}: configuración desde mes cero`);
      assert.deepEqual(Object.fromEntries(Object.entries(scenarioOracle.changes).map(([key,item])=>[key,item.to])),scenario.change,`${scenario.id}: cambio esperado coincide con la receta UI`);
    }
    const snapshotFor=month=>expected.snapshots.find(item=>item.month===month)||scenarioOracle?.snapshots.find(item=>item.month===month);
    assert.deepEqual(scenario.horizons.filter(month=>snapshotFor(month)).length,scenario.horizons.length,`${scenario.id}: todos los horizontes tienen oráculo versionado`);

    if(caseIndex>0){
      await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
      await click('.config-actions [data-action="reset"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] [data-action="confirm-dialog"]')`));
      await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&!!document.querySelector('[data-action="step"]')`));
    }

    await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
    await click('.config-actions [data-action="compare"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] #new-scenario-name')`));
    await evaluate(`(()=>{const n=document.querySelector('#new-scenario-name');n.value=${JSON.stringify(`E2E ${scenario.id}`)};n.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&!!document.querySelector('[data-policy="taxShift"]')`));
    await click('[data-action="decision-mode"][data-mode="controls"]');
    for(const [key,value] of Object.entries(scenario.change)){
      await evaluate(`(()=>{const e=document.querySelector('[data-policy="${key}"]');if(!e)throw new Error('Control público no encontrado: ${key}');e.value=${value};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    }
    await click('[data-action="apply-decisions"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] [data-action="confirm-dialog"]')`));
    await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&!!document.querySelector('#observed-branch')`));
    await evaluate(`(()=>{const select=document.querySelector('#observed-branch');select.value='A';select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await waitFor(async()=>evaluate(`document.querySelector('.context-observed select')?.value==='A'&&document.querySelectorAll('#chart-area [data-series]').length===2`));
    assert.equal(await evaluate(`document.querySelector('#observed-branch')?.value`),'A',`${scenario.id}: escenario con cambios seleccionado`);

    const readMetric=async(month,metric)=>{
      await click(`.metric-tabs button[data-metric="${metric}"]`);
      await waitFor(async()=>evaluate(`document.querySelector('#chart-area')?.dataset.metric==='${metric}'`));
      if(!await evaluate(`document.querySelector('.data-disclosure')?.open`))await click('.data-disclosure summary');
      const output=await evaluate(`(()=>{const rows=[...document.querySelectorAll('.data-disclosure tbody tr')],row=rows.at(-1),points=[...document.querySelectorAll('#chart-area [data-series-point]')];return {rows:rows.length,cells:[...row.children].map(e=>e.textContent.trim()),points:points.map(e=>({id:e.dataset.seriesPoint,month:Number(e.dataset.month)})),paths:[...document.querySelectorAll('#chart-area path[data-series]')].map(e=>({id:e.dataset.series,metric:e.dataset.metric}))}})()`);
      assert.equal(output.rows,month+1,`${scenario.id} ${metric}: cantidad de periodos de la serie`);
      assert.equal(output.cells[0].includes(String(goldenManifest.baseYear+month/12)),true,`${scenario.id} ${metric}: etiqueta del último periodo`);
      const cells=output.cells.slice(1).map(parseSpanishNumber);
      const snapshot=snapshotFor(month);
      assert.ok(snapshot,`${scenario.id}: horizonte ${month} del oráculo versionado`);
      const metricKey=metric==='purchasingPower'?'purchasingPower':metric;
      const expectedChanged=snapshot.B.point[metricKey],expectedBase=snapshot.A.point[metricKey];
      near(cells[0],expectedChanged,displayTolerance(metric),`${scenario.id} mes ${month} gráfica ${metric} alternativa`);
      near(cells[1],expectedBase,displayTolerance(metric),`${scenario.id} mes ${month} gráfica ${metric} referencia`);
      assert.deepEqual(output.points.map(p=>p.id).sort(),['A','B'],`${scenario.id} ${metric}: puntos de ambas trayectorias`);
      assert.ok(output.points.every(p=>p.month===month),`${scenario.id} ${metric}: horizonte visible en gráfico`);
      assert.deepEqual(output.paths.map(p=>p.id).sort(),['A','B'],`${scenario.id} ${metric}: series de ambas trayectorias`);
      assert.ok(output.paths.every(p=>p.metric===metric),`${scenario.id} ${metric}: métrica de las curvas`);
    };
    const waitMonth=async month=>waitFor(async()=>evaluate(`document.querySelector('#chart-area [data-series-point="A"]')?.dataset.month==='${month}'`));
    await click('.metric-tabs button[data-metric="gdp"]');
    await waitFor(async()=>evaluate(`document.querySelector('#chart-area')?.dataset.metric==='gdp'`));
    if(!await evaluate(`document.querySelector('.data-disclosure')?.open`))await click('.data-disclosure summary');
    let currentMonth=0;
    for(const horizon of scenario.horizons){
      const years=(horizon-currentMonth)/12;
      assert.equal(Number.isInteger(years),true,`${scenario.id}: avance en años exactos al horizonte ${horizon}`);
      for(let step=0;step<years;step++){
        currentMonth+=12;await click('[data-action="year"]');await waitMonth(currentMonth);
      }
      assert.equal(await evaluate(`document.querySelectorAll('.data-disclosure tbody tr').length-1`),horizon,`${scenario.id}: mes de horizonte alcanzado con acción +1 año`);
      const snapshot=snapshotFor(horizon);
      const cards=await evaluate(`Object.fromEntries([...document.querySelectorAll('.kpi[data-metric]')].map(e=>[e.dataset.metric,e.querySelector('.kpi-main')?.textContent.trim()]))`);
      for(const [key,uiKey] of [['gdp','activity'],['purchasingPower','purchasingPower'],['inflation','inflation'],['unemployment','unemployment']]){
        const cardExpected=snapshot.B.ui?.[uiKey]??snapshot.B.point[key];
        near(parseSpanishNumber(cards[key]),typeof cardExpected==='string'?parseSpanishNumber(cardExpected):cardExpected,displayTolerance(key),`${scenario.id} mes ${horizon} tarjeta ${key}`);
        const compare=await evaluate(`document.querySelector('.kpi[data-metric="${key}"] .kpi-compare button')?.textContent||''`);
        const compareExpected=snapshot.A.ui?.[uiKey]??snapshot.A.point[key];
        near(parseSpanishNumber(compare),typeof compareExpected==='string'?parseSpanishNumber(compareExpected):compareExpected,displayTolerance(key),`${scenario.id} mes ${horizon} tarjeta comparada ${key}`);
      }
      for(const metric of ['gdp','purchasingPower','inflation','unemployment','debtRatio','investment'])await readMetric(horizon,metric);
      console.log(`PASS ${scenario.caseId} ${scenario.id} · mes ${horizon} · tarjetas y 6 series A/B · ${goldenManifest.appVersion}/${goldenManifest.datasetVersion} · semilla ${goldenManifest.seed}`);
    }
    if(scenario.caseId==='E02')await verifyRawOracle(scenarioOracle,[60],'E02/P03');
    if(scenario.caseId==='E03')await verifyRawOracle(scenarioOracle,[120],'E03/P04');
    if(caseIndex===0){
      const actual=await evaluate(`document.querySelector('[data-action="year"]')?.disabled`);
      assert.equal(actual,false,'P02 puede seguir avanzando tras alcanzar mes 60');
    }
  }

  const resetToStart=async()=>{
    if(!await evaluate(`!!document.querySelector('.decisions-sidebar')`)){await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));}
    await click('.config-actions [data-action="reset"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] [data-action="confirm-dialog"]')`));
    await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&document.querySelector('#chart-area [data-series-point="B"]')?.dataset.month==='0'`));
    if(await evaluate(`!!document.querySelector('.decisions-sidebar')`)){await click('[data-action="cancel-decisions"]');await waitFor(async()=>evaluate(`!document.querySelector('.decisions-sidebar')`));}
  };
  const createIdenticalComparison=async name=>{
    await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
    await click('.config-actions [data-action="compare"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] #new-scenario-name')`));
    await evaluate(`(()=>{const n=document.querySelector('#new-scenario-name');n.value=${JSON.stringify(name)};n.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&!!document.querySelector('#observed-branch')`));
    await evaluate(`(()=>{const s=document.querySelector('#observed-branch');s.value='A';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await waitFor(async()=>evaluate(`document.querySelector('#observed-branch')?.value==='A'&&document.querySelectorAll('#chart-area [data-series]').length===2`));
    await click('[data-action="cancel-decisions"]');await waitFor(async()=>evaluate(`!document.querySelector('.decisions-sidebar')`));
  };
  const chooseMetric=async metric=>{
    await click(`.metric-tabs button[data-metric="${metric}"]`);
    await waitFor(async()=>evaluate(`document.querySelector('#chart-area')?.dataset.metric==='${metric}'`));
    await ensureTable();
  };
  const seriesTable=()=>evaluate(`(()=>[...document.querySelectorAll('.data-disclosure tbody tr')].map(r=>[...r.children].map(c=>c.textContent.trim())))()`);

  // E04: identical comparison from the public UI; every represented point must stay identical.
  await resetToStart();await createIdenticalComparison('E04 idéntica');
  for(let month=12;month<=60;month+=12){await click('[data-action="year"]');await waitFor(async()=>evaluate(`document.querySelector('#chart-area [data-series-point="A"]')?.dataset.month==='${month}'`));}
  const identicalGolden=golden.cases.find(item=>item.id==='00-base');
  for(const metric of metrics){
    await chooseMetric(metric);const rows=await seriesTable();
    assert.equal(rows.length,61,`E04 ${metric}: incluye mes 0 a 60`);
    const graph=await evaluate(`({metric:document.querySelector('#chart-area')?.dataset.metric,series:[...document.querySelectorAll('#chart-area path[data-series]')].map(p=>({id:p.dataset.series,metric:p.dataset.metric})),points:[...document.querySelectorAll('#chart-area [data-series-point]')].map(p=>({id:p.dataset.seriesPoint,month:Number(p.dataset.month)}))})`);
    assert.equal(graph.metric,metric,`E04 ${metric}: métrica del gráfico`);assert.deepEqual(graph.series.map(s=>s.id).sort(),['A','B'],`E04 ${metric}: curvas A/B presentes`);assert.ok(graph.series.every(s=>s.metric===metric),`E04 ${metric}: identidad de las curvas`);assert.deepEqual(graph.points.map(p=>p.id).sort(),['A','B'],`E04 ${metric}: puntos A/B presentes`);assert.ok(graph.points.every(p=>p.month===60),`E04 ${metric}: fecha de los puntos del gráfico`);
    for(let i=1;i<rows.length;i++)assert.equal(parseSpanishNumber(rows[i][1]),parseSpanishNumber(rows[i][2]),`E04 ${metric} mes ${i-1}: trayectorias idénticas`);
    const point=identicalGolden.snapshots.find(s=>s.month===60);assert.ok(point,`E04 golden mes 60 ${metric}`);
    near(parseSpanishNumber(rows.at(-1)[1]),point.A.point[metric],displayTolerance(metric),`E04 mes 60 ${metric} golden A`);
    near(parseSpanishNumber(rows.at(-1)[2]),point.B.point[metric],displayTolerance(metric),`E04 mes 60 ${metric} golden B`);
  }
  await click('[data-action="csv"]');
  const csvName=await waitFor(async()=>{try{return (await readdir(profile)).find(name=>name.endsWith('.csv')&&!name.endsWith('.crdownload'))||false;}catch{return false;}});
  const csvRows=(await readFile(path.join(profile,csvName),'utf8')).replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.split(';'));
  assert.equal(csvRows.length,62,'E04 CSV exportado desde la UI: encabezado y 61 fechas');
  assert.equal(csvRows[1][1],`Cierre ${goldenManifest.baseYear}`,'E04 CSV: fecha inicial');
  const baseSnapshot=identicalGolden.snapshots.find(s=>s.month===60);
  for(let rowIndex=1;rowIndex<csvRows.length;rowIndex++){
    const row=csvRows[rowIndex],month=Number(row[0]);assert.equal(month,rowIndex-1,`E04 CSV: periodo ${rowIndex-1}`);
    for(let metricIndex=0;metricIndex<metrics.length;metricIndex++){
      const a=Number(row[2+metricIndex*2]),b=Number(row[3+metricIndex*2]);
      assert.ok(Number.isFinite(a)&&Number.isFinite(b),`E04 CSV: números completos para ${metrics[metricIndex]} mes ${month}`);
      assert.equal(a,b,`E04 CSV: igualdad sin redondeo para ${metrics[metricIndex]} mes ${month}`);
      if(month===60){assert.equal(a,baseSnapshot.A.point[metrics[metricIndex]],`E04 CSV mes 60 ${metrics[metricIndex]} golden A`);assert.equal(b,baseSnapshot.B.point[metrics[metricIndex]],`E04 CSV mes 60 ${metrics[metricIndex]} golden B`);}
    }
  }
  const identicalCards=await evaluate(`([...document.querySelectorAll('.kpi[data-metric]')].map(k=>({metric:k.dataset.metric,value:k.querySelector('.kpi-main')?.textContent.trim(),difference:k.querySelector('.kpi-compare .delta')?.textContent||''})))`);
  for(const card of identicalCards){near(parseSpanishNumber(card.difference),0,0.051,`E04 tarjeta ${card.metric}: diferencia cero`);const snapshot=identicalGolden.snapshots.find(s=>s.month===60).A,goldenValue=({gdp:snapshot.ui.activity,purchasingPower:snapshot.ui.purchasingPower,inflation:snapshot.ui.inflation,unemployment:snapshot.ui.unemployment,debtRatio:snapshot.point.debtRatio,investment:snapshot.point.investment})[card.metric];near(parseSpanishNumber(card.value),typeof goldenValue==='string'?parseSpanishNumber(goldenValue):goldenValue,0.051,`E04 tarjeta ${card.metric}: golden`);}
  const eventsA=await evaluate(`([...document.querySelectorAll('.recent-events .recent-event')].map(e=>e.textContent.trim()))`);
  await evaluate(`(()=>{const s=document.querySelector('#observed-branch');s.value='B';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await waitFor(async()=>evaluate(`document.querySelector('#observed-branch')?.value==='B'`));
  const eventsB=await evaluate(`([...document.querySelectorAll('.recent-events .recent-event')].map(e=>e.textContent.trim()))`);
  assert.deepEqual(eventsA,eventsB,'E04 acontecimientos recientes comparables son iguales en ambas trayectorias');
  const externalEvents=async branchId=>{
    await evaluate(`(()=>{const s=document.querySelector('#observed-branch');if(s.value!==${JSON.stringify(branchId)}){s.value=${JSON.stringify(branchId)};s.dispatchEvent(new Event('change',{bubbles:true}));}})()`);
    await waitFor(async()=>evaluate(`document.querySelector('#observed-branch')?.value===${JSON.stringify(branchId)}`));
    await click('[data-view="understand"]');await waitFor(async()=>evaluate(`!!document.querySelector('.explanation-panel')`));
    if(!await evaluate(`document.querySelector('.explanation-panel details')?.open`))await click('.explanation-panel details summary');
    await waitFor(async()=>evaluate(`!!document.querySelector('.feed-panel')`));
    return evaluate(`([...document.querySelectorAll('.feed-panel .event')].filter(e=>e.querySelector('.event-head span')?.textContent.trim()==='EXTERNO').map(e=>({date:e.querySelector('time')?.textContent.trim(),title:e.querySelector('h3')?.textContent.trim()})))`);
  };
  const externalA=await externalEvents('A'),externalB=await externalEvents('B');
  assert.deepEqual(externalA,externalB,'E04 acontecimientos externos visibles y comparables comparten fecha y título');
  console.log(`PASS E04 · comparación idéntica · mes 60 · 6 series completas, 6 tarjetas, fechas y acontecimientos visibles idénticos (${externalA.length} externos en el registro visible)`);
  await click('[data-view="evolution"]');await waitFor(async()=>evaluate(`!!document.querySelector('#chart-area')`));

  // E05: the public UI creates the month-36 fork and the approved oracle checks both histories.
  await resetToStart();
  for(let year=0;year<3;year++){await click('[data-action="year"]');await waitFor(async()=>evaluate(`document.querySelector('#chart-area [data-series-point="B"]')?.dataset.month==='${(year+1)*12}'`));}
  await ensureTable();
  const preFork={};for(const metric of metrics){await chooseMetric(metric);preFork[metric]=await seriesTable();}
  await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
  await click('.config-actions [data-action="compare"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] #new-scenario-name')`));
  await evaluate(`(()=>{const n=document.querySelector('#new-scenario-name');n.value='E05 alternativa mes 36';n.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&!!document.querySelector('[data-policy="taxShift"]')&&document.querySelector('#observed-branch')?.value==='B'`));
  await click('[data-action="decision-mode"][data-mode="controls"]');
  await evaluate(`(()=>{const e=document.querySelector('[data-policy="taxShift"]');if(!e)throw new Error('Control público taxShift no encontrado');e.value=4;e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await click('[data-action="apply-decisions"]');await waitFor(async()=>evaluate(`!!document.querySelector('[role="dialog"] [data-action="confirm-dialog"]')`));
  await click('[data-action="confirm-dialog"]');await waitFor(async()=>evaluate(`!document.querySelector('[role="dialog"]')&&document.querySelector('#observed-branch')?.value==='A'&&document.querySelector('#chart-area [data-series-point="A"]')?.dataset.month==='36'`));
  for(const metric of metrics){
    await chooseMetric(metric);const rows=await seriesTable();assert.equal(rows.length,37,`E05 ${metric}: mes 36 permanece en la fecha de bifurcación`);
    assert.ok(rows[0][0].includes(String(goldenManifest.baseYear)),`E05 ${metric}: fecha inicial preservada`);
    assert.deepEqual(rows.map(r=>r[0].split(' · ').at(-1)),preFork[metric].map(r=>r[0].split(' · ').at(-1)),`E05 ${metric}: fechas preservadas hasta la bifurcación`);
    assert.deepEqual(rows.slice(1).map(r=>r[1]),preFork[metric].slice(1).map(r=>r[1]),`E05 ${metric}: historia de la trayectoria original preservada hasta 36`);
    assert.deepEqual(rows.slice(1).map(r=>r[2]),preFork[metric].slice(1).map(r=>r[1]),`E05 ${metric}: historia clonada sin reescritura hasta 36`);
  }
  await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
  const confirmedTax=await evaluate(`document.querySelector('.decisions-sidebar [data-policy="taxShift"]')?.value`);assert.equal(confirmedTax,'4','E05: receta pública P02 confirmada en la alternativa');
  await click('[data-action="cancel-decisions"]');await waitFor(async()=>evaluate(`!document.querySelector('.decisions-sidebar')`));
  await evaluate(`(()=>{const s=document.querySelector('#observed-branch');s.value='B';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await waitFor(async()=>evaluate(`document.querySelector('#observed-branch')?.value==='B'`));
  await click('[data-action="decisions-toggle"]');await waitFor(async()=>evaluate(`!!document.querySelector('.decisions-sidebar')`));
  const originalTax=await evaluate(`document.querySelector('.decisions-sidebar [data-policy="taxShift"]')?.value`);assert.equal(originalTax,'0','E05: la trayectoria original conserva su control de impuestos');
  await click('[data-action="cancel-decisions"]');await waitFor(async()=>evaluate(`!document.querySelector('.decisions-sidebar')`));
  await evaluate(`(()=>{const s=document.querySelector('#observed-branch');s.value='A';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await waitFor(async()=>evaluate(`document.querySelector('#observed-branch')?.value==='A'`));
  const waitForkMonth=month=>waitFor(async()=>evaluate(`document.querySelector('#chart-area [data-series-point="A"]')?.dataset.month==='${month}'`));
  const e05Oracle=reviewedOracles.E05;
  assert.equal(e05Oracle.forkMonth,36,'E05: mes de bifurcación del oráculo');
  assert.equal(e05Oracle.effectiveFromMonth,37,'E05: el paso siguiente al fork es el primero afectado');
  assert.deepEqual(e05Oracle.changes,{taxShift:{from:0,to:4,unit:'pp',runtimeBranch:'A'}},'E05: receta P02 aplicada a la rama alternativa');
  const verifyStructuralHorizon=async month=>{
    let gdpDifference;
    const expectedPoint=e05Oracle.snapshots.find(item=>item.month===month);assert.ok(expectedPoint,`E05 golden versionado mes ${month}`);
    for(const metric of metrics){
      await chooseMetric(metric);const rows=await seriesTable();assert.equal(rows.length,month+1,`E05 ${metric}: historial hasta mes ${month}`);
      const date=rows.at(-1)[0];assert.ok(date.includes(String(goldenManifest.baseYear+Math.ceil(month/12))),`E05 ${metric}: fecha visible del horizonte ${month}; UI=${date}, año esperado=${goldenManifest.baseYear+Math.ceil(month/12)}`);
      assert.equal(date.split(' · ').at(-1),expectedPoint.date,`E05 ${metric}: periodo coincide con golden`);
      for(let i=1;i<=36;i++)assert.equal(rows[i][1],rows[i][2],`E05 ${metric}: pasado común conserva mes ${i-1}`);
      near(parseSpanishNumber(rows.at(-1)[1]),expectedPoint.B.point[metric],displayTolerance(metric),`E05 mes ${month} serie B ${metric}`);
      near(parseSpanishNumber(rows.at(-1)[2]),expectedPoint.A.point[metric],displayTolerance(metric),`E05 mes ${month} serie A ${metric}`);
      if(metric==='gdp')gdpDifference=[parseSpanishNumber(rows.at(-1)[1]),parseSpanishNumber(rows.at(-1)[2])];
    }
    if(month===36)assert.equal(gdpDifference[0],gdpDifference[1],`E05 mes 36: estado idéntico en la bifurcación`);
    else assert.notEqual(gdpDifference[0],gdpDifference[1],`E05 producción: las trayectorias divergen tras la bifurcación en mes ${month}`);
    const cards=await evaluate(`Object.fromEntries([...document.querySelectorAll('.kpi[data-metric]')].map(e=>[e.dataset.metric,e.querySelector('.kpi-main')?.textContent.trim()]))`);
    for(const metric of ['gdp','purchasingPower','inflation','unemployment']){
      near(parseSpanishNumber(cards[metric]),expectedPoint.B.point[metric],displayTolerance(metric),`E05 mes ${month} tarjeta ${metric}`);
      const comparison=await evaluate(`document.querySelector('.kpi[data-metric="${metric}"] .kpi-compare button')?.textContent||''`);
      near(parseSpanishNumber(comparison),expectedPoint.A.point[metric],displayTolerance(metric),`E05 mes ${month} tarjeta comparada ${metric}`);
    }
    console.log(`PASS E05 · bifurcación en mes 36 · mes ${month} · 6 series A/B, 6 tarjetas e historia común · golden revisado`);
  };
  await click('[data-action="step"]');await waitForkMonth(37);await verifyStructuralHorizon(37);
  for(let i=0;i<11;i++){await click('[data-action="step"]');await waitForkMonth(38+i);}await verifyStructuralHorizon(48);
  for(let i=0;i<4;i++){await click('[data-action="year"]');await waitForkMonth(60+i*12);}await verifyStructuralHorizon(96);
  await verifyRawOracle(e05Oracle,[36,37,48,96],'E05 bifurcación mes 36');
  assert.deepEqual(errors,[],'errores JavaScript de página');
  console.log('PASS suite E2E ejecutada: HTTP + aplicación + controles + Worker + IndexedDB; goldens adicionales revisados y versionados.');
  ws.close();
} catch(error) {
  console.error(error);
  throw error;
} finally {
  if(browser){browser.kill();await Promise.race([once(browser,'exit').catch(()=>{}),delay(3000)]);}
  server?.kill();await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}

function parseSpanishNumber(text){
  const match=String(text).match(/[+-]?[\d.]+(?:,\d+)?/);assert.ok(match,`número visible en: ${text}`);
  return Number(match[0].replaceAll('.','').replace(',','.'));
}
function fingerprint(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');}
function displayTolerance(metric){return metric==='purchasingPower'?0.51:0.051;}
function near(actual,expected,tolerance,label){assert.ok(Number.isFinite(actual)&&Number.isFinite(expected)&&Math.abs(actual-expected)<=tolerance,`${label}: obtenido ${actual}, esperado ${expected} ± ${tolerance}`);}
async function waitFor(fn){const end=Date.now()+30000;while(Date.now()<end){const value=await fn();if(value)return value;await delay(100);}throw new Error('Timeout esperando estado observable de la interfaz');}
