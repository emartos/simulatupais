# Simula tu país

Aplicación estática para explorar una simulación económica simplificada de España. Descriptor: «Explora cómo cambia tu país». No ofrece predicciones ni recomendaciones. No contiene IA, cuentas, backend de aplicación, telemetría ni pagos. El cálculo corre en un Web Worker del navegador y el guardado usa IndexedDB local.

## Arranque

Requiere Node.js 20 o posterior para servir localmente:

```bash
npm run build
npm start
```

Abre `http://127.0.0.1:5173`. No abras `dist/index.html` con `file://`. Para usar el build estático no hace falta instalar dependencias de ejecución.

## Build de publicación

Publica el contenido de `dist/` después de ejecutar `npm run build`; no publiques `public/` directamente. El build agrupa la aplicación y combina sus hojas de estilo para evitar la cascada de módulos y CSS observada en la versión de producción. Cada compilación regenera `dist/` desde cero para que no queden módulos obsoletos de builds anteriores.

## Uso

Empieza en «Tu simulación», ajusta Economía, Instituciones u Opciones avanzadas y avanza uno o doce meses. «Configurar con preguntas» es una ruta opcional; también puedes editar directamente. Los procedimientos institucionales generan eventos descriptivos, pero no tienen efectos económicos cuantificados.

Al iniciar una trayectoria, sus reglas pasadas quedan fijadas. «Comparar otra configuración» conserva la trayectoria elegida y crea la segunda desde su fecha visible; las nuevas reglas surten efecto en el paso siguiente. «Crear nueva simulación» vuelve a los datos y parámetros iniciales del catálogo. Ambas acciones permiten cancelar y exportar antes de confirmar. Hay un máximo de dos trayectorias activas.

El catálogo determina el ejercicio base admisible; no se fija un año en el código. La aplicación puede avanzar hasta 240 meses desde ese punto. Las magnitudes iniciales sintéticas y los resultados del modelo no son datos oficiales.

## Sesiones y privacidad

La sesión se guarda en este navegador y dispositivo. No se sincroniza. Borrar los datos del sitio o usar navegación privada puede eliminarla. Exporta un JSON para conservar una copia. La importación valida versión matemática, catálogo, semilla, políticas y recetas; una sesión incompatible se rechaza sin reemplazar el estado cargado.

La versión de la aplicación/modelo y la versión/revisión del catálogo se muestran por separado en el pie. Una semilla reproduce los mismos acontecimientos externos con iguales datos y reglas; no garantiza iguales resultados con políticas diferentes.

## Verificación

```bash
npm test                 # compila y ejecuta pruebas unitarias, de motor, datos, sesión y worker
npm run test:regression  # compara las recetas fijadas de PLAYBOOK con tolerancias e identidades
npm run test:browser     # Chromium real por HTTP, Web Worker e IndexedDB (CDP nativo)
npm run test:full        # ejecuta los tres comandos anteriores en secuencia
```

Las regresiones históricas solo comprueban que esta versión conserva resultados de sus recetas; no son una validación económica independiente. Las pruebas aritméticas independientes cubren identidades y unidades. La validez empírica de coeficientes y supuestos requiere evidencia externa y no se demuestra con esta suite. El test de navegador actual cubre el recorrido visible de comparación y guardado en Chromium. Firefox, cuestionario, importación/migración desde interfaz, geometría SVG/CSV y algunas ayudas aún no están automatizados.

Consulta [PLAYBOOK](docs/playbook/PLAYBOOK.md) para recetas, valores de referencia, fechas y límites metodológicos, y el [informe de ejecución](docs/playbook/INFORME-EJECUCION.md) para estados PASS/BLOQUEADO, capturas y pendientes. En la aplicación, «Cómo funciona» describe ecuaciones y unidades; «Datos y fuentes» detalla procedencia y periodos.

## Despliegue Apache

El vhost para `simulatupais.org`, Certbot y Cloudflare está en [deploy/apache](deploy/apache/README.md).

## Alcance metodológico

Simula tu país calcula mecanismos económicos simplificados y describe algunos procedimientos institucionales. No simula todos los efectos de todos los sistemas políticos ni reproduce íntegramente la economía española. Distribuciones de hogares, stocks iniciales sintéticos y respuestas económicas son hipótesis; los agregados observados o estimados se identifican en Datos y fuentes. Los resultados finitos no prueban plausibilidad.
