from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attempt import Attempt
from app.models.mastery import TopicMastery
from app.models.problem import Problem, Topic
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummary,
    DifficultyStats,
    RecentAttempt,
    TopicStat,
)


async def get_analytics_summary(db: AsyncSession, user: User) -> AnalyticsSummary:
    # All attempts
    attempts_result = await db.execute(
        select(Attempt, Problem)
        .join(Problem, Attempt.problem_id == Problem.id)
        .where(Attempt.user_id == user.id)
        .order_by(Attempt.created_at.desc())
    )
    rows = attempts_result.all()

    total_attempts = len(rows)
    total_solved = sum(1 for a, _ in rows if a.outcome == "solved")
    solve_rate = round((total_solved / total_attempts * 100) if total_attempts else 0, 1)
    avg_hints = round(sum(a.hints_used for a, _ in rows) / total_attempts if total_attempts else 0, 1)

    # Difficulty breakdown
    breakdown: dict[str, dict] = {
        "easy": {"attempted": 0, "solved": 0},
        "medium": {"attempted": 0, "solved": 0},
        "hard": {"attempted": 0, "solved": 0},
    }
    for attempt, problem in rows:
        d = problem.difficulty
        if d in breakdown:
            breakdown[d]["attempted"] += 1
            if attempt.outcome == "solved":
                breakdown[d]["solved"] += 1

    difficulty_breakdown = {
        d: DifficultyStats(
            attempted=v["attempted"],
            solved=v["solved"],
            solve_rate=round(v["solved"] / v["attempted"] * 100 if v["attempted"] else 0, 1),
        )
        for d, v in breakdown.items()
    }

    # Streak — consecutive days with at least one attempt
    attempt_dates = sorted(
        {a.created_at.date() for a, _ in rows}, reverse=True
    )
    streak = 0
    today = datetime.now(UTC).date()
    check = today
    for d in attempt_dates:
        if d == check or d == check - timedelta(days=1):
            streak += 1
            check = d - timedelta(days=1)
        else:
            break

    # Topic mastery
    mastery_result = await db.execute(
        select(TopicMastery, Topic)
        .join(Topic, TopicMastery.topic_id == Topic.id)
        .where(TopicMastery.user_id == user.id)
        .order_by(TopicMastery.mastery_score.desc())
    )
    topic_mastery = [
        TopicStat(
            topic_name=t.name,
            topic_display_name=t.display_name,
            mastery_score=m.mastery_score,
            problems_attempted=m.problems_attempted,
            problems_solved=m.problems_solved,
        )
        for m, t in mastery_result.all()
    ]

    # Recent attempts (last 10)
    recent_attempts = [
        RecentAttempt(
            problem_title=p.title,
            problem_slug=p.slug,
            difficulty=p.difficulty,
            outcome=a.outcome,
            hints_used=a.hints_used,
            time_taken_seconds=a.time_taken_seconds,
            created_at=a.created_at.isoformat(),
        )
        for a, p in rows[:10]
    ]

    return AnalyticsSummary(
        total_attempts=total_attempts,
        total_solved=total_solved,
        solve_rate=solve_rate,
        avg_hints_per_attempt=avg_hints,
        current_streak=streak,
        difficulty_breakdown=difficulty_breakdown,
        topic_mastery=topic_mastery,
        recent_attempts=recent_attempts,
    )
