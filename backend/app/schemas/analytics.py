from pydantic import BaseModel


class DifficultyStats(BaseModel):
    attempted: int
    solved: int
    solve_rate: float


class TopicStat(BaseModel):
    topic_name: str
    topic_display_name: str
    mastery_score: float
    problems_attempted: int
    problems_solved: int


class RecentAttempt(BaseModel):
    problem_title: str
    problem_slug: str
    difficulty: str
    outcome: str
    hints_used: int
    time_taken_seconds: int | None
    created_at: str


class AnalyticsSummary(BaseModel):
    total_attempts: int
    total_solved: int
    solve_rate: float
    avg_hints_per_attempt: float
    current_streak: int
    difficulty_breakdown: dict[str, DifficultyStats]
    topic_mastery: list[TopicStat]
    recent_attempts: list[RecentAttempt]
