import { spawnSync } from 'node:child_process';
import { archiveReplay } from './replay-archive-lib.mjs';

// An archived snapshot has no moving commit SHA; its content identity is replayRuntimeId.
const build=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit',env:{...process.env,SOURCE_COMMIT:'replay-archive'}});
if(build.status!==0)process.exit(build.status||1);
try{
  const result=archiveReplay('dist','public/replay');
  console.log(`${result.created?'Archivado':'Verificado'} ${result.id} · SHA-256 ${result.contentSha256}`);
}catch(error){console.error((error).message);process.exitCode=1;}
