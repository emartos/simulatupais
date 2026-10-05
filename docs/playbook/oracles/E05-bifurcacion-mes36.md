# Ficha de revisión de oráculo — E05, bifurcación en mes 36

## Decisión

**APROBADO para regresión reproducible del software.** Aprobación técnica de Codex, 4 de octubre de 2026; no hubo una segunda persona revisora. No constituye validación empírica ni aprobación de los supuestos económicos.

## Receta y referencia

- Modelo `0.3.0`; catálogo `es-reviewed-2026-09-30.1`, huella `68504b65`; año base 2025; semilla 1847.
- Ambas ramas parten de `docs/playbook/sesiones/00-base.json`, sin cambios hasta mes 36.
- Desde la UI se avanza a mes 36, se crea una comparación y se aplica P02 (`taxShift`: 0 → 4 pp) en el punto de bifurcación. Para mantener la convención de los goldens del playbook, la ficha denomina **A** a la trayectoria de origen y **B** a la alternativa; en la ejecución de esta UI corresponden a las ramas internas B y A, respectivamente.
- La política confirmada en el mes 36 entra en el paso siguiente: mes 37. Se comprueban meses 36, 37, 48 y 96 (`dic 2028`, `ene 2029`, `dic 2029`, `dic 2033`).
- El golden P07 de mes 12 se conserva sin cambios y no se extrapola ni reutiliza como golden de esta receta distinta.

## Procedencia y revisión del candidato

Los valores 0.3.0 se generan reproduciblemente desde una rama baseline hasta mes 36 y una alternativa desde el punto de bifurcación mediante `generar-oraculos-browser-0.3.0.mjs`. El test de navegador valida por separado el uso de controles públicos, conservación de historia, Worker e IndexedDB.

El golden conserva identidad exacta de ramas en el mes 36 y registra la trayectoria posterior bajo la ecuación de capital 0.3.0. En el CSV, `Tu simulación` es la serie A de referencia y `Alternativa` la serie B modificada; la prueba fija esta correspondencia expresamente.

El golden compañero conserva A y B con identidad explícita para las seis métricas. El test compara también tarjetas, filas y fechas. Los valores del CSV usan tolerancia relativa `1e-9`; la presentación usa media unidad de la última cifra visible (±0,05; capacidad de compra ±0,5 €).

## Límites

La revisión fija la conducta observable de esta versión. No valida los efectos económicos de P02 ni convierte la bifurcación en evidencia causal sobre España.
