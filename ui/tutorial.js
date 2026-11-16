import {esc} from './html.js';
export function tutorial(hero){
 const t=hero.tutorial||{};if(t.dismissed)return '';
 const step=!t.started?0:!t.claimed?1:!t.improved?2:3;
 const entries=[['Elige tu primer encargo','Compara experiencia, oro y exploración. Aceptar consume aventura; recargar no cambia la oferta.','tavern','Ir a la taberna'],['Tu aventura está en marcha','Vuelve al terminar la espera y recoge el resultado. Puedes cerrar el juego mientras tanto.','tavern','Consultar misión'],['Mejora a tu héroe','Entrena un atributo o equipa un objeto desde Personaje. Tu próxima misión aprovechará esa mejora.','hero','Abrir personaje'],['Ya conoces el camino','Has completado una misión y mejorado a tu héroe. Sigue explorando, entrenando y desafiando guardianes.',null,null]];
 const [title,desc,target,label]=entries[step];
 return `<section class="tutorial-panel" aria-label="Guía de tu primera aventura"><div><p class="eyebrow">TU PRIMERA AVENTURA · PASO ${step+1} DE 4</p><h2>${esc(title)}</h2><p>${esc(desc)}</p></div><div class="tutorial-actions">${target?`<button class="primary" data-view="${target}">${label}</button>`:''}<button class="secondary" data-action="tutorial_dismiss">${step===3?'Terminar guía':'Ocultar guía'}</button></div></section>`;
}
