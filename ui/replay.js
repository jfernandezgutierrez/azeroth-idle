import {esc,sprite,portrait} from './html.js';
let timer=null,record=null,index=0,stepMs=650;
export function stopReplay(){clearInterval(timer);timer=null;}
export function showBattle(battle,hero,message,modal){
  stopReplay();record=battle;index=0;stepMs=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:650;
  modal(`<p class="eyebrow">COMBATE AUTOMÁTICO POR TURNOS</p><h2>${battle.winner===0?'Victoria':'Una batalla más'}</h2><p>${esc(message||'Repetición del último combate guardado.')}</p><div class="replay-fighters">${[battle.attacker,battle.defender].map((f,i)=>`<div>${sprite(i===0?portrait(hero):10)}<b>${esc(f.name)}</b><small>Nivel ${f.level}</small><progress id="hp-${i}" max="${f.hp}" value="${f.hp}" aria-label="Vida de ${esc(f.name)}"></progress><small id="hp-text-${i}">${f.hp} / ${f.hp}</small></div>`).join('')}</div><p id="replay-status" role="status">El combate comienza.</p><ol id="replay-log" class="replay-log" aria-label="Registro de ataques"></ol><div class="replay-controls"><button class="secondary" data-replay-result>Ver resultado</button><button class="secondary" data-replay-speed>Acelerar</button><button class="secondary" data-replay-again>Repetir</button><button class="primary" data-close>Continuar →</button></div>`);
  document.querySelector('#modal').classList.add('battle-dialog');
  document.querySelector('#modal').addEventListener('close',()=>{stopReplay();document.querySelector('#modal').classList.remove('battle-dialog');},{once:true});
  if(stepMs)start();else finishReplay();
}
function start(){stopReplay();timer=setInterval(()=>{if(index<record.turns.length){index++;paint();}else stopReplay();},stepMs);}
function describe(t){const f=t.actor===0?record.attacker:record.defender;return `${f.name}: ${t.defense==='block'?'ataque bloqueado':t.defense==='evade'?'ataque esquivado':`${t.damage} de daño${t.critical?' · crítico':''}`}`;}
function paint(){
 const last=index?record.turns[index-1]:null,hp=last?.hp||[record.attacker.hp,record.defender.hp];
 for(let i=0;i<2;i++){const p=document.querySelector('#hp-'+i);if(!p){stopReplay();return;}p.value=hp[i];document.querySelector('#hp-text-'+i).textContent=`${hp[i]} / ${i===0?record.attacker.hp:record.defender.hp}`;}
 document.querySelector('#replay-log').innerHTML=record.turns.slice(Math.max(0,index-6),index).map(t=>`<li value="${t.turn}">${esc(describe(t))}</li>`).join('');
 document.querySelector('#replay-status').textContent=index===record.turns.length?`Combate terminado en ${index} turnos${record.timeout?' · límite de seguridad alcanzado':''}.`:`Turno ${index} de ${record.turns.length}`;
}
export function finishReplay(){stopReplay();if(record){index=record.turns.length;paint();}}
export function accelerateReplay(){stepMs=150;if(index<record.turns.length)start();}
export function restartReplay(){index=0;paint();if(stepMs)start();else finishReplay();}
