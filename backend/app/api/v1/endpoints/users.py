import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.schemas.user import UpdateProfileRequest, UserProfileResponse, UserResponse
from app.services.auth import get_user_by_id
from app.services.user import get_profile, update_profile

router = APIRouter()
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/profile", response_model=UserProfileResponse)
async def get_my_profile(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await get_profile(db, current_user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfileResponse.model_validate(profile)


@router.patch("/profile", response_model=UserProfileResponse)
async def update_my_profile(
    body: UpdateProfileRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await update_profile(db, current_user, body)
    return UserProfileResponse.model_validate(profile)
