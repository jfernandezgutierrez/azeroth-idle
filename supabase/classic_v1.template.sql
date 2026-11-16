-- Generated from game/rules.js and game/adventure.js. Compile with scripts/build-sql.mjs.
-- Additive upgrade; old characters are preserved and copied lazily.
begin;
create table if not exists realm_private.characters (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null, updated_at timestamptz not null default now()
);
create table if not exists realm_private.commands (
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, action text not null, argument jsonb,
 result jsonb not null, created_at timestamptz not null default now(),
 primary key(user_id,request_id)
);
create table if not exists realm_private.ledger (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, asset text not null check(asset in ('gold','adventure')),
 delta bigint not null, balance bigint not null check(balance>=0),
 reason text not null, created_at timestamptz not null default now(),
 unique(user_id,request_id,asset)
);
create index if not exists ledger_user_time on realm_private.ledger(user_id,created_at);
create table if not exists realm_private.legacy_snapshot (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null, captured_at timestamptz not null default now()
);
insert into realm_private.legacy_snapshot(user_id,state)
 select user_id,to_jsonb(h)-'user_id' from public.realm_heroes h on conflict do nothing;
alter table realm_private.characters enable row level security;
alter table realm_private.commands enable row level security;
alter table realm_private.ledger enable row level security;
alter table realm_private.legacy_snapshot enable row level security;
revoke all on realm_private.characters,realm_private.commands,realm_private.ledger,realm_private.legacy_snapshot from public,anon,authenticated;
do $policies$ declare table_name text;begin
 foreach table_name in array array['characters','commands','ledger','legacy_snapshot'] loop
  if not exists(select 1 from pg_catalog.pg_policies p where p.schemaname='realm_private' and p.tablename=table_name and p.policyname='no_direct_player_access') then
   execute format('create policy no_direct_player_access on realm_private.%I for all to anon,authenticated using(false) with check(false)',table_name);
  end if;
 end loop;
end $policies$;

create or replace function realm_private.c1_catalog() returns jsonb
language sql immutable security invoker set search_path='' as $$select __CATALOG__::jsonb$$;

create or replace function realm_private.c1_next(s bigint) returns bigint
language sql immutable security invoker set search_path='' as $$select (s*48271)%2147483647$$;

create or replace function realm_private.c1_fighter(h jsonb) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare c jsonb:=realm_private.c1_catalog(); j jsonb; stats jsonb; pair record; item jsonb;
 defense double precision:=0; b double precision; primary_attr text; value double precision; lv int:=(h->>'level')::int;
begin
 j:=c->'jobs'->(h->>'job');primary_attr:=j->>'primary';
 stats:=jsonb_build_object('strength',(h->>'strength')::bigint,'dexterity',(h->>'dexterity')::bigint,'intellect',(h->>'intellect')::bigint,'stamina',(h->>'stamina')::bigint,'luck',(h->>'luck')::bigint);
 for pair in select * from jsonb_each(coalesce(h->'equipped','{}')) loop
  select x into item from jsonb_array_elements(c->'items') x where x->'id'=pair.value;
  if item is null or item->>'slot'<>pair.key then continue;end if;
  value:=(item->>'power')::double precision;
  if pair.key='weapon' then stats:=jsonb_set(stats,array[primary_attr],to_jsonb((stats->>primary_attr)::bigint+value::bigint));
  elsif pair.key='helm' then stats:=jsonb_set(stats,'{stamina}',to_jsonb((stats->>'stamina')::bigint+value::bigint));
  else defense:=defense+value;end if;
 end loop;
 b:=(4+lv*2)*(1+(stats->>primary_attr)::double precision/10)*(j->>'damage')::double precision;
 return jsonb_build_object('name',h->>'name','job',h->>'job','level',lv,'stats',stats,'primary',primary_attr,
  'hp',greatest(1,floor((stats->>'stamina')::double precision*(lv+1)*(j->>'health')::double precision)),
  'min',greatest(1,floor(b*.85)),'max',greatest(1,floor(b*1.15)),
  'armor',least((j->>'armorCap')::double precision,(j->>'armor')::double precision+defense*.015),
  'block',j->'block','evade',j->'evade');
end$$;

create or replace function realm_private.c1_enemy(lv int,idx int,difficulty double precision,label text) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare v bigint:=greatest(1,floor((10+2*(lv-1))*difficulty));job text:=(array['warrior','ranger','mage'])[idx%3+1];
begin return realm_private.c1_fighter(jsonb_build_object('name',label,'job',job,'level',lv,'strength',v,'dexterity',v,'intellect',v,'stamina',v,'luck',greatest(1,v/2),'equipped','{}'::jsonb));end$$;

create or replace function realm_private.c1_fight(a0 jsonb,b0 jsonb,seed bigint) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare s bigint:=seed; actor int; a jsonb; d jsonb; sides jsonb[]:=array[a0,b0];
 hp bigint[]:=array[(a0->>'hp')::bigint,(b0->>'hp')::bigint];turns jsonb:='[]';
 spread double precision; cr double precision; dr double precision; critical boolean;magic boolean; defense text; raw bigint;damage bigint;resistance double precision;
begin
 if seed<1 or seed>=2147483647 then raise exception 'Semilla inválida.';end if;
 s:=realm_private.c1_next(s);actor:=case when s::double precision/2147483647<.5 then 0 else 1 end;
 for i in 0..199 loop
  exit when hp[1]<=0 or hp[2]<=0;
  a:=sides[actor+1];d:=sides[2-actor];
  s:=realm_private.c1_next(s);spread:=s::double precision/2147483647;
  s:=realm_private.c1_next(s);cr:=s::double precision/2147483647;
  s:=realm_private.c1_next(s);dr:=s::double precision/2147483647;
  critical:=cr<least(.5,(a->'stats'->>'luck')::double precision*2.5/(greatest(1,(d->>'level')::int)*100));magic:=a->>'job'='mage';
  defense:=case when magic then 'none' when dr<(d->>'block')::double precision then 'block' when dr<(d->>'block')::double precision+(d->>'evade')::double precision then 'evade' else 'none' end;
  raw:=floor(((a->>'min')::double precision+floor(spread*((a->>'max')::double precision-(a->>'min')::double precision+1)))*(1+floor(i/2.0)*.08::double precision)*(case when critical then 2 else 1 end));
  resistance:=least(.2,(d->'stats'->>(a->>'primary'))::double precision/((a->'stats'->>(a->>'primary'))::double precision+(d->'stats'->>(a->>'primary'))::double precision+10)*.15);
  damage:=case when defense='none' then greatest(1,floor(raw*(1-case when magic then 0 else (d->>'armor')::double precision end)*(1-resistance))) else 0 end;
  hp[2-actor]:=greatest(0,hp[2-actor]-damage);
  turns:=turns||jsonb_build_array(jsonb_build_object('turn',i+1,'actor',actor,'critical',critical,'defense',defense,'raw',raw,'damage',damage,'hp',to_jsonb(hp)));
  actor:=1-actor;
 end loop;
 return jsonb_build_object('version','classic-1','seed',seed,'attacker',a0,'defender',b0,'winner',case when hp[2]=0 then 0 else 1 end,'timeout',hp[1]>0 and hp[2]>0,'turns',turns);
end$$;

create or replace function realm_private.c1_offers(h jsonb,seed bigint) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare c jsonb:=realm_private.c1_catalog()->'adventure';s bigint:=seed;base int; zi int;ei int;lv int;profile jsonb;zones jsonb;names jsonb;stride int;result jsonb:='[]';cost int;
begin
 select jsonb_agg(value order by ord) into names from jsonb_array_elements(c->'names') with ordinality e(value,ord) where not coalesce(h->'recent_names','[]')@>jsonb_build_array(value);
 if names is null or jsonb_array_length(names)<3 then names:=c->'names';end if;
 stride:=jsonb_array_length(names)/3;
 s:=realm_private.c1_next(s);base:=floor(s::double precision/2147483647*jsonb_array_length(names));
 zones:=c->(case when h->>'faction'='horde' then 'horde' else 'alliance' end);
 for i in 0..2 loop
  profile:=c->'profiles'->i;cost:=(profile->>'cost')::int;
  s:=realm_private.c1_next(s);zi:=floor(s::double precision/2147483647*jsonb_array_length(zones));
  s:=realm_private.c1_next(s);ei:=floor(s::double precision/2147483647*jsonb_array_length(c->'enemies'));
  lv:=greatest(1,(h->>'level')::int+i-1);
  result:=result||jsonb_build_array(jsonb_build_object('id',seed||'-'||i,'slot',i,'version','classic-1',
   'name',names->((base+i*stride)%jsonb_array_length(names)),'zone',zones->zi,
   'desc',c->'descriptions'->((base+i)%jsonb_array_length(c->'descriptions')),'profile',profile->'name',
   'duration',cost*30,'energy',cost,'gold',floor(cost*(8+(h->>'level')::int*3)*(profile->>'gold')::double precision+.5),
   'xp',floor(cost*12*(1+.06::double precision*(h->>'level')::int)*(profile->>'xp')::double precision+.5),
   'lootChance',profile->'loot','enemy',realm_private.c1_enemy(lv,ei%3,(profile->>'difficulty')::double precision,c->'enemies'->>ei),
   'enemyIcon',case when ei in(2,5) then 11 else 10 end));
 end loop;return result;
end$$;

create or replace function realm_private.c1_upgrade(h jsonb,n bigint,seed bigint) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare day text:=to_char(to_timestamp(n/1000.0) at time zone 'Europe/Madrid','YYYY-MM-DD');q jsonb; a jsonb;
begin
 if h->>'schema'='2' then return h;end if;
 h:=h||jsonb_build_object('schema',2,'rules_version','classic-1','dexterity',10+2*((h->>'level')::int-1),'intellect',10+2*((h->>'level')::int-1),'day',day,'offer_seed',seed,'cooldowns',jsonb_build_object('arena',0,'dungeon',0),'last_battle',null,'receipts','[]'::jsonb);
 h:=h||jsonb_build_object('offers',realm_private.c1_offers(h,seed));a:=h->'active';
 if a is not null and a<>'null'::jsonb and a->'quest' is null then
  q:=(('[{"name":"Sombras en el camino","gold":45,"xp":35},{"name":"El precio del acero","gold":85,"xp":65},{"name":"Un susurro ancestral","gold":140,"xp":100}]')::jsonb)->(a->>'id')::int;
  q:=q||jsonb_build_object('enemy',realm_private.c1_enemy(greatest(1,(h->>'level')::int-1),0,.6,'Guardián de la frontera'),'enemyIcon',10,'lootChance',0);
  h:=jsonb_set(h,'{active}',a||jsonb_build_object('version','classic-1','legacy',true,'player',realm_private.c1_fighter(h),'battle_seed',realm_private.c1_next(seed),'quest',q));
 end if;return h;
end$$;

create or replace function realm_private.c1_step(h jsonb,action text,arg jsonb,n bigint,seed bigint) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare c jsonb:=realm_private.c1_catalog(); q jsonb;item jsonb;a jsonb;battle jsonb:=null;enemy jsonb;
 day text:=to_char(to_timestamp(n/1000.0) at time zone 'Europe/Madrid','YYYY-MM-DD');
 v text:=arg#>>'{}';msg text:='';cost bigint;gold bigint;xp bigint;lv int;won boolean;available jsonb; idx int;
begin
 h:=realm_private.c1_upgrade(h,n,seed);
 if h->>'rules_version'<>'classic-1' then raise exception 'Versión de reglas no disponible.';end if;
 if day>h->>'day' then h:=h||jsonb_build_object('day',day,'energy',100);end if;
 if action='quest' then
  if h->'active'<>'null'::jsonb then raise exception 'Ya tienes una misión en marcha.';end if;
  select x into q from jsonb_array_elements(h->'offers') x where x->>'id'=v;
  if q is null then raise exception 'La oferta ha cambiado. Actualiza la taberna.';end if;
  if (h->>'energy')::int<(q->>'energy')::int then raise exception 'No tienes suficiente aventura. Se repone a medianoche del reino.';end if;
  h:=h||jsonb_build_object('energy',(h->>'energy')::int-(q->>'energy')::int,
   'active',jsonb_build_object('id',v,'version','classic-1','ends',n+(q->>'duration')::bigint*1000,'quest',q,'player',realm_private.c1_fighter(h),'battle_seed',seed));
  msg:='Has partido hacia '||(q->>'zone')||'.';
 elsif action='claim' then
  a:=h->'active';
  if a is null or a='null'::jsonb or n<(a->>'ends')::bigint then raise exception 'La aventura aún no ha terminado.';end if;
  q:=a->'quest';battle:=realm_private.c1_fight(a->'player',q->'enemy',(a->>'battle_seed')::bigint);won:=battle->>'winner'='0';
  gold:=case when won then (q->>'gold')::bigint else (q->>'gold')::bigint/4 end;xp:=case when won then (q->>'xp')::bigint else 10 end;
  h:=h||jsonb_build_object('gold',(h->>'gold')::bigint+gold,'xp',(h->>'xp')::bigint+xp);
  msg:=case when won then '¡Victoria! +' else 'Derrota. +' end||gold||' oro · +'||xp||' EXP';
  if won and realm_private.c1_next(realm_private.c1_next((a->>'battle_seed')::bigint))::double precision/2147483647<(q->>'lootChance')::double precision then
   select coalesce(jsonb_agg(x order by (x->>'id')::int),'[]') into available from jsonb_array_elements(c->'items') x where not (h->'inventory')@>jsonb_build_array(x->'id');
   if jsonb_array_length(available)>0 then item:=available->((a->>'battle_seed')::bigint%jsonb_array_length(available))::int;h:=jsonb_set(h,'{inventory}',(h->'inventory')||jsonb_build_array(item->'id'));msg:=msg||' · Botín: '||(item->>'name');
   else h:=jsonb_set(h,'{gold}',to_jsonb((h->>'gold')::bigint+20));msg:=msg||' · +20 oro por el botín.';end if;
  end if;
  select jsonb_agg(value order by ord) into available from (
   select value,ord from jsonb_array_elements((select jsonb_agg(x->'name' order by ord) from jsonb_array_elements(h->'offers') with ordinality e(x,ord))||coalesce(h->'recent_names','[]')) with ordinality e(value,ord) order by ord limit 6)t;
  h:=h||jsonb_build_object('active',null,'recent_names',available,'offer_seed',realm_private.c1_next((h->>'offer_seed')::bigint));
 elsif action='buy' then
  if jsonb_typeof(arg) is distinct from 'number' then raise exception 'Objeto no disponible.';end if;
  select x into item from jsonb_array_elements(c->'items') x where x->'id'=arg;
  if item is null or (h->'inventory')@>jsonb_build_array(item->'id') then raise exception 'Objeto no disponible.';end if;
  cost:=(item->>'cost')::int;if (h->>'gold')::bigint<cost then raise exception 'No tienes suficiente oro.';end if;
  h:=h||jsonb_build_object('gold',(h->>'gold')::bigint-cost,'inventory',(h->'inventory')||jsonb_build_array(item->'id'));msg:='Has comprado '||(item->>'name')||'.';
 elsif action='equip' then
  if jsonb_typeof(arg) is distinct from 'number' then raise exception 'No tienes ese objeto.';end if;
  select x into item from jsonb_array_elements(c->'items') x where x->'id'=arg;
  if item is null or not (h->'inventory')@>jsonb_build_array(item->'id') then raise exception 'No tienes ese objeto.';end if;
  h:=jsonb_set(h,array['equipped',item->>'slot'],item->'id');msg:='Equipo actualizado.';
 elsif action='train' then
  if v is null or v not in('strength','dexterity','intellect','stamina','luck') then raise exception 'Atributo desconocido.';end if;
  cost:=(h->>v)::bigint*3;if (h->>'gold')::bigint<cost then raise exception 'No tienes suficiente oro.';end if;
  h:=h||jsonb_build_object('gold',(h->>'gold')::bigint-cost,v,(h->>v)::bigint+1);msg:='Entrenamiento completado.';
 elsif action in('arena','dungeon') then
  if n<coalesce((h->'cooldowns'->>action)::bigint,0) then raise exception 'Debes esperar antes del siguiente combate.';end if;
  if action='dungeon' then lv:=2+(h->>'dungeon')::int*2;idx:=(h->>'dungeon')::int%3;gold:=80+(h->>'dungeon')::int*20;xp:=60+(h->>'dungeon')::int*10;
  else lv:=greatest(1,(h->>'level')::int);idx:=(h->>'wins')::int%3;gold:=25+lv*5;xp:=15+lv*3;end if;
  enemy:=realm_private.c1_enemy(lv,idx,.85,case when action='dungeon' then 'Guardián del umbral' else 'Retador de entrenamiento' end);
  battle:=realm_private.c1_fight(realm_private.c1_fighter(h),enemy,seed);won:=battle->>'winner'='0';
  h:=jsonb_set(h,array['cooldowns',action],to_jsonb(n+case when action='arena' then 600000 else 3600000 end));
  if won then
   v:=case when action='dungeon' then 'dungeon' else 'wins' end;
   h:=h||jsonb_build_object('gold',(h->>'gold')::bigint+gold,'xp',(h->>'xp')::bigint+xp,v,(h->>v)::int+1);
  end if;
  msg:=case when won then '¡Victoria! +'||gold||' oro · +'||xp||' EXP' else 'Derrota. Revisa el registro y mejora tu equipo.' end;
 elsif action not in('get','refresh') then raise exception 'Acción desconocida.';
 end if;
 lv:=(h->>'level')::int;
 while (h->>'xp')::bigint>=floor(80*power(lv::double precision,1.65)+.5)::bigint loop
  h:=h||jsonb_build_object('xp',(h->>'xp')::bigint-floor(80*power(lv::double precision,1.65)+.5)::bigint,'level',lv+1,'strength',(h->>'strength')::bigint+2,'dexterity',(h->>'dexterity')::bigint+2,'intellect',(h->>'intellect')::bigint+2,'stamina',(h->>'stamina')::bigint+2,'luck',(h->>'luck')::bigint+1);
  lv:=lv+1;msg:=msg||' ¡Nivel '||lv||'!';
 end loop;
 if action='claim' then h:=jsonb_set(h,'{offers}',realm_private.c1_offers(h,(h->>'offer_seed')::bigint));end if;
 if battle is not null then h:=jsonb_set(h,'{last_battle}',battle);end if;
 if msg<>'' then
  select jsonb_agg(value order by ord) into a from (select value,ord from jsonb_array_elements(jsonb_build_array(msg)||(h->'log')) with ordinality e(value,ord) order by ord limit 12)t;
  h:=jsonb_set(h,'{log}',a);
 end if;
 h:=jsonb_set(h,'{updated_at}',to_jsonb(n));
 return jsonb_build_object('hero',h,'message',msg,'battle',battle,'server_time',n,'rules_version','classic-1');
end$$;

create or replace function realm_private.c1_view(h jsonb) returns jsonb
language sql immutable security invoker set search_path='' as $$select h#-'{active,battle_seed}' #-'{receipts}'$$;

create or replace function realm_private.classic_command(action text,arg jsonb,request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();h jsonb;previous jsonb;result jsonb;receipt realm_private.commands;legacy public.realm_heroes;created boolean:=false;event_id uuid:=coalesce(request_id,gen_random_uuid());
 n bigint:=floor(extract(epoch from clock_timestamp())*1000);seed bigint:=(('x'||substr(replace(gen_random_uuid()::text,'-',''),1,8))::bit(32)::bigint%2147483646)+1;
begin
 if uid is null then raise exception 'Necesitas entrar con tu cuenta.';end if;
 if action is null or length(coalesce(arg::text,''))>4096 then raise exception 'Acción inválida.';end if;
 if action not in('get','refresh') and request_id is null then raise exception 'Falta el identificador de la acción.';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 n:=floor(extract(epoch from clock_timestamp())*1000);
 select state into h from realm_private.characters where user_id=uid for update;
 if h is null then
  select * into legacy from public.realm_heroes where user_id=uid for update;
  if found then h:=realm_private.c1_upgrade(to_jsonb(legacy)-'user_id',n,seed);
  elsif action='create' then
   created:=true;
   if arg->>'name' is null or length(trim(arg->>'name')) not between 1 and 24 or coalesce(arg->>'faction','') not in('horde','alliance') or coalesce(arg->>'job','') not in('warrior','ranger','mage') then raise exception 'Revisa los datos de tu héroe.';end if;
   h:=realm_private.c1_upgrade(jsonb_build_object('name',trim(arg->>'name'),'faction',arg->>'faction','job',arg->>'job','level',1,'xp',0,'gold',150,'energy',100,'strength',10,'stamina',10,'luck',5,'inventory','[]'::jsonb,'equipped','{}'::jsonb,'active',null,'dungeon',0,'wins',0,'updated_at',n,'log','[]'::jsonb),n,seed);
  elsif action in('get','refresh') then return jsonb_build_object('hero',null,'server_time',n,'rules_version','classic-1');
  else raise exception 'Primero crea un héroe.';end if;
  insert into realm_private.characters(user_id,state) values(uid,h);
  insert into realm_private.ledger(user_id,request_id,asset,delta,balance,reason)
  select uid,event_id,asset,(h->>key)::bigint,(h->>key)::bigint,case when created then 'create' else 'migration' end
  from(values('gold','gold'),('adventure','energy'))v(asset,key);
 end if;
 if request_id is not null then
  select * into receipt from realm_private.commands c where c.user_id=uid and c.request_id=classic_command.request_id;
  if found then
   if receipt.action<>action or receipt.argument is distinct from arg then raise exception 'Identificador de acción reutilizado con otros datos.';end if;
   return receipt.result||jsonb_build_object('hero',realm_private.c1_view(h),'server_time',n,'replayed',true);
  end if;
 end if;
 if action='create' and not created then raise exception 'Ya tienes un héroe.';end if;
 previous:=h;
 result:=realm_private.c1_step(h,case when action='create' then 'get' else action end,arg,n,seed);h:=result->'hero';
 update realm_private.characters set state=h,updated_at=now() where user_id=uid;
 if request_id is not null then
  insert into realm_private.commands(user_id,request_id,action,argument,result) values(uid,request_id,action,arg,result-'hero');
 end if;
 insert into realm_private.ledger(user_id,request_id,asset,delta,balance,reason)
 select uid,event_id,asset,(h->>key)::bigint-(previous->>key)::bigint,(h->>key)::bigint,action
 from(values('gold','gold'),('adventure','energy'))v(asset,key) where (h->>key)::bigint<>(previous->>key)::bigint;
 return result||jsonb_build_object('hero',realm_private.c1_view(h));
end$$;

create or replace function public.realm_command(action text,arg jsonb default null,request_id uuid default null) returns jsonb
language sql security invoker set search_path='' as $$select realm_private.classic_command(action,arg,request_id)$$;
revoke all on function public.realm_command(text,jsonb,uuid) from public,anon;
grant execute on function public.realm_command(text,jsonb,uuid) to authenticated;

-- Older clients must reload instead of mutating a second economy.
create or replace function realm_private.perform_action(action text,arg text default '') returns jsonb
language plpgsql security definer set search_path='' as $$begin if auth.uid() is null then raise exception 'Necesitas entrar.';end if;raise exception 'El juego se ha actualizado. Recarga la página para continuar.';end$$;

create or replace function realm_private.ranking() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Necesitas entrar.';end if;
 return(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from(select state->>'name' as name,state->>'faction' as faction,(state->>'level')::int as level,(state->>'xp')::bigint as xp from realm_private.characters order by (state->>'level')::int desc,(state->>'xp')::bigint desc,user_id limit 50)r);
end$$;

-- No helper or private table is exposed through PostgREST.
revoke all on all functions in schema realm_private from public,anon,authenticated;
grant execute on function realm_private.classic_command(text,jsonb,uuid),realm_private.ranking(),realm_private.perform_action(text,text) to authenticated;
notify pgrst,'reload schema';
commit;
