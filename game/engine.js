import {RULES,attributes,classes,items,dayKey,xpRequired,freshSeed,nextSeed,randomSource} from './rules.js';
import {fighter,fight,enemyAt} from './combat.js';
import {generateOffers} from './adventure.js';
export {RULES,attributes,classes,items,dayKey,xpRequired,fighter,fight,generateOffers};
const legacyQuests=[{name:'Sombras en el camino',gold:45,xp:35},{name:'El precio del acero',gold:85,xp:65},{name:'Un susurro ancestral',gold:140,xp:100}];

export function createHero(name,faction,job,now=Date.now(),seed=freshSeed()){
  if(typeof name!=='string'||!name.trim()||name.trim().length>24||!['horde','alliance'].includes(faction)||!Object.hasOwn(classes,job))throw Error('Revisa los datos de tu héroe.');
  const h={schema:2,rules_version:RULES.version,name:name.trim(),faction,job,level:1,xp:0,gold:150,energy:100,strength:10,dexterity:10,intellect:10,stamina:10,luck:5,inventory:[],equipped:{},active:null,dungeon:0,wins:0,day:dayKey(now),updated_at:now,offer_seed:seed,offers:[],cooldowns:{arena:0,dungeon:0},log:[],last_battle:null,receipts:[]};
  h.offers=generateOffers(h,seed);return h;
}
export function upgradeHero(input,now=Date.now(),seed=freshSeed()){
  const h=structuredClone(input);if(h.schema===2)return h;
  h.schema=2;h.rules_version=RULES.version;h.dexterity=10+2*(h.level-1);h.intellect=10+2*(h.level-1);h.day=dayKey(now);h.offer_seed=seed;h.offers=generateOffers(h,seed);h.cooldowns={arena:0,dungeon:0};h.last_battle=null;h.receipts=[];
  if(h.active&&!h.active.quest){const q=legacyQuests[h.active.id]||legacyQuests[0];h.active={...h.active,version:RULES.version,legacy:true,player:fighter(h),battle_seed:nextSeed(seed),quest:{...q,enemy:enemyAt(Math.max(1,h.level-1),0,.6),enemyIcon:10,lootChance:0}};}
  return h;
}
export function power(h){const f=fighter(h);return Math.round((f.min+f.max)/2+f.hp/10);}
export function challengeEnemy(h,type){return enemyAt(type==='dungeon'?2+h.dungeon*2:Math.max(1,h.level),type==='dungeon'?h.dungeon%3:h.wins%3,.85,type==='dungeon'?'Guardián del umbral':'Retador de entrenamiento');}
export function settle(input,action,arg,now=Date.now(),seed=freshSeed(),requestId=null){
  const h=upgradeHero(input,now,seed);let message='',battle=null;
  if(h.rules_version!==RULES.version)throw Error('Esta partida usa otra versión. Actualiza el juego.');
  const previous=requestId&&h.receipts.find(r=>r.id===requestId);
  if(previous){if(previous.action!==action||JSON.stringify(previous.arg)!==JSON.stringify(arg))throw Error('Identificador de acción reutilizado con otros datos.');return{hero:h,message:previous.message,battle:previous.battle,replayed:true,server_time:now};}
  const today=dayKey(now);if(today>h.day){h.day=today;h.energy=RULES.adventure;}
  if(action==='quest'){
    if(h.active)throw Error('Ya tienes una misión en marcha.');const q=h.offers.find(q=>q.id===arg);if(!q)throw Error('La oferta ha cambiado. Actualiza la taberna.');
    if(h.energy<q.energy)throw Error('No tienes suficiente aventura. Se repone a medianoche del reino.');
    h.energy-=q.energy;h.active={id:q.id,version:RULES.version,ends:now+q.duration*1000,quest:structuredClone(q),player:fighter(h),battle_seed:seed};message='Has partido hacia '+q.zone+'.';
  }else if(action==='claim'){
    if(!h.active||now<h.active.ends)throw Error('La aventura aún no ha terminado.');const q=h.active.quest;
    battle=fight(h.active.player,q.enemy,h.active.battle_seed);const won=battle.winner===0,gold=won?q.gold:Math.floor(q.gold/4),xp=won?q.xp:10;h.gold+=gold;h.xp+=xp;
    message=won?`¡Victoria! +${gold} oro · +${xp} EXP`:`Derrota. +${gold} oro · +${xp} EXP`;
    if(won&&randomSource(nextSeed(h.active.battle_seed))()<q.lootChance){const available=items.filter(i=>!h.inventory.includes(i.id));if(available.length){const i=available[h.active.battle_seed%available.length];h.inventory.push(i.id);message+=' · Botín: '+i.name;}else{h.gold+=20;message+=' · +20 oro por el botín.';}}
    h.recent_names=[...h.offers.map(q=>q.name),...(h.recent_names||[])].slice(0,6);h.active=null;h.offer_seed=nextSeed(h.offer_seed);
  }else if(action==='buy'){
    const i=items.find(i=>i.id===Number(arg));if(!i||h.inventory.includes(i.id))throw Error('Objeto no disponible.');if(h.gold<i.cost)throw Error('No tienes suficiente oro.');h.gold-=i.cost;h.inventory.push(i.id);message='Has comprado '+i.name+'.';
  }else if(action==='equip'){
    const i=items.find(i=>i.id===Number(arg));if(!i||!h.inventory.includes(i.id))throw Error('No tienes ese objeto.');h.equipped[i.slot]=i.id;message='Equipo actualizado.';
  }else if(action==='train'){
    if(!Object.hasOwn(attributes,arg))throw Error('Atributo desconocido.');const cost=h[arg]*3;if(h.gold<cost)throw Error('No tienes suficiente oro.');h.gold-=cost;h[arg]++;message='Entrenamiento completado.';
  }else if(action==='dungeon'||action==='arena'){
    if(now<(h.cooldowns[action]||0))throw Error('Debes esperar antes del siguiente combate.');battle=fight(fighter(h),challengeEnemy(h,action),seed);h.cooldowns[action]=now+(action==='arena'?RULES.arenaCooldown:RULES.dungeonCooldown);
    const won=battle.winner===0,reward=action==='dungeon'?80+h.dungeon*20:25+h.level*5,xp=action==='dungeon'?60+h.dungeon*10:15+h.level*3;
    if(won){h.gold+=reward;h.xp+=xp;action==='dungeon'?h.dungeon++:h.wins++;}message=won?`¡Victoria! +${reward} oro · +${xp} EXP`:'Derrota. Revisa el registro y mejora tu equipo.';
  }else if(!['get','refresh'].includes(action))throw Error('Acción desconocida.');
  while(h.xp>=xpRequired(h.level)){h.xp-=xpRequired(h.level);h.level++;h.strength+=2;h.dexterity+=2;h.intellect+=2;h.stamina+=2;h.luck++;message+=` ¡Nivel ${h.level}!`;}
  if(action==='claim')h.offers=generateOffers(h,h.offer_seed);if(battle)h.last_battle=battle;if(message)h.log=[message,...h.log].slice(0,12);h.updated_at=now;
  if(requestId)h.receipts=[{id:requestId,action,arg,message,battle},...h.receipts].slice(0,32);
  return{hero:h,message,battle,server_time:now,rules_version:RULES.version};
}
