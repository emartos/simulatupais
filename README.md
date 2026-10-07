# Simula tu país

Aplicación estática para explorar una simulación económica simplificada. España es la primera implementación de **Simula tu país**, un proyecto diseñado para incorporar progresivamente otros países en un repositorio y una arquitectura comunes. No ofrece predicciones ni recomendaciones. No contiene IA, cuentas, backend de aplicación, telemetría ni pagos. El cálculo corre en un Web Worker del navegador y el guardado usa IndexedDB local.

## Un proyecto común para varios países

El objetivo es que cada nuevo país se integre en Simula tu país y reutilice el motor y los componentes comunes. Así podemos compartir mejoras y mantener una experiencia y metodología coherentes, reduciendo divergencias entre implementaciones. La arquitectura actual todavía contiene acoplamientos específicos con España; esta es una dirección de evolución, no una capacidad multinacional ya disponible.

¿Quieres proponer otro país? [Abre una propuesta en GitHub Issues](https://github.com/emartos/simulatupais/issues/new?template=propuesta-nuevo-pais.yml) o consulta [cómo colaborar](CONTRIBUTING.md) antes de empezar una implementación extensa. Preferimos coordinarla e incorporarla al proyecto común. Un fork temporal para preparar una contribución es perfectamente válido; mantener una versión independiente y divergente no es el modelo de colaboración recomendado.

## Arranque

Requiere Node.js 20 o posterior para servir localmente:

```bash
npm run build
npm start
```

Abre `http://127.0.0.1:5173`. No abras `dist/index.html` con `file://`. Para usar el build estático no hace falta instalar dependencias de ejecución.

## Publicación

Publica el contenido de `dist/`; no publiques `public/` directamente. El build agrupa la aplicación y combina sus hojas de estilo para evitar la cascada de módulos y CSS observada en la versión de producción. Cada compilación regenera `dist/` desde cero para que no queden módulos obsoletos de builds anteriores.

Gate de release para cualquier runtime público: **1)** `npm run build`, **2)** tests y regresión, **3)** `npm run replay:archive` para un runtime nuevo o `npm run replay:verify` si el ID ya está archivado y sólo cambió la interfaz, **4)** verificar `public/replay/runtime-manifest.json`, **5)** build y E2E del runtime archivado, **6)** desplegar `dist/`. El snapshot debe entrar en la misma release que genere sus enlaces; no se reconstruye meses después. Revisa [Durabilidad de enlaces](docs/ESCENARIOS-COMPARTIBLES.md#durabilidad-de-enlaces) antes de cambiar motor, dataset o restauración.

## Uso

Empieza en «Tu simulación», ajusta Economía, Instituciones u Opciones avanzadas y avanza uno o doce meses. «Configurar con preguntas» es una ruta opcional; también puedes editar directamente. Los procedimientos institucionales generan eventos descriptivos, pero no tienen efectos económicos cuantificados.

Al iniciar una trayectoria, sus reglas pasadas quedan fijadas. «Comparar otra configuración» conserva la trayectoria elegida y crea la segunda desde su fecha visible; las nuevas reglas surten efecto en el paso siguiente. «Crear nueva simulación» vuelve a los datos y parámetros iniciales del catálogo. Ambas acciones permiten cancelar y exportar antes de confirmar. Hay un máximo de dos trayectorias activas.

El catálogo determina el ejercicio base admisible; no se fija un año en el código. La aplicación puede avanzar hasta 240 meses desde ese punto. Las magnitudes iniciales sintéticas y los resultados del modelo no son datos oficiales.

## Sesiones y privacidad

La sesión se guarda en este navegador y dispositivo. No se sincroniza. Borrar los datos del sitio o usar navegación privada puede eliminarla. Exporta un JSON para conservar una copia. La importación valida versión matemática, catálogo, semilla, políticas y recetas; una sesión incompatible se rechaza sin reemplazar el estado cargado.

La versión de la aplicación/modelo y la versión/revisión del catálogo se muestran por separado en el pie. Una semilla reproduce los mismos acontecimientos externos con iguales datos y reglas; no garantiza iguales resultados con políticas diferentes.

## Compartir escenarios

Tras configurar y avanzar una simulación, «Compartir escenario» genera un enlace compacto y versionado, ligado a un runtime inmutable, que permite a otra persona recalcular la misma configuración y los mismos resultados en su navegador. También se puede copiar el enlace, abrir las opciones de WhatsApp o X y descargar una tarjeta PNG creada localmente. Quien recibe el enlace puede modificar decisiones y compartir su variante. El enlace tiene prioridad para esa apertura y no sustituye la sesión local que ya estuviera guardada.

Hay dos escenarios de demostración declarados en el repositorio: [inversión pública gradual](https://simulatupais.org/#/espana/inversion-publica-gradual) y [servicios públicos graduales](https://simulatupais.org/#/espana/servicios-publicos-gradual). La URL codifica solo condiciones de simulación, sin nombres, identificadores personales ni resultados calculados. Los eventos de crecimiento son locales y no se envían a ningún proveedor. El formato, sus límites de compatibilidad, las reglas editoriales y la preview social genérica se explican en [Escenarios compartibles](docs/ESCENARIOS-COMPARTIBLES.md).

## Verificación

```bash
npm test                 # compila y ejecuta pruebas unitarias, de motor, datos, sesión y worker
npm run test:regression  # compara las recetas fijadas de PLAYBOOK con tolerancias e identidades
npm run test:browser     # Chromium real por HTTP, Web Worker e IndexedDB (CDP nativo)
npm run test:full        # ejecuta los tres comandos anteriores en secuencia
```

Las regresiones históricas solo comprueban que esta versión conserva resultados de sus recetas; no son una validación económica independiente. Las pruebas aritméticas independientes cubren identidades y unidades. La validez empírica de coeficientes y supuestos requiere evidencia externa y no se demuestra con esta suite. El test de navegador actual cubre el recorrido visible de comparación y guardado en Chromium. Firefox, cuestionario, importación/migración desde interfaz, geometría SVG/CSV y algunas ayudas aún no están automatizados.

Consulta [PLAYBOOK](docs/playbook/PLAYBOOK.md) para recetas, valores de referencia, fechas y límites metodológicos, y el [informe de ejecución](docs/playbook/INFORME-EJECUCION.md) para estados PASS/BLOQUEADO, capturas y pendientes. En la aplicación, «Cómo funciona» describe ecuaciones y unidades; «Datos y fuentes» detalla procedencia y periodos.

## Alcance metodológico

Simula tu país calcula mecanismos económicos simplificados y describe algunos procedimientos institucionales. No simula todos los efectos de todos los sistemas políticos ni reproduce íntegramente la economía española. Distribuciones de hogares, stocks iniciales sintéticos y respuestas económicas son hipótesis; los agregados observados o estimados se identifican en Datos y fuentes. Los resultados finitos no prueban plausibilidad.

## Licencia

El código de Simula tu país se distribuye bajo PolyForm Noncommercial License 1.0.0. Consulta el archivo [LICENSE](LICENSE) para conocer los permisos y condiciones aplicables.

Para usos comerciales no cubiertos por esta licencia, contacta con los responsables del proyecto para acordar una licencia comercial independiente.
