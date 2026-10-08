export type ScenarioSource='default'|'local'|'shared_url'|'editorial';
export type ShareMethod='native'|'copy'|'whatsapp'|'x';
export type GrowthEvent=
  |{name:'scenario_loaded';source:ScenarioSource;country:string;horizon:number;scenario_version:number}
  |{name:'simulation_started'|'simulation_completed';country:string;horizon:number;changed_decisions_count:number}
  |{name:'share_clicked'|'share_completed';method:ShareMethod}
  |{name:'shared_scenario_opened'|'shared_scenario_modified'|'shared_scenario_simulated';country:string;horizon:number;scenario_version:number};

/** A local integration point. No event is stored or sent to a provider. */
export function emitGrowthEvent(event:GrowthEvent):void {
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('simulatupais:growth',{detail:event}));
}
