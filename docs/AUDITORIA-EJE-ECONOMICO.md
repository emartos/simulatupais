# Auditoría del eje económico anterior

Este documento registra la auditoría de la presentación y fórmula absoluta originales. Sus conclusiones metodológicas siguen vigentes: normalizar niveles de política respecto a rangos no acredita por sí solo una interpretación ideológica. La implementación actual cambió la pregunta del indicador: resume cambios respecto a la configuración de partida con la convención versionada `economic-change-orientation` 2.0.0, en `src/ui/economic-axis-method.ts`. Esta nueva convención tampoco se presenta como validada.

## Implementación auditada

La función `economicProximity` de `src/core/policy.ts` generaba una coordenada y tres proximidades. La interfaz leía esa función en `src/main.ts`; el motor económico nunca la utilizó.

La coordenada tomaba la media con el mismo peso de cuatro entradas y la invertía:

```text
componentes = [
  (taxShift + 6) / 14,
  (progressivity + 4) / 10,
  (transfers + 25) / 60,
  (publicInvestment - 1) / 5
]
posición = limitar(1 - media(componentes), 0, 1)
proximidad = 100 * (1 - abs(posición - referencia))
referencias = [0, 0.5, 1]
```

Las entradas no eran niveles completos de impuestos o ayudas:

- `taxShift`: ajuste común, en puntos porcentuales, sobre tipos sintéticos de tres grupos de hogares.
- `progressivity`: ajuste de la separación entre grupos, también combinado con el ajuste anterior.
- `transfers`: variación porcentual del total de transferencias frente a su valor de partida.
- `publicInvestment`: proporción del PIB destinada a inversión pública.

Por eso los tres ceros significaban «sin variación adicional» y no ausencia de impuestos, de progresividad o de ayudas. La inversión pública inicial era un nivel, no un cambio.

La función dejaba fuera el impuesto medio sobre compras, el impuesto empresarial, los recursos de servicios, la fricción de inversión y los parámetros institucionales. Los rangos procedían de `BOUNDS` en `src/core/policy.ts`, compartidos por la validación y los controles de la aplicación. Eran límites de los parámetros del simulador, no referencias ideológicas independientes. Los cuatro términos recibían un peso igual y la coordenada se limitaba a 0–1.

La documentación anterior describía referencias sintéticas en 0, 0,5 y 1, pero no aportaba fuentes, validación o una regla que justificara llamar a esos anclajes «izquierda», «centro» y «derecha». Tampoco justificaba pesos iguales entre dimensiones. Esa ausencia impide sostener la interpretación política mediante la explicación de la fórmula.

## Prueba diagnóstica de sensibilidad

Para la configuración económica predeterminada (`taxShift=0`, `progressivity=0`, `transfers=0`, `publicInvestment=3`), los rangos anteriores daban componentes aproximados `0,4286`, `0,4`, `0,4167` y `0,4`. La coordenada resultaba `0,5887` y las proximidades redondeadas eran `41 %`, `91 %` y `59 %`.

En el ensayo aislado de la prueba unitaria se conservó esa misma configuración y se cambiaron únicamente los límites usados para normalizar: `taxShift [-7,7]`, `progressivity [-5,5]`, `transfers [-30,30]` e inversión pública `[0,6]`. Los cuatro componentes pasaron a `0,5`; la coordenada pasó a `0,5` y las proximidades a `50 %`, `100 %` y `50 %`. Los controles reales, la sesión y el motor no se modificaron en el ensayo. Esto demuestra sensibilidad a los límites elegidos, no un cambio real de decisiones ni una conclusión sobre la ubicación política adecuada.

## Interpretación vigente

La interfaz mantiene el resumen factual de los ocho controles aplicados respecto a la configuración predeterminada de la sesión. El eje ya no calcula la orientación desde niveles absolutos: parte de los deltas aplicados de cinco dimensiones; una coincidencia exacta con el punto de partida no recibe marcador. Los cuatro parámetros de la fórmula antigua quedan registrados arriba solo como auditoría histórica.

La convención experimental de cambios está versionada como `economic-change-orientation` 2.0.0. Sus escalas fijas y pesos iguales se declaran convenciones descriptivas y se aplican a diferencias respecto a la referencia; no leen los límites visibles de los controles. Su validación metodológica sigue pendiente. No es una medición validada de ideología de personas, partidos o países y no forma parte del funcionamiento económico del simulador. Los parámetros ambiguos quedan excluidos y se explican en la ayuda pública.
