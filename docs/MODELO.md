# Modelo exploratorio 0.1.0

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

La dinámica de precios combina persistencia, un ancla hipotética, brecha de demanda y perturbaciones energéticas. El impuesto al consumo afecta una vez al factor de nivel relativo, no se capitaliza de nuevo cada mes. La tasa interanual usa trece niveles de precios, inicialmente interpolados: no son doce observaciones históricas reales.

### Empleo y sector público

La tasa de paro reacciona a actividad y tendencia mediante un coeficiente hipotético. La participación laboral inicial se mantiene fija; no hay estructura por edades ni decisiones migratorias endógenas.

```text
saldo de deuda neta siguiente = saldo anterior + deficit anualizado/12
```

Se separan deuda bruta y activos públicos para no representar como deuda negativa un superávit acumulado. Ingresos y gastos fiscales son cuentas sintéticas, no el presupuesto observado de España. La inversión pública es parte de la inversión total, no del consumo público, para no duplicarla.

### Demografía

Los nacimientos y fallecimientos inicializan tasas constantes. El resto del cambio entre poblaciones se denomina **residuo de movilidad y ajustes**. No se presenta como una medición oficial de migración neta.

## Comparación y aleatoriedad

El generador es una función determinista de semilla, mes y canal. Las perturbaciones externas no dependen de cuántas veces una rama solicite números aleatorios. Cambiar la velocidad o avanzar en bloques no cambia los resultados de una misma versión.

B hereda exactamente el estado de A al bifurcar. El archivo de sesión contiene la receta de reconstrucción, no código o estados importados que el motor deba creer. Versiones incompatibles se rechazan.

La reproducción exacta se ha comprobado en el entorno incluido en el informe. Las funciones matemáticas de coma flotante no garantizan identidad bit a bit entre todos los motores JavaScript existentes.

## Instituciones y eje descriptivo

Selección competitiva, selección en partido único y designación tienen calendarios experimentales. Los eventos no predicen elecciones reales ni adjudican ganadores. Expresión y revisión judicial son condiciones configuradas, no índices observados. No tienen coeficientes económicos en esta versión.

La coordenada económica descriptiva es uno menos la media normalizada de cuatro controles: impuestos directos, progresividad, transferencias e inversión pública. Las referencias son 0, 0,5 y 1:

```text
proximidad = 100 * (1 - abs(coordenada - referencia))
```

Son porcentajes de similitud a definiciones sintéticas, no evaluaciones de políticas ni probabilidades. No suman necesariamente 100. No incorporan posiciones culturales ni distinguen todas las combinaciones con la misma media. La clasificación nunca se utiliza como entrada de las ecuaciones.

## Trazabilidad y dominio

Ocho mecanismos dejan sus entradas, ecuación, explicación, resultado y unidad en el último estado. Los eventos históricos conservan texto y mecanismos asociados; el diálogo no mezcla sus valores con los del último mes. Para recuperar una traza pasada hay que reproducir hasta ese mes; no se incluye aún navegación retrospectiva de trazas en la interfaz.

Los avisos de dominio indican cuando se alcanza un límite numérico. Un estado finito no equivale a un escenario plausible. La suite comprueba implementación y coherencia interna, no validez empírica. No hay ajuste econométrico, validación externa, intervalos de confianza ni justificación predictiva para veinte años.
