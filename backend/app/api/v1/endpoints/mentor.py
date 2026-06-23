import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.users import get_current_user
from app.core.database import get_db
from app.schemas.mentor import (
    ChatRequest,
    ChatResponse,
    MessageResponse,
    SessionResponse,
    StartSessionRequest,
)
from app.ai.gemini import GeminiError, RateLimitError
from app.services.mentor import get_session, send_message, start_session

router = APIRouter()


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    body: StartSessionRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        session = await start_session(db, current_user, body.problem_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return SessionResponse(
        id=session.id,
        problem_id=session.problem_id,
        started_at=session.started_at,
        messages=[MessageResponse.model_validate(m) for m in session.messages],
    )


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_mentor_session(
    session_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await get_session(db, session_id, current_user)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(
        id=session.id,
        problem_id=session.problem_id,
        started_at=session.started_at,
        messages=[MessageResponse.model_validate(m) for m in session.messages],
    )


@router.post("/sessions/{session_id}/chat", response_model=ChatResponse)
async def chat_with_mentor(
    session_id: uuid.UUID,
    body: ChatRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        ai_msg = await send_message(db, session_id, current_user, body.message, body.code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return ChatResponse(
        session_id=session_id,
        message=MessageResponse.model_validate(ai_msg),
    )
