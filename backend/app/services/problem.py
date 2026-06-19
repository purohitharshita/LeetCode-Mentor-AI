from sqlalchemy import String, cast, func, select
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.problem import Problem, ProblemHint, ProblemTopic, Topic


async def get_all_topics(db: AsyncSession) -> list[Topic]:
    result = await db.execute(select(Topic).order_by(Topic.display_name))
    return list(result.scalars())


async def get_problems(
    db: AsyncSession,
    topic: str | None = None,
    difficulty: str | None = None,
    company: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Problem], int]:

    def _apply_filters(q):
        q = q.where(Problem.is_active == True)
        if difficulty:
            q = q.where(Problem.difficulty == difficulty)
        if company:
            # PostgreSQL @> operator: "array contains this value"
            q = q.where(Problem.companies.op("@>")(cast([company], ARRAY(String()))))
        if topic:
            q = q.join(Problem.problem_topics).join(ProblemTopic.topic).where(
                Topic.name == topic
            )
        return q

    # Count query — explicit select_from so SQLAlchemy always includes FROM problems
    count_query = _apply_filters(select(func.count()).select_from(Problem))
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Data query — with eager loading
    data_query = _apply_filters(
        select(Problem).options(
            selectinload(Problem.problem_topics).selectinload(ProblemTopic.topic),
        )
    )
    data_query = data_query.order_by(Problem.created_at).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(data_query)
    problems = list(result.scalars().unique())

    return problems, total


async def get_problem_by_slug(db: AsyncSession, slug: str) -> Problem | None:
    result = await db.execute(
        select(Problem)
        .options(
            selectinload(Problem.problem_topics).selectinload(ProblemTopic.topic),
            selectinload(Problem.hints),
        )
        .where(Problem.slug == slug, Problem.is_active == True)
    )
    return result.scalar_one_or_none()
