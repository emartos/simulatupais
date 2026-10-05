# Parámetros activos — modelo 0.3.0

El inventario histórico 0.2.0 se conserva en `model-0.2.0/model-parameters.md` y `model-0.2.0-parameters.md`. La versión activa ejecutable es `PARAMETER_REGISTRY` en `src/core/model.ts`; las filas PAR descritas aquí identifican las reglas y dominios de los documentos EQ previos que se mantienen. No usar los valores de una tabla histórica si difieren de `src/core/model.ts`.

## Valores relevantes para capacidad y servicios

| PAR | Clave/valor activo | Ecuación | Interpretación 0.3.0 |
|---|---|---|---|
| PAR-020 | ponderación demográfica `0.35` | EQ-018 | contribución heurística de población a capacidad |
| PAR-021 | productividad `0.003/año` | EQ-018, EQ-022 | tendencia supuesta/provisional; no coeficiente estimado estructuralmente |
| PAR-022 | elasticidad capital `0.27` | EQ-018 | aplica al crecimiento neto `ln(Kt/Kt−1)`; HEURÍSTICA, no elasticidad española estimada |
| PAR-023 | depreciación `0.04/año` | EQ-018, EQ-026 | entra una sola vez en la identidad del stock K |
| PAR-025 | holgura `0.05` | EQ-019 | margen de utilización transitoria del modelo; no estimación de capacidad ociosa española |
| PAR-026 | ajuste `0.32/mes` | EQ-019 | ajuste parcial preservado; PIB además se limita a demanda si ajuste heredado la excede |
| PAR-037 | conversión anual/mensual `12` | EQ-017–019, EQ-022, EQ-025–026 | conversión de flujos y pasos mensuales |
| PAR-047 / PAR-048 | dominios inversión pública / servicios | EQ-015 | los rangos de control permanecen; servicios es gasto corriente, inversión pública es flujo de capital |

Los valores efectivos de inversión privada, precios, empleo, hogares y fiscalidad que no forman parte de la reformulación conservan las reglas indicadas en sus ecuaciones. Este trabajo no los recalibra ni los modifica.

## Semántica de controles

- `services`: **Gasto corriente en servicios públicos**. Calcula recursos deseados desde PIB previo, aplica realización y registra gasto corriente/saldo. No mide calidad ni tiene retorno directo en productividad o capacidad.
- `publicInvestment`: inversión pública dentro de inversión total. La inversión realizada acumula en K mediante EQ-026 y puede contribuir a capacidad con retardo mediante EQ-018.
- `capacityHeadroom=0.05` permanece fijo como heurística de utilización transitoria.
- `capitalElasticity=0.27` permanece fijo y heurístico. La modificación de 0.3.0 cambia la variable que pondera (crecimiento neto del stock, no `I/K` bruto), no su valor.

## Trazabilidad

Consulta `docs/model-validation/model-equations.md` para las fórmulas activas y el origen/retardo de cada canal. El parámetro mostrado en una traza de ejecución se toma del motor compilado y del estado de la simulación; las etiquetas no atribuyen efectos no modelados.
