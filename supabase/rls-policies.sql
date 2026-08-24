-- Run this in the Supabase SQL Editor.
-- Without it the React AdminRoute is cosmetic only: the anon key is public by
-- design, so anyone can write to `places` directly over the REST API.

-- SECURITY DEFINER so the places policies can read `profiles` without
-- re-triggering RLS on profiles (which would recurse).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------- places
alter table public.places enable row level security;

drop policy if exists places_select_public on public.places;
create policy places_select_public
  on public.places for select
  using (true);

drop policy if exists places_insert_admin on public.places;
create policy places_insert_admin
  on public.places for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists places_update_admin on public.places;
create policy places_update_admin
  on public.places for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists places_delete_admin on public.places;
create policy places_delete_admin
  on public.places for delete
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------- profiles
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column privileges, not policies. Supabase grants table-level UPDATE to
-- `authenticated`, and a table-level grant covers every column -- so revoking
-- just `role` would be a no-op. Revoke the whole grant, then re-grant the
-- columns the profile page legitimately edits. Without this a user could set
-- their own role to 'admin' through the profile upsert.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url, phone) on public.profiles to authenticated;

-- ------------------------------------------------------- contact_messages
-- The contact form is public so anyone may insert, but reading exposes sender
-- names and email addresses, so select is admin-only. No update policy at all,
-- which means RLS denies updates to everyone.
--
-- This table already had RLS enabled with an insert-only policy (the Table
-- Editor does that by default), so writes succeeded while every read returned
-- an empty list. Any pre-existing policies survive this script because they
-- have different names -- list them with:
--   select policyname, cmd, roles from pg_policies where tablename = 'contact_messages';
alter table public.contact_messages enable row level security;

drop policy if exists contact_messages_insert_public on public.contact_messages;
create policy contact_messages_insert_public
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists contact_messages_select_admin on public.contact_messages;
create policy contact_messages_select_admin
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists contact_messages_delete_admin on public.contact_messages;
create policy contact_messages_delete_admin
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------- new-user profile trigger
-- supabase.auth.signUp() only writes to auth.users, and Supabase does not
-- mirror that into public.profiles on its own. Without this trigger a newly
-- registered user has no profile row (so no role) until they open /profile and
-- save, which is the only place the app upserts one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill accounts that registered before the trigger existed. Safe to re-run.
insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- One existing row stores 'user ' with a trailing space, which never matches
-- an equality check on 'user'.
update public.profiles set role = trim(role) where role <> trim(role);

-- Promote your admin account (replace the email).
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');

-- ------------------------------------------------------------------ trips
alter table public.trips enable row level security;

drop policy if exists trips_select_own on public.trips;
create policy trips_select_own
  on public.trips for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists trips_insert_own on public.trips;
create policy trips_insert_own
  on public.trips for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists trips_update_own on public.trips;
create policy trips_update_own
  on public.trips for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists trips_delete_own on public.trips;
create policy trips_delete_own
  on public.trips for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------- trip_items
alter table public.trip_items enable row level security;

drop policy if exists trip_items_select_own on public.trip_items;
create policy trip_items_select_own
  on public.trip_items for select
  to authenticated
  using (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_items.trip_id
        and (public.trips.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists trip_items_insert_own on public.trip_items;
create policy trip_items_insert_own
  on public.trip_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_items.trip_id
        and (public.trips.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists trip_items_update_own on public.trip_items;
create policy trip_items_update_own
  on public.trip_items for update
  to authenticated
  using (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_items.trip_id
        and (public.trips.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_items.trip_id
        and (public.trips.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists trip_items_delete_own on public.trip_items;
create policy trip_items_delete_own
  on public.trip_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_items.trip_id
        and (public.trips.user_id = auth.uid() or public.is_admin())
    )
  );

-- -------------------------------------------------------------- favorites
alter table public.favorites enable row level security;

drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

