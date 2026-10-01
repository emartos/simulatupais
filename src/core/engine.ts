import { M, MAX_MONTHS } from './model.js';
import { baselinePolicy, validatePolicy } from './policy.js';
import { externalAt } from './random.js';
import type { Base, Branch, Experiment, External, Household, Point, Policy, SimEvent, State, Trace } from './types.js';
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const sum=(xs:number[])=>xs.reduce((a,b)=>a+b,0);
export function householdBudget(gdpNominal:number,population:number,consumerPrice:number,policy:Policy,scale=1):Household[] {
  const labels=['Grupo de renta inferior','Grupo de renta intermedia','Grupo de renta superior'];
  return labels.map((label,i)=>{
    const populationShare=M.populationShares[i]!;
    const gross=gdpNominal*M.grossIncomeShare*M.incomeShares[i]!;
    const shift=policy.taxShift/100 + (i===0?-0.5:i===2?1:0)*policy.progressivity/100;
    const tax=gross*clamp(M.effectiveIncomeTaxes[i]!+shift,0,.65);
    const transfers=gdpNominal*M.transferGDPShare*(1+policy.transfers/100)*M.transferShares[i]!;
    const disposable=gross-tax+transfers;
    return {label,populationShare,gross,tax,transfers,disposable,
      realPerPerson:disposable*1e9/(population*populationShare*consumerPrice),
      consumption:disposable*clamp(M.consumptionPropensity[i]!*scale,0,1)};
  });
}
function consumptionScale(base:Base):number {
  const households=householdBudget(base.values.gdp!,base.values.population!,1,baselinePolicy(base));
  return base.values.consumption!/sum(households.map(h=>h.consumption));
}
export function initialState(base:Base):State {
  const v=base.values, y=v.gdp!, p=baselinePolicy(base);
  const households=householdBudget(y,v.population!,1,p,consumptionScale(base));
  const revenue=sum(households.map(h=>h.tax))+y*(M.socialContributionShare+M.otherRevenueShare+M.corporateProfitShare*M.baselineCorporateTax)+v.consumption!*M.baselineConsumptionTax/(1+M.baselineConsumptionTax);
  const publicInvestment=y*M.baselinePublicInvestment;
  const spending=v.services!+publicInvestment+sum(households.map(h=>h.transfers))+v.debt!*M.debtInterest;
  return {month:0,population:v.population!,gdpReal:y,gdpNominal:y,producerPrice:1,consumerPrice:1,
    inflation:v.inflation!,underlyingInflation:v.inflation!,priceMemory:Array.from({length:13},(_,i)=>Math.pow(1+v.inflation!,(i-12)/12)),
    capacity:y,capital:y*M.capitalOutputRatio,unemployment:v.unemployment!,debt:v.debt!,publicAssets:0,
    revenue,spending,deficit:spending-revenue,consumption:v.consumption!,services:v.services!,investment:v.investment!,publicInvestment,netExports:v.exports!-v.imports!,
    households,trace:[],constraints:[]};
}
export function point(s:State):Point {
  return {month:s.month,gdp:s.gdpReal,nominal:s.gdpNominal,inflation:s.inflation*100,unemployment:s.unemployment*100,
    debtRatio:s.debt/s.gdpNominal*100,purchasingPower:sum(s.households.map(h=>h.realPerPerson*h.populationShare)),population:s.population,investment:s.investment};
}
function stepState(base:Base,old:State,policy:Policy,external:External):State {
  const v=base.values, t=old.month+1, constraints:string[]=[], trace:Trace[]=[];
  const record=(id:string,title:string,equation:string,explanation:string,inputs:Record<string,number>,result:number,unit:string,assumption=true)=>trace.push({id,title,equation,explanation,inputs,result,unit,assumption});
  const popGrowth=v.population!/v.populationPrevious!-1;
  const births=old.population*(v.births!/v.population!)/12;
  const deaths=old.population*(v.deaths!/v.population!)/12;
  const residual=old.population*((v.population!-v.populationPrevious!-v.births!+v.deaths!)/v.population!)/12;
  const population=old.population+births-deaths+residual;
  record('population','Balance demogr\u00e1fico','P(t+1) = P(t) + nacimientos - defunciones + residual','Tasas constantes hipot\u00e9ticas. El residual incluye movilidad y ajustes estad\u00edsticos; no es una medici\u00f3n de migraci\u00f3n neta.',{poblacion:old.population,nacimientos:births,defunciones:deaths,residual},population,'personas');
  const scale=consumptionScale(base);
  const consumerTaxMultiplier=(1+policy.consumptionTax/100)/(1+M.baselineConsumptionTax);
  const provisionalConsumerPrice=old.producerPrice*consumerTaxMultiplier;
  const budgets=householdBudget(old.gdpNominal,population,provisionalConsumerPrice,policy,scale);
  const consumptionDesired=sum(budgets.map(h=>h.consumption))/provisionalConsumerPrice;
  const baseline=householdBudget(old.gdpNominal,population,provisionalConsumerPrice,baselinePolicy(base),scale);
  const directTaxChange=sum(budgets.map(h=>h.tax))-sum(baseline.map(h=>h.tax));
  record('households','Impuestos y renta disponible','Renta disponible = ingresos - impuestos directos + transferencias','Efecto directo, a ingresos constantes. La comparaci\u00f3n usa los tipos de referencia, no otra trayectoria.',{ingresos:sum(budgets.map(h=>h.gross)),impuestos:sum(budgets.map(h=>h.tax)),transferencias:sum(budgets.map(h=>h.transfers)),cambioImpuestoVsTiposBase:directTaxChange},sum(budgets.map(h=>h.disposable)),'miles de millones EUR/a\u00f1o',false);
  const capacityScale=old.capacity/v.gdp!;
  const retained=(1-policy.corporateTax/100)/(1-M.baselineCorporateTax);
  const returnFactor=Math.pow(retained,M.investmentReturnElasticity);
  const frictionFactor=Math.exp(-M.frictionElasticity*policy.investmentFriction/100);
  const baselinePrivate=v.investment!-v.gdp!*M.baselinePublicInvestment;
  const privateInvestment=baselinePrivate*capacityScale*returnFactor*frictionFactor;
  const publicInvestmentDesired=old.gdpReal*policy.publicInvestment/100;
  const investmentDesired=privateInvestment+publicInvestmentDesired;
  record('investment','Decisi\u00f3n de inversi\u00f3n','I privada = I base * escala * rentabilidad^elasticidad * exp(-friccion * coeficiente)','La rentabilidad despu\u00e9s del impuesto y el coste de invertir alteran la inversi\u00f3n. Magnitudes hipot\u00e9ticas; sin penalizaci\u00f3n por ideolog\u00eda.',{inversionPrivadaBase:baselinePrivate,escalaCapacidad:capacityScale,factorRentabilidad:returnFactor,factorFriccion:frictionFactor,inversionPublica:publicInvestmentDesired},investmentDesired,'miles de millones EUR constantes/a\u00f1o');
  const servicesDesired=old.gdpReal*policy.services/100;
  const domestic=consumptionDesired+servicesDesired+investmentDesired;
  const domesticBase=v.consumption!+v.services!+v.investment!;
  const exports=v.exports!*Math.pow(1+M.externalDemandGrowth,t/12)*(1+external.demand);
  const imports=v.imports!*domestic/domesticBase;
  const netExportsDesired=exports-imports;
  const demand=domestic+netExportsDesired;
  if (!(demand>0)) throw new Error('La demanda agregada ha salido del dominio del modelo.');
  const potentialGrowth=M.productivityGrowth/12+popGrowth*0.35/12;
  const capitalEffect=M.capitalElasticity*(old.investment/12/old.capital-M.depreciation/12);
  const capacity=old.capacity*Math.exp(potentialGrowth+capitalEffect+external.supply);
  const target=Math.min(demand,capacity*(1+M.capacityHeadroom));
  const gdpReal=old.gdpReal+M.outputAdjustment*(target-old.gdpReal);
  const realization=gdpReal/demand;
  const consumption=consumptionDesired*realization;
  const services=servicesDesired*realization;
  const investment=investmentDesired*realization;
  const publicInvestment=publicInvestmentDesired*realization;
  const netExports=netExportsDesired*realization;
  if (demand>capacity*(1+M.capacityHeadroom)) constraints.push('Demanda superior al l\u00edmite de capacidad; racionamiento proporcional simplificado.');
  record('output','Demanda y capacidad productiva','Y = C + G + I + X - M; ajuste parcial limitado por capacidad','Las compras deseadas se convierten en cantidades realizadas mediante un factor com\u00fan. Es un cierre agregado, no un modelo de equilibrio general ni contabilidad sectorial completa.',{consumo:consumption,servicios:services,inversion:investment,exportacionNeta:netExports,demanda:demand,capacidad:capacity,factorRealizacion:realization},gdpReal,'miles de millones EUR constantes/a\u00f1o');
  const gap=(demand-capacity)/capacity;
  const priceTarget=M.inflationAnchor+gap*M.gapPriceResponse+external.energy*M.energyPriceExposure;
  const piRaw=M.inflationPersistence*old.underlyingInflation+(1-M.inflationPersistence)*priceTarget;
  const underlyingInflation=clamp(piRaw,M.minInflation,M.maxInflation);
  if (underlyingInflation!==piRaw) constraints.push('Inflaci\u00f3n limitada al dominio num\u00e9rico; escenario fuera del rango exploratorio.');
  const producerPrice=old.producerPrice*Math.exp(underlyingInflation/12);
  const consumerPrice=producerPrice*consumerTaxMultiplier;
  const priceMemory=[...old.priceMemory,consumerPrice].slice(-13);
  const inflation=consumerPrice/priceMemory[0]!-1;
  const gdpNominal=gdpReal*producerPrice;
  record('prices','Precios de consumo','P productor(t+1) = P(t) * exp(inflacion / 12); IPC = P productor * factor impositivo','La tensi\u00f3n de capacidad y la energ\u00eda afectan al precio del productor. Los impuestos al consumo generan un cambio de nivel, no una penalizaci\u00f3n repetida cada mes.',{brechaDemandaCapacidad:gap,choqueEnergia:external.energy,tasaSubyacente:underlyingInflation,factorImpositivo:consumerTaxMultiplier},consumerPrice*100,'\u00edndice base 100');
  const growth=Math.log(gdpReal/old.gdpReal)*12;
  const uRaw=old.unemployment-M.okunCoefficient*(growth-M.productivityGrowth-popGrowth)/12;
  const unemployment=clamp(uRaw,M.minUnemployment,M.maxUnemployment);
  if (uRaw!==unemployment) constraints.push('Paro limitado al dominio exploratorio; no extrapolar esta trayectoria.');
  record('employment','Ajuste del empleo','Delta paro = -coeficiente * (crecimiento - productividad - crecimiento poblacion) / 12','Relaci\u00f3n reducida hipot\u00e9tica. No sustituye un modelo de negociaci\u00f3n salarial o mercado de trabajo.',{crecimientoAnualizado:growth,productividad:M.productivityGrowth,crecimientoPoblacion:popGrowth},unemployment*100,'% poblaci\u00f3n activa');
  // Household receipts are computed from lagged output. This avoids an algebraic loop.
  const households=budgets.map(h=>({...h,realPerPerson:h.disposable*1e9/(population*h.populationShare*consumerPrice),consumption:h.consumption*realization}));
  const directTax=sum(households.map(h=>h.tax));
  const consumptionTax=consumption*consumerPrice*(policy.consumptionTax/100)/(1+policy.consumptionTax/100);
  const corporateTax=gdpNominal*M.corporateProfitShare*policy.corporateTax/100;
  const revenue=directTax+consumptionTax+corporateTax+gdpNominal*(M.socialContributionShare+M.otherRevenueShare);
  const interest=old.debt*M.debtInterest;
  const spending=(services+publicInvestment)*producerPrice+sum(households.map(h=>h.transfers))+interest;
  const deficit=spending-revenue;
  const netDebt=old.debt-old.publicAssets+deficit/12;
  const debt=Math.max(0,netDebt), publicAssets=Math.max(0,-netDebt);
  record('budget','Cuenta p\u00fablica','Deuda neta(t+1) = deuda neta(t) + (gasto anualizado - ingresos anualizados) / 12','Compras, inversi\u00f3n, transferencias e intereses tienen contrapartida fiscal. Los super\u00e1vits cancelan deuda y despu\u00e9s acumulan activos. No reproduce el presupuesto oficial.',{recaudacion:revenue,gasto:spending,intereses:interest,deudaNetaAnterior:old.debt-old.publicAssets},debt-publicAssets,'miles de millones EUR',false);
  const capital=old.capital*(1-M.depreciation/12)+investment/12;
  record('capital','Acumulaci\u00f3n de capital','K(t+1) = K(t) * (1 - depreciacion / 12) + I / 12','La inversi\u00f3n realizada ampl\u00eda capacidad con retardo: su efecto productivo se usa en el siguiente paso.',{capitalAnterior:old.capital,depreciacion:M.depreciation,inversionMensual:investment/12},capital,'miles de millones EUR constantes',false);
  const next:State={month:t,population,gdpReal,gdpNominal,producerPrice,consumerPrice,inflation,underlyingInflation,priceMemory,capacity,capital,unemployment,debt,publicAssets,revenue,spending,deficit,consumption,services,investment,publicInvestment,netExports,households,trace,constraints};
  validateState(next,old);
  return next;
}
export function validateState(s:State,old?:State):void {
  for(const [k,v] of Object.entries(s)) if(typeof v==='number' && !Number.isFinite(v)) throw new Error(`Estado no finito: ${k}`);
  if (Math.abs(s.gdpReal-(s.consumption+s.services+s.investment+s.netExports))>s.gdpReal*1e-10) throw new Error('No se cumple la identidad de demanda.');
  if (s.population<=0 || s.gdpReal<=0 || s.capital<=0 || s.debt<0 || s.consumerPrice<=0) throw new Error('Estado fuera de dominio.');
  if(old && Math.abs((s.debt-s.publicAssets)-(old.debt-old.publicAssets+s.deficit/12))>1e-8*Math.max(1,s.debt)) throw new Error('No concilia la cuenta publica.');
  for(const h of s.households) if(Math.abs(h.gross-h.tax+h.transfers-h.disposable)>1e-7) throw new Error('No concilia la renta de hogares.');
}
function eventsFor(b:Branch,old:State,s:State,ext:External,forkMonth:number):SimEvent[] {
  const events:SimEvent[]=[];
  const add=(type:SimEvent['type'],title:string,text:string,mechanisms:string[])=>events.push({id:`${b.id}-${s.month}-${events.length}`,month:s.month,branch:b.id,type,title,text,mechanisms});
  const f=(n:number)=>n.toLocaleString('es-ES',{maximumFractionDigits:2});
  if(ext.energy) add('external',ext.energy>0?'Repunte exterior de la energ\u00eda':'Descenso exterior de la energ\u00eda',`Perturbaci\u00f3n ficticia compartida: ${f(ext.energy*100)} % en el factor energ\u00e9tico. Su efecto se transmite por el mecanismo de precios.`,['prices']);
  if(ext.demand) add('external',ext.demand>0?'Aumenta la demanda exterior':'Se contrae la demanda exterior',`La demanda exterior hipot\u00e9tica cambia un ${f(ext.demand*100)} %. Ambas ramas reciben la misma perturbaci\u00f3n.`,['output']);
  if(ext.supply) add('external',ext.supply>0?'Mejora t\u00e9cnica de la capacidad':'Interrupci\u00f3n de capacidad productiva',`Choque ficticio de oferta de ${f(ext.supply*100)} % sobre capacidad. No corresponde a un suceso real.`,['investment','capital','output']);
  const legacyFork=s.month===forkMonth+1 && b.id==='B';
  const configuredChange=b.policyChanges?.some(change=>change.month===old.month);
  if(legacyFork) add('economy','Entra en vigor la configuraci\u00f3n B','Los par\u00e1metros se aplican a la situaci\u00f3n heredada. Capital, deuda y poblaci\u00f3n no se reinician. No se modela una transici\u00f3n constitucional o de propiedad completa.',['households','investment','budget']);
  else if(configuredChange) add('economy','Cambio de configuraci\u00f3n','Las reglas nuevas se aplican desde este paso. El estado y la historia anteriores se conservan.',['households','investment','budget']);
  if(s.month%3===0) add('economy','Balance del periodo',`Actividad real anualizada: ${f(s.gdpReal)} mil M\u20ac. Cambio mensual: ${f((s.gdpReal/old.gdpReal-1)*100)} %. Inflaci\u00f3n interanual simulada: ${f(s.inflation*100)} %.`,['output','prices']);
  if(s.month%12===0) add('economy','Cierre de cuentas del modelo',`Deuda: ${f(s.debt)} mil M\u20ac. Saldo fiscal anualizado: ${f(-s.deficit)} mil M\u20ac. Estas cifras son resultados del modelo, no presupuestos oficiales.`,['budget']);
  const elapsed=s.month-(b.institutionOriginMonth??(b.id==='B'?forkMonth:0));
  if(elapsed>0 && elapsed%b.policy.termMonths===0) {
    const text=b.policy.elections==='competitive'?'Se celebra el procedimiento electoral competitivo previsto en este escenario. No se calculan ganadores, partidos ni probabilidades electorales.':b.policy.elections==='single-party'?'Se celebra el procedimiento de selecci\u00f3n de candidaturas dentro del partido \u00fanico previsto en el escenario. No se simula competencia multipartidista.':'Se celebra la renovaci\u00f3n por designaci\u00f3n prevista en el escenario.';
    add('institution','Renovaci\u00f3n institucional programada',text+' Calendario experimental contado desde el inicio de la rama; no es el calendario electoral real.',['institutions']);
  }
  if(s.constraints.length && s.month%3===0) add('warning','L\u00edmite del modelo alcanzado',s.constraints.join(' '),['output','employment','prices']);
  return events;
}
function stepBranch(base:Base,b:Branch,ext:External,forkMonth:number):Branch {
  const state=stepState(base,b.state,b.policy,ext);
  return {...b,state,history:[...b.history,point(state)],events:[...b.events,...eventsFor(b,b.state,state,ext,forkMonth)]};
}
export function createExperiment(base:Base,seed:number,policy?:Policy):Experiment {
  if(!Number.isInteger(seed) || seed<0 || seed>4294967295) throw new Error('La semilla debe ser un entero sin signo de 32 bits.');
  const state=initialState(base);
  const aPolicy=baselinePolicy(base),bPolicy=validatePolicy(policy||aPolicy);
  const a:Branch={id:'A',policy:aPolicy,initialPolicy:aPolicy,policyChanges:[],institutionOriginMonth:0,state,history:[point(state)],events:[]};
  const b:Branch={id:'B',policy:bPolicy,initialPolicy:bPolicy,policyChanges:[],institutionOriginMonth:0,state:structuredClone(state),history:[point(state)],events:[]};
  return {base,seed,forkMonth:0,a,b,comparisonActive:false,primaryId:'B',comparisonOriginId:'B'};
}
export function advance(exp:Experiment,months:number):Experiment {
  if(!Number.isInteger(months) || months<1 || months>MAX_MONTHS) throw new Error('N\u00famero de meses no v\u00e1lido.');
  const count=Math.min(months,MAX_MONTHS-exp.a.state.month);
  let next=exp;
  for(let i=0;i<count;i++) {
    const ext=externalAt(next.seed,next.a.state.month+1);
    next={...next,a:stepBranch(next.base,next.a,ext,0),b:stepBranch(next.base,next.b,ext,next.forkMonth)};
  }
  return next;
}
function branchCopy(source:Branch,id:'A'|'B'):Branch {
  return {...source,id,events:source.events.map(e=>({...e,branch:id,id:`${id}-inherited-${e.id}`}))};
}
function withPolicyAt(branch:Branch,policy:Policy,month:number):Branch {
  const p=validatePolicy(policy),changes=[...(branch.policyChanges||[])].filter(c=>c.month!==month);
  if(month===0)return {...branch,policy:p,initialPolicy:p,policyChanges:changes};
  changes.push({month,policy:p});changes.sort((a,b)=>a.month-b.month);return {...branch,policy:p,policyChanges:changes};
}
export function createPrimaryExperiment(base:Base,seed:number,policy?:Policy):Experiment {
  const exp=createExperiment(base,seed,policy),p=validatePolicy(policy||exp.b.policy);
  return {...exp,a:withPolicyAt(exp.a,p,0),b:withPolicyAt(exp.b,p,0),comparisonActive:false,primaryId:'B',comparisonOriginId:'B',branchNames:{A:'Tu simulaci\u00f3n',B:'Tu simulaci\u00f3n'}};
}
export function configureBranch(exp:Experiment,id:'A'|'B',policy:Policy):Experiment {
  if(!exp.comparisonActive){const p=validatePolicy(policy);return {...exp,a:withPolicyAt(exp.a,p,exp.a.state.month),b:withPolicyAt(exp.b,p,exp.b.state.month)};}
  return {...exp,[id==='A'?'a':'b']:withPolicyAt(id==='A'?exp.a:exp.b,policy,(id==='A'?exp.a:exp.b).state.month)};
}
export function compareFrom(exp:Experiment,sourceId:'A'|'B',policy:Policy):Experiment {
  const source=sourceId==='A'?exp.a:exp.b,targetId=sourceId==='A'?'B':'A',target=withPolicyAt(branchCopy(source,targetId),policy,source.state.month);
  const names={...(exp.branchNames||{A:'Simulaci\u00f3n original',B:'Simulaci\u00f3n original'}),[sourceId]:(exp.branchNames?.[sourceId]||'Simulaci\u00f3n original'),[targetId]:'Alternativa'};
  return {...exp,[targetId==='A'?'a':'b']:target,forkMonth:source.state.month,comparisonActive:true,primaryId:sourceId,comparisonOriginId:sourceId,branchNames:names};
}
export function fork(exp:Experiment,policy:Policy):Experiment {
  const next=compareFrom({...exp,comparisonActive:true,primaryId:'A',comparisonOriginId:'A'},'A',policy);
  return {...next,b:{...next.b,institutionOriginMonth:exp.a.state.month}};
}
