# Fase 2 EXPRESS — Frente A: producción, capacidad, inversión y capital

## Decisión ejecutiva

Los cinco valores de `model 0.1.0` no proceden de estimaciones documentadas para España. La evidencia respalda la importancia de productividad, capital, utilización, impuestos y restricciones empresariales, pero no valida estas cinco funciones reducidas ni sus coeficientes exactos. Para `0.2.0` se recomienda reemplazar las cifras estructurales inventadas por magnitudes observables/estimables y, donde no quepa esa evidencia en el MVP, mantener la regla claramente etiquetada como heurística. No hay base para presentar los valores actuales como calibrados.

“Rango defendible” distingue un rango estimado para la misma variable de cifras de escenarios que solo sirven para sensibilidad. No se fuerza un valor único cuando las definiciones o periodos no son comparables. Las propuestas de esta nota son inferencias de diseño a partir de las fuentes; no son estimaciones propias ni cambios ejecutados.

## A1 — Crecimiento potencial/productividad

| Campo | Evaluación |
|---|---|
| Implementación actual | En `capacityGrowth`: `exp(0.009/12 + 0.35 × popGrowth/12 + capitalTerm + supplyShock)`. PAR-021 = 0,9 % anual se añade como productividad exógena constante. También se resta como tendencia de productividad al actualizar desempleo. No se estima a partir del estado o de los datos del catálogo. |
| Qué pretende representar | Tendencia de eficiencia/productividad que sostiene el crecimiento de la capacidad sin requerir aumento de población o capital. En términos cercanos a la estadística de crecimiento, se parece a una tendencia de PTF, aunque no es un residuo de Solow calculado: la fórmula no descuenta explícitamente utilización cíclica. |
| Evidencia encontrada | **Directa, España:** Banco de España estima PTF potencial por separado de utilización; su media para 2021–2028 es cercana a **0,3 %**, y escenarios de largo plazo van de próxima a 0 % a >0,8 %. No valida exactamente el término del código, pero no respalda 0,9 % como central fijo. **Inferencia propia:** 0,3 % es mejor candidato provisional; 0–0,8 % representa escenarios distintos, no intervalo estadístico. |
| Ámbito | España. |
| Rango defendible | No hay un intervalo estadístico transferible directamente al PAR-021. Como referencias de escenarios españoles: próximo a 0 % (escenario de convergencia débil) a algo más de 0,8 % (persistencia del promedio reciente alto). Periodos y filtros distintos impiden llamarlo rango de confianza. |
| Valor central defendible | **0,3 % anual como candidato provisional** para una regla de tendencia en horizonte medio; no es una estimación estructural para cada año ni debe mezclarse con crecimiento potencial total. |
| Confianza | **MEDIA** para la dirección de revisión y orden de magnitud por escenarios; baja para trasladar exactamente el número a esta capacidad simplificada. |
| Diagnóstico | **RECALIBRAR** el valor si se conserva la interpretación PTF; preferiblemente separar productividad de utilización en futuras versiones. |
| Propuesta 0.2.0 | Usar 0,3 % como base provisional y 0–0,8 % solo como escenarios, no intervalo estadístico. Separar utilización cíclica; si no, etiquetar la tendencia como exógena y simplificada. |
| Impacto esperado | **ALTO**: se acumula exponencialmente y entra directamente en capacidad durante todo el horizonte. |
| Fuentes | Banco de España, *Estimación del crecimiento potencial de la economía española: una revisión metodológica*, Documentos Ocasionales 2604 (2026), en particular §§3.3, 4 y 5; [PDF y resultados](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosOcasionales/26/Fich/do2604.pdf). La Comisión describe una metodología de producción potencial descompuesta y horizontes diferenciados, no una constante universal de productividad: [EUCAM 2026](https://economy-finance.ec.europa.eu/publications/eus-commonly-agreed-production-function-methodology-estimating-potential-output-eucam_en). |

## A2 — Stock de capital inicial y depreciación

| Campo | Evaluación |
|---|---|
| Implementación actual | `capital(0) = GDP_cat × 3.2`; cada mes `K(t)=K(t−1)×(1−0.04/12)+investmentRealized(t)/12`. PAR-024 es el cociente capital/PIB inicial 3,2 años; PAR-023 aplica depreciación geométrica homogénea de 4 % anual a todo el capital. No hay stock inicial observado en el catálogo. |
| Qué pretende representar | El capital productivo inicial y la pérdida mensual de capacidad del stock por desgaste/obsolescencia normal. |
| Evidencia encontrada | **Directa, España:** Banco de España construye stocks con inversión y depreciación por tipo de activo (tasas EUKLEMS); la composición también afecta productividad. **Directa, UE:** Eurostat define consumo de capital fijo por desgaste/obsolescencia normal, no como tasa universal. AMECO ofrece stock neto real y ratio capital/PIB. Estas fuentes apoyan el método, no validan 3,2 o 4 % agregados. |
| Ámbito | España para el método de estimación; definiciones y cuentas armonizadas UE. |
| Rango defendible | No hay una tasa única defendible sin composición de activos y periodo. El 3,2 no se debe tratar como rango empírico: contrastarlo con stock neto AMECO/Eurostat del año elegido y documentar diferencias de cobertura, base de precios y definición de PIB. |
| Valor central defendible | Ninguno para depreciación agregada con lo consultado. Para el capital inicial, usar el stock oficial comparable en vez de fijar un multiplicador arbitrario sería un dato de inicialización, no un “valor central” de una elasticidad. |
| Confianza | **BAJA** para evaluar los números 3,2 y 4 %; **ALTA** en que el procedimiento agregado actual omite elementos esenciales de medición. |
| Diagnóstico | **REFORMULAR** inicialización y depreciación como stock de activos construido/derivado por clases. |
| Propuesta 0.2.0 | Inicializar con stock neto real oficial comparable; si no hay serie compatible, etiquetar 3,2 como supuesto. Calcular depreciación por activo (CFC/stock) y ponderar composición; mantener 4 % solo como heurística provisional. |
| Impacto esperado | **ALTO**: capital inicial escala el término inversión/capital y la productividad futura; depreciación se acumula cada mes. |
| Fuentes | Banco de España, DO 2604, §3.2 y ec. (11), utiliza inventario perpetuo y tasas EUKLEMS por activo: [PDF](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosOcasionales/26/Fich/do2604.pdf). Eurostat, metadatos de cuentas de capital fijo y consumo de capital fijo: [nama_10_nfa](https://ec.europa.eu/eurostat/cache/metadata/EN/nama_10_nfa_esms_es.htm). Comisión Europea, [AMECO: stock neto de capital, CFC e inversión](https://economy-finance.ec.europa.eu/economic-research-and-databases/economic-databases/ameco-database/download-annual-data-set-macro-economic-database-ameco_en). |

## A3 — Contribución de inversión/capital a capacidad

| Campo | Evaluación |
|---|---|
| Implementación actual | `gKcapacity = 0.27 × (investment(t−1)/12/capital(t−1) − 0.04/12)`, dentro del exponente de crecimiento mensual de capacidad. PAR-022 = 0,27. La inversión es flujo anualizado dividido por 12; el capital, stock. |
| Qué pretende representar | La parte de la acumulación neta de capital que se transmite al crecimiento potencial. Al multiplicar crecimiento neto del stock por 0,27, el coeficiente opera como participación/elasticidad del capital en una regla de crecimiento, no como una elasticidad de PIB estimada dentro de la aplicación. |
| Evidencia encontrada | **Directa, España:** la metodología del Banco de España usa producción Cobb–Douglas y participación en remuneración factorial para ponderar la contribución de capital; usa cuentas nacionales y distingue activos. Apoya el enfoque de contribuciones, no este 0,27, que no se deriva de rentas ni composición. **Inferencia propia:** no importar coeficientes de otros países/modelos. |
| Ámbito | España. |
| Rango defendible | No se identifica un intervalo del parámetro 0,27 que sea equivalente al parámetro de código. La estimación oficial calcula participaciones temporales y ajustadas, no una constante directamente intercambiable. |
| Valor central defendible | No se puede defender un número con las fuentes disponibles. |
| Confianza | **BAJA** para valor; **MEDIA** para preferir una contribución basada en participación factorial frente a coeficiente opaco. |
| Diagnóstico | **REFORMULAR** la interpretación/estimación del coeficiente; mantener la acumulación neta como parte contable posible. |
| Propuesta 0.2.0 | Ponderar el crecimiento neto del capital con participación factorial española documentada, incluido el tratamiento de rentas mixtas. Hasta estimarla, mantener 0,27 solo como heurística, no como elasticidad observada. |
| Impacto esperado | **ALTO**: multiplica la acumulación neta y determina cuánto se traduce en capacidad futura. |
| Fuentes | Banco de España, DO 2604, ec. (1)–(4): función de producción, participaciones de factores y crecimiento por contribuciones; [PDF](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosOcasionales/26/Fich/do2604.pdf). Como contraste de marco común, Comisión Europea, [EUCAM 2026](https://economy-finance.ec.europa.eu/publications/eus-commonly-agreed-production-function-methodology-estimating-potential-output-eucam_en). |

## A4 — Ajuste de producción frente a demanda/capacidad

| Campo | Evaluación |
|---|---|
| Implementación actual | `target=min(demand, capacity×1.05)` y `Y(t)=Y(t−1)+0.32×(target−Y(t−1))`. PAR-026 = 0,32 por paso mensual; PAR-025 limita el objetivo a 105 % de capacidad. No se estima una senda de utilización ni se usa un indicador observado de restricciones de oferta. |
| Qué pretende representar | Convergencia parcial de producción hacia demanda, con un margen fijo de capacidad para permitir que el producto supere temporalmente su proxy de potencial. |
| Evidencia encontrada | **Directa, España:** Banco de España estima por separado utilización cíclica y PTF con series/indicadores; señala incertidumbre en potencial y output gap. No propone techo 105 % ni ajuste mensual fijo. EBAE encuentra menor inversión con capacidad ociosa, pero no estima esta velocidad. **Inferencia propia:** si el target se mantiene, 0,32 mensual implica semivida de brecha ≈1,8 meses y cierre del 90 % en ≈6 meses; aritmética de la regla, no estimación. |
| Ámbito | España. |
| Rango defendible | No se encuentra rango empírico para 0,32/mes o 1,05 en la misma definición. El output gap no equivale directamente a “demanda sobre capacidad” del modelo; no imponer un intervalo numérico por analogía. |
| Valor central defendible | Ninguno. |
| Confianza | **MEDIA** en que debe separarse utilización cíclica y capacidad potencial; **BAJA** sobre números alternativos concretos. |
| Diagnóstico | **REFORMULAR** la regla si se va a interpretar como producción potencial/cierre de demanda. |
| Propuesta 0.2.0 | Separar producto, potencial y utilización. Sin una estimación de output gap, conservar 0,32/mes y 1,05 solo como heurísticas explícitas; no reemplazar el techo por otro porcentaje arbitrario. |
| Impacto esperado | **ALTO**: regula casi todos los flujos realizados y limita directamente producto frente a capacidad. |
| Fuentes | Banco de España, DO 2604, §§3.3 y 4: utilización cíclica separada de PTF y estimada con indicadores; [PDF](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosOcasionales/26/Fich/do2604.pdf). Banco de España, encuesta EBAE de inversión empresarial: empresas con capacidad ociosa declaran menor dinamismo inversor; [artículo 2025/T1-02](https://www.bde.es/wbe/es/publicaciones/analisis-economico-investigacion/boletin-economico/2025t1-articulo-02-la-debilidad-de-la-inversion-empresarial-en-espana-tras-la-pandemia-un-analisis-basado-en-la-ebae.html). |

## A5 — Inversión privada frente a impuesto de sociedades y fricción

| Campo | Evaluación |
|---|---|
| Implementación actual | `Ipriv(t)=(Ibase−Ybase×0.03)×capacity(t−1)/Ybase×[((1−τ)/(1−0.20))^1.25]×exp(−3×friction/100)`. PAR-016 = 1,25 y PAR-017 = 3. `τ` y `friction` se expresan como puntos porcentuales en los controles. No hay tipo de interés, coste de uso de capital, depreciación fiscal/bonificación, flujo de caja, restricción crediticia, heterogeneidad ni retardo de decisión en esta función. |
| Qué pretende representar | El factor de impuesto aproxima el rendimiento después de impuestos relativo a la referencia de 20 %. El exponencial representa una reducción multiplicativa de inversión al aumentar una fricción sintética. |
| Evidencia encontrada | **Directa, España:** EBAE identifica incertidumbre/regulación y capacidad ociosa como condicionantes; un panel español más antiguo considera coste financiero y restricciones crediticias. No valida el PAR-017. **Proxy OCDE:** paneles encuentran relación negativa entre fiscalidad efectiva e inversión, pero heterogénea por firmas/activos/diseño y menor tras la crisis. No valida exponentes 1,25 o 3. **Inferencia propia:** cerca de τ=20 %, +1 pp implica aprox. −1,56 % de inversión por la fórmula; +1 pp de fricción, −2,96 %. Son derivadas locales del código, no estimaciones españolas. |
| Ámbito | España para obstáculos y panel histórico; OCDE internacional para relación tributación-inversión. |
| Rango defendible | No hay rango defendible para 1,25 o 3 en la misma especificación. La evidencia sostiene signos medios negativos en algunos diseños, pero no una elasticidad homogénea ni el índice de fricción usado aquí. |
| Valor central defendible | Ninguno. |
| Confianza | **MEDIA** en el signo negativo de un mayor coste tributario/obstáculo, condicionado a diseño; **BAJA** para los valores y la función actuales. |
| Diagnóstico | **REFORMULAR** como mecanismo de inversión de firmas con coste de uso y financiación; si se mantiene la función simplificada, declararla **HEURÍSTICA**. |
| Propuesta 0.2.0 | No sustituirlos por cifras no comparables. Mantener la regla como heurística explícita. Calibrar después la respuesta al coste de uso efectivo (impuestos, depreciación y financiación); definir fricción mediante indicador observable o retirar su interpretación. |
| Impacto esperado | **ALTO** para nivel y composición de inversión; transmisión a capital y producto es acumulativa. |
| Fuentes | Banco de España, EBAE 2025/T1-02, obstáculos y capacidad ociosa: [publicación](https://www.bde.es/wbe/es/publicaciones/analisis-economico-investigacion/boletin-economico/2025t1-articulo-02-la-debilidad-de-la-inversion-empresarial-en-espana-tras-la-pandemia-un-analisis-basado-en-la-ebae.html). Banco de España, *Inversión y costes financieros: Evidencia en España con datos de panel* (1995), trata coste de financiación y restricciones de crédito, muestra histórica y no directamente trasladable: [PDF](https://www.bde.es/f/webbde/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosTrabajo/95/Fich/dt9506.pdf). OCDE, *How does corporate taxation affect business investment?* (2022): asociación negativa pero heterogénea y menor sensibilidad posterior a la crisis; [informe](https://doi.org/10.1787/04e682d7-en). |

## Tabla de decisión

| Relación | Actual | Propuesta 0.2.0 | Decisión | Confianza |
|---|---|---|---|---|
| A1 Productividad | 0,9 % anual fijo en capacidad | Base candidata 0,3 % PTF; escenarios 0–0,8 % separados de utilización, sin llamar al rango estadístico | RECALIBRAR | MEDIA |
| A2 Capital y depreciación | K₀=3,2×PIB; δ=4 % anual homogénea | Stock inicial oficial comparable; depreciación por activo/CFC; si no, mantener números solo como supuestos explícitos | REFORMULAR | BAJA |
| A3 Capital→capacidad | 0,27×inversión neta/capital | Ponderar acumulación neta con participación factorial española documentada; no fijar cifra hasta medirla | REFORMULAR | BAJA |
| A4 Producción | ajuste 0,32 mensual; target ≤105 % capacidad | Separar utilización cíclica del potencial; mientras, valores como heurística; no inventar otro techo | REFORMULAR | MEDIA (forma); baja (coeficientes) |
| A5 Inversión privada | exponente fiscal 1,25; fricción exp(−3·f/100) | Dirección negativa plausible, elasticidades no identificadas; conservar solo como heurística o reestimar con coste de uso/financiación española | REFORMULAR / HEURÍSTICA provisional | MEDIA (signo), baja (números) |

## Cambios recomendados para 0.2.0

1. Separar explícitamente PTF tendencial, capital y utilización cíclica; revisar el 0,9 % frente a escenarios españoles del Banco de España.
2. Sustituir el capital inicial sintético por stock neto comparable y estimar depreciación con inversión/CFC por tipo de activo; si no se puede, etiquetar 3,2 y 4 % como hipótesis.
3. Hacer que la contribución del capital provenga de una participación factorial documentada; conservar 0,27 solo como parámetro de escenario hasta obtenerla.
4. Declarar el ajuste mensual 0,32 y el techo 105 % como heurísticas, o reformularlos cuando haya una serie española de utilización/output gap compatible.
5. No afirmar elasticidades empíricas de inversión: reformular alrededor de coste de uso, impuestos efectivos, financiación y fricciones observables; mantener los multiplicadores actuales solo como aproximación transparente.
