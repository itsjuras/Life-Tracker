-- ============================================================
-- Life Tracker — profiles security tightening
-- Run this in Supabase SQL Editor AFTER 002_profiles.sql.
--
-- 1. Stops exposing every user's email: replaces the public-read
--    policy with own-row-only reads. Username → email resolution
--    for sign-in moves into a SECURITY DEFINER function that
--    returns only the one email, never the table.
-- 2. Enforces unique usernames (case-insensitive).
-- 3. Restricts avatar uploads to the user's own folder.
--
-- The app falls back to the old direct lookup until this runs,
-- so it is safe to apply before or after shipping the client.
-- ============================================================

-- ─── 1. Own-row-only reads + sign-in lookup function ────────
DROP POLICY IF EXISTS "profiles: public read" ON profiles;
DROP POLICY IF EXISTS "profiles: own read"    ON profiles;

CREATE POLICY "profiles: own read" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.get_email_for_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT email FROM public.profiles
  WHERE lower(username) = lower(p_username)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_email_for_username(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO anon, authenticated;

-- ─── 2. Unique usernames (case-insensitive) ─────────────────
-- If this fails with a duplicate error, resolve the clashing
-- usernames in the dashboard first, then re-run.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles (lower(username))
  WHERE username IS NOT NULL;

-- ─── 3. Avatar uploads only into the user's own folder ──────
DROP POLICY IF EXISTS "avatars: auth upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars: own upload"  ON storage.objects;

CREATE POLICY "avatars: own upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
