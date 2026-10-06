import { existsSync, rmSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { build, transform } from 'esbuild';
import { projectConfig } from './project-config.mjs';
import { replayRuntimeId } from './replay-runtime.mjs';
const require = createRequire(import.meta.url);
let compiler;
try { compiler = require.resolve('typescript/bin/tsc'); }
catch { compiler = process.env.TSC_PATH; }
if (!compiler || !existsSync(compiler)) {
  console.error('Falta TypeScript para compilar. Ejecuta npm ci. Para usar la version incluida: npm start.');
  process.exit(1);
}
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
const result = spawnSync(process.execPath, [compiler, '--project', 'tsconfig.json', '--noEmitOnError'], {stdio: 'inherit'});
if (result.status !== 0) process.exit(result.status || 1);
const packageInfo = JSON.parse(readFileSync('package.json', 'utf8'));
const modelSource = readFileSync('src/core/model.ts', 'utf8');
const engineVersion = modelSource.match(/export const MODEL_VERSION = '([^']+)'/)?.[1] || 'no registrada';
const shaPattern = /^[a-f\d]{40}$/i;
const suppliedSha = process.env.SOURCE_COMMIT || process.env.GITHUB_SHA;
let commitSha = suppliedSha && shaPattern.test(suppliedSha) ? suppliedSha.toLowerCase() : null;
if (!commitSha && !suppliedSha) {
  const status = spawnSync('git', ['status', '--porcelain'], {encoding: 'utf8'});
  const head = spawnSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'});
  if (status.status === 0 && !status.stdout && head.status === 0 && shaPattern.test(head.stdout.trim())) commitSha = head.stdout.trim().toLowerCase();
}
cpSync('public', 'dist', { recursive: true });
const css = await transform(`${readFileSync('dist/style.css', 'utf8')}\n${readFileSync('dist/polish.css', 'utf8')}`, { loader: 'css', minify: true, target: 'es2022' });
writeFileSync('dist/style.css', css.code);
rmSync('dist/polish.css', { force: true });
const bundledApp = 'dist/.bundled-app';
mkdirSync('dist/app', { recursive: true });
await build({
  entryPoints: ['src/worker.ts', 'src/replay-kernel.ts'], outdir: bundledApp,
  bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022',
  external: ['./worker.js', '../data/spain.json']
});
const runtimeId=replayRuntimeId(readFileSync(`${bundledApp}/worker.js`),readFileSync('dist/data/spain.json'),readFileSync(`${bundledApp}/replay-kernel.js`));
const buildInfo = {
  appVersion: packageInfo.version,
  engineVersion,
  commitSha,
  commitUrl: commitSha ? `${projectConfig.repositoryUrl}/commit/${commitSha}` : null,
  replayRuntimeId: runtimeId
};
const project = {...projectConfig, build:buildInfo};
await build({
  entryPoints: ['src/main.ts', 'src/replay-entry.ts'], outdir: bundledApp,
  bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022',
  external: ['./worker.js', '../data/spain.json'],
  define: { __PROJECT_CONFIG__: JSON.stringify(project) }
});
for (const file of ['main.js', 'worker.js', 'replay-entry.js', 'replay-kernel.js']) {
  writeFileSync(`dist/app/${file}`, readFileSync(`${bundledApp}/${file}`));
  rmSync(`dist/app/${file}.map`, { force: true });
}
rmSync(bundledApp, { recursive: true, force: true });
const files = ['public/data/spain.json', 'src/core/model.ts'];
const hashes = Object.fromEntries(files.map(f => [f, createHash('sha256').update(readFileSync(f)).digest('hex')]));
writeFileSync('dist/build-info.json', JSON.stringify({...buildInfo, hashes}, null, 2));
console.log('Compilacion completada: dist/. No hay dependencias de ejecucion externas.');
