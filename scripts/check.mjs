import {readdir,readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=process.cwd();let count=0;
async function check(directory){
 for(const item of await readdir(directory,{withFileTypes:true})){
  if(['.git','tmp','node_modules'].includes(item.name))continue;
  const file=path.join(directory,item.name);
  if(item.isDirectory()){await check(file);continue;}
  if(!/\.(js|mjs)$/.test(item.name))continue;
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr||'Syntax check failed');
  const source=await readFile(file,'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g))await access(path.resolve(path.dirname(file),match[1]));
  count++;
 }
}
await check(root);console.log(`${count} JavaScript files and their relative imports checked`);
