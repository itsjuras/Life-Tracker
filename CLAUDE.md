# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

When the user provides a reference image (screenshot) and optionally some CSS classes or style notes:

1. **Generate** a single index.html file using Tailwind CSS (via CDN). Follow 
2. **Screenshot** the rendered page using Puppeteer (npx puppeteer screenshot index.html --fullpage or equivalent). If the page has distinct sections, capture those individually too.
3. **Compare** your screenshot against the reference image. Check for mismatches in:
   - Spacing and padding (measure in px)
   - Font sizes, weights, and line heights
   - Colors (exact hex values)
   - Alignment and positioning
   - Border radii, shadows, and effects
   - Responsive behavior
   - Image/icon sizing and placement
4. **Fix** every mismatch found. Edit the HTML/Tailwind code.
5. **Re-screenshot** and compare again.
6. **Repeat** steps 3–5 until the result is within ~2–3px of the reference everywhere.

Do NOT stop after one pass. Always do at least 2 comparison rounds. Only stop when the user says so or when no visible differences remain.

## Project

Personal portfolio website for Juras Makselis. GitHub: https://github.com/itsjuras/Personal-Website.git

## Tech Stack
- **Frontend:** React + Next.js (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Backend:** Next.js Route Handlers and/or Server Actions
- **DB:** PostgreSQL
- **ORM:** Prisma
- **Deployment:** Vercel (app) + managed Postgres (Neon/Supabase/RDS)

## Planned Features

- Project portfolio
- About Me section
- Contact form
- Responsive design + dark mode

## Coding Conventions
- **TypeScript strict:** no any (use unknown + narrowing if needed).
- Prefer **named exports** (unless the file already uses default exports).
- Prefer **Server Components by default**. Add "use client" only when required (state, effects, browser-only APIs).
- Keep components **small and composable**. Avoid giant files.
- Tailwind-only styling unless a file already uses another approach.
- Prefer **simple, explicit code** over abstractions.
- Avoid adding dependencies unless they provide strong ROI. If you want to add one, explain why.

## Data / DB Rules (Postgres + Prisma)
- Never commit secrets. .env* stays untracked.
- Prisma schema lives in prisma/schema.prisma.
- When changing the schema: create a migration, then update types/usages.
- Validate and sanitize user input for any write endpoints (contact forms, etc.).

## Common Commands
(Use npm, pnpm, or yarn — match whatever the repo uses.)

- Dev server: npm run dev (usually http://localhost:3000)
- Build: npm run build
- Start prod locally: npm run start
- Lint: npm run lint

## Repo Structure (expected)
- app/ — routes, layouts, pages, route handlers
- components/ — reusable UI components
- lib/ — helpers (db, utilities, constants)
- prisma/ — schema + migrations (when DB is enabled)
- public/ — static assets
- styles/ — only if needed (prefer Tailwind)

### Prisma (if enabled)
- Generate client: npx prisma generate
- Create migration: npx prisma migrate dev --name <migration_name>
- Open Studio: npx prisma studio

## Workflows

### Adding a new page/section
1. Create route under app/<route>/page.tsx
2. Add metadata (title/description/OG) if it’s a top-level page
3. Keep it server-rendered unless interactivity is necessary
4. Verify navigation + responsive layout

### Adding a component
1. Place in components/ (or existing component folder)
2. Keep props typed and minimal
3. Prefer composition over complex props
4. Avoid introducing client components unless necessary

### Adding an API route / server action
1. Decide: Route Handler (app/api/.../route.ts) vs Server Action
2. Validate input (e.g., zod) and handle errors cleanly
3. Don’t log secrets; return safe error messages
4. Add minimal tests or a quick manual verification path

### DB model change (Prisma)
1. Update schema.prisma
2. Run migration (prisma migrate dev)
3. Update any queries/types
4. Confirm the app still builds (npm run build)

## SEO / Performance Notes
- Use Next.js metadata / generateMetadata for SEO.
- Prefer next/image for images; put static images in public/.
- Avoid big client bundles: don’t mark entire pages as "use client" unless needed.
- Be careful with third-party scripts; load lazily if possible.

## “Gotchas” / Hard Rules
- **NEVER commit** .env, API keys, DB URLs, or tokens.
- Don’t rewrite large parts of the repo unless asked.
- Don’t introduce a complex architecture (monorepo, CQRS, etc.) for a personal site.
- If unsure about a change that affects structure/dependencies, **propose a plan first**.

that was the CLAUDE.md file as of now, I want you to make changes to emphasize to CLAUDE these design principles:
# Design Principles

### Software Design

set of principles, concepts, and practices that lead to the development of a high-quality system or product

### Design Principles

- guide the design work you must perform

### The Design Process

- iterative process
    - requirements are translated into a “blueprint” for constructing the software
- good design shoud:
    - implement all of the explicit requirements contained and accommodate all of the implicit requirements as well
    - readable
    - provide a complete picture of the software

### Software Quality Attributes

**Functionality**: feature set and capabilities of the program and the security of the overall system

**Usability**: human factors, overall aesthetics, consistency, and documentation

**Reliability**: frequency and severity of failure, accuracy of results, mean-time-to-failure (MTTF), ability to recover from failure, predictability

**Performance**: processing speed, response time, resource consumption, throughput, efficiency

**Supportability**: extensibility, adaptability, configurability

### Principles of Object-Oriented Design

Goal is maintainability and reusability

### Abstraction

- highlights common properties of objects
- distinguishes important and unimportant properties
- must be understood even without a concrete object

### Hierarchy Principles

- Open/Close Principle
    - classes should be open for extensions but closed for changes
- Liskov Principle
    - subclasses should not require more and deliver less
- Dependency Principle
    - high-level modules should not depend on low-level modules. Both should depend on abstractions
    - Abstractions should not depend on details. Concrete Implementations (details) should depend on abstractions

### Architecture

- the overall structure of the software and the ways in which that structure provides conceptual integrity for a system
- structural properties
    - components of a system and the manner in which those components are packaged and interact with one another
- extra-functional properties
    - how the design architecture achieves requirements for performance, capacity, reliability, security, adaptability, and other system characteristics
- families of related system properties
    - draw upon repeatable patterns that are commonly encountered in the design of families of similar systems

### Separation of Concerns

- any complex problem can be more easily handled if it is subdivided into pieces
- perceived complexity of two problems combined ≥ the sum of perceived complexity of those two problems separated

### Modularity

- software: divided into separately named and addressable components (modules)
- “modularity is the single attribute of software that allows a program to be intellectually manageable”
- the effort to develop an individual software module does decrease as the total number of modules increases
- however, as the number of modules grows, the effort associated with integrating the modules grows
    
    ![Screenshot 2025-10-18 at 5.35.20 PM.png](attachment:432cc43a-445c-4cd3-8f5a-3b58648be3c3:Screenshot_2025-10-18_at_5.35.20_PM.png)
    

### Information Hiding

- characterized modules by design decisions that each hides from all others
- information within a module is inaccessible to other modules that have no need for it
- benefits are most felt during modification and testing as it is very clear which data is being accessed

### Monolithic Software

- large program composed of a single module
- hard to understand

### Functional Independence

- Cohesion is an indication of the relative functional strength of a module
- a cohesive module performs a single task, requiring little interaction with other components in other parts of the program
- strive for HIGH cohesion
- coupling is an indication of the relative interdependence among modules
- strive for LOWEST POSSIBLE coupling

### Law of Demeter or Principle of Least Knowledge

Basic Idea: assume as little as possible about other modules

Approach: restrict method calls to friends

- A method M of an object O should only call methods of
    - O itself
    - M’s parameters
    - any objects created in M
    - O’s direct component objects

“single dot rule”

- reduces coupling
- disallow direct access to parts
- limit the number of accessible classes
- reduce dependencies
- results in several new wrapper methods
Thought for 19s
# CLAUDE.md — Personal Website

You are Claude Code, my coding assistant for this repo. Optimize for: **clean code**, **ship-fast**, **SEO/perf**, and **low-maintenance**.

---

## Design Principles (non-negotiable)

Treat design as an **iterative process**: translate requirements into a clear blueprint, implement, verify, refine.

### Software Quality Attributes (use as a checklist)
- **Functionality:** meets explicit + implicit requirements; secure-by-default.
- **Usability:** accessibility, aesthetics, consistency, clear docs/README notes when needed.
- **Reliability:** predictable behavior, graceful error handling, recoverable failures.
- **Performance:** fast loads, low JS, efficient DB queries, minimal network chatter.
- **Supportability:** easy to extend/configure, clean boundaries, minimal coupling.

### Separation of Concerns
- Keep UI, domain logic, data access, and configuration in **separate layers**.
- Pages/routes orchestrate; they shouldn’t contain heavy logic.
- Avoid “god components” and “utility dumping grounds”.

### Modularity + Information Hiding
- Build **small, named modules** with clear responsibilities.
- Hide design decisions behind stable interfaces (helpers, services, hooks).
- Only expose what other modules actually need.

### Functional Independence
- Aim for **high cohesion** (a module does one job well).
- Aim for **lowest possible coupling** (modules don’t know each other’s internals).

### OO / SOLID-in-spirit (apply to TS/React)
- **Open/Closed:** extend via composition/config instead of rewriting existing code.
- **Liskov:** if something claims to be a drop-in replacement, it must behave like one.
- **Dependency Inversion:** high-level code depends on abstractions (interfaces/functions), not low-level details (direct DB client usage inside UI).

### Law of Demeter (Least Knowledge)
- Avoid “reach-through” code and deep chains.
- Prefer passing **only what’s needed** (not giant objects).
- Create helpers/adapters instead of chaining like `a.b.c.d()` everywhere.

**Default behavior:** propose a small plan first, implement the smallest clean change, verify it, then refine.

---

## Project
Personal portfolio website for Juras Makselis.  
GitHub: https://github.com/itsjuras/Personal-Website.git

## Tech Stack
- **Frontend:** React + Next.js (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Backend:** Next.js Route Handlers and/or Server Actions
- **DB:** PostgreSQL
- **ORM:** Prisma
- **Deployment:** Vercel (app) + managed Postgres (Neon/Supabase/RDS)

## Planned Features
- Project portfolio
- About Me section
- Contact form
- Responsive design + dark mode

---

## Pixel-Perfect UI Workflow (only when user provides a screenshot)
When the user provides a reference image (screenshot) and optionally some CSS classes or style notes:

1. **Generate** a single `index.html` file using Tailwind CSS (via CDN). Include all content inline — no external files unless requested.
2. **Screenshot** the rendered page using Puppeteer (`npx puppeteer screenshot index.html --fullpage` or equivalent). If the page has distinct sections, capture those individually too.
3. **Compare** your screenshot against the reference image. Check for mismatches in:
   - Spacing and padding (measure in px)
   - Font sizes, weights, and line heights
   - Colors (exact hex values)
   - Alignment and positioning
   - Border radii, shadows, and effects
   - Responsive behavior
   - Image/icon sizing and placement
4. **Fix** every mismatch found. Edit the HTML/Tailwind code.
5. **Re-screenshot** and compare again.
6. **Repeat** steps 3–5 until the result is within ~2–3px of the reference everywhere.

Do NOT stop after one pass. Always do at least 2 comparison rounds. Only stop when the user says so or when no visible differences remain.

---

## Coding Conventions
- **TypeScript strict:** no `any` (use `unknown` + narrowing if needed).
- Prefer **named exports** (unless the file already uses default exports).
- Prefer **Server Components by default**. Add `"use client"` only when required (state, effects, browser-only APIs).
- Keep components **small and composable**. Avoid giant files.
- Tailwind-only styling unless a file already uses another approach.
- Prefer **simple, explicit code** over abstractions.
- Avoid adding dependencies unless they provide strong ROI. If you want to add one, explain why.

### Architecture rules (enforce design principles)
- Keep **data access** out of UI: route handlers / server actions call `lib/*` helpers, not Prisma directly from components.
- Introduce **module boundaries** early: `lib/db`, `lib/services`, `lib/validators`, etc.
- Prefer **composition** over inheritance-style patterns.
- Avoid tight coupling: don’t import across layers “just because it works”.
- Minimize shared/global state; only introduce it when clearly needed.

---

## Data / DB Rules (Postgres + Prisma)
- Never commit secrets. `.env*` stays untracked.
- Prisma schema lives in `prisma/schema.prisma`.
- When changing the schema: create a migration, then update types/usages.
- Validate and sanitize user input for any write endpoints (contact forms, etc.).

---

## Common Commands
(Use `npm`, `pnpm`, or `yarn` — match whatever the repo uses.)

- Dev server: `npm run dev` (usually http://localhost:3000)
- Build: `npm run build`
- Start prod locally: `npm run start`
- Lint: `npm run lint`

### Prisma (if enabled)
- Generate client: `npx prisma generate`
- Create migration: `npx prisma migrate dev --name <migration_name>`
- Open Studio: `npx prisma studio`

---

## Repo Structure (expected)
- `app/` — routes, layouts, pages, route handlers
- `components/` — reusable UI components
- `lib/` — helpers (db, utilities, constants, services)
- `prisma/` — schema + migrations (when DB is enabled)
- `public/` — static assets
- `styles/` — only if needed (prefer Tailwind)

If the repo differs, follow the existing structure.

---

## Workflows (general)

### Adding a new page/section
1. Clarify requirements (explicit + implicit).
2. Create route under `app/<route>/page.tsx`
3. Add metadata (title/description/OG) if it’s a top-level page
4. Keep it server-rendered unless interactivity is necessary
5. Verify navigation + responsive layout
6. Quick design check: separation of concerns, cohesion/coupling, least knowledge

### Adding a component
1. Place in `components/` (or existing component folder)
2. Keep props typed and minimal (pass only what’s needed)
3. Prefer composition over complex props
4. Avoid introducing client components unless necessary
5. Ensure it is cohesive and not a “grab bag” component

### Adding an API route / server action
1. Decide: Route Handler (`app/api/.../route.ts`) vs Server Action
2. Validate input (e.g., `zod`) and handle errors cleanly
3. Don’t log secrets; return safe error messages
4. Keep business logic in `lib/*` (information hiding)
5. Add minimal tests or a quick manual verification path

### DB model change (Prisma)
1. Update `schema.prisma`
2. Run migration (`prisma migrate dev`)
3. Update any queries/types
4. Confirm the app still builds (`npm run build`)
5. Check performance: indexes/queries if relevant

---

## SEO / Performance Notes
- Use Next.js `metadata` / `generateMetadata` for SEO.
- Prefer `next/image` for images; put static images in `public/`.
- Avoid big client bundles: don’t mark entire pages as `"use client"` unless needed.
- Be careful with third-party scripts; load lazily if possible.
- Prefer server-side fetching/caching patterns over client polling.

---

## “Gotchas” / Hard Rules
- **NEVER commit** `.env`, API keys, DB URLs, or tokens.
- Don’t rewrite large parts of the repo unless asked.
- Don’t introduce a complex architecture (monorepo, CQRS, etc.) for a personal site.
- If unsure about a change that affects structure/dependencies, **propose a plan first**.

If you want, I can also turn the “Design Principles” into a tiny pre-merge checklist (5–7 bullets) so Claude consistently self-reviews changes before finishing.

perfect so now what folders should I make before I let Claude start making and editing files

If you’re starting a Next.js (App Router) + TS + Tailwind personal site, make only the folders that give you structure without overbuilding.

Create these now (solid baseline)
app/
  layout.tsx
  page.tsx
components/
lib/
public/
Optional but smart (if you know you’ll use them soon)
app/api/              # if you’ll add contact form / endpoints soon
components/ui/        # if you want a place for small UI primitives
lib/db/               # once Prisma/Postgres is added
lib/validators/       # zod schemas, input validation
styles/               # only if you need globals beyond Tailwind
Only when you actually add Postgres/Prisma
prisma/
Why this is the right amount

app/ keeps routing/pages clean

components/ keeps UI modular

lib/ enforces separation of concerns (helpers/services)

public/ for images/icons

Quick commands to create them
mkdir -p app components lib public
mkdir -p components/ui lib/validators app/api

If you haven’t scaffolded the Next.js project yet, do that first (it creates app/, public/, configs automatically):

npx create-next-app@latest . --ts --tailwind --eslint --app

If you tell me whether you already ran create-next-app (and what your repo tree looks like), I’ll give you the exact folder set to match what you have so you don’t create duplicates.

so I have my CLAUDE.md file inside of me .claude folder which is part of my .gitignore file. Will my claude code agent still read the CLAUDE.md file before performing actions?

Yes — Claude Code will still read it as long as the file is in a location Claude Code looks for.

Two separate ideas get mixed up here:

.gitignore only affects what gets committed to GitHub. It does not affect what Claude can read locally.

Claude’s behavior depends on where the file is, not whether it’s tracked by git.

The only thing to confirm

Claude Code reliably reads CLAUDE.md from the project root.
A file named CLAUDE.md inside .claude/ may or may not be auto-loaded depending on how Claude Code is configured/version.

What I recommend (strongly)

Do this to avoid any doubt:

Keep a root CLAUDE.md (guaranteed to be read)

Put extra rules in .claude/ if you want, but don’t rely on it as the only copy.

Best setup:

./CLAUDE.md ✅ (committed)

./CLAUDE.local.md ✅ (ignored, personal tweaks)

./.claude/… ✅ (ignored tool stuff)

If you want .claude/CLAUDE.md and root

Make root CLAUDE.md tiny and point to the other file:

# Claude Instructions
See .claude/CLAUDE.md for full project rules.

But again: I’d keep the real content in root to be safe.

If you tell me whether you want this repo to be “team-ready” later, I’ll recommend whether to commit CLAUDE.md or keep it local-only.

does snapping an achillies tendon hurt?

Yeah — usually it hurts a lot at the moment it happens, then can weirdly feel less painful than you’d expect after the first minutes for some people.

What people commonly describe:

A sudden “pop” or snap in the back of the ankle/calf (some say it feels like getting kicked or hit)

Immediate sharp pain, then often a deep ache

Weakness right away — hard or impossible to push off the foot, tiptoe, or walk normally

Swelling/bruising can show up pretty fast (sometimes hours later)

But: not everyone reports extreme pain. Adrenaline + the tendon being torn (not bone) can make it feel more like “something gave out” with manageable pain.

If this is about you or someone right now: don’t try to “walk it off.” Rest, ice, keep it elevated, and get urgent assessment—especially if you can’t plantarflex (push your toes down) or you felt a pop.

## ⚠️ Data Layer — Read This First

**All data goes directly through Supabase. There is no REST API, no Express server, no intermediate backend.**

```
Screen → Controller (controllers/*.ts) → services/supabase.ts → Supabase
```

- Controllers call `supabase` directly and return typed model objects.
- `services/api/` contains SQL migration files only — it is not a running service and should not be called.
- `services/supabase.ts` is the **only** file that creates or exports the Supabase client. No other file imports from `@supabase/supabase-js`.
- **Reads**: Supabase RLS filters rows to the authenticated user automatically.
- **Inserts**: pass `user_id` explicitly — get it from `supabase.auth.getSession()`.
- **Daily writes** (habit entries, stat entries, reflection): use `.upsert()` with the appropriate `onConflict` constraint.
- DB columns are `snake_case`; TypeScript models are `camelCase`. The mapping lives in each controller's `map*()` helper.

---

## Project Summary

**Life Tracker** — a mobile-first daily life tracking app with four domains:
1) **Habits** (daily boolean completion)
2) **Tasks** (top 1–5 daily priorities)
3) **Stats** (user-selected daily metrics + graphs)
4) **Reflection** (one short daily highlight)

**North Star:** a fast, calm daily flow that’s easy to maintain and extend.

---

## Design Principles (Hard Requirements)

### Design is an iterative process
- Work in a loop: **requirements → blueprint → implement → verify → refine**.
- “Done” means:
  - All explicit requirements are implemented
  - Implicit requirements are satisfied (usability, reliability, performance, supportability, security)
  - The codebase is readable and shows a coherent, complete picture of the system

### Software Quality Attributes (optimize for these)

**Functionality**
- Implement requested behaviors completely across all four domains.
- Validate + sanitize input on all write endpoints.
- Structure auth cleanly even if it’s stubbed (so it can be replaced safely later).

**Usability**
- Mobile-first UX, minimal taps, minimal typing.
- Consistent spacing and typography; predictable navigation.
- Accessible touch targets; clear states (loading/error/empty/success).

**Reliability**
- Predictable failure: safe errors, resilient network handling.
- Avoid brittle coupling across layers; keep boundaries stable.
- Guard DB and API calls with robust validation and parameterization.

**Performance**
- Avoid unnecessary re-renders; keep screens lightweight.
- Optimize API queries; avoid N+1 patterns; return only needed fields.
- Avoid heavy dependencies unless ROI is strong.

**Supportability**
- Favor clarity over clever abstractions.
- High cohesion, low coupling, stable interfaces.
- Make it easy to add: new habits, new icons, new stats, new screens.

---

## Core Software Design Rules (Apply Always)

### Separation of Concerns
- Each layer has one job.
- UI should not know HTTP details; HTTP should not know SQL details.

### Modularity
- Prefer small, named modules with explicit interfaces.
- Keep boundaries clean; integration complexity grows with module count.

### Information Hiding
- Hide implementation decisions behind small APIs.
- Screens call `controllers/*` and never call `services/supabase.ts` directly.

### Functional Independence
- **High cohesion:** modules do one thing well.
- **Low coupling:** modules depend on stable contracts, not internals.

### Law of Demeter (Principle of Least Knowledge)
- Avoid deep reach chains across layers.
- Shape/flatten data at boundaries so components receive only what they need.

### Open/Closed (practical)
- Extend via new modules/functions rather than rewriting stable code.
- Prefer composition over inheritance.

---

## TypeScript + “OO” Principles (Use as maintainability tools)

### Abstraction
- Represent domain concepts using types that remain meaningful without implementation details.

### Liskov (interchangeability)
- If you introduce interchangeable implementations (e.g., email providers, storage backends),
  they must behave consistently under the same contract.

### Dependency Inversion
- High-level code depends on abstractions (types/functions), not concrete provider details.

---

## Commands

### Mobile app (`apps/mobile`)
```bash
# Must be run from a real terminal (Expo CLI requires interactive TTY)
cd /Users/juras/Desktop/Projects/Life-Tracker/apps/mobile
npx expo start --ios      # boots iPhone simulator; if asked about Expo Go version, answer "n"
npx expo start --android
```

### Database (Supabase)
Run the migration by pasting `services/api/src/migrations/001_initial.sql` into the **Supabase SQL Editor** and executing it. No local PostgreSQL needed.

### Environment
Create `apps/mobile/.env.local` with your Supabase credentials (get them from **Supabase Dashboard → Settings → API**):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

---

## Architecture

### Mobile app structure (`apps/mobile/src/`)

| Folder | Role |
|--------|------|
| `models/` | TypeScript interfaces only — pure types, no logic |
| `views/screens/` | Full-screen React Native components |
| `views/components/` | Reusable UI pieces |
| `controllers/` | Async functions that call Supabase directly; screens only import from here |
| `context/` | `AuthContext` (session + profile), `ThemeContext` (dark/light mode) |
| `navigation/AppNavigator.tsx` | Bottom-tab navigator; Settings tab manages sub-screen state internally |
| `services/supabase.ts` | Supabase client singleton — only Supabase import point in the app |
| `constants/icons.ts` | Icon keys for habits; mapped to Ionicons names in UI |
| `hooks/useToday.ts` | Returns today as `YYYY-MM-DD` |

`services/api/` contains SQL migrations only — not a service, not imported anywhere in the app.

### Domain model

Four core domains, each with a model file in both packages:

| Domain | Key tables |
|--------|-----------|
| Habits | `habits`, `habit_entries` (one row per habit×date, upserted) |
| Tasks | `tasks` (up to 5 per day, ordered by `sort_order`) |
| Stats | `stat_definitions` (user-configured), `stat_entries` (one per def×date, upserted) |
| Reflection | `reflection_entries` (one per user×date, upserted) |

All daily writes use PostgreSQL `ON CONFLICT ... DO UPDATE` (upsert), so the client never needs to check whether a record exists first. Dates are stored as `DATE` (no time component) for timezone-safe "today" comparisons.

### Styling
NativeWind v4 (Tailwind for React Native). Use `className` prop with Tailwind utility classes. All screens support dark mode via `dark:` prefixed classes. Theme is toggled programmatically via `ThemeContext` which calls `useColorScheme().setColorScheme` from `nativewind` and persists the preference in AsyncStorage.