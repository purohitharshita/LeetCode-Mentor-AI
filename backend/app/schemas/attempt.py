import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator


class CreateAttemptRequest(BaseModel):
    problem_id: uuid.UUID
    outcome: Literal["solved", "partial", "gave_up"]
    hints_used: int = 0
    hint_tiers_used: list[int] = []
    time_taken_seconds: int | None = None
    code_submitted: str | None = None

    @field_validator("hints_used")
    @classmethod
    def hints_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("hints_used must be non-negative")
        return v


class AttemptResponse(BaseModel):
    id: uuid.UUID
    problem_id: uuid.UUID
    outcome: str
    hints_used: int
    hint_tiers_used: list[int]
    time_taken_seconds: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TopicMasteryResponse(BaseModel):
    topic_name: str
    topic_display_name: str
    mastery_score: float
    problems_attempted: int
    problems_solved: int
    last_practiced_at: datetime | None

    model_config = {"from_attributes": True}
