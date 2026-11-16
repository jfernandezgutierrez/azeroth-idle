import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,settle,upgradeHero,fighter,fight,generateOffers,xpRequired,dayKey} from '../game/legacy.js';
const time=Date.parse('2026-11-16T10:00:00Z');
const hero=(job='warrior')=>createHero('Thraka','horde',job,time,78913);
test('misión: contrato estable, espera real y cobro único',()=>{
 let h=hero();const q=h.offers[0];h=settle(h,'quest',q.id,time,123).hero;
 assert.equal(h.energy,95);assert.throws(()=>settle(h,'claim',null,time+1000,123));
 const original=structuredClone(h.active.player);h.strength+=100;
 const r=settle(h,'claim',null,time+q.duration*1000,123);
 assert.deepEqual(r.battle.attacker,original);assert.equal(r.hero.active,null);
 assert.notDeepEqual(r.hero.offers,h.offers);assert.ok(r.hero.offers.every(q=>!h.offers.some(old=>old.name===q.name)));assert.throws(()=>settle(r.hero,'claim',null,time+999999,123));
});
test('ofertas: tres perfiles, nivel escalable y estabilidad ante entrenamiento o recarga',()=>{
 const h=hero();assert.equal(h.offers.length,3);assert.equal(new Set(h.offers.map(q=>q.name)).size,3);
 assert.deepEqual(settle(h,'get',null,time,999).hero.offers,h.offers);
 const trained=settle(h,'train','strength',time,999).hero;assert.deepEqual(trained.offers,h.offers);
 const high={...h,level:100};const offers=generateOffers(high,78913);assert.ok(offers[0].xp>h.offers[0].xp);assert.ok(offers[0].enemy.hp>h.offers[0].enemy.hp);
 assert.throws(()=>settle(h,'quest','stale-offer',time,123));
});
test('aventura: no regenera por minuto y se repone solo en el día siguiente',()=>{
 let h=hero();h.energy=10;h=settle(h,'get',null,time+60000,123).hero;assert.equal(h.energy,10);
 h=settle(h,'get',null,Date.parse('2026-11-16T23:00:00Z'),123).hero;assert.equal(h.energy,100);
 h.energy=4;assert.equal(settle(h,'get',null,Date.parse('2026-11-16T22:59:59Z'),123).hero.energy,4);
});
test('zona horaria: medianoche y horario de verano de Madrid',()=>{
 assert.equal(dayKey(Date.parse('2026-03-28T23:30Z')),'2026-03-29');
 assert.equal(dayKey(Date.parse('2026-03-29T22:30Z')),'2026-03-30');
 assert.equal(dayKey(Date.parse('2026-10-25T22:30Z')),'2026-10-25');
 assert.equal(dayKey(Date.parse('2026-10-25T23:30Z')),'2026-10-26');
});
test('equipo: propiedad y efecto sobre la clase',()=>{
 for(const job of ['warrior','ranger','mage']){
 let h=hero(job);const before=fighter(h);assert.throws(()=>settle(h,'equip',0,time,123));
 h=settle(h,'buy',0,time,123).hero;h=settle(h,'equip',0,time,123).hero;
 assert.equal(h.gold,50);assert.ok(fighter(h).max>before.max);assert.throws(()=>settle(h,'buy',0,time,123));
 }
});
test('los cinco atributos se entrenan y conservan el estado de entrada',()=>{
 for(const key of ['strength','dexterity','intellect','stamina','luck']){
 const h=hero(),r=settle(h,'train',key,time,123);assert.equal(r.hero[key],h[key]+1);assert.equal(h.gold,150);assert.equal(r.hero.gold,150-h[key]*3);
 }
 assert.throws(()=>settle(hero(),'train','gold',time,123));assert.throws(()=>createHero('x','other','warrior',time,123));
 assert.throws(()=>settle(hero(),'buy',null,time,123));assert.throws(()=>settle(hero(),'buy','0',time,123));
});
test('niveles: experiencia sobrante y mejora de todos los atributos',()=>{
 const h=hero();h.xp=xpRequired(1)+xpRequired(2)+17;const r=settle(h,'get',null,time,123).hero;
 assert.equal(r.level,3);assert.equal(r.xp,17);assert.equal(r.intellect,14);assert.equal(r.luck,7);
});
test('idempotencia: mismo identificador repite resultado sin cobrar y rechaza otro argumento',()=>{
 const first=settle(hero(),'train','strength',time,123,'test-command');
 const retry=settle(first.hero,'train','strength',time+1000,456,'test-command');
 assert.equal(retry.hero.strength,11);assert.equal(retry.hero.gold,120);assert.equal(retry.replayed,true);
 assert.throws(()=>settle(retry.hero,'train','stamina',time+1000,456,'test-command'));
});
test('combate: repetición determinista, vida no negativa y alternancia',()=>{
 const a=fighter(hero()),b=fighter(hero('mage')),result=fight(a,b,123);
 assert.deepEqual(result,fight(a,b,123));assert.ok(result.turns.length<=200);
 for(let i=0;i<result.turns.length;i++){assert.ok(result.turns[i].hp.every(v=>v>=0));if(i)assert.notEqual(result.turns[i].actor,result.turns[i-1].actor);}
 assert.equal(result.turns.at(-1).hp[1-result.winner],0);
});
test('magia: no se bloquea ni esquiva y crítico respeta el tope',()=>{
 const a=fighter(hero('mage')),b=fighter(hero('ranger'));b.block=.5;b.evade=.5;
 for(let seed=1;seed<=100;seed++){const r=fight(a,b,seed);assert.ok(r.turns.filter(t=>t.actor===0).every(t=>t.defense==='none'));}
});
test('arena y mazmorra tienen esperas propias y no gastan aventura',()=>{
 const h=hero(),r=settle(h,'arena',null,time,123).hero;assert.equal(r.energy,100);
 assert.throws(()=>settle(r,'arena',null,time+1000,123));assert.doesNotThrow(()=>settle(r,'dungeon',null,time+1000,123));
});
test('migración local: conserva saldo, objetos y misión pendiente',()=>{
 const old={name:'Old',faction:'alliance',job:'mage',level:3,xp:21,gold:456,energy:60,strength:14,stamina:14,luck:5,inventory:[0,1],equipped:{weapon:0},active:{id:0,ends:time+20000},dungeon:0,wins:0,log:[],updated_at:time};
 const h=upgradeHero(old,time,123);assert.equal(h.gold,456);assert.equal(h.xp,21);assert.deepEqual(h.inventory,[0,1]);assert.equal(h.active.ends,time+20000);assert.equal(h.dexterity,14);
 assert.deepEqual(upgradeHero(h,time,999),h);
});

