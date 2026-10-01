# Simula tu país / España — Playbook de pruebas v0.1

## 1. Alcance y estado de verificación

Este directorio integra documentación, siete sesiones importables, expectativas numéricas fijadas y un verificador externo del proyecto Simula tu país. La interfaz y el build compilado están integrados en el mismo proyecto; los cambios de modelo no forman parte de esta entrega.

Las cifras se han calculado ejecutando el motor JavaScript incluido en Simula tu país 0.1.0. No se han obtenido preguntando a un LLM ni estimando a ojo. Se ha repetido la batería original: 45 pruebas superadas, 0 fallos. El verificador externo ha superado 7 escenarios, 27 puntos temporales y 3282 comparaciones numéricas, además de comprobaciones de identidades y bifurcación.

**Son expectativas de regresión del software actual, no predicciones de España, recomendaciones de política ni validación empírica del modelo.** Una regresión estable puede conservar un modelo equivocado: por eso se separan las instantáneas numéricas de las identidades y de la revisión metodológica.

Estado de ejecución de la revisión actual: `npm test` compila y pasa 45 pruebas; `npm run test:regression` pasa los siete escenarios (27 fechas, 3282 comparaciones numéricas e identidades independientes); `npm run test:browser` pasa en Chromium real por HTTP con Web Worker nativo e IndexedDB. El recorrido comprueba aviso visible a 360/390/1280 px, cancelar/confirmar comparación, cambio, avance, persistencia, recarga y pausa. Capturas del aviso a 360 y 1280 px están en `artifacts/`. Firefox, el cuestionario, geometría SVG/CSV, importación desde la interfaz y ayudas táctiles no se han ejecutado como E2E y quedan **pendientes**, no aprobados. No se dispone en el paquete recibido de los trece comentarios UX separados para relacionarlos individualmente.

## 2. Preparación reproducible

| Elemento | Valor fijado para esta batería |
|---|---|
| Aplicación / modelo | 0.1.0 |
| Catálogo | `es-reviewed-2026-09-30.1` |
| Huella interna del catálogo | `68504b65` |
| Semilla | `1847` |
| Año base derivado | 2025 |
| Mes 0 | Cierre 2025 |
| Mes 1 | Enero 2026 |
| Mes 12 | Diciembre 2026 |
| Mes 24 | Diciembre 2027 |
| Mes 48 | Diciembre 2029 |
| Mes 60 | Diciembre 2030 |
| Entorno numérico comprobado | Node.js 22.16.0 |

Estas fechas pertenecen a la **fotografía versionada de prueba**. No deben convertirse en constantes de la aplicación. Con otro catálogo, hay que conservar esta batería para la versión antigua y crear otra revisada, no aceptar cifras nuevas automáticamente.

Antes de probar, exportar cualquier sesión propia que se quiera conservar: importar un caso sustituye el experimento activo.

Procedimiento recomendado para cada caso:

1. Abrir Simula tu país mediante HTTP con `node scripts/serve.mjs`.
2. Ir al configurador, pestaña **Opciones avanzadas → Importar simulación** y cargar el JSON indicado en el caso.
3. Comprobar semilla, mes inicial y parámetros. La importación pausa y reconstruye la sesión.
4. Avanzar con **+1 mes** o **+1 año**, no con reproducción continua cuando se quiera verificar una fecha exacta.
5. Comparar las tarjetas (valores destacados de B y referencia A) y, para más precisión, la tabla bajo la gráfica o el CSV.

No encadenar casos modificando una partida que ya ha avanzado: cada caso debe empezar importando su fixture. Para comprobar el efecto desde otra fecha existe un caso específico de bifurcación.

### Parámetros de referencia

`taxShift=0`, `progressivity=0`, `consumptionTax=11`, `corporateTax=20`, `transfers=0`, `publicInvestment=3`, `services=19.201875489641495`, `investmentFriction=0`, `elections=competitive`, `termMonths=48`, `expression=true`, `judicialReview=true`.

**Precisión importante:** Servicios públicos se muestra como 19,2 %, pero la base interna es 19.201875489641495. No mover ese deslizador en estos casos: podría redondear la entrada y alterar el resultado. Los archivos importables evitan esta fuente de discrepancias. Reiniciar tampoco garantiza restablecer la semilla si se había cambiado; la importación sí fija 1847.

Las políticas B no alteran el estado heredado en mes 0: se aplican al avanzar el primer paso. Un cambio de parámetros no debe producir de inmediato nuevos stocks de deuda, capital o población.

### Unidades y tolerancia

Actividad real: miles de millones de euros constantes a ritmo anualizado, no PIB realmente acumulado durante ese año. Poder adquisitivo: renta disponible real media por persona y año de hogares sintéticos. IPC y paro se expresan en porcentaje, no en fracciones. Los cambios de tipos se expresan en puntos porcentuales cuando corresponda.

Las tablas usan el redondeo de las tarjetas actuales: actividad con un decimal, renta con cero, IPC y paro con uno. Para verificar números sin redondear, `verificar.mjs` exige `abs(actual-esperado) <= 1e-8 + 1e-10 * abs(esperado)` y rechaza valores no finitos. Diferencias de separadores de miles del navegador no deben tratarse como diferencias numéricas.

## 3. Casos numéricos

### P01. Control: A y B idénticas

No cambiar nada. Importar `sesiones/00-base.json`.

Aceptar si A y B tienen el mismo estado numérico e historial de indicadores en todos los meses. Sus IDs de rama y algunos eventos narrativos pueden diferir; no se exige igualdad literal del feed. Verificar mes 1 con un paso y mes 12 importando de nuevo y pulsando +1 año.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 0 | Cierre 2025 | A | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 0 | Cierre 2025 | B | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | A | 1690,3 | 23.635 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | B | 1690,3 | 23.635 | 2,9 % | 10,5 % |
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 60 | diciembre de 2030 | A | 1846,6 | 24.701 | 1,9 % | 10,5 % |
| 60 | diciembre de 2030 | B | 1846,6 | 24.701 | 1,9 % | 10,5 % |

### P02. Impuestos directos +4 pp

Importar `sesiones/01-impuestos-4.json`. Único cambio: **Impuestos directos = +4,0 pp**. No significa un aumento relativo del 4 % del impuesto.

Al avanzar enero, consultar el mecanismo **Impuestos y renta disponible** de B. El incremento directo de impuestos a ingresos constantes debe ser 44.6163168 mil M€/año: `1690.012 * 0.66 * 0.04`. Esta identidad directa no equivale a la diferencia final entre las dos trayectorias, que incorpora otros mecanismos.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 0 | Cierre 2025 | A | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 0 | Cierre 2025 | B | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | A | 1690,3 | 23.635 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | B | 1683,2 | 22.738 | 2,9 % | 10,6 % |
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1670,5 | 22.294 | 2,1 % | 11,2 % |
| 60 | diciembre de 2030 | A | 1846,6 | 24.701 | 1,9 % | 10,5 % |
| 60 | diciembre de 2030 | B | 1798,4 | 23.152 | 1,4 % | 11,1 % |

### P03. Impuesto al consumo 15 %

Importar `sesiones/02-consumo-15.json`. Único cambio: **Impuesto al consumo = 15,0 %**, desde la referencia efectiva del 11 %. No es una simulación del tipo legal español de IVA.

El cociente `precioConsumidor/precioProductor` debe permanecer igual a `1.15/1.11` en cada mes simulado. Se trata de un cambio de nivel, no de multiplicar otra vez por ese factor cada mes. No debe exigirse que el IPC interanual siga permanentemente en el valor del primer año.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 0 | Cierre 2025 | A | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 0 | Cierre 2025 | B | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | A | 1690,3 | 23.635 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | B | 1683,5 | 22.813 | 6,6 % | 10,6 % |
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1672,1 | 22.389 | 5,8 % | 11,1 % |
| 24 | diciembre de 2027 | A | 1745,2 | 23.978 | 2,0 % | 10,6 % |
| 24 | diciembre de 2027 | B | 1702,1 | 22.583 | 1,6 % | 11,1 % |

### P04. Coste adicional de invertir 4 pp

Importar `sesiones/03-coste-inversion-4.json`. Único cambio: **Coste adicional de invertir = 4,0 pp**.

En el primer paso, el factor de fricción debe ser `exp(-3 * 0.04) = 0.8869204367171575`. La inversión privada deseada responde a este factor; no se exige que la inversión total realizada caiga exactamente en la misma proporción porque incluye inversión pública y el ajuste de realización.

La capacidad de A y B en el primer paso debe coincidir: ese cálculo todavía usa la inversión heredada. El efecto de la nueva inversión en capacidad aparece con retardo. Este control NO mide libertades de propiedad. Tampoco se fija una subida obligatoria de precios: en esta versión la respuesta de demanda y precios es la que muestran las cifras, pendiente de validación metodológica.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 0 | Cierre 2025 | A | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 0 | Cierre 2025 | B | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | A | 1690,3 | 23.635 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | B | 1682,8 | 23.636 | 2,9 % | 10,6 % |
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1666,9 | 23.127 | 2,1 % | 11,2 % |
| 60 | diciembre de 2030 | A | 1846,6 | 24.701 | 1,9 % | 10,5 % |
| 60 | diciembre de 2030 | B | 1791,0 | 23.967 | 1,4 % | 11,2 % |

### P05. Dos mecanismos simultáneos

Importar `sesiones/04-impuestos-4-transferencias-20.json`. Cambios: **Impuestos directos = +4,0 pp** y **Transferencias a hogares = +20 %**.

El 20 % es un incremento respecto a las transferencias de referencia, no veinte puntos del PIB. A ingresos iniciales constantes, la diferencia directa de renta disponible agregada es `1690.012 * (0.17 * 0.20 - 0.66 * 0.04) = 12.8440912` mil M€/año. Verificar también la contrapartida en las cuentas públicas.

El objetivo del caso es comprobar que coexisten impuestos y transferencias con sus contrapartidas; no imponer una conclusión a partir de un solo control.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 0 | Cierre 2025 | A | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 0 | Cierre 2025 | B | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | A | 1690,3 | 23.635 | 2,9 % | 10,5 % |
| 1 | enero de 2026 | B | 1693,7 | 23.893 | 2,9 % | 10,5 % |
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1728,9 | 24.212 | 2,5 % | 10,4 % |
| 60 | diciembre de 2030 | A | 1846,6 | 24.701 | 1,9 % | 10,5 % |
| 60 | diciembre de 2030 | B | 1870,3 | 25.285 | 2,2 % | 10,3 % |

### P06. Calendario institucional sin efectos económicos ocultos

Importar `sesiones/05-mandato-24.json`. Único cambio: **Intervalo de renovación = 2 años / 24 meses**. Se mantiene el procedimiento de la referencia.

A y B deben tener estados económicos iguales. B genera **Renovación institucional programada** en los meses 24 y 48; A, en el 48. Son procedimientos ficticios contados desde el inicio de la rama, no fechas ni resultados de elecciones reales. Este test documenta una limitación vigente: las instituciones aún no afectan a la economía.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 0 | Cierre 2025 | A | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 0 | Cierre 2025 | B | 1690,0 | 23.707 | 2,9 % | 10,5 % |
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 24 | diciembre de 2027 | A | 1745,2 | 23.978 | 2,0 % | 10,6 % |
| 24 | diciembre de 2027 | B | 1745,2 | 23.978 | 2,0 % | 10,6 % |
| 48 | diciembre de 2029 | A | 1811,0 | 24.434 | 1,9 % | 10,6 % |
| 48 | diciembre de 2029 | B | 1811,0 | 24.434 | 1,9 % | 10,6 % |

### P07. Cambiar B desde el estado de A, no desde el inicio

Dos rutas equivalentes:

**Ruta manual para la interfaz:** importar `00-base.json`, avanzar +1 año, crear una nueva B desde A y confirmar. En ese momento, cambiar Impuestos directos a +4,0 pp. Antes de avanzar, A y B deben seguir teniendo las mismas cifras de diciembre de 2026.

**Ruta preparada para el motor:** importar `sesiones/06-bifurcacion-mes12-impuestos4.json`. Ya sitúa el experimento en mes 12, con bifurcación y parámetros listos. Esta ruta no prueba que el botón sea accesible.

Un paso lleva a enero de 2027 (mes 13). Desde el fixture, +1 año lleva a diciembre de 2027 (mes 24). No comparar estos resultados con el caso P02: las medidas entran en vigor en fechas distintas. La semilla y la trayectoria A se conservan; se descarta la B anterior al confirmar.

| Mes | Fecha | Rama | Actividad real (mil M€/año) | Poder adquisitivo (€/persona/año) | IPC interanual | Paro |
|---:|---|:---:|---:|---:|---:|---:|
| 12 | diciembre de 2026 | A | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 12 | diciembre de 2026 | B | 1709,9 | 23.698 | 2,4 % | 10,6 % |
| 13 | enero de 2027 | A | 1712,4 | 23.715 | 2,3 % | 10,6 % |
| 13 | enero de 2027 | B | 1705,1 | 22.815 | 2,3 % | 10,7 % |
| 24 | diciembre de 2027 | A | 1745,2 | 23.978 | 2,0 % | 10,6 % |
| 24 | diciembre de 2027 | B | 1705,1 | 22.559 | 1,8 % | 11,1 % |

## 4. Pruebas estructurales complementarias

| ID | Procedimiento | Aceptación |
|---|---|---|
| I01 | Ejecutar P02 con +1 año y, desde el fixture, 12 veces +1 mes. | Mismo estado numérico, historial y eventos. |
| I02 | Repetir P02 con la misma semilla y versión. | Mismas cifras y perturbaciones externas. |
| I03 | Exportar P02 en mes 12, importar y avanzar; comparar con ejecución sin interrupción. | Misma continuación. No salta al tiempo de reloj. |
| I04 | Repetir la exportación/importación tras P07. | Conserva `forkMonth=12`; reconstruye B a partir de A y de su política. |
| I05 | En una copia del fixture, cambiar `datasetHash` o `modelVersion`. | Rechazo legible; no interpreta silenciosamente otras versiones ni reemplaza la sesión válida. |
| I06 | Comparar los eventos externos de A y B. | Mismos meses y perturbaciones; ignorar IDs de rama. |
| I07 | Revisar cada mes las identidades del modelo. | Demanda, presupuestos de hogares, evolución del capital y deuda neta concilian. |
| I08 | Datos: año nuevo incompleto, proyecciones, año nuevo completo. | Solo una base completa admisible desplaza el año de inicio. No fijar 2025 en el producto. |
| I09 | Cambiar textos o renderizado de la descripción ideológica, sin tocar los parámetros. | Ninguna cifra del motor cambia. No asignar puntuaciones esperadas ni un ganador político. |

Para las identidades, utilizar un oráculo independiente sencillo. Por ejemplo, con PIB nominal sintético 1000, población 50 millones e índice de precios 1, +4 pp de impuestos reduce la renta disponible de cada grupo en `0.04 * ingresosBrutosDelGrupo`. Combinar +4 pp y transferencias +20 % aumenta la renta disponible agregada en 7,6 unidades de mil M€ bajo los repartos de esta versión. Estas son consecuencias aritméticas de las entradas fijadas, no estimaciones del efecto sobre España.

## 5. Ejecutar el verificador sin cambiar la app

Desde la raíz del proyecto: `npm run test:regression`. El comando lee `docs/playbook/evidencias/resultados.json` y las sesiones de `docs/playbook/sesiones/`, y compara el `dist/` actual con las expectativas fijas. No regenera expectativas.

`npm test` recompila `dist/` y ejecuta las pruebas de motor, HTTP y protocolo worker. `npm run test:browser` ejecuta la prueba de Chromium nativo; requiere Chromium disponible. El test de navegador no depende de mocks ni adaptadores de worker.

La evidencia original del cálculo está en `evidencias/pruebas-originales.log`, `evidencias/verificacion-playbook.log`, `evidencias/resultados.json` y `evidencias/manifest.json`; las sesiones están en `sesiones/`.

## 6. Interfaz: regresión de navegador

La acción inferior se conserva como segundo acceso. El botón **Crear nueva B desde A** dentro del aviso reutiliza la misma acción, diálogo y mensaje FORK. La prueba `tests/browser-cdp.mjs` usa el servidor HTTP y Chromium con Web Worker e IndexedDB nativos.

| ID | Procedimiento en navegador real | Resultado exigido |
|---|---|---|
| UI01 | Importar P01 y avanzar un mes. Ver el aviso en Economía, Instituciones y Sesión. | Botón **Crear nueva B desde A** disponible junto al aviso, alcanzable por teclado. |
| UI02 | Activar el botón junto al aviso. | Pausa y abre confirmación con la fecha de origen, sustitución de B y conservación de A. No cambia el estado aún. |
| UI03 | Cancelar esa confirmación. | A, B, fecha, semilla y parámetros no cambian. El foco vuelve al control de origen. |
| UI04 | Confirmar. | A se conserva; B hereda estado e historial numérico de A en ese mes; la configuración B se desbloquea sin avanzar tiempo; el foco queda en el configurador. |
| UI05 | Ejecutar P07 por la ruta manual. | Coinciden las cifras de los meses 12, 13 y 24 con este playbook. |
| UI06 | Doble clic o activación mientras hay una orden al worker pendiente. | No duplica bifurcaciones ni mezcla meses; la interfaz señala el estado ocupado. |
| UI07 | Escritorio 1280×720 y móvil 360×800 / 390×844. | Al llegar al aviso, el botón está junto a él sin tener que buscar al final del panel; no hay desbordamiento horizontal ni solapamiento. |
| UI08 | Avanzar con reproducción, pausar, cambiar de pestaña y recargar. | Con IndexedDB disponible aparece sesión local y se conserva el último paso confirmado. No se recupera tiempo real perdido. Un paso ya solicitado puede terminar. |
| UI09 | Guardado local no disponible. | Funciona en memoria, lo indica y permite exportar; no promete persistencia. |
| UI10 | Abrir un evento antiguo y consultar sus mecanismos. | No atribuye a ese evento las cifras del último mes. |

Estado UI01–UI04/UI07–UI08: PASS en Chromium real; el test automatiza el aviso, cancela sin avanzar, confirma la bifurcación, cambia impuestos, avanza, valida persistencia y recarga pausada. UI05 se cubre en la regresión numérica de P07 (meses 12, 13 y 24); exportación/restauración y versiones se cubren en regresión y pruebas del motor. UI06 (doble activación con worker deliberadamente lento), UI09 (IndexedDB denegada) y UI10 (modal de evento antiguo) no son ejercitados por el nuevo flujo E2E. No se presentan como PASS.

Las pruebas de navegador usan el servidor y worker nativos, sin adaptadores que suplanten un flujo integral.

## 7. Cierre y mantenimiento

Un informe de prueba debe indicar ID, versión de modelo y datos, semilla, fixture, mes, resultado esperado/obtenido, tolerancia, navegador y estado PASS/FAIL/BLOQUEADA. Si falla, adjuntar sesión exportada, captura y error.

No regenerar `resultados.json` para conseguir verde. Si cambia deliberadamente el modelo, revisar por qué cambian las cifras, versionar el modelo y conservar la evidencia previa. Si se descubre un error en el modelo actual, registrar el defecto y acordar una corrección separada: congelar el error como expectativa no lo vuelve correcto.

Para el encargo actual, la corrección es de interfaz y pruebas: los resultados numéricos deben mantenerse. La validación econométrica y los mecanismos institucionales pendientes no quedan resueltos por este playbook.
