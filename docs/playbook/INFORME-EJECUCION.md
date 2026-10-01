# Informe de ejecución — revisión de claridad y flujo

## Identificación

- Aplicación/modelo: 0.1.0 (sin cambios matemáticos intencionales).
- Catálogo fijado: `es-reviewed-2026-09-30.1`, huella `68504b65`.
- Semilla de las recetas históricas: 1847.
- Año base de esas recetas: 2025, derivado del catálogo fijado.
- Datos: fixtures locales versionados; sin peticiones a fuentes en vivo.
- El directorio fuente no tiene metadatos Git utilizables. El diff comparativo se generó frente al ZIP `polis-espana-v0.1.0.zip`; se excluyeron `dist/`, dependencias y capturas binarias.

## Ejecuciones

| ID | Comando/recorrido | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| UNIT-01 | `npm test` | Build y 45 pruebas verdes | 45/45; 0 fallos | PASS |
| REG-01 | `npm run test:regression` | 7 recetas, 27 fechas; tolerancia absoluta 1e-8 + relativa 1e-10; identidades | 3282 comparaciones, siete casos verdes; valor interno `services=19.201875489641495` preservado | PASS |
| E2E-CHR-01 | `npm run test:browser` | HTTP + worker/IndexedDB nativos, comparar/cambiar/avanzar/recargar | Chrome 153.0.8010.47; errores de consola/página capturados: `[]`; aviso 360/390/1280 px; guardado y pausa restaurados | PASS |
| E2E-FX-01 | Firefox, suite solicitada | Misma ruta integral en Firefox | No existe runner/configuración Firefox en este proyecto; no se instaló dependencia ni se elevó permiso | BLOQUEADO |
| E2E-VIEWS-01 | Tabla/tooltip/CSV/geometría SVG para seis métricas | Oráculo numérico y geométrico independiente | No automatizado en este alcance ejecutado | BLOQUEADO |
| E2E-WIZ-01 | Seis respuestas, equivalencia manual, mantener exacto, atrás/cancelar | Mapeos deterministas y equivalentes | Se capturó la pantalla inicial del cuestionario; recorrido y equivalencias no quedaron automatizados | BLOQUEADO |
| E2E-IMPORT-01 | UI: exportar/importar, migrar v1, rechazo sin pérdida | Persistencia y compatibilidad comprobadas en contexto real | La suite de motor/regresión prueba recetas/restauración y versiones; flujo UI y reapertura de contexto no se probaron | BLOQUEADO |
| FULL-01 | `npm run test:full` consolidado | Build + unitarias + regresión + Chromium | Se detuvo en la compilación porque TypeScript recibió `EROFS` escribiendo `dist/app/*`; las tres suites ya se habían ejecutado individualmente con PASS antes del intento consolidado | BLOQUEADO |
| DOC-C-01 | Validez empírica | Evidencia independiente de representatividad | No evaluada; la suite de software no la demuestra | Fuera de verificación |

Las capturas del test de navegador están en `artifacts/`: `polis-inicio-1280.png`, `polis-cuestionario-1280.png`, `polis-simulacion-unica-1280.png`, `polis-comparacion-1280.png`, `polis-dialogo-comparacion-1280.png`, `polis-ayuda-guardado-1280.png`, `polis-acerca-1280.png`, `bifurcacion-360.png` y `bifurcacion-1280.png`. Se generaron contra el build servido por HTTP; la suite no configura datos simulados en la página. La compilación se completó por separado antes de `FULL-01`; esta limitación del comando consolidado no se disimuló ni se reintentó con permisos elevados.

## Corrección y regresión

Se mantuvieron los resultados esperados del playbook. `test:regression` valida A/B idénticas, impuestos directos +4 pp, consumo efectivo 15 % sin capitalización mensual, coste adicional de inversión +4 pp, impuestos +4 pp con transferencias +20 %, mandato de 24 meses y bifurcación en mes 12 con cambios aplicados desde mes 13. Comprueba historial, eventos, entradas de mecanismos y los meses fijados. El playbook separa estas regresiones del oráculo aritmético independiente y de la validez empírica.

La importación actual valida versiones, semilla, políticas y recetas, y admite explícitamente schema 1/2. La regresión de los siete fixtures históricos pasó tras migración/restauración. No se afirma que la importación desde el panel se haya probado end-to-end.

## Pendientes que requieren trabajo humano/técnico

1. Añadir runner de navegador compatible con Chromium y Firefox y fijarlo en el lockfile como dependencia de desarrollo; no se hizo porque el proyecto solo disponía de CDP/Chromium nativo y esta ejecución no descargó navegadores.
2. Automatizar la matriz completa del encargo: cuestionario frente a controles, doble activación/worker pendiente, migración en UI, import/export, reapertura persistente, horizonte, ayudas por ratón/teclado/táctil, seis métricas en tarjetas/tabla/tooltip/CSV y geometría SVG.
3. Proporcionar los trece comentarios UX fuente. El único documento encontrado es el prompt del encargo, que pide relacionarlos pero no enumera trece comentarios separados; no se inventó esa correspondencia.
4. Revisar visualmente las capturas antes de considerarlas aprobadas por diseño.
5. Evaluar empíricamente los supuestos y coeficientes con fuentes y metodología independientes. Ningún resultado aquí constituye validación económica.

## Arranque y comandos

Desde la raíz `/var/www/html/polis`:

```bash
npm run build
npm start
```

Abrir `http://127.0.0.1:5173`. Las verificaciones ejecutadas fueron `npm test`, `npm run test:regression` y `npm run test:browser`. `npm run test:full` encadena esas mismas pruebas, pero no se ejecutó como comando único. Firefox y los casos pendientes arriba requieren intervención técnica; no hay despliegue ni publicación.
