import { M } from './model.js';
import type { External } from './types.js';
export function draw(seed:number, month:number, channel:number):number {
  let x = (seed ^ Math.imul(month+1,0x9e3779b1) ^ Math.imul(channel+1,0x85ebca6b)) >>> 0;
  x=Math.imul(x^(x>>>16),0x7feb352d); x=Math.imul(x^(x>>>15),0x846ca68b);
  return ((x^(x>>>16))>>>0)/4294967296;
}
export function externalAt(seed:number, month:number):External {
  const hit=draw(seed,month,0)<M.eventMonthlyChance;
  const type=Math.floor(draw(seed,month,1)*3);
  const sign=draw(seed,month,2)<0.5?-1:1;
  const magnitude=(0.5+draw(seed,month,3))*sign;
  return {
    energy:hit&&type===0?magnitude*.12:0,
    demand:hit&&type===1?magnitude*.04:0,
    supply:hit&&type===2?magnitude*.004:0,
    id:`ext-${seed}-${month}`
  };
}
