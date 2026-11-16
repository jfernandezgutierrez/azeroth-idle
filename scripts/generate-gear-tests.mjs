import {mkdir,writeFile} from 'node:fs/promises';
import {createHero,settle,fighter,upgradeHero} from '../engine.js';
import {createHero as oldHero} from '../game/legacy.js';
import {generateItem,generateShop} from '../game/gear.js';
const n=Date.parse('2026-11-16T10:00Z'),seed=78913,items=[],upgrades=[],fighters=[],steps=[],shops=[];
const hero=(job='warrior')=>createHero('Fixture','horde',job,n,seed);
function step(h,action,arg,time=n,s=123){const expected=settle(h,action,arg,time,s);steps.push({h:structuredClone(h),action,arg,n:time,seed:s,expected:structuredClone(expected)});return expected.hero;}
for(const job of ['warrior','ranger','mage']){
 for(const level of [1,10,100,1000])for(const slot of ['weapon','armor','helm','ring'])for(const s of [123,78913,2011909847])items.push({job,level,slot,seed:s,id:`fixture:${job}:${level}:${slot}:${s}`,expected:generateItem(job,level,slot,s,`fixture:${job}:${level}:${slot}:${s}`)});
 const old=oldHero('Legacy','alliance',job,n,seed);old.inventory=[0,1,2,3];old.equipped={weapon:2,armor:1,helm:3};upgrades.push({h:old,expected:upgradeHero(old,n,seed)});
 let h=hero(job);shops.push({h,seed:123,revision:2,expected:generateShop(h,n,123,2)});
 step(h,'get',null);step(h,'train','luck');step(h,'tutorial_dismiss',null);step(h,'tutorial_restart',null);
 h=step(h,'buy',h.shop.offers[0].id);const item=h.bag.find(i=>i.slot==='weapon');h=step(h,'equip',item.id);fighters.push({h,expected:fighter(h)});
 step(h,'arena',null);step(h,'dungeon',null);h=step(h,'favorite',item.id);h=step(h,'favorite',item.id);h=step(h,'unequip',item.id);h=step(h,'sell',item.id);
 h=step(h,'shop_refresh',null);h=step(h,'quest',h.offers[0].id);step(h,'claim',null,n+150000);
 step(h,'get',null,n+86400000);
}
let full=hero('mage');full.intellect=1000;full.stamina=1000;full.offers[0].lootChance=1;
while(full.bag.length<20)full.bag.push(generateItem('mage',1,'ring',123,'fill:'+full.bag.length));
full=step(full,'quest',full.offers[0].id);full=step(full,'claim',null,n+150000);full.bag.pop();step(full,'collect',full.mailbox[0].id,n+150000);
const fixtures=JSON.stringify({items,upgrades,fighters,steps,shops});
const sql=`do $test$ declare f jsonb:=$fixture$${fixtures}$fixture$::jsonb;c jsonb;r jsonb;i int:=0;begin
 for c in select value from jsonb_array_elements(f->'items') loop
  r:=realm_private.g1_item(c->>'job',(c->>'level')::int,c->>'slot',(c->>'seed')::bigint,c->>'id');
  if r<>c->'expected' then raise exception 'Gear item mismatch %',c->>'id';end if;
 end loop;
 for c in select value from jsonb_array_elements(f->'upgrades') loop assert realm_private.g1_upgrade(c->'h',${n},${seed})=c->'expected','gear migration mismatch';end loop;
 for c in select value from jsonb_array_elements(f->'fighters') loop assert realm_private.g1_fighter(c->'h')=c->'expected','gear fighter mismatch';end loop;
 for c in select value from jsonb_array_elements(f->'shops') loop assert realm_private.g1_shop(c->'h',${n},(c->>'seed')::bigint,(c->>'revision')::int)=c->'expected','gear shop mismatch';end loop;
 for c in select value from jsonb_array_elements(f->'steps') loop
  i:=i+1;r:=realm_private.g1_step(c->'h',c->>'action',c->'arg',(c->>'n')::bigint,(c->>'seed')::bigint);
  if r<>c->'expected' then raise exception 'Gear step mismatch % %',i,c->>'action';end if;
 end loop;
end $test$;

insert into auth.users(id) values('60000000-0000-4000-8000-000000000006'),('70000000-0000-4000-8000-000000000007');
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000006',true);
set local role authenticated;
do $test$ declare r jsonb;s jsonb;item_id text;gold bigint;begin
 r:=public.realm_command_v3('create','{"name":"Gear API","faction":"horde","job":"warrior"}','66666666-6666-4666-8666-666666666660');
 assert r->'hero'->>'gear_schema'='1','gear init missing';assert r->'hero'->'shop'->'seed' is null,'shop seed exposed';
 item_id:=r->'hero'->'shop'->'offers'->0->>'id';gold:=(r->'hero'->>'gold')::bigint-(r->'hero'->'shop'->'offers'->0->'item'->>'price')::bigint;
 r:=public.realm_command_v3('buy',to_jsonb(item_id),'66666666-6666-4666-8666-666666666661');
 s:=public.realm_command_v3('buy',to_jsonb(item_id),'66666666-6666-4666-8666-666666666661');
 assert s->'hero'->>'gold'=gold::text,'duplicate item purchase';assert jsonb_array_length(s->'hero'->'bag')=2,'duplicate instance';
 r:=public.realm_command_v3('favorite',to_jsonb(item_id),'66666666-6666-4666-8666-666666666662');
 begin perform public.realm_command_v3('sell',to_jsonb(item_id),'66666666-6666-4666-8666-666666666663');raise exception 'favorite sold';exception when raise_exception then if sqlerrm='favorite sold' then raise;end if;end;
 r:=public.realm_command_v3('favorite',to_jsonb(item_id),'66666666-6666-4666-8666-666666666664');
 r:=public.realm_command_v3('equip',to_jsonb(item_id),'66666666-6666-4666-8666-666666666665');
 begin perform public.realm_command_v3('sell',to_jsonb(item_id),'66666666-6666-4666-8666-666666666666');raise exception 'equipped item sold';exception when raise_exception then if sqlerrm='equipped item sold' then raise;end if;end;
 r:=public.realm_command_v3('unequip',to_jsonb(item_id),'66666666-6666-4666-8666-666666666667');
 gold:=(r->'hero'->>'gold')::bigint+(r->'hero'->'bag'->1->>'sellValue')::bigint;
 r:=public.realm_command_v3('sell',to_jsonb(item_id),'66666666-6666-4666-8666-666666666668');
 assert r->'hero'->>'gold'=gold::text,'sale price mismatch';
 assert not has_table_privilege(current_user,'realm_private.gear_events','select'),'item audit exposed';
 assert not has_function_privilege(current_user,'realm_private.g1_item(text,integer,text,bigint,text,boolean)','execute'),'generator exposed';
 assert not has_function_privilege(current_user,'realm_private.tutorial_command(text,jsonb,uuid)','execute'),'old command exposed';
 begin perform public.realm_command('train','"strength"','66666666-6666-4666-8666-666666666669');raise exception 'old economy enabled';exception when raise_exception then if sqlerrm='old economy enabled' then raise;end if;end;
end $test$;
reset role;
do $test$ declare h jsonb;begin
 select state into h from realm_private.characters where user_id='60000000-0000-4000-8000-000000000006';
 assert (h->>'gold')::bigint=(select sum(delta) from realm_private.ledger where user_id='60000000-0000-4000-8000-000000000006' and asset='gold'),'gear ledger mismatch';
 assert (select count(*) from realm_private.gear_events where user_id='60000000-0000-4000-8000-000000000006' and kind='acquired')=1,'duplicate item audit';
 while jsonb_array_length(h->'bag')<20 loop h:=jsonb_set(h,'{bag}',(h->'bag')||jsonb_build_array(realm_private.g1_item('warrior',1,'ring',123,'fill:'||jsonb_array_length(h->'bag'))));end loop;
 h:=h||'{"strength":1000,"stamina":1000}'::jsonb;h:=jsonb_set(h,'{offers,0,lootChance}','1');
 update realm_private.characters set state=h where user_id='60000000-0000-4000-8000-000000000006';
end $test$;
set local role authenticated;
do $test$ declare r jsonb;id text;begin
 r:=public.realm_command_v3('get','null',null);id:=r->'hero'->'offers'->0->>'id';
 r:=public.realm_command_v3('quest',to_jsonb(id),'66666666-6666-4666-8666-666666666670');
 assert r->'hero'->'active'->'battle_seed' is null,'battle seed exposed';
end $test$;
reset role;
update realm_private.characters set state=jsonb_set(state,'{active,ends}','0') where user_id='60000000-0000-4000-8000-000000000006';
set local role authenticated;
do $test$ declare r jsonb;item_id text;begin
 r:=public.realm_command_v3('claim','null','66666666-6666-4666-8666-666666666671');
 assert jsonb_array_length(r->'hero'->'bag')=20,'overflow changed capacity';assert jsonb_array_length(r->'hero'->'mailbox')=1,'overflow lost loot';
 item_id:=r->'hero'->'mailbox'->0->>'id';
 begin perform public.realm_command_v3('collect',to_jsonb(item_id),'66666666-6666-4666-8666-666666666672');raise exception 'collection exceeded capacity';exception when raise_exception then if sqlerrm='collection exceeded capacity' then raise;end if;end;
 r:=public.realm_command_v3('sell','"fill:1"','66666666-6666-4666-8666-666666666673');
 r:=public.realm_command_v3('collect',to_jsonb(item_id),'66666666-6666-4666-8666-666666666674');
 assert jsonb_array_length(r->'hero'->'bag')=20 and jsonb_array_length(r->'hero'->'mailbox')=0,'collection failed';
end $test$;
select set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000007',true);
do $test$ declare r jsonb;begin
 r:=public.realm_command_v3('get','null',null);assert r->'hero'='null'::jsonb,'another account leaked';
 r:=public.realm_command_v3('create','{"name":"Other owner","faction":"alliance","job":"mage"}','77777777-7777-4777-8777-777777777770');
 begin perform public.realm_command_v3('equip','"fill:2"','77777777-7777-4777-8777-777777777771');raise exception 'foreign ownership accepted';exception when raise_exception then if sqlerrm='foreign ownership accepted' then raise;end if;end;
 r:=public.realm_command_v3('get','null',null);assert r->'hero'->>'gold'='150','foreign request changed own balance';assert jsonb_array_length(r->'hero'->'bag')=0,'foreign request copied an item';
end $test$;
reset role;
select 'gear engine and API tests passed' as result;
`;
await mkdir(new URL('../tmp/',import.meta.url),{recursive:true});await writeFile(new URL('../tmp/gear-tests.sql',import.meta.url),sql);
// Small independent batches keep connected-tool transport below output limits.
const all={items,upgrades,fighters,steps,shops},batches=[];
let current={items:[],upgrades:[],fighters:[],steps:[],shops:[]};
for(const[key,records]of Object.entries(all))for(const record of records){
 if(JSON.stringify(current).length+JSON.stringify(record).length>110000&&Object.values(current).some(a=>a.length)){batches.push(current);current={items:[],upgrades:[],fighters:[],steps:[],shops:[]};}
 current[key].push(record);
}
if(Object.values(current).some(a=>a.length))batches.push(current);
const validation=sql.slice(0,sql.indexOf('insert into auth.users'));
const names=[];
for(let i=0;i<batches.length;i++){const name=`gear-validation-${i}.sql`;names.push(name);await writeFile(new URL('../tmp/'+name,import.meta.url),validation.replace(fixtures,JSON.stringify(batches[i])));}
await writeFile(new URL('../tmp/gear-api-tests.sql',import.meta.url),sql.slice(sql.indexOf('insert into auth.users')));
await writeFile(new URL('../tmp/gear-batches.json',import.meta.url),JSON.stringify(names));
console.log(`${items.length} item fixtures, ${upgrades.length} migrations, ${fighters.length} fighters, ${shops.length} shops and ${steps.length} gear actions generated`);
console.log(`${batches.length} small SQL verification batches prepared`);
