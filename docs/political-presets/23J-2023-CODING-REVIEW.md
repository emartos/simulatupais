# Revisión humana de codificación — 23J 2023

Esta tabla refleja la primera revisión humana cerrada de la codificación 23J para el modelo 0.3.0.

Los valores se calculan desde el baseline seleccionado mediante los pasos existentes del control; la columna de referencia usa `public/data/spain.json` (cierre 2025). `APROBADO` indica que la codificación final ha sido revisada; `UNMAPPED_TRAS_REVISION` indica que no se aplica un score tras la revisión.

| Actor | Control | Score | Valor aplicado | Evidencias | Confianza | Revisión |
|---|---|---:|---:|---|---|---|
| PP | Impuestos directos sobre hogares | -1 | -0,5 pp | PP-IRPF-001, PP-PATRIMONIO-001 | MEDIUM | APROBADO |
| PP | Impuestos al consumo | — | Se conserva baseline | PP-IVA-001 (revisada) | — | UNMAPPED_TRAS_REVISION |
| PP | Inversión pública | +1 | 3,1 % PIB | PP-VIVIENDA-002, PP-INFRA-001 | MEDIUM | APROBADO |
| PSOE | Transferencias monetarias | +1 | +1 % | PSOE-TRANS-001, PSOE-TRANS-002, PSOE-TRANS-003, PSOE-SERV-002 | HIGH | APROBADO |
| PSOE | Inversión pública | +2 | 3,2 % PIB | PSOE-PUBINV-001, PSOE-PUBINV-002 | HIGH | APROBADO |
| PSOE | Gasto corriente en servicios | +2 | 19,4019 % PIB | PSOE-SERV-001, PSOE-SERV-002 | MEDIUM | APROBADO |
| VOX | Impuestos directos sobre hogares | -2 | -1 pp | VOX-IRPF-001…005 | HIGH | APROBADO |
| VOX | Progresividad | -1 | -0,5 pp | VOX-IRPF-001, VOX-IRPF-002, VOX-IRPF-005 | MEDIUM | APROBADO |
| VOX | Impuestos al consumo | -2 | 10 % | VOX-IVA-001, VOX-VIVIENDA-001 | MEDIUM | APROBADO |
| VOX | Impuesto de sociedades | -2 | 19 % | VOX-SOC-001 | HIGH | APROBADO |
| Sumar | Impuestos directos sobre hogares | +1 | +0,5 pp | SUMAR-IRPF-001 | MEDIUM | APROBADO |
| Sumar | Progresividad | +2 | +1 pp | SUMAR-IRPF-001 | HIGH | APROBADO |
| Sumar | Impuestos al consumo | — | Se conserva baseline | SUMAR-IVA-001, SUMAR-IVA-002 (revisadas) | — | UNMAPPED_TRAS_REVISION |
| Sumar | Impuesto de sociedades | +2 | 21 % | SUMAR-SOC-001 | HIGH | APROBADO |
| Sumar | Transferencias monetarias | +2 | +2 % | SUMAR-TRANSFERS-001…007 | HIGH | APROBADO |
| Sumar | Inversión pública | +2 | 3,2 % PIB | SUMAR-PUBINV-001…004, SUMAR-SERV-002 | HIGH | APROBADO |
| Sumar | Gasto corriente en servicios | +2 | 19,4019 % PIB | SUMAR-SERV-001…005 | HIGH | APROBADO |
| ERC | Progresividad | +1 | +0,5 pp | ERC-FISC-002 | MEDIUM | APROBADO |
| BNG | Transferencias monetarias | +1 | +1 % | BNG-TRANS-003 | MEDIUM | APROBADO |

## Historial de decisiones aplicadas

| Actor/control | Antes | Decisión cerrada |
|---|---|---|
| PP · `consumptionTax` | -1 / MEDIUM / activo | `UNMAPPED` · Las rebajas de IVA identificadas son parciales y/o temporales y no permiten inferir de forma suficientemente sólida un descenso de un paso completo en el tipo efectivo agregado sobre el consumo. |
| PSOE · `transfers` | +2 / HIGH | +1 / HIGH · El programa muestra una dirección clara de aumento de transferencias, pero la evidencia disponible no justifica clasificar el conjunto como un cambio fuerte de dos pasos en la escala normalizada. |
| Sumar · `consumptionTax` | -1 / MEDIUM / activo | `UNMAPPED` · El programa combina rebajas fiscales en determinados consumos con otras medidas de fiscalidad indirecta/ambiental; la dirección neta sobre un único tipo efectivo agregado de consumo es ambigua. |
| ERC · `progressivity` | +1 / LOW | +1 / MEDIUM · La dirección hacia mayor progresividad está suficientemente apoyada por propuestas explícitas sobre rentas altas y capital, aunque la intensidad se mantiene prudentemente en un solo paso. |

Los demás controles sin fila de mapping activo siguen sin correspondencia suficiente. Los JSON auditables están en [`coding/`](coding/) y los IDs y localizadores completos, en los [inventarios](inventory/).

## Revisión focalizada cerrada — UPN, EAJ-PNV, EH Bildu, CCa y Junts

Esta codificación aplica la misma rúbrica y usa el corpus oficial 23J descrito en la revisión secundaria. Los estados de revisión humana se reflejan también en el detalle del programa.

La propuesta histórica de `Junts consumptionTax: -1` se conserva aquí como antecedente. La revisión focalizada posterior no pudo verificar el documento oficial y la retiró del catálogo, dejándola `UNMAPPED`; véase [23J-2023-SECONDARY-REVIEW.md](23J-2023-SECONDARY-REVIEW.md).

| Actor | Control | Score | Valor aplicado | Evidencias | Confianza | Revisión |
|---|---|---:|---|---|---|---|
| UPN | `taxShift` | -1 | -0,5 pp | UPN-FISC-001 | MEDIUM | APROBADO |
| UPN | `transfers` | — | Se conserva baseline | UPN-TRANS-001/002 | — | UNMAPPED_TRAS_REVISION |
| EAJ-PNV | `progressivity` | +1 | +0,5 pp | PNV-FISC-001 | MEDIUM | APROBADO |
| EAJ-PNV | `publicInvestment` | +1 | +0,1 % PIB | PNV-PUBINV-001 | MEDIUM | APROBADO |
| EAJ-PNV | `transfers` | — | Se conserva baseline | PNV-TRANS-001/002 | — | UNMAPPED_TRAS_REVISION |
| EH Bildu | `progressivity` | +1 | +0,5 pp | EHBILDU-FISC-001 | MEDIUM | APROBADO |
| EH Bildu | `transfers` | +1 | +1 % | EHBILDU-IMV-001 | HIGH | APROBADO |
| EH Bildu | `services` | +1 | Baseline + 0,1 % PIB | EHBILDU-SERV-001 | MEDIUM | APROBADO |
| EH Bildu | `publicInvestment` | — | Se conserva baseline | EHBILDU-PUBINV-001 | — | UNMAPPED_TRAS_REVISION |
| Coalición Canaria (CCa) | `transfers` | — | Se conserva baseline | CC-TRANS-001 | — | UNMAPPED_TRAS_REVISION |
| Junts per Catalunya (Junts) | `consumptionTax` | — | Se conserva baseline | Fuente oficial no verificable en esta revisión | — | UNMAPPED_TRAS_REVISION |

Los demás controles de estos cinco actores permanecen sin mapping según la revisión secundaria. La cobertura se calcula a partir del catálogo; no se puntúan ni ordenan los actores por cobertura.
