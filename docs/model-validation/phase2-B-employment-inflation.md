# Fase 2 EXPRESS — Frente B: empleo, precios e inflación

**Alcance.** Revisión documental de las reglas de empleo y precios del modelo 0.1.0 para orientar 0.2.0. Los coeficientes no se estiman aquí. Una correlación observada no identifica por sí sola causalidad; las ecuaciones simples pueden conservarse como reglas reducidas si sus unidades, horizonte y límites son explícitos.

## B1. Crecimiento → desempleo

| Campo | Evaluación |
|---|---|
| Relación | B1 — sensibilidad del desempleo al crecimiento |
| Implementación actual | Cada mes: `u(t)=u(t−1)−0,22×(g_anualizado−0,9%−crecimiento_poblacional)/12`, con límite 1,5–45 %. Es una variación de la tasa de paro, no una ecuación de empleo. El crecimiento de referencia es productividad exógena más población. |
| Evidencia | El Banco de España describe un coeficiente de Okun medio internacional cercano a 0,3: un punto porcentual más de PIB se asocia con unos 0,3 puntos menos de paro. Para España, la sensibilidad ha variado sustancialmente; entre 2008 y 2011 el aumento del paro por punto de caída acumulada del PIB fue excepcionalmente grande. El BCE muestra que en la recuperación reciente empleo y PIB se separaron por productividad y salarios reales. Estas son relaciones reducidas/cíclicas, sensibles a periodo, horas, composición sectorial y legislación; no son un parámetro causal invariante. |
| Rango defendible | Como regla anual lineal del cambio en tasa de paro por exceso de crecimiento: aproximadamente 0,2–0,5 en escenarios ordinarios; episodios españoles de crisis pueden superar ampliamente ese rango. No es un intervalo de confianza de una única estimación. |
| Valor central | 0,30 como punto de partida transparente para una regla agregada sencilla, con validación de trayectoria; no como estimador España estructural. |
| España/eurozona | El 0,22 actual está cerca del orden de magnitud habitual y dentro del rango ordinario propuesto. España tiene mayor ciclicidad del empleo/paro en episodios severos, por lo que un único coeficiente constante infrarrepresenta asimetrías. |
| Confianza | MEDIA |
| Diagnóstico | RECALIBRAR (coeficiente razonable como orden de magnitud, pero no validado para la definición usada). |
| Propuesta 0.2.0 | Puede mantenerse 0,22 provisionalmente si se etiqueta como parámetro supuesto. Preferible documentar escenario central 0,30 y sensibilidad 0,20–0,50, o introducir una relación empleo/horas con dinámica laboral si el alcance posterior lo permite. No venderlo como ley de Okun estimada para España. Mantener productividad+población como referencia solo si se explicita que es hipótesis de crecimiento tendencial, no crecimiento potencial estimado. |
| Riesgo de mantener actual | Bajo en comparación con otras incertidumbres si se interpreta como regla reducida; puede suavizar demasiado el paro en crisis y confunde crecimiento de PIB con creación de empleo cuando cambia productividad/horas. |
| Fuentes | [Banco de España, Informe Anual 2011, recuadro 5.2](https://www.bde.es/f/webbde/SES/Secciones/Publicaciones/PublicacionesAnuales/InformesAnuales/11/Fich/cap5.pdf); [BCE/Banco de España, Boletín Económico 4/2024](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesBCE/BoletinEconomicoBCE/2024/Fich/bebce2404.pdf). |

**Juicio sobre 0,22:** no carece de soporte por orden de magnitud: es algo inferior al 0,3 de referencia internacional citado por BdE y defendible como sensibilidad prudente. Carece de soporte específico para España y para esta fórmula mensual. La evidencia española aconseja no tratarlo como constante causal.

## B2. Inflación y brecha demanda/capacidad

| Campo | Evaluación |
|---|---|
| Relación | B2 — ancla y respuesta a la brecha |
| Implementación actual | Objetivo anual de inflación subyacente `π* = 2% + 0,20×(demanda−capacidad)/capacidad + 0,16×energía`; luego se filtra con la persistencia. Una brecha de +1 % añade 0,20 puntos porcentuales al objetivo anual. |
| Evidencia | La curva de Phillips reducida relaciona holgura/margen de costes con inflación, pero sus resultados dependen de expectativas, costes importados, medida de holgura y periodo. Estudios BCE encuentran una respuesta a la holgura, más débil recientemente y condicionada por expectativas. PIB/capacidad no es equivalente a coste marginal o brecha de desempleo. El objetivo del 2 % es un ancla de política monetaria del BCE para el HICP a medio plazo; no es una constante empírica de inflación mensual española. |
| Rango defendible | No se desprende un rango único transferible al coeficiente 0,20: la variable gap/capacidad del modelo no coincide con las medidas de slack estimadas. Para una regla exploratoria puede ensayarse 0,05–0,20 puntos de inflación anual por cada 1 % de brecha; rango de diseño, no estimación publicada. |
| Valor central | Mantener 0,20 solo como extremo alto/hipótesis de sensibilidad. Un central prudente de 0,10 sería más coherente con una Phillips reciente aplanada, sujeto a contraste de escenarios. |
| España/eurozona | Ancla 2 % eurozona; la respuesta de la inflación española puede diferir por shocks energéticos, composición y medidas fiscales. La brecha sintética de demanda frente a capacidad no está observada de forma comparable. |
| Confianza | BAJA |
| Diagnóstico | REFORMULAR |
| Propuesta 0.2.0 | Separar inflación subyacente (holgura, expectativas y persistencia) de energía/impuestos que afectan IPC general. Si se conserva la regla reducida, usar gap centrado en capacidad y declarar 0,10 central con sensibilidad 0,05–0,20, sin atribución causal. El ancla 2 % puede mantenerse como objetivo eurozona explícito. |
| Riesgo de mantener actual | Una pequeña desviación del proxy de capacidad se convierte mecánicamente en presión de precios, aunque ese proxy no mida la holgura relevante; persistencia y shocks pueden amplificar sesgos. |
| Fuentes | [BCE, Drivers of underlying inflation in the euro area over time (2019)](https://www.ecb.europa.eu/press/economic-bulletin/articles/2019/html/ecb.ebart201904_02~d438b3e4d4.en.html); [BCE, What regional data tell us about the euro area Phillips curve (2026)](https://www.ecb.europa.eu/press/research-publications/resbull/2026/html/ecb.rb260223~3e8fa44e9f.ga.html). |

## B3. Persistencia de inflación mensual

| Campo | Evaluación |
|---|---|
| Relación | B3 — persistencia de inflación subyacente |
| Implementación actual | `π_t=0,85π_(t−1)+0,15π*_t`, actualización mensual sobre una tasa anualizada; el precio mensual se actualiza con `exp(π_t/12)`. |
| Evidencia | Las Phillips híbridas del BCE permiten inflación pasada junto con expectativas y slack; la persistencia reducida existe, pero varía por régimen y especificación. No se identificó evidencia que valide 0,85 como coeficiente mensual para España. |
| Rango defendible | El documento no ofrece rango empírico compatible. Matemáticamente, persistencia anual equivalente para un AR mensual constante es `0,85^12 = 0,142` (14,2 % retenido tras 12 meses); semivida `ln(0,5)/ln(0,85)=4,27` meses. Por tanto es rápida reversión, no persistencia anual alta. |
| Valor central | Si se pretende retener 0,85 de una desviación al cabo de un año, el equivalente mensual sería `0,85^(1/12)=0,9865`. Esto es conversión matemática, no estimación recomendada. |
| España/eurozona | La unidad mensual hace que una cifra como 0,85 parezca alta pero implique solo 14 % de memoria anual. La evidencia de eurozona respalda memoria pasada como canal, junto con expectativas y shocks; no justifica aislarla como único motor. |
| Confianza | ALTA para la conversión; BAJA para elegir un AR empírico. |
| Diagnóstico | RECALIBRAR |
| Propuesta 0.2.0 | Definir el horizonte de persistencia que se quiere representar. Si la intención es persistencia de varios trimestres, recalibrar mensual hacia ~0,97–0,99 y contrastar semivida/trayectoria; no elevarlo automáticamente sin validar dinámica. Preferir expectativas o ajuste gradual explícito si se amplía la ecuación. |
| Riesgo de mantener actual | Desviaciones persistentes del objetivo se extinguen muy deprisa; shocks de inflación pierden memoria aunque no haya mecanismo de expectativas/salarios. |
| Fuentes | [BCE, Drivers of underlying inflation…](https://www.ecb.europa.eu/press/economic-bulletin/articles/2019/html/ecb.ebart201904_02~d438b3e4d4.en.html). |

## B4. Shock energético → inflación

| Campo | Evaluación |
|---|---|
| Relación | B4 — transmisión energética |
| Implementación actual | `energyPriceExposure=0,16` multiplica `external.energy` y suma al objetivo anual de inflación subyacente. El generador de eventos define `energy = magnitud×0,12`; la unidad no se documenta como variación observada de un índice energético. |
| Evidencia | BdE estima que shocks de gas afectan más a la inflación española que a la francesa y que el impacto ha aumentado recientemente; el efecto depende de energía usada en consumo/producción y regulación eléctrica. BdE también encuentra que, en un año, una gran subida energética eleva la inflación subyacente alrededor del doble de lo que una bajada equivalente la reduce. Esto contradice una transmisión lineal, simétrica y estable. |
| Rango defendible | No existe rango comparable para 0,16 sin definir escala y horizonte del `energy` ficticio. La evidencia da dirección, rezagos y asimetría, no este coeficiente. |
| Valor central | Ninguno defendible con la entrada actual. |
| España/eurozona | Exposición española puede ser elevada en shocks de gas/energía; el traspaso varía con el tipo de shock y régimen. |
| Confianza | MEDIA para dirección/asimetría; BAJA para coeficiente. |
| Diagnóstico | REFORMULAR |
| Propuesta 0.2.0 | Especificar shock como variación porcentual de un índice de energía y separar efecto directo en IPC energético de efectos indirectos/retardados en inflación subyacente. Usar sensibilidad por subida/bajada y horizonte, calibrada con series españolas; hasta entonces 0,16 solo como parámetro ficticio de escenario, sin interpretación cuantitativa externa. |
| Riesgo de mantener actual | El factor no tiene unidad económica reproducible y mezcla shock exógeno con inflación subyacente, pudiendo exagerar o suavizar arbitrariamente el traslado. |
| Fuentes | [Banco de España, Pass-through to inflation of gas price shocks (2025)](https://www.bde.es/wbe/en/publicaciones/analisis-economico-investigacion/documentos-trabajo/the-pass-through-to-inflation-of-gas-price-shocks.html); [Banco de España, asimetrías de transmisión energética (2024)](https://www.bde.es/wbe/en/publicaciones/analisis-economico-investigacion/boletin-economico/2024-t1-articulo-06--asimetrias-en-la-traslacion-de-los-incrementos-y-de-los-descensos-de-los-precios-de-la-energia-a-la-inflacion-subyacente-del-area-del-euro-y-de-espana.html). |

## B5. Impuesto al consumo → nivel de precios e IPC interanual

| Campo | Evaluación |
|---|---|
| Relación | B5 — cambio de impuesto indirecto |
| Implementación actual | El tipo modifica permanentemente el nivel del índice consumidor vía `(1+tipo)/(1+tipo_base)`. No se repite en el precio productor. Como el IPC es cociente entre nivel de hoy y el de hace 12 intervalos (13 observaciones), el salto fiscal aparece en inflación interanual durante la ventana y sale al cumplirse 12 meses desde el cambio. |
| Evidencia | Eurostat define HICP a impuestos constantes; la diferencia frente al índice observado indica el impacto teórico suponiendo traslado instantáneo e íntegro, y es un límite superior indicativo, no medición exacta. BCE señala que el pass-through real depende de decisiones de precios de empresas; para IVA español de 2010, la revisión histórica del BCE resume traspaso de aproximadamente 40–60 % del impacto completo. |
| Rango defendible | Pass-through entre parcial y completo según mercado/medida; para el episodio español citado 0,40–0,60. No debe generalizarse a toda cesta ni a cualquier shock fiscal. |
| Valor central | 0,50 para una aproximación inicial de cambio discreto si se necesita un único supuesto, con sensibilidad hasta 1,00 como cota mecánica. |
| España/eurozona | España aplica cambios de IVA y especiales en IPC/IPCA; Eurostat documenta que el HICP-CT español incorpora cambios de tipos según el mes de vigencia. El 11 % de referencia del modelo es un tipo medio sintético, no el IVA general ni la estructura real de la cesta. |
| Confianza | MEDIA |
| Diagnóstico | VALIDAR en la estructura de nivel; REFORMULAR pass-through |
| Propuesta 0.2.0 | Mantener impuesto como cambio permanente de nivel de precios, pero con pass-through explícito (p.ej. central 50 %, sensibilidad 0–100 %) aplicado una sola vez al cambio de tipo. Mantener su contribución a inflación interanual mientras la ventana de 12 meses contiene el salto; después desaparece de la tasa anual si el nivel no cambia más. No añadirlo a inflación subyacente recurrente. |
| Riesgo de mantener actual | Niveliza el efecto completo de inmediato; atribuye inflación transitoria interanual durante un año, lo cual es mecánicamente correcto para un salto permanente, pero puede inducir a leerlo como inflación recurrente. La simplificación no representa cesta, exenciones, absorción de márgenes ni calendario intramensual. |
| Fuentes | [BCE, papel de impuestos indirectos en inflación (2020)](https://www.ecb.europa.eu/press/economic-bulletin/focus/2020/html/ecb.ebbox202006_06~8a537e86c2.en.html); [Eurostat, HICP e impuestos constantes](https://ec.europa.eu/eurostat/web/hicp/information-data); [BCE, Informe Anual 2012, referencia a traspaso español de IVA 2010](https://www.ecb.europa.eu/pub/pdf/annrep/ar2012en.pdf). |

**Distinción para B5:** el cambio tributario debe producir ambos conceptos en ventanas distintas: una variación permanente del nivel del IPC y una contribución transitoria a la tasa interanual, que se mantiene hasta que el mes base también incorpore el nuevo nivel. No implica inflación mensual persistente ni subida continua de precios.

## Decisiones resumidas

| Relación | Actual | Propuesta 0.2.0 | Decisión | Confianza |
|---|---|---|---|---|
| B1 | 0,22 por año, aplicado mensual | Conservar provisional o central 0,30; sensibilidad 0,20–0,50; etiquetar supuesto | RECALIBRAR / documentar como regla reducida | MEDIA |
| B2 | ancla 2 %, respuesta gap 0,20 | Ancla 2 %; central exploratorio 0,10, rango de diseño 0,05–0,20; separar subyacente | REFORMULAR | BAJA |
| B3 | persistencia mensual 0,85 | Definir horizonte; explorar 0,97–0,99 si se busca persistencia trimestral/anual | RECALIBRAR | ALTA matemática, BAJA empírica |
| B4 | energía × 0,16 directo al objetivo subyacente | Definir unidades; canal directo/indirecto y asimetría; no fijar central todavía | REFORMULAR | MEDIA/Baja |
| B5 | cambio de nivel íntegro; entra al IPC interanual | Nivel permanente con pass-through central supuesto 0,50; efecto anual sale tras 12 meses | VALIDAR estructura; REFORMULAR magnitud | MEDIA |

### Cambios recomendados (máximo 5)

1. Reetiquetar B1 como sensibilidad reducida supuesta y publicar su sensibilidad; 0,22 es plausible como orden de magnitud, no una estimación española.
2. Recalibrar B3 por horizonte temporal: 0,85 mensual retiene solo 14,2 % al año y tiene semivida de 4,27 meses.
3. Separar en B2 la inflación subyacente de shocks energéticos y explicitar que demanda/capacidad es un proxy.
4. Definir unidad y escala de energía antes de conservar B4; incorporar asimetría/rezagos cuando haya datos calibrables.
5. En B5 conservar el salto permanente de nivel y su efecto interanual de doce meses, introduciendo traspaso fiscal parcial y describiéndolo como efecto de ventana, no inflación persistente.
