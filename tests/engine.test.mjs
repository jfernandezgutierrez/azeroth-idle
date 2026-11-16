import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,settle,power} from '../engine.js';
const hero=()=>createHero('Thraka','horde','warrior');
test('misiones: no permite reclamar antes de tiempo ni cobrar dos veces',()=>{let h=hero();const t=h.updated_at;h=settle(h,'quest',0,t).hero;assert.equal(h.energy,90);assert.throws(()=>settle(h,'claim',null,t+1000));h=settle(h,'claim',null,t+20001,()=>1).hero;assert.equal(h.gold,195);assert.equal(h.xp,35);assert.throws(()=>settle(h,'claim',null,t+21000));});
test('equipo: compra, propiedad y sustitución de arma',()=>{let h=hero();assert.throws(()=>settle(h,'equip',0));h=settle(h,'buy',0).hero;h=settle(h,'equip',0).hero;assert.equal(h.gold,50);assert.equal(power(h),22);assert.throws(()=>settle(h,'buy',0));assert.throws(()=>settle(h,'buy',2));});
test('subida de nivel conserva experiencia sobrante',()=>{const h=hero();h.xp=90;const r=settle(h,'arena',null,h.updated_at,()=>1).hero;assert.equal(r.level,2);assert.equal(r.xp,50);assert.equal(r.strength,12);});
test('energía conserva minutos parciales y tiene límite',()=>{let h=hero();h.energy=10;const t=h.updated_at;h=settle(h,'refresh',null,t+30000).hero;assert.equal(h.energy,10);h=settle(h,'refresh',null,t+60000).hero;assert.equal(h.energy,11);h=settle(h,'refresh',null,t+60000000).hero;assert.equal(h.energy,100);});
test('validación y aislamiento: acción no modifica el estado original',()=>{const h=hero();assert.throws(()=>createHero('x','other','warrior'));assert.throws(()=>settle(h,'train','gold'));const r=settle(h,'train','strength');assert.equal(h.strength,10);assert.equal(r.hero.strength,11);});
