import {items,jobs,attributes,dayKey,randomSource,freshSeed} from './rules.js';
import {fighter as classicFighter} from './combat.js';
import {upgradeHero as classicUpgrade} from './engine.js';
import {GEAR,slots,rarities,gearTemplates,gearSuffixes} from './gear-rules.js';
export {GEAR,slots,rarities};
export function generateItem(job,level,slot,seed,id,forceCommon=false){
 if(!jobs[job]||!Object.hasOwn(slots,slot)||!Number.isInteger(level)||level<1||level>GEAR.maxLevel||typeof id!=='string'||!id)throw Error('Parámetros de objeto inválidos.');
 const random=randomSource(seed),roll=random(),rarity=forceCommon?rarities[0]:rarities.find(r=>roll<r.threshold);
 const templates=gearTemplates.filter(t=>t.slot===slot&&(t.job==='any'||t.job===job));if(!templates.length)throw Error('Esta clase no puede usar ese objeto.');
 const t=templates[Math.floor(random()*templates.length)],suffix=gearSuffixes[Math.floor(random()*gearSuffixes.length)];
 const budget=Math.max(2,Math.round((4+level*2)*rarity.multiplier));
 const armor=Math.round(budget*(slot==='armor'?.4:['helm','gloves','boots','belt','offhand'].includes(slot)?.2:0));
 const pool=budget-armor,main=Math.floor(pool*(slot==='weapon'?.65:.4)),stamina=Math.floor(pool*(slot==='weapon'?.25:.5));
 const stats={[jobs[job].primary]:main,stamina,luck:pool-main-stamina};
 const price=Math.round((30+level*15)*rarity.cost*(slot==='weapon'?1.2:1));
 return{id,version:GEAR.version,template:t.id,name:t.name+' '+suffix,slot,job:t.job,level,rarity:rarity.id,icon:t.icon,budget,stats,armor,legacy_defense:0,price,sellValue:Math.floor(price/4),favorite:false};
}
export function generateShop(h,now,seed,revision=0){
 const random=randomSource(seed),pool=Object.keys(slots).filter(s=>!['weapon','armor','helm'].includes(s)&&(s!=='offhand'||h.job==='warrior'));
 const selected=['weapon','armor','helm'];while(selected.length<GEAR.shopSize){const i=Math.floor(random()*pool.length);selected.push(pool.splice(i,1)[0]);}
 const day=dayKey(now),offers=selected.map((slot,index)=>{
  const itemSeed=Math.floor(random()*2147483646)+1,id=`shop:${day}:${revision}:${seed}:${index}`;
  return{id,sold:false,item:generateItem(h.job,h.level,slot,itemSeed,id,index===0)};
 });
 return{day,revision,seed,level:h.level,offers};
}
export function upgradeGear(input,now=Date.now(),seed=freshSeed()){
 const h=classicUpgrade(input,now,seed);
 if(h.gear_schema!==undefined&&h.gear_schema!==1)throw Error('Versión de equipo desconocida.');
 if(!h.gear_schema){
  const seen=new Set();h.bag=[];h.loadout={};h.mailbox=[];h.loot_serial=0;
  for(const id of h.inventory){
   const old=items.find(i=>i.id===id);if(!old||seen.has(id))throw Error('El inventario antiguo necesita revisión.');seen.add(id);
   h.bag.push({id:`legacy:${id}`,version:GEAR.version,template:`legacy-${id}`,name:old.name,slot:old.slot,job:'any',level:1,rarity:'common',icon:[0,4,2,3][id],budget:old.power,stats:old.slot==='weapon'?{[jobs[h.job].primary]:old.power}:old.slot==='helm'?{stamina:old.power}:{},armor:0,legacy_defense:old.slot==='armor'?old.power:0,price:old.cost,sellValue:Math.floor(old.cost/4),favorite:false});
  }
  for(const[slot,id]of Object.entries(h.equipped)){if(!seen.has(id))throw Error('El equipo antiguo necesita revisión.');h.loadout[slot]=`legacy:${id}`;}
  if(h.job==='warrior'){
   h.bag.push({id:'starter:shield',version:GEAR.version,template:'starter-shield',name:'Broquel de iniciación',slot:'offhand',job:'warrior',level:1,rarity:'common',icon:11,budget:0,stats:{},armor:0,legacy_defense:0,price:0,sellValue:0,favorite:true});
   h.loadout.offhand='starter:shield';
  }
  h.gear_schema=1;h.equipment_version=GEAR.version;h.shop=generateShop(h,now,seed);
 }
 if(dayKey(now)>h.shop.day)h.shop=generateShop(h,now,seed);
 return h;
}
export function equippedItems(h){
 return Object.entries(h.loadout).map(([slot,id])=>{const i=h.bag.find(i=>i.id===id);if(!i||i.slot!==slot||(i.job!=='any'&&i.job!==h.job)||i.level>h.level)throw Error('El equipo no es válido.');return i;});
}
export function fighterGear(h){
 if(!h.gear_schema)return classicFighter(h);
 const adjusted={...h,equipped:{}};let armor=0,legacy=0;
 for(const item of equippedItems(h)){for(const[key,value]of Object.entries(item.stats))if(Object.hasOwn(attributes,key))adjusted[key]+=value;armor+=item.armor;legacy+=item.legacy_defense;}
 const f=classicFighter(adjusted),j=jobs[h.job];f.armor=Math.min(j.armorCap,j.armor+legacy*.015+armor/(20+h.level*20));
 f.block=h.job==='warrior'&&h.loadout.offhand?j.block:0;return f;
}
export function refreshCost(h){return 25+h.level*10+h.shop.revision*15;}
export function receiveItem(h,item){
 if(h.bag.some(i=>i.id===item.id)||h.mailbox.some(i=>i.id===item.id))throw Error('El objeto ya está registrado.');
 if(h.bag.length<GEAR.bagCapacity){h.bag.push(item);return'mochila';}
 if(h.mailbox.length>=GEAR.mailCapacity)throw Error('La bandeja está llena. Vende o recoge objetos antes de cobrar.');
 h.mailbox.push(item);return'bandeja';
}
