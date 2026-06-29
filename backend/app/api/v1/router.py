from fastapi import APIRouter

from app.api.v1.endpoints import analytics, attempt, auth, health, mentor, problems, users

router = APIRouter()

router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(problems.router, prefix="/problems", tags=["problems"])
router.include_router(mentor.router, prefix="/mentor", tags=["mentor"])
router.include_router(attempt.router, prefix="/attempts", tags=["attempts"])
router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
