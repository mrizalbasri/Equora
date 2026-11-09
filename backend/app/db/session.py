from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import Settings


def build_engine(settings: Settings, *, use_unpooled: bool = False) -> Engine:
    target_url = (settings.database_url_unpooled if use_unpooled else None) or settings.database_url
    if not target_url:
        raise ValueError("Configure DATABASE_URL for the Equora database before running migrations")
    # Normalize postgres:// to postgresql:// if needed for SQLAlchemy dialect handling
    if target_url.startswith("postgres://"):
        target_url = "postgresql://" + target_url[len("postgres://") :]
    return create_engine(
        target_url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 10},
    )
