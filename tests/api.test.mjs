import test from 'node:test';
import assert from 'node:assert/strict';
import {RealmClient} from '../api.js';
const storage=()=>{const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
const response=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
function setup(fetcher,expires=100000){const s=storage();s.setItem('azeroth-session',JSON.stringify({user:{id:'owner'},access_token:'test-access',refresh_token:'test-refresh',expires_at:expires}));return new RealmClient({url:'https://test.invalid',key:'test-public',storage:s,fetcher,clock:()=>1000});}
test('network retry reuses a command ID and clears pending only after success',async()=>{
 const bodies=[];const c=setup(async(_url,r)=>{bodies.push(JSON.parse(r.body));if(bodies.length===1)throw new TypeError('offline');return response({hero:{gold:50},server_time:1500});});
 const result=await c.command('buy',0);assert.equal(result.hero.gold,50);assert.equal(bodies[0].request_id,bodies[1].request_id);assert.equal(c.pending,null);assert.equal(c.offset,500);
});
test('uncertain command survives reload and blocks unrelated mutations',async()=>{
 const c=setup(async()=>{throw new TypeError('offline');});await assert.rejects(c.command('buy',0));
 const id=c.pending.request_id;await assert.rejects(c.command('train','strength'),/pendiente/);
 const restored=new RealmClient({url:c.url,key:c.key,storage:c.storage,fetcher:async(_u,r)=>{assert.equal(JSON.parse(r.body).request_id,id);return response({hero:{gold:50}});},clock:()=>1000});
 await restored.retry();assert.equal(restored.pending,null);
});
test('domain errors do not retry and release the pending command',async()=>{
 let calls=0;const c=setup(async()=>{calls++;return response({message:'Saldo insuficiente'},400);});
 await assert.rejects(c.command('buy',0),/Saldo/);assert.equal(calls,1);assert.equal(c.pending,null);
});
test('malformed successful response retains request identity for retry',async()=>{
 const ids=[];const c=setup(async(_u,r)=>{ids.push(JSON.parse(r.body).request_id);if(ids.length===1)return{ok:true,status:200,json:async()=>{throw Error('incomplete')}};return response({hero:{}});});
 await c.command('train','luck');assert.equal(ids[0],ids[1]);
});
test('concurrent requests share one session refresh',async()=>{
 let refreshes=0;const c=setup(async(url,r)=>{if(url.includes('refresh_token')){refreshes++;return response({user:{id:'owner'},access_token:'new',refresh_token:'new-refresh',expires_in:3600});}assert.equal(r.headers.Authorization,'Bearer new');return response({hero:{}});},0);
 await Promise.all([c.command('get'),c.command('get')]);assert.equal(refreshes,1);
});
test('pending command belongs to its account and logout clears local session on network failure',async()=>{
 const c=setup(async()=>{throw new TypeError('offline');});c.storage.setItem('azeroth-pending',JSON.stringify({owner:'someone-else',action:'buy',arg:0,request_id:'other'}));
 const other=new RealmClient({url:c.url,key:c.key,storage:c.storage,fetcher:c.fetcher});assert.equal(other.pending,null);
 await assert.rejects(c.signOut());assert.equal(c.session,null);assert.equal(c.storage.getItem('azeroth-session'),null);
});
