import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable

from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


class RateLimitError(Exception):
    pass


class GeminiError(Exception):
    pass


def get_model() -> genai.GenerativeModel:
    return genai.GenerativeModel(settings.GEMINI_MODEL)


async def chat(system_prompt: str, history: list[dict], user_message: str) -> str:
    """
    Send a message to Gemini with conversation history.
    Raises RateLimitError on quota exceeded, GeminiError on other failures.
    """
    model = get_model()

    gemini_history = []
    for msg in history:
        role = "model" if msg["role"] == "assistant" else "user"
        gemini_history.append({"role": role, "parts": [msg["content"]]})

    chat_session = model.start_chat(history=gemini_history)

    full_message = (
        f"{system_prompt}\n\n---\n\n{user_message}"
        if not gemini_history
        else user_message
    )

    try:
        response = chat_session.send_message(full_message)
        return response.text
    except ResourceExhausted:
        raise RateLimitError(
            "Gemini free tier rate limit reached. Please wait a minute and try again."
        )
    except ServiceUnavailable as e:
        raise GeminiError(f"Gemini service unavailable: {e}")
    except Exception as e:
        raise GeminiError(f"Gemini error: {e}")
