import test from 'node:test';
import assert from 'node:assert/strict';
import { percentagePointDelta, num } from '../dist/app/ui/format.js';

// Oráculo aritmético independiente: these Point fixtures are already in percent units.
const oracle=(currentPercentage,initialPercentage)=>currentPercentage-initialPercentage;
test('la diferencia de desempleo en puntos porcentuales usa valores Point ya expresados en porcentaje',()=>{
  const cases=[
    {initial:10.5,current:10.431,expected:-0.069},
    {initial:10.5,current:10.569,expected:0.069},
    {initial:10.5,current:10.5,expected:0}
  ];
  for(const c of cases){
    const expected=oracle(c.current,c.initial);
    assert.ok(Math.abs(expected-c.expected)<1e-12);
    assert.equal(percentagePointDelta(c.current,c.initial),expected);
    assert.equal(num(expected,1),num(c.expected,1));
  }
  assert.equal(num(cases[0].expected,1),'-0,1');
  assert.equal(num(cases[1].expected,1),'0,1');
  assert.equal(num(cases[2].expected,1),'0,0');
});
