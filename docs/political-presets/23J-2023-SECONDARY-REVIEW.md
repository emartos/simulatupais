# Revisión focalizada de codificación política 23J — segunda pasada

Esta revisión focaliza cinco actores y refleja las decisiones humanas de cierre recibidas posteriormente. Mantiene la rúbrica cerrada de codificación (evidencia textual → score discreto → steps actuales) y no reabre los mappings de PP, PSOE, VOX, Sumar, ERC o BNG.

## Corpus oficiales revisados

| Actor | Documento y fecha | Fuente primaria | Tipo y cobertura |
|---|---|---|---|
| Junts per Catalunya | *Per Catalunya. Programa electoral 23J*; fechado en el corpus de campaña del 6 de julio de 2023 | [PDF del espacio oficial de campaña](https://janhihaprou.cat/app/uploads/2023/07/Programa-Electoral.pdf) | Programa referido por el catálogo. El host oficial no resolvió durante esta revisión; no se emplearon copias de terceros como evidencia. El contenido y la cobertura del documento completo no pudieron verificarse en esta ejecución. |
| EH Bildu | *Compromiso de Euskal Herria Bildu*; documento de campaña 23J, fecha de publicación no indicada en el PDF | [PDF oficial de EH Bildu](https://ehbildu.eus/dokumentuak/23J-COMPROMISO-DE-EUSKAL-HERRIA-BILDU.pdf) | Documento programático oficial de 16 páginas; revisado completo. Incluye compromisos de ámbito vasco/navarro y medidas estatales. |
| Coalición Canaria | *Manifiesto: Un objetivo común, la defensa de Canarias*; 26 de junio de 2023 | [Manifiesto oficial de Coalición por Canarias](https://coalicioncanaria.org/wp-content/uploads/2023/06/COALICION_POR_CANARIAS.pdf) | Manifiesto de campaña 23J; revisado completo. Su objeto expreso es defender Canarias en las Cortes. |
| EAJ-PNV | *Con voz propia. Programa Electoral 23-J*; julio de 2023 | [Página documental oficial de EAJ-PNV](https://www.eaj-pnv.eus/es/documentos/20945/con-voz-propia-programa-electoral-23-j) · [PDF oficial](https://www.eaj-pnv.eus/adjuntos/pnvDocumentos/20945_archivo.pdf) | Programa completo de 52 páginas; revisado completo. Se separaron propuestas estatales, forales y territoriales. |
| UPN | *Programa Electoral — Elecciones Generales 23 de julio 2023*; sin fecha de publicación separada en el PDF | [PDF oficial de UPN](https://www.upn.org/wp-content/uploads/2023/07/Programa-Generales-23J_V2-1.pdf) | Programa de campaña de 6 páginas; revisado completo. Las propuestas fiscales estatales se separan de las infraestructuras y servicios navarros. |

Los localizadores “página PDF” cuentan desde la primera hoja del archivo. “Página impresa” conserva la numeración visible en el documento cuando difiere.

## Junts per Catalunya

| Actor | Control | Evidencia revisada | Ámbito | Score actual | Score propuesto | Confianza | Decisión |
|---|---|---|---|---:|---:|---|---|
| Junts | taxShift | Sin evidencia inspeccionable en esta pasada; URL oficial 23J no accesible | NONE | — | null | — | UNMAPPED |
| Junts | progressivity | Sin evidencia inspeccionable en esta pasada | NONE | — | null | — | UNMAPPED |
| Junts | consumptionTax | El preset previo atribuye una rebaja de IVA alimentario del 10 % al 4 % a `JUNTS-IVA-001`; no se pudo comprobar el pasaje ni su localizador en la fuente oficial | NONE | −1 | null | — | UNMAPPED_TRAS_REVISION |
| Junts | corporateTax | Sin evidencia inspeccionable en esta pasada | NONE | — | null | — | UNMAPPED |
| Junts | transfers | Sin evidencia inspeccionable en esta pasada | NONE | — | null | — | UNMAPPED |
| Junts | publicInvestment | Sin evidencia inspeccionable en esta pasada | NONE | — | null | — | UNMAPPED |
| Junts | services | Sin evidencia inspeccionable en esta pasada | NONE | — | null | — | UNMAPPED |
| Junts | investmentFriction | Sin evidencia inspeccionable en esta pasada | NONE | — | null | — | UNMAPPED |

El registro previo atribuía la medida al IVA estatal de productos alimentarios, pero no se pudo recuperar el PDF oficial ni validar el texto, el localizador o el ámbito. Por eso el control se deja sin mapear hasta que se pueda revisar la fuente primaria; no se sustituyó la falta de evidencia con resultados de buscadores o documentos de terceros.

## Euskal Herria Bildu

| Actor | Control | Evidencia revisada | Ámbito | Score actual | Score propuesto | Confianza | Decisión |
|---|---|---|---|---:|---:|---|---|
| EH Bildu | taxShift | Pág. PDF 8, “Política fiscal”: gravámenes a banca, energéticas y grandes fortunas; no trata de forma general la carga directa de hogares | MIXED | — | null | — | UNMAPPED |
| EH Bildu | progressivity | Pág. PDF 8, aumentar la carga sobre banca, energéticas y grandes fortunas; gestión por haciendas forales | MIXED | +1 | +1 | MEDIUM | APROBADO |
| EH Bildu | consumptionTax | Pág. PDF 6, IVA superreducido a productos de higiene menstrual; una categoría sectorial demasiado estrecha para el control agregado | STATE_GENERAL | — | null | — | UNMAPPED |
| EH Bildu | corporateTax | Pág. PDF 8, impuesto especial a beneficios de grandes cadenas distribuidoras; no equivale a cambio general de Sociedades | STATE_GENERAL | — | null | — | UNMAPPED |
| EH Bildu | transfers | Págs. PDF 5 y 7, aumento de pensiones mínimas y ampliación/cuantía del IMV; parte del sistema se pide transferir a instituciones vascas y navarras | MIXED | +1 | +1 | HIGH | APROBADO |
| EH Bildu | publicInvestment | Págs. PDF 6 y 8, red ferroviaria estatal en sus territorios e inversiones locales; no representa inversión estatal agregada | MIXED | — | null | — | UNMAPPED_TRAS_REVISION |
| EH Bildu | services | Pág. PDF 6, refuerzo de Atención Primaria, presupuesto de salud mental, plazas PIR y cartera sanitaria pública | STATE_GENERAL | — | +1 | MEDIUM | APROBADO |
| EH Bildu | investmentFriction | Simplificación del IMV y control de deslocalizaciones no equivalen a fricción general de inversión privada | MIXED | — | null | — | UNMAPPED |

La propuesta de `corporateTax +1` no se incorpora al catálogo. `services +1` queda aprobada y activa según la decisión humana de cierre.

## Coalición Canaria

| Actor | Control | Evidencia revisada | Ámbito | Score actual | Score propuesto | Confianza | Decisión |
|---|---|---|---|---:|---:|---|---|
| Coalición Canaria | taxShift | Punto 14, bonificación de IRPF del 60 % a residentes de La Palma | TERRITORIAL_ONLY | — | null | — | UNMAPPED |
| Coalición Canaria | progressivity | El manifiesto no formula una dirección sobre carga relativa por nivel de renta | NONE | — | null | — | UNMAPPED |
| Coalición Canaria | consumptionTax | No se identifica una propuesta de alcance estatal general sobre IVA/consumo | NONE | — | null | — | UNMAPPED |
| Coalición Canaria | corporateTax | Puntos 32 y 34, incentivos y ventajas fiscales para actividades e inversión en Canarias | TERRITORIAL_ONLY | — | null | — | UNMAPPED |
| Coalición Canaria | transfers | Punto 23, pensiones dignas y actualizadas por coste de vida en un pacto estatal; el resto de medidas monetarias identificadas se territorializa en Canarias | MIXED | — | null | — | UNMAPPED_TRAS_REVISION |
| Coalición Canaria | publicInvestment | Puntos 6, 19 y 25, inversión media, infraestructura educativa, trenes y dependencia para Canarias | TERRITORIAL_ONLY | — | null | — | UNMAPPED |
| Coalición Canaria | services | Puntos 10, 25 y 26, financiación sanitaria, educativa y de dependencia para Canarias | TERRITORIAL_ONLY | — | null | — | UNMAPPED |
| Coalición Canaria | investmentFriction | Punto 34, facilitar acceso regional a incentivos económicos para empresas canarias | TERRITORIAL_ONLY | — | null | — | UNMAPPED |

Las ocho dimensiones se revisaron expresamente. El compromiso estatal sobre pensiones no basta para inferir un aumento agregado de transferencias; las demás medidas relevantes son territoriales o no indican dirección estatal general.

## EAJ-PNV

| Actor | Control | Evidencia revisada | Ámbito | Score actual | Score propuesto | Confianza | Decisión |
|---|---|---|---|---:|---:|---|---|
| EAJ-PNV | taxShift | Pág. impresa 15–17, ingresos suficientes, consolidación y reforma; no indica dirección agregada de impuestos directos a hogares | STATE_GENERAL | — | null | — | UNMAPPED |
| EAJ-PNV | progressivity | Pág. impresa 15, adaptación del sistema tributario estatal para profundizar en la progresividad, con salvaguarda foral | STATE_GENERAL | — | +1 | MEDIUM | APROBADO |
| EAJ-PNV | consumptionTax | Pág. impresa 16, revisar lista de bienes/servicios y tipos de IVA para corregir inequidades, sin dirección común de los tipos | MIXED | — | null | — | UNMAPPED |
| EAJ-PNV | corporateTax | Págs. impresas 15–17 y 37–44, sin dirección clara de la carga general del impuesto sobre beneficios | NONE | — | null | — | UNMAPPED |
| EAJ-PNV | transfers | Págs. impresas 5, 15–18 y 32–33, defensa de pensiones e iniciativas redistributivas; no establece aumento agregado de un paso | MIXED | — | null | — | UNMAPPED_TRAS_REVISION |
| EAJ-PNV | publicInvestment | Págs. impresas 16–17, preservar y reforzar capacidad de inversión pública en transición digital/ecológica y ejecución de fondos | STATE_GENERAL | — | +1 | MEDIUM | APROBADO |
| EAJ-PNV | services | Págs. impresas 5 y 45–47, compromiso de mantener servicios de calidad y apoyo social estatal; no fija aumento de gasto corriente | MIXED | — | null | — | UNMAPPED |
| EAJ-PNV | investmentFriction | Págs. impresas 15 y 19–22, menos burocracia y trámites concretos de fondos Next/renovables; el control parte del mínimo 0 y no admite un paso descendente | STATE_GENERAL | — | null (sin step representable) | MEDIUM | UNMAPPED |

Se aprueban y activan `progressivity +1` y `publicInvestment +1`. `transfers` permanece sin mapear tras revisión humana.

## Unión del Pueblo Navarro

| Actor | Control | Evidencia revisada | Ámbito | Score actual | Score propuesto | Confianza | Decisión |
|---|---|---|---|---:|---:|---|---|
| UPN | taxShift | Pág. impresa 2, reducir impuestos y deflactar tarifa IRPF; objetivo de actuación de sus diputados en Cortes | STATE_GENERAL | — | −1 | MEDIUM | APROBADO |
| UPN | progressivity | La deflactación no indica cambio del diferencial de carga entre rentas altas y bajas | STATE_GENERAL | — | null | — | UNMAPPED |
| UPN | consumptionTax | No hay dirección general de fiscalidad del consumo en el programa | NONE | — | null | — | UNMAPPED |
| UPN | corporateTax | Ayudas e incentivos empresariales no formulan dirección sobre tipo/carga general de Sociedades | NONE | — | null | — | UNMAPPED |
| UPN | transfers | Pág. impresa 4, pensiones dignas y sin recortes; no permite concluir posición agregada sobre el total de transferencias frente al baseline | STATE_GENERAL | — | null | — | UNMAPPED_TRAS_REVISION |
| UPN | publicInvestment | Págs. impresas 2–3, Canal de Navarra, AVE, carreteras y conexiones navarras | TERRITORIAL_ONLY | — | null | — | UNMAPPED |
| UPN | services | Pág. impresa 3–4, sanidad/educación y dependencia para Navarra, sin recursos corrientes estatales agregados | TERRITORIAL_ONLY | — | null | — | UNMAPPED |
| UPN | investmentFriction | Pág. impresa 5, emprendimiento y apoyo al autónomo, sin paquete general estatal de licencias o trámites | NONE | — | null | — | UNMAPPED |

Se activa y aprueba `taxShift −1`. `transfers` permanece `UNMAPPED` tras revisión; UPN queda con 1/8 decisiones interpretadas.

## Reglas de activación y limitaciones

- Las decisiones aprobadas se reflejan en los metadatos de revisión del catálogo; los controles sin evidencia agregada suficiente siguen `UNMAPPED_TRAS_REVISION`.
- Las medidas autonómicas/forales y proyectos territorializados no se escalan al conjunto español.
- Junts conserva un blocker específico: no se pudo recuperar el programa del dominio oficial durante esta pasada; el −1 de consumo previo se retiró y queda `UNMAPPED_TRAS_REVISION` hasta poder verificar la fuente primaria. No se usa material posterior a 23J como sustituto.
- La propuesta de reducir fricción de EAJ-PNV no se puede representar con los límites/steps del modelo activo: el control ya está en su valor mínimo, 0.

## Cierre de revisión humana

Se aplicaron las decisiones acordadas: UPN `taxShift −1` queda `APROBADO`; EAJ-PNV `progressivity +1` y `publicInvestment +1` quedan `APROBADO`; EH Bildu conserva `progressivity +1` y `transfers +1` como `APROBADO` y activa `services +1` como `APROBADO`. Los controles definidos como `UNMAPPED_TRAS_REVISION` permanecen sin score.

Cobertura final calculada desde el catálogo: UPN 1/8, EAJ-PNV 2/8, EH Bildu 3/8, Coalición Canaria 0/8 y Junts 0/8. Se mantienen sin mapear UPN `transfers`, EAJ-PNV `transfers`, EH Bildu `publicInvestment`, CCa `transfers` y Junts `consumptionTax`.
