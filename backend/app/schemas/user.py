import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserProfileResponse(BaseModel):
    experience_level: str
    target_companies: list[str]
    available_hours_per_day: float
    onboarding_completed: bool

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    is_active: bool
    created_at: datetime
    profile: UserProfileResponse | None = None

    model_config = {"from_attributes": True}


class AuthUserResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
