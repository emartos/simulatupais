---
name: unit-testing
description: Add or maintain focused Node.js unit and regression tests for domain logic, sessions, presets, formatting and worker behavior in Simula tu país.
---

# Pruebas unitarias

- Usa `node:test` y `node:assert/strict` en `tests/*.test.mjs`. `npm test` compila primero; las pruebas importan desde `dist/app/` cuando verifican TypeScript compilado.
- Prueba comportamiento observable e invariantes, no detalles de implementación ni textos completos salvo que el copy sea el requisito.
- Para el motor, controla política, semilla, catálogo y shocks. Compara estados o trayectorias completos cuando se exige invariancia. Distingue igualdad exacta de tolerancias numéricas justificadas.
- Cubre límites y entradas inválidas para políticas, presets y sesiones; comprueba que un fallo no se corrige silenciosamente ni destruye una sesión válida.
- Para presets, verifica que el origen es metadato: la misma `Policy` debe producir el mismo cálculo y la misma posición del indicador económico sin importar el actor.
- Si una prueba de regresión económica falla, identifica la causa antes de cambiar una referencia. No regeneres goldens para ocultar una diferencia.
- Ejecuta la prueba enfocada durante el cambio y la suite relevante al terminar cuando el encargo pida verificación.
