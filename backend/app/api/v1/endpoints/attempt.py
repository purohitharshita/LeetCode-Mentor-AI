from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.users import get_current_user
from app.core.database import get_db
from app.schemas.attempt import (
    AttemptResponse,
    CreateAttemptRequest,
    TopicMasteryResponse,
)
from app.services.attempt import create_attempt, get_attempts, get_mastery

router = APIRouter()


@router.post("", response_model=AttemptResponse, status_code=201)
async def log_attempt(
    body: CreateAttemptRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    attempt = await create_attempt(db, current_user, body)
    return AttemptResponse.model_validate(attempt)


@router.get("", response_model=list[AttemptResponse])
async def list_attempts(
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    attempts = await get_attempts(db, current_user, limit)
    return [AttemptResponse.model_validate(a) for a in attempts]


@router.get("/mastery", response_model=list[TopicMasteryResponse])
async def get_topic_mastery(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    mastery = await get_mastery(db, current_user)
    return [TopicMasteryResponse(**m) for m in mastery]
