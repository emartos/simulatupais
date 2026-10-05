# Ecuaciones activas — modelo 0.3.0

Las fórmulas describen `src/core/engine.ts` y `src/core/model.ts`. El documento equivalente de 0.2.0 se conserva en `model-0.2.0/model-equations.md`. Todas las magnitudes de flujo son reales anualizadas salvo indicación; los pasos son mensuales. Las heurísticas no son estimaciones españolas.

## EQ-001–007 — identidades conservadas

| ID | Regla |
|---|---|
| EQ-001 | `disposable = gross − tax + transfers` por grupo. |
| EQ-002 | `gdpReal = consumption + services + investment + netExports`; sin residuo de inventario. |
| EQ-003 | `population(t)=population(t−1)+births−deaths+residual`. |
| EQ-004 | `deficit = spending − revenue`. |
| EQ-005 | `debt−publicAssets = netDebtPrevious + deficit/12`. |
| EQ-006 | `debtRatio = debt / gdpNominal × 100`. |
| EQ-007 | Identidad de catálogo comprobada al seleccionar la base. |

## EQ-008–013 — hogares, consumo y precios

- **EQ-008:** ingreso bruto sintético por grupo, basado en PIB nominal previo y cuotas de ingreso.
- **EQ-009:** impuesto directo con `taxShift` y diferencial de progresividad, tipo efectivo limitado a [0; 0,65].
- **EQ-010:** transferencias = PIB nominal previo × participación sintética × multiplicador configurado.
- **EQ-011:** consumo deseado agrega renta disponible y propensiones/escala de hogar.
- **EQ-012:** poder adquisitivo = renta disponible por persona / precio consumidor.
- **EQ-013:** el impuesto al consumo modifica el nivel de precios según pass-through, una sola vez por cambio.

## EQ-014–019 — inversión, servicios, demanda y producción

- **EQ-014:** inversión privada deseada responde a escala de capacidad, rentabilidad retenida y fricción. La inversión pública se suma separadamente.
- **EQ-015:** `publicInvestmentDesired = gdpReal(t−1) × policy/100`; `servicesDesired = gdpReal(t−1) × policy/100`. `services` es gasto corriente y demanda pública. No tiene término directo en productividad, capital o capacidad. Inversión pública entra en inversión total.
- **EQ-016:** `demandDesired = consumptionDesired + servicesDesired + investmentDesired + exports − importsDesired`. Importaciones deseadas escalan con demanda doméstica; ambos flujos comerciales realizados comparten el factor de realización.
- **EQ-017:** balance mensual de población del catálogo con tasas constantes.

### EQ-018 — crecimiento de capacidad 0.3.0

El stock de capital conserva su identidad mensual:

```text
K(t) = K(t−1) × (1 − depreciation/12) + investmentRealized(t−1)/12
capitalGrowth(t) = ln(K(t) / K(t−1))
capacityGrowth(t) = productivityGrowth/12
                    + demographicGrowth × 0.35/12
                    + capitalElasticity × capitalGrowth(t)
                    + supplyShock(t)
capacity(t) = capacity(t−1) × exp(capacityGrowth(t))
```

Al comienzo del paso, la inversión realizada en el paso previo actualiza K; el crecimiento neto resultante alimenta la capacidad de ese paso. La depreciación se resta una vez al calcular K. No se añade inversión bruta otra vez a crecimiento de capacidad. `capitalElasticity=0.27` es heurística, no estimación para España (PAR-022). Productividad tendencial activa 0,003/año (PAR-021); depreciación 0,04/año (PAR-023); conversión mensual 12 (PAR-037).

### EQ-019 — ajuste, demanda máxima y racionamiento

```text
target = min(demandDesired, capacity × (1 + capacityHeadroom))
candidateGDP = gdpReal(t−1) + outputAdjustment × (target − gdpReal(t−1))
gdpReal(t) = min(demandDesired, max(0, candidateGDP))
realization = clamp(gdpReal(t) / demandDesired, 0, 1)
componentRealized = componentDesired × realization
```

No existe inventario: si PIB heredado y ajuste parcial superan demanda corriente, el PIB realizado se recorta a demanda. Así se conserva EQ-002 sin factor mayor que 1 ni residuo oculto. Cuando capacidad vincula, el factor común raciona proporcionalmente consumo, servicios, inversión y exportación neta; no asigna prioridades sectoriales. `capacityHeadroom=0.05` (PAR-025) es margen de utilización transitoria del modelo, no estimación española de capacidad ociosa. Ajuste parcial 0,32/paso (PAR-026); se conservan ambos valores.

## EQ-020–022 — precios y empleo

La brecha de demanda/capacidad continúa alimentando el mecanismo simplificado de precios (EQ-020/021). El empleo continúa con la regla reducida de sensibilidad al crecimiento (EQ-022). No se cambiaron sus mecanismos en 0.3.0.

## EQ-023–026 — cuentas y capital

- **EQ-023:** ingresos públicos sintéticos de hogares, consumo, sociedades, cotizaciones y otros ingresos.
- **EQ-024:** `spending = (servicesRealized + publicInvestmentRealized) × producerPrice + transfers + interest`. Services paga provisión corriente; inversión pública tiene contrapartida de inversión/capital además de gasto fiscal.
- **EQ-025:** deuda neta acumula déficit anualizado dividido por 12; superávit reduce deuda y luego acumula activos.
- **EQ-026:** identidad de K y crecimiento neto se definen en EQ-018. La inversión realizada pasa al stock al periodo siguiente y su crecimiento neto contribuye a capacidad en ese paso.

### Trazas

`capacity` registra capital previo, inversión realizada anterior, capital actual, crecimiento neto de K usado, contribución de capital, productividad, demografía, shock y capacidad. `capital` registra K anterior/actual, inversión realizada anterior, depreciación y crecimiento neto. `services` registra porcentaje, recursos deseados/realizados, realización y diferencia frente a la referencia corriente. Ninguna de estas cantidades es calidad o bienestar.
