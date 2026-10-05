---
name: code-style
description: Apply the repository's TypeScript, JavaScript, CSS and Spanish UI conventions when implementing or refactoring code in Simula tu país.
---

# Estilo de código

- Usa módulos ES y respeta TypeScript estricto (`tsconfig.json`, incluido `noUncheckedIndexedAccess`). Las importaciones TypeScript entre archivos locales usan la extensión `.js` que tendrá el archivo compilado.
- Busca primero una función, tipo, token CSS o patrón existente antes de introducir otro. Mantén cambios pequeños y cercanos al módulo responsable.
- Conserva nombres de dominio y unidades inequívocas; el modelo usa porcentajes y puntos porcentuales en lugares distintos. No conviertas unidades implícitamente.
- Mantén los textos visibles en español y el nombre **Simula tu país**. No traslades terminología interna a la primera capa de la interfaz sin necesidad.
- En HTML construido con plantillas, escapa todo dato externo mediante `esc()` o usa `textContent`. Conserva atributos y nombres accesibles de los controles.
- En CSS, reutiliza variables, componentes y reglas responsivas existentes. Evita un estilo global nuevo para resolver un caso local.
- No reformatees archivos ajenos al cambio. El repositorio no tiene formateador obligatorio: sigue el estilo circundante y comprueba el diff.
