import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.attempt import Attempt
from app.models.mastery import TopicMastery
from app.models.problem import Problem, ProblemTopic, Topic
from app.models.user import User
from app.schemas.attempt import CreateAttemptRequest


async def create_attempt(
    db: AsyncSession, user: User, data: CreateAttemptRequest
) -> Attempt:
    attempt = Attempt(
        id=uuid.uuid4(),
        user_id=user.id,
        problem_id=data.problem_id,
        outcome=data.outcome,
        hints_used=data.hints_used,
        hint_tiers_used=data.hint_tiers_used,
        time_taken_seconds=data.time_taken_seconds,
        code_submitted=data.code_submitted,
    )
    db.add(attempt)
    await db.flush()

    await _update_mastery(db, user, data)
    await db.commit()
    await db.refresh(attempt)
    return attempt


async def get_attempts(
    db: AsyncSession, user: User, limit: int = 20
) -> list[Attempt]:
    result = await db.execute(
        select(Attempt)
        .where(Attempt.user_id == user.id)
        .order_by(Attempt.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars())


async def get_mastery(db: AsyncSession, user: User) -> list[dict]:
    result = await db.execute(
        select(TopicMastery, Topic)
        .join(Topic, TopicMastery.topic_id == Topic.id)
        .where(TopicMastery.user_id == user.id)
        .order_by(TopicMastery.mastery_score.desc())
    )
    rows = result.all()
    return [
        {
            "topic_name": topic.name,
            "topic_display_name": topic.display_name,
            "mastery_score": mastery.mastery_score,
            "problems_attempted": mastery.problems_attempted,
            "problems_solved": mastery.problems_solved,
            "last_practiced_at": mastery.last_practiced_at,
        }
        for mastery, topic in rows
    ]


async def _update_mastery(
    db: AsyncSession, user: User, data: CreateAttemptRequest
) -> None:
    # Get topics for this problem
    result = await db.execute(
        select(ProblemTopic).where(ProblemTopic.problem_id == data.problem_id)
    )
    problem_topics = list(result.scalars())
    if not problem_topics:
        return

    solved = data.outcome == "solved"
    now = datetime.now(UTC)

    for pt in problem_topics:
        # Load or create mastery record
        existing = await db.execute(
            select(TopicMastery).where(
                TopicMastery.user_id == user.id,
                TopicMastery.topic_id == pt.topic_id,
            )
        )
        mastery = existing.scalar_one_or_none()

        if not mastery:
            mastery = TopicMastery(
                id=uuid.uuid4(),
                user_id=user.id,
                topic_id=pt.topic_id,
                problems_attempted=0,
                problems_solved=0,
                mastery_score=0.0,
            )
            db.add(mastery)

        mastery.problems_attempted += 1
        if solved:
            mastery.problems_solved += 1
        mastery.last_practiced_at = now

        mastery.mastery_score = _compute_score(
            attempted=mastery.problems_attempted,
            solved=mastery.problems_solved,
            hints_used=data.hints_used,
        )


def _compute_score(attempted: int, solved: int, hints_used: int) -> float:
    """
    Score 0–100 based on solve rate and hint dependency.
    More hints used = lower score for the same solve rate.
    """
    if attempted == 0:
        return 0.0

    solve_rate = solved / attempted

    # Hint penalty: each hint reduces score by 5 points, capped at 40% reduction
    hint_penalty = min(hints_used * 0.05, 0.4)

    raw = solve_rate * (1 - hint_penalty) * 100
    return round(min(max(raw, 0.0), 100.0), 1)
