# LeetCode Mentor AI — Session Transfer Document

> For the next Claude Code session. Read this before touching any code.

---

## Project Overview

AI-powered DSA interview prep platform. Users register, browse 47 LeetCode problems, get personalized AI mentorship (Groq + Llama 3.3 70B), write code in Monaco Editor, and track their progress via attempt logging and topic mastery scores.

**Stack:** FastAPI (Python 3.12) + Next.js 15 + PostgreSQL 16 + Redis 7 + Groq API  
**Repo:** `C:\Users\harsh\LeetCode-Mentor-AI`  
**Running via:** Docker Compose (4 containers: postgres, redis, backend, frontend)  
**Deadline:** Day 10 (today is Day 7)

---

## Architecture

```
frontend (Next.js, port 3000)
  └── proxies /api/* → backend via INTERNAL_API_URL=http://backend:8000
backend (FastAPI, port 8000)
  ├── PostgreSQL (asyncpg + SQLAlchemy 2.0 async)
  └── Redis (refresh token storage)
```

**Key constraint:** `next.config.ts` is NOT in the Docker volume mount (only `src/` and `public/` are). Any change to `next.config.ts` requires `docker compose up --build -d frontend`.

**Backend hot-reloads** via uvicorn `--reload` (excludes `*.lock` and `.venv`).  
**Frontend hot-reloads** via Next.js dev server for files in `src/`.

---

## Completed Work (Days 1–7)

### Day 1 — Bootstrap
- Docker Compose: postgres (pgvector), redis, fastapi, nextjs
- FastAPI skeleton with health endpoint, CORS, async SQLAlchemy
- Next.js skeleton with Tailwind v4, Axios client, TanStack Query

### Day 2 — Data Model
- 11 SQLAlchemy async models, Alembic migration `001_initial_schema`
- 18 DSA topics + 47 problems seeded with 4-tier hints
- Fixed: `CREATE TYPE IF NOT EXISTS` invalid in PG → used `DO $$ BEGIN ... EXCEPTION` pattern

### Day 3 — JWT Auth
- Register, login, refresh, logout, GET /users/me
- Access tokens (30min JWT) + refresh tokens (7 days, stored in Redis)
- `bcrypt` directly (dropped `passlib` — incompatible with bcrypt>=4.0)
- Fixed: async SQLAlchemy lazy-load → always use `selectinload` for relationships

### Day 4 — Problems API + Browser
- GET /topics, GET /problems (filters: topic, difficulty, company), GET /problems/{slug}
- Company filter: PostgreSQL array `@>` operator (`Problem.companies.any()` was invalid)
- Frontend: filter bar (difficulty pills + company/topic dropdowns), 3-col grid, HintAccordion

### Day 5 — Onboarding + Auth Pages
- PATCH/GET /users/profile, 3-step onboarding flow
- Split-screen login/register pages with gradient branding
- Landing page at `/`
- Fixed: uvicorn reload crash on `uv.lock` → excluded `*.lock` from `--reload-exclude` in Dockerfile

### Day 6 — AI Mentor
- Groq client (`app/ai/groq_client.py`) — started with Gemini, switched due to 15 req/min limit
- Socratic system prompt: 5-tier hint strategy, never gives answers, personalized by user profile
- Mentor session API: POST /sessions, GET /sessions/{id}, POST /sessions/{id}/chat
- `context_snapshot` JSONB stores system prompt — frozen at session start for consistency
- Monaco Editor with real LeetCode function signatures for all 47 problems × 5 languages
- Per-language code persistence (switching Java→Python→Java restores Java code)
- "Review my code" sends editor content directly to Groq
- Rate limit errors (429) shown as chat messages, not crashes

### Day 7 — Attempt Tracking + Mastery (IN PROGRESS)
- POST /attempts, GET /attempts, GET /attempts/mastery
- Mastery scoring: `(solved/attempted) × (1 - hint_penalty) × 100`
- SubmitAttempt modal: outcome picker (Solved/Partial/Gave Up), time elapsed, hints used
- Starter code guard: "Solved" disabled if code unchanged from starter template
- MasteryBar on problems page: weakest topics + "show all" toggle
- HintAccordion: `onHintRevealed` callback wired → increments `hintsUsed` counter

---

## File Structure (Key Files)

```
backend/app/
├── ai/
│   ├── groq_client.py        ← Groq SDK wrapper, RateLimitError, AIError
│   └── mentor_prompt.py      ← build_system_prompt(), build_opening_message()
├── api/v1/endpoints/
│   ├── auth.py               ← register, login, refresh, logout
│   ├── users.py              ← /me, GET/PATCH /profile, get_current_user dependency
│   ├── problems.py           ← /topics, /problems, /problems/{slug}
│   ├── mentor.py             ← /sessions, /sessions/{id}, /sessions/{id}/chat
│   └── attempt.py            ← /attempts, /attempts/mastery
├── models/
│   ├── user.py               ← User, UserProfile (has ForeignKey on user_id)
│   ├── problem.py            ← Topic, Problem, ProblemTopic, ProblemHint
│   ├── attempt.py            ← Attempt
│   ├── mastery.py            ← TopicMastery (unique on user_id+topic_id)
│   ├── mentor.py             ← MentorSession, MentorMessage
│   └── recommendation.py     ← Recommendation
├── services/
│   ├── auth.py               ← register_user, authenticate_user, token ops
│   ├── user.py               ← get_profile, update_profile
│   ├── problem.py            ← get_all_topics, get_problems, get_problem_by_slug
│   ├── mentor.py             ← start_session, send_message, get_session
│   └── attempt.py            ← create_attempt, get_attempts, get_mastery
└── core/
    ├── config.py             ← Settings (GROQ_API_KEY, GROQ_MODEL, SECRET_KEY, etc.)
    ├── database.py           ← async engine, AsyncSessionLocal, Base, get_db
    ├── security.py           ← hash_password, verify_password, create/decode JWT
    └── redis.py              ← get_redis dependency

frontend/src/
├── app/
│   ├── page.tsx              ← landing page
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── onboarding/page.tsx
│   └── problems/
│       ├── page.tsx          ← problem list with filters + MasteryBar
│       └── [slug]/page.tsx   ← split-screen: problem+editor (left), mentor chat (right)
├── components/
│   ├── AuthLayout.tsx        ← split-screen auth layout
│   ├── ProblemCard.tsx
│   ├── DifficultyBadge.tsx
│   ├── HintAccordion.tsx     ← tiered hints, onHintRevealed callback
│   ├── MentorChat.tsx        ← chat UI with typing indicator
│   ├── CodeEditor.tsx        ← Monaco wrapper, 6 languages
│   ├── SubmitAttempt.tsx     ← attempt modal, starter code guard
│   └── MasteryBar.tsx        ← topic scores, weakest topics
└── lib/
    ├── api.ts                ← Axios instance, Bearer token interceptor
    ├── auth.ts               ← register, login, updateProfile, saveTokens
    ├── problems.ts           ← fetchTopics, fetchProblems, fetchProblem
    ├── mentor.ts             ← startSession, sendMessage, getSession
    ├── attempts.ts           ← logAttempt, fetchMastery, fetchAttempts
    └── starterCode.ts        ← LeetCode function signatures (47 problems × 5 languages)
```

---

## Critical Implementation Decisions

1. **`selectinload` everywhere** — SQLAlchemy async cannot lazy-load. Always use `selectinload()` when a relationship will be serialized by Pydantic.

2. **`get_current_user` in `users.py`** — the auth dependency lives here, imported by all protected endpoints. Don't duplicate it.

3. **`context_snapshot`** — system prompt stored in DB at session start, never regenerated. Changing user profile mid-session doesn't affect ongoing mentor sessions.

4. **`INTERNAL_API_URL=http://backend:8000`** — Next.js rewrites use this Docker-internal URL. `NEXT_PUBLIC_API_URL` is unused. Changes to `next.config.ts` require image rebuild.

5. **Starter code is frontend-only** — stored in `starterCode.ts`, not the DB. Tradeoff: no migration needed, but adding new problems requires updating this file too.

6. **Two-query pattern for paginated lists** — separate count query (no `selectinload`) and data query (with `selectinload`). Never call `.subquery()` on a query with loading options.

7. **Groq over Gemini** — Gemini hit 15 req/min limit repeatedly. Groq gives 30 req/min + ~500 tok/s. Model: `llama-3.3-70b-versatile`.

8. **Mastery scoring formula:**
   ```python
   solve_rate = solved / attempted
   hint_penalty = min(hints_used * 0.05, 0.4)
   score = solve_rate * (1 - hint_penalty) * 100
   ```

---

## Coding Conventions

- **Python:** SQLAlchemy 2.0 `mapped_column` style, async everywhere, `uuid.uuid4()` for IDs
- **Pydantic:** `model_config = {"from_attributes": True}` on all response schemas
- **FastAPI:** services handle business logic, endpoints handle HTTP only
- **TypeScript:** no `any` except error handlers, `"use client"` only when needed
- **Tailwind:** dark mode via `dark:` prefix, no inline styles

---

## Known Issues / Gotchas

- `WatchfilesRustInternalError` on `uv.lock` — fixed in Dockerfile with `--reload-exclude *.lock`
- `next.config.ts` not in volume mount → config changes need `--build`
- Windows Docker: file system events unreliable → sometimes need `compose restart frontend` for hot-reload
- `docker-credential-desktop` error → remove `credsStore` from `~/.docker/config.json`
- `AuthLayout.tsx` has "Google Groq" text (user edited it) — leave as-is

---

## Pending Tasks

### Day 7 (finish today)
- [ ] Restart frontend to pick up HintAccordion + SubmitAttempt changes
- [ ] Verify full attempt flow: reveal hints → submit attempt → mastery updates

### Day 8 — Analytics Dashboard
- Page at `/analytics` showing:
  - Overall stats (total attempts, solve rate, streak)
  - Topic mastery chart (bar chart per topic)
  - Recent attempts list
  - Hint dependency trend (are you using fewer hints over time?)
- Backend: GET /analytics/summary endpoint

### Day 9 — Recommendations + Polish
- Rule-based recommendations: pick weak topics + appropriate difficulty
- Backend: GET /recommendations endpoint
- Frontend: recommended problems section on problems page
- Polish: navbar with user avatar + logout, 404 page

### Day 10 — Deploy to Railway
- Dockerfile production builds
- Railway service setup (postgres, redis, backend, frontend)
- Environment variables on Railway
- Update README with live URL

---

## Environment Variables (.env)

```
DEBUG=true
SECRET_KEY=<random 32 hex>
DATABASE_URL=postgresql+asyncpg://leetcode:password@postgres:5432/leetcode_mentor
REDIS_URL=redis://redis:6379
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=["http://localhost:3000"]
```

---

## Quick Commands

```powershell
# Start all containers
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up -d

# Rebuild backend (dependency changes)
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up --build -d backend

# Rebuild frontend (next.config.ts changes)
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up --build -d frontend

# Restart frontend (src/ changes not hot-reloading)
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose restart frontend

# Check logs
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose logs backend --tail 30

# Run migration
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose exec backend uv run alembic upgrade head

# Seed problems
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose exec backend uv run python scripts/seed.py
```
