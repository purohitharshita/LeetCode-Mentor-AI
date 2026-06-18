import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    problem_topics: Mapped[list["ProblemTopic"]] = relationship("ProblemTopic", back_populates="topic")
    topic_masteries: Mapped[list["TopicMastery"]] = relationship("TopicMastery", back_populates="topic")


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    difficulty: Mapped[str] = mapped_column(
        SAEnum("easy", "medium", "hard", name="difficulty_enum"),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    examples: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    constraints: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    companies: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    problem_topics: Mapped[list["ProblemTopic"]] = relationship("ProblemTopic", back_populates="problem")
    hints: Mapped[list["ProblemHint"]] = relationship(
        "ProblemHint", back_populates="problem", order_by="ProblemHint.tier"
    )
    attempts: Mapped[list["Attempt"]] = relationship("Attempt", back_populates="problem")
    mentor_sessions: Mapped[list["MentorSession"]] = relationship("MentorSession", back_populates="problem")
    recommendations: Mapped[list["Recommendation"]] = relationship("Recommendation", back_populates="problem")


class ProblemTopic(Base):
    __tablename__ = "problem_topics"

    problem_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        primary_key=True,
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        primary_key=True,
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    problem: Mapped["Problem"] = relationship("Problem", back_populates="problem_topics")
    topic: Mapped["Topic"] = relationship("Topic", back_populates="problem_topics")


class ProblemHint(Base):
    __tablename__ = "problem_hints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    problem_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tier: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    problem: Mapped["Problem"] = relationship("Problem", back_populates="hints")
