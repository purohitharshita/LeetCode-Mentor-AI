# LeetCode Mentor AI — Day-Wise Progress

> Updated at the end of each day. Tracks what was built, decided, and fixed.

---

## Day 1 — Project Bootstrap

- Defined 10-day MVP scope, cut RAG/agents/mock interviews to V2
- Created full monorepo structure: `frontend/`, `backend/`, `docs/`
- Configured Docker Compose with PostgreSQL 16 + pgvector, Redis 7, FastAPI, Next.js
- Built FastAPI skeleton: CORS, async SQLAlchemy engine, Redis client, health endpoint
- Built Next.js skeleton: Tailwind v4, TypeScript strict, TanStack Query, Zustand, Axios client
- Fixed Docker PATH issue and `hatchling` build error (`packages = ["app"]`)
- Verified all 4 containers healthy via `GET /api/v1/health` → `{"status":"ok"}`

---

## Day 2 — Data Model, Migration, Seed Data

- Designed complete data model: 11 tables covering users, problems, attempts, mastery, mentor sessions, recommendations
- Wrote all SQLAlchemy async models with proper relationships and type annotations
- Wrote Alembic migration `001_initial_schema` — all tables, ENUMs, indexes, constraints
- Fixed two migration bugs: `CREATE TYPE IF NOT EXISTS` not valid in PostgreSQL (used `DO $$ BEGIN ... EXCEPTION` pattern), `create_type=False` for ENUM references inside `create_table`
- Fixed missing `ForeignKey` on `UserProfile.user_id` in SQLAlchemy model
- Wrote seed script — 18 DSA topics + 47 problems with 4-tier hints each
- Verified: 16 easy, 30 medium, 1 hard problems across 18 topics in PostgreSQL

---

## Day 3 — JWT Authentication

- Built complete auth system: register, login, refresh, logout, GET /users/me
- Implemented JWT access tokens (30 min) + refresh tokens (7 days) stored in Redis
- Used `bcrypt` directly — dropped `passlib` which is incompatible with `bcrypt >= 4.0`
- Fixed async SQLAlchemy lazy-load bug: used `selectinload` to eagerly load `user.profile`
- Protected routes use `HTTPBearer` + `get_current_user` dependency injection pattern
- All 5 endpoints verified via Swagger UI: register → login → /me → logout → refresh (401)

---

## Day 4 — Problems API + Frontend Pages

- Built 3 backend endpoints: GET /topics, GET /problems (filtered + paginated), GET /problems/{slug}
- Built Pydantic schemas for problems: TopicResponse, ProblemListItem, ProblemDetail
- Built problem service with `selectinload` for nested topic + hint relationships
- Fixed count query bug: `select(func.count(Problem.id))` needed explicit `select_from(Problem)`
- Built frontend: problems list page with topic/difficulty filters + pagination
- Built problem detail page with description, examples, constraints, company tags
- Built `HintAccordion` component — reveals hints one tier at a time (nudge → pseudocode)
- Fixed Docker networking bug: `next.config.ts` proxy used `INTERNAL_API_URL=http://backend:8000` instead of `localhost`; required frontend image rebuild since `next.config.ts` is not in the volume mount
- Added company filter — fixed PostgreSQL array containment using `@>` operator (`Problem.companies.any()` was invalid)
- Redesigned filter UI: replaced sidebar with horizontal filter bar — difficulty pills, company dropdown, topic dropdown with active filter chips

---

## Day 5 — Onboarding, Login/Register Pages

- Built `PATCH /api/v1/users/profile` and `GET /api/v1/users/profile` endpoints
- Built `UpdateProfileRequest` schema with validation (experience level, companies, hours)
- Built 3-step onboarding flow: experience level → target companies → daily schedule
- Built attractive split-screen login and register pages with gradient branding panel
- Built landing page (`/`) with "Get started" and "Sign in" CTAs
- Auth flow: register → `/onboarding` (new users) or `/problems` (returning users)
- Fixed recurring `WatchfilesRustInternalError` on `uv.lock` — excluded `*.lock` and `.venv` from uvicorn reload watcher in Dockerfile
- Full flow verified: register → onboarding → problems → login → problems (skips onboarding)

---

## Day 6 — AI Mentor, Monaco Editor, Split-Screen Problem Page

- Built Groq AI client (`groq_client.py`) with Llama 3.3 70B — started with Gemini but switched due to 15 req/min rate limit hitting repeatedly
- Built Socratic system prompt (`mentor_prompt.py`) — 5-tier hint strategy, persona, user profile injection, "never give the answer" rules
- Built mentor session API: `POST /sessions`, `GET /sessions/{id}`, `POST /sessions/{id}/chat`
- Sessions store `context_snapshot` (system prompt) in DB so persona is consistent across the full session
- Built `MentorChat` component with typing indicator, message bubbles, and "Review my code" shortcut
- Built `CodeEditor` component wrapping Monaco Editor — VS Code dark theme, 6 languages, macOS-style toolbar
- Full split-screen problem page redesign: problem/hints tabs + Monaco editor (left) + AI Mentor chat (right)
- Added real LeetCode function signatures for all 47 problems × 5 languages (`starterCode.ts`)
- Per-language code persistence — switching Java → Python → Java restores Java code
- "Review my code" sends editor content directly to mentor — no copy-pasting
- Rate limit errors (429) and service errors (502) shown as friendly chat messages instead of crashing
- Wrote `docs/aimentor.md` — deep dive on Groq choice, system prompt design, session architecture, code review flow

---

*Last updated: Day 6*
