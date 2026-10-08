import { unzlibSync, zlibSync } from 'fflate';

const MAX_JSON_BYTES=131_072;
const BASE64URL=/^[A-Za-z0-9_-]+$/;

function toBase64Url(bytes:Uint8Array):string {
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function fromBase64Url(payload:string):Uint8Array {
  if(!payload||!BASE64URL.test(payload)||payload.length%4===1)throw new Error('El payload del escenario no es válido.');
  try{
    const binary=atob(payload.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(payload.length/4)*4,'='));
    return Uint8Array.from(binary,char=>char.charCodeAt(0));
  }catch{throw new Error('El payload del escenario no es válido.');}
}
function parseJson(bytes:Uint8Array):unknown {
  if(bytes.length>MAX_JSON_BYTES)throw new Error('El escenario descomprimido es demasiado grande.');
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
  catch{throw new Error('El escenario contiene JSON no válido.');}
}
function verifyAdler32(compressed:Uint8Array,plain:Uint8Array):void {
  if(compressed.length<6)throw new Error('El DEFLATE del escenario no es válido.');
  let a=1,b=0;
  for(const byte of plain){a=(a+byte)%65521;b=(b+a)%65521;}
  const actual=((b<<16)|a)>>>0,index=compressed.length-4;
  const expected=((compressed[index]!<<24)|(compressed[index+1]!<<16)|(compressed[index+2]!<<8)|compressed[index+3]!)>>>0;
  if(actual!==expected)throw new Error('El DEFLATE del escenario no es válido.');
}

export function encodeScenarioPayload(value:unknown):string {
  const bytes=new TextEncoder().encode(JSON.stringify(value));
  if(bytes.length>MAX_JSON_BYTES)throw new Error('Este escenario contiene demasiados cambios para compartirlo mediante un enlace.');
  return toBase64Url(zlibSync(bytes,{level:6}));
}
export function decodeScenarioPayload(payload:string):unknown {
  const compressed=fromBase64Url(payload);
  let plain:Uint8Array;
  try{plain=unzlibSync(compressed,{out:new Uint8Array(MAX_JSON_BYTES+1)});}
  catch{throw new Error('El DEFLATE del escenario no es válido.');}
  if(plain.length>MAX_JSON_BYTES)throw new Error('El escenario descomprimido es demasiado grande.');
  verifyAdler32(compressed,plain);
  return parseJson(plain);
}
export function decodeLegacyScenarioPayload(payload:string):unknown {
  return parseJson(fromBase64Url(payload));
}
