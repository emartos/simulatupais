---
name: model-integrity
description: Preserve economic semantics and reproducibility when a task touches the 0.3.0 engine, policies, country data, presets or simulation results.
---

# Integridad del modelo

- Antes de cambiar cálculo o semántica, lee `docs/MODELO.md`, `docs/model-validation/` y los tipos/constantes de `src/core/` afectados.
- Conserva distinciones: `services` es gasto corriente, `publicInvestment` es inversión, `transfers` son transferencias monetarias; porcentajes y puntos porcentuales no son intercambiables.
- Una misma política, catálogo, semilla y shocks debe producir la misma trayectoria, sea cual sea su entrada (manual, cuestionario o preset). La procedencia política no es una variable causal.
- Una bifurcación conserva exactamente la historia previa; las decisiones nuevas actúan desde el paso siguiente. No atribuyas efectos retrospectivos.
- Si se autoriza un cambio económico, actualiza documentación, pruebas y referencias con una explicación causal. Si no se autoriza, no cambies ecuaciones, parámetros, seeds, shocks ni goldens.
- Comprueba `npm run test:regression` para cambios que puedan tocar resultados. Una regresión diferente exige diagnóstico antes de actualizar valores esperados.
