# Verificación de la entrega 0.1.0

Fecha: 30 de septiembre de 2026.

## Resultado automático

**45 pruebas superadas; 0 fallos.** Compilación TypeScript estricta superada. Validador del catálogo superado.

Entorno: Node.js 22.16.0, TypeScript 5.8.3, Linux. Para resolver el compilador preinstalado se utilizó `TSC_PATH`; no es necesario en una instalación normal con `npm ci`.

- 43 casos del motor: cobertura temporal, rechazo de datos incompletos, identidades, impuestos y renta a ingresos constantes, reproducción, bifurcación, importación, separación de instituciones/eje descriptivo y cálculo, y matriz de extremos.
- 1 prueba del servidor HTTP: HTML, JavaScript, worker, JSON, CSS, MIME, CSP, GET/HEAD, rechazo de escritura y acceso fuera de la raíz.
- 1 prueba integrada del protocolo del worker en un hilo real de Node: iniciar, avanzar, rechazar configuración bloqueada, bifurcar, reconfigurar, avanzar, rechazar orden desconocida y recuperarse.

La matriz de extremos ejecuta veinte combinaciones de semilla y controles extremos durante 240 meses. Además se verifican identidades cada mes en una ejecución completa de veinte años. Esto detecta errores de implementación, no demuestra plausibilidad o validez causal.

El ensayo orientativo final de 240 meses con dos ramas tardó unos 21 ms en este entorno. No mide renderizado, serialización del worker ni rendimiento de teléfonos y no es una garantía de latencia.

Evidencia: `evidencias/pruebas-node.log` y `evidencias/catalogo.log`.

## Interfaz: comprobación limitada pero ejecutada

**22 comprobaciones superadas; 0 excepciones JavaScript no capturadas.** Chromium 144.0.7559.96 mediante Playwright; escritorio 1440 px y vistas móviles de 390 y 360 px. Sin desbordamiento horizontal de la página en esas anchuras. No son dispositivos móviles físicos.

Se ejercitaron la fecha inicial, los ocho controles, el eje descriptivo, avance manual y automático, bloqueo de configuración, feed, ecuaciones, diálogo de eventos, bifurcación, exportación/importación real de JSON, secciones de metodología y fuentes, pausa al ocultar documento y funcionamiento en memoria cuando IndexedDB no está disponible.

**Limitación importante:** la política del navegador de este entorno bloquea la navegación HTTP y las URL del worker. No se alteró esa política. La comprobación visual usó los módulos de la aplicación empaquetados e inyectados en una página vacía, con el mismo motor y un adaptador de mensajería en el hilo principal. Los datos se suministraron en memoria.

Por ello **no se ha completado una prueba end-to-end del despliegue HTTP, Web Worker nativo del navegador y escritura/recuperación real de IndexedDB en conjunto**. Las pruebas del servidor y del hilo de cálculo se ejecutaron separadamente, como se describe arriba. Las capturas son de la interfaz funcionando en ese entorno adaptado; el indicador "Solo en memoria" es consecuencia de que IndexedDB no está disponible en la página de prueba.

Evidencia: `evidencias/ui-harness.json`; capturas `vista-previa.png`, `escritorio.png` y `movil.png`. El adaptador de prueba no forma parte del código entregado para ejecución.

## Comprobación recomendada al abrir localmente

Arrancar el servidor incluido y comprobar que aparece "Sesión local", modificar B, avanzar, recargar y verificar el mismo mes. Exportar antes de borrar almacenamiento. Esta verificación pendiente no se presenta como realizada en este informe.

No se han probado Safari, Firefox, navegación privada, todos los servicios de hosting ni motores JavaScript alternativos. No se ha realizado auditoría econométrica ni validación externa del modelo.
