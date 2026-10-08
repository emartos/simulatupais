import test from 'node:test';
import assert from 'node:assert/strict';
import { replayAssetUrl } from '../dist/app/ui/replay-assets.js';
import { renderVideoTutorial, renderVideoTutorialDialog } from '../dist/app/ui/video-tutorial.js';

test('root y replay resuelven las mismas rutas lógicas; un build sin manifest falla',()=>{
  const previous=globalThis.window;
  try{
    delete globalThis.window;
    assert.equal(replayAssetUrl('/media/tutorial-simula-tu-pais.mp4'),'/media/tutorial-simula-tu-pais.mp4');
    globalThis.window={};
    assert.throws(()=>replayAssetUrl('/media/tutorial-simula-tu-pais.mp4'),/Falta el manifest/);
    globalThis.window={__REPLAY_ASSETS__:Object.freeze({
      'media/tutorial-simula-tu-pais.mp4':'/replay/blobs/video/asset.mp4',
      'media/tutorial-simula-tu-pais-poster.webp':'/replay/blobs/poster/asset.webp',
      'assets/political-parties/pp.png':'/replay/blobs/logo/asset.png'
    })};
    assert.equal(replayAssetUrl('/assets/political-parties/pp.png'),'/replay/blobs/logo/asset.png');
    assert.ok(renderVideoTutorial('home').includes('/replay/blobs/poster/asset.webp'));
    const dialog=renderVideoTutorialDialog();
    assert.ok(dialog.includes('/replay/blobs/video/asset.mp4'));
    assert.ok(dialog.includes('/replay/blobs/poster/asset.webp'));
    assert.throws(()=>replayAssetUrl('/assets/political-parties/unknown.png'),/Falta un asset/);
  }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
