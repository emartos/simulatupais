# Codificación de programas 23J 2023

**Elección:** Generales de España, 23 de julio de 2023 · **Modelo:** 0.3.0 · **Método:** codificación estandarizada 1.0.0.

Esta versión refleja la revisión humana cerrada registrada en [23J-2023-CODING-REVIEW.md](23J-2023-CODING-REVIEW.md). Los presets codifican posiciones identificables con evidencia textual mediante los pasos que ya existen en los controles; no reconstruyen presupuestos ni reproducen íntegramente los programas.

## Cobertura por candidatura

| Actor | Interpretados | Sin correspondencia |
|---|---:|---:|
| Partido Popular (PP) | 2 | 6 |
| Partido Socialista Obrero Español (PSOE) | 3 | 5 |
| VOX | 4 | 4 |
| Coalición Sumar | 6 | 2 |
| Esquerra Republicana de Catalunya (ERC) | 1 | 7 |
| EAJ-PNV | 2 | 6 |
| Bloque Nacionalista Galego (BNG) | 1 | 7 |
| Junts per Catalunya (Junts) | 0 | 8 |
| Euskal Herria Bildu (EH Bildu) | 3 | 5 |
| Coalición Canaria (CCa) | 0 | 8 |
| Unión del Pueblo Navarro (UPN) | 1 | 7 |

## Estado de los mappings

| Actor | DOCUMENTED + DIRECT | APPROXIMATED + STANDARDIZED_CODING | UNMAPPED + NONE |
|---|---:|---:|---:|
| PP | 0 | 2 | 6 |
| PSOE | 0 | 3 | 5 |
| VOX | 0 | 4 | 4 |
| Sumar | 0 | 6 | 2 |
| ERC | 0 | 1 | 7 |
| EAJ-PNV | 0 | 2 | 6 |
| BNG | 0 | 1 | 7 |
| Junts | 0 | 0 | 8 |
| EH Bildu | 0 | 3 | 5 |
| CCa | 0 | 0 | 8 |
| UPN | 0 | 1 | 7 |

## Posiciones interpretadas

| Actor | Control | Score | Evidencia principal | Confianza |
|---|---|---:|---|---|
| PP | `taxShift` | -1 | PP-IRPF-001, PP-PATRIMONIO-001 | MEDIUM |
| PP | `publicInvestment` | +1 | PP-VIVIENDA-002, PP-INFRA-001 | MEDIUM |
| PSOE | `transfers` | +1 | PSOE-TRANS-001…003, PSOE-SERV-002 | HIGH |
| PSOE | `publicInvestment` | +2 | PSOE-PUBINV-001…002 | HIGH |
| PSOE | `services` | +2 | PSOE-SERV-001…002 | MEDIUM |
| VOX | `taxShift` | -2 | VOX-IRPF-001…005 | HIGH |
| VOX | `progressivity` | -1 | VOX-IRPF-001, 002, 005 | MEDIUM |
| VOX | `consumptionTax` | -2 | VOX-IVA-001, VOX-VIVIENDA-001 | MEDIUM |
| VOX | `corporateTax` | -2 | VOX-SOC-001 | HIGH |
| Sumar | `taxShift` | +1 | SUMAR-IRPF-001 | MEDIUM |
| Sumar | `progressivity` | +2 | SUMAR-IRPF-001 | HIGH |
| Sumar | `corporateTax` | +2 | SUMAR-SOC-001 | HIGH |
| Sumar | `transfers` | +2 | SUMAR-TRANSFERS-001…007 | HIGH |
| Sumar | `publicInvestment` | +2 | SUMAR-PUBINV-001…004, SUMAR-SERV-002 | HIGH |
| Sumar | `services` | +2 | SUMAR-SERV-001…005 | HIGH |
| ERC | `progressivity` | +1 | ERC-FISC-002 | MEDIUM |
| BNG | `transfers` | +1 | BNG-TRANS-003 | MEDIUM |
| UPN | `taxShift` | -1 | UPN-FISC-001 | MEDIUM · APROBADO |
| EAJ-PNV | `progressivity` | +1 | PNV-FISC-001 | MEDIUM · APROBADO |
| EAJ-PNV | `publicInvestment` | +1 | PNV-PUBINV-001 | MEDIUM · APROBADO |
| EH Bildu | `progressivity` | +1 | EHBILDU-FISC-001 | MEDIUM · APROBADO |
| EH Bildu | `transfers` | +1 | EHBILDU-IMV-001 | HIGH · APROBADO |
| EH Bildu | `services` | +1 | EHBILDU-SERV-001 | MEDIUM · APROBADO |

## Controles sin correspondencia suficiente

PP `consumptionTax` queda `UNMAPPED`: las rebajas de IVA identificadas son parciales y/o temporales y no permiten inferir de forma suficientemente sólida un descenso de un paso completo en el tipo efectivo agregado sobre el consumo. Sumar `consumptionTax` queda `UNMAPPED`: el programa combina rebajas fiscales en determinados consumos con otras medidas de fiscalidad indirecta/ambiental, por lo que la dirección neta sobre un único tipo efectivo agregado de consumo es ambigua. Junts sigue 0/8 porque no se pudo recuperar el programa oficial 23J para verificar el mapping previo de IVA. EAJ-PNV queda 2/8 tras aprobar progresividad e inversión pública; UPN 1/8 por impuestos directos; EH Bildu 3/8 por progresividad, transferencias y servicios. CCa permanece 0/8 tras revisión explícita de los ocho controles: sus compromisos sobre pensiones, pobreza, dependencia y ayudas son en buena parte territoriales y no justifican una posición agregada estatal.

Los demás controles no interpretados tampoco permiten fijar una posición estatal con la evidencia disponible. `UNMAPPED` no significa que el programa proponga mantener el baseline. La limitación representacional de `investmentFriction` se mantiene: el baseline y el mínimo vigentes son 0, por lo que no cabe representar una reducción por debajo del baseline sin cambiar el control. Los estados de aprobación humana para las decisiones focalizadas constan en [23J-2023-CODING-REVIEW.md](23J-2023-CODING-REVIEW.md) y se exponen en el detalle del preset.

## Inventarios y antecedentes

Los inventarios anteriores se conservan como evidencia de revisión documental. Los JSON de codificación están en [`coding/`](coding/); las decisiones aprobadas y los estados `UNMAPPED_TRAS_REVISION` constan en [23J-2023-CODING-REVIEW.md](23J-2023-CODING-REVIEW.md). El criterio de inclusión y la fuente institucional de escaños constan en [CATALOGO-23J-2023.md](CATALOGO-23J-2023.md).
