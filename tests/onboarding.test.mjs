import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,settle} from '../game/legacy.js';
const time=Date.parse('2026-11-16T10:00Z');
const fresh=()=>createHero('Guide','alliance','mage',time,123);
test('tutorial follows successful mission and subsequent improvement',()=>{
 let h=settle(fresh(),'get',null,time,123).hero;assert.equal(h.tutorial.started,false);
 h=settle(h,'train','luck',time,123,'early-training').hero;assert.equal(h.tutorial.improved,false);
 h=settle(h,'quest',h.offers[0].id,time,123,'start').hero;assert.equal(h.tutorial.started,true);
 h=settle(h,'claim',null,time+150000,123,'claim').hero;assert.equal(h.tutorial.claimed,true);
 h=settle(h,'train','luck',time+150000,123,'early-training').hero;assert.equal(h.tutorial.improved,false);
 h=settle(h,'train','luck',time+150000,123,'new-training').hero;assert.equal(h.tutorial.improved,true);
});
test('tutorial dismissal persists and stale retries cannot undo a restart',()=>{
 let h=fresh();h=settle(h,'tutorial_dismiss',null,time,123,'dismiss').hero;
 h=settle(JSON.parse(JSON.stringify(h)),'get',null,time+1000,123).hero;assert.equal(h.tutorial.dismissed,true);
 const gold=h.gold,energy=h.energy;h=settle(h,'tutorial_restart',null,time+2000,123,'restart').hero;
 h=settle(h,'tutorial_dismiss',null,time+3000,123,'dismiss').hero;
 assert.equal(h.tutorial.dismissed,false);assert.equal(h.gold,gold);assert.equal(h.energy,energy);
 assert.throws(()=>settle(h,'tutorial_restart','bad',time,123));
});
test('failed mission request does not advance tutorial',()=>{
 const h=fresh();assert.throws(()=>settle(h,'quest','bad-id',time,123));assert.equal(h.tutorial,undefined);
});

