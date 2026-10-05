import { MODEL_VERSION } from '../core/model.js';
import { baselinePolicy, validatePolicy } from '../core/policy.js';
import type { Base, Policy, PresetOrigin } from '../core/types.js';
import { POLITICAL_CONTROL_KEYS, type PoliticalPreset, type PoliticalControlKey } from './schema.js';
import { positionToControlValue } from './coding.js';

export function presetCompatibility(preset:PoliticalPreset,modelVersion=MODEL_VERSION):boolean {return preset.modelVersion===modelVersion;}

export function applyPoliticalPreset(base:Base,preset:PoliticalPreset,modelVersion=MODEL_VERSION,currentPolicy?:Policy,appliedAtMonth=0):{policy:Policy;origin:PresetOrigin} {
  if(!presetCompatibility(preset,modelVersion))throw new Error('Este preset fue preparado para otra versión del modelo y necesita revisión antes de aplicarse.');
  const policy=currentPolicy?validatePolicy(currentPolicy):baselinePolicy(base);
  for(const key of POLITICAL_CONTROL_KEYS){const mapping=preset.policies[key];if(mapping.status==='UNMAPPED')continue;policy[key]=mapping.mappingMethod==='STANDARDIZED_CODING'?positionToControlValue(base,key,mapping.positionScore as Exclude<typeof mapping.positionScore,null>):mapping.value!;}
  const clean=validatePolicy(policy),originalPolicyValues={} as Record<PoliticalControlKey,number>,mappingStatuses={} as Record<PoliticalControlKey,typeof preset.policies[PoliticalControlKey]['status']>,mappingDetails={} as NonNullable<PresetOrigin['mappingDetails']>;
  for(const key of POLITICAL_CONTROL_KEYS){const mapping=preset.policies[key];originalPolicyValues[key]=clean[key];mappingStatuses[key]=mapping.status;mappingDetails[key]={mappingStatus:mapping.status,...(mapping.derivation?{derivationId:mapping.derivation.id}:{}),mappingMethod:mapping.mappingMethod,positionScore:mapping.positionScore,mappingVersion:preset.version};}
  return {policy:clean,origin:{presetId:preset.id,presetVersion:preset.version,partyName:preset.actorName,electionName:preset.electionName,modelVersion:preset.modelVersion,appliedAt:new Date().toISOString(),appliedAtMonth,actorName:preset.actorName,actorType:preset.actorType,electionDate:preset.electionDate,originalPolicyValues,mappingStatuses,mappingDetails}};
}

export function editPresetDraft(policy:Policy,key:PoliticalControlKey,value:number):Policy {
  return validatePolicy({...policy,[key]:value});
}
