# Stocks y flujos — modelo 0.1.0

Clasificación global: **`NO_SFC`** (no hay marco stock-flow consistent completo de sectores). El código hace conciliar algunas cuentas internas y una identidad de producto, pero no representa balances de hogares, empresas, gobierno, bancos y resto del mundo de forma simultánea.

| Stock | Código | Fórmula ejecutada | Entradas/salidas y frecuencia | Estado de revisión |
|---|---|---|---|---|
| Población | `State.population` | `P(t)=P(t−1)+birth(t)−death(t)+residual(t)` | tasas anuales derivadas /12; acumulación mensual | la suma reconstruye el crecimiento observado entre dos niveles; composición futura fija |
| Capital | `State.capital` | `K(t)=K(t−1)×(1−depreciation/12)+investment(t)/12` | inversión total realizada entra; depreciación sale; mensual | una sola clase de capital; sin formación neta observada ni propiedad sectorial |
| Deuda bruta | `State.debt` | `D(t)=max(0,D(t−1)−A(t−1)+deficit(t)/12)` | déficit positivo añade; superávit amortiza; mensual | stock público sintético; si cruza cero, excedente pasa a activo |
| Activos públicos | `State.publicAssets` | `A(t)=max(0,−[D(t−1)−A(t−1)+deficit/12])` | acumula superávit tras extinguir deuda; reduce deuda neta | activo residual; sin instrumento/rendimiento/tenedor |
| Precio productor | `producerPrice` | `Pp(t)=Pp(t−1)×exp(pi(t)/12)` | cambio de precio mensual acumulativo | índice, sin unidad monetaria |
| Memoria precio consumidor | `priceMemory` | append `Pc(t)`, conservar últimos 13 | ventana móvil; pierde el nivel más antiguo cada mes | buffer técnico, no stock económico; arranque sintético |
| PIB real/nominal | `gdpReal/gdpNominal` | flujos anualizados de periodo; no se acumulan a PIB anual | producción de cada paso; nominal=real×precio productor | flujos, no stock |
| Capacidad | `capacity` | `capacity(t)=capacity(t−1)×exp(growthPotential+capitalEffect+shock)` | acumulación multiplicativa mensual | stock/flujo de capacidad en EUR constantes/año, proxy productivo |

## Chequeos de flujo

- Las ecuaciones de hogares concilian `gross − tax + transfers = disposable` (EQ-001), pero no existe ahorro del hogar como residual que se acumule en activo financiero.
- EQ-002 cierra el PIB por componentes en una cuenta agregada. No registra quién compra cada bien, ahorro, inventarios, importaciones intermedias ni contrapartidas externas completas.
- Déficit suma a deuda neta en doceavos; interés se calcula sobre deuda bruta previa a tipo fijo. Los pagos de interés son gasto, pero no hay perfil de vencimientos ni valoración de instrumentos.
- Inversión pública se cuenta dentro de inversión en el cierre del producto y en gasto del gobierno. En el código no se suma además como “servicio”; esto evita duplicarla dentro del PIB, pero las cuentas fiscales siguen sintéticas.
- La inversión privada deseada se deriva de inversión total base menos 3 % de PIB y de factores de capacidad/beneficio/fricción. No tiene origen de fondos; no se asigna una contrapartida ahorro-crédito.
- Exportaciones menos importaciones entran en el PIB. No hay cuenta corriente/capital que concilie NX con activos y deuda externos.
- Los flujos anualizados se dividen entre 12 para población, capital y deuda. El presupuesto de paso es anualizado y se acumula como un doceavo, suponiendo que el valor del paso representa una tasa anual del mes.
- Puede crearse `publicAssets` sintético cuando un superávit neto excede deuda; no se especifica activo público, rendimiento o quién lo mantiene.

**Resultado:** coherencia parcial de identidades internas; no `SFC_COMPLETO`, y `SFC_PARCIAL` se reserva aquí para sistemas con sectores/balances parciales explícitos. Como el código carece de esas cuentas parciales, se clasifica `NO_SFC`.
