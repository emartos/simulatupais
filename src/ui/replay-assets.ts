declare global {
  interface Window { __REPLAY_ASSETS__?: Readonly<Record<string,string>> }
}

// The root build and each archived runtime resolve the same logical paths after catalog validation.
export function replayAssetUrl(logicalPath:string):string {
  const assets=typeof window==='undefined'?undefined:window.__REPLAY_ASSETS__;
  if(!assets){
    if(typeof window==='undefined')return logicalPath;
    throw new Error(`Falta el manifest de assets: ${logicalPath}`);
  }
  const resolved=assets[logicalPath.replace(/^\//,'')];
  if(!resolved)throw new Error(`Falta un asset del runtime: ${logicalPath}`);
  return resolved;
}
