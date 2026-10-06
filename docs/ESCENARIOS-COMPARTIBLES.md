# Escenarios compartibles

## Enlaces y reproducción

El botón «Compartir escenario» produce una URL `/?v=1&s=<payload>`. `v` es la versión del esquema público. `s` es JSON UTF-8 codificado como Base64 URL-safe. El JSON es una matriz con orden explícito: país, año base, versión del motor y catálogo, huella del catálogo, semilla, opción de perturbaciones, mes alcanzado, mes de bifurcación, trayectoria principal, indicador de comparación, trayectoria de origen, trayectoria visible y recetas de A/B. Cada receta contiene política inicial, cambios fechados y origen del calendario institucional. Las políticas usan el orden fijo declarado en `src/ui/shared-scenario.ts`.

La URL conserva las **condiciones necesarias para recalcular** la trayectoria, incluidos cambios posteriores a una bifurcación. No contiene resultados calculados, nombres de trayectorias, procedencia de presets, IDs de sesión, fechas de creación, preferencias visuales, datos de IndexedDB ni texto libre. La codificación facilita el transporte; no es cifrado. Quien reciba el enlace puede ver todas las decisiones codificadas.

Al abrir el enlace, se valida la versión, país, año, catálogo, semilla, opciones, meses y cada valor de política mediante `validateSession` y `validatePolicy`. Los parámetros desconocidos se ignoran. Una versión o receta incompatible muestra un error comprensible y abre la configuración inicial segura. No se reinterpretan enlaces con otro modelo o catálogo: una versión futura necesitará un decodificador explícito o conservar el build anterior.

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
