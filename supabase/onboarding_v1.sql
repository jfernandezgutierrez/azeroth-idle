-- Optional, persistent tutorial layer. Does not change classic-1 combat/economy.
-- Apply after classic_v1.sql. No data deletion or chargeable service required.
begin;
revoke all on function realm_private.classic_command(text,jsonb,uuid) from public,anon,authenticated;

create or replace function realm_private.tutorial_command(action text,arg jsonb,request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();h jsonb;result jsonb;t jsonb;receipt realm_private.commands;
 n bigint;metadata boolean:=action in('tutorial_dismiss','tutorial_restart');
begin
 if uid is null then raise exception 'Necesitas entrar con tu cuenta.';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 n:=floor(extract(epoch from clock_timestamp())*1000);
 if metadata then
  if request_id is null then raise exception 'Falta el identificador de la acción.';end if;
  if arg is not null and arg<>'null'::jsonb then raise exception 'Esta acción no admite parámetros.';end if;
  select state into h from realm_private.characters where user_id=uid for update;
  if h is null then raise exception 'Primero crea un héroe.';end if;
  select * into receipt from realm_private.commands c where c.user_id=uid and c.request_id=tutorial_command.request_id;
  if found then
   if receipt.action<>action or receipt.argument is distinct from arg then raise exception 'Identificador de acción reutilizado con otros datos.';end if;
   return receipt.result||jsonb_build_object('hero',realm_private.c1_view(h),'server_time',n,'replayed',true);
  end if;
  result:=jsonb_build_object('message',case when action='tutorial_dismiss' then 'Puedes volver a mostrar la guía desde Cómo jugar.' else 'Tu guía vuelve a estar disponible.' end,'battle',null,'server_time',n,'rules_version','classic-1');
 else
  result:=realm_private.classic_command(action,arg,request_id);
  if result->'hero'='null'::jsonb then return result;end if;
  select state into h from realm_private.characters where user_id=uid for update;
 end if;
 t:=jsonb_build_object('started',false,'claimed',false,'improved',false,'dismissed',false)||coalesce(h->'tutorial','{}');
 if not coalesce((result->>'replayed')::boolean,false) then
  if action='quest' then t:=t||'{"started":true}'::jsonb;end if;
  if action='claim' then t:=t||'{"started":true,"claimed":true}'::jsonb;end if;
  if action in('train','equip') and t->>'claimed'='true' then t:=t||'{"improved":true}'::jsonb;end if;
  if action='tutorial_dismiss' then t:=t||'{"dismissed":true}'::jsonb;end if;
  if action='tutorial_restart' then t:='{"started":false,"claimed":false,"improved":false,"dismissed":false}';end if;
 end if;
 h:=jsonb_set(h,'{tutorial}',t);
 update realm_private.characters set state=h,updated_at=now() where user_id=uid;
 if metadata then insert into realm_private.commands(user_id,request_id,action,argument,result) values(uid,request_id,action,arg,result);end if;
 return result||jsonb_build_object('hero',realm_private.c1_view(h));
end$$;
revoke all on function realm_private.tutorial_command(text,jsonb,uuid) from public,anon;
grant execute on function realm_private.tutorial_command(text,jsonb,uuid) to authenticated;
create or replace function public.realm_command(action text,arg jsonb default null,request_id uuid default null) returns jsonb
language sql security invoker set search_path='' as $$select realm_private.tutorial_command(action,arg,request_id)$$;
revoke all on function public.realm_command(text,jsonb,uuid) from public,anon;
grant execute on function public.realm_command(text,jsonb,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
