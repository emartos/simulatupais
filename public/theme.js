(() => {
  const key = 'polis-appearance';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let mode = 'system';
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark' || stored === 'system') mode = stored;
  } catch {}
  const apply = () => {
    document.documentElement.dataset.theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    document.documentElement.dataset.appearance = mode;
  };
  apply();
  media.addEventListener?.('change', () => { if (mode === 'system') apply(); });
  window.addEventListener('simula-appearance', (event) => {
    const value = event.detail;
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    mode = value;
    apply();
  });
})();
