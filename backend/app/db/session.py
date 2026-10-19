from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import Settings


def build_engine(settings: Settings) -> Engine:
    if not settings.database_url:
        raise ValueError("Configure DATABASE_URL for the Equora database before running migrations")
    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3},
    )
