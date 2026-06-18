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

*Last updated: Day 2*
