# LeetCode Mentor AI

AI-powered DSA interview preparation platform. Behaves like a real senior engineer mentoring you — personalized hints, concept explanations, weakness tracking, and progress analytics.

Built with FastAPI, Next.js 15, PostgreSQL + pgvector, Redis, and Groq (Llama 3.3 70B).

## Quick Start

**Prerequisites:** Docker Desktop, a Groq API key (free at [console.groq.com](https://console.groq.com)).

```bash
# 1. Clone and enter the repo
git clone https://github.com/your-username/LeetCode-Mentor-AI.git
cd LeetCode-Mentor-AI

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Start the full stack
docker compose up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/api/docs |

## Project Structure

```
LeetCode-Mentor-AI/
├── frontend/        # Next.js 15 app
├── backend/         # FastAPI app
├── docs/            # Architecture and tech stack documentation
└── docker-compose.yml
```

## Documentation

- [Architecture](docs/architecture.md) — product design, system architecture, data model, AI layers
- [Tech Stack](docs/techstack.md) — every technology choice with alternatives and rationale
- [Tables](docs/tables.md) — every database table with columns, relationships, and decisions
- [Authentication](docs/authentication.md) — JWT auth deep dive: bcrypt, access/refresh tokens, Redis revocation
- [AI Mentor](docs/aimentor.md) — Groq + Llama 3.3 70B, Socratic system prompt, session architecture, code review flow
- [Day-wise Progress](docs/day-wise-progress.md) — daily build log

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| LLM | Groq — Llama 3.3 70B (free tier, 30 req/min) |
| Deployment | Railway |
