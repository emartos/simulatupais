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

async function start():Promise<void> {
  const url=new URL(location.href),params=url.searchParams;
  if(params.has('r')||params.get('v')==='2'){
    if(params.getAll('v').length!==1||params.get('v')!=='2'||params.getAll('r').length!==1||params.getAll('s').length!==1){showError('El enlace del escenario está incompleto.');return;}
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
  await import(new URL('./main.js',import.meta.url).href);
}

void start().catch(()=>showError('No se pudo iniciar el simulador.'));
