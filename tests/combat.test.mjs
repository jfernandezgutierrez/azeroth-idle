import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,fighter,fight} from '../game/legacy.js';
import {nextSeed} from '../game/rules.js';
test('criticals saturate at fifty percent and defenses match configured frequencies',()=>{
 const h=createHero('Sample','horde','warrior',0,123);h.luck=100000;
 const a=fighter(h),b=fighter({...h,job:'ranger'});let seed=78913,attacks=0,critical=0,evaded=0;
 for(let i=0;i<1500;i++){seed=nextSeed(seed);for(const t of fight(a,b,seed).turns)if(t.actor===0){attacks++;critical+=Number(t.critical);evaded+=Number(t.defense==='evade');}}
 assert.ok(attacks>5000);assert.ok(Math.abs(critical/attacks-.5)<.035);assert.ok(Math.abs(evaded/attacks-.35)<.035);
});
test('level 1000 battles remain finite for every initial class',()=>{
 for(const job of ['warrior','ranger','mage']){
 const h=createHero('High','horde',job,0,123);h.level=1000;for(const s of ['strength','dexterity','intellect','stamina'])h[s]=2008;
 const f=fighter(h),r=fight(f,f,nextSeed(78913));assert.ok(r.turns.length<=200);assert.equal(r.timeout,false);assert.ok(r.turns.every(t=>t.hp.every(Number.isSafeInteger)&&Number.isSafeInteger(t.damage)));
 }
});
