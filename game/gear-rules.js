export const GEAR=Object.freeze({version:'gear-1',bagCapacity:20,mailCapacity:50,shopSize:6,maxRefreshes:10,maxLevel:100000});
export const slots=Object.freeze({weapon:'Arma',offhand:'Escudo',helm:'Cabeza',armor:'Torso',gloves:'Manos',boots:'Pies',belt:'Cintura',neck:'Cuello',ring:'Anillo',trinket:'Accesorio'});
export const rarities=Object.freeze([
 {id:'common',name:'Común',threshold:.62,multiplier:1,cost:1},
 {id:'unusual',name:'Inusual',threshold:.9,multiplier:1.4,cost:1.8},
 {id:'rare',name:'Rara',threshold:.985,multiplier:1.85,cost:3},
 {id:'epic',name:'Épica',threshold:1,multiplier:2.4,cost:5},
]);
export const gearTemplates=Object.freeze([
 {id:'axe',name:'Hacha de guerra',slot:'weapon',job:'warrior',icon:0},
 {id:'bow',name:'Arco de caza',slot:'weapon',job:'ranger',icon:1},
 {id:'staff',name:'Báculo arcano',slot:'weapon',job:'mage',icon:2},
 {id:'helm',name:'Yelmo forjado',slot:'helm',job:'any',icon:3},
 {id:'hood',name:'Capucha del vigía',slot:'helm',job:'any',icon:3},
 {id:'breastplate',name:'Coraza forjada',slot:'armor',job:'any',icon:4},
 {id:'coat',name:'Cota del viajero',slot:'armor',job:'any',icon:4},
 {id:'gauntlets',name:'Guanteletes de acero',slot:'gloves',job:'any',icon:5},
 {id:'gloves',name:'Guantes de cuero',slot:'gloves',job:'any',icon:5},
 {id:'boots',name:'Botas de marcha',slot:'boots',job:'any',icon:6},
 {id:'greaves',name:'Grebas de hierro',slot:'boots',job:'any',icon:6},
 {id:'belt',name:'Cinturón reforzado',slot:'belt',job:'any',icon:7},
 {id:'sash',name:'Faja del caminante',slot:'belt',job:'any',icon:7},
 {id:'pendant',name:'Colgante esmeralda',slot:'neck',job:'any',icon:8},
 {id:'amulet',name:'Amuleto tallado',slot:'neck',job:'any',icon:8},
 {id:'ring',name:'Anillo de plata',slot:'ring',job:'any',icon:9},
 {id:'signet',name:'Sello de guardia',slot:'ring',job:'any',icon:9},
 {id:'talisman',name:'Talismán antiguo',slot:'trinket',job:'any',icon:10},
 {id:'relic',name:'Reliquia rúnica',slot:'trinket',job:'any',icon:10},
 {id:'shield',name:'Escudo de acero',slot:'offhand',job:'warrior',icon:11},
 {id:'buckler',name:'Broquel del guardián',slot:'offhand',job:'warrior',icon:11},
]);
export const gearSuffixes=Object.freeze(['del Alba','del Bastión','de las Brasas','del Caminante','de la Frontera','del Juramento']);
