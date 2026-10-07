declare global {
  interface Window { __REPLAY_ASSETS__?: Readonly<Record<string,string>> }
}

// The archive resolves logical paths after the preset catalog has passed validation.
export function replayAssetUrl(logicalPath:string):string {
  const assets=typeof window==='undefined'?undefined:window.__REPLAY_ASSETS__;
  if(!assets)return logicalPath;
  const resolved=assets[logicalPath.replace(/^\//,'')];
  if(!resolved)throw new Error(`Falta un asset del runtime histórico: ${logicalPath}`);
  return resolved;
}
