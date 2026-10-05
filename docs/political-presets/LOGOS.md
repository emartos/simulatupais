# Logos oficiales del selector

Los recursos se sirven desde copias locales y no se hotlinkean en ejecución. Todos los logos se presentan dentro de una caja blanca común, con borde gris claro y esquinas suavizadas; el blanco es del contenedor y no se incorpora al asset. Se conserva la transparencia y relación de aspecto mediante `object-fit: contain`. ERC y BNG tienen un ajuste óptico de escala en presentación para compensar espacio vacío del propio archivo; los assets permanecen intactos. Se usan solo como identificación visual: no intervienen en scores, cobertura, orden o resultados. Los logos y marcas pertenecen a sus titulares y no forman parte de la licencia del código del simulador.

En esta pasada se restauró el PNG de ERC byte a byte desde su recurso oficial (SHA-256 `8b3103033850d5bb897c7f84748ec607459bfdab85246bf62df04569f5edc8aa`) y se sustituyó el SVG de PP, cuyo `viewBox` oficial cortaba parte del propio dibujo, por la versión horizontal PNG completa servida por la web oficial. No se editó ninguno de los archivos de marca; el fondo y los ajustes ópticos se aplican solo por CSS.

| Actor | Asset local | Fuente oficial | Formato | Estado |
|---|---|---|---|---|
| Partido Popular (PP) | `public/assets/political-parties/pp.png` | [Logo azul en la web del PP](https://www.pp.es/wp-content/uploads/2024/12/logo-azul-e1734337769627.png) | PNG · 175×41 | Verificado · 2026-10-05 |
| Partido Socialista Obrero Español (PSOE) | `public/assets/political-parties/psoe.png` | [Logo en el sitio oficial del PSOE](https://www.psoe.es/media/themes/views/portadas/images/PSOE-footer.png) | PNG | Verificado · 2026-10-05 |
| VOX | `public/assets/political-parties/vox.svg` | [Programa oficial de las elecciones generales 23J](https://www.voxespana.es/wp-content/uploads/2023/07/Programa-VOX-2023-con-menos-peso.pdf), portada | SVG recortado del SVG vectorial de la portada oficial | Verificado · 2026-10-05 |
| Coalición Sumar | `public/assets/political-parties/sumar.svg` | [Logo en la web oficial de Sumar](https://movimientosumar.es/wp-content/uploads/2024/02/logo-00.svg) | SVG | Verificado · 2026-10-05 |
| Esquerra Republicana de Catalunya (ERC) | `public/assets/political-parties/erc.png` | [Logo servido por el sitio oficial de Esquerra](https://staticen.esquerra.cat/uploads/20200511/esquerra_erc_republicana_logotip.png) | PNG recortado del espacio en blanco exterior | Verificado · 2026-10-05 |
| Junts per Catalunya (Junts) | `public/assets/political-parties/junts.svg` | [Logo en la web oficial de Junts](https://junts.cat/wp-content/uploads/2026/03/logo-junts.svg) | SVG | Verificado · 2026-10-05 |
| Euskal Herria Bildu (EH Bildu) | `public/assets/political-parties/eh-bildu.png` | [Identificador gráfico en la web oficial de EH Bildu](https://ehbildu.eus/logo_eposta.png) | PNG | Verificado · 2026-10-05 |
| EAJ-PNV | `public/assets/political-parties/eaj-pnv.png` | [Logo en la web oficial de EAJ-PNV](https://www.eaj-pnv.eus/img/logotipo-eaj-pnv-2025-300.png) | PNG | Verificado · 2026-10-05 |
| Bloque Nacionalista Galego (BNG) | `public/assets/political-parties/bng.svg` | [Archivo vectorial del manual oficial de identidad](https://www.bng.gal/media/bnggaliza/files/2017/05/31/version_horizontal_logo_cor.zip) | SVG del paquete de identidad | Verificado · 2026-10-05 |
| Coalición Canaria (CCa) | `public/assets/political-parties/coalicion-canaria.png` | [Manual oficial de identidad de Coalición Canaria](https://coalicioncanaria.org/wp-content/uploads/cc-pdf/documentos/Nueva%20Imagen%20de%20Coalici%C3%B3n%20Canaria.pdf) | PNG recortado de la composición oficial | Verificado · 2026-10-05 |
| Unión del Pueblo Navarro (UPN) | `public/assets/political-parties/upn.png` | [Logo en la web oficial de UPN](https://www.upn.org/wp-content/uploads/2023/04/logo-200.png) | PNG | Verificado · 2026-10-05 |

La procedencia completa de cada asset también está en los metadatos del catálogo. Los tests comprueban que las once rutas sean locales y estén presentes.
