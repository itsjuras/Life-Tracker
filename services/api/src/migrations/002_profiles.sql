-- ============================================================
-- Life Tracker — profiles + avatar storage
-- Run this in Supabase SQL Editor AFTER 001_initial.sql.
-- ============================================================

-- Drop everything from a previous run so this script is re-runnable
DROP TRIGGER IF EXISTS on_auth_user_created   ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user()          CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP TABLE    IF EXISTS public.profiles                    CASCADE;

-- ─── Profiles ──────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  email       TEXT,
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read (needed to display other users' names in the future)
CREATE POLICY "profiles: public read" ON profiles FOR SELECT
  USING (true);

-- Users can only update their own row
CREATE POLICY "profiles: own update" ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger runs as postgres role (SECURITY DEFINER) — give it unrestricted insert
CREATE POLICY "profiles: service insert" ON profiles
  FOR INSERT TO postgres
  WITH CHECK (true);

-- Authenticated users can insert their own row (client-side fallback)
CREATE POLICY "profiles: own insert" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Auto-bump updated_at on changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email    = EXCLUDED.email,
    username = COALESCE(public.profiles.username, EXCLUDED.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Storage: avatars bucket ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
DROP POLICY IF EXISTS "avatars: auth upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars: own update"  ON storage.objects;
DROP POLICY IF EXISTS "avatars: own delete"  ON storage.objects;

CREATE POLICY "avatars: public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: auth upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars: own update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars: own delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Backfill profiles for existing auth users ──────────────
-- Runs every time this script executes so no user is ever left without a row.
INSERT INTO public.profiles (id, username, email)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email
FROM auth.users
ON CONFLICT (id) DO NOTHING;
