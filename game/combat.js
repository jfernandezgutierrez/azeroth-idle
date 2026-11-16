import {RULES,jobs,items,randomSource} from './rules.js';

export function fighter(hero){
  const job=jobs[hero.job];if(!job)throw Error('Clase desconocida.');
  const stats={strength:hero.strength,dexterity:hero.dexterity,intellect:hero.intellect,stamina:hero.stamina,luck:hero.luck};let defense=0;
  for(const[slot,id]of Object.entries(hero.equipped||{})){
    const item=items.find(i=>i.id===id);if(!item||item.slot!==slot)continue;
    if(slot==='weapon')stats[job.primary]+=item.power;else if(slot==='helm')stats.stamina+=item.power;else defense+=item.power;
  }
  const base=(4+hero.level*2)*(1+stats[job.primary]/10)*job.damage;
  return{name:hero.name,job:hero.job,level:hero.level,stats,primary:job.primary,hp:Math.max(1,Math.floor(stats.stamina*(hero.level+1)*job.health)),min:Math.max(1,Math.floor(base*.85)),max:Math.max(1,Math.floor(base*1.15)),armor:Math.min(job.armorCap,job.armor+defense*.015),block:job.block,evade:job.evade};
}

export function fight(attacker,defender,seed){
  const random=randomSource(seed),sides=[structuredClone(attacker),structuredClone(defender)],hp=sides.map(s=>s.hp),turns=[];
  let actor=random()<.5?0:1;
  for(let i=0;i<RULES.maxTurns&&hp[0]>0&&hp[1]>0;i++,actor=1-actor){
    const a=sides[actor],d=sides[1-actor],spread=random(),critRoll=random(),defenseRoll=random();
    const critical=critRoll<Math.min(.5,a.stats.luck*2.5/(Math.max(1,d.level)*100)),magic=a.job==='mage';
    const defense=magic?'none':defenseRoll<d.block?'block':defenseRoll<d.block+d.evade?'evade':'none';
    const raw=Math.floor((a.min+Math.floor(spread*(a.max-a.min+1)))*(1+Math.floor(i/2)*.08)*(critical?2:1));
    const resistance=Math.min(.2,d.stats[a.primary]/(a.stats[a.primary]+d.stats[a.primary]+10)*.15);
    const damage=defense==='none'?Math.max(1,Math.floor(raw*(1-(magic?0:d.armor))*(1-resistance))):0;
    hp[1-actor]=Math.max(0,hp[1-actor]-damage);turns.push({turn:i+1,actor,critical,defense,raw,damage,hp:[...hp]});
  }
  return{version:RULES.version,seed,attacker:sides[0],defender:sides[1],winner:hp[1]===0?0:1,timeout:hp[0]>0&&hp[1]>0,turns};
}
export function enemyAt(level,index=0,difficulty=.75,name='Guardián de la frontera'){
  const job=['warrior','ranger','mage'][index%3],stat=Math.max(1,Math.floor((10+2*(level-1))*difficulty));
  return fighter({name,job,level,strength:stat,dexterity:stat,intellect:stat,stamina:stat,luck:Math.max(1,Math.floor(stat/2)),equipped:{}});
}
