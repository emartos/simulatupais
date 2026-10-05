import { BOUNDS, baselinePolicy } from '../core/policy.js';
import type { Base, Policy } from '../core/types.js';
import type { PoliticalControlKey, PoliticalPositionScore } from './schema.js';

export function positionStep(key:PoliticalControlKey):number { return BOUNDS[key][2]; }

export function positionToControlValue(base:Base,key:PoliticalControlKey,score:Exclude<PoliticalPositionScore,null>):number {
  const baseline=baselinePolicy(base)[key] as number,[min,max,step]=BOUNDS[key];
  const value=baseline+score*step;
  return Math.min(max,Math.max(min,value));
}

export function applyPositionToPolicy(base:Base,policy:Policy,key:PoliticalControlKey,score:PoliticalPositionScore):Policy {
  if(score===null)return policy;
  return {...policy,[key]:positionToControlValue(base,key,score)};
}
