import { replayAssetUrl } from './replay-assets.js';

export type VideoTutorialVariant = 'intro' | 'home';

export const TUTORIAL_VIDEO_URL = '/media/tutorial-simula-tu-pais.mp4';
export const TUTORIAL_POSTER_URL = '/media/tutorial-simula-tu-pais-poster.webp';

export function renderVideoTutorial(variant:VideoTutorialVariant):string {
  if(variant==='intro')return `<div class="tutorial-intro-action"><button type="button" data-action="open-tutorial" data-tutorial-variant="intro">Ver cómo funciona</button></div>`;
  return `<div class="tutorial-feature"><button type="button" class="tutorial-thumbnail" data-action="open-tutorial" data-tutorial-variant="home" aria-label="Ver cómo funciona Simula tu país"><img src="${replayAssetUrl(TUTORIAL_POSTER_URL)}" alt="" width="320" height="180" loading="lazy" decoding="async"><span class="tutorial-play" aria-hidden="true"></span></button><div class="tutorial-feature-copy"><button type="button" class="tutorial-feature-title" data-action="open-tutorial" data-tutorial-variant="home">Ver cómo funciona · 2 min</button><p>Un breve recorrido para ver cómo configurar un escenario, avanzar la simulación y comparar decisiones.</p></div></div>`;
}

export function renderVideoTutorialDialog():string {
  return `<div class="modal-backdrop tutorial-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description" class="modal tutorial-modal"><header><h2 id="tutorial-title">Cómo funciona Simula tu país</h2><button type="button" data-action="close-tutorial" aria-label="Cerrar tutorial">Cerrar</button></header><p id="tutorial-description">Un recorrido por la configuración, el avance y la comparación. Incluye subtítulos en pantalla.</p><video id="tutorial-video" controls preload="none" playsinline poster="${replayAssetUrl(TUTORIAL_POSTER_URL)}" aria-label="Tutorial de Simula tu país" tabindex="0"><source src="${replayAssetUrl(TUTORIAL_VIDEO_URL)}" type="video/mp4">Tu navegador no puede reproducir este vídeo.</video></section></div>`;
}
