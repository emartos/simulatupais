import { spawnSync } from 'node:child_process';
import { verifyArchivedRuntime } from './replay-archive-lib.mjs';

const build=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
try{const result=verifyArchivedRuntime('dist','public/replay');console.log(`Snapshot verificado: ${result.id} · SHA-256 ${result.contentSha256}`);}
catch(error){console.error((error).message);process.exitCode=1;}
