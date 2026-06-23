from groq import Groq, RateLimitError as GroqRateLimitError, APIStatusError

from app.core.config import settings

_client: Groq | None = None


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


class RateLimitError(Exception):
    pass


class AIError(Exception):
    pass


async def chat(system_prompt: str, history: list[dict], user_message: str) -> str:
    """
    Send a message to Groq (Llama 3.3 70B) with conversation history.
    Raises RateLimitError on quota exceeded, AIError on other failures.
    """
    client = get_client()

    messages = [{"role": "system", "content": system_prompt}]

    for msg in history:
        role = "assistant" if msg["role"] == "assistant" else "user"
        messages.append({"role": role, "content": msg["content"]})

    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except GroqRateLimitError:
        raise RateLimitError(
            "Rate limit reached. Please wait a moment and try again."
        )
    except APIStatusError as e:
        raise AIError(f"AI service error: {e.message}")
    except Exception as e:
        raise AIError(f"Unexpected error: {e}")
