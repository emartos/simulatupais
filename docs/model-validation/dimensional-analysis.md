# Auditoría dimensional estática — modelo 0.1.0

Convenciones: EQ y variables se definen en [model-equations.md](model-equations.md); parámetros en [model-parameters.md](model-parameters.md). Resultado es una revisión de tipos/unidades en el código, no una modificación. `ECON-xxx` enlaza con [findings.md](findings.md).

| EQ | Comprobación dimensional | Resultado / observación |
|---|---|---|
| EQ-001 | flujo monetario − flujo + flujo = flujo; todos en mil millones EUR/año nominales | Coherente aritméticamente. Los agregados son sintéticos. |
| EQ-002 | C, servicios, inversión y X−M en mil millones EUR constantes/año | Coherente por cierre impuesto. Catálogo concilia las partidas base. |
| EQ-003 | stock personas + flujos personas/mes | Coherente al dividir tasas anuales por 12. Residuo se deriva de periodos de población no idénticos. |
| EQ-004 | flujos gasto/ingreso mismo tipo nominal anualizado | Coherente como definición de saldo. |
| EQ-005 | stock EUR + flujo EUR/año ÷ meses/año | Coherente en unidades; el déficit se interpreta como tasa anual mantenida durante un mes. |
| EQ-006 | stock deuda / flujo anualizado PIB ×100 | Ratio convencional stock/flujo con unidad temporal implícita de año. No es error dimensional, debe etiquetarse al interpretar. |
| EQ-007 | componentes del PIB mismo total/unidad | Selector verifica; distinto periodo de los dos registros de población no entra a esta identidad. |
| EQ-008 | PIB nominal anualizado × cuotas | Unidades fluyen como ingreso anualizado nominal. PAR-001/002 son adimensionales. |
| EQ-009 | tasa base + pp/100; gross × tasa | Coherente. PAR-006 recorta tasa. `progressivity` parece “pp parámetro”, y el código lo convierte por 100. |
| EQ-010 | PIB nominal × shares × factor variación | Flujo nominal anualizado. El control transfer está rotulado como variación porcentual, no pp PIB. |
| EQ-011 | disposable nominal × propensión; luego `/consumerPrice` | Consumo deseado aparece primero en unidad nominal y se divide por índice para usar demanda real. Índice relativo sin base explícita, dimensionalmente adimensional. |
| EQ-012 | flujo EUR/año ×10⁹ / personas | EUR/persona/año. El precio índice hace ajuste real, no conversión monetaria. |
| EQ-013 | (1+tasas)/(1+tasa) | Tasas adimensionales; factor de precios adimensional. Pass-through completo es una regla. |
| EQ-014 | inversión base real × ratios × factores | Flujo real anualizado. Tasa corporativa expresada como fracción en fórmula. Fricción es un porcentaje adicional tratado en el exponente. |
| EQ-015 | PIB real flujo × fracción | Flujo real anualizado. Política servicios y público inv se interpretan como participaciones de PIB. |
| EQ-016 | flujos comerciales comparables y factores adimensionales | Demanda agregada real anualizada. La tendencia es anual compuesta con exponent `month/12`. |
| EQ-017 | personas × razón anual ÷12 | personas por mes acumuladas a stock. Observaciones vitales de 2025 frente población actual enero 2026: ECON-003. |
| EQ-018 | `investment/12/capital` tiene unidad 1/año por paso; resto del exponente adimensional | Compatible formalmente con `exp`; el término `0,04/12` es tasa por paso. Interpretación coeficiente/capital discutible, ECON-004. |
| EQ-019 | objetivo y PIB mismo flujo real; realización ratio | Coherente; factor común impone identidad EQ-002. Desborde de capacidad genera aviso. |
| EQ-020 | brecha y shocks adimensionales; inflación tasa anual | Coherente como tasas fraccionales anuales en ecuación subyacente. La división en precio productor `/12` produce cambio mensual aproximado. |
| EQ-021 | cociente de índices − 1 | Tasa fraccional interanual, luego `Point` ×100. 13 valores = 12 intervalos. |
| EQ-022 | PIB anualizado relativo anualizado; coeficiente; división 12 para paso | Tasa de paro fraccional por mes. Sin empleo/salario de flujo que identifique la conversión. |
| EQ-023 | ingresos de hogares, impuestos y PIB×shares | Todos nominales anualizados; política consumo usa impuesto incluido `τ/(1+τ)`. Sin cuenta oficial para conciliar. |
| EQ-024 | deuda stock × tasa anual = flujo anual; gasto flujos | Coherente si PAR-041 se entiende anual. Servicios/inversión pública reales se convierten a nominales con precio productor; transferencias ya nominales. |
| EQ-025 | déficit nominal anualizado ÷12 a stock nominal | Coherente formalmente. La deuda/activos operan como stock neto simplificado. |
| EQ-026 | capital stock × depreciation/12 + inversión anualizada/12 | Coherente si depreciación anual y flujo de inversión medido en unidades de capital. La equivalencia empírica entre inversión total observada y stock sintético no está demostrada. |
| EQ-027 | consumo agregado al mismo nivel; capital/PIB produce años | Escala adimensional. `priceMemory` usa índice adimensional e inflación fraccional. |
| EQ-028 | U adimensional × shock calibrado como fracción | Dimensión consistente en las entradas, no evidencia sobre distribución/amplitud real. |
| EQ-029 | meses enteros/recetas y estados | Regla temporal técnica, sin conversión física. |
| EQ-030 | Asignaciones de mes cero heredan unidades fuente; capital = PIB×años; memoria de tasas genera índice | Coherencia aritmética; capital e inversión pública son construcciones y precio/memoria inicial no es una serie observada. |

## Casos a revisar, sin corregir

- **ECON-001:** niveles nominales, reales y partidas fiscales se aproximan mediante un único índice productor/consumidor; deflactor y precios sectoriales no existen.
- **ECON-002:** deuda/PIB combina un stock al cierre con una tasa anualizada. Interpretación requiere mantener denominador temporal visible.
- **ECON-003:** el balance mensual convierte datos vitales año 2025 y poblaciones 2025-01/2026-01 en una tasa fija.
- **ECON-004:** stock de capital se expresa como mil millones EUR constantes; `investment/capital` es tasa de rendimiento/renovación proxy, aunque inversión agregada no se define como formación de capital neta con trazabilidad sectorial.
- **ECON-005:** `growth=ln(Yt/Yt−1)*12` anualiza crecimiento mensual exacto logarítmico; desempleo resta productividad anual y crecimiento poblacional anual antes de `/12`. Es consistente bajo tasas log/pequeñas, pero no una equivalencia dimensional observada.
- **ECON-006:** en EQ-011 consumo del hogar deriva de renta nominal, se divide por precio para demanda real; recaudación consumo luego multiplica consumo realizado por precio y extrae impuesto incluido. Dimensionalmente concilia el valor nominal, pero depende de qué “consumo” represente el flujo de catálogo.

La búsqueda no encontró una multiplicación errónea por 100 del desempleo/inflación: internamente fracción, se muestra porcentaje. Unidades de los campos observados se declaran en el JSON; no se consultaron fuentes externas para comprobarlas.
