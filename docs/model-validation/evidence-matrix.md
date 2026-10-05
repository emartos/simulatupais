# Matriz de ecuaciones y evidencia

`Evidencia actual` valora evidencia económica sobre la relación. La repetibilidad de software y las aserciones de identidad se indican en la justificación, pero no se confunden con validación empírica. Fuente de fórmulas: [model-equations.md](model-equations.md); fuente de parámetros: [model-parameters.md](model-parameters.md).

| EQ | Tipo | Evidencia actual | Fuente actual | Validación externa | Prioridad |
|---|---|---|---|---|---|
| EQ-001 | IDENTIDAD | FUERTE | balance aritmético en código/validador | no aplica a identidad; verificar definiciones de componentes | baja |
| EQ-002 | IDENTIDAD | FUERTE | cierre impuesto por motor y validador | validar concepto/unidades, no igualdad | baja |
| EQ-003 | IDENTIDAD | PARCIAL | identidad de suma; residual interpretativo | demografía/fuentes y alineación temporal | media |
| EQ-004 | IDENTIDAD | FUERTE | definición gasto menos ingreso | contrastar componentes fiscales | media |
| EQ-005 | IDENTIDAD | FUERTE | conciliación neta codificada/validador | balances y alcance de cuentas | alta |
| EQ-006 | IDENTIDAD | FUERTE | división aritmética stock/flujo | definición de KPI comparable | media |
| EQ-007 | IDENTIDAD | PARCIAL | condición de selección catálogo | consistencia metodológica/fuentes originales | media |
| EQ-008 | HEURISTICA | NINGUNA | shares de código | distribución ingresos/cuentas hogares | alta |
| EQ-009 | HEURISTICA | NINGUNA | tasas y mapeo de tres grupos | fiscalidad efectiva/distribución por grupos | alta |
| EQ-010 | HEURISTICA | NINGUNA | transferencia base y reparto supuestos | transferencias/cuentas de hogares | alta |
| EQ-011 | HEURISTICA | PARCIAL | conciliación solo del agregado inicial | MPC/consumo por grupos y tiempo | alta |
| EQ-012 | TECNICA | PARCIAL | cálculo dimensional directo | validez representativa de renta sintética | media |
| EQ-013 | HEURISTICA | NINGUNA | wedge algebraico 11 % a política | pass-through y bases de impuestos aplicables | alta |
| EQ-014 | HEURISTICA | NINGUNA | fórmula de inversión y coeficientes | datos de inversión/beneficios/costes | alta |
| EQ-015 | HEURISTICA | NINGUNA | porcentaje de PIB de política | gasto público/productividad/servicios | alta |
| EQ-016 | HEURISTICA | NINGUNA | tendencia y regla importadora | comercio exterior real/precios/tipo cambio | alta |
| EQ-017 | HEURISTICA | PARCIAL | reproduce algebraicamente población actual-previa | proyección demográfica y componentes | media |
| EQ-018 | HEURISTICA | NINGUNA | regla de capacidad | productividad, capital y capacidad | alta |
| EQ-019 | HEURISTICA | NINGUNA | ajuste 0,32, límite 5 %, factor común | producción/utilización/capacidad | alta |
| EQ-020 | HEURISTICA | NINGUNA | reglas parametrizadas sin estimación | inflación, brecha, shocks y transmisión energética | alta |
| EQ-021 | TECNICA | PARCIAL | cociente interanual estándar sobre índice sintético | revisar base/efecto del wedge tributario | media |
| EQ-022 | HEURISTICA | NINGUNA | coeficiente 0,22 y regla de código | empleo, participación, crecimiento y frecuencia | alta |
| EQ-023 | HEURISTICA | NINGUNA | participaciones fiscales sintéticas | cuentas públicas observadas y bases fiscales | alta |
| EQ-024 | HEURISTICA | NINGUNA | tasa fija de deuda y gasto sintético | tipos/stock/registro fiscal | alta |
| EQ-025 | HEURISTICA | PARCIAL | conciliación de stock neto; activos abstractos | emisión, tenedores, balances y financiación | alta |
| EQ-026 | HEURISTICA | PARCIAL | forma de acumulación simple; sin calibración stock | depreciación y capital/inversión coherente | alta |
| EQ-027 | CALIBRADA / TECNICA | PARCIAL | escala de consumo algebraica; resto de inicialización técnica | composición inicial y memoria real de precios | media |
| EQ-028 | TECNICA | FUERTE algoritmo / NINGUNA distribución económica | hash de código determinista | justificar distribución/impacto de incertidumbre | media |
| EQ-029 | TECNICA | FUERTE respecto a semántica de código | receta temporal/bifurcación | no aplica a validez macro | baja |
| EQ-030 | TECNICA | PARCIAL | asignaciones iniciales reproducibles, con componentes sintéticos | revisar definición y periodos del baseline | media |

Ninguna relación se clasifica `EMPIRICA`: el repositorio no documenta estimación o fuente que respalde esa relación concreta.
