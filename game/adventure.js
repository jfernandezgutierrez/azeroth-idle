import {RULES,randomSource} from './rules.js';
import {enemyAt} from './combat.js';
const names=['Sombras en el camino','El tributo de las ruinas','Un convoy perdido','La promesa del vigía','Huellas bajo la luna','El eco de las cavernas','El sello quebrado','El último mensajero','La amenaza del barranco','Polvo y acero','El mapa del proscrito','Un juramento olvidado'];
const horde=['Durotar','Los Baldíos','Sierra Espolón','Desolace','Tierras Altas','Marismas del Norte'],alliance=['Bosque de Elwynn','Páramos de Poniente','Montañas Crestagrana','Bosque del Ocaso','Tierras Altas','Marismas del Norte'];
const enemies=['Saqueador del camino','Lobo de las colinas','Guardián ancestral','Hechicero proscrito','Acechador del barranco','Centinela de piedra'];
const descriptions=['Protege a los viajeros y recupera los suministros antes de que caiga la noche.','Un antiguo sello ha despertado. Explora las ruinas y enfrenta a su guardián.','Los exploradores han encontrado huellas extrañas. Sigue el rastro y despeja la ruta.','Un mensajero necesita cruzar la frontera. Asegúrate de que su misión llegue a buen puerto.'];
const profiles=[{name:'Experiencia',cost:5,xp:1.35,gold:.8,difficulty:.65,loot:.08},{name:'Oro',cost:8,xp:.8,gold:1.45,difficulty:.72,loot:.08},{name:'Exploración',cost:10,xp:1,gold:1,difficulty:.8,loot:.25}];
export const adventureCatalog={names,horde,alliance,enemies,descriptions,profiles};
export function generateOffers(hero,seed){
  let choices=names.filter(name=>!(hero.recent_names||[]).includes(name));if(choices.length<3)choices=names;
  const random=randomSource(seed),base=Math.floor(random()*choices.length),stride=Math.floor(choices.length/3),zones=hero.faction==='horde'?horde:alliance;
  return profiles.map((p,slot)=>{
    const zone=zones[Math.floor(random()*zones.length)],index=Math.floor(random()*enemies.length),level=Math.max(1,hero.level+slot-1);
    return{id:`${seed}-${slot}`,slot,version:RULES.version,name:choices[(base+slot*stride)%choices.length],zone,desc:descriptions[(base+slot)%descriptions.length],profile:p.name,duration:p.cost*RULES.secondsPerAdventure,energy:p.cost,gold:Math.round(p.cost*(8+hero.level*3)*p.gold),xp:Math.round(p.cost*12*(1+.06*hero.level)*p.xp),lootChance:p.loot,enemy:enemyAt(level,index%3,p.difficulty,enemies[index]),enemyIcon:index===2||index===5?11:10};
  });
}
