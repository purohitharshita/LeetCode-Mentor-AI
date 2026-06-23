# LeetCode Mentor AI — AI Mentor Deep Dive

> How the AI Mentor works, why it's designed the way it is, and what makes it different from just asking ChatGPT for the answer.

---

## Table of Contents

1. [The Core Philosophy](#1-the-core-philosophy)
2. [LLM Choice — Groq + Llama 3.3 70B](#2-llm-choice--groq--llama-33-70b)
3. [Session Architecture](#3-session-architecture)
4. [The System Prompt](#4-the-system-prompt)
5. [How User Profile Personalizes Responses](#5-how-user-profile-personalizes-responses)
6. [The Full Chat Flow](#6-the-full-chat-flow)
7. [Code Review Flow](#7-code-review-flow)
8. [Error Handling](#8-error-handling)
9. [File Map](#9-file-map)

---

## 1. The Core Philosophy

The worst thing a DSA mentor can do is give you the answer. If you get the answer, you feel relief — but you've learned nothing. Next time you see a similar problem, you're stuck again.

The AI Mentor is built around one rule: **teach, never solve**.

It achieves this by being Socratic — answering questions with questions, nudging the student toward insight rather than handing it to them. The mentor:

- Asks what the student has tried before giving any hint
- Points toward the right data structure without naming it
- Walks through logic step by step, but never writes complete working code
- Ends every response with a question to keep the student thinking

This is the difference between a mentor and a search engine.

---

## 2. LLM Choice — Groq + Llama 3.3 70B

### Why Groq

| Provider | Free Tier | Speed | Quality |
|---|---|---|---|
| **Groq (Llama 3.3 70B)** | 30 req/min, 14,400 req/day | ⚡ ~500 tok/s | Very good |
| Google Gemini 2.0 Flash | 15 req/min, 1M tok/day | ~100 tok/s | Good |
| Anthropic Claude | No free tier | Fast | Best-in-class |

**We started with Gemini** — but hit the 15 req/min rate limit repeatedly during development. Groq's 30 req/min limit and ~500 tok/s inference speed makes conversations feel snappy and natural. For a real-time mentor experience, latency matters.

### Why Llama 3.3 70B specifically

- Strong reasoning capability — handles complex algorithmic explanations well
- Good instruction following — respects the "never give the answer" constraint reliably
- 128K context window — fits long conversation histories + full problem statements
- OpenAI-compatible API — easy to swap with another provider in V2 if needed

### SDK Choice

We use the `groq` SDK directly — no LangChain, no LiteLLM. The API is OpenAI-compatible, so the code is simple:

```python
response = client.chat.completions.create(
    model=settings.GROQ_MODEL,
    messages=messages,   # standard [{role, content}] format
    max_tokens=1024,
    temperature=0.7,
)
```

---

## 3. Session Architecture

Every time a user opens a problem and clicks "Start Mentor Session", a **MentorSession** is created in the database.

### Why store sessions in the DB?

- **Persistence** — the user can close the browser and resume where they left off
- **History** — the full conversation is replayed to the LLM on each message, giving it context
- **Analytics** — in V2, we analyze conversation patterns to identify where students struggle
- **Personalization** — the system prompt (which contains the problem + user profile) is stored in `context_snapshot` so it's identical across the full session

### Database tables

```
mentor_sessions
├── id (UUID)
├── user_id → users.id
├── problem_id → problems.id
├── started_at
├── ended_at (nullable — set when user navigates away, V2)
└── context_snapshot (JSONB) ← stores the system prompt

mentor_messages
├── id (UUID)
├── session_id → mentor_sessions.id
├── role ("user" | "assistant")
├── content (full text)
└── created_at
```

### The context_snapshot pattern

When a session starts, `build_system_prompt()` generates a detailed system prompt and stores it in `context_snapshot`. Every subsequent message in that session uses the **same stored system prompt** — not a freshly generated one.

**Why?** If the user updates their profile mid-session, we don't want the mentor to suddenly behave differently. The session context is frozen at the start, making the experience consistent.

---

## 4. The System Prompt

The system prompt is the most important piece of the mentor. It defines the mentor's persona, constraints, and behavior. Here's the structure:

```
You are an expert DSA interview mentor...

## Your Persona
- Patient, encouraging, Socratic teaching style
- NEVER give away the complete solution
- Ask questions that guide discovery

## Student Profile
- Experience level: {beginner | intermediate | advanced}
- Target companies: {google, amazon, ...}
- Adjust explanations to match their level

## Current Problem
- Title, difficulty, topics
- Full problem statement

## Your Hint Strategy (in order)
1. Ask what they've tried
2. Nudge toward right data structure (without naming it)
3. Name the approach, ask about implementation
4. Walk through logic step by step
5. Last resort: pseudocode — NEVER complete code

## Rules
- Never write complete, runnable code
- Never answer "what is the answer?" directly
- If student shares code, analyze it with a guiding question
- Keep hints concise (2-4 sentences)
- End every response with a question
```

### Why the 5-tier hint strategy?

Most students give up too early and jump straight to solutions. The tier system forces a progression:

```
Tier 1 — Nudge         "What data structure gives you O(1) lookup?"
Tier 2 — Direction     "Think about a hash map — how would you use it here?"
Tier 3 — Approach      "For each number, check if its complement exists..."
Tier 4 — Logic walkthrough  "Here's the logic step by step: ..."
Tier 5 — Pseudocode    "Here's pseudocode — now implement it yourself"
```

Each tier is only reached if the student is genuinely stuck. The mentor asks questions at each step before moving deeper.

### Why temperature = 0.7?

- **0.0** — Deterministic, robotic responses. Same hint every time.
- **0.7** — Slight creativity, more natural conversational tone.
- **1.0+** — Too unpredictable, might violate the "no answer" constraint.

0.7 gives natural variation while keeping the mentor reliably on-script.

---

## 5. How User Profile Personalizes Responses

When a session starts, `build_system_prompt()` reads the user's profile and injects it:

```python
def build_system_prompt(problem, user, profile):
    experience = profile.experience_level   # "beginner" | "intermediate" | "advanced"
    companies = ", ".join(profile.target_companies)  # "google, amazon"
    ...
```

**Effect on mentor behavior:**

| Profile | Mentor behavior |
|---|---|
| `beginner` | Slower pace, more analogies, more encouraging language, explains fundamentals |
| `intermediate` | Assumes basic pattern knowledge, focuses on optimization and edge cases |
| `advanced` | Cuts to the chase, expects pattern recognition, focuses on complexity analysis |

**Opening message also adapts:**

```python
def build_opening_message(problem, profile):
    if experience == "beginner":
        tone = "Take your time — there's no rush. "
    elif experience == "advanced":
        tone = "Let's cut to the chase. "
    else:
        tone = ""
```

**Target companies** are included in the system prompt so the mentor can reference company-specific interview patterns. A student targeting Google gets more focus on optimization and follow-up questions about time/space complexity.

---

## 6. The Full Chat Flow

```
User clicks "Start Mentor Session"
        │
        ▼
POST /api/v1/mentor/sessions  { problem_id }
        │
        ▼
services/mentor.py → start_session()
  1. Load problem with topics (selectinload)
  2. Load user profile
  3. Build system prompt → build_system_prompt(problem, user, profile)
  4. Build opening message → build_opening_message(problem, profile)
  5. Save MentorSession to DB (context_snapshot = {system_prompt})
  6. Save opening MentorMessage (role="assistant")
  7. Return session with messages
        │
        ▼
Frontend renders opening message in chat UI
        │
User types a message and sends
        │
        ▼
POST /api/v1/mentor/sessions/{id}/chat  { message, code? }
        │
        ▼
services/mentor.py → send_message()
  1. Load session + all existing messages
  2. Extract system_prompt from context_snapshot
  3. If code attached: append code block to message
  4. Save user MentorMessage to DB
  5. Build full history: [system_prompt] + all prior messages + new message
  6. Call Groq API → groq_client.chat(system_prompt, history, message)
  7. Save AI MentorMessage to DB
  8. Return AI message
        │
        ▼
Frontend appends AI message to chat
```

### Why replay full history on every message?

LLMs are stateless — they have no memory between API calls. To maintain a coherent conversation, every call includes the full history. Groq's 128K context window means this works for long sessions without truncation.

---

## 7. Code Review Flow

When a user writes code in the Monaco Editor and clicks **"Review my code"**:

```
User clicks "Review my code"
        │
        ▼
Frontend: reads code directly from editor state
  userMessage = "Please review my code."
  code = current editor content
        │
        ▼
POST /api/v1/mentor/sessions/{id}/chat
  { message: "Please review my code...", code: "class Solution:..." }
        │
        ▼
Backend: if code provided, appends to message:
  full_message = f"{message}\n\nHere's my current code:\n```\n{code}\n```"
        │
        ▼
Groq receives:  message + full code block
        │
        ▼
Mentor analyzes code and responds with targeted feedback
  e.g. "Your approach is correct — but look at line 3.
        What happens when the array has duplicate values?
        How would you handle that case?"
```

**Key design decision:** The user sees "Please review my code." in the chat — clean and readable. The actual code is attached silently in the API call. The mentor receives both and responds accordingly.

---

## 8. Error Handling

### Rate limits (429)

Groq's free tier allows 30 requests/minute. If exceeded:

```
Backend  → catches GroqRateLimitError
         → raises RateLimitError
         → endpoint returns HTTP 429

Frontend → catches 429
         → injects error as assistant message in chat:
           "⏳ Rate limit reached. Please wait a moment and try again."
```

The app never crashes. The error appears as a chat bubble — the user just waits and retries.

### Service errors (502)

If Groq is down or returns an unexpected error:

```
Backend → catches APIStatusError
        → raises AIError
        → endpoint returns HTTP 502

Frontend → catches 502
         → injects error as assistant message:
           "⚠️ AI service is temporarily unavailable. Please try again shortly."
```

---

## 9. File Map

```
backend/
└── app/
    ├── ai/
    │   ├── groq_client.py      ← Groq SDK wrapper, RateLimitError, AIError
    │   └── mentor_prompt.py    ← build_system_prompt(), build_opening_message()
    ├── schemas/
    │   └── mentor.py           ← StartSessionRequest, ChatRequest, SessionResponse, ChatResponse
    ├── services/
    │   └── mentor.py           ← start_session(), send_message(), get_session()
    └── api/v1/endpoints/
        └── mentor.py           ← POST /sessions, GET /sessions/{id}, POST /sessions/{id}/chat

frontend/
└── src/
    ├── app/problems/[slug]/
    │   └── page.tsx            ← split-screen layout, session state, handleSend, handleSendWithCode
    ├── components/
    │   ├── MentorChat.tsx      ← chat UI, typing indicator, message bubbles, input
    │   └── CodeEditor.tsx      ← Monaco editor, language selector, VS Code dark theme
    └── lib/
        ├── mentor.ts           ← startSession(), sendMessage(), getSession() API calls
        └── starterCode.ts      ← LeetCode function signatures for all 47 problems × 5 languages
```

---

*Last updated: Day 6 — AI Mentor implemented and verified*
