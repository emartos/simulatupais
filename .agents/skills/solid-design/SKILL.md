---
name: solid-design
description: Use pragmatic SOLID principles when changing module boundaries or extending behavior in Simula tu país; avoid architecture work for small local edits.
---

# Diseño y responsabilidades

- Separa cálculo económico (`src/core/`), orquestación de interfaz (`src/main.ts` y `src/ui/`), validación/datos de presets (`src/political-presets/`) y persistencia. El motor recibe `Policy` y datos, sin conocer nombres de actores políticos ni elementos DOM.
- Haz que cada módulo tenga una razón clara para cambiar. Extrae lógica cuando exista una segunda necesidad real o cuando una unidad ya sea difícil de verificar; no crees interfaces o capas por anticipado.
- Extiende flujos mediante tipos y funciones existentes antes de añadir ramas paralelas. Mantén la misma semántica de política para entrada manual, cuestionario y preset.
- Depende de contratos explícitos en los límites: `unknown` entra por validadores, los módulos internos usan tipos concretos. No pases objetos de UI sin validar al motor.
- Prefiere funciones puras para transformaciones y cálculos verificables. Inyecta tiempo, semilla o entradas externas solo cuando ayude a controlar un efecto real en pruebas.
- Revisa compatibilidad de sesiones y datos antes de cambiar un contrato público. Una refactorización no debe reescribir historias guardadas ni alterar resultados numéricos por accidente.
