// Read-only local sensitivity probe. Requires the ordinary build in dist/.
// It imports the compiled production core without modifying engine, fixtures or goldens.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || '.');
const load = f => import(pathToFileURL(path.join(root, 'dist/app', f)).href);
const [{selectBase}, {createPrimaryExperiment, advance, point}, {baselinePolicy}, {MODEL_VERSION}, data] = await Promise.all([
  load('core/data.js'), load('core/engine.js'), load('core/policy.js'), load('core/model.js'),
  Promise.resolve(JSON.parse(fs.readFileSync(path.join(root, 'public/data/spain.json'), 'utf8'))),
]);
const base = selectBase(data);
const seed = 1847;
const horizons = [12, 60, 120];
const basePolicy = baselinePolicy(base);
const cases = [
  ['taxShift', -.5, .5], ['progressivity', -.5, .5], ['consumptionTax', -.5, .5],
  ['corporateTax', -.5, .5], ['transfers', -1, 1], ['publicInvestment', -.1, .1],
  ['services', -.1, .1], ['investmentFriction', null, .25],
];
const metrics = ['gdp','purchasingPower','inflation','unemployment','debtRatio','investment'];
const runs = {};
for (const [control, negative, positive] of cases) {
  runs[control] = {};
  for (const [label, delta] of [['minus', negative], ['base', 0], ['plus', positive]]) {
    if (delta === null) continue;
    const policy = {...basePolicy, [control]:basePolicy[control] + delta};
    let exp = createPrimaryExperiment(base, seed, policy);
    runs[control][label] = {};
    for (const horizon of horizons) {
      exp = advance(exp, horizon - exp.b.state.month);
      const p = point(exp.b.state);
      runs[control][label][horizon] = Object.fromEntries(metrics.map(m=>[m,p[m]]));
    }
  }
}
const result = {model:MODEL_VERSION,catalog:data.version,baseYear:base.year,seed,horizons,metrics,steps:Object.fromEntries(cases.map(([k,n,p])=>[k,{negative:n,positive:p,baseline:basePolicy[k]}])),runs};
if (process.argv.includes('--markdown')) {
  const units = {gdp:'mil M€ reales/año',purchasingPower:'€/persona/año',inflation:'%',unemployment:'%',debtRatio:'%',investment:'mil M€ reales/año'};
  console.log(`### Barrido reproducible\n\nModelo ${MODEL_VERSION}; catálogo ${data.version}; base ${base.year}; semilla ${seed}. Cada celda lista valor con delta negativo / baseline / positivo y, debajo, diferencia frente a baseline en el mismo orden. Redondeo de tabla: 4 decimales; se calculó con doubles sin redondear. Unidades: producción e inversión ${units.gdp}; capacidad de compra ${units.purchasingPower}; inflación y desempleo en puntos porcentuales de sus valores reportados; deuda/PIB en pp del ratio.\n\n| Control | Mes | ${metrics.map(m=>`${m} (${units[m]})`).join(' | ')} |\n|---|---:|${metrics.map(()=> '---').join('|')}|`);
  for (const [control] of cases) for (const h of horizons) {
    const run=runs[control], b=run.base[h], cells=metrics.map(m=>{
      const n=run.minus?.[h]?.[m], p=run.plus[h][m], f=v=>v.toFixed(4);
      return `− ${n===undefined?'n/d':f(n)} / ${f(b[m])} / + ${f(p)}<br>Δ −/+ ${n===undefined?'n/d':f(n-b[m])} / ${f(p-b[m])}`;
    });
    console.log(`| \`${control}\` | ${h} | ${cells.join(' | ')} |`);
  }
} else console.log(JSON.stringify(result, null, 2));
