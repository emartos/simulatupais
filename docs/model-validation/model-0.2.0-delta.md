# Delta de resultados: modelo 0.1.0 → 0.2.0

Comparación previa a actualizar goldens. Catálogo es-reviewed-2026-09-30.1 (68504b65), año base 2025, semilla 1847. Las regresiones reejecutan sesiones antiguas en memoria bajo el comportamiento 0.2.0 con perturbaciones activadas. Los E2E P03, P04 y bifurcación se reconstruyen con sus recetas, referencia y semilla aprobadas. Los ficheros 0.1.0 permanecen intactos.

Los porcentajes son delta absoluto dividido por el valor absoluto 0.1.0; cuando el original es cero se indica N/D. No es validación empírica.

## Snapshots de regresión existentes

| Caso | Mes | Rama | KPI | 0.1.0 | 0.2.0 | Δ absoluta | Δ % |
|---|---:|:---:|---|---:|---:|---:|---:|
| 00-base | 0 | A | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 00-base | 0 | A | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 00-base | 0 | A | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 00-base | 0 | A | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 00-base | 0 | A | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 00-base | 0 | A | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 00-base | 0 | B | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 00-base | 0 | B | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 00-base | 0 | B | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 00-base | 0 | B | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 00-base | 0 | B | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 00-base | 0 | B | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 00-base | 1 | A | Producción (miles de M€) | 1690,33782 | 1690,33782 | 0 | 0 % |
| 00-base | 1 | A | Capacidad de compra (€/persona/año) | 23.634,79119 | 23.632,60598 | -2,18521 | -0,00925 % |
| 00-base | 1 | A | Inflación (% interanual) | 2,89169 | 2,90121 | 0,00951 | 0,32901 % |
| 00-base | 1 | A | Desempleo (%) | 10,52877 | 10,51777 | -0,011 | -0,10448 % |
| 00-base | 1 | A | Deuda/PIB (%) | 100,49352 | 100,48421 | -0,00931 | -0,00927 % |
| 00-base | 1 | A | Inversión (miles de M€) | 367,30055 | 367,30055 | 0 | 0 % |
| 00-base | 1 | B | Producción (miles de M€) | 1690,33782 | 1690,33782 | 0 | 0 % |
| 00-base | 1 | B | Capacidad de compra (€/persona/año) | 23.634,79119 | 23.632,60598 | -2,18521 | -0,00925 % |
| 00-base | 1 | B | Inflación (% interanual) | 2,89169 | 2,90121 | 0,00951 | 0,32901 % |
| 00-base | 1 | B | Desempleo (%) | 10,52877 | 10,51777 | -0,011 | -0,10448 % |
| 00-base | 1 | B | Deuda/PIB (%) | 100,49352 | 100,48421 | -0,00931 | -0,00927 % |
| 00-base | 1 | B | Inversión (miles de M€) | 367,30055 | 367,30055 | 0 | 0 % |
| 00-base | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 00-base | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 00-base | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 00-base | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 00-base | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 00-base | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 00-base | 12 | B | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 00-base | 12 | B | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 00-base | 12 | B | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 00-base | 12 | B | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 00-base | 12 | B | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 00-base | 12 | B | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 00-base | 60 | A | Producción (miles de M€) | 1846,63844 | 1833,93474 | -12,70371 | -0,68794 % |
| 00-base | 60 | A | Capacidad de compra (€/persona/año) | 24.700,92264 | 24.522,53045 | -178,39219 | -0,72221 % |
| 00-base | 60 | A | Inflación (% interanual) | 1,91912 | 2,2454 | 0,32629 | 17,00187 % |
| 00-base | 60 | A | Desempleo (%) | 10,53072 | 10,02259 | -0,50813 | -4,82522 % |
| 00-base | 60 | A | Deuda/PIB (%) | 97,66568 | 96,26825 | -1,39743 | -1,43083 % |
| 00-base | 60 | A | Inversión (miles de M€) | 401,38984 | 390,73127 | -10,65857 | -2,65542 % |
| 00-base | 60 | B | Producción (miles de M€) | 1846,63844 | 1833,93474 | -12,70371 | -0,68794 % |
| 00-base | 60 | B | Capacidad de compra (€/persona/año) | 24.700,92264 | 24.522,53045 | -178,39219 | -0,72221 % |
| 00-base | 60 | B | Inflación (% interanual) | 1,91912 | 2,2454 | 0,32629 | 17,00187 % |
| 00-base | 60 | B | Desempleo (%) | 10,53072 | 10,02259 | -0,50813 | -4,82522 % |
| 00-base | 60 | B | Deuda/PIB (%) | 97,66568 | 96,26825 | -1,39743 | -1,43083 % |
| 00-base | 60 | B | Inversión (miles de M€) | 401,38984 | 390,73127 | -10,65857 | -2,65542 % |
| 01-impuestos-4 | 0 | A | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 01-impuestos-4 | 0 | A | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 01-impuestos-4 | 0 | A | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 01-impuestos-4 | 0 | A | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 01-impuestos-4 | 0 | A | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 01-impuestos-4 | 0 | A | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 01-impuestos-4 | 0 | B | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 01-impuestos-4 | 0 | B | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 01-impuestos-4 | 0 | B | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 01-impuestos-4 | 0 | B | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 01-impuestos-4 | 0 | B | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 01-impuestos-4 | 0 | B | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 01-impuestos-4 | 1 | A | Producción (miles de M€) | 1690,33782 | 1690,33782 | 0 | 0 % |
| 01-impuestos-4 | 1 | A | Capacidad de compra (€/persona/año) | 23.634,79119 | 23.632,60598 | -2,18521 | -0,00925 % |
| 01-impuestos-4 | 1 | A | Inflación (% interanual) | 2,89169 | 2,90121 | 0,00951 | 0,32901 % |
| 01-impuestos-4 | 1 | A | Desempleo (%) | 10,52877 | 10,51777 | -0,011 | -0,10448 % |
| 01-impuestos-4 | 1 | A | Deuda/PIB (%) | 100,49352 | 100,48421 | -0,00931 | -0,00927 % |
| 01-impuestos-4 | 1 | A | Inversión (miles de M€) | 367,30055 | 367,30055 | 0 | 0 % |
| 01-impuestos-4 | 1 | B | Producción (miles de M€) | 1683,17918 | 1683,17918 | 0 | 0 % |
| 01-impuestos-4 | 1 | B | Capacidad de compra (€/persona/año) | 22.738,22521 | 22.735,4469 | -2,77832 | -0,01222 % |
| 01-impuestos-4 | 1 | B | Inflación (% interanual) | 2,8883 | 2,90087 | 0,01257 | 0,43531 % |
| 01-impuestos-4 | 1 | B | Desempleo (%) | 10,62214 | 10,61114 | -0,011 | -0,10356 % |
| 01-impuestos-4 | 1 | B | Deuda/PIB (%) | 100,7403 | 100,72796 | -0,01233 | -0,01224 % |
| 01-impuestos-4 | 1 | B | Inversión (miles de M€) | 370,64835 | 370,64835 | 0 | 0 % |
| 01-impuestos-4 | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 01-impuestos-4 | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 01-impuestos-4 | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 01-impuestos-4 | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 01-impuestos-4 | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 01-impuestos-4 | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 01-impuestos-4 | 12 | B | Producción (miles de M€) | 1670,53138 | 1669,14721 | -1,38417 | -0,08286 % |
| 01-impuestos-4 | 12 | B | Capacidad de compra (€/persona/año) | 22.294,38837 | 22.262,08305 | -32,30532 | -0,1449 % |
| 01-impuestos-4 | 12 | B | Inflación (% interanual) | 2,12196 | 2,74523 | 0,62327 | 29,37226 % |
| 01-impuestos-4 | 12 | B | Desempleo (%) | 11,15119 | 11,03742 | -0,11376 | -1,02019 % |
| 01-impuestos-4 | 12 | B | Deuda/PIB (%) | 100,42138 | 99,89436 | -0,52701 | -0,5248 % |
| 01-impuestos-4 | 12 | B | Inversión (miles de M€) | 371,93577 | 370,21073 | -1,72504 | -0,4638 % |
| 01-impuestos-4 | 60 | A | Producción (miles de M€) | 1846,63844 | 1833,93474 | -12,70371 | -0,68794 % |
| 01-impuestos-4 | 60 | A | Capacidad de compra (€/persona/año) | 24.700,92264 | 24.522,53045 | -178,39219 | -0,72221 % |
| 01-impuestos-4 | 60 | A | Inflación (% interanual) | 1,91912 | 2,2454 | 0,32629 | 17,00187 % |
| 01-impuestos-4 | 60 | A | Desempleo (%) | 10,53072 | 10,02259 | -0,50813 | -4,82522 % |
| 01-impuestos-4 | 60 | A | Deuda/PIB (%) | 97,66568 | 96,26825 | -1,39743 | -1,43083 % |
| 01-impuestos-4 | 60 | A | Inversión (miles de M€) | 401,38984 | 390,73127 | -10,65857 | -2,65542 % |
| 01-impuestos-4 | 60 | B | Producción (miles de M€) | 1798,35168 | 1785,94321 | -12,40846 | -0,68999 % |
| 01-impuestos-4 | 60 | B | Capacidad de compra (€/persona/año) | 23.151,78959 | 22.978,33264 | -173,45695 | -0,74922 % |
| 01-impuestos-4 | 60 | B | Inflación (% interanual) | 1,39235 | 2,03342 | 0,64107 | 46,04248 % |
| 01-impuestos-4 | 60 | B | Desempleo (%) | 11,11364 | 10,60597 | -0,50768 | -4,56804 % |
| 01-impuestos-4 | 60 | B | Deuda/PIB (%) | 90,57798 | 87,74857 | -2,82941 | -3,12373 % |
| 01-impuestos-4 | 60 | B | Inversión (miles de M€) | 399,88791 | 389,23934 | -10,64857 | -2,66289 % |
| 02-consumo-15 | 0 | A | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 02-consumo-15 | 0 | A | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 02-consumo-15 | 0 | A | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 02-consumo-15 | 0 | A | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 02-consumo-15 | 0 | A | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 02-consumo-15 | 0 | A | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 02-consumo-15 | 0 | B | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 02-consumo-15 | 0 | B | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 02-consumo-15 | 0 | B | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 02-consumo-15 | 0 | B | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 02-consumo-15 | 0 | B | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 02-consumo-15 | 0 | B | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 02-consumo-15 | 1 | A | Producción (miles de M€) | 1690,33782 | 1690,33782 | 0 | 0 % |
| 02-consumo-15 | 1 | A | Capacidad de compra (€/persona/año) | 23.634,79119 | 23.632,60598 | -2,18521 | -0,00925 % |
| 02-consumo-15 | 1 | A | Inflación (% interanual) | 2,89169 | 2,90121 | 0,00951 | 0,32901 % |
| 02-consumo-15 | 1 | A | Desempleo (%) | 10,52877 | 10,51777 | -0,011 | -0,10448 % |
| 02-consumo-15 | 1 | A | Deuda/PIB (%) | 100,49352 | 100,48421 | -0,00931 | -0,00927 % |
| 02-consumo-15 | 1 | A | Inversión (miles de M€) | 367,30055 | 367,30055 | 0 | 0 % |
| 02-consumo-15 | 1 | B | Producción (miles de M€) | 1683,4774 | 1686,8469 | 3,3695 | 0,20015 % |
| 02-consumo-15 | 1 | B | Capacidad de compra (€/persona/año) | 22.813,43381 | 23.214,36719 | 400,93338 | 1,75744 % |
| 02-consumo-15 | 1 | B | Inflación (% interanual) | 6,59613 | 4,75512 | -1,84101 | -27,91051 % |
| 02-consumo-15 | 1 | B | Desempleo (%) | 10,61824 | 10,56325 | -0,05499 | -0,51788 % |
| 02-consumo-15 | 1 | B | Deuda/PIB (%) | 100,77917 | 100,55685 | -0,22232 | -0,2206 % |
| 02-consumo-15 | 1 | B | Inversión (miles de M€) | 370,5071 | 368,92198 | -1,58512 | -0,42782 % |
| 02-consumo-15 | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 02-consumo-15 | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 02-consumo-15 | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 02-consumo-15 | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 02-consumo-15 | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 02-consumo-15 | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 02-consumo-15 | 12 | B | Producción (miles de M€) | 1672,14229 | 1689,12027 | 16,97797 | 1,01534 % |
| 02-consumo-15 | 12 | B | Capacidad de compra (€/persona/año) | 22.388,88486 | 22.995,28739 | 606,40253 | 2,7085 % |
| 02-consumo-15 | 12 | B | Inflación (% interanual) | 5,81196 | 4,61394 | -1,19802 | -20,61299 % |
| 02-consumo-15 | 12 | B | Desempleo (%) | 11,12998 | 10,77573 | -0,35425 | -3,18284 % |
| 02-consumo-15 | 12 | B | Deuda/PIB (%) | 101,01542 | 99,33237 | -1,68305 | -1,66614 % |
| 02-consumo-15 | 12 | B | Inversión (miles de M€) | 371,96253 | 370,54106 | -1,42147 | -0,38215 % |
| 02-consumo-15 | 24 | A | Producción (miles de M€) | 1745,23294 | 1741,29836 | -3,93458 | -0,22545 % |
| 02-consumo-15 | 24 | A | Capacidad de compra (€/persona/año) | 23.978,47711 | 23.917,77846 | -60,69865 | -0,25314 % |
| 02-consumo-15 | 24 | A | Inflación (% interanual) | 2,02697 | 2,55509 | 0,52812 | 26,05454 % |
| 02-consumo-15 | 24 | A | Desempleo (%) | 10,58489 | 10,37055 | -0,21435 | -2,02501 % |
| 02-consumo-15 | 24 | A | Deuda/PIB (%) | 99,29365 | 98,60936 | -0,68429 | -0,68916 % |
| 02-consumo-15 | 24 | A | Inversión (miles de M€) | 380,05522 | 376,24949 | -3,80573 | -1,00136 % |
| 02-consumo-15 | 24 | B | Producción (miles de M€) | 1702,09163 | 1719,12591 | 17,03428 | 1,00079 % |
| 02-consumo-15 | 24 | B | Capacidad de compra (€/persona/año) | 22.582,92625 | 23.197,40254 | 614,47628 | 2,72098 % |
| 02-consumo-15 | 24 | B | Inflación (% interanual) | 1,58534 | 2,50635 | 0,92101 | 58,09545 % |
| 02-consumo-15 | 24 | B | Desempleo (%) | 11,13556 | 10,65248 | -0,48308 | -4,33816 % |
| 02-consumo-15 | 24 | B | Deuda/PIB (%) | 99,12112 | 96,58346 | -2,53766 | -2,56017 % |
| 02-consumo-15 | 24 | B | Inversión (miles de M€) | 378,8297 | 375,62029 | -3,20941 | -0,84719 % |
| 03-coste-inversion-4 | 0 | A | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | A | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | A | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | A | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | A | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | A | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | B | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | B | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | B | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | B | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | B | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 03-coste-inversion-4 | 0 | B | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 03-coste-inversion-4 | 1 | A | Producción (miles de M€) | 1690,33782 | 1690,33782 | 0 | 0 % |
| 03-coste-inversion-4 | 1 | A | Capacidad de compra (€/persona/año) | 23.634,79119 | 23.632,60598 | -2,18521 | -0,00925 % |
| 03-coste-inversion-4 | 1 | A | Inflación (% interanual) | 2,89169 | 2,90121 | 0,00951 | 0,32901 % |
| 03-coste-inversion-4 | 1 | A | Desempleo (%) | 10,52877 | 10,51777 | -0,011 | -0,10448 % |
| 03-coste-inversion-4 | 1 | A | Deuda/PIB (%) | 100,49352 | 100,48421 | -0,00931 | -0,00927 % |
| 03-coste-inversion-4 | 1 | A | Inversión (miles de M€) | 367,30055 | 367,30055 | 0 | 0 % |
| 03-coste-inversion-4 | 1 | B | Producción (miles de M€) | 1682,76541 | 1682,76541 | 0 | 0 % |
| 03-coste-inversion-4 | 1 | B | Capacidad de compra (€/persona/año) | 23.635,61719 | 23.632,68861 | -2,92858 | -0,01239 % |
| 03-coste-inversion-4 | 1 | B | Inflación (% interanual) | 2,8881 | 2,90085 | 0,01275 | 0,44147 % |
| 03-coste-inversion-4 | 1 | B | Desempleo (%) | 10,62755 | 10,61655 | -0,011 | -0,1035 % |
| 03-coste-inversion-4 | 1 | B | Deuda/PIB (%) | 100,97009 | 100,95756 | -0,01254 | -0,01242 % |
| 03-coste-inversion-4 | 1 | B | Inversión (miles de M€) | 334,69578 | 334,69578 | 0 | 0 % |
| 03-coste-inversion-4 | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 03-coste-inversion-4 | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 03-coste-inversion-4 | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 03-coste-inversion-4 | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 03-coste-inversion-4 | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 03-coste-inversion-4 | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 03-coste-inversion-4 | 12 | B | Producción (miles de M€) | 1666,92761 | 1665,68778 | -1,23983 | -0,07438 % |
| 03-coste-inversion-4 | 12 | B | Capacidad de compra (€/persona/año) | 23.127,16381 | 23.095,12628 | -32,03753 | -0,13853 % |
| 03-coste-inversion-4 | 12 | B | Inflación (% interanual) | 2,11127 | 2,7437 | 0,63244 | 29,95529 % |
| 03-coste-inversion-4 | 12 | B | Desempleo (%) | 11,1987 | 11,08307 | -0,11563 | -1,03254 % |
| 03-coste-inversion-4 | 12 | B | Deuda/PIB (%) | 103,10984 | 102,55491 | -0,55493 | -0,53819 % |
| 03-coste-inversion-4 | 12 | B | Inversión (miles de M€) | 335,09639 | 333,5625 | -1,53389 | -0,45775 % |
| 03-coste-inversion-4 | 60 | A | Producción (miles de M€) | 1846,63844 | 1833,93474 | -12,70371 | -0,68794 % |
| 03-coste-inversion-4 | 60 | A | Capacidad de compra (€/persona/año) | 24.700,92264 | 24.522,53045 | -178,39219 | -0,72221 % |
| 03-coste-inversion-4 | 60 | A | Inflación (% interanual) | 1,91912 | 2,2454 | 0,32629 | 17,00187 % |
| 03-coste-inversion-4 | 60 | A | Desempleo (%) | 10,53072 | 10,02259 | -0,50813 | -4,82522 % |
| 03-coste-inversion-4 | 60 | A | Deuda/PIB (%) | 97,66568 | 96,26825 | -1,39743 | -1,43083 % |
| 03-coste-inversion-4 | 60 | A | Inversión (miles de M€) | 401,38984 | 390,73127 | -10,65857 | -2,65542 % |
| 03-coste-inversion-4 | 60 | B | Producción (miles de M€) | 1791,03106 | 1779,87473 | -11,15633 | -0,6229 % |
| 03-coste-inversion-4 | 60 | B | Capacidad de compra (€/persona/año) | 23.966,89432 | 23.803,91582 | -162,9785 | -0,68002 % |
| 03-coste-inversion-4 | 60 | B | Inflación (% interanual) | 1,44156 | 2,04657 | 0,60502 | 41,96967 % |
| 03-coste-inversion-4 | 60 | B | Desempleo (%) | 11,20338 | 10,68085 | -0,52253 | -4,66407 % |
| 03-coste-inversion-4 | 60 | B | Deuda/PIB (%) | 102,91884 | 99,87689 | -3,04194 | -2,95567 % |
| 03-coste-inversion-4 | 60 | B | Inversión (miles de M€) | 358,22688 | 348,86478 | -9,3621 | -2,61345 % |
| 04-impuestos-4-transferencias-20 | 0 | A | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | A | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | A | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | A | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | A | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | A | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | B | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | B | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | B | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | B | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | B | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 0 | B | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 1 | A | Producción (miles de M€) | 1690,33782 | 1690,33782 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 1 | A | Capacidad de compra (€/persona/año) | 23.634,79119 | 23.632,60598 | -2,18521 | -0,00925 % |
| 04-impuestos-4-transferencias-20 | 1 | A | Inflación (% interanual) | 2,89169 | 2,90121 | 0,00951 | 0,32901 % |
| 04-impuestos-4-transferencias-20 | 1 | A | Desempleo (%) | 10,52877 | 10,51777 | -0,011 | -0,10448 % |
| 04-impuestos-4-transferencias-20 | 1 | A | Deuda/PIB (%) | 100,49352 | 100,48421 | -0,00931 | -0,00927 % |
| 04-impuestos-4-transferencias-20 | 1 | A | Inversión (miles de M€) | 367,30055 | 367,30055 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 1 | B | Producción (miles de M€) | 1693,70481 | 1693,70481 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 1 | B | Capacidad de compra (€/persona/año) | 23.892,7385 | 23.890,86354 | -1,87496 | -0,00785 % |
| 04-impuestos-4-transferencias-20 | 1 | B | Inflación (% interanual) | 2,89329 | 2,90137 | 0,00808 | 0,2791 % |
| 04-impuestos-4-transferencias-20 | 1 | B | Desempleo (%) | 10,48499 | 10,47399 | -0,011 | -0,10491 % |
| 04-impuestos-4-transferencias-20 | 1 | B | Deuda/PIB (%) | 100,33843 | 100,33053 | -0,00789 | -0,00787 % |
| 04-impuestos-4-transferencias-20 | 1 | B | Inversión (miles de M€) | 365,75639 | 365,75639 | 0 | 0 % |
| 04-impuestos-4-transferencias-20 | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 04-impuestos-4-transferencias-20 | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 04-impuestos-4-transferencias-20 | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 04-impuestos-4-transferencias-20 | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 04-impuestos-4-transferencias-20 | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 04-impuestos-4-transferencias-20 | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 04-impuestos-4-transferencias-20 | 12 | B | Producción (miles de M€) | 1728,87758 | 1727,47016 | -1,40743 | -0,08141 % |
| 04-impuestos-4-transferencias-20 | 12 | B | Capacidad de compra (€/persona/año) | 24.212,19227 | 24.186,74209 | -25,45018 | -0,10511 % |
| 04-impuestos-4-transferencias-20 | 12 | B | Inflación (% interanual) | 2,46645 | 2,79493 | 0,32848 | 13,31797 % |
| 04-impuestos-4-transferencias-20 | 12 | B | Desempleo (%) | 10,39591 | 10,28183 | -0,11408 | -1,09738 % |
| 04-impuestos-4-transferencias-20 | 12 | B | Deuda/PIB (%) | 99,58084 | 99,34762 | -0,23322 | -0,2342 % |
| 04-impuestos-4-transferencias-20 | 12 | B | Inversión (miles de M€) | 372,88601 | 371,16272 | -1,72329 | -0,46215 % |
| 04-impuestos-4-transferencias-20 | 60 | A | Producción (miles de M€) | 1846,63844 | 1833,93474 | -12,70371 | -0,68794 % |
| 04-impuestos-4-transferencias-20 | 60 | A | Capacidad de compra (€/persona/año) | 24.700,92264 | 24.522,53045 | -178,39219 | -0,72221 % |
| 04-impuestos-4-transferencias-20 | 60 | A | Inflación (% interanual) | 1,91912 | 2,2454 | 0,32629 | 17,00187 % |
| 04-impuestos-4-transferencias-20 | 60 | A | Desempleo (%) | 10,53072 | 10,02259 | -0,50813 | -4,82522 % |
| 04-impuestos-4-transferencias-20 | 60 | A | Deuda/PIB (%) | 97,66568 | 96,26825 | -1,39743 | -1,43083 % |
| 04-impuestos-4-transferencias-20 | 60 | A | Inversión (miles de M€) | 401,38984 | 390,73127 | -10,65857 | -2,65542 % |
| 04-impuestos-4-transferencias-20 | 60 | B | Producción (miles de M€) | 1870,2573 | 1857,4099 | -12,8474 | -0,68693 % |
| 04-impuestos-4-transferencias-20 | 60 | B | Capacidad de compra (€/persona/año) | 25.284,91714 | 25.105,6513 | -179,26584 | -0,70898 % |
| 04-impuestos-4-transferencias-20 | 60 | B | Inflación (% interanual) | 2,17769 | 2,34898 | 0,1713 | 7,86604 % |
| 04-impuestos-4-transferencias-20 | 60 | B | Desempleo (%) | 10,25112 | 9,74277 | -0,50835 | -4,959 % |
| 04-impuestos-4-transferencias-20 | 60 | B | Deuda/PIB (%) | 98,58711 | 97,91932 | -0,66779 | -0,67736 % |
| 04-impuestos-4-transferencias-20 | 60 | B | Inversión (miles de M€) | 402,12456 | 391,46112 | -10,66344 | -2,65178 % |
| 05-mandato-24 | 0 | A | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 05-mandato-24 | 0 | A | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 05-mandato-24 | 0 | A | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 05-mandato-24 | 0 | A | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 05-mandato-24 | 0 | A | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 05-mandato-24 | 0 | A | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 05-mandato-24 | 0 | B | Producción (miles de M€) | 1690,012 | 1690,012 | 0 | 0 % |
| 05-mandato-24 | 0 | B | Capacidad de compra (€/persona/año) | 23.706,87022 | 23.706,87022 | 0 | 0 % |
| 05-mandato-24 | 0 | B | Inflación (% interanual) | 2,9 | 2,9 | 0 | 0 % |
| 05-mandato-24 | 0 | B | Desempleo (%) | 10,5 | 10,5 | 0 | 0 % |
| 05-mandato-24 | 0 | B | Deuda/PIB (%) | 100,47266 | 100,47266 | 0 | 0 % |
| 05-mandato-24 | 0 | B | Inversión (miles de M€) | 367,451 | 367,451 | 0 | 0 % |
| 05-mandato-24 | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 05-mandato-24 | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 05-mandato-24 | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 05-mandato-24 | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 05-mandato-24 | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 05-mandato-24 | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 05-mandato-24 | 12 | B | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 05-mandato-24 | 12 | B | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 05-mandato-24 | 12 | B | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 05-mandato-24 | 12 | B | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 05-mandato-24 | 12 | B | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 05-mandato-24 | 12 | B | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 05-mandato-24 | 24 | A | Producción (miles de M€) | 1745,23294 | 1741,29836 | -3,93458 | -0,22545 % |
| 05-mandato-24 | 24 | A | Capacidad de compra (€/persona/año) | 23.978,47711 | 23.917,77846 | -60,69865 | -0,25314 % |
| 05-mandato-24 | 24 | A | Inflación (% interanual) | 2,02697 | 2,55509 | 0,52812 | 26,05454 % |
| 05-mandato-24 | 24 | A | Desempleo (%) | 10,58489 | 10,37055 | -0,21435 | -2,02501 % |
| 05-mandato-24 | 24 | A | Deuda/PIB (%) | 99,29365 | 98,60936 | -0,68429 | -0,68916 % |
| 05-mandato-24 | 24 | A | Inversión (miles de M€) | 380,05522 | 376,24949 | -3,80573 | -1,00136 % |
| 05-mandato-24 | 24 | B | Producción (miles de M€) | 1745,23294 | 1741,29836 | -3,93458 | -0,22545 % |
| 05-mandato-24 | 24 | B | Capacidad de compra (€/persona/año) | 23.978,47711 | 23.917,77846 | -60,69865 | -0,25314 % |
| 05-mandato-24 | 24 | B | Inflación (% interanual) | 2,02697 | 2,55509 | 0,52812 | 26,05454 % |
| 05-mandato-24 | 24 | B | Desempleo (%) | 10,58489 | 10,37055 | -0,21435 | -2,02501 % |
| 05-mandato-24 | 24 | B | Deuda/PIB (%) | 99,29365 | 98,60936 | -0,68429 | -0,68916 % |
| 05-mandato-24 | 24 | B | Inversión (miles de M€) | 380,05522 | 376,24949 | -3,80573 | -1,00136 % |
| 05-mandato-24 | 48 | A | Producción (miles de M€) | 1810,95118 | 1801,29147 | -9,65972 | -0,53341 % |
| 05-mandato-24 | 48 | A | Capacidad de compra (€/persona/año) | 24.434,4583 | 24.300,47998 | -133,97832 | -0,54832 % |
| 05-mandato-24 | 48 | A | Inflación (% interanual) | 1,88348 | 2,27934 | 0,39586 | 21,0174 % |
| 05-mandato-24 | 48 | A | Desempleo (%) | 10,56392 | 10,15359 | -0,41034 | -3,88432 % |
| 05-mandato-24 | 48 | A | Deuda/PIB (%) | 98,32179 | 97,05876 | -1,26303 | -1,28459 % |
| 05-mandato-24 | 48 | A | Inversión (miles de M€) | 393,82596 | 385,55105 | -8,27491 | -2,10116 % |
| 05-mandato-24 | 48 | B | Producción (miles de M€) | 1810,95118 | 1801,29147 | -9,65972 | -0,53341 % |
| 05-mandato-24 | 48 | B | Capacidad de compra (€/persona/año) | 24.434,4583 | 24.300,47998 | -133,97832 | -0,54832 % |
| 05-mandato-24 | 48 | B | Inflación (% interanual) | 1,88348 | 2,27934 | 0,39586 | 21,0174 % |
| 05-mandato-24 | 48 | B | Desempleo (%) | 10,56392 | 10,15359 | -0,41034 | -3,88432 % |
| 05-mandato-24 | 48 | B | Deuda/PIB (%) | 98,32179 | 97,05876 | -1,26303 | -1,28459 % |
| 05-mandato-24 | 48 | B | Inversión (miles de M€) | 393,82596 | 385,55105 | -8,27491 | -2,10116 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | A | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | A | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | A | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | A | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | A | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | A | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | B | Producción (miles de M€) | 1709,87595 | 1708,47603 | -1,39992 | -0,08187 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | B | Capacidad de compra (€/persona/año) | 23.697,97395 | 23.669,99934 | -27,9746 | -0,11805 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | B | Inflación (% interanual) | 2,35487 | 2,77886 | 0,42399 | 18,00465 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | B | Desempleo (%) | 10,63905 | 10,52507 | -0,11398 | -1,07134 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | B | Deuda/PIB (%) | 100,1767 | 99,84881 | -0,3279 | -0,32732 % |
| 06-bifurcacion-mes12-impuestos4 | 12 | B | Inversión (miles de M€) | 372,58071 | 370,85683 | -1,72388 | -0,46269 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | A | Producción (miles de M€) | 1712,37065 | 1710,77884 | -1,59181 | -0,09296 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | A | Capacidad de compra (€/persona/año) | 23.714,55529 | 23.683,90762 | -30,64768 | -0,12924 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | A | Inflación (% interanual) | 2,29288 | 2,75582 | 0,46294 | 20,19037 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | A | Desempleo (%) | 10,63998 | 10,51744 | -0,12254 | -1,15169 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | A | Deuda/PIB (%) | 100,12601 | 99,76262 | -0,36339 | -0,36293 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | A | Inversión (miles de M€) | 373,148 | 371,2563 | -1,89169 | -0,50695 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | B | Producción (miles de M€) | 1705,12787 | 1703,542 | -1,58588 | -0,09301 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | B | Capacidad de compra (€/persona/año) | 22.814,95763 | 22.784,80078 | -30,15685 | -0,13218 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | B | Inflación (% interanual) | 2,28953 | 2,75548 | 0,46596 | 20,3516 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | B | Desempleo (%) | 10,73323 | 10,61071 | -0,12253 | -1,14159 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | B | Deuda/PIB (%) | 100,3706 | 100,00284 | -0,36776 | -0,3664 % |
| 06-bifurcacion-mes12-impuestos4 | 13 | B | Inversión (miles de M€) | 376,53123 | 374,62394 | -1,90729 | -0,50654 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | A | Producción (miles de M€) | 1745,23294 | 1741,29836 | -3,93458 | -0,22545 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | A | Capacidad de compra (€/persona/año) | 23.978,47711 | 23.917,77846 | -60,69865 | -0,25314 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | A | Inflación (% interanual) | 2,02697 | 2,55509 | 0,52812 | 26,05454 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | A | Desempleo (%) | 10,58489 | 10,37055 | -0,21435 | -2,02501 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | A | Deuda/PIB (%) | 99,29365 | 98,60936 | -0,68429 | -0,68916 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | A | Inversión (miles de M€) | 380,05522 | 376,24949 | -3,80573 | -1,00136 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | B | Producción (miles de M€) | 1705,08677 | 1701,22 | -3,86677 | -0,22678 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | B | Capacidad de compra (€/persona/año) | 22.558,55918 | 22.495,32764 | -63,23154 | -0,2803 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | B | Inflación (% interanual) | 1,79526 | 2,52144 | 0,72619 | 40,4502 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | B | Desempleo (%) | 11,09688 | 10,88282 | -0,21405 | -1,92894 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | B | Deuda/PIB (%) | 99,51472 | 98,62512 | -0,8896 | -0,89393 % |
| 06-bifurcacion-mes12-impuestos4 | 24 | B | Inversión (miles de M€) | 379,40109 | 375,59263 | -3,80847 | -1,00381 % |

## Oráculos E2E adicionales

| Caso | Mes | Rama golden | KPI | 0.1.0 | 0.2.0 | Δ absoluta | Δ % |
|---|---:|:---:|---|---:|---:|---:|---:|
| E02/P03 mes60 | 60 | A | Producción (miles de M€) | 1846,63844 | 1833,93474 | -12,70371 | -0,68794 % |
| E02/P03 mes60 | 60 | A | Capacidad de compra (€/persona/año) | 24.700,92264 | 24.522,53045 | -178,39219 | -0,72221 % |
| E02/P03 mes60 | 60 | A | Inflación (% interanual) | 1,91912 | 2,2454 | 0,32629 | 17,00187 % |
| E02/P03 mes60 | 60 | A | Desempleo (%) | 10,53072 | 10,02259 | -0,50813 | -4,82522 % |
| E02/P03 mes60 | 60 | A | Deuda/PIB (%) | 97,66568 | 96,26825 | -1,39743 | -1,43083 % |
| E02/P03 mes60 | 60 | A | Inversión (miles de M€) | 401,38984 | 390,73127 | -10,65857 | -2,65542 % |
| E02/P03 mes60 | 60 | B | Producción (miles de M€) | 1800,31277 | 1810,21367 | 9,9009 | 0,54995 % |
| E02/P03 mes60 | 60 | B | Capacidad de compra (€/persona/año) | 23.253,31921 | 23.779,06702 | 525,74781 | 2,26096 % |
| E02/P03 mes60 | 60 | B | Inflación (% interanual) | 1,41369 | 2,14066 | 0,72697 | 51,42331 % |
| E02/P03 mes60 | 60 | B | Desempleo (%) | 11,08967 | 10,30901 | -0,78066 | -7,03951 % |
| E02/P03 mes60 | 60 | B | Deuda/PIB (%) | 93,8772 | 89,53996 | -4,33724 | -4,62012 % |
| E02/P03 mes60 | 60 | B | Inversión (miles de M€) | 399,9489 | 389,99382 | -9,95509 | -2,48909 % |
| E03/P04 mes120 | 120 | A | Producción (miles de M€) | 2036,32088 | 2003,64536 | -32,67552 | -1,60464 % |
| E03/P04 mes120 | 120 | A | Capacidad de compra (€/persona/año) | 26.040,55228 | 25.628,89576 | -411,65652 | -1,58083 % |
| E03/P04 mes120 | 120 | A | Inflación (% interanual) | 2,06584 | 2,3917 | 0,32585 | 15,77329 % |
| E03/P04 mes120 | 120 | A | Desempleo (%) | 10,36022 | 9,39611 | -0,96412 | -9,30595 % |
| E03/P04 mes120 | 120 | A | Deuda/PIB (%) | 94,14645 | 92,42014 | -1,72631 | -1,83364 % |
| E03/P04 mes120 | 120 | A | Inversión (miles de M€) | 440,9866 | 416,49625 | -24,49035 | -5,55354 % |
| E03/P04 mes120 | 120 | B | Producción (miles de M€) | 1972,37877 | 1946,3184 | -26,06036 | -1,32127 % |
| E03/P04 mes120 | 120 | B | Capacidad de compra (€/persona/año) | 25.230,97011 | 24.889,85931 | -341,11079 | -1,35195 % |
| E03/P04 mes120 | 120 | B | Inflación (% interanual) | 1,68859 | 2,19374 | 0,50515 | 29,91551 % |
| E03/P04 mes120 | 120 | B | Desempleo (%) | 11,06212 | 10,03474 | -1,02738 | -9,28741 % |
| E03/P04 mes120 | 120 | B | Deuda/PIB (%) | 101,18699 | 96,64205 | -4,54494 | -4,49163 % |
| E03/P04 mes120 | 120 | B | Inversión (miles de M€) | 391,40603 | 370,44385 | -20,96218 | -5,35561 % |
| E05 bifurcación mes36 | 36 | A | Producción (miles de M€) | 1776,92021 | 1770,19321 | -6,727 | -0,37858 % |
| E05 bifurcación mes36 | 36 | A | Capacidad de compra (€/persona/año) | 24.191,84666 | 24.094,4934 | -97,35326 | -0,40242 % |
| E05 bifurcación mes36 | 36 | A | Inflación (% interanual) | 1,8 | 2,36048 | 0,56048 | 31,13765 % |
| E05 bifurcación mes36 | 36 | A | Desempleo (%) | 10,58515 | 10,2726 | -0,31256 | -2,95277 % |
| E05 bifurcación mes36 | 36 | A | Deuda/PIB (%) | 98,89623 | 97,83867 | -1,05756 | -1,06936 % |
| E05 bifurcación mes36 | 36 | A | Inversión (miles de M€) | 387,10786 | 381,11041 | -5,99745 | -1,5493 % |
| E05 bifurcación mes36 | 36 | B | Producción (miles de M€) | 1776,92021 | 1770,19321 | -6,727 | -0,37858 % |
| E05 bifurcación mes36 | 36 | B | Capacidad de compra (€/persona/año) | 24.191,84666 | 24.094,4934 | -97,35326 | -0,40242 % |
| E05 bifurcación mes36 | 36 | B | Inflación (% interanual) | 1,8 | 2,36048 | 0,56048 | 31,13765 % |
| E05 bifurcación mes36 | 36 | B | Desempleo (%) | 10,58515 | 10,2726 | -0,31256 | -2,95277 % |
| E05 bifurcación mes36 | 36 | B | Deuda/PIB (%) | 98,89623 | 97,83867 | -1,05756 | -1,06936 % |
| E05 bifurcación mes36 | 36 | B | Inversión (miles de M€) | 387,10786 | 381,11041 | -5,99745 | -1,5493 % |
| E05 bifurcación mes36 | 37 | A | Producción (miles de M€) | 1775,33633 | 1768,36973 | -6,9666 | -0,39241 % |
| E05 bifurcación mes36 | 37 | A | Capacidad de compra (€/persona/año) | 24.212,67441 | 24.112,01086 | -100,66354 | -0,41575 % |
| E05 bifurcación mes36 | 37 | A | Inflación (% interanual) | 1,80359 | 2,3498 | 0,54622 | 30,28494 % |
| E05 bifurcación mes36 | 37 | A | Desempleo (%) | 10,63778 | 10,31728 | -0,3205 | -3,01285 % |
| E05 bifurcación mes36 | 37 | A | Deuda/PIB (%) | 99,10712 | 98,02561 | -1,08151 | -1,09125 % |
| E05 bifurcación mes36 | 37 | A | Inversión (miles de M€) | 389,77716 | 383,56847 | -6,20869 | -1,59288 % |
| E05 bifurcación mes36 | 37 | B | Producción (miles de M€) | 1767,80956 | 1760,87146 | -6,9381 | -0,39247 % |
| E05 bifurcación mes36 | 37 | B | Capacidad de compra (€/persona/año) | 23.294,18078 | 23.196,65275 | -97,52803 | -0,41868 % |
| E05 bifurcación mes36 | 37 | B | Inflación (% interanual) | 1,80025 | 2,34946 | 0,54921 | 30,50749 % |
| E05 bifurcación mes36 | 37 | B | Desempleo (%) | 10,73125 | 10,41077 | -0,32049 | -2,98648 % |
| E05 bifurcación mes36 | 37 | B | Deuda/PIB (%) | 99,34814 | 98,25922 | -1,08892 | -1,09606 % |
| E05 bifurcación mes36 | 37 | B | Inversión (miles de M€) | 393,34593 | 387,08242 | -6,2635 | -1,59236 % |
| E05 bifurcación mes36 | 48 | A | Producción (miles de M€) | 1810,95118 | 1801,29147 | -9,65972 | -0,53341 % |
| E05 bifurcación mes36 | 48 | A | Capacidad de compra (€/persona/año) | 24.434,4583 | 24.300,47998 | -133,97832 | -0,54832 % |
| E05 bifurcación mes36 | 48 | A | Inflación (% interanual) | 1,88348 | 2,27934 | 0,39586 | 21,0174 % |
| E05 bifurcación mes36 | 48 | A | Desempleo (%) | 10,56392 | 10,15359 | -0,41034 | -3,88432 % |
| E05 bifurcación mes36 | 48 | A | Deuda/PIB (%) | 98,32179 | 97,05876 | -1,26303 | -1,28459 % |
| E05 bifurcación mes36 | 48 | A | Inversión (miles de M€) | 393,82596 | 385,55105 | -8,27491 | -2,10116 % |
| E05 bifurcación mes36 | 48 | B | Producción (miles de M€) | 1769,3706 | 1759,90793 | -9,46267 | -0,5348 % |
| E05 bifurcación mes36 | 48 | B | Capacidad de compra (€/persona/año) | 22.988,50083 | 22.856,23549 | -132,26534 | -0,57535 % |
| E05 bifurcación mes36 | 48 | B | Inflación (% interanual) | 1,65285 | 2,24558 | 0,59273 | 35,86108 % |
| E05 bifurcación mes36 | 48 | B | Desempleo (%) | 11,07495 | 10,66492 | -0,41003 | -3,7023 % |
| E05 bifurcación mes36 | 48 | B | Deuda/PIB (%) | 98,51599 | 97,03501 | -1,48097 | -1,50328 % |
| E05 bifurcación mes36 | 48 | B | Inversión (miles de M€) | 393,14849 | 384,86832 | -8,28016 | -2,10612 % |
| E05 bifurcación mes36 | 96 | A | Producción (miles de M€) | 1957,73351 | 1935,09073 | -22,64278 | -1,15658 % |
| E05 bifurcación mes36 | 96 | A | Capacidad de compra (€/persona/año) | 25.483,7883 | 25.187,8757 | -295,9126 | -1,16118 % |
| E05 bifurcación mes36 | 96 | A | Inflación (% interanual) | 2,02511 | 2,27554 | 0,25043 | 12,36603 % |
| E05 bifurcación mes36 | 96 | A | Desempleo (%) | 10,43384 | 9,63377 | -0,80007 | -7,66802 % |
| E05 bifurcación mes36 | 96 | A | Deuda/PIB (%) | 95,69928 | 94,02376 | -1,67553 | -1,75082 % |
| E05 bifurcación mes36 | 96 | A | Inversión (miles de M€) | 424,73046 | 406,3285 | -18,40195 | -4,33262 % |
| E05 bifurcación mes36 | 96 | B | Producción (miles de M€) | 1906,56813 | 1884,47841 | -22,08972 | -1,15861 % |
| E05 bifurcación mes36 | 96 | B | Capacidad de compra (€/persona/año) | 23.885,9336 | 23.602,20798 | -283,72562 | -1,18784 % |
| E05 bifurcación mes36 | 96 | B | Inflación (% interanual) | 1,49697 | 2,06009 | 0,56313 | 37,618 % |
| E05 bifurcación mes36 | 96 | B | Desempleo (%) | 11,01646 | 10,21684 | -0,79962 | -7,25839 % |
| E05 bifurcación mes36 | 96 | B | Deuda/PIB (%) | 88,54681 | 85,42844 | -3,11837 | -3,52172 % |
| E05 bifurcación mes36 | 96 | B | Inversión (miles de M€) | 423,14156 | 404,75814 | -18,38342 | -4,34451 % |

## Invariantes previos a regenerar

- `npm test`: 68/68 PASS; incluye identidades contables mensuales, valores finitos, igualdad de ramas idénticas, prefijo histórico en bifurcación, progresividad, pass-through fiscal y shocks.
- Antes de actualizar expectativas, `npm run test:regression` se detuvo en su guarda de versión (`0.2.0 !== 0.1.0`) antes de comparar snapshots. Tras revisar este delta y pasar los sanity checks, se regeneraron los goldens activos; la ejecución posterior pasó 7 casos, 27 fechas y 3.282 comparaciones.
- Los artefactos 0.1.0 quedan preservados en `docs/playbook/sesiones/model-0.1.0/`, `docs/playbook/evidencias/resultados-model-0.1.0.json` y `docs/playbook/oracles/model-0.1.0/`.
- `make build`: PASS. `npm test`: 68/68 PASS. `npm run test:regression`: 7 escenarios, 27 fechas, 3.282 comparaciones PASS. `npm run test:browser`: Chromium real, HTTP, Worker e IndexedDB; E01, P02, P05, E02, E03, E04 y E05 PASS.
- Los goldens 0.2.0 son referencias de reproducibilidad del comportamiento implementado, no evidencia de validez económica. Las copias 0.1.0 permanecen archivadas sin cambios.
