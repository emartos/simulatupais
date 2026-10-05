# Stress test económico — modelo 0.3.0

## Resumen

- Escenarios: 22 trayectorias: 22; observaciones mensuales: 2662 (incluye mes 0).
- Horizontes: 12, 60 y 120 meses; semilla 1847; catálogo es-reviewed-2026-09-30.1; año base 2025.
- Shocks: activados en batería principal; S00/S13/S14 repetidos desactivados. Alertas automáticas: 37; determinismo: PASS; coincidencia P01: PASS.
- Choques apagados conservan la evolución tendencial y eliminan solo canales sintéticos de energía, demanda exterior y oferta; las políticas siguen aplicándose.
- Métricas: PIB real (mil M€/año), poder adquisitivo (€/persona/año), inflación y paro (%), deuda/PIB (%), inversión real (mil M€/año). Para deuda/PIB, paro e inflación la dirección convencional favorable es menor; para otras, mayor. ≈ indica <0,5% del nivel base, no una puntuación de bienestar.

## Matriz principal

| Escenario | 1 año | 5 años | 10 años | Alertas |
|---|---|---|---|---|
| S00 Baseline | PIB 1708,47, compra 23.669,98, IPC 2,78%, paro 10,53%, deuda 99,85%, inversión 370,85 | PIB 1833,84, compra 24.521,11, IPC 2,24%, paro 10,02%, deuda 96,27%, inversión 390,71 | PIB 2003,48, compra 25.626,93, IPC 2,39%, paro 9,4%, deuda 92,39%, inversión 416,45 | 2 |
| S01 Impuestos directos bajos | PIB 1749,25, compra 25.137,03, IPC 2,81%, paro 10,01%, deuda 99,79%, inversión 371,51 | PIB 1884,46, compra 26.149,85, IPC 2,47%, paro 9,42%, deuda 104,63%, inversión 392,28 | PIB 2003,55, compra 26.599,18, IPC 2,6%, paro 9,4%, deuda 113,02%, inversión 410,98 | 2 |
| S02 Impuestos directos altos | PIB 1665,35, compra 22.201,92, IPC 2,74%, paro 11,09%, deuda 100,09%, inversión 369,71 | PIB 1785,82, compra 22.976,68, IPC 2,03%, paro 10,61%, deuda 87,73%, inversión 389,19 | PIB 1953,68, compra 24.036,81, IPC 2,12%, paro 9,95%, deuda 73,63%, inversión 415,15 | 0 |
| S03 Mayor progresividad | PIB 1706,05, compra 23.529,53, IPC 2,78%, paro 10,56%, deuda 99,7%, inversión 370,81 | PIB 1830,9, compra 24.370,46, IPC 2,23%, paro 10,06%, deuda 95%, inversión 390,62 | PIB 2002,54, compra 25.493,1, IPC 2,37%, paro 9,41%, deuda 89,72%, inversión 416,68 | 2 |
| S04 Menor progresividad | PIB 1710,27, compra 23.775,13, IPC 2,78%, paro 10,5%, deuda 99,96%, inversión 370,88 | PIB 1836,06, compra 24.634,42, IPC 2,25%, paro 10%, deuda 97,22%, inversión 390,78 | PIB 2003,73, compra 25.718,86, IPC 2,4%, paro 9,4%, deuda 94,41%, inversión 416,23 | 2 |
| S05 Transferencias altas | PIB 1784,57, compra 26.200,09, IPC 2,84%, paro 9,57%, deuda 99,14%, inversión 372,06 | PIB 1885,81, compra 26.761,58, IPC 2,62%, paro 9,41%, deuda 110,75%, inversión 388,03 | PIB 2001,58, compra 27.163,26, IPC 2,73%, paro 9,42%, deuda 124,35%, inversión 406 | 3 |
| S06 Transferencias bajas | PIB 1645,29, compra 21.686,51, IPC 2,72%, paro 11,35%, deuda 100,7%, inversión 369,13 | PIB 1764,09, compra 22.441,12, IPC 1,93%, paro 10,88%, deuda 86%, inversión 388,5 | PIB 1929,86, compra 23.476,2, IPC 2%, paro 10,22%, deuda 69,21%, inversión 414,36 | 0 |
| S07 Impuesto al consumo alto | PIB 1677,24, compra 22.630,3, IPC 5,53%, paro 10,93%, deuda 99,23%, inversión 370,05 | PIB 1798,77, compra 23.422,41, IPC 2,09%, paro 10,45%, deuda 86,34%, inversión 389,6 | PIB 1967,89, compra 24.503,31, IPC 2,19%, paro 9,79%, deuda 71,58%, inversión 415,62 | 0 |
| S08 Impuesto al consumo bajo | PIB 1734,19, compra 24.568,82, IPC 0,49%, paro 10,2%, deuda 100,59%, inversión 371,27 | PIB 1865,67, compra 25.518,39, IPC 2,38%, paro 9,65%, deuda 105,38%, inversión 391,7 | PIB 2003,88, compra 26.222,3, IPC 2,53%, paro 9,39%, deuda 112,83%, inversión 413,03 | 2 |
| S09 Más inversión pública | PIB 1749,51, compra 24.220,61, IPC 2,81%, paro 10%, deuda 99,33%, inversión 406,7 | PIB 1887,42, compra 25.232,7, IPC 2,44%, paro 9,39%, deuda 102,42%, inversión 432,31 | PIB 2029,26, compra 25.953,82, IPC 2,55%, paro 9,12%, deuda 108,06%, inversión 458,3 | 3 |
| S10 Más servicios | PIB 1787,04, compra 24.724,12, IPC 2,84%, paro 9,54%, deuda 98,89%, inversión 372,1 | PIB 1885,73, compra 25.218,9, IPC 2,63%, paro 9,41%, deuda 110,11%, inversión 387,71 | PIB 2001,4, compra 25.596,21, IPC 2,74%, paro 9,42%, deuda 122,84%, inversión 405,65 | 4 |
| S11 Menor impuesto de sociedades | PIB 1744,33, compra 24.151,58, IPC 2,81%, paro 10,07%, deuda 99,16%, inversión 402,07 | PIB 1879,6, compra 25.129,11, IPC 2,41%, paro 9,48%, deuda 100,56%, inversión 426,17 | PIB 2025,69, compra 25.908,95, IPC 2,53%, paro 9,16%, deuda 103,96%, inversión 451,96 | 2 |
| S12 Más fricción de inversión | PIB 1639,22, compra 22.718,99, IPC 2,72%, paro 11,44%, deuda 104,19%, inversión 315,73 | PIB 1755,25, compra 23.476,39, IPC 1,95%, paro 10,99%, deuda 101,53%, inversión 329,87 | PIB 1919,19, compra 24.544,74, IPC 2,1%, paro 10,34%, deuda 98,61%, inversión 349,48 | 0 |
| S13 Paquete expansivo | PIB 1794,74, compra 26.073,91, IPC 2,9%, paro 9,44%, deuda 101,62%, inversión 391,04 | PIB 1892,77, compra 26.544,95, IPC 2,82%, paro 9,33%, deuda 124,33%, inversión 408,52 | PIB 2014,8, compra 27.021,59, IPC 2,96%, paro 9,27%, deuda 149,81%, inversión 429,27 | 2 |
| S14 Paquete de menor intervención | PIB 1678,51, compra 23.068,16, IPC 2,75%, paro 10,91%, deuda 100,25%, inversión 395,59 | PIB 1801,58, compra 23.895,65, IPC 2,07%, paro 10,41%, deuda 91,53%, inversión 417,98 | PIB 1971,8, compra 25.009,85, IPC 2,14%, paro 9,75%, deuda 81,83%, inversión 447,31 | 0 |
| S01-L Stress límite: directos bajos | PIB 1764,92, compra 25.702,99, IPC 2,83%, paro 9,81%, deuda 99,76%, inversión 371,75 | PIB 1886,25, compra 26.544,18, IPC 2,55%, paro 9,4%, deuda 108,67%, inversión 390,51 | PIB 2002,85, compra 26.953,37, IPC 2,66%, paro 9,4%, deuda 120,65%, inversión 408,78 | 3 |
| S02-L Stress límite: directos altos | PIB 1628,39, compra 20.961,65, IPC 2,7%, paro 11,58%, deuda 100,33%, inversión 368,63 | PIB 1745,82, compra 21.689,66, IPC 1,85%, paro 11,11%, deuda 80,16%, inversión 387,93 | PIB 1909,81, compra 22.689,79, IPC 1,9%, paro 10,45%, deuda 56,92%, inversión 413,69 | 0 |
| S07-L Stress límite: consumo alto | PIB 1674,7, compra 22.546,89, IPC 5,76%, paro 10,96%, deuda 99,19%, inversión 369,98 | PIB 1795,99, compra 23.335,27, IPC 2,07%, paro 10,48%, deuda 85,56%, inversión 389,52 | PIB 1964,84, compra 24.412,11, IPC 2,18%, paro 9,83%, deuda 69,94%, inversión 415,52 | 0 |
| S12-L Stress límite: fricción alta | PIB 1623,44, compra 22.501,31, IPC 2,7%, paro 11,65%, deuda 105,23%, inversión 303,41 | PIB 1737,92, compra 23.245,85, IPC 1,88%, paro 11,21%, deuda 102,75%, inversión 316,46 | PIB 1900,13, compra 24.302,19, IPC 2,04%, paro 10,56%, deuda 100,09%, inversión 334,74 | 0 |

## KPI por escenario

Cada celda da Δ frente al baseline del mismo horizonte; para inflación, paro y deuda/PIB son puntos porcentuales.

| Escenario | Mes | PIB | Compra | Inflación (pp) | Paro (pp) | Deuda/PIB (pp) | Inversión | Trade-offs (PIB/compra/IPC/paro/deuda/inversión) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| S00 | 12 | +0 | +0 | +0 | +0 | +0 | +0 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S00 | 60 | +0 | +0 | +0 | +0 | +0 | +0 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S00 | 120 | +0 | +0 | +0 | +0 | +0 | +0 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S01 | 12 | +40,77 | +1467,06 | +0,03 | -0,52 | -0,06 | +0,65 | + / + / - / + / ≈ / ≈ |
| S01 | 60 | +50,62 | +1628,74 | +0,22 | -0,6 | +8,37 | +1,57 | + / + / - / + / - / ≈ |
| S01 | 120 | +0,07 | +972,25 | +0,21 | -0 | +20,63 | -5,47 | ≈ / + / - / ≈ / - / - |
| S02 | 12 | -43,13 | -1468,05 | -0,04 | +0,56 | +0,24 | -1,14 | - / - / + / - / ≈ / ≈ |
| S02 | 60 | -48,02 | -1544,43 | -0,21 | +0,58 | -8,54 | -1,52 | - / - / + / - / + / ≈ |
| S02 | 120 | -49,8 | -1590,12 | -0,26 | +0,55 | -18,76 | -1,3 | - / - / + / - / + / ≈ |
| S03 | 12 | -2,43 | -140,44 | -0 | +0,03 | -0,15 | -0,04 | ≈ / - / ≈ / ≈ / ≈ / ≈ |
| S03 | 60 | -2,95 | -150,65 | -0,01 | +0,04 | -1,27 | -0,09 | ≈ / - / + / ≈ / + / ≈ |
| S03 | 120 | -0,94 | -133,83 | -0,02 | +0,01 | -2,67 | +0,23 | ≈ / - / + / ≈ / + / ≈ |
| S04 | 12 | +1,8 | +105,16 | +0 | -0,02 | +0,12 | +0,03 | ≈ / ≈ / ≈ / ≈ / ≈ / ≈ |
| S04 | 60 | +2,22 | +113,3 | +0,01 | -0,03 | +0,95 | +0,07 | ≈ / ≈ / ≈ / ≈ / - / ≈ |
| S04 | 120 | +0,25 | +91,94 | +0,01 | -0 | +2,02 | -0,22 | ≈ / ≈ / ≈ / ≈ / - / ≈ |
| S05 | 12 | +76,1 | +2530,12 | +0,06 | -0,96 | -0,71 | +1,2 | + / + / - / + / + / ≈ |
| S05 | 60 | +51,97 | +2240,47 | +0,37 | -0,61 | +14,48 | -2,68 | + / + / - / + / - / - |
| S05 | 120 | -1,9 | +1536,33 | +0,34 | +0,02 | +31,96 | -10,45 | ≈ / + / - / ≈ / - / - |
| S06 | 12 | -63,18 | -1983,47 | -0,06 | +0,83 | +0,85 | -1,73 | - / - / + / - / - / ≈ |
| S06 | 60 | -69,75 | -2079,99 | -0,31 | +0,85 | -10,27 | -2,2 | - / - / + / - / + / - |
| S06 | 120 | -73,62 | -2150,73 | -0,38 | +0,82 | -23,17 | -2,09 | - / - / + / - / + / - |
| S07 | 12 | -31,24 | -1039,67 | +2,75 | +0,41 | -0,62 | -0,8 | - / - / - / - / + / ≈ |
| S07 | 60 | -35,07 | -1098,7 | -0,16 | +0,42 | -9,92 | -1,11 | - / - / + / - / + / ≈ |
| S07 | 120 | -35,59 | -1123,61 | -0,19 | +0,39 | -20,81 | -0,83 | - / - / + / - / + / ≈ |
| S08 | 12 | +25,71 | +898,84 | -2,29 | -0,33 | +0,74 | +0,41 | + / + / + / + / - / ≈ |
| S08 | 60 | +31,83 | +997,28 | +0,14 | -0,38 | +9,11 | +0,99 | + / + / - / + / - / ≈ |
| S08 | 120 | +0,41 | +595,37 | +0,15 | -0 | +20,44 | -3,41 | ≈ / + / - / ≈ / - / - |
| S09 | 12 | +41,04 | +550,63 | +0,03 | -0,52 | -0,52 | +35,85 | + / + / - / + / + / + |
| S09 | 60 | +53,58 | +711,59 | +0,19 | -0,63 | +6,15 | +41,6 | + / + / - / + / - / + |
| S09 | 120 | +25,78 | +326,89 | +0,17 | -0,28 | +15,68 | +41,85 | + / + / - / + / - / + |
| S10 | 12 | +78,57 | +1054,14 | +0,07 | -0,99 | -0,96 | +1,24 | + / + / - / + / + / ≈ |
| S10 | 60 | +51,89 | +697,79 | +0,38 | -0,61 | +13,85 | -3 | + / + / - / + / - / - |
| S10 | 120 | -2,08 | -30,72 | +0,35 | +0,02 | +30,46 | -10,8 | ≈ / ≈ / - / ≈ / - / - |
| S11 | 12 | +35,86 | +481,6 | +0,03 | -0,46 | -0,68 | +31,21 | + / + / - / + / + / + |
| S11 | 60 | +45,76 | +608 | +0,17 | -0,54 | +4,3 | +35,46 | + / + / - / + / - / + |
| S11 | 120 | +22,22 | +282,02 | +0,14 | -0,24 | +11,57 | +35,52 | + / + / - / + / - / + |
| S12 | 12 | -69,25 | -950,99 | -0,06 | +0,91 | +4,34 | -55,13 | - / - / + / - / - / - |
| S12 | 60 | -78,59 | -1044,72 | -0,29 | +0,96 | +5,26 | -60,84 | - / - / + / - / - / - |
| S12 | 120 | -84,29 | -1082,18 | -0,29 | +0,95 | +6,22 | -66,97 | - / - / + / - / - / - |
| S13 | 12 | +86,26 | +2403,94 | +0,12 | -1,08 | +1,77 | +20,18 | + / + / - / + / - / + |
| S13 | 60 | +58,93 | +2023,84 | +0,58 | -0,7 | +28,07 | +17,81 | + / + / - / + / - / + |
| S13 | 120 | +11,33 | +1394,67 | +0,57 | -0,12 | +57,42 | +12,82 | + / + / - / + / - / + |
| S14 | 12 | -29,96 | -601,82 | -0,03 | +0,39 | +0,4 | +24,74 | - / - / + / - / ≈ / + |
| S14 | 60 | -32,26 | -625,46 | -0,17 | +0,39 | -4,74 | +27,27 | - / - / + / - / + / + |
| S14 | 120 | -31,68 | -617,08 | -0,24 | +0,35 | -10,56 | +30,86 | - / - / + / - / + / + |
| S01-L | 12 | +56,45 | +2033,02 | +0,05 | -0,72 | -0,09 | +0,9 | + / + / - / + / ≈ / ≈ |
| S01-L | 60 | +52,41 | +2023,07 | +0,3 | -0,62 | +12,4 | -0,2 | + / + / - / + / - / ≈ |
| S01-L | 120 | -0,63 | +1326,45 | +0,27 | +0,01 | +28,26 | -7,66 | ≈ / + / - / ≈ / - / - |
| S02-L | 12 | -80,08 | -2708,33 | -0,07 | +1,06 | +0,48 | -2,22 | - / - / + / - / ≈ / - |
| S02-L | 60 | -88,02 | -2831,45 | -0,39 | +1,08 | -16,11 | -2,78 | - / - / + / - / + / - |
| S02-L | 120 | -93,66 | -2937,13 | -0,48 | +1,05 | -35,47 | -2,75 | - / - / + / - / + / - |
| S07-L | 12 | -33,77 | -1123,09 | +2,98 | +0,44 | -0,66 | -0,87 | - / - / - / - / + / ≈ |
| S07-L | 60 | -37,85 | -1185,84 | -0,17 | +0,46 | -10,71 | -1,19 | - / - / + / - / + / ≈ |
| S07-L | 120 | -38,64 | -1214,81 | -0,21 | +0,43 | -22,45 | -0,93 | - / - / + / - / + / ≈ |
| S12-L | 12 | -85,03 | -1168,66 | -0,08 | +1,12 | +5,38 | -67,44 | - / - / + / - / - / - |
| S12-L | 60 | -95,92 | -1275,26 | -0,36 | +1,18 | +6,49 | -74,25 | - / - / + / - / - / - |
| S12-L | 120 | -103,35 | -1324,73 | -0,35 | +1,17 | +7,7 | -81,7 | - / - / + / - / - / - |

## Alertas

- **PLAUSIBLE — CLAMP**; S00, mes 100, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S00, mes 116, 5 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S01, mes 60, 17 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S01, mes 80, 41 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S03, mes 100, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S03, mes 119, 2 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S04, mes 100, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S04, mes 114, 7 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019 (PAR-079). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S05, mes 15, 22 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S05, mes 38, 39 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S05, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S08, mes 68, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-013 → EQ-011/EQ-012 y EQ-020–021; EQ-023–024 (PAR-013, PAR-044). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S08, mes 87, 34 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-013 → EQ-011/EQ-012 y EQ-020–021; EQ-023–024 (PAR-013, PAR-044). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S09, mes 68, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: PLAUSIBLE.
- **PLAUSIBLE — CLAMP**; S09, mes 74, 3 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S09, mes 84, 37 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S10, mes 13, 24 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S10, mes 38, 39 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S10, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S11, mes 68, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-014 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023 (PAR-015, PAR-016, PAR-045). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S11, mes 87, 34 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-014 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023 (PAR-015, PAR-016, PAR-045). Clasificación: SOSPECHOSO.
- **SORPRENDENTE — EXTREMO**; S13, mes 120, métrica debtRatio. Esperado conceptualmente: mantenerse dentro del umbral relativo de detección configurado. Observado: 149,81; baseline 92,39; cambio 57,42 (50 pp). Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046); EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048); EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: SORPRENDENTE.
- **SOSPECHOSO — CLAMP**; S13, mes 2, 119 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046); EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048); EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — CLAMP**; S01-L, mes 16, 1 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: PLAUSIBLE.
- **SOSPECHOSO — CLAMP**; S01-L, mes 43, 34 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: SOSPECHOSO.
- **SOSPECHOSO — CLAMP**; S01-L, mes 78, 43 meses consecutivos, métrica clamp. Esperado conceptualmente: ningún mes o un episodio aislado; varios años continuos requieren revisión. Observado: "Demanda superior al límite de capacidad; racionamiento proporcional simplificado.". Cadena EQ/PAR: EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069). Clasificación: SOSPECHOSO.
- **PLAUSIBLE — ASIMETRIA**; S01/S02, mes 120, métrica gdp. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":0.07323350197293621,"high":-49.79526288670763}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S01/S02, mes 120, métrica unemployment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-0.0008041550667137187,"high":0.553706691295833}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S01/S02, mes 120, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-5.468704579437144,"high":-1.2996782144378471}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 60, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-2.2043932698907156,"high":-2.6822764691145267}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 120, métrica gdp. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-73.62372632892948,"high":-1.8964149674759483}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 120, métrica unemployment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":0.8236835536940994,"high":0.020834205148435814}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S06/S05, mes 120, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-2.0899529420698855,"high":-10.44825847999283}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S08/S07, mes 120, métrica gdp. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":0.40620380670543454,"high":-35.592132902022286}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S08/S07, mes 120, métrica unemployment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-0.00446003127354011,"high":0.3943469371086916}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **PLAUSIBLE — ASIMETRIA**; S08/S07, mes 120, métrica investment. Esperado conceptualmente: respuestas aproximadamente opuestas, sin exigir simetría exacta. Observado: {"low":-3.4115120074669676,"high":-0.828866781133911}. Cadena EQ/PAR: asimetría del par: cadena de EQ especificada según el control en la matriz causal. Clasificación: PLAUSIBLE.
- **SOSPECHOSO — DOMINANCIA_NEGATIVA**; S10, mes 120, métrica multi-KPI. Esperado conceptualmente: trade-offs; que empeoren a la vez las seis métricas requiere explicación. Observado: {"gdp":true,"purchasingPower":true,"unemployment":true,"inflation":true,"debtRatio":true,"investment":true}. Cadena EQ/PAR: EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048). Clasificación: SOSPECHOSO.

## Sanity checks

- Determinismo misma política/semilla/shocks: PASS.
- P01: mes 12 PIB coincide, poder adquisitivo coincide; mes 60 PIB coincide, poder adquisitivo coincide.
- Cambios retroactivos: no hay controles dinámicos en estos escenarios; cada política está activa desde mes 1 y el mes 0 es estado común.
- Identidades contables: `advance` invoca `validateState` en cada paso (EQ-001, EQ-002, EQ-005). No se observó excepción; no finitos se comprueban en todas las trayectorias.

## Top 5 casos más sospechosos

- CLAMP: S13, mes 2, 119 meses consecutivos, clamp; EQ/PAR EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046); EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048); EQ-015 → EQ-016/EQ-019 → EQ-018/EQ-026; EQ-023–025 (PAR-014, PAR-047).
- CLAMP: S05, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-010 → EQ-011/EQ-012 → EQ-016/EQ-019; EQ-023–025 (PAR-007, PAR-046).
- CLAMP: S10, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-015 → EQ-016/EQ-019; EQ-023–025 (PAR-048).
- CLAMP: S01-L, mes 78, 43 meses consecutivos, clamp; EQ/PAR EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069).
- CLAMP: S01, mes 80, 41 meses consecutivos, clamp; EQ/PAR EQ-009 → EQ-011/EQ-012 → EQ-016/EQ-019; fiscal EQ-023–025 (PAR-002, PAR-069).

## Cierre

**PASS WITH WARNINGS** — el modelo 0.3.0 se comporta de forma internamente estable bajo esta batería; alertas requieren lectura diagnóstica, no son defectos automáticos. No valida predicciones económicas reales de España.
