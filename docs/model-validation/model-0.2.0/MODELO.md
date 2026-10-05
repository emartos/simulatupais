# Modelo exploratorio 0.2.0

## Estado y tiempo

La base usa flujos anuales y stocks a cierre. Cada paso representa un mes. PIB, consumo, inversión, ingresos y gastos se expresan a ritmo anualizado; deuda y capital son existencias. Un flujo anualizado afecta a su existencia durante un mes dividido por doce.

El año base se determina mediante `selectBase`: se ordenan los años con registros, se selecciona la revisión no proyectada más reciente por indicador y se exige cobertura de todas las variables imprescindibles. Las identidades incompatibles producen error; no se rellenan con un LLM ni se desplaza la fecha de una observación.

## Ecuaciones y cierre

El código ejecutable es la especificación exacta: `src/core/engine.ts`. Las constantes, unidades y límites están en `src/core/model.ts`.

### Hogares

Tres grupos sintéticos con participaciones fijas en población e ingresos. Para cada grupo:

```text
renta disponible = ingresos brutos - impuestos directos + transferencias
renta real por persona = renta disponible / precios al consumidor / personas
consumo deseado = renta disponible * propension a consumir
```

Los ingresos nominales agregados se inicializan como una proporción hipotética del PIB. Las propensiones se normalizan para enlazar con el consumo observado. Los hogares no son deciles estadísticos y sus cambios no permiten inferir efectos distributivos reales sin calibración adicional.

### Inversión y capacidad

La inversión privada deseada depende del volumen inicial, la escala productiva, la rentabilidad después del impuesto sobre beneficios y una fricción adicional. Es un mecanismo postulado con elasticidad explícita, no estimada a partir de los datos españoles del paquete.

```text
capital siguiente = capital actual * (1 - depreciacion/12) + inversion/12
```

La capacidad incorpora productividad exógena, demografía, capital previo y perturbaciones de oferta. La inversión actual afecta al capital del siguiente periodo.

### Producción y precios

```text
PIB real = consumo + servicios publicos + inversion + exportaciones netas
```

La producción se aproxima parcialmente a la demanda deseada con una restricción de capacidad. Un factor agregado convierte componentes deseados en realizados. Este cierre no es un equilibrio general ni una matriz de balances sectoriales: la adquisición de activos financieros y la financiación privada no están representadas.

La dinámica de precios combina persistencia mensual de 0,97, ancla del 2 %, un proxy de holgura y perturbaciones energéticas. El 0,10 de respuesta a la brecha es una elección heurística; no hay expectativas ni una curva de Phillips estructural. La persistencia equivale a `0,97^12 ≈ 69,4 %` retenido tras doce meses y una semivida de unos 22,8 meses; no es una estimación española. En 0.1.0, `0,85^12 ≈ 14,2 %` era la retención anual, por lo que la nueva cifra corrige la escala temporal como elección provisional.

El cambio del impuesto medio al consumo aplica un traslado central del 50 % de la variación mecánica al nivel de precios. Se aplica como diferencia persistente respecto al tipo de referencia, no vuelve a entrar cada mes en la inflación subyacente y deja de contribuir a la inflación interanual cuando el mes base incluye también el nuevo nivel (desde el mes 13 tras un cambio inicial). Es una simplificación central, no un pass-through universal.

### Empleo y sector público

La tasa de paro reacciona a actividad y tendencia mediante una **regla reducida de sensibilidad del desempleo al crecimiento** de 0,22. Se conserva sin llamarla coeficiente de Okun estimado para España porque no se encontró una ecuación española directamente equivalente. La participación laboral inicial se mantiene fija; no hay estructura por edades ni decisiones migratorias endógenas.

```text
saldo de deuda neta siguiente = saldo anterior + deficit anualizado/12
```

Se separan deuda bruta y activos públicos para no representar como deuda negativa un superávit acumulado. Ingresos y gastos fiscales son cuentas sintéticas, no el presupuesto observado de España. La inversión pública es parte de la inversión total, no del consumo público, para no duplicarla.

### Demografía

Los nacimientos y fallecimientos inicializan tasas constantes. El resto del cambio entre poblaciones se denomina **residuo de movilidad y ajustes**. No se presenta como una medición oficial de migración neta.

## Comparación y aleatoriedad

El generador es una función determinista de semilla, mes y canal. Las perturbaciones sintéticas pueden desactivarse en las opciones avanzadas. Con la misma semilla, la secuencia activada es reproducible y compartida por ambas ramas; desactivarlas no altera lo ya ocurrido. Su frecuencia y magnitud no son estimaciones estadísticas de acontecimientos reales. Cambiar la velocidad o avanzar en bloques no cambia los resultados de una misma versión.

B hereda exactamente el estado de A al bifurcar. El archivo de sesión contiene la receta de reconstrucción, no código o estados importados que el motor deba creer. Versiones incompatibles se rechazan.

La reproducción exacta se ha comprobado en el entorno incluido en el informe. Las funciones matemáticas de coma flotante no garantizan identidad bit a bit entre todos los motores JavaScript existentes.

## Instituciones y decisiones económicas

Selección competitiva, selección en partido único y designación tienen calendarios experimentales. Los eventos no predicen elecciones reales ni adjudican ganadores. Expresión y revisión judicial son condiciones configuradas, no índices observados. No tienen coeficientes económicos en esta versión.

La interfaz muestra los ocho controles económicos aplicados y, cuando la referencia compatible está disponible, sus cambios respecto a la configuración predeterminada con la que se inició el experimento. Esa referencia se reconstruye desde los mismos datos y la versión exacta del modelo; las sesiones con otra versión o catálogo se rechazan para evitar reinterpretarlas. No representa necesariamente las políticas vigentes en España.

Al omitir el cuestionario se conserva la configuración predeterminada. Responder «Mantener» en todas las preguntas produce esa misma configuración. Los valores cero de ajustes o variaciones indican que no se añade un cambio; no significan que no haya impuestos, ayudas o diferencias entre grupos.

La interfaz muestra la orientación aproximada de los cambios económicos respecto al punto de partida de la misma sesión mediante `economic-change-orientation` versión 2.0.0, definida en `src/ui/economic-axis-method.ts`. Parte sin marcador cuando no hay cambios incluidos. Para los cambios utiliza cinco dimensiones: fiscalidad directa, diferencial tributario entre grupos, transferencias, inversión pública y recursos para servicios. Las normaliza con escalas fijas y pesos iguales: convenciones descriptivas del indicador, no coeficientes estimados ni una clasificación científica validada. Describe cambios aplicados, no a la persona, y no interviene en el cálculo económico. La progresividad del motor ahora expresa directamente el cambio en puntos porcentuales del diferencial de tipo alto menos bajo; el grupo intermedio no cambia y los límites pueden recortar tipos. La auditoría de la fórmula absoluta anterior y sus límites se conserva en [la auditoría del eje anterior](AUDITORIA-EJE-ECONOMICO.md).

El indicador se refiere a cambios desde la configuración inicial del experimento, no clasifica esa configuración inicial. La referencia se reconstruye con el catálogo y la versión de modelo de la sesión. Los parámetros de 0.1.0 no se cargan ni reinterpretan como 0.2.0; esa versión se rechaza explícitamente.

Productividad tendencial pasa a 0,3 % anual como candidato provisional apoyado en la referencia española del Banco de España descrita en [la revisión de producción e inversión](model-validation/phase2/A-production-investment.md). No es una estimación estructural propia ni crecimiento potencial total: utilización y productividad siguen simplificadas.

La composición de los tres grupos, los tipos por grupo, las propensiones al consumo, las transferencias y el presupuesto inicial continúan siendo heurística o construcción sintética. No representan deciles observados, tipos IRPF observados, un 17 % del PIB de prestaciones observadas ni un saldo fiscal que reproduzca SEC S.13. También siguen heurísticas el capital/PIB 3,2, depreciación 4 %, contribución de capital 0,27, ajuste de producción 0,32, techo 105 %, exponente de inversión 1,25 y fricción 3. Exportaciones al 2 % son una tendencia de escenario y la elasticidad agregada de importaciones 1 es simplificada. España no tiene tipo de cambio nacional; precios relativos y composición comercial se omiten. Natalidad, mortalidad y residuo demográfico permanecen constantes; el residuo no es una proyección observada de migración ni una proyección oficial a veinte años.

## Trazabilidad y dominio

Ocho mecanismos dejan sus entradas, ecuación, explicación, resultado y unidad en el último estado. Los eventos históricos conservan texto y mecanismos asociados; el diálogo no mezcla sus valores con los del último mes. Para recuperar una traza pasada hay que reproducir hasta ese mes; no se incluye aún navegación retrospectiva de trazas en la interfaz.

Los avisos de dominio indican cuando se alcanza un límite numérico. Un estado finito no equivale a un escenario plausible. La suite comprueba implementación y coherencia interna, no validez empírica. No hay ajuste econométrico, validación externa, intervalos de confianza ni justificación predictiva para veinte años.
