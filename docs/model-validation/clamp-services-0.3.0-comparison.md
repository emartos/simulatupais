# Revisión comparativa de capacidad y gasto corriente — 0.2.0 / 0.3.0

Base: catálogo `es-reviewed-2026-09-30.1`, año 2025, semilla 1847, shocks activos, 120 meses. Los datos 0.2.0 se leen de `clamp-services-diagnostics-0.2.0.json`; los nuevos proceden de `clamp-services-diagnostics-0.3.0.json`. El conteo es de meses que satisfacen demanda > capacidad × 1,05. Mes 120 representa diez años.

## Resultados a diez años

| Escenario | Meses clamp 0.2 | Meses clamp 0.3 | D/C mes 120 (0.2 → 0.3) | PIB 120 (0.2 → 0.3) | Capacidad 120 (0.2 → 0.3) | Inversión 120 (0.2 → 0.3) | Capital 120 (0.2 → 0.3) | Deuda/PIB 120 (0.2 → 0.3) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| S00 | 6 | 6 | 1,052 → 1,052 | 2.003,65 → 2.003,48 | 1.912,57 → 1.912,40 | 416,50 → 416,45 | 6.866,24 → 6.861,03 | 92,42 → 92,39 |
| S13 | 119 | 119 | 1,100 → 1,100 | 2.014,80 → 2.014,80 | 1.922,91 → 1.922,92 | 429,27 → 429,27 | 7.005,91 → 7.001,89 | 149,81 → 149,81 |
| S01 | 60 | 58 | 1,066 → 1,066 | 2.003,67 → 2.003,55 | 1.912,16 → 1.912,06 | 411,01 → 410,98 | 6.860,39 → 6.856,48 | 113,04 → 113,02 |
| S05 | 104 | 104 | 1,078 → 1,078 | 2.001,65 → 2.001,58 | 1.910,19 → 1.910,13 | 406,02 → 406,00 | 6.833,76 → 6.830,93 | 124,35 → 124,35 |
| S10 | 106 | 106 | 1,079 → 1,079 | 2.001,46 → 2.001,40 | 1.910,01 → 1.909,95 | 405,66 → 405,65 | 6.831,38 → 6.828,60 | 122,85 → 122,84 |
| S01-L | 79 | 78 | 1,071 → 1,071 | 2.002,94 → 2.002,85 | 1.911,45 → 1.911,36 | 408,81 → 408,78 | 6.850,67 → 6.847,24 | 120,66 → 120,65 |

Valores monetarios: miles de millones de euros reales anualizados; deuda/PIB en %. D/C es demanda deseada dividida por capacidad sin holgura. Las pequeñas diferencias entre versiones no indican ausencia de cambio del mecanismo: con estas trayectorias la inversión/capital y el crecimiento neto de K son próximos. En 0.3.0 el término es directamente `ln(Kt/Kt−1)` y la depreciación solo se contabiliza dentro de K (EQ-018, PAR-022/023).

## Entrada, salida y trayectoria mensual

| Escenario | Primer mes | Último mes | Meses clamp | Episodio consecutivo máximo | D/C máximo | ¿Recupera antes de mes 120? |
|---|---:|---:|---:|---:|---:|---|
| S13 | 2 | 120 | 119 | 119 | 1,109 | No |
| S01 | 60 | 120 | 58 | 58 | 1,075 | No |
| S05 | 15 | 120 | 104 | 104 | 1,087 | No |
| S10 | 13 | 120 | 106 | 106 | 1,088 | No |
| S01-L | 16 | 120 | 78 | 78 | 1,080 | No |

En 0.2.0, S01/S05/S10/S01-L tuvieron episodios máximos de 43 meses (además de episodios menores); en 0.3.0 son respectivamente 41/43/43/43 meses. S13 sigue en un único episodio de 119 meses.

La tabla mensual completa, incluidos demanda, límite, objetivo, PIB/realización, inversión, capital, crecimiento de capacidad, precios, cuentas fiscales, consumo y servicios realizados, está en el JSON 0.3.0. En S13 la demanda supera capacidad sin holgura en el mes 120 en aproximadamente 10,0 % (D/C=1,100), y el límite de utilización en aproximadamente 4,8 %; el clamp persistente viene de crecimiento de demanda que mantiene esa brecha, no de una caída de la contribución de capital al crecer K. Capacidad crece de forma positiva y finita. No se cambió la holgura del 5 %.

## Cadena y cierre de producción

La secuencia vigente es: inversión realizada del periodo anterior + stock anterior y depreciación → `K(t)` → `ln(K(t)/K(t−1))` → contribución `0,27 × crecimiento neto` → capacidad de t (EQ-018, PAR-022/023). La inversión realizada del periodo actual actualiza el stock en t+1. No se vuelve a sumar inversión bruta a capacidad. Así, más crecimiento neto de K no puede reducir su contribución por el denominador I/K.

Cuando demanda > capacidad × 1,05, el objetivo de producción se fija en ese límite. El ajuste parcial queda acotado además por demanda deseada; `realization=clamp(PIB/demanda,0,1)` escala proporcionalmente componentes flexibles, incluida inversión. Esto puede moderar la inversión futura, pero los contrafactuales de inversión sin racionamiento y capital deseado tienen efecto pequeño en comparación con duplicar su acumulación o ampliar holgura. No se observa un nuevo bucle explosivo. Es un cierre agregado deliberado y simple, no una asignación sectorial (EQ-019, PAR-025/026).

## Contrafactuales diagnósticos no persistentes

Aplicados uno a uno a S13 y S10, únicamente sobre copias del código compilado en el directorio temporal. No son propuestas de parámetros. `at5/at10` completos están en el JSON diagnóstico.

| Caso | S13 clamp meses | S10 clamp meses | Lectura a 10 años |
|---|---:|---:|---|
| Base | 119 | 106 | Referencia 0.3.0. |
| C1: holgura 10 % | 104 | 16 | Relaja la condición de entrada al clamp, no resuelve la brecha de demanda/capacidad como cambio estructural. |
| C2: holgura 20 % | 0 | 0 | Elimina el detector de clamp por definición del umbral; confirma sensibilidad a la regla de cierre, no justifica escoger 20 %. |
| C3: capital con inversión deseada | 119 | 105 | Cambios pequeños; inversión no realizada no explica por sí sola la persistencia. |
| C4: inversión no racionada | 119 | 105 | Cambios pequeños; el factor de realización de inversión no es causa dominante aislada. Este contrafactual rompe el reparto contable y no es una opción de modelo. |
| C5: duplicar acumulación efectiva de K | 116 | 1 | Aumenta capacidad y producción sin divergencia no finita en 120 meses; fuerte sensibilidad del canal de capital, coherente con crecimiento neto de K. |

## S10 — gasto corriente en servicios públicos

El control solo aumenta los recursos corrientes deseados según `PIB previo × porcentaje`; incrementa demanda pública y gasto fiscal. No añade productividad, stock de capital, capacidad, renta privada, empleo ni calidad de servicio directamente. La inversión pública sigue separada: entra en inversión total, K y capacidad con el retardo temporal de la identidad (EQ-015/018/024, PAR-048/047).

S10 mantiene 106 meses de restricción y en mes 120 presenta: PIB −2,08; poder adquisitivo −30,72; inflación +0,35 puntos porcentuales; desempleo +0,02 pp; deuda/PIB +30,46 pp; inversión −10,80, todos frente a S00. El mecanismo es: más gasto corriente → demanda deseada por encima del límite de capacidad → realización común ≤1 que limita componentes incluidos inversión → presión de precios por brecha demanda/capacidad → gasto fiscal persistente eleva déficit/deuda e intereses → inversión/capital/producción futuros menores que la referencia. Esos son efectos macro del modelo; no se cuantifica el resultado social o la calidad del servicio. `services` debe presentarse como gasto corriente en servicios públicos, acompañado del nivel de recursos realizados (sin llamarlo calidad o bienestar).

**Clasificación:** la mecánica implementada es consistente con el cierre especificado; la ausencia deliberada de resultados de servicio/productividad convierte comparaciones de `services` en una **simplificación materialmente sesgada** si el control se etiqueta genéricamente como “servicios públicos”. La etiqueta se ha afinado en 0.3.0 sin inventar retornos productivos. Dominancia negativa de seis KPI macro no significa que el servicio social sea peor.

## Sanity checks del canal

- Prueba estructural: crecimiento neto de K mayor produce contribución `0,27 × gK` mayor, manteniendo lo demás constante.
- Trayectoria con acumulación duplicada: K y contribución a capacidad aumentan; no reaparece el patrón I/K.
- En todas las trayectorias principales, todas las magnitudes permanecen finitas; simulación, mismas entradas/semilla producen la misma trayectoria.
- PIB queda en [0, demanda]; realización en [0,1]; componentes realizados se escalan proporcionalmente y las identidades de PIB, deuda, inversión y capital concilian.
- Reproducción P01 0.3.0: PIB y poder adquisitivo coinciden en los meses 12 y 60 dentro de tolerancias fijadas.
- Las sesiones 0.2.0 se rechazan como incompatibles; la evidencia histórica queda archivada bajo `model-0.2.0/`.

## Estrés 0.2.0 frente a 0.3.0

| Detector | 0.2.0 | 0.3.0 |
|---|---:|---:|
| Trayectorias / observaciones | 22 / 2.662 | 22 / 2.662 |
| Alertas totales | 37 | 37 |
| Episodios de clamp | 25 | 25 |
| Meses con restricción agregados | 724 | 713 |
| Extremos | 1 | 1 |
| Asimetrías | 10 | 10 |
| Dominancia negativa | S10, mes 120 | S10, mes 120 |
| Free lunch / aceleración / reversión / no finitos | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |

La cantidad de alertas se mantiene; bajan 11 observaciones mensuales bajo clamp. No aparece una explosión nueva ni cambia la clasificación del caso S10. S13 mantiene los 119 meses restringidos: en ese paquete persiste la demanda por encima de capacidad, aunque el canal de capital ya no sufre la paradoja I/K.
