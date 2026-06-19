import uuid
from datetime import UTC, timedelta

import redis.asyncio as aioredis
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserProfile

REFRESH_TOKEN_PREFIX = "refresh:"


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _user_query():
    """Base query that always eagerly loads the profile relationship."""
    return select(User).options(selectinload(User.profile))


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(_user_query().where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(_user_query().where(User.id == user_id))
    return result.scalar_one_or_none()


async def register_user(db: AsyncSession, email: str, name: str, password: str) -> User:
    existing = await get_user_by_email(db, email)
    if existing:
        raise AuthError("Email already registered", status_code=409)

    user = User(
        id=uuid.uuid4(),
        email=email,
        name=name,
        password_hash=hash_password(password),
    )
    db.add(user)

    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        experience_level="beginner",
        target_companies=[],
        available_hours_per_day=1.0,
        onboarding_completed=False,
    )
    db.add(profile)

    await db.commit()

    # Re-fetch with profile eagerly loaded
    result = await db.execute(_user_query().where(User.id == user.id))
    return result.scalar_one()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(db, email)
    if not user:
        raise AuthError("Invalid email or password", status_code=401)
    if not verify_password(password, user.password_hash):
        raise AuthError("Invalid email or password", status_code=401)
    if not user.is_active:
        raise AuthError("Account is disabled", status_code=403)
    return user


async def store_refresh_token(redis: aioredis.Redis, token: str, user_id: uuid.UUID) -> None:
    key = f"{REFRESH_TOKEN_PREFIX}{token}"
    ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    await redis.setex(key, ttl, str(user_id))


async def verify_refresh_token(redis: aioredis.Redis, token: str) -> uuid.UUID:
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise AuthError("Invalid token type", status_code=401)
    except JWTError:
        raise AuthError("Invalid or expired refresh token", status_code=401)

    key = f"{REFRESH_TOKEN_PREFIX}{token}"
    user_id_str = await redis.get(key)
    if not user_id_str:
        raise AuthError("Refresh token has been revoked", status_code=401)

    return uuid.UUID(user_id_str)


async def revoke_refresh_token(redis: aioredis.Redis, token: str) -> None:
    key = f"{REFRESH_TOKEN_PREFIX}{token}"
    await redis.delete(key)


def issue_tokens(user_id: uuid.UUID) -> tuple[str, str]:
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    return access, refresh
