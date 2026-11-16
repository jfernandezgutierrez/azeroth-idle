import {createHero,upgradeHero,settle,dayKey,refreshCost} from './engine.js';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
import {RealmClient} from './api.js';
import {esc,duration} from './ui/html.js';
import {creation,shell} from './ui/screens.js';
import {showBattle,finishReplay,accelerateReplay,restartReplay} from './ui/replay.js';

const $=s=>document.querySelector(s),client=new RealmClient({url:SUPABASE_URL,key:SUPABASE_KEY});
const readPractice=()=>{try{return JSON.parse(localStorage.getItem('azeroth-practice')||'null');}catch{return null;}};
let practice=!client.session,hero=practice?readPractice():null,view='city',busy=false,loading=!!client.session,faction=hero?.faction||'horde',toastTimer,nextDailyCheck=0;
const uiState={bagFilter:'all',bagSort:'level'};
if(hero){hero=upgradeHero(hero);hero=settle(hero,'get',null).hero;savePractice();}
const now=()=>Date.now()+(practice?0:client.offset);
function savePractice(){if(practice&&hero)localStorage.setItem('azeroth-practice',JSON.stringify(hero));}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5000);}
function modal(html){const dialog=$('#modal');if(dialog.open)dialog.close();dialog.innerHTML=`<button class="close" data-close aria-label="Cerrar">×</button>${html}`;dialog.showModal();}
function render(){
  document.body.dataset.faction=hero?.faction||faction;
  $('#app').innerHTML=loading?'<main class="creation"><h1>Entrando en los reinos</h1><p role="status">Recuperando tu personaje…</p></main>':hero?shell(hero,view,practice,now(),!practice&&client.pending,uiState):creation(faction,practice);
  if(!hero&&!practice&&client.pending&&!loading)$('#app').insertAdjacentHTML('afterbegin','<div class="connection-banner">Hay una acción pendiente. <button class="secondary" data-retry>Comprobar y continuar</button></div>');
  if(view==='ranking'&&hero)loadRanking();tick();
}
async function action(type,arg=null,retry=false){
  if(busy)return;busy=true;
  document.querySelectorAll('[data-action]').forEach(b=>b.disabled=true);
  try{
    const result=practice?settle(hero,type,arg,now(),undefined,crypto.randomUUID()):retry?await client.retry():await client.command(type,arg);
    hero=result.hero;savePractice();if(result.message)toast(result.message);if((type?.startsWith('tutorial_')||['sell','shop_refresh'].includes(type))&&$('#modal').open)$('#modal').close();render();
    if(result.battle)showBattle(result.battle,hero,result.message,modal);
  }catch(error){toast(error.message);render();}
  finally{busy=false;}
}
function authDialog(){modal(`<p class="eyebrow">TU LEYENDA, SIEMPRE CONTIGO</p><h2>Entra en los reinos</h2><p>Guarda tu héroe en la nube con tu correo y contraseña.</p><form id="auth"><label>Correo<input name="email" type="email" autocomplete="email" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="8" required></label><button class="primary" name="mode" value="login">Entrar</button><button class="secondary" name="mode" value="signup">Crear cuenta</button><p id="auth-error" role="status"></p></form><small>La práctica se guarda por separado. No se importa a la cuenta online.</small>`);}
function help(){modal('<p class="eyebrow">TU PRIMERA AVENTURA</p><h2>Cómo jugar</h2><ol class="help-steps"><li>Visita la taberna y compara tres encargos. Experiencia acelera el nivel, Oro ayuda a entrenar y Exploración ofrece más botín.</li><li>Emprende una misión. Su tiempo sigue corriendo aunque cierres el juego. El equipo se guarda al partir.</li><li>Vuelve cuando termine y recoge el resultado. El combate se resuelve por turnos automáticamente.</li><li>Abre Personaje para entrenar los cinco atributos y equipar lo que compres o encuentres.</li><li>Prueba la arena de entrenamiento y las mazmorras. Tienen sus propias esperas y no gastan aventura.</li></ol><p>Dispones de 100 de aventura por día. Se repone a medianoche de Madrid.</p><button class="primary" data-close>Entendido</button> <button class="secondary" data-action="tutorial_restart">Mostrar guía paso a paso</button>');}
async function loadRanking(){
  const target=$('#ranking');if(!target)return;
  if(practice){target.innerHTML='<p>La clasificación requiere entrar con tu cuenta.</p><button class="primary" data-auth>Entrar en los reinos</button>';return;}
  try{const rows=await client.transport('/rest/v1/rpc/realm_ranking',{});if(!$('#ranking'))return;$('#ranking').innerHTML=rows.length?rows.map((r,i)=>`<div class="stat-row"><b>${i+1}</b><span>${esc(r.name)}</span><span>${r.faction==='horde'?'Horda':'Alianza'}</span><b>Nv. ${r.level}</b></div>`).join(''):'Aún no hay héroes en el reino.';}
  catch(error){if($('#ranking'))$('#ranking').textContent=error.message;}
}
function tick(){
  if(hero&&!busy&&Date.now()>nextDailyCheck&&dayKey(now())>hero.day){nextDailyCheck=Date.now()+60000;action('get');return;}
  if(hero?.active&&$('#countdown')){const left=Math.max(0,Math.ceil((hero.active.ends-now())/1000));$('#countdown').textContent=left?duration(left)+' para llegar':'Tu combate está listo';$('#claim').disabled=left>0||busy;}
  const timer=$('[data-ready-at]');if(timer){const left=Math.max(0,Math.ceil((Number(timer.dataset.readyAt)-now())/1000));timer.textContent=left?'Disponible en '+duration(left):'Listo para combatir';const b=$('[data-action="'+view+'"]');if(b)b.disabled=left>0||busy;}
}
document.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close'))$('#modal').close();
  if(b.dataset.view){view=b.dataset.view;render();}
  if(b.dataset.action)await action(b.dataset.action,b.dataset.arg??null);
  if(b.dataset.bagFilter){uiState.bagFilter=b.dataset.bagFilter;render();}
  if(b.hasAttribute('data-request-refresh'))modal(`<p class="eyebrow">NUEVAS EXISTENCIAS</p><h2>Renovar la armería</h2><p>Las seis ofertas actuales se sustituirán por otras adaptadas a tu nivel.</p><p>Coste: <b>${refreshCost(hero)} oro del juego</b>.</p><button class="primary" data-action="shop_refresh">Renovar por ${refreshCost(hero)} oro</button> <button class="secondary" data-close>Cancelar</button>`);
  if(b.dataset.requestSell){const item=hero.bag.find(i=>i.id===b.dataset.requestSell);if(item)modal(`<p class="eyebrow">VENTA DE EQUIPO</p><h2>Vender objeto</h2><p>${esc(item.name)} · Nivel ${item.level}</p><p>Recibirás <b>${item.sellValue} oro</b>. El objeto saldrá de tu mochila.</p><button class="primary" data-action="sell" data-arg="${esc(item.id)}">Vender por ${item.sellValue} oro</button> <button class="secondary" data-close>Cancelar</button>`);}
  if(b.dataset.faction){faction=b.dataset.faction;document.body.dataset.faction=faction;document.querySelectorAll('[data-faction]').forEach(el=>el.classList.toggle('selected',el.dataset.faction===faction));}
  if(b.hasAttribute('data-auth'))authDialog();
  if(b.hasAttribute('data-help'))help();
  if(b.hasAttribute('data-last-battle')&&hero?.last_battle)showBattle(hero.last_battle,hero,null,modal);
  if(b.hasAttribute('data-replay-result'))finishReplay();
  if(b.hasAttribute('data-replay-speed'))accelerateReplay();
  if(b.hasAttribute('data-replay-again'))restartReplay();
  if(b.hasAttribute('data-retry'))await action(null,null,true);
  if(b.hasAttribute('data-logout')){
    if(busy)return;busy=true;
    try{await client.signOut();}catch(error){toast('La sesión local se ha cerrado. '+error.message);}
    practice=true;hero=readPractice();if(hero)hero=upgradeHero(hero);view='city';busy=false;render();
  }
});
document.addEventListener('submit',async event=>{
  event.preventDefault();const form=event.target,data=new FormData(form);
  if(form.id==='create'){
    if(busy)return;busy=true;
    try{const candidate=createHero(String(data.get('name')),faction,String(data.get('job')));hero=practice?candidate:(await client.command('create',{name:candidate.name,faction:candidate.faction,job:candidate.job})).hero;savePractice();render();help();}
    catch(error){toast(error.message);render();}finally{busy=false;}
  }
  if(form.id==='auth'){
    if(busy)return;busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      const result=await client.signIn(data.get('email'),data.get('password'),event.submitter.value==='signup');
      if(!result.access_token){$('#auth-error').textContent='Revisa tu correo para confirmar la cuenta. Después podrás entrar.';return;}
      practice=false;hero=null;const state=await client.command('get');hero=state.hero;$('#modal').close();view='city';render();toast('Bienvenido a los reinos.');
    }catch(error){if($('#auth-error'))$('#auth-error').textContent=error.message;}
    finally{busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
});
render();setInterval(tick,1000);
document.addEventListener('change',event=>{if(event.target.matches('[data-bag-sort]')){uiState.bagSort=event.target.value;render();}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&hero&&!busy&&!client.pending)action('get');});
if(client.session){client.command('get').then(result=>{hero=result.hero;loading=false;render();}).catch(error=>{loading=false;render();toast(error.message);authDialog();});}
