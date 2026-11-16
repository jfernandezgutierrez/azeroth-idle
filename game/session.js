import {settle as classicSettle,upgradeHero} from './engine.js';
import {freshSeed} from './rules.js';
import {tutorialState} from './onboarding.js';
export function settle(input,action,arg,now=Date.now(),seed=freshSeed(),requestId=null){
 const metadata=['tutorial_dismiss','tutorial_restart'].includes(action);
 if(metadata){
  const h=upgradeHero(input,now,seed),previous=requestId&&h.receipts.find(r=>r.id===requestId);
  if(previous){if(previous.action!==action||JSON.stringify(previous.arg)!==JSON.stringify(arg))throw Error('Identificador de acción reutilizado con otros datos.');return{hero:h,message:previous.message,battle:null,replayed:true,server_time:now,rules_version:h.rules_version};}
  if(arg!==null&&arg!==undefined)throw Error('Esta acción no admite parámetros.');
  h.tutorial=tutorialState(h,action);
  const message=action==='tutorial_dismiss'?'Puedes volver a mostrar la guía desde Cómo jugar.':'Tu guía vuelve a estar disponible.';
  if(requestId)h.receipts=[{id:requestId,action,arg,message,battle:null},...h.receipts].slice(0,32);
  return{hero:h,message,battle:null,server_time:now,rules_version:h.rules_version};
 }
 const result=classicSettle(input,action,arg,now,seed,requestId);
 result.hero.tutorial=tutorialState(result.hero,action,result.replayed);result.rules_version=result.hero.rules_version;return result;
}
