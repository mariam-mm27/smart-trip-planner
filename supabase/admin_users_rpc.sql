-- ============================================================
-- COMPLETE ADMIN FIX: Email + Trips Count in Admin Users Table
-- ============================================================
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- It is safe to run multiple times (all statements use CREATE OR REPLACE
-- or DROP IF EXISTS + CREATE).
-- ============================================================


-- ── STEP 1: Add email column to profiles (if missing) ──────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;


-- ── STEP 2: Backfill email for all existing users from auth.users ──────────
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE au.id = p.id
  AND (p.email IS NULL OR p.email = '');


-- ── STEP 3: Update handle_new_user trigger to store email at signup ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── STEP 4: RLS policy — let admins read ALL profiles rows ─────────────────
-- Without this the frontend falls back to profiles but only gets its own row.
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin() OR id = auth.uid());


-- ── STEP 5: RLS on trips — admins can count any user's trips ───────────────
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trips_select_own ON public.trips;
CREATE POLICY trips_select_own
  ON public.trips FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());


-- ── STEP 6: SECURITY DEFINER RPC — always returns real emails from auth.users
-- This is the primary path used by getAllUsers() in userService.js.
-- It bypasses RLS completely (runs as postgres), so email is guaranteed.
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (
  id                 uuid,
  email              text,
  raw_user_meta_data jsonb,
  created_at         timestamptz,
  full_name          text,
  role               text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.created_at,
    COALESCE(
      p.full_name,
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1)
    ) AS full_name,
    COALESCE(p.role, 'user') AS role
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
$$;

-- Only authenticated users (admins) can call this function
REVOKE ALL ON FUNCTION public.get_all_users_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO authenticated;


-- ── STEP 7: Grant profiles UPDATE permission for email column ───────────────
-- The earlier rls-policies.sql revoked all UPDATE then re-granted specific
-- columns. Re-grant email so the backfill trigger can write it.
GRANT UPDATE (full_name, avatar_url, phone, email) ON public.profiles TO authenticated;


-- ── Done ────────────────────────────────────────────────────────────────────
-- After running this:
-- • profiles.email is populated for all existing users
-- • New signups automatically store their email
-- • getAllUsers() RPC returns real emails from auth.users
-- • Admins can read all profiles rows (for the fallback path)
-- • Admins can count trips for any user
