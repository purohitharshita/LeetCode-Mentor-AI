

# LeetCode Mentor AI — Architecture Document

> This document is the living record of all architectural decisions, product thinking, and technical design for LeetCode Mentor AI. It is updated as the project evolves. Read it top to bottom to understand the full reasoning behind every choice.

---

## Table of Contents

1. [Product Requirements Document (PRD)](#1-product-requirements-document-prd)
2. [User Personas](#2-user-personas)
3. [MVP Scope](#3-mvp-scope)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Technology Choices](#5-technology-choices)
6. [Data Model](#6-data-model)
7. [AI Architecture](#7-ai-architecture)
8. [Feature Roadmap](#8-feature-roadmap)
9. [Key Architectural Decisions](#9-key-architectural-decisions)

---

## 1. Product Requirements Document (PRD)

### Problem Statement

Developers preparing for coding interviews face a fundamental problem: **they practice without direction.**

They solve random LeetCode problems, don't know their real weaknesses, get no feedback on their *thinking process*, and have no way to know if they're actually interview-ready. Generic resources (YouTube, NeetCode, Striver's sheet) treat everyone identically.

The result: hours of practice with poor signal-to-noise ratio, anxiety on interview day, and repeated failure on the same patterns.

### What We're Building

A platform that behaves like a real senior engineer mentoring you for interviews — one that:

- Knows where you are right now
- Knows where you need to be
- Adapts its approach based on how you're learning
- Teaches you to think, not just to memorize solutions

### Core Requirements

| Priority | Requirement | Rationale |
|---|---|---|
| P0 | User profiling & weakness identification | Without this, recommendations are generic |
| P0 | AI hint & explanation system | Core "mentor" behavior |
| P0 | Problem recommendation engine | Personalization engine |
| P1 | Topic mastery scoring | Quantifies readiness |
| P1 | Progress analytics dashboard | Shows improvement over time |
| P1 | Learning roadmap generation | Gives users a structured path |
| P2 | Mock interview sessions | Advanced feature, needs profiling to work well |
| P2 | Spaced repetition scheduling | Requires significant attempt history |
| P3 | Peer benchmarking | Requires user scale |

---

## 2. User Personas

### Persona 1 — "The Beginner" (Priya, 20)

> CS sophomore, targeting her first summer internship. Has done some online courses but freezes when she sees a LeetCode problem she hasn't seen before.

**Pain points:**
- Doesn't know where to start
- Gets overwhelmed by topics (Trees? DP? Graphs? Where first?)
- Understands solutions after watching them, but can't produce them independently
- No structured path

**What she needs:**
- Guided starting point based on her current level
- Step-by-step concept building
- Encouragement and patient explanations
- A clear answer to "am I ready yet?"

---

### Persona 2 — "The Busy Professional" (Rahul, 27)

> 3 years of backend engineering experience. Targeting FAANG. Can code well but hasn't touched DSA since college. Has 1 hour per day maximum.

**Pain points:**
- Wastes time on problems he already knows
- Doesn't know which gaps to prioritize for FAANG
- No time for inefficient practice
- Wants to know his readiness score, not just solve problems

**What he needs:**
- High-signal, personalized problem selection
- Fast identification of actual weak spots
- Time-boxed learning sessions
- Interview-readiness score with a clear gap analysis

---

### Persona 3 — "The Repeater" (Alex, 25)

> Applied to 10 companies, made it to technical rounds at 3, got rejected after coding interviews all three times. Knows the patterns, freezes under pressure, can't explain his thinking clearly.

**Pain points:**
- Knows solutions but struggles to communicate approach
- Gets rattled when a problem has a twist he didn't expect
- Needs interview simulation, not just problem solving

**What he needs:**
- Mock interview mode with follow-up questions
- Feedback on explanation quality, not just correctness
- Pressure simulation with time limits
- Analysis of what went wrong in mock sessions

---

### Persona 4 — "The Career Switcher" (Sarah, 30)

> Non-CS background. Self-taught programmer, 2 years of experience. Targeting mid-level roles at non-FAANG tech companies.

**Pain points:**
- Gaps in CS fundamentals (Big-O, data structures, recursion)
- Doesn't know what she doesn't know
- Needs foundational concept teaching before practice
- Imposter syndrome — needs confidence building

**What she needs:**
- Concept-first approach before diving into problems
- Very patient, detailed explanations
- A profile that reflects her non-traditional background
- Celebration of real progress

---

## 3. MVP Scope

The core rule for MVP: **build the minimum that makes the product genuinely useful, not just functional.**

A user must be able to come in, get a personalized experience, improve, and see that improvement reflected. That's the bar.

### MVP Includes

**User Onboarding**
- Basic profiling questionnaire (experience level, target companies, time available, topics attempted)
- Initial weak area identification from onboarding answers

**Problem Database**
- Curated set of ~150-200 problems tagged by topic, difficulty, pattern, company
- Each problem has: description, examples, hints (tiered), editorial, similar problems

**AI Mentor (Core)**
- Tiered hint system (nudge → direction → approach → pseudocode — never full solution)
- Concept explanation on demand ("explain binary search to me")
- Mistake analysis ("here's my wrong solution, what's wrong?")
- Approach feedback ("is this the right direction?")

**Attempt Tracking**
- Log each attempt: time taken, hints used, outcome (solved/gave up/partial)
- Track which topics have been attempted

**Basic Analytics**
- Topic-wise solve rate
- Hint dependency rate (are you getting better at needing fewer hints?)
- Streak tracking

**Problem Recommendations**
- Rule-based initially: based on weak topics + appropriate difficulty
- Evolves to AI-driven in V2

### MVP Excludes (deferred to V2+)

- Mock interview sessions
- Spaced repetition scheduling
- Learning roadmap generation
- Full RAG knowledge base
- Multi-agent agentic workflows
- Peer benchmarking
- Mobile app

---

## 4. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                      (Next.js Frontend)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / REST / WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                       API GATEWAY                            │
│                     (FastAPI Backend)                        │
│                                                              │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  Auth Service  │  │  User Service   │  │ Problem Svc  │  │
│  └────────────────┘  └─────────────────┘  └──────────────┘  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │ Mentor AI Svc  │  │Analytics Service│  │ Recommend Svc│  │
│  └────────────────┘  └─────────────────┘  └──────────────┘  │
└───────────┬───────────────────┬──────────────────────────────┘
            │                   │
┌───────────▼──────┐  ┌────────▼────────────────────────────┐
│   PRIMARY DB     │  │           AI LAYER                   │
│  (PostgreSQL)    │  │                                      │
│                  │  │  ┌─────────────┐  ┌──────────────┐  │
│  users           │  │  │  Claude API │  │  Embeddings  │  │
│  problems        │  │  │ (Anthropic) │  │   Service    │  │
│  attempts        │  │  └─────────────┘  └──────┬───────┘  │
│  sessions        │  │                           │          │
│  recommendations │  │  ┌────────────────────────▼───────┐  │
└──────────────────┘  │  │      Vector Database           │  │
                      │  │   (pgvector / Pinecone)        │  │
┌─────────────────┐   │  └────────────────────────────────┘  │
│  CACHE (Redis)  │   └─────────────────────────────────────┘
│  sessions       │
│  rate limits    │
│  LLM responses  │
└─────────────────┘
```

---

## 5. Technology Choices

### Frontend: Next.js (App Router)

**Why Next.js over plain React or Vite?**
- Server Components let us fetch data without client-side loading states for most views
- Built-in API routes for simple backend needs
- Strong TypeScript support
- The standard choice for production React apps

**Styling:** Tailwind CSS — utility-first, fast to iterate, pairs well with component libraries.
**Component library:** shadcn/ui — copy-paste components (not a dependency), fully customizable.

---

### Backend: FastAPI (Python)

**Why Python for the backend?**

This is the most important technology choice in the stack. Python is the right language here because:

1. The entire AI/ML ecosystem lives in Python (LangChain, Sentence Transformers, NumPy, etc.)
2. Claude's SDK, OpenAI SDK, Pinecone SDK — all Python-first
3. Data processing, embedding generation, evaluation — all Python
4. ~60% of backend work will be AI code, not REST code

**Why FastAPI over Flask or Django?**
- Async-native — critical for LLM API calls which can take 5-30 seconds
- Auto-generates OpenAPI docs
- Strong type safety with Pydantic
- Better performance than Flask for concurrent AI workloads

---

### Primary Database: PostgreSQL

**Why PostgreSQL?**
- Handles all relational data: users, problems, attempts, recommendations
- Has the `pgvector` extension — lets us store and query embeddings in the same database
- Avoids Pinecone costs early in the project
- Battle-tested, production-grade, free

---

### Cache: Redis

Three specific use cases:
1. **Session management** — store auth tokens
2. **LLM response caching** — if two users ask "explain binary search", don't pay for two API calls
3. **Rate limiting** — prevent users from hammering the LLM API

---

### LLM: Claude API (Anthropic)

**Why Claude over GPT-4?**
- Longer context window — critical for passing problem + user history + conversation
- Better at following complex system prompts — important for mentor persona
- Stronger at code explanation and nuanced teaching

**How the AI layer works:**

The "AI Mentor" is not a simple API call. It is a system with:

1. **System Prompt** — defines the mentor persona, rules (never give answers directly), tone
2. **Context Injection** — user's profile, weak areas, attempt history injected into every request
3. **Problem Context** — the current problem, its hints, its editorial
4. **Conversation Memory** — the current session history

---

### Vector Database: pgvector (MVP) → Pinecone (V2)

**Concept: Embeddings**

Embeddings are numerical representations of meaning. When you convert text to an embedding, similar texts get similar numbers. "Array traversal" and "sliding window" will have embeddings that are mathematically close to each other. "Binary search" and "recursion" will be further apart.

We use embeddings for:
1. **Semantic problem search** — "find problems similar to this one" (meaning-based, not keyword-based)
2. **RAG** (V1.5) — finding relevant concept explanations to inject into mentor responses
3. **Weakness detection** — clustering problems a user struggles with to identify patterns

For MVP, `pgvector` (a PostgreSQL extension) handles this. One database, zero extra infrastructure. We migrate to Pinecone at scale.

---

## 6. Data Model

### Conceptual Schema

```
User
├── id, email, name, created_at
├── Profile
│   ├── experience_level (beginner / intermediate / advanced)
│   ├── target_companies []
│   ├── available_hours_per_day
│   └── onboarding_completed
├── TopicMastery []
│   ├── topic_id
│   ├── mastery_score (0–100)
│   ├── problems_attempted
│   ├── problems_solved
│   └── last_practiced_at
└── Attempts []
    ├── problem_id
    ├── started_at, ended_at
    ├── outcome (solved / partial / gave_up)
    ├── hints_used (count + which tiers)
    └── code_submitted

Problem
├── id, title, slug
├── difficulty (easy / medium / hard)
├── topics []   (arrays, trees, dp, graphs ...)
├── patterns [] (sliding_window, two_pointer, bfs ...)
├── companies [] (google, meta, amazon ...)
├── Hints []
│   ├── tier (1=nudge, 2=direction, 3=approach, 4=pseudocode)
│   └── content
├── Editorial
│   ├── approach_explanation
│   ├── time_complexity, space_complexity
│   └── optimal_code
└── embedding (vector — for semantic search)

MentorSession
├── id, user_id, problem_id
├── started_at, ended_at
├── Messages []
│   ├── role (user / assistant)
│   ├── content
│   └── created_at
└── session_context (injected profile snapshot at session start)

Recommendation
├── user_id, problem_id
├── reason (weak_topic / next_difficulty / pattern_practice)
├── score (priority weight)
└── created_at, acted_on_at
```

---

## 7. AI Architecture

### Layer 1 — LLM Core (MVP)

Single-turn and multi-turn conversations with a well-engineered system prompt. Claude receives:
- Mentor persona instructions
- The problem statement
- User's profile summary
- Current conversation history

This is the foundation. Every more advanced layer builds on top of this.

---

### Layer 2 — RAG: Retrieval-Augmented Generation (V1.5)

**What is RAG?**

RAG is a pattern where, instead of relying solely on the LLM's training data to answer a question, you:
1. Embed the user's query
2. Search a knowledge base (your own curated content) for the most relevant information
3. Inject that retrieved content into the LLM prompt
4. The LLM answers using both its training + your retrieved content

**Why we need it:**

When a user asks "explain dynamic programming", we don't want Claude to give a generic textbook answer. We want it to answer using *our* curated examples, *our* problem set, and *our* teaching style. RAG gives us that control.

**Knowledge base contents (planned):**
- Concept explanations for every DSA topic
- Pattern guides (when to use sliding window, when to use BFS vs DFS, etc.)
- Common mistake catalogs per topic
- Problem-to-concept mappings

---

### Layer 3 — Agentic Workflows (V2)

**What are agents?**

An agent is an LLM that can take actions — call tools, search databases, run code, call other agents — and loop until it completes a task. Instead of one prompt → one response, an agent reasons step-by-step, decides what to do next, and acts.

**Why we need them:**

For mock interviews, a single Claude call is insufficient. We need:

```
Mock Interview Orchestrator
├── Problem Selector Agent
│   └── reads user profile → picks an appropriate problem
├── Interviewer Agent
│   └── manages the conversation, asks follow-ups, applies time pressure
├── Evaluator Agent
│   └── scores communication, approach, correctness
└── Report Generator Agent
    └── writes a structured feedback report
```

Each agent has a specific role, specific tools, and specific output format. The orchestrator coordinates them.

---

## 8. Feature Roadmap

```
MVP (Months 1–2)
├── User auth + onboarding profiling
├── Problem database (150–200 problems)
├── AI Mentor: tiered hints + concept explanations + mistake analysis
├── Attempt tracking
└── Basic topic analytics (solve rate, hint dependency, streaks)

V1 (Month 3)
├── RAG knowledge base (concept + pattern explanations)
├── Semantic problem search via embeddings
├── AI-powered problem recommendations
├── Learning roadmap generation
└── Progress dashboard

V2 (Months 4–5)
├── Mock interview agent (multi-agent pipeline)
├── Spaced repetition scheduling
├── Interview readiness score
├── Evaluation pipeline (LLM-as-judge)
└── Session replay + feedback analysis

V3 (Month 6+)
├── MCP integration (external tool use)
├── Peer benchmarking
├── Advanced evaluation metrics
└── Mobile-responsive experience
```

---

## 9. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend | Next.js + Tailwind + shadcn/ui | Production standard, SSR, fast to iterate |
| Backend | FastAPI + Python | AI ecosystem is Python; async-native for LLM calls |
| Primary DB | PostgreSQL + pgvector | Relational + embeddings in one DB for MVP |
| Cache | Redis | Sessions, rate limiting, LLM response caching |
| LLM | Claude API (Anthropic) | Long context, strong instruction following, code reasoning |
| Embeddings (MVP) | pgvector | Zero extra infrastructure cost early on |
| Embeddings (V2) | Pinecone | Scale when needed |
| Deployment (MVP) | Docker + Railway or Render | Simple, cheap, production-capable |

---

*Last updated: 2026-06-18 — Section: Initial architecture discussion*
