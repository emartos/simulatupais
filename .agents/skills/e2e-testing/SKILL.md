---
name: e2e-testing
description: Build or update real-browser E2E coverage for Simula tu país using its existing Chromium CDP harness and local HTTP server.
---

# Pruebas de navegador

- Reutiliza `tests/browser-cdp.mjs` y `tests/browser-scenarios.mjs`; el proyecto usa Chromium/CDP, no un framework E2E adicional.
- Ejecuta sobre `dist/` servido por HTTP (`scripts/serve.mjs`), no con `file://`. `npm run test:browser` es el recorrido completo; establece `CHROMIUM` si cambia la ruta del ejecutable.
- Verifica el efecto de la interacción, no solo que un botón exista: borrador editable, bifurcación sin alterar meses anteriores, importación/exportación, ausencia de errores de página y estados visibles.
- Prueba teclado y tamaños relevantes cuando cambie una interfaz. Detecta desbordamientos en móvil; comprueba que diálogos y detalles tengan nombres y orden de foco utilizables.
- Usa datos y semillas deterministas. Espera condiciones de la página en lugar de retardos fijos cuando sea posible.
- Guarda capturas de evidencia en `artifacts/`, que está ignorado. No sustituyas una comprobación funcional por una captura.
