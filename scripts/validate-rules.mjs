import assert from 'node:assert/strict';
import {RULES,jobs,items} from '../game/rules.js';
import {adventureCatalog as c} from '../game/adventure.js';
assert.equal(RULES.version,'classic-1');assert.equal(RULES.schema,2);
assert.ok(Number.isInteger(RULES.adventure)&&RULES.adventure>0);
new Intl.DateTimeFormat('en-GB',{timeZone:RULES.timezone});
assert.equal(c.profiles.length,3);assert.ok(c.names.length>=9);assert.equal(new Set(c.names).size,c.names.length);
assert.equal(new Set(items.map(i=>i.id)).size,items.length);
for(const list of [c.names,c.horde,c.alliance,c.enemies,c.descriptions])assert.ok(list.length>0&&list.every(s=>typeof s==='string'&&s.trim().length>0&&s.length<500));
for(const p of c.profiles){assert.ok(Number.isInteger(p.cost)&&p.cost>0&&p.cost<=RULES.adventure);assert.ok(p.xp>0&&p.gold>0&&p.difficulty>0);assert.ok(p.loot>=0&&p.loot<=1);}
for(const item of items){assert.ok(Number.isInteger(item.id)&&item.id>=0);assert.ok(['weapon','armor','helm'].includes(item.slot));assert.ok(item.cost>0&&item.power>0);}
for(const job of Object.values(jobs)){assert.ok(['strength','dexterity','intellect'].includes(job.primary));assert.ok(job.health>0&&job.damage>0&&job.armorCap>=job.armor);assert.ok(job.block>=0&&job.evade>=0&&job.block+job.evade<=1);}
console.log('Versioned rules, classes, adventure catalog and item budgets validated');
