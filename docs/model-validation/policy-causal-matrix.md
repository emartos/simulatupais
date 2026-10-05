# Matriz causal de controles económicos

Recorrido estructural desde configuración `Policy` a las fórmulas ejecutadas. El `Point` KPI corresponde a tarjeta/serie. “Directo” significa aparece en la ecuación indicada; “indirecto” sigue dependencias posteriores. No se infiere causalidad empírica.

| Control | Variable inmediata | Efectos posteriores implementados | Retardos | EQ | KPI afectados |
|---|---|---|---|---|---|
| `taxShift` | tipos efectivos por grupo → impuesto y renta disponible | consumo deseado → demanda/PIB; impuesto directo → ingreso público/déficit/deuda; poder adquisitivo | renta usa PIB nominal `t−1`; consumo/PIB y fiscal del paso; deuda acumula 1/12 mensual | EQ-009, 011, 019, 022–025 | **directo:** capacidad de compra, ingresos públicos; **indirecto:** producción, inflación, paro, deuda/PIB, inversión |
| `progressivity` | tipos de grupos extremos por m=(-0,5,0,1), con clamps | renta disponible/consumo; impuestos y presupuesto; resto de cadena de demanda y deuda | como taxShift | EQ-009, 011, 019, 022–025 | capacidad de compra; indirectamente producción, inflación, paro, deuda/PIB, inversión. Grupo medio no cambia su tasa vía progressivity |
| `consumptionTax` | factor precio consumidor frente 11 % | renta real/poder adquisitivo y consumo deseado; impuesto consumo; demanda/PIB, inflación medida por IPC y finanzas | cambio de nivel contemporáneo; precio anual/interanual responde memoria 13 niveles; deuda acumula | EQ-013, 011, 019, 021, 023–025 | directa: capacidad de compra, inflación medida, recaudación; indirecta: producción, paro, deuda/PIB, inversión |
| `corporateTax` | factor de rentabilidad retenida | inversión privada deseada → demanda/realización, inversión y capital → capacidad futura; recaudación corporativa | inversión en paso vigente, capital mismo paso; efecto sobre capacidad usa stock/inversión previos, al menos 1 mes | EQ-014, 016, 018–019, 023–026 | inversión, producción; indirectos: capacidad de compra, inflación, paro, deuda/PIB |
| `transfers` | transferencias por grupo/renta disponible | consumo deseado → demanda y producción; gasto público → déficit/deuda; poder adquisitivo | renta basada en PIB nominal `t−1`; consumo/producción mismo paso; deuda acumulada mensual | EQ-010–012, 019, 022–025 | capacidad de compra; indirectos: producción, inflación, paro, deuda/PIB, inversión por realización común |
| `publicInvestment` | inversión pública deseada | demanda/producto, flujo de inversión total, capital futuro; gasto público | demanda contemporánea; capital se acumula `/12`; capacidad responde desde paso posterior | EQ-015–019, 024–026 | inversión, producción; indirectos: capacidad de compra, inflación, paro, deuda/PIB |
| `services` | servicios deseados | demanda/producto y gasto público; factor realización común puede escalar demás componentes | contemporáneo; deuda mensual | EQ-015–016, 019, 024–025 | producción; indirectamente inflación, paro, deuda/PIB, inversión/capacidad de compra por cierre |
| `investmentFriction` | factor `exp(-3×friction/100)` en inversión privada deseada | demanda, realización, inversión total, capital y capacidad futura; base tributaria corporativa no cambia | inversión en paso vigente; capital luego; capacidad recibe efecto del stock/inversión previo | EQ-014, 016, 018–019, 026 | inversión y producción; indirectos: capacidad de compra, inflación, paro, deuda/PIB |

## Recorrido por capas

`UI` de controles económicos → `data-policy` actualiza la copia de `Policy`; al confirmar, `configureBranch` registra política vigente/fecha; `advance` llama al Worker/motor `stepState`; el control alimenta EQ señalada; estados derivados llegan a `point()` como seis KPI. La tabla se basa en código, no una nueva prueba de causalidad estadística.

## Efectos inexistentes como mecanismo directo

Ningún control modifica salarios, horas, tasas de interés de mercado, calidad de servicios, productividad pública específica, tipo de cambio o respuestas monetarias. Una KPI puede moverse indirectamente por el cierre común y por las ecuaciones encadenadas; esa coincidencia no identifica el canal como efecto observado real.
