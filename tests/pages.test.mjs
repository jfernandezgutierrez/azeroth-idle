import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {buildPages,pageFiles} from '../scripts/build-pages.mjs';

test('website package excludes private project files and preserves relative paths',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'azeroth-pages-'));
 try{
  for(const file of [...pageFiles,'game/rules.js','ui/screens.js','docs/plan.docx','supabase/private.sql','.env','assets/prompts.md','game/notes.md']){
   await mkdir(path.dirname(path.join(root,file)),{recursive:true});await writeFile(path.join(root,file),file);
  }
  const result=await buildPages(root);
  assert.deepEqual((await readdir(result.destination)).sort(),['api.js','app.js','assets','config.js','engine.js','game','index.html','style.css','ui']);
  assert.deepEqual(await readdir(path.join(result.destination,'assets')),['cities.png','gear.png','sprites.png']);
  assert.deepEqual(await readdir(path.join(result.destination,'game')),['rules.js']);
  assert.equal(await readFile(path.join(result.destination,'ui/screens.js'),'utf8'),'ui/screens.js');
  await assert.rejects(buildPages(root),{code:'EEXIST'});
 }finally{await rm(root,{recursive:true,force:true});}
});
