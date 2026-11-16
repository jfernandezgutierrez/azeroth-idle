// Only run against the ephemeral PostgreSQL CI service, never a real project.
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
if(process.env.REALM_TEST_DATABASE!=='ephemeral')throw Error('Set REALM_TEST_DATABASE=ephemeral for the disposable CI database only');
function sql(query){return new Promise((resolve,reject)=>{const child=spawn('psql',['-h',process.env.PGHOST||'localhost','-U',process.env.PGUSER||'postgres','-v','ON_ERROR_STOP=1','-Atc',query],{env:process.env});let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);child.on('error',reject);child.on('close',code=>code===0?resolve(out.trim()):reject(Error(err)));});}
const columns=await sql("select count(*) from information_schema.columns where table_schema='auth' and table_name='users'");
assert.equal(columns,'1','Refusing to run outside the minimal CI auth schema');
const user='30000000-0000-4000-8000-000000000003';
const asUser=query=>`begin;select set_config('request.jwt.claim.sub','${user}',true);set local role authenticated;${query};commit;`;
await sql(`insert into auth.users(id) values('${user}')`);
await sql(asUser(`select public.realm_command('create','{"name":"Parallel","faction":"horde","job":"warrior"}','33333333-3333-4333-8333-333333333330')`));
await Promise.all(Array.from({length:12},()=>sql(asUser(`select public.realm_command('train','"strength"','33333333-3333-4333-8333-333333333331')`))));
const result=JSON.parse(await sql(`select jsonb_build_object('gold',state->'gold','strength',state->'strength','ledger',(select sum(delta) from realm_private.ledger where user_id='${user}' and asset='gold'),'commands',(select count(*) from realm_private.commands where user_id='${user}' and action='train')) from realm_private.characters where user_id='${user}'`));
assert.deepEqual(result,{gold:120,strength:11,ledger:120,commands:1});
console.log('12 simultaneous retries produced one training action and one economic movement');
