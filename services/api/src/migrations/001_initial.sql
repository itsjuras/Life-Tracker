-- ============================================================
-- Life Tracker — initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
--
-- Supabase manages auth.users for us — we reference it directly
-- instead of maintaining our own users table.
-- ============================================================

-- Drop tables from a previous run (CASCADE removes dependent policies/indexes)
DROP TABLE IF EXISTS reflection_entries CASCADE;
DROP TABLE IF EXISTS stat_entries       CASCADE;
DROP TABLE IF EXISTS stat_definitions   CASCADE;
DROP TABLE IF EXISTS tasks              CASCADE;
DROP TABLE IF EXISTS habit_entries      CASCADE;
DROP TABLE IF EXISTS habits             CASCADE;

-- ─── Habits ────────────────────────────────────────────────
CREATE TABLE habits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon_key   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE habit_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (habit_id, date)
);

-- ─── Daily Tasks ───────────────────────────────────────────
CREATE TABLE tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  title      TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Stat Tracking ─────────────────────────────────────────
CREATE TABLE stat_definitions (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key     TEXT NOT NULL,
  label   TEXT NOT NULL,
  unit    TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, key)
);

CREATE TABLE stat_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_definition_id UUID NOT NULL REFERENCES stat_definitions(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  value              NUMERIC NOT NULL,
  UNIQUE (stat_definition_id, date)
);

-- ─── Reflection ────────────────────────────────────────────
CREATE TABLE reflection_entries (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date    DATE NOT NULL,
  text    TEXT NOT NULL,
  UNIQUE (user_id, date)
);

-- ============================================================
-- Row Level Security
-- Each user can only read/write their own rows.
-- ============================================================

ALTER TABLE habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_definitions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

-- habits: owned rows only
CREATE POLICY "habits: own rows" ON habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- habit_entries: accessible if the parent habit belongs to the user
CREATE POLICY "habit_entries: own rows" ON habit_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_entries.habit_id
      AND habits.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_entries.habit_id
      AND habits.user_id = auth.uid()
  ));

-- tasks: owned rows only
CREATE POLICY "tasks: own rows" ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- stat_definitions: owned rows only
CREATE POLICY "stat_definitions: own rows" ON stat_definitions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- stat_entries: accessible if the parent stat_definition belongs to the user
CREATE POLICY "stat_entries: own rows" ON stat_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM stat_definitions
    WHERE stat_definitions.id = stat_entries.stat_definition_id
      AND stat_definitions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM stat_definitions
    WHERE stat_definitions.id = stat_entries.stat_definition_id
      AND stat_definitions.user_id = auth.uid()
  ));

-- reflection_entries: owned rows only
CREATE POLICY "reflection_entries: own rows" ON reflection_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
