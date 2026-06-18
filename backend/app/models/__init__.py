# Import all models here so Alembic can discover them via Base.metadata
from app.models.user import User, UserProfile
from app.models.problem import Topic, Problem, ProblemTopic, ProblemHint
from app.models.attempt import Attempt
from app.models.mastery import TopicMastery
from app.models.mentor import MentorSession, MentorMessage
from app.models.recommendation import Recommendation

__all__ = [
    "User",
    "UserProfile",
    "Topic",
    "Problem",
    "ProblemTopic",
    "ProblemHint",
    "Attempt",
    "TopicMastery",
    "MentorSession",
    "MentorMessage",
    "Recommendation",
]
