from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserProfile
from app.schemas.user import UpdateProfileRequest


async def get_profile(db: AsyncSession, user: User) -> UserProfile | None:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    return result.scalar_one_or_none()


async def update_profile(
    db: AsyncSession, user: User, data: UpdateProfileRequest
) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)

    profile.experience_level = data.experience_level
    profile.target_companies = data.target_companies
    profile.available_hours_per_day = data.available_hours_per_day
    profile.onboarding_completed = data.onboarding_completed

    await db.commit()
    await db.refresh(profile)
    return profile
