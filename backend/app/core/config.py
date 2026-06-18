from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "LeetCode Mentor AI"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://leetcode:password@localhost:5432/leetcode_mentor"
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str = "change-this-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
