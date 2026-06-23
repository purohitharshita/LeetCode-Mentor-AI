import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.gemini import chat
from app.ai.mentor_prompt import build_opening_message, build_system_prompt
from app.models.mentor import MentorMessage, MentorSession
from app.models.problem import Problem, ProblemTopic
from app.models.user import User, UserProfile


async def _get_problem(db: AsyncSession, problem_id: uuid.UUID) -> Problem | None:
    result = await db.execute(
        select(Problem)
        .options(selectinload(Problem.problem_topics).selectinload(ProblemTopic.topic))
        .where(Problem.id == problem_id)
    )
    return result.scalar_one_or_none()


async def _get_profile(db: AsyncSession, user: User) -> UserProfile | None:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    return result.scalar_one_or_none()


async def _get_session(db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID) -> MentorSession | None:
    result = await db.execute(
        select(MentorSession)
        .options(selectinload(MentorSession.messages))
        .where(MentorSession.id == session_id, MentorSession.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def start_session(db: AsyncSession, user: User, problem_id: uuid.UUID) -> MentorSession:
    problem = await _get_problem(db, problem_id)
    if not problem:
        raise ValueError("Problem not found")

    profile = await _get_profile(db, user)

    system_prompt = build_system_prompt(problem, user, profile)
    opening = build_opening_message(problem, profile)

    session = MentorSession(
        id=uuid.uuid4(),
        user_id=user.id,
        problem_id=problem_id,
        context_snapshot={"system_prompt": system_prompt},
    )
    db.add(session)
    await db.flush()

    opening_msg = MentorMessage(
        id=uuid.uuid4(),
        session_id=session.id,
        role="assistant",
        content=opening,
    )
    db.add(opening_msg)
    await db.commit()

    result = await db.execute(
        select(MentorSession)
        .options(selectinload(MentorSession.messages))
        .where(MentorSession.id == session.id)
    )
    return result.scalar_one()


async def get_session(db: AsyncSession, session_id: uuid.UUID, user: User) -> MentorSession | None:
    return await _get_session(db, session_id, user.id)


async def send_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    user: User,
    user_message: str,
    code: str | None,
) -> MentorMessage:
    session = await _get_session(db, session_id, user.id)
    if not session:
        raise ValueError("Session not found")

    system_prompt = (session.context_snapshot or {}).get("system_prompt", "")

    if code:
        full_message = f"{user_message}\n\nHere's my current code:\n```\n{code}\n```"
    else:
        full_message = user_message

    user_msg = MentorMessage(
        id=uuid.uuid4(),
        session_id=session.id,
        role="user",
        content=full_message,
    )
    db.add(user_msg)
    await db.flush()

    history = [
        {"role": msg.role, "content": msg.content}
        for msg in sorted(session.messages, key=lambda m: m.created_at)
    ]

    ai_text = await chat(system_prompt, history, full_message)

    ai_msg = MentorMessage(
        id=uuid.uuid4(),
        session_id=session.id,
        role="assistant",
        content=ai_text,
    )
    db.add(ai_msg)
    await db.commit()
    await db.refresh(ai_msg)

    return ai_msg
