import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const bundled = await build({entryPoints:['src/ui/wizard.ts','src/core/data.ts','src/core/policy.ts','src/ui/economic-axis-method.ts'],bundle:true,format:'esm',platform:'node',outdir:'/tmp/wizard-contract',write:false});
const load = async name => import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles.find(file=>file.path.endsWith(`/${name}.js`)).text).toString('base64')}`);
const wizard = await load('wizard'),{selectBase}=await load('data'),{baselinePolicy}=await load('policy'),{calculateChangeOrientation}=await load('economic-axis-method');
const dataset=JSON.parse(readFileSync(new URL('../public/data/spain.json',import.meta.url)));
const base=selectBase(dataset);

test('el cuestionario conserva las seis preguntas y comparte la escala estandarizada',()=>{
  assert.deepEqual(wizard.WIZARD_QUESTIONS.map(q=>q.key),['taxShift','progressivity','transfers','services','publicInvestment','consumptionTax']);
  assert.deepEqual(wizard.WIZARD_QUESTIONS.map(q=>q.options.map(o=>o.value)),[[-2,-1,null,1,2],[-2,-1,null,1,2],[-2,-1,null,1,2],[-1,null,1],[-2,-1,null,1,2],[-2,-1,null,1,2]]);
  const progressivity=wizard.WIZARD_QUESTIONS.find(q=>q.key==='progressivity');
  assert.match(progressivity.prompt,/diferencia entre los tipos de los grupos con más y menos ingresos/i);
  assert.match(progressivity.explanation,/puntos porcentuales/i);
  assert.match(progressivity.explanation,/grupo intermedio no cambia/i);
  assert.match(progressivity.explanation,/topes/i);
  const services=wizard.WIZARD_QUESTIONS.find(q=>q.key==='services'),investment=wizard.WIZARD_QUESTIONS.find(q=>q.key==='publicInvestment');
  assert.match(services.prompt,/gasto corriente/i);assert.match(services.explanation,/sin efecto|no.*productiv/i);assert.match(services.explanation,/inversión.*por separado/i);
  assert.match(investment.explanation,/capital/i);assert.match(investment.explanation,/capacidad.*retardo/i);
});
test('mantener conserva los valores de referencia con toda su precisión',()=>{
  const answer=Array(6).fill(null),actual=wizard.wizardPolicy(base,answer),reference=baselinePolicy(base);
  assert.deepEqual(actual,reference);
  assert.equal(actual.services,reference.services);
});
test('las seis respuestas del drawer comparten la conversión del cuestionario inicial',()=>{
  const reference=baselinePolicy(base),keys=['taxShift','progressivity','transfers','services','publicInvestment','consumptionTax'];
  keys.forEach((key,index)=>{
    const answers=Array(6).fill(null);answers[index]=1;
    assert.equal(wizard.guidedAnswerValue(base,index,1),wizard.wizardPolicy(base,answers)[key],key);
    assert.equal(wizard.guidedAnswerValue(base,index,null),reference[key],`Mantener: ${key}`);
  });
});
test('la vista previa de servicios usa el porcentaje del control sin dividir otra vez por PIB',()=>{
  const reference=baselinePolicy(base).services,answers=Array(6).fill(null),choice=wizard.WIZARD_QUESTIONS[3].options.find(option=>option.value===1);
  const detail=wizard.wizardChoiceDetail(base,3,choice,answers),format=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(n);
  assert.match(detail,new RegExp(`${format(reference)} → ${format(reference+0.1)} % de la producción`));
  assert.match(detail,/unos 19,3 € por cada 100 €/);
  assert.doesNotMatch(detail,/1,14|1,15 %/);
});
test('previsualizaciones de impuestos combinan nivel y progresividad mediante el motor',()=>{
  const answers=[2,2,null,null,null,null];
  const q1=wizard.WIZARD_QUESTIONS[0],q2=wizard.WIZARD_QUESTIONS[1];
  const preview1=wizard.wizardChoiceDetail(base,0,q1.options[3],answers);
  const preview2=wizard.wizardChoiceDetail(base,1,q2.options[3],answers);
  assert.match(preview1,/Menores ingresos:/);
  assert.match(preview2,/Mayores ingresos:/);
  assert.equal(preview1.split(' · ').length,3);
  assert.equal(preview2.split(' · ').length,3);
});
test('configuración guiada y controles equivalentes generan la misma política',()=>{
  const answers=[2,-1,1,1,2,1],guided=wizard.wizardPolicy(base,answers),manual=baselinePolicy(base);
  manual.taxShift+=1;manual.progressivity-=.5;manual.transfers=1;manual.services+=.1;manual.publicInvestment+=.2;manual.consumptionTax+=.5;
  assert.deepEqual(guided,manual);
  assert.deepEqual(calculateChangeOrientation(baselinePolicy(base),guided),calculateChangeOrientation(baselinePolicy(base),manual));
});
