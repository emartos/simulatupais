# Revisión de clamp y servicios — modelo 0.2.0

## A. Resumen ejecutivo

1. Se reprodujeron S00, S13, S01, S05, S10 y S01-L con catálogo `es-reviewed-2026-09-30.1`, base 2025, semilla 1847 y los mismos shocks deterministas.
2. S13 está restringido del mes 2 al 120 (119 meses); su cociente demanda/capacidad pasa de 1,047 a un máximo de 1,109 y sigue en 1,100 en el mes 120. No diverge explosivamente: sostiene una brecha de demanda de alrededor del 10 %.
3. S01, S05, S10 y S01-L tienen episodios separados y terminan de nuevo en clamp en el mes 120. No son 43 meses totales; 43 es el episodio consecutivo más largo.
4. El canal común de realización sí recorta inversión, pero quitarlo en C4 no elimina el clamp. Permitir inversión deseada al capital en C3 produce poco cambio. No es la causa dominante aislada.
5. El techo del 105 % determina el nivel de racionamiento y sí es sensible: con 120 % no aparece clamp, pero eso cambia el cierre del producto en gran medida y no demuestra que 120 % sea una especificación adecuada.
6. La capacidad acumula cerca de 0,10 % mensual en S13 al final, mientras el paquete deja demanda/capacidad en 1,10. La capacidad crece, pero la regla y la demanda sostenida no cierran esa brecha.
7. Servicios solo entra como demanda y gasto; no tiene ecuación directa de productividad, capital o capacidad. Bajo restricción comparte el factor de realización de los demás componentes.
8. S10 empeora formalmente los seis KPI al mes 120 frente a S00, pero desempleo (+0,024 pp), PIB (−2,18) y poder adquisitivo (−31,90) cambian poco; el deterioro fiscal (+30,43 pp de deuda/PIB) es mucho mayor.
9. Diagnóstico del clamp: **C — simplificación materialmente sesgada**, no un bug contable aislado. Diagnóstico de S10: **C — simplificación materialmente sesgada**.
10. Decisión única: **`REFORMULATE_0.3.0`**, limitada a capacidad/racionamiento y definición de servicios públicos.

La trayectoria mensual completa y los contrafactuales están en [clamp-services-diagnostics-0.2.0.json](clamp-services-diagnostics-0.2.0.json); el generador aislado es [analyze-clamp-services-0.2.0.mjs](analyze-clamp-services-0.2.0.mjs). Los contrafactuales se hacen en copias temporales del core compilado; no tocan el motor del proyecto.

## B. Clamp

### Mecanismo observado

La secuencia implementada es:

```text
demanda = consumoDeseado + serviciosDeseados + inversiónDeseada + exportaciónNetaDeseada    (EQ-016)
capacidad(t) = capacidad(t−1) × exp(productividad + demografía + capitalEffect + shockOferta)  (EQ-018)
target = min(demanda, capacidad × 1,05)                                                       (EQ-019, PAR-025)
PIB(t) = PIB(t−1) + 0,32 × (target − PIB(t−1))                                                (EQ-019, PAR-026)
realización = PIB(t) / demanda
consumo, servicios, inversión y exportación neta realizados = cada deseado × realización       (EQ-019)
capital(t) = capital(t−1) × (1−depreciación/12) + inversiónRealizada/12                        (EQ-026, PAR-023)
capacidad(t+1) depende de inversiónRealizada(t)/capital(t)                                     (EQ-018, PAR-022)
```

Referencias del inventario de parámetros: productividad exógena `PAR-021`, elasticidad de capacidad a inversión/capital `PAR-022`, depreciación `PAR-023`, holgura `PAR-025`, ajuste parcial `PAR-026`, conversión mensual `PAR-037`. Los valores activos se toman del código 0.2.0 (`productivityGrowth=0,003`, `capitalElasticity=0,27`, `depreciation=0,04`, `capacityHeadroom=0,05`, `outputAdjustment=0,32`); algunas tablas históricas de `model-parameters.md` conservan valores de 0.1.0 y no se usaron para simular.

El ciclo de auto-restricción existe: demanda superior al techo → PIB limitado → realización inferior a 1 → inversión realizada menor que la deseada → menor stock de capital → menor contribución `inversión/capital` a crecimiento futuro de capacidad → capacidad futura más baja que bajo inversión plena. En S13, al mes 120, inversión deseada 450,62 e inversión realizada 429,27: brecha 21,35 mil M€/año (4,74 %); el cociente de realización es 0,9526. La suma de brechas de flujo de inversión durante sus 119 meses clamp equivale a 150,68 mil M€ al dividir flujos anualizados por 12 y sumar pasos mensuales. Esa cifra es exposición acumulada del flujo perdido en el cierre del modelo, no una medición independiente de inversión real.

La realimentación no explica por sí sola los años de clamp. C3 acumula la inversión deseada en capital y mantiene S13 clamp 119 meses; C4 elimina la reducción proporcional de inversión y también conserva el episodio de 119 meses. C4 es deliberadamente diagnóstico: rompe la identidad EQ-002 porque capitaliza inversión que no fue realizada dentro del PIB. No es una alternativa coherente lista para adoptar.

### Cronología y magnitudes

El detector del core marca un mes si `demanda > capacidad × 1,05`; los episodios se separan cuando al menos un mes vuelve a quedar bajo el umbral. “Recupera” distingue una salida temporal del estado de clamp y una recuperación sostenida hasta el final del horizonte. Cocientes y crecimientos son los valores del mes señalado; inversión en mil M€/año, capital/capacidad en mil M€ reales.

| Escenario | Episodios (meses) | Primer mes | Último mes | Meses clamp | Máx. demanda/capacidad | Recupera |
|---|---|---:|---:|---:|---:|---|
| S00 | 100; 116–120 | 100 | 120 | 6 | 1,056 | No sostenidamente; sale en 101–115 y reentra |
| S13 | 2–120 | 2 | 120 | 119 | 1,109 (mes 100) | No |
| S01 | 60–76; 78–120 | 60 | 120 | 60 | 1,075 (mes 100) | Sale 17 meses; reentra; no al final |
| S05 | 15–36; 38–76; 78–120 | 15 | 120 | 104 | 1,087 (mes 100) | Sale en 37 y 77; no al final |
| S10 | 13–36; 38–76; 78–120 | 13 | 120 | 106 | 1,088 (mes 100) | Sale en 37 y 77; no al final |
| S01-L | 16; 42–76; 78–120 | 16 | 120 | 79 | 1,080 (mes 100) | Sale temporalmente; no al final |

La matriz mensual completa en el JSON contiene por mes demanda deseada, capacidad, límite, target, PIB realizado, realización, inversión deseada/realizada, capital, crecimiento de capacidad, deuda/PIB y desempleo. Muestras para comprobar la trayectoria (la holgura del límite es 5 % en todas las filas):

| Caso/mes | D/C | Target/C | PIB/C | Realización | I deseada / realizada | Capital | Capacidad | Crec. capacidad mensual | Clamp |
|---|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| S13 / 1 | 1,047 | 1,047 | 1,014 | 0,969 | 392,8 / 380,5 | 5.421,7 | 1.699,7 | 0,114 % | No |
| S13 / 2 | 1,055 | 1,050 | 1,025 | 0,971 | 394,3 / 383,0 | 5.435,6 | 1.701,7 | 0,119 % | Sí |
| S13 / 60 | 1,086 | 1,050 | 1,048 | 0,965 | 423,4 / 408,5 | 6.233,2 | 1.819,5 | 0,109 % | Sí |
| S13 / 120 | 1,100 | 1,050 | 1,048 | 0,953 | 450,6 / 429,3 | 7.005,9 | 1.922,9 | 0,099 % | Sí |
| S01 / 60 | 1,050 | 1,050 | 1,047 | 0,997 | 393,6 / 392,3 | 6.151,4 | 1.800,0 | 0,105 % | Sí |
| S01 / 120 | 1,066 | 1,050 | 1,048 | 0,983 | 418,1 / 411,0 | 6.860,4 | 1.912,2 | 0,096 % | Sí |
| S05 / 15 | 1,050 | 1,050 | 1,045 | 0,995 | 375,5 / 373,8 | 5.594,1 | 1.718,6 | 0,112 % | Sí |
| S05 / 60 | 1,063 | 1,050 | 1,048 | 0,986 | 393,5 / 388,0 | 6.144,8 | 1.801,2 | 0,104 % | Sí |
| S05 / 120 | 1,078 | 1,050 | 1,048 | 0,972 | 417,7 / 406,0 | 6.833,8 | 1.910,2 | 0,095 % | Sí |
| S10 / 13 | 1,050 | 1,050 | 1,045 | 0,995 | 374,7 / 372,7 | 5.569,0 | 1.714,8 | 0,112 % | Sí |
| S10 / 60 | 1,063 | 1,050 | 1,048 | 0,985 | 393,5 / 387,7 | 6.143,7 | 1.801,0 | 0,103 % | Sí |
| S10 / 120 | 1,079 | 1,050 | 1,048 | 0,971 | 417,6 / 405,7 | 6.831,4 | 1.910,0 | 0,095 % | Sí |
| S01-L / 16 | 1,060 | 1,050 | 1,038 | 0,979 | 375,4 / 367,5 | 5.606,3 | 1.719,5 | 0,112 % | Sí |
| S01-L / 60 | 1,056 | 1,050 | 1,048 | 0,992 | 393,6 / 390,5 | 6.150,9 | 1.800,1 | 0,104 % | Sí |
| S01-L / 120 | 1,071 | 1,050 | 1,048 | 0,978 | 417,9 / 408,8 | 6.850,7 | 1.911,4 | 0,096 % | Sí |

### Descomposición causal

- **A, demanda persistente: principal.** En S13 D/C sube de 1,047 al inicio a 1,109 en mes 100 y solo retrocede a 1,100 en mes 120. La trayectoria no es explosiva; la política mantiene demanda deseada por encima de oferta potencial. En S01/S05/S10/S01-L D/C permanece entre 1,05 y 1,08 durante episodios extensos.
- **B, capacidad relativamente lenta: principal junto con A.** Al final de S13, la capacidad crece 0,099 % mensual; en S10 0,095 %. EQ-018 responde a productividad exógena, demografía y el cociente inversión/capital rezagado. No hay término de servicios públicos en la ecuación de capacidad.
- **C, inversión insuficiente: contribuyente, no origen único.** El factor común reduce inversión en el mes clamp, con una brecha de hasta 21,35 anualizada al final de S13. Al sumar pasos mensuales, el flujo no realizado es 150,68 en S13, 21,15 en S01, 56,31 en S05, 59,21 en S10 y 35,03 en S01-L. Esas pérdidas limitan la retroalimentación de capacidad.
- **D, retardo: contribución secundaria.** EQ-018 usa inversión del paso anterior, y EQ-026 capitaliza el flujo realizado por doce. Pero C3, que adelanta el flujo deseado al capital, no elimina el clamp. El retardo no basta para explicar la duración.
- **E, techo 105 %: fija el racionamiento y altera mucho la severidad, no crea el exceso de demanda.** C1/C2 bajan las alertas al mover el límite; la demanda/capacidad previa sigue siendo el origen. Un margen mayor permite que PIB quede muy por encima de capacidad medida, por lo que “sin alerta” no equivale a una economía sin restricción.
- **F, realización común: existe el bucle descrito, pero no domina aisladamente.** La inversión sí comparte realización. C4 quita ese recorte y sube algo producción/inversión/capacidad, pero deja 119 meses clamp S13 y 105 meses S10. Es un amplificador del bloqueo, no explicación suficiente.

### Contrafactuales aislados

Shocks siguen activados con semilla 1847. C1/C2 sustituyen solo `capacityHeadroom`; C3 cambia solo la inversión añadida a capital; C4 deja de multiplicar inversión realizada por `realization` (rompe EQ-002 deliberadamente); C5 duplica el término inversión en acumulación de capital. No son calibraciones ni alternativas aprobadas. Meses clamp cuenta todos los episodios a 120 meses.

| Escenario/caso | Meses clamp (primero–último; máx. seguido) | PIB 5 / 10 años | Inv. 10 años | Capital 10 años | Capacidad 10 años | Deuda/PIB 10 años | Paro 10 años |
|---|---|---:|---:|---:|---:|---:|---:|
| S13 base | 119 (2–120; 119) | 1.892,8 / 2.014,8 | 429,3 | 7.005,9 | 1.922,9 | 149,81 % | 9,27 % |
| S13 C1, holgura 10 % | 104 (15–120; 43) | 1.987,2 / 2.119,5 | 445,3 | 7.117,3 | 1.931,0 | 147,08 % | 8,16 % |
| S13 C2, holgura 20 % | 0 | 2.033,8 / 2.228,2 | 461,0 | 7.179,7 | 1.935,5 | 142,50 % | 7,06 % |
| S13 C3, capitaliza inversión deseada | 119 (2–120; 119) | 1.892,0 / 2.011,6 | 428,3 | 7.132,1 | 1.919,7 | 149,96 % | 9,31 % |
| S13 C4, inversión sin realización | 119 (2–120; 119) | 1.897,3 / 2.025,1 | 452,9 | 7.143,7 | 1.932,9 | 149,46 % | 9,16 % |
| S13 C5, doble acumulación inversora | 119 (2–120; 119) | 1.871,5 / 1.942,9 | 408,4 | 10.249,1 | 1.852,5 | 153,04 % | 10,07 % |
| S10 base | 106 (13–120; 43) | 1.885,8 / 2.001,5 | 405,7 | 6.831,4 | 1.910,0 | 122,85 % | 9,42 % |
| S10 C1, holgura 10 % | 16 (100–120; 15) | 1.932,4 / 2.101,2 | 418,7 | 6.887,4 | 1.914,1 | 119,27 % | 8,35 % |
| S10 C2, holgura 20 % | 0 | 1.932,4 / 2.114,4 | 420,5 | 6.888,8 | 1.914,2 | 118,58 % | 8,21 % |
| S10 C3, capitaliza inversión deseada | 106 (13–120; 43) | 1.885,6 / 2.000,4 | 405,4 | 6.885,3 | 1.908,9 | 122,89 % | 9,43 % |
| S10 C4, inversión sin realización | 105 (14–120; 43) | 1.887,1 / 2.005,8 | 418,5 | 6.889,1 | 1.914,3 | 122,69 % | 9,37 % |
| S10 C5, doble acumulación inversora | 108 (13–120; 108) | 1.866,2 / 1.934,5 | 387,0 | 9.915,6 | 1.844,3 | 125,37 % | 10,17 % |

C5 es una señal de la interacción, no prueba de que capital adicional reduzca siempre capacidad: al subir K mucho, cae `I/K` en EQ-018 y con ello el crecimiento logarítmico de capacidad. El modelo no tiene una función de producción que haga que un mayor stock K determine directamente un nivel mayor de capacidad. Doblar el flujo de acumulación puede aumentar capital, reducir la razón de inversión/capital y bajar capacidad simulada. Esta respuesta viene de la forma del mecanismo, no del techo por sí solo.

## C. S10 — más servicios

### Cadena que genera el resultado

`services=23` sube desde el baseline derivado del catálogo (~19,20 % del PIB). EQ-015 calcula `servicesDesired=PIB(t−1)×23 %`; EQ-016 suma ese flujo a demanda e importa proporcionalmente al doméstico deseado; EQ-019 limita el PIB a `capacidad×1,05` y aplica el factor común a servicios, consumo e inversión; EQ-024 carga los servicios realizados al gasto; EQ-025 acumula el déficit en deuda. No hay un retorno económico de los servicios a productividad/capital/capacidad.

Al mes 120, los servicios realizados en S10 son 446,72 frente a 382,80 en S00 (+63,92). El consumo realizado cae 28,32 y la inversión 10,83; el PIB queda 2,18 por debajo de S00. La brecha D/C es 1,079 y el factor de realización 0,9713. El mayor gasto anualizado es 1.179,46 frente a 1.046,44 (+133,01); ingresos suben 25,74, por lo que el déficit anualizado es 182,61 frente a 75,34 (+107,27). La deuda pasa de 2.339,30 a 3.203,22 mil M€ y la deuda/PIB de 92,42 % a 122,85 %.

Respuestas explícitas:

- **5.1:** No hay efecto directo positivo de `services` sobre productividad, capital, capacidad, consumo privado o renta. Empleo solo responde indirectamente al crecimiento del PIB vía EQ-022; no hay canal sectorial de contratación de servicios.
- **5.2:** Sí. La variable funciona como componente de demanda/PIB realizado y como gasto fiscal. “Servicios” no es una función de oferta.
- **5.3:** Sí. Cuando `realization < 1`, se multiplican por el mismo factor consumo, servicios, inversión y exportación neta. Esto raciona los demás componentes junto a servicios; no hay prioridad ni elasticidad propia.
- **5.4:** Sí. El gasto mayor amplía déficit y deuda según EQ-024/025; el interés de la deuda previa vuelve a gasto al 2,5 % anual (EQ-024, PAR-041). No hay tasa de interés creciente con riesgo, pero sí realimentación acumulativa de intereses.
- **5.5:**

| KPI | S10 mes 120 frente a S00 | Cadena causal dominante en S10 | EQ/PAR |
|---|---:|---|---|
| Producción | −2,18 mil M€ reales/año (−0,11 %) | Servicios deseados suman demanda, pero la capacidad limita target; EQ-019 comparte el racionamiento y desplaza consumo/inversión realizados. | EQ-015/016/019/018; PAR-025/026/048 |
| Poder adquisitivo | −31,90 €/persona/año (−0,12 %) | Menor consumo privado realizado; precio consumidor más alto (nivel 1,3028 vs baseline 1,2633), mientras la medida de poder adquisitivo no imputa valor de servicios públicos. | EQ-012/013/019/021; PAR-011/012/025/026 |
| Inflación | +0,346 pp | La brecha persistente demanda-capacidad eleva el objetivo de precios; persistencia y memoria conducen IPC. No proviene de que servicios tengan un precio/índice separado. | EQ-020/021; PAR-027/028/030/033 |
| Desempleo | +0,024 pp | PIB crece marginalmente más despacio a 10 años; la regla reducida de Okun traduce diferencia pequeña de crecimiento en un aumento pequeño de paro. | EQ-022; PAR-021/034 |
| Deuda/PIB | +30,43 pp | Servicios elevan gasto en 63,92 real al cierre y el gasto nominal total sube 133,01; la recaudación solo sube 25,74. Déficit acumulado e intereses elevan stock de deuda mucho más que el denominador PIB nominal. | EQ-023/024/025/006; PAR-038–041 |
| Inversión | −10,83 mil M€ reales/año (−2,60 %) | Factor común de realización reduce inversión en la restricción; menor inversión realizada entra en capital y luego en `I/K` para capacidad. | EQ-014/018/019/026; PAR-022/023/025/026 |

La dominancia negativa de seis signos no significa que seis efectos sean grandes: 3/6 son marginales a escala del nivel base; el efecto fiscal es el principal y la inversión secundaria. Aun así, la comparación omite cualquier beneficio de bienestar/productividad de los servicios que se compran con ese gasto. Ese sesgo de composición hace que “más servicios” sea tratado como impulso de demanda, pero jamás como capacidad de provisión.

Renombrar el control a **consumo público corriente** sería más honesto si se desea conservar exactamente el mecanismo actual, pero cambiaría la interpretación del control. Si debe seguir representando servicios públicos heterogéneos, hay que separar al menos consumo público corriente de servicios/inversión pública con efecto productivo definido. No introducir un multiplicador único sin especificación.

## D. Decisión

### `REFORMULATE_0.3.0`

Ambos hallazgos proceden de simplificaciones materiales, no de una identidad contable rota. La especificación actual aplica racionamiento proporcional a todos los componentes y deja servicios sin canal de oferta; en políticas de demanda sostenida esto causa una brecha de capacidad persistente y puede convertir una expansión de servicios en deterioro simultáneo de KPI. Mantenerlo para una versión que compare políticas sería sesgado.

Alcance mínimo, sin implementar ahora:

```text
AS-IS:
capacidad independiente del nivel de capital salvo por I/K;
target=min(demanda, capacidad×1,05);
un solo factor de realización para consumo, servicios, inversión y comercio;
services = demanda pública + gasto, sin distinción corriente/productivo.

Problema:
exceso persistente de demanda mantiene el límite activo; el racionamiento recorta inversión;
servicios desplazan otros componentes y elevan deuda sin que el modelo represente producción
de servicios, calidad, productividad ni capital público.

TO-BE mínimo para 0.3.0:
reformular conjuntamente el cierre capacidad/racionamiento para que la oferta/capacidad y la
asignación de cantidades sean explícitas y estables; definir el control actual como consumo
público corriente o separar ese flujo de servicios/inversión pública productiva. No añadir un
multiplicador de productividad arbitrario. Mantener identidades de producto y presupuesto.
```

Esto no afirma qué coeficientes deben usarse ni autoriza elevar PAR-025 a 0,20: C2 quita clamps porque permite PIB hasta 120 % de capacidad, una consecuencia mecánica que no valida ese margen.

## Verificación

- `make build`: PASS.
- `npm test`: PASS, 68/68.
- `npm run test:regression`: PASS, 7 recetas y 3.282 comparaciones.
- `node docs/model-validation/run-stress-test.mjs .`: PASS, 22 trayectorias, 2.662 observaciones, determinismo y P01 verificados.
- Diagnóstico aislado: S00 y los cinco casos reconstruidos mes a mes; C1–C5 para S13 y S10. Ningún cambio de motor, parámetro persistente, dato, fixture, golden o expectativa.
