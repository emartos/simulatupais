import { createHash } from 'node:crypto';

export const RUNTIME_ID_PATTERN=/^rt-[a-f0-9]{32}$/;

export function replayRuntimeId(workerBytes,datasetBytes,replayBytes){
  const hash=createHash('sha256');
  for(const part of [workerBytes,datasetBytes,replayBytes]){
    const bytes=Buffer.from(part);
    const length=Buffer.alloc(8);length.writeBigUInt64BE(BigInt(bytes.length));
    hash.update(length).update(bytes);
  }
  return `rt-${hash.digest('hex').slice(0,32)}`;
}
