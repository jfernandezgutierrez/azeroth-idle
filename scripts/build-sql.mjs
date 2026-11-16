import {readFile,writeFile} from 'node:fs/promises';
import {RULES,jobs,items} from '../game/rules.js';
import {adventureCatalog} from '../game/adventure.js';
const template=await readFile(new URL('../supabase/classic_v1.template.sql',import.meta.url),'utf8');
const catalog=JSON.stringify({rules:RULES,jobs,items,adventure:adventureCatalog});
if(catalog.includes('$catalog$'))throw Error('Invalid SQL delimiter in catalog');
const output=template.replace('__CATALOG__',`$catalog$${catalog}$catalog$`);
const target=new URL('../supabase/classic_v1.sql',import.meta.url);
if(process.argv.includes('--check')){
 if(await readFile(target,'utf8')!==output)throw Error('classic_v1.sql is stale. Run node scripts/build-sql.mjs');
 console.log('SQL catalog matches the shared rules');
}else{await writeFile(target,output);console.log('Compiled classic_v1.sql from shared catalogs');}
