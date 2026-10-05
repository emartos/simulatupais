# Resumen del modelo y parámetros activos — 0.3.0

Base numérica: año 2025, catálogo `es-reviewed-2026-09-30.1`. Los cambios frente a 0.2.0 son de ecuación/semántica; no de calibración.

| Parámetro/regla | Valor activo | Tratamiento |
|---|---:|---|
| `productivityGrowth` | 0,003/año | tendencia exógena; no estimación estructural |
| `capitalElasticity` | 0,27 | HEURÍSTICA: escala crecimiento neto de K hacia capacidad; no estimada para España |
| `depreciation` | 0,04/año | se resta una vez en stock de capital |
| `capacityHeadroom` | 0,05 | margen de utilización transitoria del modelo, no capacidad ociosa española |
| `outputAdjustment` | 0,32/mes | conservado; output también limitado a demanda deseada |
| `capitalOutputRatio` | 3,2 | stock inicial sintético, conservado |

## Especificación

```text
K(t) = K(t−1) × (1 − depreciation/12) + investmentRealized(t)/12
gK(t) = ln(K(t)/K(t−1))
capacityGrowth(t) = productivity/12 + demographicGrowth×0.35/12
                    + 0.27×gK(t−1) + supplyShock(t)
target = min(demandDesired, capacity×1.05)
gdp = min(demandDesired, max(0, gdpPrevious + 0.32×(target−gdpPrevious)))
realization = clamp(gdp/demandDesired, 0, 1)
```

La depreciación actúa una vez mediante K. El crecimiento de K completado en el paso actual contribuye a la capacidad del siguiente paso. No se añade inversión bruta separadamente al canal de capital. No hay inventario técnico; el recorte de GDP a demanda preserva identidad de producto sin factores superiores a 1.

## Definición de gasto público

`services` se presenta como **Gasto corriente en servicios públicos**: provisión durante el periodo que aumenta gasto y demanda. No tiene retorno productivo directo, ni representa calidad o bienestar. `publicInvestment` conserva el canal separado de inversión → stock de capital → capacidad. No se introduce multiplicador de productividad para gasto corriente.
