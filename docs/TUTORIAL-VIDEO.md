# Vídeo de ayuda

El videotutorial que entra en `dist/` es `public/media/tutorial-simula-tu-pais.mp4`. Procede del archivo local `final_20261005_195228.mp4`, movido sin recomprimir; no se mantiene otra copia en la raíz. La pantalla de inicio y la home abren el mismo reproductor y la misma URL.

El vídeo dura 2 min 19 s, tiene audio y muestra subtítulos integrados en la imagen. El MP4 no contiene una pista de subtítulos separada; no se ha creado un `.vtt` sin transcripción de origen. El poster `public/media/tutorial-simula-tu-pais-poster.webp` es un fotograma real extraído en el segundo 75.

El reproductor se incorpora al DOM sólo al abrir el diálogo y usa `preload="none"`. La miniatura integrada en la introducción de la home descarga únicamente el poster antes de esa interacción. Su título «2 min» expresa una duración aproximada; el archivo dura 2 min 19 s.
