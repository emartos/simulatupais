import { existsSync, rmSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
let compiler;
try { compiler = require.resolve('typescript/bin/tsc'); }
catch { compiler = process.env.TSC_PATH; }
if (!compiler || !existsSync(compiler)) {
  console.error('Falta TypeScript para compilar. Ejecuta npm ci. Para usar la version incluida: npm start.');
  process.exit(1);
}
const result = spawnSync(process.execPath, [compiler, '--project', 'tsconfig.json', '--noEmitOnError'], {stdio: 'inherit'});
if (result.status !== 0) process.exit(result.status || 1);
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
const files = ['public/data/spain.json', 'src/core/model.ts'];
const hashes = Object.fromEntries(files.map(f => [f, createHash('sha256').update(readFileSync(f)).digest('hex')]));
writeFileSync('dist/build-info.json', JSON.stringify({ version: '0.1.0', hashes }, null, 2));
console.log('Compilacion completada: dist/. No hay dependencias de ejecucion externas.');
