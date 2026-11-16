// Own balancing rules, not the reference game's official coefficients.
export const RULES=Object.freeze({version:'classic-1',schema:2,timezone:'Europe/Madrid',adventure:100,secondsPerAdventure:30,maxTurns:200,arenaCooldown:600000,dungeonCooldown:3600000});
export const classes=Object.freeze({warrior:'Guerrero',mage:'Mago',ranger:'Explorador'});
export const attributes=Object.freeze({strength:'Fuerza',dexterity:'Destreza',intellect:'Intelecto',stamina:'Aguante',luck:'Suerte'});
export const jobs=Object.freeze({
  warrior:{primary:'strength',health:5,damage:1,armor:.2,armorCap:.5,block:.25,evade:0},
  ranger:{primary:'dexterity',health:4,damage:1.15,armor:.12,armorCap:.25,block:0,evade:.35},
  mage:{primary:'intellect',health:2,damage:1.8,armor:.05,armorCap:.1,block:0,evade:0},
});
export const items=Object.freeze([
  {id:0,name:'Hacha del veterano',slot:'weapon',icon:6,power:5,cost:100},
  {id:1,name:'Coraza de la frontera',slot:'armor',icon:7,power:4,cost:85},
  {id:2,name:'Báculo de las brasas',slot:'weapon',icon:8,power:9,cost:210},
  {id:3,name:'Yelmo del juramento',slot:'helm',icon:9,power:3,cost:65},
]);
export function xpRequired(level){return Math.round(80*level**1.65);}
export function dayKey(now){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:RULES.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;}
export function nextSeed(seed){return(seed*48271)%2147483647;}
export function randomSource(seed){if(!Number.isInteger(seed)||seed<1||seed>=2147483647)throw Error('Semilla inválida.');let state=seed;return()=>{state=nextSeed(state);return state/2147483647;};}
export function freshSeed(){const a=new Uint32Array(1);globalThis.crypto.getRandomValues(a);return(a[0]%2147483646)+1;}
