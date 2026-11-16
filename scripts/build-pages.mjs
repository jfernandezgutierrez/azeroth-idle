import {mkdir,copyFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// Only runtime files belong in the website, never documents or database scripts.
export const pageFiles=['index.html','style.css','app.js','api.js','config.js','engine.js','assets/cities.png','assets/sprites.png','assets/gear.png'];
export async function buildPages(root=process.cwd()){
 root=path.resolve(root);
 const destination=path.join(root,'tmp','pages');
 await mkdir(path.dirname(destination),{recursive:true});
 // Refuse an existing output to prevent stale files and avoid recursive deletion.
 await mkdir(destination);
 const files=[...pageFiles];
 for(const directory of ['game','ui']){
  for(const entry of await readdir(path.join(root,directory),{withFileTypes:true})){
   if(entry.isFile()&&entry.name.endsWith('.js'))files.push(directory+'/'+entry.name);
  }
 }
 for(const file of files){
  const target=path.join(destination,file);
  await mkdir(path.dirname(target),{recursive:true});
  await copyFile(path.join(root,file),target);
 }
 return {destination,files};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const result=await buildPages();console.log('Web preparada: '+result.files.length+' archivos en '+result.destination);
}
