from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.users import get_current_user
from app.core.database import get_db
from app.models.attempt import Attempt
from app.models.mastery import TopicMastery
from app.models.problem import Problem, ProblemTopic, Topic
from app.schemas.problem import ProblemListItem, ProblemTopicResponse

router = APIRouter()


@router.get("", response_model=list[ProblemListItem])
async def get_recommendations(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Find weak topics (mastery < 50, must have attempted at least one)
    mastery_result = await db.execute(
        select(TopicMastery)
        .where(
            TopicMastery.user_id == current_user.id,
            TopicMastery.mastery_score < 50,
            TopicMastery.problems_attempted > 0,
        )
        .order_by(TopicMastery.mastery_score.asc())
        .limit(3)
    )
    weak_masteries = list(mastery_result.scalars())

    if not weak_masteries:
        return []

    weak_topic_ids = [m.topic_id for m in weak_masteries]

    # Get problems the user has already attempted
    attempted_result = await db.execute(
        select(Attempt.problem_id).where(Attempt.user_id == current_user.id)
    )
    attempted_ids = {row for row in attempted_result.scalars()}

    # Find unsolved problems from weak topics
    problems_result = await db.execute(
        select(Problem)
        .options(selectinload(Problem.problem_topics).selectinload(ProblemTopic.topic))
        .join(Problem.problem_topics)
        .where(
            ProblemTopic.topic_id.in_(weak_topic_ids),
            Problem.is_active == True,
            Problem.id.notin_(attempted_ids) if attempted_ids else True,
        )
        .limit(5)
    )
    problems = list(problems_result.scalars().unique())

    items = []
    for p in problems:
        topics = [
            ProblemTopicResponse(
                name=pt.topic.name,
                display_name=pt.topic.display_name,
                is_primary=pt.is_primary,
            )
            for pt in p.problem_topics
        ]
        items.append(ProblemListItem(
            id=p.id,
            title=p.title,
            slug=p.slug,
            difficulty=p.difficulty,
            companies=p.companies,
            topics=topics,
        ))

    return items
