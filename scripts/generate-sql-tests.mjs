import {mkdir,writeFile} from 'node:fs/promises';
import {createHero,settle,upgradeHero,fighter,fight,generateOffers} from '../engine.js';
const n=Date.parse('2026-11-16T10:00Z'),cases=[],snapshots=[],battles=[];
const hero=(job='warrior',level=1)=>{const h=createHero('Prueba','horde',job,n,78913);if(level!==1){h.level=level;for(const a of ['strength','dexterity','intellect','stamina'])h[a]=10+2*(level-1);h.luck=5+level-1;h.offers=generateOffers(h,h.offer_seed);}return h;};
function step(h,action,arg,time=n,seed=123){const result=settle(h,action,arg,time,seed);cases.push({h,action,arg,n:time,seed,expected:result});return result.hero;}
for(const job of ['warrior','ranger','mage']){
 for(const lv of [1,10,100,1000]){const h=hero(job,lv);snapshots.push({h,expected:fighter(h),offers:generateOffers(h,h.offer_seed)});}
 let h=hero(job);step(h,'get',null);step(h,'train','dexterity');h=step(h,'buy',0);h=step(h,'equip',0);h=step(h,'quest',h.offers[0].id);step(h,'claim',null,n+h.offers[0].duration*1000);step(hero(job),'arena',null);step(hero(job),'dungeon',null);
}
const midnight=hero();midnight.energy=2;step(midnight,'get',null,Date.parse('2026-11-16T23:00Z'));
const leveling=hero();leveling.xp=400;step(leveling,'get',null);
const old={name:'Old',faction:'alliance',job:'mage',level:3,xp:21,gold:456,energy:60,strength:14,stamina:14,luck:5,inventory:[0,1],equipped:{weapon:0},active:{id:0,ends:n+20000},dungeon:0,wins:0,log:[],updated_at:n};
step(old,'get',null);const migrated=upgradeHero(old,n,123);step(migrated,'claim',null,n+20000);
for(const a of ['warrior','ranger','mage'])for(const b of ['warrior','ranger','mage'])for(const seed of [1,42,78913,2011909847]){
 const attacker=fighter(hero(a,10)),defender=fighter(hero(b,10));battles.push({attacker,defender,seed,expected:fight(attacker,defender,seed)});
}
const fixtures=JSON.stringify({cases,snapshots,battles});
const sql=`-- Generated test data; every effect is rolled back by the caller.
do $test$ declare f jsonb:=$fixtures$${fixtures}$fixtures$::jsonb;c jsonb;r jsonb;i int:=0;begin
 for c in select value from jsonb_array_elements(f->'snapshots') loop
  assert realm_private.c1_fighter(c->'h')=c->'expected','fighter mismatch';
  assert realm_private.c1_offers(c->'h',(c->'h'->>'offer_seed')::bigint)=c->'offers','offers mismatch';
 end loop;
 for c in select value from jsonb_array_elements(f->'battles') loop
  i:=i+1;r:=realm_private.c1_fight(c->'attacker',c->'defender',(c->>'seed')::bigint);
  if r<>c->'expected' then raise exception 'Battle parity mismatch %',i;end if;
 end loop;
 i:=0;
 for c in select value from jsonb_array_elements(f->'cases') loop
  i:=i+1;r:=realm_private.c1_step(c->'h',c->>'action',c->'arg',(c->>'n')::bigint,(c->>'seed')::bigint);
  if r<>c->'expected' then raise exception 'Action parity mismatch % %',i,c->>'action';end if;
 end loop;
end $test$;

insert into auth.users(id) values('10000000-0000-4000-8000-000000000001'),('20000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $test$ declare r jsonb;repeat jsonb;id text;begin
 r:=public.realm_command('create','{"name":"Test","faction":"horde","job":"warrior"}','11111111-1111-4111-8111-111111111111');
 assert (r->'hero'->>'gold')::int=150,'initial gold';
 r:=public.realm_command('buy','0','11111111-1111-4111-8111-111111111112');
 repeat:=public.realm_command('buy','0','11111111-1111-4111-8111-111111111112');
 assert (repeat->'hero'->>'gold')::int=50,'duplicate purchase';assert repeat->>'replayed'='true','receipt missing';
 begin perform public.realm_command('buy','1','11111111-1111-4111-8111-111111111112');raise exception 'reused command accepted';exception when raise_exception then if sqlerrm='reused command accepted' then raise;end if;end;
 r:=public.realm_command('equip','0','11111111-1111-4111-8111-111111111113');
 assert r->'hero'->'equipped'->>'weapon'='0','equip failed';
 id:=r->'hero'->'offers'->0->>'id';
 r:=public.realm_command('quest',to_jsonb(id),'11111111-1111-4111-8111-111111111114');
 assert r->'hero'->'active'->'battle_seed' is null,'private seed exposed';
 assert r->'hero'->'receipts' is null,'private receipts exposed';
 begin perform public.realm_command('claim','null','11111111-1111-4111-8111-111111111115');raise exception 'early claim accepted';exception when raise_exception then if sqlerrm='early claim accepted' then raise;end if;end;
 begin perform public.realm_command('train','"gold"','11111111-1111-4111-8111-111111111116');raise exception 'invalid training accepted';exception when raise_exception then if sqlerrm='invalid training accepted' then raise;end if;end;
 begin perform public.realm_command('train','"strength"',null);raise exception 'missing request accepted';exception when raise_exception then if sqlerrm='missing request accepted' then raise;end if;end;
 assert not has_table_privilege(current_user,'realm_private.characters','select'),'private state readable';
 begin perform public.realm_action('train','strength');raise exception 'legacy economy writable';exception when raise_exception then if sqlerrm='legacy economy writable' then raise;end if;end;
end $test$;
reset role;
update realm_private.characters set state=jsonb_set(state,'{active,ends}','0') where user_id='10000000-0000-4000-8000-000000000001';
set local role authenticated;
do $test$ declare r jsonb;repeated jsonb;begin
 r:=public.realm_command('claim','null','11111111-1111-4111-8111-111111111115');
 repeated:=public.realm_command('claim','null','11111111-1111-4111-8111-111111111115');
 assert r->'hero'->'gold'=repeated->'hero'->'gold','double reward';
 assert r->'battle'=repeated->'battle','retry battle changed';
 begin perform public.realm_command('claim','null','11111111-1111-4111-8111-111111111117');raise exception 'second claim accepted';exception when raise_exception then if sqlerrm='second claim accepted' then raise;end if;end;
end $test$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
do $test$ declare r jsonb;begin r:=public.realm_command('get','null',null);assert r->'hero'='null'::jsonb,'another hero leaked';end $test$;
reset role;
do $test$ declare gold bigint;balance bigint;begin
 select (state->>'gold')::bigint into gold from realm_private.characters where user_id='10000000-0000-4000-8000-000000000001';
 select sum(delta) into balance from realm_private.ledger where user_id='10000000-0000-4000-8000-000000000001' and asset='gold';
 assert gold=balance,'ledger does not reconcile';
end $test$;
select set_config('request.jwt.claim.sub','',true);
insert into auth.users(id) values('40000000-0000-4000-8000-000000000004');
insert into public.realm_heroes(user_id,name,faction,job,level,xp,gold,energy,strength,stamina,luck,inventory,equipped,active)
 values('40000000-0000-4000-8000-000000000004','Legacy','alliance','mage',3,21,456,60,14,14,5,'[0,1]','{"weapon":0}','{"id":0,"ends":12345}');
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000004',true);
set local role authenticated;
do $test$ declare r jsonb;begin
 r:=public.realm_command('get','null',null);
 assert r->'hero'->>'gold'='456','migration lost gold';
 assert r->'hero'->>'xp'='21','migration lost experience';
 assert r->'hero'->'inventory'='[0,1]'::jsonb,'migration lost items';
 assert r->'hero'->'active'->>'ends'='12345','migration lost mission';
 assert r->'hero'->>'dexterity'='14','migration missing attribute';
 begin perform public.realm_command('create','{"name":"Other","faction":"horde","job":"warrior"}','44444444-4444-4444-8444-444444444444');raise exception 'duplicate character accepted';exception when raise_exception then if sqlerrm='duplicate character accepted' then raise;end if;end;
end $test$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $test$ begin assert not has_function_privilege(current_user,'public.realm_command(text,jsonb,uuid)','execute'),'anonymous command callable';end $test$;
reset role;
select 'classic SQL tests passed' as result;
`;
await mkdir(new URL('../tmp/',import.meta.url),{recursive:true});
await writeFile(new URL('../tmp/classic-tests.sql',import.meta.url),sql);
console.log(`${snapshots.length} fighter/offer fixtures, ${battles.length} battles, ${cases.length} action cases and API security tests generated`);
