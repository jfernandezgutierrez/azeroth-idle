// UI progression is separate from the frozen classic-1 economic rules.
export const blankTutorial=()=>({started:false,claimed:false,improved:false,dismissed:false});
export function tutorialState(hero,action,replayed=false){
 const next={...blankTutorial(),...hero.tutorial};
 if(replayed)return next;
 if(action==='quest')next.started=true;
 if(action==='claim'){next.started=true;next.claimed=true;}
 if(['train','equip'].includes(action)&&next.claimed)next.improved=true;
 if(action==='tutorial_dismiss')next.dismissed=true;
 if(action==='tutorial_restart')return blankTutorial();
 return next;
}
