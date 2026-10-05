# Trazabilidad del código de una simulación

## Metadatos de build

`scripts/build.mjs` obtiene la versión de la aplicación de `package.json` y la versión del motor de `src/core/model.ts`. Para el commit usa `SOURCE_COMMIT` o `GITHUB_SHA` cuando el entorno de build los proporciona. En una compilación local sin esas variables, ejecuta `git rev-parse HEAD` solo si el árbol de trabajo está limpio. Si no hay un SHA fiable, escribe `null`.

El build reúne estos valores en `dist/build-info.json` y los inyecta en el bundle de la aplicación. El SHA completo queda en esos metadatos; la interfaz muestra solo sus siete primeros caracteres y construye el enlace `/commit/<SHA>` desde la URL de repositorio única definida en `scripts/project-config.mjs`. Una build local con cambios sin confirmar no atribuye esos cambios al último commit: muestra que el código no quedó registrado y conserva el enlace general al repositorio.

En CI y producción, el proceso debe conservar `GITHUB_SHA` (o definir `SOURCE_COMMIT` con el SHA exacto que se está construyendo). El JSON de build se genera en cada ejecución y se incluye en `dist`; no se debe sustituir por un valor manual.

## Sesiones guardadas

El JSON de sesión añade `engineBuild`, con la versión del motor y el SHA completo (o `null` si no se conoce). IndexedDB, la exportación e importación pasan por el mismo formato de sesión. Al restaurar o importar una sesión con metadatos, se conserva su referencia original al volver a guardarla; no se sustituye por la versión de la app que la abre.

Las sesiones anteriores que solo tienen `modelVersion` muestran esa versión del motor y «Código no registrado». No se les asigna un commit supuesto. Las sesiones antiguas siguen siendo objeto de las reglas de compatibilidad ya existentes para su versión de modelo.

## Configuración del repositorio

La URL base del repositorio y la ruta del archivo de licencia se mantienen en `scripts/project-config.mjs`. El build y la interfaz usan esa configuración para los enlaces generales, de commit y de licencia.
