# Metodología de codificación estandarizada

**Versión:** 1.0.0 · **Elección:** Generales de España, 23 de julio de 2023 · **Modelo:** 0.3.0

## Qué representa un preset

Un preset convierte posiciones identificables en un programa electoral a los controles disponibles del simulador. No reproduce íntegramente el programa, no reconstruye su presupuesto y no estima el coste fiscal o macroeconómico de sus medidas. Los resultados son los del modelo 0.3.0 aplicado a esa configuración, no una predicción del programa ni de la actuación futura de su candidatura.

## Rúbrica común

Cada uno de los ocho controles usa la misma escala, basada solo en propuestas expresadas en el programa del 23J:

| Score | Posición | Conversión |
|---:|---|---|
| -2 | Reducción fuerte | Dos pasos existentes por debajo del baseline |
| -1 | Reducción | Un paso existente por debajo del baseline |
| 0 | Sin cambio material identificable | Baseline |
| +1 | Aumento | Un paso existente por encima del baseline |
| +2 | Aumento fuerte | Dos pasos existentes por encima del baseline |
| `null` | Sin evidencia suficiente | Se conserva el valor vigente |

Los pasos, límites, unidades y baseline proceden de los controles actuales (`BOUNDS` y `baselinePolicy`); no se añaden incrementos ni se cambian rangos. El conversor aplica el signo a la dirección semántica de cada control y respeta sus límites. Si el baseline coincide con un límite y una posición no puede representarse, ese control queda sin correspondencia en vez de fingir un cambio. Es el caso de reducir la fricción cuando su baseline y mínimo actuales son ambos cero.

`0` requiere una posición identificable de mantenimiento o una neutralidad direccional explícita. `UNMAPPED`/`null` significa que no hay evidencia suficiente para determinar la posición. No son equivalentes.

## Intensidad, evidencia y confianza

- `±1`: al menos una propuesta clara y material, o varias medidas menores alineadas, sin constituir una transformación amplia del área.
- `±2`: reforma estructural, paquete amplio coherente o cambio expresamente sustancial, justificado con medidas concretas.
- La confianza valora la claridad y el alcance del texto, no la probabilidad de que se cumpla ni la exactitud de sus consecuencias.

Cada posición tiene IDs de evidencia que remiten al inventario del actor, un razonamiento breve y un nivel `HIGH`, `MEDIUM` o `LOW`. Las posiciones no se infieren de la reputación, la historia, la familia ideológica, el nombre o la etiqueta del partido. La opinión del codificador queda en la justificación separada de la evidencia. La misma evidencia se somete a la misma rúbrica para todos los actores. No se suman euros, porcentajes heterogéneos ni costes.

Un mismo elemento no se usa para inferir dos canales salvo que el programa separe explícitamente componentes distintos. Las prestaciones monetarias se consideran en `transfers`; servicios en especie en `services`; capital público en `publicInvestment`. La codificación de `corporateTax` usa la dirección textual del programa sin convertir tipo nominal en efectivo. `investmentFriction` exige medidas operativas claras y mantiene un umbral conservador.

Los programas territoriales solo se codifican para controles estatales cuando la propia propuesta tiene alcance estatal. No se escala al conjunto de España una medida circunscrita a una comunidad o territorio.

## Relación con el cuestionario y los controles

La conversión de scores reutiliza el mismo baseline, rangos y paso que la configuración manual y el cuestionario. Las opciones cualitativas del cuestionario codifican los mismos scores; una secuencia equivalente de respuestas y de posiciones programáticas produce la misma `Policy`. `services` ofrece solo una intensidad positiva/negativa y neutral, según las opciones existentes. Los controles `corporateTax` e `investmentFriction` usan internamente la misma escala aunque el cuestionario visible no pregunte por ellos.

Una posición codificada se almacena internamente como `APPROXIMATED` con `mappingMethod: STANDARDIZED_CODING` por compatibilidad del esquema histórico. La interfaz la llama **Interpretación estandarizada del programa**, nunca estimación fiscal. `DOCUMENTED + DIRECT` queda reservado para una equivalencia numérica literal. `UNMAPPED + NONE` no aplica un valor.

## Revisión

La codificación 23J para el modelo 0.3.0 cuenta con una primera revisión humana cerrada, recogida en [la tabla de revisión 23J](23J-2023-CODING-REVIEW.md). Consulta también el [informe por control](23J-2023-MAPPING.md) y los JSON versionados en `coding/`. Para añadir o revisar un actor, fija elección y versión, registra evidencia oficial y localizadores, codifica los ocho controles con esta misma regla y somete los resultados a revisión humana antes de considerarlos definitivos.

Como precedente conceptual de comparación sistemática puede consultarse el enfoque de codificación de manifiestos del Manifesto Project. Esta rúbrica propia no copia sus categorías y sus scores no son datos de ese proyecto.
