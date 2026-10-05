---
name: security-review
description: Review trust boundaries in Simula tu país when changing JSON import, browser storage, HTML rendering, external links, build metadata or source assets.
---

# Seguridad del producto

- Trata archivos de sesión importados, catálogos, presets y metadatos de origen como datos no confiables. Valida forma, tipos, rangos, versiones, referencias y URLs antes de usar o guardar.
- Mantén `validateSession`, `validatePolicy` y `validatePoliticalPreset` como fronteras explícitas. Un error de importación no debe reemplazar el estado actual.
- En HTML dinámico, usa `textContent` o `esc()` para valores procedentes de datos. Revisa atributos URL y clases interpoladas; no introduzcas `eval` ni ejecución de texto importado.
- Conserva el cálculo local y el almacenamiento en el navegador. No añadas telemetría, servicios externos, credenciales ni dependencias de red sin una necesidad autorizada.
- Las URLs de commits requieren un SHA completo válido; las URLs de logos en runtime deben ser assets locales con procedencia oficial documentada. No construyas destinos externos desde texto libre del usuario.
- Para cambios de seguridad, añade pruebas de rechazo y comprueba que los flujos válidos siguen funcionando. Documenta riesgos reales; evita afirmaciones de seguridad absoluta.
