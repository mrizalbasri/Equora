from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "Equora API"
    database_url: str | None = None
    cors_origins: list[str] = ["http://localhost:5173"]
    data_dir: Path = Field(default=BACKEND_DIR.parent / "data")


@lru_cache
def get_settings() -> Settings:
    return Settings()
