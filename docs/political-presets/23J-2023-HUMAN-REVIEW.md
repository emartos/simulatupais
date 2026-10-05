# Revisión humana pendiente — programas 23J 2023

## Estado de publicación

En la versión 3.0.0 no hay mapeos `DOCUMENTED` ni `APPROXIMATED` activos: los ocho controles de cada preset conservan el valor vigente porque el efecto agregado completo no está calculado o no es comparable con la semántica del modelo. Los componentes cuantificados de Sumar son evidencia de inventario, no valores aplicados.

## Coalición Sumar — transfers (no activo; agregación pendiente)

**Medidas candidatas:** bono hipotecario de 1.000 M€ (importe total declarado, recurrencia no indicada); herencia de 20.000 € al cumplir 23 (cohorte anual estimada); prestación de 200 €/mes por cada menor de 18, que sustituye prestaciones por hijo a cargo, complemento IMV infancia y deducción por madre trabajadora; elevación de pensiones mínimas/no contributivas hasta umbral de pobreza; complemento de brecha de género +10 % en 2026–27; ampliación de IMV y ayudas de emergencia.

**Medidas cuantificables por componente:**

| Medida | Valor bruto por componente | Cálculo / inputs | Qué falta para agregado |
|---|---:|---|---|
| SUMAR-TRANSFERS-001 bono hipotecario | 1.000 M€ declarados | Coste dado en el programa; hasta un millón de hogares | Recurrencia/año de aplicación y regla efectiva de elegibilidad |
| SUMAR-TRANSFERS-002 herencia universal | 10.178,36 M€ por cohorte 2023 | 20.000 € × (262.775 hombres + 246.143 mujeres de 22 años a 1-1-2023); PIB 2023 = 1.498.324 M€; baseline de transferencia sintético = 17 % PIB | Calendario de implantación y confirmación de cohorte/año |
| SUMAR-TRANSFERS-003 prestación infantil | 2.400 €/año por menor elegible | 200 €/mes × 12; no se inventa el total de menores ni la elegibilidad final | Recuento oficial para año de implantación y valor de beneficios fiscales/prestaciones que sustituye |
| SUMAR-TRANSFERS-004 pensiones mínimas/no contributivas | Sin valor neto | Objetivo de umbral de pobreza, no importe por grupo/fecha | Umbral y distribución administrativa de perceptores por debajo de él |
| SUMAR-TRANSFERS-005 complemento de brecha | Aumento del 10 % por tramo anunciado | Porcentaje de complemento | Base de gasto 2026–27 y población afectada |
| SUMAR-TRANSFERS-006 ampliación del IMV | Sin valor neto | No se fijan nuevas cuantías ni elegibilidad incremental; existe solape con IMV y rentas mínimas autonómicas | Población elegible incremental y coste neto por hogar |
| SUMAR-TRANSFERS-007 ayudas de emergencia | Sin valor | Sin presupuesto, cuantías o recurrencia | Diseño final, presupuesto anual y beneficiarios |

**Medidas descartadas de la suma automática:** dependencia y Plan Corresponsables son servicios/cuidados, no una transferencia monetaria libre; la prestación infantil sustituye componentes actuales, por lo que sumar su importe bruto duplicaría prestaciones existentes. La expansión del IMV puede solaparse con ayudas autonómicas. El bono está repetido en dos capítulos, pero es una medida y se cuenta una sola vez.

**Resultado del preset:** `UNMAPPED` (`TOO_MANY_UNOBSERVED_ASSUMPTIONS`). No hay fórmula de agregado aplicada. El artefacto [sumar-transfers-components-23j-2023.json](derivations/sumar-transfers-components-23j-2023.json) mantiene aritmética por componente y `aggregateResult: null`.

**Sensibilidad:** la cohorte de la herencia ±10 % arroja 3,5964–4,3956 % del baseline sintético como efecto aislado. Cada menor de la prestación infantil añade 2.400 €/año bruto. No se informa intervalo agregado porque faltan importes sustituidos y efectos de pensiones/IMV.

**Confianza:** baja para cualquier agregado; las aritméticas por componente son reproducibles, pero no resuelven la población elegible, la sustitución de ayudas ni las medidas adicionales.

**Pregunta para revisión humana:** ¿qué fuente y definición oficial de la población infantil, coste de las tres prestaciones sustituidas, distribución de pensiones y calendario deben fijarse para poder calcular el neto sin doble contabilización?

## Coalición Sumar — publicInvestment (no activo)

Se revisaron vivienda 1 % PIB/año (construcción, compra, movilización y rehabilitación), inversión deportiva al 0,25 % PIB a medio plazo, I+D+i público al 1,25 % PIB, +5.000 M€ de recursos públicos PERTE y la inversión de alrededor de 1.000 M€ en escuelas infantiles. No se suman ni se convierten al control: tienen coberturas, periodos, composición capital/corriente, perímetros administrativos y adicionalidad diferentes. La compra/movilización de vivienda tampoco equivale íntegramente a formación de capital público. `UNMAPPED` (`SEMANTIC_MISMATCH`).

## Otros mapeos

La matriz completa y sus razones finales figuran en [23J-2023-MAPPING.md](23J-2023-MAPPING.md); los inventarios por candidatura listan medidas candidatas, cuantías y descartes. Antes de activar valores se requiere revisión humana del inventario y de la suma completa de cada control.
