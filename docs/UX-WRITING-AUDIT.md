# Auditoría de UX writing

Esta revisión simplifica la primera capa de la interfaz y conserva las explicaciones técnicas en sus apartados de detalle. No modifica las reglas económicas ni el comportamiento de las simulaciones.

| Contexto | Antes | Después | Motivo |
|---|---|---|---|
| Configurar decisiones | Mensaje de configuración inicial y opción destacada para mantenerla | Se elimina el mensaje y se muestran las rutas «Programa político», «Con preguntas» y «Con controles» | Quitar una falsa acción y permitir elegir directamente cómo configurar. |
| Cambios durante la simulación | Referencia a «Cierre 2025» y a una «trayectoria» | Se indica desde qué mes se aplicarán los cambios y que se conservará lo ocurrido antes | Explicar el efecto temporal con una fecha derivada de la simulación. |
| Comparación y reinicio | Acciones con nombres poco diferenciados | «Comparar otra configuración» conserva el avance y crea una alternativa; «Empezar una nueva simulación» pide confirmación y vuelve a los datos iniciales | Hacer explícita la diferencia entre comparar y empezar de nuevo. |
| Programas políticos | Descripción técnica sobre propuestas que «se traducen» y «correspondencia» | Se explica qué propuestas pueden representarse y qué significa la cobertura | Aclarar qué hace el selector y qué no mide la cobertura. |
| Producción económica y otros KPI | Valores con unidades relegadas u ocultas | Unidad visible debajo del valor para los seis indicadores | Evitar que el usuario tenga que deducir la magnitud. |
| Entender los resultados | «Mecanismos» como encabezado principal | «Qué influyó en el último periodo»; las operaciones conservan su desglose | Hablar de los factores antes de introducir el detalle del modelo. |
| Cómo funciona | Descripción de sectores, hogares sintéticos y consistencia de flujos en primer nivel | Resumen en lenguaje común; la explicación *stock-flow consistent* y las reglas cuantitativas quedan en «Detalle técnico» | Mantener accesible la precisión sin cargar la introducción. |
| Datos y fuentes | Descripción densa de la selección y construcción de datos | Explicación directa de fechas, catálogo revisado y estimaciones | Facilitar la comprensión de la procedencia antes de mostrar la tabla. |

## Clasificación de términos revisados

| Término | Capa | Tratamiento |
|---|---|---|
| «Baseline» | Primera capa | No se presenta al usuario; se usa «datos iniciales», «valores iniciales» o «punto de partida». |
| «Trayectoria» | Primera capa / explicación | Se sustituye por «lo ocurrido», «simulación» o «alternativa» en los flujos de configuración. Se conserva donde describe con precisión el historial técnico. |
| «Correspondencia» | Primera capa | Se sustituye por «propuesta que podemos representar» o «sin una propuesta clara». |
| «Agregado» | Detalle técnico | Se conserva en nomenclatura o explicaciones técnicas; en primera capa se habla de «conjunto» o de un promedio. |
| «Sintético» | Detalle técnico | Se reserva para perturbaciones y conceptos técnicos; para hogares se usa «grupos simulados». |
| «Mecanismo» | Explicación / detalle técnico | El encabezado se expresa como «Qué influyó»; el desglose conserva las operaciones registradas por el modelo. |
| «Parametrización» | Detalle técnico | Se conserva únicamente en documentación técnica, cuando describe una decisión formal del modelo. |
| *Stock-flow consistent* | Detalle técnico | Se mantiene en el desplegable «Detalle técnico» de «Cómo funciona» y no aparece en la introducción. |
| «Valor vigente» | Primera capa | Se sustituye por «valor actual». |
| «Configuración de referencia» | Primera capa | Se elimina como opción principal; el detalle habla de la configuración inicial del experimento. |
| «Cierre 2025» | Primera capa de configuración | Se usa una fecha mensual derivada para explicar cuándo surtirán efecto los cambios. La etiqueta de fecha del panel principal conserva el formato del producto. |

Las unidades de los seis KPI se muestran junto a cada valor; la gráfica, el contexto del indicador y la exportación mantienen la unidad pertinente. El detalle técnico conserva semilla, reglas, parámetros, relaciones y límites del modelo.
