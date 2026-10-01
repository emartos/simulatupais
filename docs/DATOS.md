# Datos y revisiones

El catálogo `public/data/spain.json` conserva registros normalizados con fuente, fecha de publicación, periodo original, unidad, condición observada/estimada/proyectada y notas. Se incluyen dos ejercicios con catorce variables cada uno, no un recolector universal.

Las fuentes primarias consultadas y los valores usados se enumeran en `FUENTES.md`, generado desde el propio catálogo. La pantalla Datos y fuentes muestra exclusivamente los registros seleccionados para el ejercicio inicial.

## Decisiones de armonización

- Los componentes de demanda se toman de una misma revisión de la Contabilidad Nacional y se convierten de millones a miles de millones de euros.
- Los stocks demográficos de 1 de enero se utilizan como cierre del ejercicio anterior. La fecha original sigue visible.
- Ocupación y paro son medias anuales, no cifras de diciembre.
- Inflación es diciembre/diciembre, no la media anual. La prehistoria mensual del modelo es una inicialización hipotética.
- El ratio de deuda se recalcula utilizando la deuda absoluta y el PIB de la fotografía. No se mezcla un ratio publicado con otra revisión del denominador. Puede diferir del ratio de la nota del Banco de España.
- El balance demográfico se deriva de los recuentos de nacimientos, fallecimientos y población del catálogo. No se copia un saldo de un titular que no concilie con esos recuentos.

## Actualización controlada

1. Consultar y verificar las series originales. Conservar unidad, periodo, cobertura, naturaleza y versión de cada nueva observación. No etiquetar una previsión como un dato observado.
2. Añadir los registros normalizados y asignar una nueva versión de catálogo y fecha de revisión. No sobrescribir el paquete que se necesita para reproducir experimentos antiguos.
3. Ejecutar `npm run check:data`, `npm test` y `npm run build`. El validador admite una ruta alternativa: `node scripts/check-data.mjs ruta/al/catalogo.json`.
4. Revisar el año seleccionado y las notas de armonización. Si solo existe un indicador nuevo, el año base no debe desplazarse.
5. Publicar una nueva versión estática y conservar la anterior.

La validación automática comprueba estructura, unidades básicas y coherencia. **No verifica por sí sola la veracidad de un dato, descarga series ni sustituye la revisión de la fuente.**

Los hashes SHA-256 del catálogo y del archivo de parámetros se incluyen en `dist/build-info.json`. Las sesiones utilizan adicionalmente una huella no criptográfica para detectar incompatibilidades accidentales; no es una firma de autenticidad.
