import { selectBase, fingerprint } from './core/data.js';
import { createExperiment, createPrimaryExperiment, advance, fork, compareFrom, configureBranch, setShocksEnabled } from './core/engine.js';
import { validatePolicy } from './core/policy.js';
import { restoreSession, validateSession } from './core/session.js';
import type { Dataset, Experiment, WorkerRequest, WorkerResponse } from './core/types.js';
let experiment:Experiment|undefined;
let hash='';
const scope=self as unknown as { onmessage:(e:MessageEvent<WorkerRequest>)=>void; postMessage:(m:WorkerResponse)=>void };
scope.onmessage=(event)=>{
  const {id,type,payload}=event.data;
  try {
    if(type==='INIT') {
      const p=payload as {dataset:Dataset;seed:number;policy?:unknown;primary?:boolean;shocksEnabled?:boolean};
      const base=selectBase(p.dataset);
      hash=fingerprint(JSON.stringify(p.dataset));
      experiment=p.primary?createPrimaryExperiment(base,p.seed,p.policy?validatePolicy(p.policy):undefined,p.shocksEnabled??true):createExperiment(base,p.seed,p.policy?validatePolicy(p.policy):undefined,p.shocksEnabled??true);
    } else {
      if(!experiment) throw new Error('El motor no est\u00e1 inicializado.');
      if(type==='ADVANCE') experiment=advance(experiment,payload as number);
      else if(type==='CONFIGURE') {
        const request=payload&&typeof payload==='object'&&'policy' in payload?payload as {policy:unknown;branchId?:'A'|'B'}:{policy:payload,branchId:'B' as const};
        const branchId=request.branchId||'B';
        experiment=configureBranch(experiment,branchId,validatePolicy(request.policy));
      } else if(type==='FORK') experiment=fork(experiment,validatePolicy(payload));
      else if(type==='COMPARE') {const request=payload as {sourceId:'A'|'B';policy:unknown};experiment=compareFrom(experiment,request.sourceId,validatePolicy(request.policy));}
      else if(type==='RESTORE') experiment=restoreSession(validateSession(payload,experiment.base,hash),experiment.base);
      else if(type==='SHOCKS') {
        if(typeof payload!=='boolean')throw new Error('La opción de perturbaciones no es válida.');
        experiment=setShocksEnabled(experiment,payload);
      }
      else throw new Error('Orden desconocida.');
    }
    scope.postMessage({id,ok:true,experiment});
  } catch(error) {
    scope.postMessage({id,ok:false,error:error instanceof Error?error.message:'Error desconocido del motor.'});
  }
};
