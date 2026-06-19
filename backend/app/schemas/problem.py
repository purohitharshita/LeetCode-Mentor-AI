import uuid
from datetime import datetime

from pydantic import BaseModel


class TopicResponse(BaseModel):
    id: uuid.UUID
    name: str
    display_name: str
    description: str | None = None

    model_config = {"from_attributes": True}


class ProblemTopicResponse(BaseModel):
    name: str
    display_name: str
    is_primary: bool

    model_config = {"from_attributes": True}


class HintResponse(BaseModel):
    tier: int
    content: str

    model_config = {"from_attributes": True}


class ProblemListItem(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    difficulty: str
    companies: list[str]
    topics: list[ProblemTopicResponse]

    model_config = {"from_attributes": True}


class ProblemDetail(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    difficulty: str
    description: str
    examples: list[dict]
    constraints: list[str]
    companies: list[str]
    topics: list[ProblemTopicResponse]
    hints: list[HintResponse]

    model_config = {"from_attributes": True}


class ProblemListResponse(BaseModel):
    items: list[ProblemListItem]
    total: int
    page: int
    page_size: int
