-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Habits
CREATE TABLE habits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Daily Tasks
CREATE TABLE tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  title      TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stat Tracking
CREATE TABLE stat_definitions (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key     TEXT NOT NULL,
  label   TEXT NOT NULL,
  unit    TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, key)
);

CREATE TABLE stat_entries (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_definition_id   UUID NOT NULL REFERENCES stat_definitions(id) ON DELETE CASCADE,
  date                 DATE NOT NULL,
  value                NUMERIC NOT NULL,
  UNIQUE (stat_definition_id, date)
);

-- Reflection
CREATE TABLE reflection_entries (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date    DATE NOT NULL,
  text    TEXT NOT NULL,
  UNIQUE (user_id, date)
);
