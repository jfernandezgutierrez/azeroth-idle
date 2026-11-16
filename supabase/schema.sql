create schema if not exists realm_private;
revoke all on schema realm_private from public, anon;
grant usage on schema realm_private to authenticated;
create table public.realm_heroes (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 24),
 faction text not null check(faction in ('horde','alliance')),
 job text not null check(job in ('warrior','mage','ranger')),
 level integer not null default 1, xp integer not null default 0,
 gold integer not null default 150 check(gold>=0), energy integer not null default 100 check(energy between 0 and 100),
 strength integer not null default 10, stamina integer not null default 10, luck integer not null default 5,
 inventory jsonb not null default '[]', equipped jsonb not null default '{}',
 active jsonb, dungeon integer not null default 0, wins integer not null default 0,
 updated_at bigint not null default (extract(epoch from now())*1000)::bigint,
 log jsonb not null default '[]'
);
alter table public.realm_heroes enable row level security;
revoke all on public.realm_heroes from anon,authenticated;
grant select on public.realm_heroes to authenticated;
create policy own_hero on public.realm_heroes for select to authenticated using ((select auth.uid())=user_id);

create function realm_private.perform_action(action text,arg text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); h public.realm_heroes; input jsonb; q int; n bigint:=(extract(epoch from clock_timestamp())*1000)::bigint;
 duration int; cost int; reward int; experience int; enemy int; p int; won boolean; msg text:='';
 item int; slot text; v int; rowlog jsonb; ticks int;
begin
 if uid is null then raise exception 'Necesitas entrar con tu cuenta.'; end if;
 if action='create' then
  input:=arg::jsonb;
  insert into public.realm_heroes(user_id,name,faction,job) values(uid,trim(input->>'name'),input->>'faction',input->>'job');
 end if;
 select * into h from public.realm_heroes where user_id=uid for update;
 if not found then
  if action='get' then return jsonb_build_object('hero',null); end if;
  raise exception 'Primero crea un héroe.';
 end if;
 ticks:=greatest(0,((n-h.updated_at)/60000)::int);
 h.energy:=least(100,h.energy+ticks);
 h.updated_at:=h.updated_at+ticks::bigint*60000;
 p:=h.strength+h.stamina/2+case h.job when 'warrior' then 2 when 'mage' then 3 else 1 end;
 for rowlog in select value from jsonb_each(h.equipped) loop
  p:=p+case (rowlog#>>'{}')::int when 0 then 5 when 1 then 4 when 2 then 9 when 3 then 3 else 0 end;
 end loop;
 if action='quest' then
  if h.active is not null then raise exception 'Ya tienes una misión en marcha.'; end if;
  q:=arg::int;
  if q not between 0 and 2 then raise exception 'Misión desconocida.'; end if;
  duration:=case q when 0 then 20 when 1 then 45 else 70 end;
  cost:=case q when 0 then 10 when 1 then 15 else 20 end;
  if h.energy<cost then raise exception 'No tienes suficiente energía.'; end if;
  h.energy:=h.energy-cost; h.active:=jsonb_build_object('id',q,'ends',n+duration*1000);
  msg:='La aventura ha comenzado.';
 elsif action='claim' then
  if h.active is null or n<(h.active->>'ends')::bigint then raise exception 'La aventura aún no ha terminado.'; end if;
  q:=(h.active->>'id')::int;
  enemy:=case q when 0 then 8 when 1 then 14 else 22 end;
  reward:=case q when 0 then 45 when 1 then 85 else 140 end;
  experience:=case q when 0 then 35 when 1 then 65 else 100 end;
  won:=p*(0.85+random()*0.3)>=enemy;
  h.gold:=h.gold+case when won then reward else reward/4 end;
  h.xp:=h.xp+case when won then experience else 10 end;
  h.active:=null; msg:=case when won then '¡Victoria! +'||reward||' oro · +'||experience||' EXP' else 'Derrota. Has rescatado una parte del botín.' end;
 elsif action='buy' then
  item:=arg::int;
  cost:=case item when 0 then 100 when 1 then 85 when 2 then 210 when 3 then 65 else null end;
  if cost is null or h.inventory @> jsonb_build_array(item) then raise exception 'Objeto no disponible.'; end if;
  if h.gold<cost then raise exception 'No tienes suficiente oro.'; end if;
  h.gold:=h.gold-cost;h.inventory:=h.inventory||jsonb_build_array(item);msg:='Objeto añadido a tu mochila.';
 elsif action='equip' then
  item:=arg::int;
  if not h.inventory @> jsonb_build_array(item) then raise exception 'No tienes ese objeto.'; end if;
  slot:=case item when 0 then 'weapon' when 2 then 'weapon' when 1 then 'armor' when 3 then 'helm' end;
  if slot is null then raise exception 'Objeto desconocido.'; end if;
  h.equipped:=jsonb_set(h.equipped,array[slot],to_jsonb(item));msg:='Equipo actualizado.';
 elsif action='train' then
  v:=case arg when 'strength' then h.strength when 'stamina' then h.stamina when 'luck' then h.luck else null end;
  if v is null then raise exception 'Atributo desconocido.'; end if;
  if h.gold<v*3 then raise exception 'No tienes suficiente oro.'; end if;
  h.gold:=h.gold-v*3;
  if arg='strength' then h.strength:=h.strength+1;elsif arg='stamina' then h.stamina:=h.stamina+1;else h.luck:=h.luck+1;end if;
  msg:='Entrenamiento completado.';
 elsif action in ('dungeon','arena') then
  if h.energy<15 then raise exception 'Necesitas 15 de energía.'; end if;
  h.energy:=h.energy-15;
  enemy:=case action when 'dungeon' then 18+h.dungeon*7 else 12+h.wins*3 end;
  won:=p*(0.8+random()*0.4)>=enemy;
  if won then h.gold:=h.gold+80;h.xp:=h.xp+60;
   if action='dungeon' then h.dungeon:=h.dungeon+1;else h.wins:=h.wins+1;end if;
  end if;
  msg:=case when won then '¡Victoria! +80 oro · +60 EXP' else 'Derrota. Mejora tu equipo antes de volver.' end;
 elsif action not in ('get','create','refresh') then raise exception 'Acción desconocida.';
 end if;
 while h.xp>=h.level*100 loop h.xp:=h.xp-h.level*100;h.level:=h.level+1;h.strength:=h.strength+2;h.stamina:=h.stamina+2;msg:=msg||' ¡Nivel '||h.level||'!';end loop;
 if msg<>'' then
  select coalesce(jsonb_agg(value),'[]') into h.log from (select value from jsonb_array_elements(jsonb_build_array(msg)||h.log) with ordinality as e(value,pos) order by pos limit 12) s;
 end if;
 update public.realm_heroes set level=h.level,xp=h.xp,gold=h.gold,energy=h.energy,strength=h.strength,stamina=h.stamina,luck=h.luck,inventory=h.inventory,equipped=h.equipped,active=h.active,dungeon=h.dungeon,wins=h.wins,updated_at=h.updated_at,log=h.log where user_id=uid;
 return jsonb_build_object('hero',to_jsonb(h)-'user_id','message',msg);
end $$;
revoke all on function realm_private.perform_action(text,text) from public,anon;
grant execute on function realm_private.perform_action(text,text) to authenticated;
create function public.realm_action(action text,arg text default '') returns jsonb language sql security invoker set search_path='' as $$select realm_private.perform_action(action,arg)$$;
revoke all on function public.realm_action(text,text) from public,anon;
grant execute on function public.realm_action(text,text) to authenticated;
create function realm_private.ranking() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Necesitas entrar.'; end if;
 return (select coalesce(jsonb_agg(to_jsonb(r)),'[]') from (select name,faction,level,xp from public.realm_heroes order by level desc,xp desc,name limit 50) r);
end $$;
revoke all on function realm_private.ranking() from public,anon;
grant execute on function realm_private.ranking() to authenticated;
create function public.realm_ranking() returns jsonb language sql security invoker set search_path='' as $$select realm_private.ranking()$$;
revoke all on function public.realm_ranking() from public,anon;
grant execute on function public.realm_ranking() to authenticated;
