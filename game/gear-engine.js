import {createHero as classicCreate,settle as classicSettle,challengeEnemy} from './engine.js';
import {RULES,items,freshSeed,nextSeed,randomSource} from './rules.js';
import {fight} from './combat.js';
import {tutorialState} from './onboarding.js';
import {GEAR,slots,generateItem,upgradeGear,fighterGear,refreshCost,generateShop,receiveItem} from './gear.js';
export{upgradeGear as upgradeHero,fighterGear as fighter};
export function createHero(name,faction,job,now=Date.now(),seed=freshSeed()){return upgradeGear(classicCreate(name,faction,job,now,seed),now,seed);}
export function power(h){const f=fighterGear(h);return Math.round((f.min+f.max)/2+f.hp/10);}
export function settle(input,action,arg=null,now=Date.now(),seed=freshSeed(),requestId=null){
 let h=upgradeGear(input,now,seed),message='',battle=null;
 const prior=requestId&&h.receipts.find(r=>r.id===requestId);
 if(prior){if(prior.action!==action||JSON.stringify(prior.arg)!==JSON.stringify(arg))throw Error('Identificador de acción reutilizado con otros datos.');return{hero:h,message:prior.message,battle:prior.battle,replayed:true,server_time:now,rules_version:RULES.version,equipment_version:GEAR.version};}
 if(['quest','claim','train','get','refresh'].includes(action)){
  const active=structuredClone(h.active);
  if(action==='quest'&&h.bag.length>=GEAR.bagCapacity&&h.mailbox.length>=GEAR.mailCapacity)throw Error('Haz sitio en tu mochila o bandeja antes de partir.');
  if(action==='claim'&&h.active)h.active.quest.lootChance=0;
  const result=classicSettle(h,action,arg,now,seed);h=result.hero;message=result.message;battle=result.battle;
  if(action==='quest'){h.active.player=fighterGear(h);h.active.gear_version=GEAR.version;}
  if(action==='claim'&&battle.winner===0&&randomSource(nextSeed(active.battle_seed))()<active.quest.lootChance){
   const roll=randomSource(nextSeed(nextSeed(active.battle_seed))),available=Object.keys(slots).filter(s=>s!=='offhand'||h.job==='warrior');
   const slot=available[Math.floor(roll()*available.length)];h.loot_serial++;
   const item=generateItem(h.job,active.player.level,slot,Math.floor(roll()*2147483646)+1,`loot:${h.loot_serial}:${active.battle_seed}`);
   const destination=receiveItem(h,item);message+=` · Botín: ${item.name}${destination==='bandeja'?' (en bandeja)':''}`;
   h.log[0]=message;
  }
 }else{
  const initial=classicSettle(h,'get',null,now,seed);h=initial.hero;const oldLog=[...h.log];
  if(action==='buy'){
   const offer=h.shop.offers.find(o=>o.id===arg);if(!offer||offer.sold)throw Error('La oferta ya no está disponible.');
   if(h.bag.length>=GEAR.bagCapacity)throw Error('Tu mochila está llena.');if(h.gold<offer.item.price)throw Error('No tienes suficiente oro.');
   if(h.bag.some(i=>i.id===offer.item.id))throw Error('Ese objeto ya está en tu mochila.');
   h.gold-=offer.item.price;h.bag.push(structuredClone(offer.item));offer.sold=true;message='Has comprado '+offer.item.name+'.';
  }else if(['equip','unequip','sell','favorite','collect'].includes(action)){
   if(typeof arg!=='string')throw Error('Identificador de objeto inválido.');
   const list=action==='collect'?h.mailbox:h.bag,item=list.find(i=>i.id===arg);if(!item)throw Error('No tienes ese objeto.');
   const equipped=Object.values(h.loadout).includes(item.id);
   if(action==='equip'){
    if(item.level>h.level||(item.job!=='any'&&item.job!==h.job))throw Error('No puedes equipar ese objeto.');
    h.loadout[item.slot]=item.id;message='Equipo actualizado.';
   }else if(action==='unequip'){
    if(!equipped)throw Error('Ese objeto no está equipado.');delete h.loadout[item.slot];message='Objeto retirado del equipo.';
   }else if(action==='favorite'){item.favorite=!item.favorite;message=item.favorite?'Objeto protegido como favorito.':'Protección de favorito desactivada.';}
   else if(action==='sell'){
    if(equipped||item.favorite||item.sellValue<=0)throw Error('Retira y desbloquea el objeto antes de venderlo.');
    h.gold+=item.sellValue;h.bag=h.bag.filter(i=>i.id!==item.id);message=`Has vendido ${item.name} por ${item.sellValue} oro.`;
   }else{
    if(h.bag.length>=GEAR.bagCapacity)throw Error('Tu mochila está llena.');h.mailbox=h.mailbox.filter(i=>i.id!==item.id);h.bag.push(item);message='Objeto recogido en tu mochila.';
   }
  }else if(action==='shop_refresh'){
   if(arg!==null)throw Error('Esta acción no admite parámetros.');if(h.shop.revision>=GEAR.maxRefreshes)throw Error('Has alcanzado el límite diario de renovaciones.');
   const cost=refreshCost(h);if(h.gold<cost)throw Error('No tienes suficiente oro.');h.gold-=cost;h.shop=generateShop(h,now,seed,h.shop.revision+1);message='La armería tiene nuevas existencias.';
  }else if(action==='arena'||action==='dungeon'){
   if(now<(h.cooldowns[action]||0))throw Error('Debes esperar antes del siguiente combate.');
   battle=fight(fighterGear(h),challengeEnemy(h,action),seed);h.cooldowns[action]=now+(action==='arena'?RULES.arenaCooldown:RULES.dungeonCooldown);
   const gold=action==='dungeon'?80+h.dungeon*20:25+h.level*5,xp=action==='dungeon'?60+h.dungeon*10:15+h.level*3;
   if(battle.winner===0){h.gold+=gold;h.xp+=xp;action==='dungeon'?h.dungeon++:h.wins++;message=`¡Victoria! +${gold} oro · +${xp} EXP`;}else message='Derrota. Revisa el registro y mejora tu equipo.';
   const leveled=classicSettle(h,'get',null,now,seed);h=leveled.hero;message+=leveled.message;h.last_battle=battle;
  }else if(action==='tutorial_dismiss'||action==='tutorial_restart'){
   if(arg!==null)throw Error('Esta acción no admite parámetros.');message=action==='tutorial_dismiss'?'Puedes volver a mostrar la guía desde Cómo jugar.':'Tu guía vuelve a estar disponible.';
  }else throw Error('Acción desconocida.');
  h.log=[message,...oldLog].slice(0,12);
 }
 h.tutorial=tutorialState(h,action);h.updated_at=now;
 if(requestId)h.receipts=[{id:requestId,action,arg,message,battle},...h.receipts].slice(0,32);
 return{hero:h,message,battle,server_time:now,rules_version:RULES.version,equipment_version:GEAR.version};
}
