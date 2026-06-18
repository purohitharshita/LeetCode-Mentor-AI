# LeetCode Mentor AI — Tech Stack

> Every technology choice is documented here with alternatives and rationale. Updated as the stack evolves.

---

## Table of Contents

1. [Frontend](#1-frontend)
2. [Backend](#2-backend)
3. [Database](#3-database)
4. [AI Stack](#4-ai-stack)
5. [Infrastructure & DevOps](#5-infrastructure--devops)
6. [Code Quality](#6-code-quality)
7. [Full Stack Summary](#7-full-stack-summary)

---

## 1. Frontend

### Framework: Next.js 15 (App Router)

| Option | Pros | Cons |
|---|---|---|
| **Next.js 15** | SSR, file-based routing, Server Components, mature ecosystem | More complexity than needed for a pure SPA |
| Vite + React SPA | Simpler, faster dev builds | No SSR, no SEO, manual routing setup |
| Remix | Excellent data loading model | Smaller ecosystem, steeper learning curve |
| SvelteKit | Leaner, faster | Different paradigm, smaller community |

**Decision: Next.js 15**
We need SSR for the dashboard and problem pages (SEO + fast first paint). Server Components let us fetch data on the server and avoid loading spinners on initial load.

---

### Language: TypeScript (strict mode)

No alternative seriously considered. Strict TypeScript catches entire categories of bugs at compile time. For a project with complex data models (user profiles, problem schemas, AI responses), type safety is non-negotiable.

---

### Styling: Tailwind CSS v4

| Option | Pros | Cons |
|---|---|---|
| **Tailwind CSS v4** | Utility-first, no context switching, tiny bundle | Verbose JSX, class name clutter |
| CSS Modules | Scoped styles, standard CSS | Slower to iterate, more files |
| Styled Components | Co-located styles | Runtime overhead, not SSR-friendly |
| Plain CSS | Maximum control | Slowest to build |

**Decision: Tailwind CSS v4** — iteration speed advantage is decisive.

---

### Component Library: shadcn/ui

| Option | Pros | Cons |
|---|---|---|
| **shadcn/ui** | Copy-paste (you own the code), built on Radix UI primitives, fully customizable | Need to add each component manually |
| MUI (Material UI) | Feature-rich, batteries included | Heavy, opinionated look, hard to customize |
| Chakra UI | Good defaults, accessible | Additional dependency, less control |
| Ant Design | Enterprise-grade | Very opinionated, heavy |

**Decision: shadcn/ui** — not a package dependency. Components are copied into the repo and owned by us. Nothing to override or fight against when building a custom product.

---

### Code Editor: Monaco Editor (`@monaco-editor/react`)

| Option | Pros | Cons |
|---|---|---|
| **Monaco Editor** | Full VS Code experience, syntax highlighting, IntelliSense | ~2MB bundle size |
| CodeMirror 6 | Lighter, modular | Less familiar interface |
| Simple `<textarea>` | Zero weight | Not acceptable for a coding platform |

**Decision: Monaco Editor** — the experience difference is massive. Users expect a real editor.

---

### Server State: TanStack Query (React Query v5)

Manages data fetched from the API — caching, background refetching, loading/error states, optimistic updates.

| Option | Pros | Cons |
|---|---|---|
| **TanStack Query v5** | Battle-tested, powerful caching, DevTools | Extra dependency |
| SWR | Simpler API | Less powerful, Vercel-opinionated |
| Redux Toolkit Query | Unified with state management | Heavyweight for what we need |
| Raw `useEffect` + `fetch` | No dependency | Reinventing the wheel, race condition bugs |

**Decision: TanStack Query** — caching and background-sync behavior alone justify it.

---

### Client State: Zustand

For UI state that doesn't come from the server (sidebar open/closed, active tab, editor theme).

| Option | Pros | Cons |
|---|---|---|
| **Zustand** | Minimal boilerplate, tiny (~1kb), simple API | Less structure than Redux |
| Redux Toolkit | Predictable, great DevTools | Significant boilerplate |
| Jotai | Atomic model, elegant | Different mental model |
| Context API | Built-in | Re-renders entire subtree, messy at scale |

**Decision: Zustand** — disappears into the background and never gets in the way.

---

## 2. Backend

### Language + Framework: Python 3.12 + FastAPI

**Why Python?**
1. The entire AI/ML ecosystem lives in Python (Anthropic SDK, sentence-transformers, NumPy, etc.)
2. ~60% of backend work will be AI code, not REST code
3. All major AI SDKs (Anthropic, OpenAI, Pinecone) are Python-first

**Why FastAPI over Flask or Django?**
- Async-native — critical for LLM API calls which can take 5–30 seconds
- Auto-generates OpenAPI docs
- Strong type safety with Pydantic v2
- Better performance than Flask for concurrent AI workloads

---

### Core Backend Packages

| Package | Purpose |
|---|---|
| `pydantic v2` | Request/response validation and serialization |
| `sqlalchemy 2.0` (async) | ORM for PostgreSQL |
| `alembic` | Database schema migrations |
| `python-jose` + `passlib[bcrypt]` | JWT auth + password hashing |
| `httpx` | Async HTTP client (for calling external APIs) |
| `python-dotenv` | Environment variable management |
| `structlog` | Structured JSON logging for production |

---

### ORM: SQLAlchemy 2.0 (Async)

| Option | Pros | Cons |
|---|---|---|
| **SQLAlchemy 2.0 async** | Mature, powerful, full async support, works with Alembic | Verbose, steeper learning curve |
| Tortoise ORM | Django-like, simpler | Smaller ecosystem |
| Prisma (Python client) | Excellent DX, type-safe | Immature Python client |
| Raw SQL (asyncpg) | Maximum control, fastest | No ORM conveniences, manual migrations |

**Decision: SQLAlchemy 2.0** — industry standard, Alembic migrations are best-in-class, handles complex relationships well.

---

### Authentication: JWT (Access + Refresh Tokens)

**How it works:**
When a user logs in, the server issues two tokens:
- **Access token** — short-lived (15–60 min), sent with every API request
- **Refresh token** — long-lived (7–30 days), used only to get a new access token

The server stores no session state — the token itself carries all needed information, verified by a cryptographic signature. This is called **stateless auth**.

| Option | Pros | Cons |
|---|---|---|
| **JWT (access + refresh)** | Stateless, scalable, works across services | Logout requires token blacklist (Redis) |
| Session-based (server-side) | Easy to invalidate | Requires session store, stateful |
| OAuth only (Google, GitHub) | No password management | Adds 3rd-party dependency |
| Supabase Auth | Managed, fast to implement | Vendor lock-in |

**Decision: JWT** — standard for REST APIs, stateless, and a core concept used everywhere in production.

---

### Package Manager: uv

`uv` is a Python package manager (from Astral, creators of Ruff) that is 10–100x faster than pip. Replaces `pip`, `venv`, and `pip-tools`.

| Option | Pros | Cons |
|---|---|---|
| **uv** | Extremely fast, modern, lockfile support | Newer tool |
| Poetry | Mature, good dependency resolution | Slow, complex |
| pip + venv | Built-in, universal | Slow, no lockfile management |
| conda | Good for data science | Overkill, heavy |

**Decision: uv** — `uv sync` in 2 seconds vs `pip install` in 45 seconds. The speed difference makes daily development noticeably better.

---

## 3. Database

### Primary: PostgreSQL 16 + pgvector

- Handles all relational data: users, problems, attempts, recommendations, sessions
- `pgvector` extension stores `vector(1536)` columns directly in PostgreSQL tables
- Supports cosine similarity, L2 distance, and inner product queries
- For MVP scale (~200 problems, ~10k users), pgvector performance is entirely sufficient
- Migration path: move to Pinecone when vector count exceeds ~500k or query latency exceeds 100ms

---

### Cache: Redis 7

Three specific use cases:
1. **Session/token storage** — refresh token storage and invalidation
2. **LLM response caching** — cache responses keyed by prompt hash (if two users ask "explain binary search", one API call serves both)
3. **Rate limiting** — prevent users from hammering the LLM API

---

### Migrations: Alembic

Alembic tracks schema changes as versioned files and applies them in order — like Git for the database schema. Every schema change goes through an Alembic migration. The database is never altered directly.

---

## 4. AI Stack

### LLM: Google Gemini (`google-generativeai`)

```
google-generativeai>=0.8.0
```

**Model:** `gemini-2.0-flash` — fast, capable, free tier.

**Why Gemini over paid alternatives?**

| Option | Free Tier | Quality | Notes |
|---|---|---|---|
| **Google Gemini** | 1M tokens/day, 1500 req/day | Excellent | Chosen — most generous free tier |
| Groq (Llama 3.3 70B) | ~14,400 req/day | Very good | OpenAI-compatible, fastest inference |
| Anthropic Claude | No free tier | Best-in-class | Paid only |
| OpenRouter | Select free models | Varies | Aggregator |

**Why direct SDK over LangChain?**

| Option | Pros | Cons |
|---|---|---|
| **Direct `google-generativeai`** | Full control, no abstraction overhead | More code for complex multi-step flows |
| LangChain | Pre-built patterns | Abstractions leak, version lock, adds complexity |
| LiteLLM | Easy provider switching | Unnecessary overhead for single-provider MVP |

**Decision: Direct SDK for MVP.** We add **LangGraph** (not LangChain) in V2 for agentic workflows.

**Get your free API key:** https://aistudio.google.com

---

### Embeddings: sentence-transformers (MVP) → OpenAI (V1)

**What is an embedding model?**
A neural network that converts text into a fixed-length vector of numbers, trained so that semantically similar texts produce numerically similar vectors.

| Option | When | Model | Dimensions | Cost |
|---|---|---|---|---|
| `sentence-transformers` | MVP | `all-MiniLM-L6-v2` | 384 | Free (runs locally) |
| OpenAI `text-embedding-3-small` | V1+ | — | 1536 | ~$0.02 / 1M tokens |

**Decision: `sentence-transformers` for MVP** — zero cost, zero API dependency, sufficient quality for ~200 problems. Switch to OpenAI embeddings when building the RAG knowledge base for better semantic quality.

---

### Vector Storage: pgvector (MVP) → Pinecone (V2)

| Option | When | Reason |
|---|---|---|
| `pgvector` | MVP | Zero extra infrastructure, lives in PostgreSQL |
| Pinecone | V2+ | When vector count exceeds ~500k or latency needs drop below 10ms |

Pinecone free tier: 100k vectors — sufficient for V2 experimentation before committing to paid plan.

---

### Agent Framework: LangGraph (V2 only)

**What is LangGraph?**
A library that models an agent as a **state machine graph**. Each node is an action (call LLM, call a tool, make a decision). Edges are transitions between states. This maps cleanly to complex multi-step AI pipelines like our Mock Interview flow:

```
[Start] → [SelectProblem] → [PresentProblem] → [WaitForResponse]
        → [EvaluateResponse] → [AskFollowUp or End] → [GenerateReport]
```

Not used in MVP. Introduced when building Mock Interviews in V2.

---

## 5. Infrastructure & DevOps

### Local Development: Docker Compose

One command (`docker compose up`) spins up the full stack locally:
- FastAPI backend
- PostgreSQL 16 + pgvector
- Redis 7
- Next.js frontend

Every developer and every deployment runs the identical environment.

---

### Deployment: Railway (MVP)

| Option | Pros | Cons |
|---|---|---|
| **Railway** | Simple, Docker support, PostgreSQL add-on, free tier | Less control than AWS |
| Render | Similar to Railway | Slower cold starts on free tier |
| Fly.io | Excellent container support, global edge | Slightly more config |
| AWS (ECS + RDS) | Full control, production-grade | Overkill for MVP, expensive to set up |
| Vercel (frontend only) | Best Next.js experience | Python backend needs separate host |

**Decision: Railway for MVP** — deploys Docker containers, has a managed PostgreSQL addon, requires almost zero DevOps knowledge. Add real infrastructure (AWS/GCP) when needed.

---

### CI/CD: GitHub Actions

Pipeline on every push to `main`:
1. Run backend tests (pytest)
2. Run frontend type check (tsc --noEmit)
3. Run linters (Ruff for Python, ESLint for TypeScript)
4. Build Docker images
5. Deploy to Railway

---

## 6. Code Quality

### Python: Ruff

Replaces `flake8`, `isort`, `pyupgrade`, and `black` — all in one tool, ~100x faster. Handles both linting and formatting.

### TypeScript: ESLint + Prettier

ESLint catches code issues. Prettier handles formatting. Standard Next.js configuration.

### Pre-commit Hooks: `pre-commit`

Runs Ruff and ESLint before every commit. Keeps the repository clean without relying on developer discipline.

---

## 7. Full Stack Summary

```
Frontend
├── Next.js 15 (App Router)
├── TypeScript (strict)
├── Tailwind CSS v4
├── shadcn/ui
├── Monaco Editor
├── TanStack Query v5
└── Zustand

Backend
├── Python 3.12
├── FastAPI
├── Pydantic v2
├── SQLAlchemy 2.0 (async)
├── Alembic (migrations)
├── JWT auth (python-jose + passlib)
└── uv (package manager)

Database
├── PostgreSQL 16 + pgvector
└── Redis 7

AI Stack
├── Google Gemini API — gemini-2.0-flash (LLM, free tier)
├── sentence-transformers → OpenAI text-embedding-3-small
├── pgvector → Pinecone (vector storage)
└── LangGraph (V2, agents only)

Infrastructure
├── Docker + Docker Compose (local dev)
├── Railway (deployment)
└── GitHub Actions (CI/CD)

Code Quality
├── Ruff (Python lint + format)
├── ESLint + Prettier (TypeScript)
└── pre-commit hooks
```

---

*Last updated: 2026-06-18 — Switched LLM from Anthropic Claude to Google Gemini (free tier)*
