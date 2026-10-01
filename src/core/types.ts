export type ObservationKind = 'observed' | 'source-estimate' | 'projection';
export interface Observation {
  id: string; label: string; value: number; unit: string; baseYear: number;
  referencePeriod: string; source: string; sourceTitle: string; published: string;
  kind: ObservationKind; note: string;
}
export interface Dataset {
  version: string; country: string; countryCode: string; reviewed: string;
  observations: Observation[];
}
export interface Base {
  year: number; datasetVersion: string; values: Record<string, number>;
  observations: Observation[];
}
export interface Policy {
  taxShift: number; progressivity: number; consumptionTax: number; corporateTax: number;
  transfers: number; publicInvestment: number; services: number; investmentFriction: number;
  elections: 'competitive' | 'single-party' | 'appointment'; termMonths: number;
  expression: boolean; judicialReview: boolean;
}
export interface Trace {
  id: string; title: string; equation: string; explanation: string;
  inputs: Record<string, number>; result: number; unit: string; assumption: boolean;
}
export interface Household {
  label: string; populationShare: number; gross: number; tax: number; transfers: number;
  disposable: number; realPerPerson: number; consumption: number;
}
export interface SimEvent {
  id: string; month: number; branch: 'A' | 'B'; type: 'external' | 'economy' | 'institution' | 'warning';
  title: string; text: string; mechanisms: string[];
}
export interface State {
  month: number; population: number; gdpReal: number; gdpNominal: number;
  producerPrice: number; consumerPrice: number; inflation: number; underlyingInflation: number;
  priceMemory: number[]; capacity: number; capital: number; unemployment: number;
  debt: number; publicAssets: number; revenue: number; spending: number; deficit: number;
  consumption: number; services: number; investment: number; publicInvestment: number; netExports: number;
  households: Household[]; trace: Trace[]; constraints: string[];
}
export interface Point {
  month: number; gdp: number; nominal: number; inflation: number; unemployment: number;
  debtRatio: number; purchasingPower: number; population: number; investment: number;
}
export interface PolicyChange { month: number; policy: Policy; }
export interface Branch { id: 'A' | 'B'; policy: Policy; state: State; history: Point[]; events: SimEvent[]; initialPolicy?: Policy; policyChanges?: PolicyChange[]; institutionOriginMonth?: number; }
export interface SessionV1 { schema: 1; modelVersion: string; datasetVersion: string; datasetHash: string; seed: number; months: number; forkMonth: number; policy: Policy; }
export interface SessionV2 { schema: 2; modelVersion: string; datasetVersion: string; datasetHash: string; seed: number; months: number; forkMonth:number; primaryId: 'A'|'B'; comparisonActive: boolean; comparisonOriginId: 'A'|'B'; branchNames?:{A:string;B:string}; branches: { A:{initialPolicy:Policy;changes:PolicyChange[];institutionOriginMonth:number}; B:{initialPolicy:Policy;changes:PolicyChange[];institutionOriginMonth:number} }; }
export type Session = SessionV1|SessionV2;
export interface Experiment { base: Base; seed: number; forkMonth: number; a: Branch; b: Branch; comparisonActive?: boolean; primaryId?: 'A'|'B'; comparisonOriginId?: 'A'|'B'; branchNames?:{A:string;B:string}; }
export interface External { energy: number; demand: number; supply: number; id: string; }
export interface WorkerRequest { id: number; type: 'INIT' | 'ADVANCE' | 'CONFIGURE' | 'FORK' | 'COMPARE' | 'RESTORE'; payload?: unknown; }
export interface WorkerResponse { id: number; ok: boolean; experiment?: Experiment; error?: string; }
