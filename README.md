# Life Tracker

A simple, highly individualized daily life tracker focused on consistency—not complexity.

Track:
- **Daily habits** (tap to mark done)
- **Daily tasks** (top 1–5 priorities)
- **Stats** (weight, sleep score, etc. with graphs)
- **Reflection** (one short highlight from the day)

> Built mobile-first (phone app). A web version can be added later with shared UI + API.

---

## Features

### 1) Daily Habits (boolean completion)
- Create habits with a **name** + **icon**
- Tap once per day to mark **completed / not completed**
- Designed for speed: one screen, minimal friction

**Icons**
- App provides a long list of minimal icons (e.g., via an icon library like Lucide/Feather/Material).
- Each habit stores an `iconKey` so the icon set can evolve without breaking data.

### 2) Daily Tasks (top 1–5)
- Lightweight to-do list for the day’s priorities
- Quick add / reorder / complete
- Optional: auto-roll unfinished tasks to tomorrow (roadmap)

### 3) Stat Tracking (numeric + graphs)
- Users opt-in to stats they care about (weight, sleep score, mood, steps, etc.)
- Daily values plotted as a simple trend line
- Each stat can include units, goal ranges, and visibility controls (roadmap)

### 4) Reflection (short)
- One small prompt: “What stuck out today?”
- Very small word/character limit (e.g., ~10–25 words)

---

## Tech Stack

**Frontend**
- React Native + TypeScript
- Tailwind-style utility classes (commonly via NativeWind)

**Backend**
- Node.js + Express
- PostgreSQL

---

## Repository Structure (suggested)
├─ apps/
│ └─ mobile/ # React Native app
├─ services/
│ └─ api/ # Node/Express API
├─ packages/
│ └─ shared/ # shared types/utils (optional)
└─ docs/ # architecture notes, API docs, etc.


---

## Data Model (high level)

Core concepts (typical approach):

- **User**
- **Habit**: `{ id, userId, name, iconKey, createdAt }`
- **HabitEntry** (per day): `{ id, habitId, date, completed }`

- **Task** (per day): `{ id, userId, date, title, completed, sortOrder }`

- **StatDefinition** (what to track): `{ id, userId, key, label, unit, enabled }`
- **StatEntry** (daily values): `{ id, statDefinitionId, date, value }`

- **ReflectionEntry**: `{ id, userId, date, text }`

> Dates are stored as a **date-only** value (no time) to keep “daily” consistent across timezones.

---

## API (example endpoints)

Example REST shape (adjust as you implement):

### Habits
- `GET /v1/habits`
- `POST /v1/habits`
- `PATCH /v1/habits/:id`
- `POST /v1/habits/:id/entries` (set completion for a date)
- `GET /v1/habits/entries?date=YYYY-MM-DD`

### Tasks
- `GET /v1/tasks?date=YYYY-MM-DD`
- `POST /v1/tasks`
- `PATCH /v1/tasks/:id`
- `DELETE /v1/tasks/:id`

### Stats
- `GET /v1/stats`
- `POST /v1/stats`
- `POST /v1/stats/:id/entries`
- `GET /v1/stats/:id/entries?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Reflection
- `GET /v1/reflection?date=YYYY-MM-DD`
- `PUT /v1/reflection` (upsert by date)

---

## Getting Started (Local Dev)

### Prerequisites
- Node.js (LTS recommended)
- PostgreSQL
- (Mobile) Xcode / Android Studio depending on platform

### Environment Variables

Create `.env` in `services/api`:

```bash
# services/api/.env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/daily_tracker
JWT_SECRET=change_me
CORS_ORIGIN=http://localhost:19006
