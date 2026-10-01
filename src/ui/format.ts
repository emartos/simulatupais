export const esc=(v:unknown):string=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const num=(n:number,d=1):string=>n.toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
export const signed=(n:number,d=1):string=>`${n>0?'+':''}${num(n,d)}`;
export function dateLabel(baseYear:number,month:number,short=false):string {
  if(month===0) return `Cierre ${baseYear}`;
  const date=new Date(Date.UTC(baseYear+1,month-1,1));
  return new Intl.DateTimeFormat('es-ES',{month:short?'short':'long',year:'numeric',timeZone:'UTC'}).format(date);
}
export function download(name:string,text:string,type='application/json'):void {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
export function icon(name:string,size=18):string {
  const paths:Record<string,string>={
    play:'<path d="m8 5 11 7-11 7z"/>', pause:'<path d="M8 5v14M16 5v14"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>', fork:'<path d="M6 3v12a5 5 0 0 0 5 5h7M6 8h5a5 5 0 0 0 5-5M14 16l4 4-4 4"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>', upload:'<path d="M12 16V4m-5 5 5-5 5 5M5 17v4h14v-4"/>',
    reset:'<path d="M4 11a8 8 0 1 1 2 6M4 4v7h7"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>', globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18"/>',
    chart:'<path d="M4 4v16h17M7 15l4-5 4 3 5-8"/>', book:'<path d="M12 5v16M3 4h5l4 2 4-2h5v15h-5l-4 2-4-2H3z"/>',
    sliders:'<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>', local:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    check:'<path d="m5 12 4 4 10-10"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>', seed:'<path d="M12 21V10M12 14C3 14 3 4 3 4s9 0 9 10M12 10c0-8 9-8 9-8s0 8-9 8"/>'
  };
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.info}</svg>`;
}
