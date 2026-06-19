from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

import redis.asyncio as aioredis

from app.core.database import get_db
from app.core.redis import get_redis
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import AuthUserResponse, UserResponse
from app.services.auth import (
    AuthError,
    authenticate_user,
    issue_tokens,
    register_user,
    revoke_refresh_token,
    store_refresh_token,
    verify_refresh_token,
    get_user_by_id,
)

router = APIRouter()


@router.post("/register", response_model=AuthUserResponse, status_code=201)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    try:
        user = await register_user(db, body.email, body.name, body.password)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    access, refresh = issue_tokens(user.id)
    await store_refresh_token(redis, refresh, user.id)

    return AuthUserResponse(
        access_token=access,
        refresh_token=refresh,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthUserResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    try:
        user = await authenticate_user(db, body.email, body.password)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    access, refresh = issue_tokens(user.id)
    await store_refresh_token(redis, refresh, user.id)

    return AuthUserResponse(
        access_token=access,
        refresh_token=refresh,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    try:
        user_id = await verify_refresh_token(redis, body.refresh_token)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    user = await get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    from app.core.security import create_access_token
    return AccessTokenResponse(access_token=create_access_token(user_id))


@router.post("/logout")
async def logout(
    body: RefreshRequest,
    redis: aioredis.Redis = Depends(get_redis),
):
    await revoke_refresh_token(redis, body.refresh_token)
    return {"message": "Logged out successfully"}
