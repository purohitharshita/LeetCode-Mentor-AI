# LeetCode Mentor AI — Database Tables

> Complete data model reference. Every table, every column, every decision documented. Updated as the schema evolves.

---

## Table of Contents

1. [ER Diagram](#er-diagram)
2. [users](#1-users)
3. [user_profiles](#2-user_profiles)
4. [topics](#3-topics)
5. [problems](#4-problems)
6. [problem_topics](#5-problem_topics)
7. [problem_hints](#6-problem_hints)
8. [attempts](#7-attempts)
9. [topic_mastery](#8-topic_mastery)
10. [mentor_sessions](#9-mentor_sessions)
11. [mentor_messages](#10-mentor_messages)
12. [recommendations](#11-recommendations)
13. [Key Decisions](#key-decisions)

---

## ER Diagram

```
users (1) ──────── (1) user_profiles
  │
  │ (1)
  ├── (many) attempts (many) ──── (1) problems (many) ──── (many) topics
  │                                      │ (1)
  ├── (many) topic_mastery (many)─topics  │
  │                                      ├── (many) problem_hints
  ├── (many) mentor_sessions             └── (many) problem_topics
  │              │ (1)
  │         (many) mentor_messages
  │
  └── (many) recommendations
```

---

## 1. `users`

Auth identity. Kept lean — only auth-related fields live here.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Safe to expose in URLs |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash, never plaintext |
| `is_active` | BOOLEAN | default true | Soft disable without deleting data |
| `created_at` | TIMESTAMPTZ | default now() | Always UTC |
| `updated_at` | TIMESTAMPTZ | default now() | Updated on every write |

**Relationships:**
- One → one `user_profiles`
- One → many `attempts`
- One → many `topic_mastery`
- One → many `mentor_sessions`
- One → many `recommendations`

---

## 2. `user_profiles`

Learning context for a user. Separated from `users` so auth concerns stay clean.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id, UNIQUE | One profile per user |
| `experience_level` | ENUM | NOT NULL | `beginner`, `intermediate`, `advanced` |
| `target_companies` | TEXT[] | default `{}` | e.g. `["google", "meta", "amazon"]` |
| `available_hours_per_day` | FLOAT | default 1.0 | Used to pace recommendations |
| `onboarding_completed` | BOOLEAN | default false | Gates the main app experience |
| `created_at` | TIMESTAMPTZ | default now() | |
| `updated_at` | TIMESTAMPTZ | default now() | |

**Why separate from `users`?**
Auth concerns (email, password, is_active) belong in `users`. Learning context (experience, goals, availability) belongs in `user_profiles`. Mixing them creates a table that is hard to reason about and harder to extend.

---

## 3. `topics`

Master list of DSA topics. Normalized — problems reference this table via `problem_topics`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | slug form: `dynamic_programming` |
| `display_name` | VARCHAR(100) | NOT NULL | Human form: `Dynamic Programming` |
| `description` | TEXT | nullable | Short explanation of the topic |

**Seeded topics:**
`arrays`, `strings`, `hash_maps`, `two_pointers`, `sliding_window`, `binary_search`, `linked_lists`, `stacks`, `queues`, `trees`, `binary_search_trees`, `heaps`, `graphs`, `bfs`, `dfs`, `dynamic_programming`, `backtracking`, `greedy`, `bit_manipulation`, `math`

**Why a separate table instead of storing strings on problems?**
- Filtering by topic becomes an indexed JOIN, not a string scan
- Topic mastery scores need a consistent `topic_id` to reference
- Adding metadata (description, order, difficulty weight) is clean

---

## 4. `problems`

The core content of the platform.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `title` | VARCHAR(255) | NOT NULL | e.g. `Two Sum` |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | e.g. `two-sum` — used in URLs |
| `difficulty` | ENUM | NOT NULL | `easy`, `medium`, `hard` |
| `description` | TEXT | NOT NULL | Full problem statement |
| `examples` | JSONB | NOT NULL | Array of `{input, output, explanation}` |
| `constraints` | TEXT[] | default `{}` | e.g. `["1 <= nums.length <= 10^4"]` |
| `companies` | TEXT[] | default `{}` | e.g. `["google", "amazon"]` |
| `url` | VARCHAR(500) | nullable | Original LeetCode URL |
| `is_active` | BOOLEAN | default true | Soft remove without deleting |
| `created_at` | TIMESTAMPTZ | default now() | |

**Why `examples` as JSONB?**
Examples have a consistent structure `{input, output, explanation}` but vary in content. JSONB is structured, queryable, and avoids a separate `problem_examples` table that would add complexity for no benefit.

**Why `companies` as TEXT[]?**
Simple list with no extra metadata needed. A join table would be over-engineering at this scale.

---

## 5. `problem_topics` (junction table)

Many-to-many between `problems` and `topics`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `problem_id` | UUID | FK → problems.id | Composite PK |
| `topic_id` | UUID | FK → topics.id | Composite PK |
| `is_primary` | BOOLEAN | default false | Marks the dominant topic |

**Primary Key:** `(problem_id, topic_id)`

**Why `is_primary`?**
A problem like Two Sum touches both `arrays` and `hash_maps`. When the recommendation engine looks for array problems, it should weight problems where arrays is the *primary* topic more heavily.

---

## 6. `problem_hints`

Tiered hints for each problem. Core to the mentor experience — never give the answer, guide thinking.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `problem_id` | UUID | FK → problems.id | |
| `tier` | INTEGER | NOT NULL | 1–4 |
| `content` | TEXT | NOT NULL | The hint text |

**Unique constraint:** `(problem_id, tier)` — one hint per tier per problem.

**Tier philosophy:**

| Tier | Name | What it does |
|---|---|---|
| 1 | Nudge | Points toward the right data structure or approach without naming it |
| 2 | Direction | Names the approach, asks the user to figure out implementation |
| 3 | Approach | Walks through the logic step by step, no code |
| 4 | Pseudocode | Full pseudocode outline — last resort before giving up |

---

## 7. `attempts`

Every interaction a user has with a problem — solved, partial, or gave up.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `problem_id` | UUID | FK → problems.id | |
| `outcome` | ENUM | NOT NULL | `solved`, `partial`, `gave_up` |
| `hints_used` | INTEGER | default 0 | Total hint count |
| `hint_tiers_used` | INTEGER[] | default `{}` | Which tiers: `[1, 2]` |
| `time_taken_seconds` | INTEGER | nullable | Duration of the attempt |
| `code_submitted` | TEXT | nullable | Stored for AI mistake analysis |
| `created_at` | TIMESTAMPTZ | default now() | |

**Why track `hint_tiers_used` not just `hints_used`?**
A user who only ever needs Tier 1 nudges is stronger than one who always needs Tier 4 pseudocode. This distinction feeds directly into the mastery score calculation.

**Why allow multiple attempts per (user, problem)?**
Improvement is the whole point. We want to see a user go from "gave_up + 4 hints" to "solved + 1 hint" over time.

---

## 8. `topic_mastery`

Computed mastery score per user per topic. Updated after every attempt.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `topic_id` | UUID | FK → topics.id | |
| `mastery_score` | FLOAT | default 0.0 | 0–100 |
| `problems_attempted` | INTEGER | default 0 | |
| `problems_solved` | INTEGER | default 0 | |
| `last_practiced_at` | TIMESTAMPTZ | nullable | |

**Unique constraint:** `(user_id, topic_id)` — one score per user per topic.

**Mastery score formula (MVP):**
```
base_score    = (problems_solved / problems_attempted) * 100
hint_penalty  = average(hints_used across attempts) * 5
mastery_score = max(0, base_score - hint_penalty)
```

Example: 8/10 solved, avg 2 hints used → `80 - 10 = 70`

**Why store computed score instead of always calculating?**
Read performance. The dashboard and recommendations read mastery scores constantly. Recalculating from raw attempts on every read would be slow. We recalculate and store on every write (after each attempt).

---

## 9. `mentor_sessions`

One session per user+problem AI mentor interaction.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `problem_id` | UUID | FK → problems.id | |
| `started_at` | TIMESTAMPTZ | default now() | |
| `ended_at` | TIMESTAMPTZ | nullable | null = session still open |
| `context_snapshot` | JSONB | nullable | User profile snapshot at session start |

**Why `context_snapshot`?**
The AI mentor personalizes responses using the user's profile (experience level, weak topics, attempt history). We snapshot this at session start so the conversation stays consistent — if the user's profile updates mid-session, the AI doesn't suddenly shift its tone or assumptions.

---

## 10. `mentor_messages`

Every message exchanged in a mentor session.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `session_id` | UUID | FK → mentor_sessions.id | |
| `role` | ENUM | NOT NULL | `user`, `assistant` |
| `content` | TEXT | NOT NULL | The message text |
| `created_at` | TIMESTAMPTZ | default now() | Ordered by this |

**Why not store conversation as a JSONB array on `mentor_sessions`?**
Individual messages need to be queryable — for analytics, for replaying sessions, for searching what the AI said. A JSONB blob makes that impossible without loading the entire conversation.

---

## 11. `recommendations`

Problems the system has recommended to a user.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `problem_id` | UUID | FK → problems.id | |
| `reason` | ENUM | NOT NULL | `weak_topic`, `next_difficulty`, `pattern_practice`, `revision` |
| `score` | FLOAT | NOT NULL | Priority weight — higher = show first |
| `is_acted_on` | BOOLEAN | default false | Did the user attempt this problem? |
| `created_at` | TIMESTAMPTZ | default now() | |
| `acted_on_at` | TIMESTAMPTZ | nullable | When the user started the problem |

**Reason types:**

| Reason | When used |
|---|---|
| `weak_topic` | User's mastery score for a topic is below 50 |
| `next_difficulty` | User is consistently solving easy — time for medium |
| `pattern_practice` | User hasn't seen a specific pattern (sliding window, etc.) |
| `revision` | User solved this before but hasn't touched it in 14+ days |

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Primary keys | UUID | Safe to expose in URLs, no sequential guessing |
| Timestamps | TIMESTAMPTZ | Always UTC, no timezone ambiguity |
| Topics | Normalized table | Indexed filtering, consistent IDs, extensible |
| Problem examples | JSONB | Structured but flexible, no extra join table |
| Problem companies | TEXT[] | Simple list, no metadata needed, no join table |
| Hints | Separate table with tiers | Core product feature, individually queryable |
| Mastery score | Computed + stored | Fast reads, recalculated on every attempt write |
| Session context | Snapshotted at start | Consistent AI context across the session |
| Conversation | Individual message rows | Queryable, replayable, analytics-ready |

---

*Last updated: 2026-06-18 — Initial data model design*
