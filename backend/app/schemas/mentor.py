import uuid
from datetime import datetime

from pydantic import BaseModel


class StartSessionRequest(BaseModel):
    problem_id: uuid.UUID


class ChatRequest(BaseModel):
    message: str
    code: str | None = None


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionResponse(BaseModel):
    id: uuid.UUID
    problem_id: uuid.UUID
    started_at: datetime
    messages: list[MessageResponse]

    model_config = {"from_attributes": True}


class ChatResponse(BaseModel):
    message: MessageResponse
    session_id: uuid.UUID
