import type { Base, Dataset, Observation } from './types.js';
export const REQUIRED = ['gdp', 'consumption', 'services', 'investment', 'exports', 'imports', 'population', 'populationPrevious', 'unemployment', 'inflation', 'debt', 'births', 'deaths', 'employed'] as const;
const POSITIVE = new Set<string>(REQUIRED.filter(x => x !== 'inflation'));
export function selectBase(dataset: Dataset): Base {
  if (!dataset || !Array.isArray(dataset.observations)) throw new Error('Cat\u00e1logo de datos no v\u00e1lido.');
  const years = [...new Set(dataset.observations.map(o => o.baseYear))].sort((a,b)=>b-a);
  for (const year of years) {
    const selected: Observation[] = [];
    for (const id of REQUIRED) {
      const candidates = dataset.observations.filter(o => o.id === id && o.baseYear === year && o.kind !== 'projection' && Number.isFinite(o.value) && (!POSITIVE.has(id) || o.value > 0) && Boolean(o.source && o.referencePeriod && o.published)).sort((a,b)=>b.published.localeCompare(a.published));
      if (candidates[0]) selected.push(candidates[0]);
    }
    if (selected.length !== REQUIRED.length) continue;
    const values = Object.fromEntries(selected.map(o=>[o.id,o.value]));
    const y = values.gdp!;
    const sum = values.consumption! + values.services! + values.investment! + values.exports! - values.imports!;
    if (Math.abs(y-sum) > Math.max(0.01, y*0.00001)) throw new Error('Los componentes del PIB no concilian en el a\u00f1o candidato.');
    if (values.unemployment! >= 1 || values.inflation! <= -1) throw new Error('Unidades incorrectas en las tasas.');
    return { year, datasetVersion: dataset.version, values, observations: selected };
  }
  throw new Error('No existe un a\u00f1o con cobertura completa de las variables imprescindibles. No se imputan datos silenciosamente.');
}
export function fingerprint(text: string): string {
  // Non-security fingerprint. Import uses the trusted local catalog and replays, never imported state.
  let h = 2166136261;
  for (let i=0;i<text.length;i++) h=Math.imul(h ^ text.charCodeAt(i),16777619);
  return (h>>>0).toString(16).padStart(8,'0');
}
