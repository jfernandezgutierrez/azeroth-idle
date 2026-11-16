-- Generated gear-1 catalog and engine. Apply after classic_v1 and onboarding_v1.
begin;
create table if not exists realm_private.gear_backup(
 user_id uuid primary key references auth.users(id) on delete cascade,state jsonb not null,captured_at timestamptz not null default now()
);
create table if not exists realm_private.gear_events(
 id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,item_id text not null,kind text not null,detail jsonb not null,created_at timestamptz not null default now(),
 unique(user_id,request_id,item_id,kind)
);
create index if not exists gear_events_owner_time on realm_private.gear_events(user_id,created_at);
alter table realm_private.gear_backup enable row level security;
alter table realm_private.gear_events enable row level security;
revoke all on realm_private.gear_backup,realm_private.gear_events from public,anon,authenticated;
do $policies$ declare t text;begin foreach t in array array['gear_backup','gear_events'] loop
 if not exists(select 1 from pg_catalog.pg_policies p where p.schemaname='realm_private' and p.tablename=t and p.policyname='no_direct_player_access') then
  execute format('create policy no_direct_player_access on realm_private.%I for all to anon,authenticated using(false) with check(false)',t);
 end if;
end loop;end $policies$;
insert into realm_private.gear_backup(user_id,state) select user_id,state from realm_private.characters where state->>'gear_schema' is distinct from '1' on conflict do nothing;

create or replace function realm_private.g1_catalog() returns jsonb language sql immutable security invoker set search_path='' as $$select __GEAR_CATALOG__::jsonb$$;

create or replace function realm_private.g1_item(job text,lv int,slot text,seed bigint,item_id text,force_common boolean default false) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare c jsonb:=realm_private.g1_catalog();s bigint:=seed;roll double precision;r jsonb;templates jsonb;t jsonb;suffix text;
 budget bigint;armor bigint;pool bigint;main bigint;stamina bigint;price bigint;primary_attr text;
begin
 if lv<1 or lv>100000 or job not in('warrior','ranger','mage') or not(c->'slots')?slot or coalesce(item_id,'')='' then raise exception 'Parámetros de objeto inválidos.';end if;
 s:=realm_private.c1_next(s);roll:=s::double precision/2147483647;
 if force_common then r:=c->'rarities'->0;else select x into r from jsonb_array_elements(c->'rarities') x where roll<(x->>'threshold')::double precision order by (x->>'threshold')::double precision limit 1;end if;
 select coalesce(jsonb_agg(x order by ord),'[]') into templates from jsonb_array_elements(c->'templates') with ordinality e(x,ord) where x->>'slot'=slot and x->>'job' in('any',job);
 if jsonb_array_length(templates)=0 then raise exception 'Esta clase no puede usar ese objeto.';end if;
 s:=realm_private.c1_next(s);t:=templates->floor(s::double precision/2147483647*jsonb_array_length(templates))::int;
 s:=realm_private.c1_next(s);suffix:=c->'suffixes'->>floor(s::double precision/2147483647*jsonb_array_length(c->'suffixes'))::int;
 budget:=greatest(2,floor((4+lv*2)*(r->>'multiplier')::double precision+.5));
 armor:=floor(budget*(case when slot='armor' then .4 when slot in('helm','gloves','boots','belt','offhand') then .2 else 0 end)::double precision+.5);
 pool:=budget-armor;main:=floor(pool*(case when slot='weapon' then .65 else .4 end)::double precision);stamina:=floor(pool*(case when slot='weapon' then .25 else .5 end)::double precision);
 primary_attr:=realm_private.c1_catalog()->'jobs'->job->>'primary';
 price:=floor((30+lv*15)*(r->>'cost')::double precision*(case when slot='weapon' then 1.2 else 1 end)::double precision+.5);
 return jsonb_build_object('id',item_id,'version','gear-1','template',t->'id','name',(t->>'name')||' '||suffix,'slot',slot,'job',t->'job','level',lv,'rarity',r->'id','icon',t->'icon','budget',budget,'stats',jsonb_build_object(primary_attr,main,'stamina',stamina,'luck',pool-main-stamina),'armor',armor,'legacy_defense',0,'price',price,'sellValue',price/4,'favorite',false);
end$$;

create or replace function realm_private.g1_shop(h jsonb,n bigint,seed bigint,revision int default 0) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare c jsonb:=realm_private.g1_catalog();s bigint:=seed;pool jsonb;selected jsonb:='["weapon","armor","helm"]';idx int;item_seed bigint;id text;offers jsonb:='[]';day text:=to_char(to_timestamp(n/1000.0) at time zone 'Europe/Madrid','YYYY-MM-DD');
begin
 select jsonb_agg(x order by ord) into pool from jsonb_array_elements(c->'slotOrder') with ordinality e(x,ord) where x#>>'{}' not in('weapon','armor','helm') and (x#>>'{}'<>'offhand' or h->>'job'='warrior');
 while jsonb_array_length(selected)<6 loop
  s:=realm_private.c1_next(s);idx:=floor(s::double precision/2147483647*jsonb_array_length(pool));selected:=selected||jsonb_build_array(pool->idx);pool:=pool-idx;
 end loop;
 for i in 0..5 loop
  s:=realm_private.c1_next(s);item_seed:=floor(s::double precision/2147483647*2147483646)+1;id:='shop:'||day||':'||revision||':'||seed||':'||i;
  offers:=offers||jsonb_build_array(jsonb_build_object('id',id,'sold',false,'item',realm_private.g1_item(h->>'job',(h->>'level')::int,selected->>i,item_seed,id,i=0)));
 end loop;
 return jsonb_build_object('day',day,'revision',revision,'seed',seed,'level',h->'level','offers',offers);
end$$;

create or replace function realm_private.g1_upgrade(h jsonb,n bigint,seed bigint) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare old jsonb;id jsonb;bag jsonb:='[]';loadout jsonb:='{}';pair record;seen jsonb:='[]';stats jsonb;primary_attr text;
 day text:=to_char(to_timestamp(n/1000.0) at time zone 'Europe/Madrid','YYYY-MM-DD');
begin
 h:=realm_private.c1_upgrade(h,n,seed);
 if h?'gear_schema' and h->>'gear_schema' is distinct from '1' then raise exception 'Versión de equipo desconocida.';end if;
 if not h?'gear_schema' then
  primary_attr:=realm_private.c1_catalog()->'jobs'->(h->>'job')->>'primary';
  for id in select value from jsonb_array_elements(h->'inventory') loop
   select x into old from jsonb_array_elements(realm_private.c1_catalog()->'items') x where x->'id'=id;
   if old is null or seen@>jsonb_build_array(id) then raise exception 'El inventario antiguo necesita revisión.';end if;seen:=seen||jsonb_build_array(id);
   stats:=case when old->>'slot'='weapon' then jsonb_build_object(primary_attr,old->'power') when old->>'slot'='helm' then jsonb_build_object('stamina',old->'power') else '{}'::jsonb end;
   bag:=bag||jsonb_build_array(jsonb_build_object('id','legacy:'||(id#>>'{}'),'version','gear-1','template','legacy-'||(id#>>'{}'),'name',old->'name','slot',old->'slot','job','any','level',1,'rarity','common','icon',('[0,4,2,3]'::jsonb)->(id#>>'{}')::int,'budget',old->'power','stats',stats,'armor',0,'legacy_defense',case when old->>'slot'='armor' then (old->>'power')::int else 0 end,'price',old->'cost','sellValue',(old->>'cost')::int/4,'favorite',false));
  end loop;
  for pair in select * from jsonb_each(h->'equipped') loop
   if not seen@>jsonb_build_array(pair.value) then raise exception 'El equipo antiguo necesita revisión.';end if;
   loadout:=loadout||jsonb_build_object(pair.key,'legacy:'||(pair.value#>>'{}'));
  end loop;
  if h->>'job'='warrior' then
   bag:=bag||'[{"id":"starter:shield","version":"gear-1","template":"starter-shield","name":"Broquel de iniciación","slot":"offhand","job":"warrior","level":1,"rarity":"common","icon":11,"budget":0,"stats":{},"armor":0,"legacy_defense":0,"price":0,"sellValue":0,"favorite":true}]'::jsonb;
   loadout:=loadout||'{"offhand":"starter:shield"}'::jsonb;
  end if;
  h:=h||jsonb_build_object('bag',bag,'loadout',loadout,'mailbox','[]'::jsonb,'loot_serial',0,'gear_schema',1,'equipment_version','gear-1','shop',realm_private.g1_shop(h,n,seed));
 end if;
 if day>h->'shop'->>'day' then h:=jsonb_set(h,'{shop}',realm_private.g1_shop(h,n,seed));end if;
 return h;
end$$;

create or replace function realm_private.g1_fighter(h jsonb) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare adjusted jsonb:=h||'{"equipped":{}}'::jsonb;pair record;stat record;item jsonb;armor bigint:=0;legacy bigint:=0;f jsonb;j jsonb;
begin
 if not h?'gear_schema' then return realm_private.c1_fighter(h);end if;
 for pair in select * from jsonb_each(h->'loadout') loop
  select x into item from jsonb_array_elements(h->'bag') x where x->'id'=pair.value;
  if item is null or item->>'slot'<>pair.key or item->>'job' not in('any',h->>'job') or (item->>'level')::int>(h->>'level')::int then raise exception 'El equipo no es válido.';end if;
  for stat in select * from jsonb_each(item->'stats') loop
   if stat.key in('strength','dexterity','intellect','stamina','luck') then adjusted:=jsonb_set(adjusted,array[stat.key],to_jsonb((adjusted->>stat.key)::bigint+(stat.value#>>'{}')::bigint));end if;
  end loop;
  armor:=armor+(item->>'armor')::bigint;legacy:=legacy+(item->>'legacy_defense')::bigint;
 end loop;
 f:=realm_private.c1_fighter(adjusted);j:=realm_private.c1_catalog()->'jobs'->(h->>'job');
 return f||jsonb_build_object('armor',least((j->>'armorCap')::double precision,(j->>'armor')::double precision+legacy*.015::double precision+armor::double precision/(20+(h->>'level')::int*20)),
 'block',case when h->>'job'='warrior' and (h->'loadout')?'offhand' then (j->>'block')::double precision else 0 end);
end$$;

create or replace function realm_private.g1_step(h jsonb,action text,arg jsonb,n bigint,seed bigint) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare result jsonb;a jsonb;q jsonb;item jsonb;offer jsonb;battle jsonb:=null;msg text:='';v text:=arg#>>'{}';
 oldlog jsonb;list jsonb;equipped boolean;available jsonb;s bigint;idx int;item_seed bigint;slot text;destination text;
 cost bigint;gold bigint;xp bigint;lv int;won boolean;t jsonb;enemy jsonb;
begin
 h:=realm_private.g1_upgrade(h,n,seed);
 if action in('quest','claim','train','get','refresh') then
  a:=h->'active';
  if action='quest' and jsonb_array_length(h->'bag')>=20 and jsonb_array_length(h->'mailbox')>=50 then raise exception 'Haz sitio en tu mochila o bandeja antes de partir.';end if;
  if action='claim' and a<>'null'::jsonb then h:=jsonb_set(h,'{active,quest,lootChance}','0');end if;
  result:=realm_private.c1_step(h,action,arg,n,seed);h:=result->'hero';msg:=result->>'message';battle:=nullif(result->'battle','null'::jsonb);
  if action='quest' then h:=jsonb_set(h,'{active,player}',realm_private.g1_fighter(h));h:=jsonb_set(h,'{active,gear_version}','"gear-1"');end if;
  if action='claim' and battle->>'winner'='0' and realm_private.c1_next(realm_private.c1_next((a->>'battle_seed')::bigint))::double precision/2147483647<(a->'quest'->>'lootChance')::double precision then
   s:=realm_private.c1_next(realm_private.c1_next((a->>'battle_seed')::bigint));
   select jsonb_agg(x order by ord) into available from jsonb_array_elements(realm_private.g1_catalog()->'slotOrder') with ordinality e(x,ord) where x#>>'{}'<>'offhand' or h->>'job'='warrior';
   s:=realm_private.c1_next(s);idx:=floor(s::double precision/2147483647*jsonb_array_length(available));slot:=available->>idx;
   s:=realm_private.c1_next(s);item_seed:=floor(s::double precision/2147483647*2147483646)+1;
   h:=jsonb_set(h,'{loot_serial}',to_jsonb((h->>'loot_serial')::bigint+1));
   item:=realm_private.g1_item(h->>'job',(a->'player'->>'level')::int,slot,item_seed,'loot:'||(h->>'loot_serial')||':'||(a->>'battle_seed'));
   if exists(select 1 from jsonb_array_elements((h->'bag')||(h->'mailbox')) x where x->>'id'=item->>'id') then raise exception 'El objeto ya está registrado.';end if;
   if jsonb_array_length(h->'bag')<20 then h:=jsonb_set(h,'{bag}',(h->'bag')||jsonb_build_array(item));destination:='mochila';
   elsif jsonb_array_length(h->'mailbox')<50 then h:=jsonb_set(h,'{mailbox}',(h->'mailbox')||jsonb_build_array(item));destination:='bandeja';
   else raise exception 'La bandeja está llena. Vende o recoge objetos antes de cobrar.';end if;
   msg:=msg||' · Botín: '||(item->>'name')||case when destination='bandeja' then ' (en bandeja)' else '' end;h:=jsonb_set(h,'{log,0}',to_jsonb(msg));
  end if;
 else
  result:=realm_private.c1_step(h,'get','null',n,seed);h:=result->'hero';oldlog:=h->'log';
  if action='buy' then
   select x into offer from jsonb_array_elements(h->'shop'->'offers') x where x->>'id'=v;
   if offer is null or offer->>'sold'='true' then raise exception 'La oferta ya no está disponible.';end if;item:=offer->'item';
   if jsonb_array_length(h->'bag')>=20 then raise exception 'Tu mochila está llena.';end if;
   cost:=(item->>'price')::bigint;if (h->>'gold')::bigint<cost then raise exception 'No tienes suficiente oro.';end if;
   if exists(select 1 from jsonb_array_elements(h->'bag') x where x->>'id'=item->>'id') then raise exception 'Ese objeto ya está en tu mochila.';end if;
   h:=h||jsonb_build_object('gold',(h->>'gold')::bigint-cost,'bag',(h->'bag')||jsonb_build_array(item));
   select jsonb_agg(case when x->>'id'=v then x||'{"sold":true}'::jsonb else x end order by ord) into list from jsonb_array_elements(h->'shop'->'offers') with ordinality e(x,ord);
   h:=jsonb_set(h,'{shop,offers}',list);msg:='Has comprado '||(item->>'name')||'.';
  elsif action in('equip','unequip','sell','favorite','collect') then
   if jsonb_typeof(arg) is distinct from 'string' then raise exception 'Identificador de objeto inválido.';end if;
   select x into item from jsonb_array_elements(h->(case when action='collect' then 'mailbox' else 'bag' end)) x where x->>'id'=v;
   if item is null then raise exception 'No tienes ese objeto.';end if;
   equipped:=exists(select 1 from jsonb_each(h->'loadout') e where e.value=to_jsonb(v));
   if action='equip' then
    if (item->>'level')::int>(h->>'level')::int or item->>'job' not in('any',h->>'job') then raise exception 'No puedes equipar ese objeto.';end if;
    h:=jsonb_set(h,array['loadout',item->>'slot'],to_jsonb(v));msg:='Equipo actualizado.';
   elsif action='unequip' then
    if not equipped then raise exception 'Ese objeto no está equipado.';end if;h:=jsonb_set(h,'{loadout}',(h->'loadout')-(item->>'slot'));msg:='Objeto retirado del equipo.';
   elsif action='favorite' then
    select jsonb_agg(case when x->>'id'=v then jsonb_set(x,'{favorite}',to_jsonb(not (x->>'favorite')::boolean)) else x end order by ord) into list from jsonb_array_elements(h->'bag') with ordinality e(x,ord);
    h:=jsonb_set(h,'{bag}',list);msg:=case when item->>'favorite'='false' then 'Objeto protegido como favorito.' else 'Protección de favorito desactivada.' end;
   elsif action='sell' then
    if equipped or item->>'favorite'='true' or (item->>'sellValue')::bigint<=0 then raise exception 'Retira y desbloquea el objeto antes de venderlo.';end if;
    select coalesce(jsonb_agg(x order by ord),'[]') into list from jsonb_array_elements(h->'bag') with ordinality e(x,ord) where x->>'id'<>v;
    h:=h||jsonb_build_object('gold',(h->>'gold')::bigint+(item->>'sellValue')::bigint,'bag',list);msg:='Has vendido '||(item->>'name')||' por '||(item->>'sellValue')||' oro.';
   else
    if jsonb_array_length(h->'bag')>=20 then raise exception 'Tu mochila está llena.';end if;
    select coalesce(jsonb_agg(x order by ord),'[]') into list from jsonb_array_elements(h->'mailbox') with ordinality e(x,ord) where x->>'id'<>v;
    h:=h||jsonb_build_object('mailbox',list,'bag',(h->'bag')||jsonb_build_array(item));msg:='Objeto recogido en tu mochila.';
   end if;
  elsif action='shop_refresh' then
   if arg is not null and arg<>'null'::jsonb then raise exception 'Esta acción no admite parámetros.';end if;
   if (h->'shop'->>'revision')::int>=10 then raise exception 'Has alcanzado el límite diario de renovaciones.';end if;
   cost:=25+(h->>'level')::int*10+(h->'shop'->>'revision')::int*15;
   if (h->>'gold')::bigint<cost then raise exception 'No tienes suficiente oro.';end if;
   h:=h||jsonb_build_object('gold',(h->>'gold')::bigint-cost,'shop',realm_private.g1_shop(h,n,seed,(h->'shop'->>'revision')::int+1));msg:='La armería tiene nuevas existencias.';
  elsif action in('arena','dungeon') then
   if n<(h->'cooldowns'->>action)::bigint then raise exception 'Debes esperar antes del siguiente combate.';end if;
   if action='dungeon' then lv:=2+(h->>'dungeon')::int*2;idx:=(h->>'dungeon')::int%3;gold:=80+(h->>'dungeon')::int*20;xp:=60+(h->>'dungeon')::int*10;
   else lv:=(h->>'level')::int;idx:=(h->>'wins')::int%3;gold:=25+lv*5;xp:=15+lv*3;end if;
   enemy:=realm_private.c1_enemy(lv,idx,.85,case when action='dungeon' then 'Guardián del umbral' else 'Retador de entrenamiento' end);
   battle:=realm_private.c1_fight(realm_private.g1_fighter(h),enemy,seed);won:=battle->>'winner'='0';
   h:=jsonb_set(h,array['cooldowns',action],to_jsonb(n+case when action='arena' then 600000 else 3600000 end));
   if won then
    v:=case when action='dungeon' then 'dungeon' else 'wins' end;
    h:=h||jsonb_build_object('gold',(h->>'gold')::bigint+gold,'xp',(h->>'xp')::bigint+xp,v,(h->>v)::int+1);msg:='¡Victoria! +'||gold||' oro · +'||xp||' EXP';
   else msg:='Derrota. Revisa el registro y mejora tu equipo.';end if;
   result:=realm_private.c1_step(h,'get','null',n,seed);h:=result->'hero';msg:=msg||(result->>'message');h:=jsonb_set(h,'{last_battle}',battle);
  elsif action in('tutorial_dismiss','tutorial_restart') then
   if arg is not null and arg<>'null'::jsonb then raise exception 'Esta acción no admite parámetros.';end if;
   msg:=case when action='tutorial_dismiss' then 'Puedes volver a mostrar la guía desde Cómo jugar.' else 'Tu guía vuelve a estar disponible.' end;
  else raise exception 'Acción desconocida.';
  end if;
  select jsonb_agg(value order by ord) into list from(select value,ord from jsonb_array_elements(jsonb_build_array(msg)||oldlog) with ordinality e(value,ord) order by ord limit 12)t;
  h:=jsonb_set(h,'{log}',list);
 end if;
 t:='{"started":false,"claimed":false,"improved":false,"dismissed":false}'::jsonb||coalesce(h->'tutorial','{}');
 if action='quest' then t:=t||'{"started":true}'::jsonb;end if;
 if action='claim' then t:=t||'{"started":true,"claimed":true}'::jsonb;end if;
 if action in('train','equip') and t->>'claimed'='true' then t:=t||'{"improved":true}'::jsonb;end if;
 if action='tutorial_dismiss' then t:=t||'{"dismissed":true}'::jsonb;end if;
 if action='tutorial_restart' then t:='{"started":false,"claimed":false,"improved":false,"dismissed":false}';end if;
 h:=h||jsonb_build_object('tutorial',t,'updated_at',n);
 return jsonb_build_object('hero',h,'message',msg,'battle',battle,'server_time',n,'rules_version','classic-1','equipment_version','gear-1');
end$$;

create or replace function realm_private.g1_view(h jsonb) returns jsonb language sql immutable security invoker set search_path='' as $$select realm_private.c1_view(h)#-'{shop,seed}'$$;

create or replace function realm_private.gear_command(action text,arg jsonb,request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();h jsonb;before jsonb;result jsonb;receipt realm_private.commands;legacy public.realm_heroes;created boolean:=false;
 n bigint;seed bigint:=(('x'||substr(replace(gen_random_uuid()::text,'-',''),1,8))::bit(32)::bigint%2147483646)+1;event_id uuid:=coalesce(request_id,gen_random_uuid());
 item jsonb;old_item jsonb;event_kind text;
begin
 if uid is null then raise exception 'Necesitas entrar con tu cuenta.';end if;
 if action is null or length(coalesce(arg::text,''))>4096 then raise exception 'Acción inválida.';end if;
 if action not in('get','refresh') and request_id is null then raise exception 'Falta el identificador de la acción.';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));n:=floor(extract(epoch from clock_timestamp())*1000);
 select state into h from realm_private.characters where user_id=uid for update;
 if h is null then
  select * into legacy from public.realm_heroes where user_id=uid for update;
  if found then h:=realm_private.c1_upgrade(to_jsonb(legacy)-'user_id',n,seed);
  elsif action='create' then
   created:=true;
   if arg->>'name' is null or length(trim(arg->>'name')) not between 1 and 24 or coalesce(arg->>'faction','') not in('horde','alliance') or coalesce(arg->>'job','') not in('warrior','ranger','mage') then raise exception 'Revisa los datos de tu héroe.';end if;
   h:=realm_private.c1_upgrade(jsonb_build_object('name',trim(arg->>'name'),'faction',arg->>'faction','job',arg->>'job','level',1,'xp',0,'gold',150,'energy',100,'strength',10,'stamina',10,'luck',5,'inventory','[]'::jsonb,'equipped','{}'::jsonb,'active',null,'dungeon',0,'wins',0,'updated_at',n,'log','[]'::jsonb),n,seed);
  elsif action in('get','refresh') then return jsonb_build_object('hero',null,'server_time',n,'rules_version','classic-1','equipment_version','gear-1');
  else raise exception 'Primero crea un héroe.';end if;
  insert into realm_private.characters(user_id,state) values(uid,h);
  insert into realm_private.ledger(user_id,request_id,asset,delta,balance,reason)
  select uid,event_id,asset,(h->>key)::bigint,(h->>key)::bigint,case when created then 'create' else 'migration' end from(values('gold','gold'),('adventure','energy'))v(asset,key);
 end if;
 if h->>'gear_schema' is distinct from '1' then
  insert into realm_private.gear_backup(user_id,state) values(uid,h) on conflict do nothing;
  h:=realm_private.g1_upgrade(h,n,seed);
  insert into realm_private.gear_events(user_id,request_id,item_id,kind,detail)
  select uid,event_id,x->>'id','migration',x from jsonb_array_elements(h->'bag') x;
  update realm_private.characters set state=h,updated_at=now() where user_id=uid;
 end if;
 -- Day transitions are reconciled before receipt replay, as in the local engine.
 before:=realm_private.g1_upgrade(h,n,seed);
 if before is distinct from h then h:=before;update realm_private.characters set state=h,updated_at=now() where user_id=uid;end if;
 if request_id is not null then
  select * into receipt from realm_private.commands c where c.user_id=uid and c.request_id=gear_command.request_id;
  if found then
   if receipt.action<>action or receipt.argument is distinct from arg then raise exception 'Identificador de acción reutilizado con otros datos.';end if;
   return receipt.result||jsonb_build_object('hero',realm_private.g1_view(h),'server_time',n,'equipment_version','gear-1','replayed',true);
  end if;
 end if;
 if action='create' and not created then raise exception 'Ya tienes un héroe.';end if;
 before:=h;result:=realm_private.g1_step(h,case when action='create' then 'get' else action end,arg,n,seed);h:=result->'hero';
 update realm_private.characters set state=h,updated_at=now() where user_id=uid;
 if request_id is not null then insert into realm_private.commands(user_id,request_id,action,argument,result) values(uid,request_id,action,arg,result-'hero');end if;
 insert into realm_private.ledger(user_id,request_id,asset,delta,balance,reason)
 select uid,event_id,asset,(h->>key)::bigint-(before->>key)::bigint,(h->>key)::bigint,action from(values('gold','gold'),('adventure','energy'))v(asset,key) where (h->>key)::bigint<>(before->>key)::bigint;
 if action in('buy','claim') then
  insert into realm_private.gear_events(user_id,request_id,item_id,kind,detail)
  select uid,event_id,x->>'id','acquired',x from jsonb_array_elements((h->'bag')||(h->'mailbox')) x where not exists(select 1 from jsonb_array_elements((before->'bag')||(before->'mailbox')) y where y->'id'=x->'id');
 elsif action in('equip','unequip','sell','favorite','collect') then
  select x into item from jsonb_array_elements((h->'bag')||(h->'mailbox')||(before->'bag')||(before->'mailbox')) x where x->'id'=arg limit 1;
  insert into realm_private.gear_events(user_id,request_id,item_id,kind,detail) values(uid,event_id,item->>'id',action,item);
 end if;
 return result||jsonb_build_object('hero',realm_private.g1_view(h));
end$$;

create or replace function public.realm_command_v3(action text,arg jsonb default null,request_id uuid default null) returns jsonb language sql security invoker set search_path='' as $$select realm_private.gear_command(action,arg,request_id)$$;
revoke all on function public.realm_command_v3(text,jsonb,uuid) from public,anon;
grant execute on function public.realm_command_v3(text,jsonb,uuid) to authenticated;
create or replace function public.realm_command(action text,arg jsonb default null,request_id uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$begin raise exception 'El inventario se ha actualizado. Recarga la página para continuar.';end$$;
revoke all on function realm_private.tutorial_command(text,jsonb,uuid),realm_private.classic_command(text,jsonb,uuid) from public,anon,authenticated;
revoke all on function realm_private.g1_catalog(),realm_private.g1_item(text,int,text,bigint,text,boolean),realm_private.g1_shop(jsonb,bigint,bigint,int),realm_private.g1_upgrade(jsonb,bigint,bigint),realm_private.g1_fighter(jsonb),realm_private.g1_step(jsonb,text,jsonb,bigint,bigint),realm_private.g1_view(jsonb),realm_private.gear_command(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function realm_private.gear_command(text,jsonb,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
