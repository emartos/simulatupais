# Escenarios compartibles

## Enlaces y reproducción

El botón «Compartir escenario» produce una URL `/?v=2&r=<runtime-id>&c=d&s=<payload>`. `v` es la versión del protocolo público, `r` identifica el runtime inmutable, `c=d` declara el codec DEFLATE y `s` contiene bytes comprimidos codificados como Base64 URL-safe. El JSON previo a la compresión es una matriz con orden explícito: país, año base, versión del motor y catálogo, huella del catálogo, semilla, opción de perturbaciones, mes alcanzado, mes de bifurcación, trayectoria principal, indicador de comparación, trayectoria de origen, trayectoria visible y recetas de A/B. Cada receta contiene política inicial, cambios fechados y origen del calendario institucional. Las políticas usan el orden fijo declarado en `src/ui/shared-scenario.ts`.

Base64url sólo convierte bytes para transportarlos en una URL; **no comprime**. El codec aplica DEFLATE con envoltura zlib al JSON UTF-8 y después Base64url. Se usa `fflate` 0.8.3, una implementación pequeña y síncrona, para mantener el mismo flujo de render y compartir y obtener bytes deterministas independientemente de la API de compresión del navegador. Su licencia MIT se publica con los assets. El decoder no adivina formatos: `v=2` exige exactamente un `c=d` y rechaza parámetros duplicados, datos corruptos o expansión excesiva.

La URL conserva las **condiciones necesarias para recalcular** la trayectoria, incluidos cambios posteriores a una bifurcación. No contiene resultados calculados, nombres de trayectorias, procedencia de presets, IDs de sesión, fechas de creación, preferencias visuales, datos de IndexedDB ni texto libre. La codificación facilita el transporte; no es cifrado. Quien reciba el enlace puede ver todas las decisiones codificadas.

Al abrir el enlace, primero se resuelve `v/r`, antes de cargar el catálogo o el worker. Una vez seleccionado el runtime correcto, se valida país, año, catálogo, semilla, opciones, meses y cada valor de política mediante `validateSession` y `validatePolicy` **de ese runtime**. Los parámetros desconocidos se ignoran. Una receta incompatible muestra un error comprensible y abre la configuración inicial segura. Un runtime desconocido no ejecuta la receta: muestra un error y un enlace de vuelta al simulador actual.

## Durabilidad de enlaces

`r` tiene la forma `rt-` seguida de 32 caracteres hexadecimales. `scripts/build.mjs` calcula SHA-256 sobre tres secuencias de bytes delimitadas por longitud: el bundle final de `worker.js`, el catálogo efectivo `spain.json` y un bundle de `replay-kernel.ts`. Este último incluye el decodificador de URLs, la validación/restauración de sesiones y la selección de datos, que pueden cambiar la reproducción aunque el worker no cambie. Los cambios exclusivos de CSS, texto, navegación, analytics u Open Graph no alteran esa huella. `dist/build-info.json` publica el ID junto con los hashes diagnósticos anteriores.

`public/replay/runtime-manifest.json` enumera los runtimes archivados. Cada `/replay/<runtime-id>/` contiene HTML, CSS, JS, worker, datos, licencias y un `asset-manifest.json` propio. Vídeo, poster, logos, icono y previews se guardan una sola vez por SHA-256 en `/replay/blobs/<sha256>/asset.<extensión>`. El build raíz también genera `/asset-manifest.json` con el mismo esquema y resuelve esos assets al mismo almacén. `public/` conserva los archivos originales como fuentes; `dist/` es el artefacto desplegable y no contiene copias bajo `/media/`, `/assets/`, `/icon.svg` ni `/share-preview.*`. El manifest fija la ruta y el hash exactos de cada asset lógico; la aplicación desplegada falla de forma controlada si falta el manifest o una entrada. El catálogo conserva sus rutas lógicas de logos para que la validación metodológica siga intacta; la interfaz las resuelve a blobs después de validarlo. El snapshot no contiene otro directorio `replay/`. Si el `r` del enlace coincide con el build actual, se abre normalmente. Si existe en el manifest, la raíz usa `location.replace()` hacia el snapshot del mismo origen y conserva la query íntegra. Desde el snapshot, los nuevos enlaces vuelven a apuntar a `/?v=2&r=<runtime-id>&c=d&s=…`: `/replay/` es una ruta interna. Nunca se reinterpreta un escenario A con el motor B.

Antes de publicar un runtime nuevo, ejecuta `npm run build`, la batería de pruebas, `npm run replay:archive`, verifica el manifest y ejecuta el E2E del snapshot archivado. El archivador compila con metadatos de commit neutros, compara bytes del snapshot, reutiliza blobs idénticos y registra un digest SHA-256 que incorpora el manifest y los bytes de sus blobs. Repetirlo sin cambios es idempotente; si existe el mismo ID con otros bytes, falla y no sobrescribe. `npm run replay:verify` comprueba **todos** los snapshots del manifest y sus blobs: detecta runtime, referencia o blob alterado o ausente. Si sólo cambia la interfaz, conserva el runtime ya archivado y ejecuta esta verificación sin intentar sustituirlo. Incluye snapshot y blobs en la **misma release** que empieza a generar sus enlaces, antes del deploy. No dependas de reconstruirlos posteriormente a partir de Git.

El almacén de blobs es sólo de adición. No hay borrado automático: un archivo aparentemente sin referencias puede pertenecer a una release histórica. Una futura limpieza requeriría una auditoría explícita de todos los manifests publicados. El alojamiento sólo necesita servir archivos estáticos y las rutas `/replay/`; no utiliza CDN externo, enlaces del sistema de archivos ni backend. La ubicación física de los assets no participa en `replayRuntimeId`, que sigue derivándose del worker, los datos y el replay kernel.

El formato `v=1` se acepta únicamente como compatibilidad best-effort con el runtime actual, sin compresión. Fue pre-release y no tiene garantía de durabilidad; la aplicación nunca genera enlaces nuevos `v=1`. La variante pre-release de `v=2` sin `c=d` tampoco se conserva porque no llegó a publicarse. El contrato definitivo `v=2` exige `r` válido y `c=d` y tiene un límite operativo de **8192 caracteres para la URL pública canónica completa**. Para validarlo se sustituye cualquier ruta interna `/replay/<runtime-id>/` por `/` y se conservan origen y query. La longitud adicional del redirect interno no invalida un enlace público válido. Un escenario demasiado extenso no se trunca ni se modifica: se informa del límite y permanece disponible la exportación de sesión.

La URL tiene prioridad sobre la sesión local para esa apertura. Abrir o modificar un escenario recibido no sobrescribe automáticamente la sesión que ya estuviera guardada en IndexedDB; el escenario recibido vive en memoria hasta que se comparte o exporta. Importar explícitamente un archivo de sesión mantiene el comportamiento existente de guardado local.

## Escenarios editoriales

Las rutas `/#/espana/<slug>` funcionan en un alojamiento estático, incluso sin reglas de reescritura de rutas. Los dos ejemplos neutros son:

- `/#/espana/inversion-publica-gradual`
- `/#/espana/servicios-publicos-gradual`

Para añadir uno, declara `slug`, `title`, `question`, `description` y `scenario` en `src/ui/editorial-scenarios.ts`. `scenario` fija meses, semilla, perturbaciones y una función que parte de `baselinePolicy(base)` y devuelve una `Policy` validada. El texto debe plantear una pregunta y describir exactamente los controles modificados; no debe atribuir efectos causales externos ni presentar los resultados como predicciones. El botón «Modificar este escenario» abre los controles existentes.

## Compartir y tarjeta

En navegadores compatibles, la acción principal intenta `navigator.share()`. «Opciones» siempre ofrece «Copiar enlace», WhatsApp, X y «Descargar imagen». Si el portapapeles falla, el enlace queda seleccionado en un campo de texto para copiarlo manualmente. La tarjeta PNG se dibuja en Canvas en el dispositivo, con cuatro indicadores deterministas si ya se avanzó el tiempo. No se envía a un servicio.

La página publica metadatos Open Graph y Twitter/X globales y `share-preview.png`. **Las URLs reproducen escenarios específicos, pero los crawlers sociales pueden mostrar una preview genérica porque la aplicación se ejecuta en cliente.** No existe generación dinámica de Open Graph por escenario.

## Eventos de crecimiento y privacidad

`src/ui/growth-events.ts` emite `CustomEvent('simulatupais:growth')` dentro del navegador. No hay proveedor configurado, envío de red, almacenamiento de eventos, cookies, fingerprinting ni PII. Una integración futura puede escuchar el evento y requiere una decisión de privacidad aparte. Eventos disponibles:

| Evento | Propiedades |
|---|---|
| `scenario_loaded` | `source` (`default`, `local`, `shared_url`, `editorial`), `country`, `horizon`, `scenario_version` |
| `simulation_started`, `simulation_completed` | `country`, `horizon`, `changed_decisions_count` |
| `share_clicked`, `share_completed` | `method` (`native`, `copy`, `whatsapp`, `x`) |
| `shared_scenario_opened`, `shared_scenario_modified`, `shared_scenario_simulated` | `country`, `horizon`, `scenario_version` |

`share_completed` solo se emite cuando Web Share resuelve o el portapapeles confirma la escritura. No se puede conocer si una persona terminó de publicar en WhatsApp o X. `shared_scenario_modified` se emite una vez al cambiar decisiones, semilla, perturbaciones u horizonte; `shared_scenario_simulated` se emite al completar el siguiente avance.

## Verificación

`tests/shared-scenario.test.mjs` cubre round-trips y rechazo de entradas; `tests/browser-share.mjs` ejecuta el bucle completo en Chromium de escritorio y móvil, con dos perfiles independientes y verificación de la sesión local. No se han cambiado ecuaciones, datos, parámetros ni referencias numéricas del motor.
