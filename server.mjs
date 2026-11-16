import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)||pathname.split('/').some(p=>p.startsWith('.'))||!['.html','.css','.js','.png','.webp','.jpg'].includes(path.extname(file))){res.writeHead(404).end();return}const data=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'})[path.extname(file)]);res.end(data)}catch{res.writeHead(404).end('No encontrado')}}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
