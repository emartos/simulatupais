# Baseline de España — catálogo 0.1.0

Catálogo: `es-reviewed-2026-09-30.1`, país España, revisado 2026-09-30. Año de catálogo/base 2025 para las series anuales. `selectBase` selecciona la cobertura admisible más reciente, no un año constante codificado. Todos los registros se localizan en `public/data/spain.json`. `source-estimate` y `observed` son literalmente las etiquetas del catálogo; no se hizo comprobación externa de las fuentes.

| ID | Valor | Unidad | Periodo / baseYear | Publicación | Fuente declarada | Clase catálogo | Transformación posterior / uso |
|---|---:|---|---|---|---|---|---|
| gdp | 1690,012 | mil millones EUR | 2025 / 2025 | 2026-09-18 | INE, Contabilidad Nacional Anual, serie 2023–2025 | source-estimate | entra como PIB real y nominal inicial; denominador para ratios |
| consumption | 932,945 | mil millones EUR | 2025 / 2025 | 2026-09-18 | misma CN anual | source-estimate | entra como C inicial y determina `consumptionScale` |
| services | 324,514 | mil millones EUR | 2025 / 2025 | 2026-09-18 | misma CN anual | source-estimate | entra como servicios iniciales; ratio a PIB fija servicio baseline |
| investment | 367,451 | mil millones EUR | 2025 / 2025 | 2026-09-18 | misma CN anual | source-estimate | entra como inversión total inicial/base privada tras restar 3 % PIB |
| exports | 616,488 | mil millones EUR | 2025 / 2025 | 2026-09-18 | misma CN anual | source-estimate | entra como nivel exportador base |
| imports | 551,386 | mil millones EUR | 2025 / 2025 | 2026-09-18 | misma CN anual | source-estimate | entra como nivel importador y base NX |
| population | 49.570.725 | personas | 2026-01-01 / 2025 | 2026-02-12 | INE, Estadística Continua de Población, 1 enero 2026 | source-estimate | población inicial/denominador hogares; período 2026-01 pese año base 2025 |
| populationPrevious | 49.128.297 | personas | 2025-01-01 / 2025 | 2026-02-12 | misma ECP | source-estimate | determina crecimiento poblacional anual aplicado cada mes |
| unemployment | 0,105 | fracción | 2025 / 2025 | 2026-03-25 | INE, EPA, variables de submuestra 2025 | source-estimate | paro inicial; regla posterior endógena simplificada |
| inflation | 0,029 | fracción | 2025-12 / 2025 | 2026-01-15 | INE, IPC diciembre 2025 | observed | subyacente y medida inicial; sintetiza memoria inicial de precios |
| debt | 1698 | mil millones EUR | 2025 / 2025 | 2026-03-31 | Banco de España, deuda AAPP T4 2025 | source-estimate | stock inicial de deuda bruta; no incluye activo público inicial |
| births | 321.164 | personas | 2025 / 2025 | 2026-02-18 | INE, estimaciones nacimientos y defunciones 2025 | source-estimate | tasa nacimientos/población repetida cada mes |
| deaths | 446.982 | personas | 2025 / 2025 | 2026-02-18 | misma fuente | source-estimate | tasa defunciones/población repetida cada mes |
| employed | 22.221.100 | personas | 2025 / 2025 | 2026-03-25 | INE, EPA, variables de submuestra 2025 | source-estimate | requerido para seleccionar; no entra al motor, interfaz estima participación inicial |

### Observación, derivación y construcción sintética

- Solo `inflation` tiene clase `observed` en el conjunto seleccionado. Los otros trece registros seleccionados están etiquetados `source-estimate`; no deben renombrarse como observación comprobada.
- No se selecciona un stock de capital observado. `capital(0)=GDP×3,2` es construcción sintética.
- No se selecciona inversión pública separada, impuestos, transferencias, ingresos/gastos fiscales, tipos de interés pagados, ahorro, empleo futuro, salarios o activos públicos.
- `consumptionScale` concilia hogares sintéticos con consumo catalogado. La política baseline de servicios deriva exactamente `services/GDP×100` (actualmente 19,201875489641495 %).
- El precio inicial usa índices 1 y una memoria artificial de 13 niveles interpolada desde inflación anual.
- Productividad, inversión pública baseline (3 %), grupos, impuestos sintéticos y deuda pública inicial de cuentas son supuestos/construcciones, no observaciones derivadas del catálogo.

### Desajustes temporales

La etiqueta de año base de producto es 2025, pero población actual refiere a 2026-01-01 y población previa a 2025-01-01; la inflación corresponde a diciembre 2025; deuda al cuarto trimestre 2025. Nacimientos/defunciones refieren a 2025. El programa permite esta composición porque selecciona por `baseYear` y conciliación de producto; no alinea periodos subanuales ni transforma la población a cierre 2025. Registrar y contrastar esta elección en fase externa; no corregir en el inventario.
