import type { Policy } from '../core/types.js';

/** Experimental description of policy changes relative to an experiment's baseline. */
export interface EconomicAxisDimension {
  key: 'taxShift'|'progressivity'|'transfers'|'publicInvestment'|'services';
  label: string;
  increaseMeans: string;
  directionOnIncrease: 'left'|'right';
  deltaScale: number;
  unit: string;
  weight: number;
  rationale: string;
}

export interface EconomicAxisMethod {
  version: string;
  variables: ReadonlyArray<EconomicAxisDimension>;
  nearCenterThreshold: number;
  convention: string;
}

/**
 * Fixed references are independent from editable slider bounds. Delta scales are explicit
 * experimental conventions: legacy normalization spans for the first four dimensions and
 * a fixed 10 pp span for public services. Equal weights are transparent, not estimated.
 */
export const ECONOMIC_AXIS_METHOD: EconomicAxisMethod = {
  version: '2.0.0',
  variables: [
    { key: 'taxShift', label: 'Impuestos sobre ingresos', increaseMeans: 'Suben los tipos de los grupos de hogares', directionOnIncrease: 'left', deltaScale: 14, unit: 'pp', weight: 0.2, rationale: 'Más fiscalidad directa en los grupos representados.' },
    { key: 'progressivity', label: 'Diferencias entre grupos', increaseMeans: 'Aumenta la diferencia: baja el tipo del grupo de menores ingresos y sube el del grupo de mayores ingresos', directionOnIncrease: 'left', deltaScale: 10, unit: 'pp', weight: 0.2, rationale: 'Aumenta la redistribución representada entre grupos.' },
    { key: 'transfers', label: 'Ayudas a hogares', increaseMeans: 'Aumenta el importe total de las transferencias', directionOnIncrease: 'left', deltaScale: 60, unit: 'puntos porcentuales de variación', weight: 0.2, rationale: 'Aumentan las transferencias públicas a hogares.' },
    { key: 'publicInvestment', label: 'Inversión pública', increaseMeans: 'Se destina una mayor parte del PIB a inversión pública', directionOnIncrease: 'left', deltaScale: 5, unit: 'puntos del PIB', weight: 0.2, rationale: 'Aumenta la inversión realizada directamente por el sector público.' },
    { key: 'services', label: 'Recursos para servicios públicos', increaseMeans: 'Se destina una mayor parte del PIB al funcionamiento de servicios públicos', directionOnIncrease: 'left', deltaScale: 10, unit: 'puntos del PIB', weight: 0.2, rationale: 'Aumentan los recursos públicos para servicios.' },
  ],
  nearCenterThreshold: 0.05,
  convention: 'Las escalas de cambio y los pesos iguales son convenciones descriptivas del simulador, no estimaciones científicas.',
};

export interface EconomicAxisChange {
  key: EconomicAxisDimension['key'];
  delta: number;
  normalizedDelta: number;
  weightedContribution: number;
}

export interface EconomicAxisResult {
  coordinate: number;
  position: number;
  intensityPercent: number;
  direction: 'left'|'right'|'center';
  hasIncludedChanges: boolean;
  changes: EconomicAxisChange[];
}

export function calculateChangeOrientation(
  reference: Policy,
  applied: Policy,
  method: EconomicAxisMethod = ECONOMIC_AXIS_METHOD,
): EconomicAxisResult {
  const changes = method.variables.flatMap(dimension => {
    const delta = applied[dimension.key] - reference[dimension.key];
    if (delta === 0) return [];
    const normalizedDelta = delta / dimension.deltaScale;
    const rightSign = dimension.directionOnIncrease === 'left' ? -1 : 1;
    return [{ key: dimension.key, delta, normalizedDelta, weightedContribution: normalizedDelta * rightSign * dimension.weight }];
  });
  const coordinate = Math.max(-1, Math.min(1, changes.reduce((total, change) => total + change.weightedContribution, 0)));
  const direction = Math.abs(coordinate) < method.nearCenterThreshold ? 'center' : coordinate < 0 ? 'left' : 'right';
  return {
    coordinate,
    position: (coordinate + 1) / 2,
    intensityPercent: Math.round(Math.abs(coordinate) * 100),
    direction,
    hasIncludedChanges: changes.length > 0,
    changes,
  };
}
