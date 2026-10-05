# Retardos y acumulación temporal — modelo 0.1.0

`t` es el paso mensual que se calcula; `t−1` es el estado anterior. Un flujo macro se expresa anualizado y se divide por 12 al acumular stocks. EQ remite a [model-equations.md](model-equations.md). “Persistencia” describe exclusivamente la implementación.

| Causa | Efecto | Retardo | Persistencia | Ecuaciones |
|---|---|---:|---|---|
| PIB nominal `t−1` | renta bruta, impuestos directos, transferencias de hogares en `t` | 1 mes de rezago | si se mantiene la política, recalculado cada mes con último PIB nominal | EQ-008–010 |
| Renta disponible de hogares `t` | consumo deseado `t` | contemporáneo | cambia con renta y política | EQ-011 |
| Precio productor anterior y política de impuesto | precio consumidor provisional | 1 mes para el productor, cambio de factor contemporáneo | factor permanece mientras se mantenga tasa; no compone cada mes | EQ-013 |
| Inversión/capacidad anteriores | inversión privada deseada `t` | 1 paso en capacidad; política contemporánea | escala capacidad e inversión persisten recursivamente | EQ-014 |
| PIB real anterior | servicios e inversión pública deseados `t` | 1 mes de rezago | permanente mientras política fija | EQ-015 |
| Política/actividad y comercio base | demanda `t` | contemporáneo | política persistente; exportaciones además con tendencia acumulada | EQ-016 |
| Población y tasas base | población `t` | acumulación mensual | tasas constantes en horizonte; población persiste como stock | EQ-017 |
| Inversión realizada `t−1` / capital `t−1` | capacidad nueva `t` | inversión con retardo de 1 mes; capital es stock previo | capacidad se acumula exponencialmente | EQ-018, EQ-026 |
| Productividad exógena | capacidad nueva | contemporáneo por mes | tendencia acumulativa cada mes | EQ-018 |
| PIB/capacidad y gasto deseado | PIB real `t` | contemporáneo, 32 % de brecha | rezago parcial por PIB anterior | EQ-019 |
| PIB y componentes deseados | cantidades realizadas | contemporáneo | solo resultado del mes, con acumulación indirecta en capital/deuda | EQ-019 |
| Demanda/capacidad y shock energía | objetivo de inflación subyacente | contemporáneo | subyacente previa conserva 85 % del peso | EQ-020 |
| Inflación subyacente | precio productor | dentro del paso; divide la tasa anual por 12 | nivel de precio multiplica todos los meses | EQ-020 |
| Precio consumidor actual | memoria de precios | contemporáneo | ventana deslizante de 13 niveles (12 intervalos); elimina un nivel por mes | EQ-021 |
| Tasa de paro previa y crecimiento del PIB | paro `t` | un mes | persiste recursivamente hasta clamp | EQ-022 |
| PIB nominal contemporáneo | ingresos públicos contemporáneos | contemporáneo, con bases fiscales diferentes | flujo se recalcula cada mes | EQ-023 |
| Deuda `t−1` | gasto de intereses `t` | 1 mes | mientras haya deuda y tipo fijo | EQ-024 |
| Déficit/superávit anualizado | deuda neta | acumulación de 1/12 del flujo por mes | stock persistente; déficit se capitaliza en el stock | EQ-025 |
| Inversión realizada `t` | capital `t` | acumulación del mismo paso, `/12` | retención del stock con depreciación mensual | EQ-026 |
| Capital actualizado `t` | capacidad | desde el paso siguiente | efecto se renueva mediante `investment/capital` de cada estado | EQ-018, EQ-026 |
| Semilla+mes+canal | shock externo del mismo mes | contemporáneo; no hay dependencia de llamadas previas | shock único por canal/mes; ambas ramas comparten valor | EQ-028 |
| Cambio de política registrado en mes `m` | ecuaciones de estado del paso `m+1` | desde paso siguiente | continúa hasta cambio posterior de política | EQ-029 |
| Bifurcación en mes `m` | estado/historia inicial de nueva rama | cero meses: copia el estado de `m` | pasado heredado; política alternativa rige pasos posteriores | EQ-029 |
| Catálogo y política base | stocks, flujos, índices iniciales y memoria sintética | inicialización en mes 0 | valores de catálogo fijan base; memoria de precio se inicializa por interpolación | EQ-027, EQ-030 |

El IPC inicial utiliza niveles interpolados, por lo que antes de que la ventana sea enteramente simulada parte de memoria construida, no de historia observada. La semilla y el hash son deterministas y no introducen persistencia estadística calibrada.
