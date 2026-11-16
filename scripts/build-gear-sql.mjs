import {readFile,writeFile} from 'node:fs/promises';
import {GEAR,slots,rarities,gearTemplates,gearSuffixes} from '../game/gear-rules.js';
const template=await readFile(new URL('../supabase/gear_v1.template.sql',import.meta.url),'utf8');
const catalog=JSON.stringify({rules:GEAR,slots,slotOrder:Object.keys(slots),rarities,templates:gearTemplates,suffixes:gearSuffixes});
if(catalog.includes('$gear$'))throw Error('Invalid catalog delimiter');
const output=template.replace('__GEAR_CATALOG__',`$gear$${catalog}$gear$`),file=new URL('../supabase/gear_v1.sql',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('Gear SQL is stale');console.log('Gear SQL matches shared catalogs');}
else{await writeFile(file,output);console.log('Compiled gear-1 SQL');}
