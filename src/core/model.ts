// Every behavioral coefficient below is an explicit hypothesis, not an empirical estimate.
export const MODEL_VERSION = '0.1.0';
export const MAX_MONTHS = 240;
export const M = Object.freeze({
  grossIncomeShare: 0.66, transferGDPShare: 0.17,
  populationShares: [0.4, 0.4, 0.2] as readonly number[],
  incomeShares: [0.18, 0.4, 0.42] as readonly number[],
  transferShares: [0.55, 0.35, 0.1] as readonly number[],
  effectiveIncomeTaxes: [0.08, 0.18, 0.28] as readonly number[],
  consumptionPropensity: [0.94, 0.83, 0.62] as readonly number[],
  baselineConsumptionTax: 0.11, baselineCorporateTax: 0.2,
  baselinePublicInvestment: 0.03, corporateProfitShare: 0.25,
  socialContributionShare: 0.1, otherRevenueShare: 0.045,
  productivityGrowth: 0.009, capitalOutputRatio: 3.2, depreciation: 0.04,
  capitalElasticity: 0.27, investmentReturnElasticity: 1.25, frictionElasticity: 3,
  outputAdjustment: 0.32, capacityHeadroom: 0.05, inflationAnchor: 0.02,
  inflationPersistence: 0.85, gapPriceResponse: 0.20,
  energyPriceExposure: 0.16, externalDemandExposure: 0.35,
  okunCoefficient: 0.22, debtInterest: 0.025,
  externalDemandGrowth: 0.02, eventMonthlyChance: 0.10,
  minInflation: -0.04, maxInflation: 0.30, minUnemployment: 0.015, maxUnemployment: 0.45,
});
export const ASSUMPTIONS = [
  ['Productividad', '0,9 % anual', 'Tendencia ex\u00f3gena hipot\u00e9tica; no extrapola el crecimiento observado del PIB.'],
  ['Capital / producto', '3,2 a\u00f1os', 'Existencia inicial sint\u00e9tica de capital; depreciaci\u00f3n del 4 % anual.'],
  ['Elasticidad del capital', '0,27', 'Respuesta de la capacidad productiva a la inversi\u00f3n neta.'],
  ['Respuesta a rentabilidad', '1,25', 'Elasticidad de inversi\u00f3n privada a la proporci\u00f3n de beneficios retenidos.'],
  ['Fricci\u00f3n de inversi\u00f3n', '3,00', 'Semielasticidad respecto al coste adicional de invertir. No depende de la etiqueta pol\u00edtica.'],
  ['Ajuste de producci\u00f3n', '32 % mensual', 'Ajuste parcial de la actividad a la demanda, sujeto a capacidad.'],
  ['Precios', 'Ancla 2 %; respuesta 0,20', 'Relaci\u00f3n hipot\u00e9tica entre tensi\u00f3n de capacidad e inflaci\u00f3n.'],
  ['Empleo', 'Coeficiente 0,22', 'Respuesta hipot\u00e9tica del paro al crecimiento por encima de productividad y poblaci\u00f3n.'],
  ['Hogares', '40 / 40 / 20 %', 'Tres grupos sint\u00e9ticos. Repartos de renta, transferencias y tipos efectivos no son microdatos de Espa\u00f1a.'],
  ['Coste de la deuda', '2,5 % anual', 'Tipo hipot\u00e9tico com\u00fan. No reproduce el calendario de vencimientos ni el tipo actual del BCE.'],
  ['Instituciones', 'Reglas de escenario', 'Generan eventos de procedimiento; no tienen efectos econ\u00f3micos cuantificados en este MVP.'],
  ['Incertidumbre', 'Una trayectoria por semilla', 'No son intervalos de confianza. Cambiar la semilla no sustituye la incertidumbre estructural.'],
] as const;
