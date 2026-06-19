from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.problem import (
    ProblemDetail,
    ProblemListResponse,
    ProblemTopicResponse,
    TopicResponse,
    HintResponse,
    ProblemListItem,
)
from app.services.problem import get_all_topics, get_problem_by_slug, get_problems

router = APIRouter()


@router.get("/topics", response_model=list[TopicResponse])
async def list_topics(db: AsyncSession = Depends(get_db)):
    topics = await get_all_topics(db)
    return topics


@router.get("", response_model=ProblemListResponse)
async def list_problems(
    topic: str | None = Query(None, description="Filter by topic slug e.g. arrays"),
    difficulty: str | None = Query(None, description="easy | medium | hard"),
    company: str | None = Query(None, description="Filter by company e.g. google"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    problems, total = await get_problems(db, topic, difficulty, company, page, page_size)

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
        items.append(
            ProblemListItem(
                id=p.id,
                title=p.title,
                slug=p.slug,
                difficulty=p.difficulty,
                companies=p.companies,
                topics=topics,
            )
        )

    return ProblemListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=ProblemDetail)
async def get_problem(slug: str, db: AsyncSession = Depends(get_db)):
    problem = await get_problem_by_slug(db, slug)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    topics = [
        ProblemTopicResponse(
            name=pt.topic.name,
            display_name=pt.topic.display_name,
            is_primary=pt.is_primary,
        )
        for pt in problem.problem_topics
    ]

    hints = [HintResponse(tier=h.tier, content=h.content) for h in problem.hints]

    return ProblemDetail(
        id=problem.id,
        title=problem.title,
        slug=problem.slug,
        difficulty=problem.difficulty,
        description=problem.description,
        examples=problem.examples,
        constraints=problem.constraints,
        companies=problem.companies,
        topics=topics,
        hints=hints,
    )
