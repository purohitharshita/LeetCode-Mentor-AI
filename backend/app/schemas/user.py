import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, field_validator


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


class UpdateProfileRequest(BaseModel):
    experience_level: Literal["beginner", "intermediate", "advanced"]
    target_companies: list[str]
    available_hours_per_day: float
    onboarding_completed: bool = False

    @field_validator("target_companies")
    @classmethod
    def validate_companies(cls, v: list[str]) -> list[str]:
        allowed = {"google", "amazon", "meta", "microsoft", "apple", "bloomberg"}
        return [c.lower() for c in v if c.lower() in allowed]

    @field_validator("available_hours_per_day")
    @classmethod
    def validate_hours(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Must be greater than 0")
        return v


class AuthUserResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
