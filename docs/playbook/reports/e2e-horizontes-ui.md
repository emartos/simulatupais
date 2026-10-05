# Auditoría E2E parametrizada por horizontes

> La sección de auditoría previa describe la cobertura y los oráculos 0.1.0 antes de la ampliación. Los artefactos activos y la ejecución final están versionados en 0.2.0; los oráculos 0.1.0 se preservan bajo `oracles/model-0.1.0/`.

## Auditoría previa a la ampliación

Se inspeccionaron `tests/browser-scenarios.mjs`, `tests/browser-cdp.mjs`, los fixtures de `docs/playbook/sesiones/`, `docs/playbook/evidencias/resultados.json` y el playbook P01–P07. Antes de editar:

| Comando/capa | Cobertura real constatada antes de este cambio |
|---|---|
| `npm test` | 59 pruebas unitarias/integración del motor, política, protocolo Worker, persistencia y UI auxiliar. No configura y avanza una receta en el navegador. |
| `npm run test:regression` | 7 recetas P01–P07, 27 fechas fijadas y 3.282 comparaciones numéricas con el motor. Carga sesiones directamente; no es E2E de UI. |
| `npm run test:browser` | `browser-cdp.mjs` cubre HTTP, UI, Worker, IndexedDB, navegación y responsive, sin oráculos de escenarios a varios años. `browser-scenarios.mjs` recorría UI → controles → Worker → avance → tarjetas/tabla y comparaba P02 y P05 a 12/60 meses para A/B y seis métricas. |

La cobertura numérica E2E preexistente era **2 escenarios × 2 horizontes × 2 trayectorias × 6 métricas = 48 valores terminales de serie**, además de tarjetas y referencias comparadas. No cubría el baseline, P03/P04, comparación idéntica ni bifurcación intermedia.

Al comenzar la revisión, los snapshots existentes eran: P01 `00-base` en meses 0/1/12/60; P02 `01-impuestos-4` en 0/1/12/60; P03 `02-consumo-15` en 0/1/12/24; P04 `03-coste-inversion-4` en 0/1/12/60; P05 `04-impuestos-4-transferencias-20` en 0/1/12/60; P06 `05-mandato-24` en 0/12/24/48; y P07 `06-bifurcacion-mes12-impuestos4` en 12/13/24. Por eso faltaban P03/60, P04/120 y la bifurcación 36/37/48/96; abajo se documenta cómo se cerraron esos huecos.

## Cobertura E2E y cierre de los tres oráculos

La ampliación conserva el recorrido de navegador real. Los escenarios se crean y modifican con controles públicos, se confirman con los diálogos de la aplicación y avanzan con los botones temporales. Chromium carga el build por HTTP, el Web Worker nativo y el almacenamiento IndexedDB del perfil temporal exclusivo del test. No se importan sesiones para ejecutar los escenarios. Los valores esperados proceden de snapshots preexistentes y de los tres goldens adicionales, revisados en fichas separadas.

| Caso | Recorrido/receta | Horizontes comprobados | Métricas y verificación |
|---|---|---|---|
| E01 — Configuración de partida | Arranque limpio de la aplicación, omisión del cuestionario, sin cambios. Oráculo P01 `00-base`. | 12, 60 | Seis valores de serie y cuatro tarjetas por horizonte, contra los goldens. |
| P02 — Impuestos directos +4 pp | Receta P02 desde los controles. | 12, 60 | Seis métricas, tarjetas y valores comparados A/B contra snapshots. |
| P05 — Impuestos +4 pp y ayudas +20 % | Receta P05 desde los controles. | 12, 60 | Seis métricas, tarjetas y valores comparados A/B contra snapshots. |
| E02 — Impuesto al consumo 15 % | Receta P03 desde los controles. | 12, 60 | Seis series A/B y cuatro tarjetas/referencias por horizonte; mes 60 también contra golden crudo exportado de la UI. |
| E03 — Coste adicional de inversión +4 pp | Receta P04 desde los controles. | 12, 60, 120 | Seis series A/B y cuatro tarjetas/referencias por horizonte; mes 120 también contra golden crudo exportado de la UI. |
| E04 — Comparación idéntica | Comparación creada en la UI sin editar controles. | 60 | Seis series completas de meses 0–60, tarjetas, diferencias, curvas, puntos, fechas y acontecimientos externos visibles. Exportación CSV iniciada desde la interfaz para comparar las cifras sin redondeo. |
| E05 — Bifurcación en mes 36 | Avance UI a mes 36, creación de comparación, control P02 +4 pp, confirmación y continuación. | 36, 37, 48, 96 | Seis series A/B y cuatro tarjetas por horizonte; valores crudos del CSV, fechas, igualdad exacta en el fork, pasado común, política original y divergencia post-fork. |

La cobertura numérica de los escenarios con golden comprueba **168 valores terminales de serie**: E01 aporta `2 × 1 × 6 = 12`; P02 y P05 aportan `2 × 2 × 6 = 24` cada uno; E02 aporta `2 × 2 × 6 = 24`; E03 aporta `3 × 2 × 6 = 36`; E05 aporta `4 × 2 × 6 = 48`. Comprueba además **112 valores de tarjeta**: E01 aporta 8; P02/P05 32 cada uno; E02 16; E03 24; E05 32 entre valor y referencia de sus cuatro indicadores principales. Estas cifras cuentan observaciones terminales, no cada mes intermedio.

En E04 se verifican adicionalmente **61 meses × 6 métricas = 366 pares A/B** (732 valores completos del CSV). Los dos valores de cada par deben ser exactamente iguales, sin tolerancia de ruido; los seis valores de ambos escenarios en el mes 60 se contrastan también exactamente con P01. La tabla visible confirma igualdad a la precisión mostrada y las tarjetas muestran diferencia cero. Se comparan los acontecimientos externos identificados como tales en el registro visible.

E05 comprueba en el mes 36 que las seis métricas y fechas coinciden exactamente entre ramas, y contrasta ambos escenarios en 36/37/48/96 con el CSV de precisión completa. P07 permanece como golden de otra receta (fork en mes 12) y no se reutiliza para este caso.

## Oráculo y reproducibilidad

El test comprueba que sesión, fixture y manifest coinciden en modelo `0.2.0`, catálogo `es-reviewed-2026-09-30.1`, huella `68504b65`, año base 2025 y semilla `1847`. P02/P05/P03/P04 confirman además los valores de los controles públicos frente a las recetas. Los tres oráculos nuevos están separados de `resultados.json` en `docs/playbook/oracles/`; cada uno tiene una ficha de revisión, política inicial, cambio, mes de aplicación, horizonte, fecha, tolerancia y límites de aprobación.

Los candidatos de las fichas originales E02/60, E03/120 y E05/36/37/48/96 pertenecían a 0.1.0 y se conservan en `oracles/model-0.1.0/`. Las expectativas activas de 0.2.0 se regeneraron deliberadamente desde las recetas fijas solo después de los sanity checks y se contrastaron con la interfaz real mediante esta suite; no se presentan como una exportación independiente de UI ni como aprobación científica. Las fichas activas identifican expresamente esta procedencia. La aprobación es técnica para reproducibilidad del software, no validación empírica.

La tolerancia de presentación es media unidad de la última cifra visible: ±0,05 para medidas a una décima y ±0,5 para capacidad de compra en euros enteros. Los tres nuevos casos exportan CSV desde UI y verifican números crudos contra sus goldens con tolerancia relativa `1e-9`; las tablas y tarjetas también se contrastan con precisión visible. No se calcula ningún expected dentro del test.

## Resultados de ejecución

| Comprobación | Estado | Evidencia |
|---|---|---|
| `make build` | PASS | Build `dist/` actualizado antes de las ejecuciones de navegador. |
| `npm test` | PASS | 68 pruebas, 0 fallos; ejecuta primero `npm run build`. |
| `npm run test:regression` | PASS | 7 escenarios, 27 fechas y 3.282 comparaciones numéricas contra goldens versionados 0.2.0; copias 0.1.0 preservadas. |
| `npm run test:browser` | PASS | Chromium 153, HTTP, Worker nativo, UI e IndexedDB; E01, P02, P05, E02, E03, E04 y E05 pasan sin errores de página. |
| E01 / P01, meses 12/60 | PASS | Seis series y tarjetas en baseline sin cambios contra P01. |
| P02 / P05, meses 12/60 | PASS | Seis series A/B y tarjetas/referencias contra oráculos. |
| E02 / P03, mes 12 | PASS | Configuración desde controles; seis series A/B y tarjetas contra golden. |
| E02 / P03, mes 60 | PASS | Seis series A/B comparadas desde CSV crudo con `e02-p03-m60.json`; tabla y tarjetas comprobadas. Ficha `E02-P03-mes60.md`. |
| E03 / P04, meses 12/60/120 | PASS | Meses 12/60 contra snapshots aprobados; mes 120 CSV crudo contra `e03-p04-m120.json`; seis métricas y tarjetas. Ficha `E03-P04-mes120.md`. |
| E04 idéntica, mes 60 | PASS | Series completas, igualdad exacta en CSV, tarjetas/diferencias, curvas, puntos, fechas y 6 sucesos externos visibles coincidentes. |
| E05 bifurcación, estructura de UI | PASS | La aplicación recorre mes 36 → 37 → 48 → 96; historia común hasta 36, política original intacta y divergencia posterior de producción. |
| E05 bifurcación, 36/37/48/96 | PASS | CSV crudo de seis series A/B contra `e05-bifurcacion-m36.json`; historial, fechas, tarjetas, fork y política comprobados. Ficha `E05-bifurcacion-mes36.md`. |
| Modelo, catálogo, semilla y regresiones | PASS | Modelo 0.2.0 con decisiones aprobadas; catálogo, base y semilla conservados. Resultados 0.1.0 archivados y regresiones activas actualizadas tras sanity checks. |

## Ejecución

```sh
npm test
npm run test:regression
npm run test:browser
```

`npm run test:browser` construye el recorrido general de navegador y luego ejecuta `tests/browser-scenarios.mjs` por HTTP. La suite de escenarios usa el servidor local que inicia el propio script si no se configura `BASE_URL`; su perfil Chromium e IndexedDB son temporales y exclusivos de la prueba.


## Estado final de la integración 0.2.0

- Modelo: `0.2.0`; catálogo `es-reviewed-2026-09-30.1`, huella `68504b65`; año base 2025; semilla E2E 1847.
- `make build`: PASS; recursos del directorio `dist/` regenerados.
- `npm test`: PASS, 68/68.
- `npm run test:regression`: PASS, 7 escenarios, 27 fechas y 3.282 comparaciones numéricas.
- `npm run test:browser`: PASS en Chrome 153.0.8010.47; `browser-cdp.mjs` confirma HTTP, Web Worker, IndexedDB y recarga; `browser-scenarios.mjs` confirma E01, P02, P05, E02, E03, E04 y E05, incluida la divergencia posterior a la bifurcación.
- Registros y resultados 0.1.0 preservados en `evidencias/resultados-model-0.1.0.json`, `sesiones/model-0.1.0/` y `oracles/model-0.1.0/`. Los números 0.2.0 son expectativas deterministas del software, no evidencia económica independiente.
