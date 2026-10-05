# Contexto del proyecto

**Simula tu país** es una aplicación estática de simulación económica que se ejecuta en el navegador. España es la primera implementación; el objetivo arquitectónico es integrar futuros países en el mismo repositorio, aunque el código actual sigue acoplado a España. Los resultados son escenarios de un modelo simplificado, no predicciones. La interfaz pública está en español.

## Mapa rápido

| Área | Ubicación | Responsabilidad |
|---|---|---|
| Modelo y cálculo | `src/core/` | Políticas, datos, motor, semilla, estados y sesiones |
| Trabajo en segundo plano | `src/worker.ts` | Ejecuta cálculos fuera del hilo de interfaz |
| Interfaz | `src/main.ts`, `src/ui/`, `public/` | Flujos, gráficos, estilos y almacenamiento local |
| Presets políticos | `src/political-presets/`, `docs/political-presets/` | Catálogo, validación, codificación y procedencia |
| Datos de partida | `public/data/spain.json` | Catálogo de España y sus referencias |
| Build | `scripts/build.mjs`, `scripts/project-config.mjs` | Compilación y metadatos de versión/repositorio |
| Pruebas | `tests/`, `docs/playbook/` | Unitarias, navegador y regresión económica |

La versión del **modelo** se declara en `src/core/model.ts` (`0.3.0` en este estado). La versión del paquete en `package.json` es independiente. El build incorpora el SHA completo desde `SOURCE_COMMIT` o `GITHUB_SHA`; si no se proporciona, usa Git solo con el árbol limpio. Sin SHA verificable, la interfaz no debe fingir una versión exacta.

Las sesiones se guardan en IndexedDB y pueden exportarse/importarse como JSON. La importación valida versión, catálogo, políticas y metadatos antes de restaurar. Los presets son datos versionados: se aplican como políticas editables y su origen no interviene en el cálculo. Una comparación conserva la historia anterior al mes de bifurcación y admite como máximo dos trayectorias activas.

## Herramientas y comprobaciones

- `npm run build` o `make build`: compila TypeScript y genera `dist/`.
- `npm test`: compila y ejecuta `tests/*.test.mjs` con `node:test`.
- `npm run test:regression`: verifica las recetas y referencias de `docs/playbook/`.
- `npm run test:browser`: ejecuta pruebas reales con Chromium por CDP. Usa `CHROMIUM` si el binario no está en `/snap/bin/chromium`.
- `npm run check:data`: valida el catálogo de datos.
- `git diff --check`: detecta errores de whitespace en el cambio.

`dist/`, `artifacts/` y `node_modules/` están ignorados. Las capturas E2E se generan en `artifacts/`. No actualices referencias económicas solo para hacer pasar una regresión: primero determina si hubo un cambio de modelo autorizado.

## Fuentes de verdad

- `README.md`: uso, alcance y licencia PolyForm Noncommercial 1.0.0.
- `CONTRIBUTING.md`: política de incorporación de países.
- `docs/MODELO.md` y `docs/model-validation/`: semántica y límites del modelo.
- `docs/POLITICAL-PRESETS.md` y `docs/political-presets/`: método, fuentes y revisión de presets.
- `docs/VERIFICABILIDAD.md`: trazabilidad entre build y código.
