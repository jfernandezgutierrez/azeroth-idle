// Only run against the ephemeral PostgreSQL CI service, never a real project.
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
if(process.env.REALM_TEST_DATABASE!=='ephemeral')throw Error('Set REALM_TEST_DATABASE=ephemeral for the disposable CI database only');
function sql(query){return new Promise((resolve,reject)=>{const child=spawn('psql',['-h',process.env.PGHOST||'localhost','-U',process.env.PGUSER||'postgres','-v','ON_ERROR_STOP=1','-Atc',query],{env:process.env});let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);child.on('error',reject);child.on('close',code=>code===0?resolve(out.trim()):reject(Error(err)));});}
const columns=await sql("select count(*) from information_schema.columns where table_schema='auth' and table_name='users'");
assert.equal(columns,'1','Refusing to run outside the minimal CI auth schema');
const user='30000000-0000-4000-8000-000000000003';
const endpoint=await sql("select case when to_regprocedure('public.realm_command_v3(text,jsonb,uuid)') is null then 'realm_command' else 'realm_command_v3' end");
assert.ok(['realm_command','realm_command_v3'].includes(endpoint));
const asUser=query=>`begin;select set_config('request.jwt.claim.sub','${user}',true);set local role authenticated;${query};commit;`;
await sql(`insert into auth.users(id) values('${user}')`);
await sql(asUser(`select public.${endpoint}('create','{"name":"Parallel","faction":"horde","job":"warrior"}','33333333-3333-4333-8333-333333333330')`));
await Promise.all(Array.from({length:12},()=>sql(asUser(`select public.${endpoint}('train','"strength"','33333333-3333-4333-8333-333333333331')`))));
const result=JSON.parse(await sql(`select jsonb_build_object('gold',state->'gold','strength',state->'strength','ledger',(select sum(delta) from realm_private.ledger where user_id='${user}' and asset='gold'),'commands',(select count(*) from realm_private.commands where user_id='${user}' and action='train')) from realm_private.characters where user_id='${user}'`));
assert.deepEqual(result,{gold:120,strength:11,ledger:120,commands:1});
console.log('12 simultaneous retries produced one training action and one economic movement');
if(endpoint==='realm_command_v3'){
 const offer=JSON.parse(await sql(`select state->'shop'->'offers'->0 from realm_private.characters where user_id='${user}'`));
 await Promise.all(Array.from({length:12},()=>sql(asUser(`select public.${endpoint}('buy','${JSON.stringify(offer.id)}','33333333-3333-4333-8333-333333333332')`))));
 const purchase=JSON.parse(await sql(`select jsonb_build_object('gold',state->'gold','count',(select count(*) from jsonb_array_elements(state->'bag') x where x->>'id'='${offer.id}'),'events',(select count(*) from realm_private.gear_events where user_id='${user}' and kind='acquired')) from realm_private.characters where user_id='${user}'`));
 assert.deepEqual(purchase,{gold:120-offer.item.price,count:1,events:1});
 console.log('12 simultaneous purchase retries produced one item and one charge');
 await sql(`begin;update realm_private.characters set state=jsonb_set(state,'{gold}',to_jsonb((state->>'gold')::bigint+9000)) where user_id='${user}';insert into realm_private.ledger(user_id,request_id,asset,delta,balance,reason) select '${user}','33333333-3333-4333-8333-333333333339','gold',9000,(state->>'gold')::bigint,'ephemeral_test_grant' from realm_private.characters where user_id='${user}';commit;`);
 const next=JSON.parse(await sql(`select x from realm_private.characters c,jsonb_array_elements(c.state->'shop'->'offers') x where c.user_id='${user}' and x->>'sold'='false' limit 1`));
 const race=await Promise.allSettled(['33333333-3333-4333-8333-333333333333','33333333-3333-4333-8333-333333333334'].map(id=>sql(asUser(`select public.${endpoint}('buy','${JSON.stringify(next.id)}','${id}')`))));
 assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
 const end=JSON.parse(await sql(`select jsonb_build_object('gold',state->'gold','ledger',(select sum(delta) from realm_private.ledger where user_id='${user}' and asset='gold')) from realm_private.characters where user_id='${user}'`));
 assert.equal(end.gold,purchase.gold+9000-next.item.price);assert.equal(end.gold,end.ledger);
 console.log('Two different commands racing for one offer produced one successful purchase');
}
