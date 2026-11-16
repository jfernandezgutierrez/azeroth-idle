import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,settle,fighter,upgradeHero,GEAR} from '../engine.js';
import {generateItem,generateShop,refreshCost} from '../game/gear.js';
import {createHero as legacyCreate} from '../game/legacy.js';
import {fighter as legacyFighter} from '../game/combat.js';
import {nextSeed} from '../game/rules.js';
const now=Date.parse('2026-11-16T10:00Z'),seed=78913;
const hero=(job='warrior')=>createHero('Gear','horde',job,now,seed);
function buy(h,index=0,id='buy'){return settle(h,'buy',h.shop.offers[index].id,now,123,id).hero;}
test('migration preserves legacy attributes, gold, items and pending snapshot for every class',()=>{
 for(const job of ['warrior','ranger','mage']){
  const old=legacyCreate('Old','alliance',job,now,seed);old.inventory=[0,1,2,3];old.equipped={weapon:2,armor:1,helm:3};old.gold=409;
  const before=legacyFighter(old);old.active={player:before,quest:old.offers[0],ends:now+50000,battle_seed:123};
  const h=upgradeHero(old,now,seed);assert.equal(h.gold,409);assert.equal(h.bag.filter(i=>i.id.startsWith('legacy:')).length,4);assert.deepEqual(fighter(h),before);assert.deepEqual(h.active,old.active);assert.deepEqual(upgradeHero(h,now,999),h);
 }
});
test('generated items stay within their budgets and scale with level and rarity',()=>{
 let state=seed;const found=new Set();
 for(let i=0;i<300;i++){state=nextSeed(state);const item=generateItem('mage',10,'armor',state,'sample:'+i);found.add(item.rarity);assert.equal(Object.values(item.stats).reduce((s,v)=>s+v,0)+item.armor,item.budget);assert.ok(item.sellValue<item.price);assert.ok(item.stats.intellect>=0);}
 assert.equal(found.size,4);assert.ok(generateItem('mage',100,'weapon',123,'a').budget>generateItem('mage',1,'weapon',123,'b').budget);
 assert.throws(()=>generateItem('mage',1,'offhand',123,'bad'));
});
test('shop persists across reads and training; refresh and next day produce new IDs',()=>{
 const h=hero(),first=h.shop;assert.equal(first.offers.length,6);assert.equal(new Set(first.offers.map(o=>o.item.slot)).size,6);
 assert.deepEqual(settle(h,'get',null,now+60000,999).hero.shop,first);
 assert.deepEqual(settle(h,'train','luck',now,999).hero.shop,first);
 const refreshed=settle(h,'shop_refresh',null,now,456,'refresh').hero;assert.equal(refreshed.gold,h.gold-refreshCost(h));assert.equal(refreshed.shop.revision,1);assert.notDeepEqual(refreshed.shop.offers,first.offers);
 const next=settle(h,'get',null,now+86400000,999).hero;assert.equal(next.shop.revision,0);assert.notEqual(next.shop.day,first.day);
 assert.deepEqual(h.shop,first);
});
test('individual purchases and retries create one owned instance only',()=>{
 const h=hero(),offer=h.shop.offers[0],r=settle(h,'buy',offer.id,now,123,'purchase');
 const retry=settle(r.hero,'buy',offer.id,now,456,'purchase');assert.equal(retry.hero.gold,h.gold-offer.item.price);assert.equal(retry.hero.bag.filter(i=>i.id===offer.item.id).length,1);
 assert.throws(()=>settle(retry.hero,'buy',offer.id,now,123,'other-purchase'));
 assert.throws(()=>settle(h,'buy','forged-offer',now,123));assert.throws(()=>settle(h,'buy',0,now,123));
});
test('equip validates ownership, level, class and applies actual attributes',()=>{
 let h=buy(hero());const item=h.bag.find(i=>i.slot==='weapon'),before=fighter(h);h=settle(h,'equip',item.id,now,123).hero;
 assert.ok(fighter(h).max>before.max);assert.equal(h.strength,10);assert.equal(h.loadout.weapon,item.id);
 assert.throws(()=>settle(h,'equip','other-account-item',now,123));
 const invalid=structuredClone(h);invalid.bag.push({...item,id:'future',level:999});assert.throws(()=>settle(invalid,'equip','future',now,123));
 invalid.bag.push({...item,id:'mage-only',job:'mage'});assert.throws(()=>settle(invalid,'equip','mage-only',now,123));
});
test('shield blocking needs an equipped shield and can be restored',()=>{
 let h=hero();assert.equal(fighter(h).block,.25);h=settle(h,'unequip','starter:shield',now,123).hero;assert.equal(fighter(h).block,0);
 h=settle(h,'equip','starter:shield',now,123).hero;assert.equal(fighter(h).block,.25);
});
test('favorites and equipped items cannot be sold; sale returns server price once',()=>{
 let h=buy(hero()),item=h.bag.find(i=>i.slot==='weapon');h=settle(h,'equip',item.id,now,123).hero;assert.throws(()=>settle(h,'sell',item.id,now,123));
 h=settle(h,'unequip',item.id,now,123).hero;h=settle(h,'favorite',item.id,now,123).hero;assert.throws(()=>settle(h,'sell',item.id,now,123));
 h=settle(h,'favorite',item.id,now,123).hero;const before=h.gold;
 h=settle(h,'sell',item.id,now,123,'sale').hero;assert.equal(h.gold,before+item.sellValue);assert.equal(h.bag.some(i=>i.id===item.id),false);
 assert.equal(settle(h,'sell',item.id,now,123,'sale').hero.gold,h.gold);assert.throws(()=>settle(h,'sell',item.id,now,123,'second-sale'));
});
test('full bag rejects purchases without spending; mailbox collection checks capacity',()=>{
 const h=hero();while(h.bag.length<GEAR.bagCapacity)h.bag.push(generateItem(h.job,1,'ring',123,'fill:'+h.bag.length));
 const gold=h.gold;assert.throws(()=>settle(h,'buy',h.shop.offers[0].id,now,123));assert.equal(h.gold,gold);
 h.mailbox.push(generateItem(h.job,1,'ring',123,'mail-item'));assert.throws(()=>settle(h,'collect','mail-item',now,123));
 h.bag.pop();const r=settle(h,'collect','mail-item',now,123).hero;assert.equal(r.mailbox.length,0);assert.equal(r.bag.length,GEAR.bagCapacity);
});
test('mission captures gear, awards procedural loot and sends overflow to mailbox',()=>{
 let h=hero('mage');h.intellect=1000;h.stamina=1000;h.offers[0].lootChance=1;
 while(h.bag.length<GEAR.bagCapacity)h.bag.push(generateItem(h.job,1,'ring',123,'fill:'+h.bag.length));
 h=settle(h,'quest',h.offers[0].id,now,123).hero;const snapshot=h.active.player;
 h.intellect=1;const result=settle(h,'claim',null,now+150000,456,'claim');
 assert.deepEqual(result.battle.attacker,snapshot);assert.equal(result.hero.bag.length,GEAR.bagCapacity);assert.equal(result.hero.mailbox.length,1);assert.equal(result.hero.mailbox[0].level,snapshot.level);assert.ok(result.message.includes('bandeja'));
 const retry=settle(result.hero,'claim',null,now+150001,789,'claim');assert.equal(retry.hero.mailbox.length,1);
});
test('full mailbox prevents new missions and never discards loot',()=>{
 const h=hero();while(h.bag.length<GEAR.bagCapacity)h.bag.push(generateItem(h.job,1,'ring',123,'bag:'+h.bag.length));
 while(h.mailbox.length<GEAR.mailCapacity)h.mailbox.push(generateItem(h.job,1,'ring',123,'mail:'+h.mailbox.length));
 assert.throws(()=>settle(h,'quest',h.offers[0].id,now,123));assert.equal(h.energy,100);
});
test('identical templates remain distinct and store level stays captured until renewal',()=>{
 const h=hero();h.level=10;const shop=generateShop(h,now,123);h.shop=shop;h.gold=10000;
 let r=buy(h);const first=r.bag.find(i=>i.slot==='weapon');r=settle(r,'shop_refresh',null,now,456).hero;r=buy(r,0,'second');
 const weapons=r.bag.filter(i=>i.slot==='weapon');assert.equal(weapons.length,2);assert.notEqual(weapons[0].id,weapons[1].id);
 assert.equal(first.level,10);r.level=11;assert.equal(settle(r,'get',null,now,123).hero.shop.level,10);
});
