import { BUILD_INFO } from './project.js';

const runtimePattern=/^rt-[a-f0-9]{32}$/;
const unavailable='Este escenario fue creado con una versión del simulador que no está disponible.';

function showError(message:string):void {
  const root=document.querySelector('#app');if(!root)return;
  root.replaceChildren();
  const panel=document.createElement('div');panel.className='boot';
  const title=document.createElement('h1');title.textContent='No se pudo abrir el escenario';
  const text=document.createElement('p');text.textContent=message;
  const link=document.createElement('a');link.href='/';link.textContent='Volver al simulador actual';
  panel.append(title,text,link);root.append(panel);
}
async function loadAssets():Promise<boolean> {
  const archived=location.pathname.startsWith('/replay/');
  if(archived){
    const match=location.pathname.match(/^\/replay\/(rt-[a-f0-9]{32})\/$/);
    if(!match||match[1]!==BUILD_INFO.replayRuntimeId){showError(unavailable);return false;}
  }
  try{
    const response=await fetch(archived?new URL('../asset-manifest.json',import.meta.url):'/asset-manifest.json');
    if(!response.ok)throw new Error('Manifest de assets ausente');
    const manifest=await response.json() as {schema?:number;assets?:Record<string,{sha256?:string;path?:string}>};
    if(manifest.schema!==1||!manifest.assets||typeof manifest.assets!=='object'||Array.isArray(manifest.assets))throw new Error('Manifest de assets inválido');
    const paths:Record<string,string>=Object.create(null);
    for(const [name,asset] of Object.entries(manifest.assets)){
      if(!/^(?:assets\/|media\/|icon\.svg$|share-preview\.(?:png|svg)$)/.test(name)||!/^([a-f0-9]{64})$/.test(asset.sha256||'')||
        !new RegExp(`^/replay/blobs/${asset.sha256}/asset\\.(?:mp4|webp|png|svg)$`).test(asset.path||''))throw new Error('Referencia de asset inválida');
      paths[name]=asset.path!;
    }
    window.__REPLAY_ASSETS__=Object.freeze(paths);
    return true;
  }catch{showError('No se pudieron cargar los assets de esta versión del simulador.');return false;}
}

async function start():Promise<void> {
  const url=new URL(location.href),params=url.searchParams;
  if(params.has('r')||params.get('v')==='2'){
    if(params.getAll('v').length!==1||params.get('v')!=='2'||params.getAll('r').length!==1||params.getAll('c').length!==1||params.getAll('s').length!==1){showError('El enlace del escenario está incompleto.');return;}
    if(params.get('c')!=='d'){showError('El codec del escenario no es compatible.');return;}
    const id=params.get('r')!;
    if(!runtimePattern.test(id)){showError(unavailable);return;}
    if(id!==BUILD_INFO.replayRuntimeId){
      try{
        const response=await fetch('/replay/runtime-manifest.json',{cache:'no-store'});
        if(!response.ok)throw new Error('Manifest no disponible');
        const manifest=await response.json() as {schema?:number;runtimes?:Record<string,{path?:string}>};
        if(manifest.schema!==1||!Object.hasOwn(manifest.runtimes||{},id)||manifest.runtimes?.[id]?.path!==`/replay/${id}/`)throw new Error('Runtime desconocido');
        const target=new URL(`/replay/${id}/`,location.origin);
        target.search=url.search;target.hash=url.hash;
        location.replace(target.href);return;
      }catch{showError(unavailable);return;}
    }
  }
  if(!await loadAssets())return;
  await import(new URL('./main.js',import.meta.url).href);
}

void start().catch(()=>showError('No se pudo iniciar el simulador.'));
