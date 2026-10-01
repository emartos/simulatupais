import type { Session } from '../core/types.js';
const DB='polis-local-v1';
function openDB():Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB,1);
    req.onupgradeneeded=()=>req.result.createObjectStore('sessions');
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('No se pudo abrir IndexedDB.'));
    req.onblocked=()=>reject(new Error('El almacenamiento est\u00e1 bloqueado por otra pesta\u00f1a.'));
  });
}
export async function loadLocal():Promise<Session|undefined> {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('sessions','readonly');
    const req=tx.objectStore('sessions').get('active');
    req.onsuccess=()=>resolve(req.result as Session|undefined);
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close(); tx.onabort=()=>{db.close();reject(tx.error);};
  });
}
export async function saveLocal(session:Session):Promise<void> {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('sessions','readwrite'); tx.objectStore('sessions').put(session,'active');
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onabort=tx.onerror=()=>{db.close();reject(tx.error||new Error('No se pudo guardar la sesi\u00f3n.'));};
  });
}
