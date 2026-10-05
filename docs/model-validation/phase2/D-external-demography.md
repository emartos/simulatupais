# Fase 2 EXPRESS — Frente D: exterior, demografía y shocks

## Alcance y lectura

Diagnóstico del modelo 0.1.0 según [ecuaciones](../model-equations.md), [parámetros](../model-parameters.md), [baseline](../baseline-spain.md) y [supuestos estructurales](../structural-assumptions.md). “Materialidad” significa riesgo de desviar trayectorias macroeconómicas al horizonte indicado; no es una estimación probabilística. El 0.2.0 debería seguir siendo un simulador de escenarios agregados, no una proyección oficial ni un modelo internacional completo.

## D1. Tendencia de exportaciones

| Campo | Contenido |
|---|---|
| Actual | Exportaciones reales `X=X₀(1+0,02)^(t/12)`, más shock multiplicativo de demanda exterior. |
| Evidencia | Un 2 % puede ser un escenario central plausible, pero no es una constante estructural: el Banco de España documenta que exportaciones españolas reales crecieron casi 50 % entre 2008 y 2023 (aprox. 2,7 % anual compuesto), y atribuye la expansión a competitividad y orientación exportadora. En su previsión reciente, la Comisión anticipa evolución menos vigorosa de exportaciones y contribución exterior negativa o neutral en 2025–27. Las tasas observadas/previstas dependen del periodo y ciclo. |
| Materialidad 5 años | MEDIA |
| Materialidad 10 años | ALTA |
| Diagnóstico | RECALIBRAR |
| Propuesta mínima 0.2.0 | Mantener 2 % solo como escenario tendencial etiquetado; incorporar un selector simple de crecimiento exportador bajo/central/alto o un crecimiento externo configurable, con tendencia común a 1–2 % real y posibilidad de años de crecimiento débil. No presentarlo como predicción. |
| Fuente | [Banco de España, bonanza exportadora 2008–2023](https://www.bde.es/wbe/es/noticias-eventos/blog/la-bonanza-de-las-exportaciones-espanolas-desde-2008-que-exportamos-y-a-que-destinos.html); [Comisión Europea, previsiones de España](https://economy-finance.ec.europa.eu/economic-surveillance-eu-member-states/country-pages-including-country-reports/spain/economic-forecast-spain_en). |

## D2. Importaciones

| Campo | Contenido |
|---|---|
| Actual | Importaciones deseadas son proporcionales a la demanda doméstica deseada; elasticidad unitaria implícita, sin componente de precios relativos, tipo de cambio o composición. |
| Evidencia | La evidencia oficial española varía mucho por ventana: BdE estima elasticidad de importaciones a demanda final de 0,18 en 2023; respecto del PIB, 1,6 en 1999–2007, 3,0 en 2008–13, 1,6 en 2014–17, 1,1 en 2018–19, 1,5 en 2020–21 y 1,1 en 2022. El propio BdE atribuye cambios a la composición de demanda y dependencia energética. Su modelo trimestral actualizado da elasticidad media de importaciones a demanda 1,5 a largo plazo y 1,7 a corto; estas medidas no son idénticas a la regla del juego, pero muestran que 1 es una heurística defendible y no un parámetro universal. |
| Materialidad 5 años | MEDIA |
| Materialidad 10 años | ALTA |
| Diagnóstico | RECALIBRAR |
| Propuesta mínima 0.2.0 | Conservar elasticidad agregada 1 como central sencilla, permitir sensibilidad 0,8–1,5 y mantenerla acotada; separar al menos consumo/inversión si se busca una mejora posterior, pues su contenido importador difiere. No introducir tipo de cambio antes de disponer de precios relativos consistentes. |
| Fuente | [BdE, elasticidad de importaciones a demanda final (1999–2023)](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/InformesBoletinesRevistas/BoletinEconomico/24/T3/Fich/20240917_Proyecciones_AG.pdf); [BdE, actualización del modelo trimestral](https://www.bde.es/f/webbde/SES/Secciones/Publicaciones/DocumentosOcasionales/11/Fich/do1106.pdf). |

## D3. Demografía

| Campo | Contenido |
|---|---|
| Actual | Tasas de nacimientos y defunciones, y residuo neto que reproduce el cambio poblacional del baseline, se repiten constantes durante todo el horizonte; sin edades ni respuesta económica. |
| Evidencia | No es razonable interpretar esto como proyección a 10–20 años. El INE publica escenarios separados de fecundidad, mortalidad y migración; su proyección 2024–2074 espera saldo vegetativo negativo durante los próximos 15 años, compensado por migración neta, con 3,5 millones de ganancia migratoria en los primeros cinco años. El residual actual no equivale a migración observada y extrapolarlo indefinidamente oculta cambios de composición/edad. |
| Materialidad 5 años | MEDIA |
| Materialidad 10 años | ALTA |
| Diagnóstico | REFORMULAR |
| Propuesta mínima 0.2.0 | Sustituir “residuo constante” por saldo migratorio anual configurable y trayectorias separadas simples de natalidad, mortalidad y migración; ofrecer un escenario de población constante/INE. Evitar proyectar por cohortes si no hay desagregación etaria en el modelo. |
| Fuente | [INE, Proyecciones de Población 2024–2074](https://www.ine.es/dyngs/Prensa/es/PROP20242074.htm). |

## D4. Shocks

| Campo | Contenido |
|---|---|
| Actual | Cada mes, probabilidad 10 % de un shock; canal elegido entre energía, demanda exterior u oferta, signo equiprobable y magnitud de 0,5–1,5 veces la amplitud sintética. Una secuencia determinista por semilla. |
| Evidencia | Los parámetros de frecuencia y amplitud no tienen calibración ni distribución económica documentada. El mecanismo produce en promedio 1,2 eventos anuales, aunque asigna uno solo a uno de tres canales y no especifica duración, correlación o persistencia. Una secuencia reproducible es útil para juego/comparación, pero no es incertidumbre empírica ni intervalo de pronóstico. |
| Materialidad 5 años | MEDIA |
| Materialidad 10 años | ALTA |
| Diagnóstico | HEURÍSTICA |
| Propuesta mínima 0.2.0 | Mantener el generador solo si la interfaz y resultados lo llaman explícitamente “shocks lúdicos no empíricos”; evitar afirmar que 10 % o sus amplitudes reflejan frecuencias reales. Para escenarios con interpretación económica, permitir apagarlo y comparar semillas/sin-shock. Calibrarlo exigiría definir variables, persistencia y muestra; reducir amplitud sin objetivo concreto sería arbitrario. |
| Fuente | [Documentación interna de EQ-028 y PAR-051–056](../model-equations.md#eq-028--generador-determinista-de-shocks), [registro de parámetros](../model-parameters.md#generador-determinista-de-shocks-y-límites-técnicos). |

## D5. Entorno monetario y exterior omitido

| Campo | Contenido |
|---|---|
| Actual | No hay euro/BCE, tipos oficiales, tipo de cambio, precios comerciales ni reacción monetaria. El gasto de intereses usa coste anual fijo del 2,5 % sobre deuda previa, sin vencimientos, refinanciación ni prima soberana. |
| Evidencia | La transmisión del BCE afecta condiciones financieras, demanda y rendimientos soberanos; los diferenciales también pueden variar dentro de la unión monetaria. El tipo fijo del modelo no representa ese canal. Como referencia de inercia, el coste efectivo de deuda pública cambia gradualmente por la vida de la deuda; los nuevos tipos no se aplican instantáneamente al stock. En escenarios normales el error puede ser moderado a cinco años, pero ciclos de tipos, inflación persistente o tensión de spreads cambian gasto de intereses y demanda, acumulándose materialmente a 10 años. |
| Materialidad 5 años | MEDIA |
| Materialidad 10 años | ALTA |
| Diagnóstico | REFORMULAR |
| Propuesta mínima 0.2.0 | Representar euro como régimen fijo (sin tipo de cambio nacional ni ajuste monetario español) y sustituir el coste fijo por una tasa de refinanciación configurable ligada a un “tipo BCE/mercado” común más spread soberano sencillo, aplicada gradualmente a una fracción de deuda que vence/refinancia. Si esto excede el MVP, **ACEPTAR OMISIÓN EN 0.2.0** únicamente con tasa configurable y escenarios de estrés de interés; rotular expresamente que trayectoria de deuda no incorpora transmisión monetaria. No hace falta un banco central completo. |
| Fuente | [BCE, transmisión de política monetaria en la zona euro](https://www.ecb.europa.eu/press/key/date/2024/html/ecb.sp240824~c215968c41.en.html); [BCE, QT y tipos soberanos](https://www.ecb.europa.eu/press/blog/date/2024/html/ecb.blog241114~6a3182c0bd.ga.html); [Comisión Europea, perspectivas de España](https://economy-finance.ec.europa.eu/economic-surveillance-eu-member-states/country-pages-including-country-reports/spain/economic-forecast-spain_en). |

## Cambios recomendados para 0.2.0

1. Etiquetar exportaciones 2 % como escenario, con sensibilidad de tendencia externa.
2. Mantener elasticidad importadora 1 como central, documentando sensibilidad 0,8–1,5.
3. Usar escenarios demográficos simples con migración explícita, en vez de residual extrapolado.
4. Declarar shocks actuales como mecanismo lúdico no empírico y permitir desactivarlos.
5. Hacer configurable el coste de deuda; si no se implementa refinanciación gradual ligada al BCE/spread, documentar la omisión y ofrecer estrés de tipos.
