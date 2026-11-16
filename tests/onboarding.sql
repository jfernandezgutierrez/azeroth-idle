-- Run after core fixtures in a transaction or in the ephemeral CI database.
insert into auth.users(id) values('50000000-0000-4000-8000-000000000005');
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000005',true);
set local role authenticated;
do $test$ declare r jsonb;id text;begin
 r:=public.realm_command('create','{"name":"Guide","faction":"alliance","job":"mage"}','55555555-5555-4555-8555-555555555550');
 assert r->'hero'->'tutorial'->>'started'='false','tutorial init';
 r:=public.realm_command('train','"luck"','55555555-5555-4555-8555-555555555551');
 assert r->'hero'->'tutorial'->>'improved'='false','early upgrade completed tutorial';
 id:=r->'hero'->'offers'->0->>'id';
 r:=public.realm_command('quest',to_jsonb(id),'55555555-5555-4555-8555-555555555552');
 assert r->'hero'->'tutorial'->>'started'='true','mission did not advance tutorial';
 assert not has_function_privilege(current_user,'realm_private.classic_command(text,jsonb,uuid)','execute'),'private base exposed';
end $test$;
reset role;
update realm_private.characters set state=jsonb_set(state,'{active,ends}','0') where user_id='50000000-0000-4000-8000-000000000005';
set local role authenticated;
do $test$ declare r jsonb;gold jsonb;begin
 r:=public.realm_command('claim','null','55555555-5555-4555-8555-555555555553');
 assert r->'hero'->'tutorial'->>'claimed'='true','claim did not advance tutorial';
 r:=public.realm_command('train','"luck"','55555555-5555-4555-8555-555555555551');
 assert r->'hero'->'tutorial'->>'improved'='false','stale replay advanced tutorial';
 r:=public.realm_command('train','"luck"','55555555-5555-4555-8555-555555555554');
 assert r->'hero'->'tutorial'->>'improved'='true','improvement did not advance tutorial';
 gold:=r->'hero'->'gold';
 r:=public.realm_command('tutorial_dismiss','null','55555555-5555-4555-8555-555555555555');
 r:=public.realm_command('get','null',null);
 assert r->'hero'->'tutorial'->>'dismissed'='true','dismissal not persisted';
 r:=public.realm_command('tutorial_restart','null','55555555-5555-4555-8555-555555555556');
 assert r->'hero'->'tutorial'->>'started'='false','restart failed';
 r:=public.realm_command('tutorial_dismiss','null','55555555-5555-4555-8555-555555555555');
 assert r->'hero'->'tutorial'->>'dismissed'='false','stale dismissal undid restart';
 assert r->'hero'->'gold'=gold,'tutorial changed economic state';
end $test$;
reset role;
select 'persistent tutorial tests passed' as result;
