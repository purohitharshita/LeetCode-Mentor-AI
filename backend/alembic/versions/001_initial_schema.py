"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create ENUMs using DO blocks — the only safe idempotent way in PostgreSQL
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE experience_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE difficulty_enum AS ENUM ('easy', 'medium', 'hard');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE outcome_enum AS ENUM ('solved', 'partial', 'gave_up');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE message_role_enum AS ENUM ('user', 'assistant');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE recommendation_reason_enum AS ENUM ('weak_topic', 'next_difficulty', 'pattern_practice', 'revision');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)

    # Enum references that won't auto-create (create_type=False)
    experience_level = postgresql.ENUM("beginner", "intermediate", "advanced", name="experience_level_enum", create_type=False)
    difficulty = postgresql.ENUM("easy", "medium", "hard", name="difficulty_enum", create_type=False)
    outcome = postgresql.ENUM("solved", "partial", "gave_up", name="outcome_enum", create_type=False)
    message_role = postgresql.ENUM("user", "assistant", name="message_role_enum", create_type=False)
    recommendation_reason = postgresql.ENUM("weak_topic", "next_difficulty", "pattern_practice", "revision", name="recommendation_reason_enum", create_type=False)

    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # user_profiles
    op.create_table(
        "user_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("experience_level", experience_level, nullable=False),
        sa.Column("target_companies", postgresql.ARRAY(sa.String()), server_default="{}"),
        sa.Column("available_hours_per_day", sa.Float(), server_default="1.0"),
        sa.Column("onboarding_completed", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_user_profiles_user_id", "user_profiles", ["user_id"])

    # topics
    op.create_table(
        "topics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_index("ix_topics_name", "topics", ["name"])

    # problems
    op.create_table(
        "problems",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False, unique=True),
        sa.Column("difficulty", difficulty, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("examples", postgresql.JSONB(), nullable=False),
        sa.Column("constraints", postgresql.ARRAY(sa.String()), server_default="{}"),
        sa.Column("companies", postgresql.ARRAY(sa.String()), server_default="{}"),
        sa.Column("url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_problems_slug", "problems", ["slug"])

    # problem_topics
    op.create_table(
        "problem_topics",
        sa.Column("problem_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("topic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("is_primary", sa.Boolean(), server_default=sa.false()),
    )

    # problem_hints
    op.create_table(
        "problem_hints",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("problem_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tier", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.UniqueConstraint("problem_id", "tier", name="uq_problem_hint_tier"),
    )
    op.create_index("ix_problem_hints_problem_id", "problem_hints", ["problem_id"])

    # attempts
    op.create_table(
        "attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("problem_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("outcome", outcome, nullable=False),
        sa.Column("hints_used", sa.Integer(), server_default="0"),
        sa.Column("hint_tiers_used", postgresql.ARRAY(sa.Integer()), server_default="{}"),
        sa.Column("time_taken_seconds", sa.Integer(), nullable=True),
        sa.Column("code_submitted", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_attempts_user_id", "attempts", ["user_id"])
    op.create_index("ix_attempts_problem_id", "attempts", ["problem_id"])

    # topic_mastery
    op.create_table(
        "topic_mastery",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("topic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("topics.id", ondelete="CASCADE"), nullable=False),
        sa.Column("mastery_score", sa.Float(), server_default="0.0"),
        sa.Column("problems_attempted", sa.Integer(), server_default="0"),
        sa.Column("problems_solved", sa.Integer(), server_default="0"),
        sa.Column("last_practiced_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "topic_id", name="uq_user_topic_mastery"),
    )
    op.create_index("ix_topic_mastery_user_id", "topic_mastery", ["user_id"])

    # mentor_sessions
    op.create_table(
        "mentor_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("problem_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("context_snapshot", postgresql.JSONB(), nullable=True),
    )
    op.create_index("ix_mentor_sessions_user_id", "mentor_sessions", ["user_id"])

    # mentor_messages
    op.create_table(
        "mentor_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("mentor_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", message_role, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_mentor_messages_session_id", "mentor_messages", ["session_id"])

    # recommendations
    op.create_table(
        "recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("problem_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("reason", recommendation_reason, nullable=False),
        sa.Column("score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("is_acted_on", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("acted_on_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_recommendations_user_id", "recommendations", ["user_id"])


def downgrade() -> None:
    op.drop_table("recommendations")
    op.drop_table("mentor_messages")
    op.drop_table("mentor_sessions")
    op.drop_table("topic_mastery")
    op.drop_table("attempts")
    op.drop_table("problem_hints")
    op.drop_table("problem_topics")
    op.drop_table("problems")
    op.drop_table("topics")
    op.drop_table("user_profiles")
    op.drop_table("users")

    for enum_name in [
        "experience_level_enum", "difficulty_enum", "outcome_enum",
        "message_role_enum", "recommendation_reason_enum"
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
