# Stress test económico — modelo 0.2.0

## Resumen

- Escenarios: 22 trayectorias: 22; observaciones mensuales: 2662 (incluye mes 0).
- Horizontes: 12, 60 y 120 meses; semilla 1847; catálogo es-reviewed-2026-09-30.1; año base 2025.
- Shocks: activados en batería principal; S00/S13/S14 repetidos desactivados. Alertas automáticas: 37; determinismo: PASS; coincidencia P01: PASS.
- Choques apagados conservan la evolución tendencial y eliminan solo canales sintéticos de energía, demanda exterior y oferta; las políticas siguen aplicándose.
- Métricas: PIB real (mil M€/año), poder adquisitivo (€/persona/año), inflación y paro (%), deuda/PIB (%), inversión real (mil M€/año). Para deuda/PIB, paro e inflación la dirección convencional favorable es menor; para otras, mayor. ≈ indica <0,5% del nivel base, no una puntuación de bienestar.

## Matriz principal

| Escenario | 1 año | 5 años | 10 años | Alertas |
|---|---|---|---|---|
| S00 Baseline | PIB 1708,48, compra 23.670, IPC 2,78%, paro 10,53%, deuda 99,85%, inversión 370,86 | PIB 1833,93, compra 24.522,53, IPC 2,25%, paro 10,02%, deuda 96,27%, inversión 390,73 | PIB 2003,65, compra 25.628,9, IPC 2,39%, paro 9,4%, deuda 92,42%, inversión 416,5 | 2 |
| S01 Impuestos directos bajos | PIB 1749,25, compra 25.137,06, IPC 2,81%, paro 10,01%, deuda 99,79%, inversión 371,51 | PIB 1884,55, compra 26.151,4, IPC 2,47%, paro 9,42%, deuda 104,64%, inversión 392,3 | PIB 2003,67, compra 26.600,68, IPC 2,6%, paro 9,4%, deuda 113,04%, inversión 411,01 | 2 |
| S02 Impuestos directos altos | PIB 1669,15, compra 22.262,08, IPC 2,75%, paro 11,04%, deuda 99,89%, inversión 370,21 | PIB 1785,94, compra 22.978,33, IPC 2,03%, paro 10,61%, deuda 87,75%, inversión 389,24 | PIB 1953,77, compra 24.037,8, IPC 2,13%, paro 9,95%, deuda 73,67%, inversión 415,2 | 0 |
| S03 Mayor progresividad | PIB 1706,08, compra 23.530,11, IPC 2,78%, paro 10,56%, deuda 99,69%, inversión 370,82 | PIB 1830,99, compra 24.371,87, IPC 2,23%, paro 10,06%, deuda 95%, inversión 390,64 | PIB 2002,66, compra 25.494,33, IPC 2,38%, paro 9,41%, deuda 89,75%, inversión 416,72 | 2 |
| S04 Menor progresividad | PIB 1710,28, compra 23.775,16, IPC 2,78%, paro 10,5%, deuda 99,96%, inversión 370,89 | PIB 1836,15, compra 24.635,84, IPC 2,26%, paro 10%, deuda 97,22%, inversión 390,8 | PIB 2003,91, compra 25.721,01, IPC 2,4%, paro 9,39%, deuda 94,44%, inversión 416,28 | 2 |
| S05 Transferencias altas | PIB 1784,57, compra 26.200,12, IPC 2,84%, paro 9,57%, deuda 99,14%, inversión 372,06 | PIB 1885,86, compra 26.762,26, IPC 2,62%, paro 9,41%, deuda 110,74%, inversión 388,04 | PIB 2001,65, compra 27.164,11, IPC 2,73%, paro 9,42%, deuda 124,35%, inversión 406,02 | 3 |
| S06 Transferencias bajas | PIB 1651,13, compra 21.778,18, IPC 2,73%, paro 11,28%, deuda 100,39%, inversión 369,91 | PIB 1764,23, compra 22.442,92, IPC 1,94%, paro 10,88%, deuda 86,03%, inversión 388,56 | PIB 1929,95, compra 23.477,33, IPC 2,01%, paro 10,22%, deuda 69,26%, inversión 414,42 | 0 |
| S07 Impuesto al consumo alto | PIB 1679,82, compra 22.671,65, IPC 5,53%, paro 10,9%, deuda 99,1%, inversión 370,39 | PIB 1798,89, compra 23.423,99, IPC 2,09%, paro 10,45%, deuda 86,35%, inversión 389,64 | PIB 1967,96, compra 24.504,22, IPC 2,2%, paro 9,79%, deuda 71,6%, inversión 415,67 | 0 |
| S08 Impuesto al consumo bajo | PIB 1734,19, compra 24.568,84, IPC 0,49%, paro 10,2%, deuda 100,59%, inversión 371,27 | PIB 1865,76, compra 25.519,89, IPC 2,39%, paro 9,64%, deuda 105,38%, inversión 391,72 | PIB 2004,05, compra 26.224,39, IPC 2,54%, paro 9,39%, deuda 112,87%, inversión 413,08 | 2 |
| S09 Más inversión pública | PIB 1749,51, compra 24.220,62, IPC 2,81%, paro 10%, deuda 99,33%, inversión 406,7 | PIB 1887,5, compra 25.233,99, IPC 2,44%, paro 9,39%, deuda 102,42%, inversión 432,32 | PIB 2029,31, compra 25.954,41, IPC 2,56%, paro 9,12%, deuda 108,1%, inversión 458,32 | 3 |
| S10 Más servicios | PIB 1787,05, compra 24.724,14, IPC 2,84%, paro 9,54%, deuda 98,89%, inversión 372,1 | PIB 1885,78, compra 25.219,54, IPC 2,63%, paro 9,41%, deuda 110,11%, inversión 387,73 | PIB 2001,46, compra 25.596,99, IPC 2,74%, paro 9,42%, deuda 122,85%, inversión 405,66 | 4 |
| S11 Menor impuesto de sociedades | PIB 1744,33, compra 24.151,59, IPC 2,81%, paro 10,07%, deuda 99,16%, inversión 402,07 | PIB 1879,68, compra 25.130,32, IPC 2,41%, paro 9,48%, deuda 100,57%, inversión 426,18 | PIB 2025,76, compra 25.909,76, IPC 2,54%, paro 9,15%, deuda 104%, inversión 451,98 | 2 |
| S12 Más fricción de inversión | PIB 1646,17, compra 22.832,81, IPC 2,73%, paro 11,34%, deuda 103,84%, inversión 316,53 | PIB 1755,41, compra 23.478,56, IPC 1,96%, paro 10,99%, deuda 101,59%, inversión 329,93 | PIB 1919,31, compra 24.546,21, IPC 2,1%, paro 10,34%, deuda 98,7%, inversión 349,56 | 0 |
| S13 Paquete expansivo | PIB 1794,75, compra 26.074,02, IPC 2,9%, paro 9,44%, deuda 101,62%, inversión 391,04 | PIB 1892,79, compra 26.545,24, IPC 2,82%, paro 9,33%, deuda 124,33%, inversión 408,52 | PIB 2014,8, compra 27.021,53, IPC 2,96%, paro 9,27%, deuda 149,81%, inversión 429,27 | 2 |
| S14 Paquete de menor intervención | PIB 1680,91, compra 23.107,45, IPC 2,75%, paro 10,88%, deuda 100,13%, inversión 395,93 | PIB 1801,68, compra 23.897,06, IPC 2,07%, paro 10,41%, deuda 91,54%, inversión 418,01 | PIB 1971,85, compra 25.010,55, IPC 2,15%, paro 9,75%, deuda 81,87%, inversión 447,35 | 0 |
| S01-L Stress límite: directos bajos | PIB 1764,93, compra 25.703,02, IPC 2,83%, paro 9,81%, deuda 99,76%, inversión 371,75 | PIB 1886,31, compra 26.545,05, IPC 2,55%, paro 9,4%, deuda 108,67%, inversión 390,53 | PIB 2002,94, compra 26.954,59, IPC 2,66%, paro 9,4%, deuda 120,66%, inversión 408,81 | 3 |
| S02-L Stress límite: directos altos | PIB 1635,88, compra 21.076,56, IPC 2,72%, paro 11,48%, deuda 99,92%, inversión 369,65 | PIB 1745,96, compra 21.691,54, IPC 1,86%, paro 11,1%, deuda 80,18%, inversión 388 | PIB 1909,92, compra 22.691,03, IPC 1,91%, paro 10,45%, deuda 56,95%, inversión 413,77 | 0 |
| S07-L Stress límite: consumo alto | PIB 1677,53, compra 22.592,11, IPC 5,76%, paro 10,93%, deuda 99,04%, inversión 370,35 | PIB 1796,11, compra 23.336,87, IPC 2,08%, paro 10,48%, deuda 85,57%, inversión 389,56 | PIB 1964,91, compra 24.413,04, IPC 2,18%, paro 9,83%, deuda 69,96%, inversión 415,57 | 0 |
| S12-L Stress límite: fricción alta | PIB 1632,29, compra 22.646,25, IPC 2,72%, paro 11,53%, deuda 104,77%, inversión 304,41 | PIB 1738,08, compra 23.248,15, IPC 1,89%, paro 11,2%, deuda 102,83%, inversión 316,52 | PIB 1900,25, compra 24.303,77, IPC 2,04%, paro 10,56%, deuda 100,19%, inversión 334,83 | 0 |

## KPI por escenario

Cada celda da Δ frente al baseline del mismo horizonte; para inflación, paro y deuda/PIB son puntos porcentuales.

| Escenario | Mes | PIB | Compra | Inflación (pp) | Paro (pp) | Deuda/PIB (pp) | Inversión | Trade-offs (PIB/compra/IPC/paro/deuda/inversión) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| S00 | 12 | +0 | +0 | +0 | +0 | +0 | +0 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S00 | 60 | +0 | +0 | +0 | +0 | +0 | +0 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S00 | 120 | +0 | +0 | +0 | +0 | +0 | +0 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S01 | 12 | +40,77 | +1467,06 | +0,03 | -0,52 | -0,06 | +0,65 | + / + / - / + / ≈ / ≈ |
| S01 | 60 | +50,62 | +1628,86 | +0,22 | -0,6 | +8,37 | +1,57 | + / + / - / + / - / ≈ |
| S01 | 120 | +0,02 | +971,78 | +0,21 | -0 | +20,62 | -5,49 | ≈ / + / - / ≈ / - / - |
| S02 | 12 | -39,33 | -1407,92 | -0,03 | +0,51 | +0,05 | -0,65 | - / - / + / - / ≈ / ≈ |
| S02 | 60 | -47,99 | -1544,2 | -0,21 | +0,58 | -8,52 | -1,49 | - / - / + / - / + / ≈ |
| S02 | 120 | -49,88 | -1591,1 | -0,26 | +0,55 | -18,75 | -1,29 | - / - / + / - / + / ≈ |
| S03 | 12 | -2,39 | -139,89 | -0 | +0,03 | -0,15 | -0,04 | ≈ / - / ≈ / ≈ / ≈ / ≈ |
| S03 | 60 | -2,95 | -150,66 | -0,01 | +0,04 | -1,27 | -0,09 | ≈ / - / + / ≈ / + / ≈ |
| S03 | 120 | -0,98 | -134,57 | -0,02 | +0,01 | -2,67 | +0,23 | ≈ / - / + / ≈ / + / ≈ |
| S04 | 12 | +1,8 | +105,16 | +0 | -0,02 | +0,12 | +0,03 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S04 | 60 | +2,22 | +113,31 | +0,01 | -0,03 | +0,95 | +0,07 | ≈ / ≈ / ≈ / ≈ / - / ≈ |
| S04 | 120 | +0,26 | +92,12 | +0,01 | -0 | +2,02 | -0,22 | ≈ / ≈ / ≈ / ≈ / - / ≈ |
| S05 | 12 | +76,1 | +2530,12 | +0,06 | -0,96 | -0,71 | +1,2 | + / + / - / + / + / ≈ |
| S05 | 60 | +51,93 | +2239,73 | +0,37 | -0,61 | +14,48 | -2,69 | + / + / - / + / - / - |
| S05 | 120 | -2 | +1535,22 | +0,34 | +0,02 | +31,93 | -10,48 | ≈ / + / - / ≈ / - / - |
| S06 | 12 | -57,34 | -1891,81 | -0,05 | +0,75 | +0,55 | -0,95 | - / - / + / - / - / ≈ |
| S06 | 60 | -69,71 | -2079,61 | -0,31 | +0,85 | -10,24 | -2,17 | - / - / + / - / + / - |
| S06 | 120 | -73,69 | -2151,56 | -0,38 | +0,82 | -23,16 | -2,07 | - / - / + / - / + / ≈ |
| S07 | 12 | -28,66 | -998,35 | +2,75 | +0,37 | -0,75 | -0,47 | - / - / - / - / + / ≈ |
| S07 | 60 | -35,05 | -1098,54 | -0,15 | +0,42 | -9,92 | -1,09 | - / - / + / - / + / ≈ |
| S07 | 120 | -35,68 | -1124,67 | -0,19 | +0,4 | -20,82 | -0,83 | - / - / + / - / + / ≈ |
| S08 | 12 | +25,71 | +898,84 | -2,29 | -0,33 | +0,74 | +0,41 | + / + / + / + / - / ≈ |
| S08 | 60 | +31,83 | +997,36 | +0,14 | -0,38 | +9,12 | +0,99 | + / + / - / + / - / ≈ |
| S08 | 120 | +0,4 | +595,49 | +0,14 | -0 | +20,45 | -3,42 | ≈ / + / - / ≈ / - / - |
| S09 | 12 | +41,03 | +550,62 | +0,03 | -0,52 | -0,52 | +35,85 | + / + / - / + / + / + |
| S09 | 60 | +53,57 | +711,46 | +0,19 | -0,63 | +6,15 | +41,59 | + / + / - / + / - / + |
| S09 | 120 | +25,66 | +325,52 | +0,17 | -0,28 | +15,68 | +41,82 | + / + / - / + / - / + |
| S10 | 12 | +78,57 | +1054,14 | +0,07 | -0,99 | -0,96 | +1,24 | + / + / - / + / + / ≈ |
| S10 | 60 | +51,84 | +697,01 | +0,38 | -0,61 | +13,84 | -3,01 | + / + / - / + / - / - |
| S10 | 120 | -2,18 | -31,9 | +0,35 | +0,02 | +30,43 | -10,83 | ≈ / ≈ / - / ≈ / - / - |
| S11 | 12 | +35,86 | +481,59 | +0,03 | -0,46 | -0,68 | +31,21 | + / + / - / + / + / + |
| S11 | 60 | +45,74 | +607,79 | +0,17 | -0,54 | +4,3 | +35,45 | + / + / - / + / - / + |
| S11 | 120 | +22,12 | +280,86 | +0,14 | -0,24 | +11,58 | +35,49 | + / + / - / + / - / + |
| S12 | 12 | -62,31 | -837,19 | -0,05 | +0,82 | +3,99 | -54,33 | - / - / + / - / - / - |
| S12 | 60 | -78,53 | -1043,97 | -0,29 | +0,96 | +5,32 | -60,8 | - / - / + / - / - / - |
| S12 | 120 | -84,34 | -1082,69 | -0,29 | +0,95 | +6,28 | -66,94 | - / - / + / - / - / - |
| S13 | 12 | +86,27 | +2404,02 | +0,12 | -1,08 | +1,77 | +20,18 | + / + / - / + / - / + |
| S13 | 60 | +58,85 | +2022,71 | +0,58 | -0,69 | +28,06 | +17,79 | + / + / - / + / - / + |
| S13 | 120 | +11,15 | +1392,63 | +0,56 | -0,12 | +57,39 | +12,77 | + / + / - / + / - / + |
| S14 | 12 | -27,56 | -562,55 | -0,02 | +0,36 | +0,28 | +25,07 | - / - / + / - / ≈ / + |
| S14 | 60 | -32,25 | -625,47 | -0,17 | +0,39 | -4,73 | +27,28 | - / - / + / - / + / + |
| S14 | 120 | -31,79 | -618,34 | -0,24 | +0,35 | -10,55 | +30,85 | - / - / + / - / + / + |
| S01-L | 12 | +56,45 | +2033,02 | +0,05 | -0,72 | -0,09 | +0,9 | + / + / - / + / ≈ / ≈ |
| S01-L | 60 | +52,38 | +2022,52 | +0,3 | -0,62 | +12,41 | -0,2 | + / + / - / + / - / ≈ |
| S01-L | 120 | -0,71 | +1325,69 | +0,27 | +0,01 | +28,24 | -7,69 | ≈ / + / - / ≈ / - / - |
| S02-L | 12 | -72,6 | -2593,44 | -0,06 | +0,96 | +0,07 | -1,21 | - / - / + / - / ≈ / ≈ |
| S02-L | 60 | -87,97 | -2830,99 | -0,39 | +1,08 | -16,09 | -2,73 | - / - / + / - / + / - |
| S02-L | 120 | -93,72 | -2937,86 | -0,48 | +1,05 | -35,47 | -2,73 | - / - / + / - / + / - |
| S07-L | 12 | -30,94 | -1077,89 | +2,98 | +0,4 | -0,81 | -0,51 | - / - / - / - / + / ≈ |
| S07-L | 60 | -37,83 | -1185,66 | -0,17 | +0,46 | -10,7 | -1,18 | - / - / + / - / + / ≈ |
| S07-L | 120 | -38,73 | -1215,86 | -0,21 | +0,43 | -22,46 | -0,93 | - / - / + / - / + / ≈ |
| S12-L | 12 | -76,19 | -1023,75 | -0,06 | +1 | +4,92 | -66,45 | - / - / + / - / - / - |
| S12-L | 60 | -95,85 | -1274,38 | -0,35 | +1,18 | +6,56 | -74,21 | - / - / + / - / - / - |
| S12-L | 120 | -103,39 | -1325,12 | -0,35 | +1,17 | +7,77 | -81,67 | - / - / + / - / - / - |

## Alertas

- **PLAUSIBLE — CLAMP**; S00, mes 100, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S00, mes 116, 5 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S01, mes 60, 17 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S01, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S03, mes 100, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S03, mes 119, 2 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S04, mes 100, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S04, mes 114, 7 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S05, mes 15, 22 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S05, mes 38, 39 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S05, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S08, mes 68, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-013 → EQ-011/EQ-012 y EQ-020–021; EQ-023–024 (PAR-013, PAR-044). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S08, mes 84, 37 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-013 → EQ-011/EQ-012 y EQ-020–021; EQ-023–024 (PAR-013, PAR-044). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S09, mes 68, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S09, mes 74, 3 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S09, mes 81, 40 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S10, mes 13, 24 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S10, mes 38, 39 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S10, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S11, mes 68, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-014 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023 (PAR-015, PAR-016, PAR-045). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S11, mes 85, 36 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-014 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023 (PAR-015, PAR-016, PAR-045). Clasificación: SOSPECHOSO.
- **SORPRENDENTE — EXTREMO**; S13, mes 120, métrica debtRatio. Esperado conceptualmente: mantenerse dentro del umbral relativo de detección configurado. Observado: 149,81; baseline 92,42; cambio 57,39 (50 pp). Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046); EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048); EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: SORPRENDENTE.
- **SOSPECHOSO — CLAMP**; S13, mes 2, 119 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046); EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048); EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S01-L, mes 16, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S01-L, mes 42, 35 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S01-L, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — ASIMETRIA**; S01/S02, mes 120, métrica gdp. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":0.021792424189015946,"high":-49.878532412255026}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S01/S02, mes 120, métrica unemployment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-0.00023927923329125633,"high":0.5545976885294301}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S01/S02, mes 120, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-5.4868102944777775,"high":-1.2934404983855075}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 60, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-2.1669065812698705,"high":-2.6907403759552153}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 120, métrica gdp. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-73.69405632255166,"high":-1.9998592157337498}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 120, métrica unemployment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":0.8244154644132458,"high":0.021969393978443108}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 120, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-2.072035520021302,"high":-10.481135154907065}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S08/S07, mes 120, métrica gdp. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":0.40359230493822906,"high":-35.68293160511803}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S08/S07, mes 120, métrica unemployment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-0.004430992015931778,"high":0.395328875322555}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S08/S07, mes 120, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-3.415680526955441,"high":-0.829343833793871}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **SOSPECHOSO — DOMINANCIA_NEGATIVA**; S10, mes 120, métrica multi-KPI. Esperado conceptualmente: trade-offs; que empeoren a la vez las seis métricas requiere explicación. Observado: {"gdp":true,"purchasingPower":true,"unemployment":true,"inflation":true,"debtRatio":true,"investment":true}. Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.

## Sanity checks

- Determinismo misma política/semilla/shocks: PASS.
- P01: mes 12 PIB coincide, poder adquisitivo coincide; mes 60 PIB coincide, poder adquisitivo coincide.
- Cambios retroactivos: no hay controles dinámicos en estos escenarios; cada política está activa desde mes 1 y el mes 0 es estado común.
- Identidades contables: `advance` invoca `validateState` en cada paso (EQ-001, EQ-002, EQ-005). No se observó excepción; no finitos se comprueban en todas las trayectorias.

## Top 5 casos más sospechosos

- CLAMP: S13, mes 2, 119 meses consecutivos, clamp; EQ/PAR EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046); EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048); EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047).
- CLAMP: S01, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069).
- CLAMP: S05, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046).
- CLAMP: S10, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048).
- CLAMP: S01-L, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069).

## Cierre

**PASS WITH WARNINGS** — el modelo 0.2.0 se comporta de forma internamente estable y explicable bajo la batería ejecutada, con revisión recomendada de episodios prolongados en el techo de capacidad y de una dominancia negativa. No valida predicciones económicas reales de España.
