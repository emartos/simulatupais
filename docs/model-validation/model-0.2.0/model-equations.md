# Ecuaciones del modelo 0.1.0

Fuente ejecutable: `src/core/engine.ts`; constantes: `src/core/model.ts`; base: `src/core/data.ts`. Las fórmulas transcriben el programa, no sustituyen su comportamiento por una formulación teórica. Variables monetarias macro son miles de millones EUR; los flujos se expresan anualizados salvo donde se indica; tasas internas son fracciones.

## A. Identidades contables

| EQ | Nombre económico | Archivo / símbolo | Fórmula de código | Tipo | Evidencia actual | Referencia al inventario original |
|---|---|---|---|---|---|
| EQ-001 | Renta disponible del hogar | `engine.ts` / `householdBudget` | `disposable = gross - tax + transfers` | `IDENTIDAD` | `FUERTE` — identidad comprobada dentro del estado, no valida la medición de los componentes | § Hogares, renta, impuestos y consumo |
| EQ-002 | Cierre de producto agregado | `engine.ts` / `stepState`, `validateState` | `gdpReal = consumption + services + investment + netExports` | `IDENTIDAD` | `FUERTE` — el factor común se construye para imponerla y se comprueba numéricamente | § Comercio, demanda, producto y capacidad |
| EQ-003 | Balance demográfico descompuesto | `engine.ts` / `stepState` | `P(t)=P(t-1)+births-deaths+residual` | `IDENTIDAD` | `FUERTE` — igualdad algebraica; la interpretación de residual como movilidad/ajustes es débil | § Demografía |
| EQ-004 | Déficit anualizado | `engine.ts` / `stepState` | `deficit = spending - revenue` | `IDENTIDAD` | `FUERTE` — definición computacional de saldo, cuentas de entrada sintéticas | § Fiscalidad y deuda |
| EQ-005 | Evolución de deuda neta | `engine.ts` / `stepState`, `validateState` | `debt-publicAssets = debtPrev-publicAssetsPrev + deficit/12` | `IDENTIDAD` | `FUERTE` — conciliación implementada y comprobada; no implica SFC completo | § Fiscalidad y deuda |
| EQ-006 | Cálculo de deuda/PIB | `engine.ts` / `point` | `debtRatio = debt / gdpNominal * 100` | `IDENTIDAD` | `FUERTE` — cociente aritmético; numerador stock y denominador flujo anualizado | § Fiscalidad y deuda; indicador en § Inicialización |
| EQ-007 | Conciliación del catálogo | `data.ts` / `selectBase` | `GDP = C + services + investment + exports - imports` | `IDENTIDAD` | `PARCIAL` — se valida al seleccionar; la consistencia de fuente/periodo de todos los datos no queda probada | § Datos seleccionados |

### Variables, unidades y temporalidad de las identidades EQ-001–007

| EQ | Variables económicas (código) | Unidad y clase | Temporalidad | PAR-xxx | Límites/condiciones |
|---|---|---|---|---|---|
| EQ-001 | renta bruta `gross`, impuesto `tax`, transferencia `transfers`, renta disponible `disposable` por grupo | cada una mil millones EUR/año, flujo nominal agregado por grupo, no per cápita | mes t; renta bruta calculada desde PIB nominal t−1 | shares/tipos PAR-001–009 y PAR-069 | gross/tax/transfer limitados por entrada y clamps EQ-009/010 |
| EQ-002 | producción `gdpReal`; consumo `consumption`; servicios `services`; inversión `investment`; exportación neta `netExports` | mil millones EUR constantes/año, flujos agregados, no stocks ni per cápita | mes t, mismo periodo | realización PAR-026 | la identidad se valida con tolerancia PAR-076 |
| EQ-003 | `population`, `births`, `deaths`, `residual` | stock personas; contribuciones personas/mes | población t−1 más flujos del mes t | datos base; conversión mensual PAR-037; residual PAR-082 | población debe ser positiva |
| EQ-004 | `spending`, `revenue`, `deficit` | mil millones EUR corrientes/año, flujos agregados | flujos del mes t; déficit positivo significa gasto>ingreso | cuotas fiscales PAR-038–040, controles | sin clamp específico |
| EQ-005 | `debt`, `publicAssets` | stock nominal, mil millones EUR; `deficit` flujo nominal anualizado | stock t−1 más un doceavo del flujo t | PAR-037, PAR-041 | debt/assets tienen suelo cero PAR-087 |
| EQ-006 | deuda al cierre `debt`; PIB nominal anualizado `gdpNominal`; `debtRatio` | ratio %, stock EUR / flujo EUR/año, agregado; no per cápita | estado de cierre de t dividido por flujo de t | PAR-062 | requiere PIB nominal distinto de cero/positivo por dominio |
| EQ-007 | PIB y componentes del catálogo `gdp`, `consumption`, `services`, `investment`, `exports`, `imports` | mil millones EUR de catálogo, flujos agregados; precios/base según etiqueta fuente | periodo anual base, salvo IDs con periodo distinto que no forman identidad del producto | datos catalogados; tolerancia PAR-075 | exige conciliación y cobertura; no corrige discrepancias |

## B. Relaciones de comportamiento

Campos por variable: unidad; stock/flujo/ratio; nominal/real; agregado/per cápita; frecuencia. `t` denota mes nuevo y `t−1` estado previo. Referencia al inventario original: [Inventario § inicialización y reglas](../INVENTARIO-ECONOMICO-MODELO-0.1.0.md#reglas-económicas-ejecutadas).

### EQ-008 — Ingreso bruto sintético de grupos

- **Nombre/archivo/símbolo:** renta bruta asignada; `src/core/engine.ts`, `householdBudget`.
- **Fórmula:** `grossᵢ(t) = gdpNominal(t−1) × PAR-001 × PAR-002ᵢ`.
- **Variables:** `gdpNominal` / PIB nominal / mil millones EUR / flujo anualizado / nominal / agregado / mensual rezagado; `grossᵢ` / ingreso bruto del grupo / mil millones EUR/año / flujo / nominal / grupo agregado / mensual; cuotas adimensionales.
- **Temporalidad:** ingreso contemporáneo `t` basado en PIB nominal `t−1`; no hay media.
- **Parámetros:** PAR-001, PAR-002.
- **Límites:** ninguno en esta operación.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — las participaciones son sintéticas, sin estimación de distribución de renta documentada.

### EQ-009 — Impuesto directo sintético y progresividad

- **Fórmula:** `shiftᵢ = taxShift/100 + mᵢ·progressivity/100`; `rateᵢ = clamp(baseRateᵢ + shiftᵢ, 0, 0.65)`; `taxᵢ = grossᵢ × rateᵢ`; `m=(-0.5,0,1)`.
- **Código:** `engine.ts`, `householdBudget`; configuración `policy.ts`.
- **Variables:** `taxShift`, `progressivity` / puntos porcentuales de tipo / entradas de política / vigencia por paso; `rate` / tasa / fracción / ratio / grupo / mensual; `tax`,`gross` / mil millones EUR/año / flujos nominales agregados por grupo.
- **Temporalidad:** se recalcula cada mes con renta nominal rezagada y política vigente. Al cambiar política en mes `m`, se aplica al paso posterior según el avance del motor.
- **Parámetros:** PAR-003, PAR-004/PAR-062, PAR-005, PAR-006, PAR-079.
- **Límites:** cada tipo recortado a `[0,0.65]`; puede saturar y neutralizar el cambio marginal.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — tipos, grupos y regla progresiva no están respaldados como curva tributaria observada.
- **Inventario original:** § Hogares, renta, impuestos y consumo.

### EQ-010 — Transferencias

- **Fórmula:** `transferᵢ(t)=gdpNominal(t−1)×PAR-007×(1+transfers/100)×shareᵢ`.
- **Variables:** `transfers` / variación porcentual frente a referencia / parámetro; `transferᵢ` / mil millones EUR/año / flujo nominal / grupo agregado / mensual; PIB nominal rezagado.
- **Temporalidad:** contemporánea sobre base de `t−1`, mientras política se mantiene.
- **Parámetros:** PAR-007, PAR-008, PAR-062.
- **Límites:** política `transfers` de −25 a +35 %, sin clamp interno a la transferencia; el dominio de entrada asegura factor positivo.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — importe base y reparto son convenciones sintéticas.
- **Inventario original:** § Hogares, renta, impuestos y consumo.

### EQ-011 — Consumo deseado

- **Fórmula:** `consumptionᵈᵉˢᵢᵣₑdᵢ(t)=disposableᵢ(t)×clamp(propensityᵢ×consumptionScale,0,1)`; agregado para demanda: `Σ consumptionᵈᵉˢᵢᵣₑdᵢ / consumerPriceProvisional`.
- **Código:** `householdBudget`, `consumptionScale`, `stepState`.
- **Variables:** renta disponible / flujo nominal anualizado por grupo; consumo deseado / flujo nominal anualizado por grupo antes de conversión a demanda real; escala de consumo / índice adimensional; precio consumidor / índice adimensional.
- **Temporalidad:** ingreso y política del paso `t`, basados en PIB nominal `t−1`; sin media; luego factor de realización contemporáneo.
- **Parámetros:** PAR-009, PAR-010, PAR-011.
- **Límites:** propensión efectiva limitada a `[0,1]`.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `PARCIAL` — agregado inicial se fuerza a coincidir con consumo catalogado; propensiones por grupo y respuesta conductual sin evidencia.
- **Inventario original:** § Hogares, renta, impuestos y consumo.

### EQ-012 — Poder adquisitivo real por persona

- **Fórmula:** `realPerPersonᵢ(t)=disposableᵢ(t)×10⁹/[population(t)×populationShareᵢ×consumerPrice(t)]`; indicador agregado es media ponderada por `populationShare`.
- **Variables:** renta disponible / flujo nominal anualizado; población / stock personas; cuota poblacional / adimensional; precio consumidor / índice; resultado / EUR/persona/año, per cápita real, mensual.
- **Temporalidad:** renta basada en `t−1`; población/precios del paso `t`; no es salario ni microdato.
- **Parámetros:** PAR-002, PAR-012.
- **Límites:** población y precio deben ser positivos; validador comprueba estado.
- **Tipo:** `TECNICA`.
- **Evidencia:** `PARCIAL` — aritmética directa, pero los insumos son hogares sintéticos.
- **Inventario original:** § Hogares, renta, impuestos y consumo.

### EQ-013 — Factor de nivel del impuesto al consumo

- **Fórmula:** `q(t)=(1+consumptionTax/100)/(1+PAR-013)`; `consumerPriceProvisional(t)=producerPrice(t−1)×q(t)`; `consumerPrice(t)=producerPrice(t)×q(t)`.
- **Variables:** tasa política / porcentaje de base pre-impuesto; `q` / índice relativo adimensional; precios / índices de precio; mensual.
- **Temporalidad:** contemporánea, usa productor previo para presupuesto; no compone q a través del tiempo.
- **Parámetros:** PAR-013, PAR-062.
- **Límites:** tasa de política 5–18 % en `BOUNDS`; denominador fijo positivo.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — no se modelan cestas, exenciones o pass-through diferenciado.
- **Inventario original:** § Impuesto al consumo, inversión y servicios.

### EQ-014 — Inversión privada deseada

- **Fórmula:** `Iᵖ(t)=[I₀−Y₀·PAR-014]×[capacity(t−1)/Y₀]×[((1−corpTax/100)/(1−PAR-015))^PAR-016]×exp(−PAR-017·friction/100)`.
- **Variables:** inversión base, PIB base, capacidad previa / mil millones EUR constantes; tipos / porcentaje; inversión deseada / flujo real anualizado; mensual.
- **Temporalidad:** estado de capacidad `t−1`; inversión resultante afecta demanda `t`, stock capital `t` y capacidad desde paso posterior.
- **Parámetros:** PAR-015–PAR-017, PAR-062.
- **Límites:** tasa corporativa 10–35 %, fricción 0–8; no clamp a factor o inversión.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — función y elasticidades son supuestos sin ajuste empírico documentado.
- **Inventario original:** § Impuesto al consumo, inversión y servicios.

### EQ-015 — Inversión pública y servicios deseados

- **Fórmulas:** `publicInvestmentᵈ(t)=gdpReal(t−1)×publicInvestmentPolicy/100`; `servicesᵈ(t)=gdpReal(t−1)×servicesPolicy/100`.
- **Variables:** PIB real / flujo anualizado; parámetros / porcentaje PIB; cantidades deseadas / flujos reales anualizados; mensual.
- **Temporalidad:** PIB del estado previo; persistente mientras política se mantenga.
- **Parámetros:** PAR-018; baseline de inversión pública PAR-014.
- **Límites:** public investment 1–6 %, services 15–25 % en validación de entrada.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — tratamiento como demanda agregada, sin composición ni función de producción de servicios.
- **Inventario original:** § Impuesto al consumo, inversión y servicios.

### EQ-016 — Exportaciones, importaciones y demanda

- **Fórmula:** `X(t)=X₀(1+PAR-019)^(t/12)(1+external.demand)`; `M(t)=M₀×domesticDesired(t)/domesticBase`; `NX=X−M`; `demand=consumptionDesired+servicesDesired+investmentDesired+NX`.
- **Variables:** comercio y demanda / flujos reales anualizados agregados / mes; shock demanda adimensional.
- **Temporalidad:** tendencia acumulativa desde mes `t`; política/demanda contemporáneas; fuente de exportaciones e importaciones fija en base.
- **Parámetros:** PAR-019, PAR-020.
- **Límites:** demanda debe ser positiva, si no arroja error. No hay clamp comercial.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — elasticidad importadora implícita 1 y tendencia exportadora sin fuente econométrica.
- **Inventario original:** § Comercio, demanda, producto y capacidad.

### EQ-017 — Población mensual

- **Fórmula:** `birth(t)=P(t−1)×births₀/P₀/12`; `death(t)=P(t−1)×deaths₀/P₀/12`; `residual(t)=P(t−1)×(P₀−P₋₁−births₀+deaths₀)/P₀/12`; `P(t)=P(t−1)+birth−death+residual`.
- **Variables:** población / stock personas; componentes / flujos personas/mes; tasas base derivadas de catálogo / fracción anual.
- **Temporalidad:** acumulación mensual a tasas constantes; sin respuesta a economía.
- **Parámetros:** datos `births`, `deaths`, `population`, `populationPrevious`; divisor PAR-037.
- **Límites:** solo positividad global del estado.
- **Tipo:** `HEURISTICA` (extrapolación fija), con identidad contable de acumulación.
- **Evidencia:** `PARCIAL` — reproduce algebraicamente la variación entre dos poblaciones del catálogo, no valida su descomposición futura.
- **Inventario original:** § Demografía.

### EQ-018 — Capacidad productiva

- **Fórmula:** `popGrowth=P₀/P₋₁−1`; `capacity(t)=capacity(t−1)×exp(PAR-021/12+PAR-020×popGrowth/12+PAR-022×(investment(t−1)/12/capital(t−1)−PAR-023/12)+external.supply)`.
- **Variables:** capacidad / potencial de flujo mil millones EUR constantes/año; capital / stock mil millones EUR constantes; inversión / flujo anualizado real; crecimiento / tasa anual fraccional; mensual.
- **Temporalidad:** crecimiento/stock anterior, inversión rezagada un mes, shock contemporáneo; crecimiento exponencial acumulativo.
- **Parámetros:** PAR-020–PAR-023, PAR-037.
- **Límites:** capacidad no tiene techo; estado exige positiva.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — elasticidad de capital y ponderación demográfica sin estimación documentada.
- **Inventario original:** § Comercio, demanda, producto y capacidad.

### EQ-019 — Ajuste de producción y realización

- **Fórmula:** `target=min(demand,capacity×(1+PAR-025))`; `Y(t)=Y(t−1)+PAR-026×(target−Y(t−1))`; `realization=Y(t)/demand`; cada componente deseado se multiplica por realization.
- **Variables:** producción/demanda/capacidad/componentes / flujos agregados real anualizados; realization / ratio; mensual.
- **Temporalidad:** contemporánea con persistencia vía `Y(t−1)`; sin memoria adicional.
- **Parámetros:** PAR-025, PAR-026.
- **Límites:** techo de objetivo a capacidad×1,05; ajuste de 32 %; no suelo explícito sobre target; error si demanda no positiva.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — coeficientes y racionamiento proporcional no se estiman/documentan empíricamente.
- **Inventario original:** § Comercio, demanda, producto y capacidad.

### EQ-020 — Precios e inflación subyacente

- **Fórmula:** `gap=(demand−capacity)/capacity`; `piTarget=PAR-027+gap×PAR-028+energy×PAR-029`; `pi(t)=clamp(PAR-030×pi(t−1)+(1−PAR-030)×piTarget, PAR-031, PAR-032)`; `producerPrice(t)=producerPrice(t−1)×exp(pi(t)/12)`.
- **Variables:** gap/crecimiento/shock / ratios; inflación / tasa anual fraccional; precio productor / índice; mensual.
- **Temporalidad:** subyacente persistente; precio acumulativo; brecha contemporánea; energía contemporánea.
- **Parámetros:** PAR-027–PAR-032, PAR-037.
- **Límites:** inflación subyacente −4 % a +30 %; saturación en ambos extremos.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — ancla, persistencia y respuestas no tienen fuente empírica en el proyecto.
- **Inventario original:** § Capital, precios e inflación.

### EQ-021 — Inflación interanual del índice consumidor

- **Fórmula:** append `consumerPrice(t)` a `priceMemory`, conservar últimos 13; `inflation(t)=consumerPrice(t)/priceMemory[0]−1`.
- **Variables:** precios índice sin unidad / nivel; inflación interanual / fracción de variación; mensual.
- **Temporalidad:** ventana móvil de 13 índices separada por 12 intervalos; mes 0 parte de memoria sintética.
- **Parámetros:** PAR-033.
- **Límites:** precio positivo.
- **Tipo:** `TECNICA`.
- **Evidencia:** `PARCIAL` — cálculo del cambio interanual es aritmético; memoria de arranque no observada y precio incorpora wedge tributario.
- **Inventario original:** § Capital, precios e inflación.

### EQ-022 — Desempleo

- **Fórmula:** `growth=ln(Y(t)/Y(t−1))×PAR-037`; `u(t)=clamp(u(t−1)−PAR-034×(growth−PAR-021−popGrowth)/PAR-037, PAR-035, PAR-036)`.
- **Variables:** PIB real / flujo anualizado; paro / tasa población activa; productividad y crecimiento / fracciones anuales; mensual.
- **Temporalidad:** un paso mensual desde paro anterior; crecimiento del PIB anualizado a partir del cambio mensual; sin salarios.
- **Parámetros:** PAR-021, PAR-034–PAR-037.
- **Límites:** 1,5–45 %.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — coeficiente reducido sin estimación documentada.
- **Inventario original:** § Empleo y desempleo.

### EQ-023 — Ingresos públicos

- **Fórmula:** `revenue=Σtaxᵢ + consumption×consumerPrice×(consumptionTax/100)/(1+consumptionTax/100) + gdpNominal×0.25×corporateTax/100 + gdpNominal×(0.10+0.045)`.
- **Variables:** entradas tributarias / flujos nominales anualizados; impuesto hogares usa valores sobre PIB nominal anterior; consumo/PIB nominal contemporáneo; mensual.
- **Temporalidad:** flujo se calcula por periodo y no se acumula salvo efecto a deuda.
- **Parámetros:** PAR-003–PAR-008, PAR-013, PAR-038–PAR-040, PAR-062.
- **Límites:** no clamp fiscal propio; entradas de política acotadas.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — cuotas fiscales sintéticas, no presupuesto observado.
- **Inventario original:** § Fiscalidad y deuda.

### EQ-024 — Gasto público e intereses

- **Fórmula:** `interest(t)=debt(t−1)×PAR-041`; `spending=(servicesRealized+publicInvestmentRealized)×producerPrice(t)+Σtransfers(t)+interest(t)`.
- **Variables:** deuda / stock nominal; interés/gasto/transferencias / flujos nominales anualizados; precios / índice; mensual.
- **Temporalidad:** deuda e interés rezagados; gasto del paso contemporáneo.
- **Parámetros:** PAR-007, PAR-018, PAR-041.
- **Límites:** no hay techo/tipo dependiente de deuda.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `NINGUNA` — gasto e interés no se contrastan con cuentas o tipos de deuda observados.
- **Inventario original:** § Fiscalidad y deuda.

### EQ-025 — Deuda y activos públicos

- **Fórmula:** `net(t)=debt(t−1)−assets(t−1)+deficit(t)/12`; `debt(t)=max(0,net(t))`; `assets(t)=max(0,−net(t))`.
- **Variables:** deuda y activos / stocks nominales mil millones EUR; déficit / flujo nominal anualizado; mensual.
- **Temporalidad:** acumulación mensual; amortización implícita primero contra deuda y después activo.
- **Parámetros:** PAR-037, PAR-041, PAR-087.
- **Límites:** suelo cero aplicado por separado; no hay stock negativo.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `PARCIAL` — identidad neta comprobada; composición financiera y flujos son sintéticos.
- **Inventario original:** § Fiscalidad y deuda.

### EQ-026 — Stock de capital

- **Fórmula:** `K(t)=K(t−1)×(1−PAR-023/PAR-037)+investmentRealized(t)/PAR-037`.
- **Variables:** capital / stock real mil millones EUR; inversión / flujo real anualizado; mensual.
- **Temporalidad:** acumulación y depreciación mensual; el capital resultante incide en capacidad de pasos posteriores.
- **Parámetros:** PAR-023, PAR-037.
- **Límites:** estado exige capital positivo.
- **Tipo:** `HEURISTICA`.
- **Evidencia:** `PARCIAL` — identidad de acumulación simple, definición de inversión/capital y elasticidad productiva sin validación.
- **Inventario original:** § Capital, precios e inflación.

### EQ-027 — Calibración algebraica del consumo

- **Fórmula:** `consumptionScale = C_cat / Σ householdBudget(Y_cat,P_cat,1,baselinePolicy).consumption`.
- **Código:** `engine.ts`, `consumptionScale`.
- **Variables:** `C_cat`,`Y_cat` / mil millones EUR/año; `P_cat` / personas; resultado / ratio adimensional.
- **Temporalidad:** calculado una vez al crear estado para una base; no es media temporal.
- **Parámetros:** PAR-001–PAR-009; datos de catálogo.
- **Límites:** depende de presupuesto positivo y shares válidas; sin clamp explícito al resultado de escala.
- **Tipo:** `CALIBRADA`.
- **Evidencia:** `PARCIAL` — coincidencia inicial de consumo por construcción, el factor no demuestra comportamiento dinámico correcto.
- **Inventario original:** § Inicialización.

### EQ-030 — Asignación del estado inicial

- **Fórmula:** `Yreal(0)=Ynom(0)=GDP_cat`; `P(0)=population_cat`; `capacity(0)=GDP_cat`; `capital(0)=GDP_cat×PAR-024`; `u(0)=u_cat`; `debt(0)=debt_cat`, `assets(0)=0`; `consumerPrice(0)=producerPrice(0)=1`; `pi(0)=pi_cat`; `priceMemory[i]=(1+pi_cat)^((i−12)/12)`, `i=0…12`; flujos iniciales toman valores de catálogo salvo inversión pública sintética `GDP×3 %`.
- **Código:** `engine.ts`, `initialState`.
- **Variables:** stocks, índices y flujos mantienen las unidades definidas en tabla de variables.
- **Temporalidad:** mes 0; memoria sintética de 13 niveles de precios.
- **Parámetros:** PAR-024, PAR-033, PAR-070–PAR-072, PAR-085, PAR-086; catálogo base.
- **Límites:** base exige cobertura/positividad y concilia PIB; capital inicial se construye por ratio.
- **Tipo:** `TECNICA`.
- **Evidencia:** `PARCIAL` — inicialización reproducible, pero capital, inversión pública, cuentas fiscales y memoria incluyen construcciones.
- **Inventario original:** § Inicialización.

### EQ-028 — Generador determinista de shocks

- **Fórmula:** `draw(seed,m,c)` inicia `x=seed XOR imul(m+1,C1) XOR imul(c+1,C2)`, aplica dos rondas de xor/shift/multiplicación módulo 2³² y devuelve `U=x/2³²`; `hit=U₀<PAR-051`; `type=floor(U₁×3)`; `sign=−1 si U₂<0,5, si no +1`; `magnitude=(0,5+U₃)×sign`. Según `type`, energía=`hit?magnitude×0,12:0`, demanda=`hit?magnitude×0,04:0`, oferta=`hit?magnitude×0,004:0`.
- **Código:** `src/core/random.ts`, `draw`, `externalAt`.
- **Variables:** seed uint32, mes entero, canal entero, `U` adimensional; componentes shock: energía/demanda/oferta fracciones.
- **Temporalidad:** determinista por semilla-mes-canal; no depende del orden de llamadas.
- **Parámetros:** PAR-051–PAR-061, PAR-064–PAR-068.
- **Límites:** hash módulo uint32; `U∈[0,1)`; tipo 0–2; evento binario mensual.
- **Tipo:** `TECNICA`.
- **Evidencia:** `FUERTE` sobre reproducibilidad del algoritmo; `NINGUNA` sobre que la distribución represente incertidumbre económica.
- **Inventario original:** § Shocks y reproducibilidad.

### EQ-029 — Aplicación temporal de políticas y bifurcación

- **Fórmula:** al configurar rama en mes `m>0`, registrar `{month:m,policy:newPolicy}`; cada paso calcula `state(m+1)=stepState(state(m), policy vigente, externalAt(seed,m+1))`. En bifurcación `forkMonth=m`, rama B copia estado/historia de A en `m` y la política se registra en `m`; A conserva su receta.
- **Código:** `engine.ts`, `withPolicyAt`, `configureBranch`, `compareFrom`, `fork`, `advance`.
- **Variables:** estado económico, política, semilla y mes; mes entero/frecuencia mensual.
- **Temporalidad:** historia previa no reescrita; cambio configurado en `m` afecta el primer paso posterior; estado se hereda al bifurcar; shock mensual compartido.
- **Parámetros:** semilla PAR-060/PAR-088; avance mensual PAR-037; horizonte PAR-059.
- **Límites:** máximo de avance por operación 240 meses y techo global en `advance`; política pasa por `validatePolicy`.
- **Tipo:** `TECNICA`.
- **Evidencia:** `FUERTE` para la semántica de código; no es evidencia económica.
- **Inventario original:** § Comparación y aleatoriedad.

## C. Reglas heurísticas

EQ-008–011, EQ-013–020 y EQ-022–026 son heurísticas, incluso cuando dentro de la regla aparezca una identidad aritmética. No se deben llamar `EMPIRICA` sin fuente/estimación específica. Tendencia exportadora y los tres shocks forman parte de EQ-016/EQ-018/EQ-020.

## D. Restricciones técnicas

Clamps de EQ-009, EQ-011, EQ-020 y EQ-022, techo de capacidad EQ-019, suelos de deuda/activos EQ-025, controles de dominio y errores de demanda/estado son restricciones computacionales, no relaciones económicas. El máximo temporal es 240 meses (`model.ts`).

## Variables y unidades auxiliares

| Nombre económico | Código | Unidad | Naturaleza | Escala | Frecuencia |
|---|---|---|---|---|---|
| PIB real | `gdpReal` / `Point.gdp` | mil millones EUR constantes/año | flujo/tasa anualizada | agregado | mes |
| PIB nominal | `gdpNominal` / `Point.nominal` | mil millones EUR corrientes/año | flujo/tasa anualizada | agregado | mes |
| Capacidad | `capacity` | mil millones EUR constantes/año | capacidad productiva | agregado | mes |
| Capital | `capital` | mil millones EUR constantes | stock | agregado | mes |
| Consumo/servicios/inversión/NX | `consumption/services/investment/netExports` | mil millones EUR constantes/año, salvo impuestos/cuentas | flujos anualizados | agregado | mes |
| Deuda/activos públicos | `debt/publicAssets` | mil millones EUR corrientes | stocks | agregado | mes |
| Revenue/spending/deficit | mismos identificadores | mil millones EUR/año nominales | flujos anualizados | agregado | mes |
| Paro/inflación subyacente | `unemployment/underlyingInflation` | fracción | tasa | agregada | mes |
| Inflación reportada | `inflation` / `Point.inflation` | fracción / porcentaje | cambio 12 meses | agregado | mes |
| Precio productor/consumidor | `producerPrice/consumerPrice` | índice relativo | índice | agregado | mes |
| Memoria de precio | `priceMemory` | índice relativo | vector de 13 niveles | agregado | mensual |
| Población | `population` | personas | stock | agregado | mes |
| Poder adquisitivo | `realPerPerson` / `Point.purchasingPower` | EUR/persona/año | renta real media | per cápita | mes |
| Household gross/tax/transfers/disposable | campos `Household` | mil millones EUR/año | flujos sintéticos | grupo agregado | mes |
| Crecimiento, brecha, realización | auxiliares `growth/gap/realization` | tasa/tasa/ratio | no stocks | agregado | mes |

### Correcciones de lectura respecto al inventario fuente

`consumptionScale` no es un coeficiente conductual estimado, sino el multiplicador algebraico conjunto para conciliar C inicial. `externalDemandExposure` es constante declarada e inerte. La cifra `employed` se usa fuera del motor; no se etiqueta como ecuación de empleo simulada.
