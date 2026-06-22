FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies first (layer cache — only re-runs when pyproject.toml changes)
COPY pyproject.toml .
RUN uv sync --no-dev

# Copy application code
COPY . .

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-exclude", "*.lock", "--reload-exclude", ".venv"]
