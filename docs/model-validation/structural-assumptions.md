# Supuestos estructurales y componentes omitidos

Estado descriptivo del código 0.1.0; no evalúa aún si las omisiones son aceptables.

| Bloque | Estado | Lo que representa el código |
|---|---|---|
| Política monetaria | omitida | no hay regla monetaria |
| BCE / euro | omitido | sin BCE, pertenencia monetaria, tipo oficial ni reglas del euro |
| Tipos de interés | fijo simplificado | un PAR-041 anual sobre deuda previa; no sigue BCE ni mercado |
| Tipo de cambio | omitido | export/import sin tipo de cambio |
| Comercio exterior | simplificado/exógeno | exportación con tendencia anual y shock; importación proporcional a demanda doméstica |
| Precios relativos | omitidos | no hay precios comerciales relativos, términos de intercambio ni inflación por sector |
| Productividad | exógena/fija | tasa anual hipotética 0,9 % más efecto de inversión/capital en capacidad |
| Demografía | exógena/fija | nacimientos, muertes y residuo proporcionales constantes; no responde a política |
| Expectativas | omitidas | no hay anticipación ni previsión de hogares/empresas |
| Financiación de deuda | simplificada | déficit se acumula a deuda neta; sin compradores, vencimientos o moneda de emisión |
| Prima soberana | omitida | coste uniforme fijo |
| Crowding out | omitido | no hay fondos prestables ni competencia de financiación pública/privada |
| Restricciones de oferta | simplificadas | capacidad dinámica, margen 5 %, racionamiento proporcional y shocks |
| Mercado laboral | regla reducida | desempleo responde al crecimiento frente a productividad y población |
| Salarios | omitidos | no hay salario nominal/real ni negociación |
| Participación laboral | fija derivada fuera del motor | interfaz deriva ocupados con participación inicial implícita; no estado dinámico de labor force |
| Empresas | agregadas/sintéticas | inversión privada mediante fórmula; sin cuentas, entrada/salida o heterogeneidad empresarial |
| Crédito | omitido | no préstamos, balance bancario o restricción financiera |
| Ahorro | omitido | no hay decisión ni stock financiero de hogares/empresas |
| Sector financiero | omitido | no hay bancos, activos, pasivos ni política prudencial |
| Heterogeneidad hogares | simplificada | tres grupos sintéticos con shares fijos, no hogares/datos micro |
| Comportamiento de hogares | regla fija | propensiones constantes; no optimización, deuda, ahorro o expectativas |
| Comportamiento empresarial | regla reducida | inversión responde a rentabilidad retenida, escala capacidad y friction |
| Reacción fiscal | omitida | tasas/gasto no responden automáticamente a ciclo/deuda |
| Reacción monetaria | omitida | no hay banco central ni objetivo monetario |
| Instituciones | eventos narrativos | calendario procedural; expresividad/revisión judicial validada/almacenada pero sin resultado económico |
| Incertidumbre | shock determinista | un trayecto por semilla; no distribución estimada o intervalos de confianza |
| Impuestos | sintéticos | tres tipos directos, factor simple de consumo, cuota corporativa/PIB |
| Servicios públicos | demanda agregada | no se produce calidad, acceso o resultado social de servicios |
| Inversión pública | componente de inversión agregada | suma a inversión/capital y gasto; no eficacia pública específica |
| Deuda/activos | stock neto de una sola cuenta | superávit amortiza deuda y después produce activo abstracto |

Las afirmaciones se limitan a presencia/ausencia de mecanismos en `src/core`. No atribuyen racionalidad, validez empírica o consecuencias políticas a las simplificaciones.
