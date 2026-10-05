# Registro de parámetros — modelo 0.1.0

Fuente de los valores: `src/core/model.ts`, `src/core/policy.ts`, `src/core/engine.ts`, `src/core/random.ts`. Los ID se mantienen estables dentro de esta revisión documental. `Fuente: código` identifica dónde está declarado, no una fuente económica. Confianza describe evidencia económica disponible, no certeza de que el valor sea correcto.

Categorías de origen válidas: `OBSERVADO`, `DERIVADO`, `CALIBRADO`, `LITERATURA`, `SUPUESTO`, `DESCONOCIDO`. Ningún coeficiente de comportamiento se etiqueta `CALIBRADO`: el factor de consumo es `DERIVADO` por conciliación algebraica; eso no es estimación estructural.

## Parámetros económicos y de inicialización

| ID | Nombre | Valor | Unidad | Archivo | Ecuaciones | Efecto económico | Origen | Fuente | Año ref. | Estado | Confianza |
|---|---|---:|---|---|---|---|---|---|---:|---|---|
| PAR-001 | Cuota de renta bruta / PIB | 0,66 | proporción | `core/model.ts` | EQ-008–012 | fija renta sintética agregada | SUPUESTO | código; sin fuente externa declarada | — | asumido | NINGUNA |
| PAR-002 | Cuotas de renta por grupo | [0,18; 0,40; 0,42] | proporciones | `core/model.ts` | EQ-008–012 | reparte renta bruta | SUPUESTO | código; sin microdatos | — | asumido | NINGUNA |
| PAR-003 | Tipos efectivos base | [0,08; 0,18; 0,28] | proporción de renta | `core/model.ts` | EQ-009, EQ-023 | fija impuesto base de hogares | SUPUESTO | código; expresamente no tipos legales | — | asumido | NINGUNA |
| PAR-004 | Conversión puntos/tasa | 100 | puntos por unidad fraccional | `core/engine.ts` | EQ-009, EQ-010, EQ-013–015, EQ-023 | convierte porcentajes introducidos | DERIVADO | definición de porcentaje | — | derivado | FUERTE (dimensional) |
| PAR-005 | Multiplicadores de progresividad | [−0,5; 0; +1] | adimensional | `core/engine.ts` | EQ-009 | distribuye variación de tasa entre grupos | SUPUESTO | literal de código | — | asumido | NINGUNA |
| PAR-006 | Tope inferior/superior de tipo hogar | 0 / 0,65 | fracción | `core/engine.ts` | EQ-009 | recorta tipo efectivo | SUPUESTO | clamp de código | — | asumido | NINGUNA |
| PAR-007 | Transferencias base / PIB | 0,17 | proporción | `core/model.ts` | EQ-010, EQ-024 | fija volumen sintético transferido | SUPUESTO | código; no cuenta fiscal observada | — | asumido | NINGUNA |
| PAR-008 | Cuotas de transferencias por grupo | [0,55; 0,35; 0,10] | proporciones | `core/model.ts` | EQ-010, EQ-024 | distribuye transferencia agregada | SUPUESTO | código; sin registro distributivo | — | asumido | NINGUNA |
| PAR-009 | Propensiones de consumo | [0,94; 0,83; 0,62] | fracción de renta | `core/model.ts` | EQ-011 | determina gasto deseado por grupo | SUPUESTO | código; sin estimación citada | — | asumido | NINGUNA |
| PAR-010 | Escala conjunta de consumo | `C_cat / Σ consumo hogar bruto calculado` | adimensional | `core/engine.ts` | EQ-011 | hace coincidir consumo inicial agregado con catálogo | DERIVADO | `consumptionScale(base)` | 2025 en base actual | derivado algebraicamente, no estructural | PARCIAL |
| PAR-011 | Cuotas de población por grupo | [0,40; 0,40; 0,20] | proporciones | `core/model.ts` | EQ-012 | pondera personas y media de poder adquisitivo | SUPUESTO | código; grupos sintéticos | — | asumido | NINGUNA |
| PAR-012 | Conversión de miles de millones EUR a EUR | 10⁹ | EUR / mil millones EUR | `core/engine.ts` | EQ-012 | convierte renta per cápita | DERIVADO | prefijo métrico | — | derivado | FUERTE (dimensional) |
| PAR-013 | Tasa base de impuesto al consumo | 0,11 | fracción | `core/model.ts` | EQ-013, EQ-023 | referencia del factor precio y baseline | SUPUESTO | código; no equivale a IVA legal general | — | asumido | NINGUNA |
| PAR-014 | Inversión pública base / PIB | 0,03 | fracción | `core/model.ts` | EQ-014, EQ-015 | separa inversión privada base y fija referencia pública | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-015 | Impuesto corporativo base | 0,20 | fracción | `core/model.ts` | EQ-014, EQ-023 | referencia de rentabilidad | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-016 | Elasticidad de inversión a rentabilidad retenida | 1,25 | elasticidad | `core/model.ts` | EQ-014 | potencia del factor de beneficio retenido | SUPUESTO | código; sin estimación/cita | — | asumido | NINGUNA |
| PAR-017 | Coeficiente de fricción de inversión | 3 | semielasticidad según exponent | `core/model.ts` | EQ-014 | reduce inversión privada exponencialmente | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-018 | Conversión porcentaje PIB a fracción | 100 | porcentaje por unidad | `core/engine.ts` | EQ-015, EQ-023 | escala servicios e inversión pública | DERIVADO | definición de porcentaje | — | derivado | FUERTE (dimensional) |
| PAR-019 | Tendencia exógena de exportación | 0,02/año | tasa anual | `core/model.ts` | EQ-016 | hace crecer exportación base geométricamente | SUPUESTO | código; sin fuente declarada | — | asumido | NINGUNA |
| PAR-020 | Crecimiento demográfico ponderado en capacidad | 0,35 | multiplicador | `core/engine.ts` | EQ-018 | agrega parte del crecimiento de población a capacidad potencial | SUPUESTO | literal de código | — | asumido | NINGUNA |
| PAR-021 | Productividad exógena | 0,009/año | tasa anual | `core/model.ts` | EQ-018, EQ-022 | tendencia potencial y referencia de crecimiento laboral | SUPUESTO | código; documentación lo llama hipotético | — | asumido | NINGUNA |
| PAR-022 | Elasticidad de capacidad al término inversión/capital | 0,27 | coeficiente | `core/model.ts` | EQ-018 | escala efecto neto de inversión sobre capacidad | SUPUESTO | código; sin estimación | — | asumido | NINGUNA |
| PAR-023 | Depreciación anual | 0,04/año | tasa anual | `core/model.ts` | EQ-018, EQ-026 | reduce capital y resta inversión neta/capital | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-024 | Razón capital/PIB inicial | 3,2 | años equivalentes | `core/model.ts` | EQ-018, EQ-026 | crea capital inicial sintético | SUPUESTO | código; no stock observado | — | asumido | NINGUNA |
| PAR-025 | Holgura de capacidad | 0,05 | proporción | `core/model.ts` | EQ-019 | permite objetivo hasta 105 % de capacidad | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-026 | Ajuste parcial del producto | 0,32/paso | proporción mensual | `core/model.ts` | EQ-019 | converge 32 % de distancia al objetivo por mes | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-027 | Ancla de inflación | 0,02/año | tasa anual | `core/model.ts` | EQ-020 | componente del objetivo de inflación | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-028 | Respuesta de inflación a brecha | 0,20 | coeficiente | `core/model.ts` | EQ-020 | transforma brecha demanda-capacidad en objetivo | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-029 | Exposición de precios a energía | 0,16 | coeficiente | `core/model.ts` | EQ-020 | transmite shock energético al objetivo | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-030 | Persistencia de inflación subyacente | 0,85 | peso | `core/model.ts` | EQ-020 | peso del valor subyacente previo | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-031 | Suelo inflación subyacente | −0,04 | fracción anual | `core/model.ts` | EQ-020 | clamp inferior | SUPUESTO | dominio exploratorio | — | asumido | NINGUNA |
| PAR-032 | Techo inflación subyacente | 0,30 | fracción anual | `core/model.ts` | EQ-020 | clamp superior | SUPUESTO | dominio exploratorio | — | asumido | NINGUNA |
| PAR-033 | Longitud de memoria de precios | 13 niveles | puntos mensuales | `core/engine.ts` | EQ-021, EQ-030 | deja 12 intervalos para cociente interanual | DERIVADO | implementación | — | derivado por definición temporal | PARCIAL |
| PAR-034 | Sensibilidad de desempleo al crecimiento | 0,22 | coeficiente | `core/model.ts` | EQ-022 | regla reducida tipo Okun | SUPUESTO | código; sin fuente específica | — | asumido | NINGUNA |
| PAR-035 | Suelo desempleo | 0,015 | fracción | `core/model.ts` | EQ-022 | clamp inferior | SUPUESTO | dominio exploratorio | — | asumido | NINGUNA |
| PAR-036 | Techo desempleo | 0,45 | fracción | `core/model.ts` | EQ-022 | clamp superior | SUPUESTO | dominio exploratorio | — | asumido | NINGUNA |
| PAR-037 | Conversión de paso mensual a tasa anual | 12 | meses/año | `core/engine.ts` | EQ-017–019, EQ-022, EQ-025–026 | divide flujos anualizados al acumular; anualiza crecimiento log | DERIVADO | calendario/unidades | — | derivado | FUERTE (dimensional) |
| PAR-038 | Participación de beneficios gravada | 0,25 | fracción PIB nominal | `core/model.ts` | EQ-023 | base sintética impuesto corporativo | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-039 | Ingresos por cotizaciones sociales | 0,10 | fracción PIB nominal | `core/model.ts` | EQ-023 | ingreso público sintético | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-040 | Otros ingresos públicos | 0,045 | fracción PIB nominal | `core/model.ts` | EQ-023 | ingreso público sintético | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-041 | Interés de deuda | 0,025/año | tasa anual fija | `core/model.ts` | EQ-024–025 | genera interés sobre deuda previa | SUPUESTO | código; no sigue BCE/mercado | — | asumido | NINGUNA |

## Rangos válidos de política (restricciones de entrada)

Los rangos afectan qué políticas pueden ejecutarse; no se aplican como saturación a resultados. `max` es inclusivo; el tercer valor es incremento UI/validación cuando procede.

| ID | Nombre | Valor min / max / paso | Unidad | Archivo | Ecuaciones | Efecto económico | Origen | Fuente | Año | Estado | Confianza |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PAR-042 | Dominio `taxShift` | −6 / 8 / 0,5 | pp / pp | `core/policy.ts` | EQ-009 | limita controles aceptados | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-043 | Dominio `progressivity` | −4 / 6 / 0,5 | pp parámetro | `core/policy.ts` | EQ-009 | limita controles aceptados | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-044 | Dominio `consumptionTax` | 5 / 18 / 0,5 | % | `core/policy.ts` | EQ-013, EQ-023 | limita políticas aceptadas | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-045 | Dominio `corporateTax` | 10 / 35 / 0,5 | % | `core/policy.ts` | EQ-014, EQ-023 | limita políticas aceptadas | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-046 | Dominio `transfers` | −25 / 35 / 1 | % cambio | `core/policy.ts` | EQ-010 | limita políticas aceptadas | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-047 | Dominio `publicInvestment` | 1 / 6 / 0,1 | % PIB | `core/policy.ts` | EQ-015 | limita políticas aceptadas | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-048 | Dominio `services` | 15 / 25 / 0,1 | % PIB | `core/policy.ts` | EQ-015 | limita políticas aceptadas | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-049 | Dominio `investmentFriction` | 0 / 8 / 0,25 | % | `core/policy.ts` | EQ-014 | limita políticas aceptadas | SUPUESTO | UI/validación | — | asumido | NINGUNA |
| PAR-050 | Dominio `termMonths` | 24 / 72 / 12 | meses | `core/policy.ts` | eventos, no EQ económica | calendario institucional | SUPUESTO | UI/validación | — | asumido | NINGUNA |

## Generador determinista de shocks y límites técnicos

| ID | Nombre | Valor | Unidad | Archivo | Ecuaciones | Efecto económico | Origen | Fuente | Año | Estado | Confianza |
|---|---|---:|---|---|---|---|---|---|---|---|---|
| PAR-051 | Probabilidad de shock mensual | 0,10 | probabilidad | `core/model.ts` | EQ-016, EQ-018, EQ-020 | frecuencia sintética de shock | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-052 | Umbral de signo aleatorio | 0,5 | probabilidad | `core/random.ts` | EQ-028 | signo negativo/positivo | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-053 | Base de magnitud shock | 0,5 | proporción de rango | `core/random.ts` | EQ-028 | asegura magnitud entre 0,5 y 1,5 por coeficiente | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-054 | Amplitud shock energía | 0,12 | fracción de factor energético | `core/random.ts` | EQ-020 | perturbación de inflación | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-055 | Amplitud shock demanda exterior | 0,04 | fracción de exportaciones | `core/random.ts` | EQ-016 | multiplica exportación | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-056 | Amplitud shock oferta | 0,004 | tasa log de capacidad | `core/random.ts` | EQ-018 | shock multiplicativo de capacidad | SUPUESTO | código | — | asumido | NINGUNA |
| PAR-057 | Número de tipos de shock | 3 | categorías | `core/random.ts` | EQ-028 | asigna canal a energía/demanda/oferta | SUPUESTO | implementación | — | asumido | PARCIAL |
| PAR-058 | Número de canales aleatorios mensuales | 4 | canales | `core/random.ts` | EQ-028 | hit/tipo/signo/magnitud reproducibles | SUPUESTO | implementación | — | asumido | FUERTE |
| PAR-059 | Tope de meses simulables | 240 | meses | `core/model.ts` | avance | limita horizonte total | SUPUESTO | producto/código | — | asumido | NINGUNA |
| PAR-060 | Semilla de receta habitual | 1847 | entero uint32 | fixtures/playbook | shock | determina secuencia | SUPUESTO | playbook versionado | 2025 base | fijado por receta, no dato económico | FUERTE (reproducibilidad) |
| PAR-061 | Divisor de espacio uint32 | 4.294.967.296 | estados | `core/random.ts` | EQ-028 | convierte hash a U∈[0,1) | DERIVADO | representación uint32 | — | derivado | FUERTE |
| PAR-062 | Factor porcentaje general | 100 | porcentaje/unidad | `core/engine.ts` | EQ-009–015, EQ-023 | conversión numérica | DERIVADO | definición de porcentaje | — | derivado | FUERTE |
| PAR-063 | Suelo de demanda/estado | demanda > 0; P,Y,K,precio > 0 | condición | `core/engine.ts` | EQ-016, EQ-019, validación | rechaza estado fuera de dominio | SUPUESTO | implementación | — | asumido | FUERTE |
| PAR-064 | Hash: multiplicador del mes | `0x9e3779b1` | entero uint32 | `core/random.ts` | EQ-028 | mezcla índice mensual en hash | SUPUESTO | literal de implementación | — | asumido | FUERTE (reproducibilidad) |
| PAR-065 | Hash: multiplicador del canal | `0x85ebca6b` | entero uint32 | `core/random.ts` | EQ-028 | mezcla canal en hash | SUPUESTO | literal de implementación | — | asumido | FUERTE (reproducibilidad) |
| PAR-066 | Hash: ronda de mezcla 1 | `0x7feb352d` | entero uint32 | `core/random.ts` | EQ-028 | mezcla bits pseudoaleatorios | SUPUESTO | literal de implementación | — | asumido | FUERTE (reproducibilidad) |
| PAR-067 | Hash: ronda de mezcla 2 | `0x846ca68b` | entero uint32 | `core/random.ts` | EQ-028 | mezcla bits pseudoaleatorios | SUPUESTO | literal de implementación | — | asumido | FUERTE (reproducibilidad) |
| PAR-068 | Desplazamientos xor del hash | 16, 15, 16 bits | bits | `core/random.ts` | EQ-028 | mezcla el entero; no es coeficiente económico | SUPUESTO | literal de implementación | — | asumido | FUERTE (reproducibilidad) |
| PAR-069 | Política inicial taxShift/progressivity/transfers | 0 / 0 / 0 | pp / pp / % cambio | `core/policy.ts` | EQ-009–011 | referencia de los controles iniciales | SUPUESTO | `baselinePolicy` | — | valor predeterminado de experimento | NINGUNA |
| PAR-070 | Política inicial impuesto consumo/sociedades | 11 / 20 | % | `core/policy.ts` | EQ-013, EQ-014, EQ-023 | referencias de política inicial | SUPUESTO | constantes PAR-013/PAR-015 | — | valor predeterminado de experimento | NINGUNA |
| PAR-071 | Política inicial inversión pública | 3 | % PIB | `core/policy.ts` | EQ-014, EQ-015 | referencia pública inicial | SUPUESTO | PAR-014 | — | valor predeterminado | NINGUNA |
| PAR-072 | Política inicial servicios | `services_cat / gdp_cat × 100` (actual 19,201875489641495) | % PIB | `core/policy.ts` | EQ-015 | enlaza parámetro a ratio de catálogo | DERIVADO | observaciones seleccionadas de servicios y PIB | 2025 en catálogo actual | derivado | PARCIAL |
| PAR-073 | Política inicial fricción | 0 | % adicional | `core/policy.ts` | EQ-014 | coste adicional inicial | SUPUESTO | `baselinePolicy` | — | valor predeterminado | NINGUNA |
| PAR-074 | Umbral de dominio tasas en catálogo | `unemployment < 1`, `inflation > −1` | fracción | `core/data.ts` | selección de base | rechaza supuesta unidad equivocada | SUPUESTO | validación de código | — | asumido | FUERTE |
| PAR-075 | Tolerancia conciliación PIB catálogo | `max(0,01; PIB×0,00001)` | mil millones EUR | `core/data.ts` | EQ-007 | aceptación numérica de identidad | SUPUESTO | validación de código | — | asumido | FUERTE |
| PAR-076 | Tolerancia identidad de producto | `PIB×1e−10` | mil millones EUR | `core/engine.ts` | EQ-002 | aserción de estado | SUPUESTO | validador | — | asumido | FUERTE |
| PAR-077 | Tolerancia cuenta neta pública | `1e−8×max(1,deuda)` | mil millones EUR | `core/engine.ts` | EQ-005 | aserción de estado | SUPUESTO | validador | — | asumido | FUERTE |
| PAR-078 | Tolerancia de hogar | `1e−7` | mil millones EUR | `core/engine.ts` | EQ-001 | aserción de cuenta doméstica | SUPUESTO | validador | — | asumido | FUERTE |
| PAR-079 | Grupo de renta medio: multiplicador progresividad | 0 | adimensional | `core/engine.ts` | EQ-009 | mantiene tipo medio en cambio de progresividad | SUPUESTO | literal de función | — | asumido | NINGUNA |
| PAR-080 | Unidades de sorteo tipo de shock | `floor(U×3)` | categorías | `core/random.ts` | EQ-028 | selecciona una de tres perturbaciones | SUPUESTO | literal de función | — | asumido | FUERTE |
| PAR-081 | Identificadores de canal | 0,1,2,3 | índice entero | `core/random.ts` | EQ-028 | asigna hit/tipo/signo/magnitud | SUPUESTO | literal de función | — | asumido | FUERTE |
| PAR-082 | Coeficiente migratorio residual | `(P0−Pprev−births+deaths)/P0` | fracción anual observada implícitamente | `core/engine.ts` | EQ-017 | completa cambio poblacional neto | DERIVADO | población, nacimientos, defunciones seleccionados | catálogo 2025/2026 | derivado algebraico; no es migración medida | PARCIAL |
| PAR-083 | Respuesta importadora de escala | 1 implícito | elasticidad frente a demanda doméstica deseada | `core/engine.ts` | EQ-016 | importaciones escalan proporcionalmente | SUPUESTO | factor `domestic/domesticBase` | — | asumido | NINGUNA |
| PAR-084 | Exposición a demanda externa declarada | 0,35 | coeficiente | `core/model.ts` | ninguna (inerte) | no afecta los resultados de esta versión | DESCONOCIDO | declaración en código sin uso | — | declarado/no operativo | NINGUNA |
| PAR-085 | Nivel inicial de índices de precio | 1 productor; 1 consumidor | índice relativo | `core/engine.ts` | EQ-013, EQ-020–021, EQ-030 | fija unidad/base inicial de índices | DERIVADO | normalización del índice | — | derivado por normalización | FUERTE |
| PAR-086 | Activos públicos iniciales | 0 | mil millones EUR nominales | `core/engine.ts` | EQ-005, EQ-025, EQ-030 | parte sin activo público en el stock neto inicial | SUPUESTO | literal `publicAssets:0` | — | asumido | NINGUNA |
| PAR-087 | Suelo de deuda y activos | 0 | mil millones EUR nominales | `core/engine.ts` | EQ-025 | deuda bruta y activos públicos no bajan de cero | SUPUESTO | `max(0, ...)` | — | restricción elegida | NINGUNA |
| PAR-088 | Dominio de semilla | entero 0…4.294.967.295 | uint32 | `core/engine.ts` | EQ-028–029 | restringe secuencia reproducible admitida | SUPUESTO | validación de entrada | — | dominio técnico fijado | FUERTE (implementación) |
| PAR-089 | Cadencia de evento de balance | cada 3 meses | meses | `core/engine.ts` | eventos, no EQ económica | emite evento narrativo de balance | SUPUESTO | `month % 3` | — | calendario de presentación | FUERTE (implementación) |
| PAR-090 | Cadencia de cierre anual | cada 12 meses | meses | `core/engine.ts` | eventos, no EQ económica | emite evento de cierre de cuentas | SUPUESTO | `month % 12` | — | calendario de presentación | FUERTE (implementación) |
| PAR-091 | Mandato institucional predeterminado | 48 | meses | `core/policy.ts` | EQ-029/eventos | fija calendario narrativo de renovación base | SUPUESTO | `baselinePolicy` | — | sin efecto económico cuantificado | NINGUNA |
| PAR-092 | Procedimiento institucional predeterminado | `competitive` | categoría | `core/policy.ts` | EQ-029/eventos | determina texto de evento de renovación, no KPI económico | SUPUESTO | `baselinePolicy` | — | sin efecto económico cuantificado | NINGUNA |

`PAR-004`, `PAR-018` y `PAR-062` se superponen como factores 100 aplicados en distintos bloques; se conservan IDs separados para referenciar la ruta exacta. `PAR-052`–`PAR-068` y `PAR-080`–`PAR-081` son parámetros del mecanismo aleatorio/implementación, no elasticidades económicas. Las tolerancias PAR-074–078 no ajustan resultados, solo seleccionan/validan entradas. PAR-084 está declarado, pero inerte. PAR-089–092 solo afectan a eventos narrativos/calendario, no a KPI económicos.

## Inventario de elasticidades y multiplicadores implícitos

| Concepto solicitado | Implementación / parámetro | Interpretación | Estado |
|---|---|---|---|
| Propensión marginal/media al consumo | `consumptionPropensity[i]×consumptionScale`; PAR-009/010 | consumo deseado como fracción de renta disponible | equivalente matemático claro, heterogéneo por grupo y truncado |
| Multiplicador fiscal | no hay multiplicador reducido explícito; EQ-011/016/019 crea retroalimentación | variación total depende de varias rondas, shocks y capacidad | `INTERPRETACION DISCUTIBLE`; no asignar un solo coeficiente |
| Sensibilidad producción/demanda | PAR-026 ajusta 0,32 de brecha al objetivo; PAR-025 limita el objetivo | no es elasticidad constante; puede activarse techo capacidad | `INTERPRETACION DISCUTIBLE` como “elasticidad” |
| Elasticidad inversión/impuesto sociedades | PAR-016 = 1,25 a factor de beneficio retenido normalizado | potencia en relación de after-tax return; no elasticidad directa respecto al tipo impositivo | equivalente local no global; etiqueta exacta es discutible |
| Elasticidad inversión/fricción | PAR-017 = 3 en `exp(-3×friction/100)` | semielasticidad del log inversión respecto a puntos porcentuales de friction | no es elasticidad proporcional ordinaria |
| Sensibilidad producción/capital | PAR-022 = 0,27 aplicado a inversión/capital menos depreciación | efecto en tasa log de capacidad, no elasticidad Y/K estimada | `INTERPRETACION DISCUTIBLE` como elasticidad producción/capital |
| Depreciación | PAR-023 = 4 % anual | salida proporcional del stock de capital | equivalente claro |
| Productividad | PAR-021 = 0,9 % anual | tendencia exógena de capacidad y referencia desempleo | equivalente claro, supuesto |
| Respuesta inflación/brecha | PAR-028 = 0,20 | coeficiente brecha → objetivo inflación; luego ponderado por 0,15 | coeficiente claro, no elasticidad |
| Persistencia inflación | PAR-030 = 0,85 | peso mensual de subyacente anterior | equivalente claro |
| Pass-through impuesto consumo | `q=(1+τ)/(1+0.11)` | pass-through mecánico completo del cambio relativo al índice consumidor; productor no cambia directamente por q | claro como regla de índice, no evidencia de pass-through observado |
| Sensibilidad desempleo/crecimiento | PAR-034 = 0,22; dividido por 12 | regla reducida sobre exceso de crecimiento frente a productividad+población | equivalente de sensibilidad, no estimación documentada |
| Coste deuda | PAR-041 = 2,5 % anual sobre deuda anterior | interés anualizado fijo | claro; coste efectivo puede diferir por frecuencia/stock |
| Efecto transferencias | PAR-007 y policy transfers | ingreso disponible sube mecánicamente por valor transferido; consumo responde por propensión y cierre | directo claro; efecto macro total discutible |
| Efecto inversión pública | flujo = Y(t−1)×policy share; pasa a demanda/capital/fisco | no hay función específica de calidad/productividad pública | efecto inmediato en demanda y mediado en capital; productividad específica inexistente |
| Tendencia exterior | PAR-019 = 2 % anual compuesto | exportación base crece geométricamente | equivalente claro, supuesto |
| Elasticidad importación/actividad | `M=M0×domestic/domesticBase` | elasticidad unitaria frente a doméstico deseado en esa fórmula | claro localmente; importaciones realizadas luego comparten realization |

## Convenciones de origen y evidencia

En parámetros de comportamiento declarados no se encontraron referencias bibliográficas ni series de estimación. Por tanto, salvo los factores de conversión y la escala algebraica, el origen es `SUPUESTO`, con confianza económica `NINGUNA`. El catálogo aporta observaciones/estimaciones de nivel inicial, no identifica estos parámetros dinámicos.
