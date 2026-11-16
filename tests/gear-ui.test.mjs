import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,settle,fighter} from '../engine.js';
import {compareItem,gearShop,inventory,gearCharacter} from '../ui/gear-screen.js';
const n=Date.parse('2026-11-16T10:00Z');
const hero=()=>createHero('UI Hero','horde','warrior',n,78913);
test('equipment preview matches an actual equip without mutating the character',()=>{
 let h=hero();h=settle(h,'buy',h.shop.offers[0].id,n,123).hero;
 const item=h.bag.find(i=>i.slot==='weapon'),before=fighter(h),saved=structuredClone(h),delta=compareItem(h,item);
 const equipped=settle(h,'equip',item.id,n,123).hero,after=fighter(equipped);
 assert.equal(delta.hp,after.hp-before.hp);assert.equal(delta.damage,(after.min+after.max-before.min-before.max)/2);assert.deepEqual(h,saved);
});
test('shop shows six separate offers with level, rarity and authoritative prices',()=>{
 const h=hero(),html=gearShop(h);assert.equal((html.match(/data-action="buy"/g)||[]).length,6);
 for(const offer of h.shop.offers){assert.ok(html.includes(offer.id));assert.ok(html.includes(offer.item.price+' oro'));}
});
test('favorites filter and displayed names are safe and preserve owned item distinctions',()=>{
 let h=hero();h=settle(h,'buy',h.shop.offers[0].id,n,123).hero;
 const weapon=h.bag.find(i=>i.slot==='weapon');weapon.name='<script>bad()</script>';
 const html=inventory(h);assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));assert.equal(html.includes('<script>bad()'),false);
 const favorites=inventory(h,{bagFilter:'favorites'});assert.equal(favorites.includes('bad()'),false);assert.ok(favorites.includes('Broquel de iniciación'));
 assert.ok(gearCharacter(h).includes('Base 10 y equipo'));
});
