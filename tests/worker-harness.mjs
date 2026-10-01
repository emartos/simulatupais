import { parentPort } from 'node:worker_threads';
globalThis.self={postMessage:message=>parentPort.postMessage(message)};
await import('../dist/app/worker.js');
parentPort.on('message',message=>globalThis.self.onmessage({data:message}));
