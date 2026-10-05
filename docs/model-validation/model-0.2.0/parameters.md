# Registro activo de parámetros económicos — modelo 0.2.0

Este inventario describe los valores que usa src/core/model.ts en el modelo activo. El registro ejecutable PARAMETER_REGISTRY del mismo archivo contiene para cada clave su valor, unidad, versión, categoría, descripción y referencia documental. Los valores de catálogo se documentan por separado en baseline-spain.md; no deben confundirse con supuestos del modelo.

| Grupo | Claves y valores activos | Categoría / interpretación |
|---|---|---|
| Hogares y fiscalidad sintética | grossIncomeShare=0.66; transferGDPShare=0.17; populationShares=[0.4,0.4,0.2]; incomeShares=[0.18,0.4,0.42]; transferShares=[0.55,0.35,0.1]; effectiveIncomeTaxes=[0.08,0.18,0.28]; consumptionPropensity=[0.94,0.83,0.62]; baselineConsumptionTax=0.11; baselineCorporateTax=0.20; baselinePublicInvestment=0.03; corporateProfitShare=0.25; socialContributionShare=0.10; otherRevenueShare=0.045 | HEURISTICO o DERIVADO cuando la escala algebraica concilia el total inicial. No representan deciles, tipos IRPF ni presupuesto SEC observados. |
| Productividad, capital e inversión | productivityGrowth=0.003/año; capitalOutputRatio=3.2 años; depreciation=0.04/año; capitalElasticity=0.27; investmentReturnElasticity=1.25; frictionElasticity=3; outputAdjustment=0.32/mes; capacityHeadroom=0.05 | Productividad: candidato provisional apoyado en referencia española del BdE, no estimación estructural propia ni crecimiento potencial total (LITERATURA). Los otros mecanismos conservados son HEURISTICO. |
| Precios | inflationAnchor=0.02; inflationPersistence=0.97/mes; gapPriceResponse=0.10; consumptionTaxPassThrough=0.50; energyPriceExposure=0.16; minInflation=-0.04; maxInflation=0.30 | Ancla nominal como referencia (LITERATURA); persistencia, respuesta, pass-through, exposición y topes son heurísticos. La brecha demanda/capacidad es un proxy, no un output gap observado. |
| Empleo | okunCoefficient=0.22; minUnemployment=0.015; maxUnemployment=0.45 | HEURISTICO. El coeficiente es una regla reducida de sensibilidad del desempleo al crecimiento; no se presenta como coeficiente de Okun estimado para España. |
| Exterior | externalDemandExposure=0.35; externalDemandGrowth=0.02/año; importDemandElasticity=1 | HEURISTICO. Exportaciones al 2 % son una tendencia de escenario, no una previsión. Elasticidad importadora unitaria simplificada. Sin tipo de cambio nacional, precios relativos ni composición comercial. |
| Finanzas públicas e incertidumbre | debtInterest=0.025/año; eventMonthlyChance=0.10/mes | HEURISTICO. El primero es un coste fijo; el segundo parametriza perturbaciones sintéticas y no es probabilidad empírica. |

## Registro de cambios respecto a 0.1.0

| Parámetro o regla | 0.1.0 | 0.2.0 | Categoría y decisión |
|---|---:|---:|---|
| Productividad tendencial | 0,9 % anual | 0,3 % anual | Candidato provisional asociado a BdE; simplificación exógena. |
| Sensibilidad de desempleo | 0,22 | 0,22 | Se conserva como regla reducida, sin equivalencia española estimada. |
| Respuesta de inflación a brecha | 0,20 | 0,10 | Heurística central; ancla 2 % sin cambio. |
| Persistencia mensual | 0,85 | 0,97 | Elección provisional de escala temporal, no estimación española. |
| Pass-through de impuesto al consumo | 100 % del cambio mecánico | 50 % | Heurística central aplicada al nivel una vez. |
| Control progressivity | multiplicadores −0,5/0/+1 | cambio del diferencial alto menos bajo en pp | Nueva unidad pública/interna; topes originales permanecen. |
| Capital, capacidad e inversión | valores de diseño | mismos valores | Se etiquetan expresamente como heurística. |
| Tendencia exterior/importación | 2 % anual / 1 | mismos valores | Escenario tendencial / respuesta agregada simplificada. |

## Deuda económica prioritaria

1. Sustituir las cuotas sintéticas de hogares por agrupaciones construidas con cuantiles observables compatibles.
2. Anclar ingresos, gastos, intereses y saldo fiscal inicial a una fotografía S.13 de cuentas públicas.
3. Definir transferencias monetarias observadas sin equipararlas a todo el gasto social.
4. Definir servicios públicos iniciales con una rúbrica observada compatible.
5. Revisar el residuo demográfico y el bloque agregado de utilización/capacidad en una versión futura.

La documentación de la versión anterior se conserva en docs/INVENTARIO-ECONOMICO-MODELO-0.1.0.md y en docs/playbook/evidencias/resultados-model-0.1.0.json; ambas son evidencia histórica, no especificación activa.
