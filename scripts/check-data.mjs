import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { selectBase, REQUIRED } from '../dist/app/core/data.js';
const file=resolve(process.argv[2] || 'public/data/spain.json');
const data=JSON.parse(readFileSync(file,'utf8'));
if(!data.version||!data.reviewed||data.countryCode!=='ES')throw new Error('Faltan metadatos del catalogo.');
for(const o of data.observations){
 if(!REQUIRED.includes(o.id))throw new Error(`Indicador desconocido: ${o.id}`);
 if(!Number.isInteger(o.baseYear)||!Number.isFinite(o.value))throw new Error('Ano o cifra invalida.');
 if(!['observed','source-estimate','projection'].includes(o.kind))throw new Error(`Naturaleza invalida: ${o.kind}`);
 if(!o.unit||!o.sourceTitle||!o.referencePeriod||!/^\d{4}-\d{2}-\d{2}$/.test(o.published))throw new Error('Procedencia incompleta.');
 if(new URL(o.source).protocol!=='https:')throw new Error('La fuente debe tener una URL HTTPS.');
}
const base=selectBase(data);
console.log(JSON.stringify({file,version:data.version,reviewed:data.reviewed,selectedYear:base.year,selectedIndicators:base.observations.length,totalRecords:data.observations.length,coverage:base.observations.map(o=>({id:o.id,period:o.referencePeriod,kind:o.kind}))},null,2));
console.log('PASS: estructura y coherencia del catalogo. No equivale a verificar los originales en Internet.');
