import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { renderVideoTutorial, renderVideoTutorialDialog, TUTORIAL_POSTER_URL, TUTORIAL_VIDEO_URL } from '../dist/app/ui/video-tutorial.js';

test('el build publica un único vídeo y su poster para ambas entradas',async()=>{
  const source=await stat(`public${TUTORIAL_VIDEO_URL}`),built=await stat(`dist${TUTORIAL_VIDEO_URL}`);
  assert.ok(source.size>0);
  assert.equal(built.size,source.size);
  assert.ok((await stat(`dist${TUTORIAL_POSTER_URL}`)).size>0);
  for(const variant of ['intro','home']){
    const entry=renderVideoTutorial(variant);
    assert.match(entry,new RegExp(`data-tutorial-variant="${variant}"`));
    assert.match(entry,/data-action="open-tutorial"/);
  }
  const home=renderVideoTutorial('home');
  assert.match(home,/class="tutorial-thumbnail"/);
  assert.match(home,/Ver cómo funciona · 2 min/);
  assert.ok(home.includes(`src="${TUTORIAL_POSTER_URL}"`));
  assert.doesNotMatch(home,/tutorial-card|¿Primera vez por aquí\?|Ver tutorial/);
  const dialog=renderVideoTutorialDialog();
  assert.equal(dialog.match(/<source /g)?.length,1);
  assert.ok(dialog.includes(`src="${TUTORIAL_VIDEO_URL}"`));
  assert.ok(dialog.includes(`poster="${TUTORIAL_POSTER_URL}"`));
  assert.match(dialog,/controls preload="none" playsinline/);
  assert.doesNotMatch(dialog,/\bautoplay\b|\bloop\b/);
});
