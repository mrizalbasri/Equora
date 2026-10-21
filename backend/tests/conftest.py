"""PostgreSQL fixtures are isolated to the explicitly named equora_test database."""

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import build_engine


@pytest.fixture(scope="module")
def registry_engine():
    url = os.environ["TEST_DATABASE_URL"]
    if make_url(url).database != "equora_test":
        pytest.fail("Registry tests require the dedicated equora_test database")
    with pytest.MonkeyPatch.context() as patch:
        patch.setenv("DATABASE_URL", url)
        get_settings.cache_clear()
        try:
            command.upgrade(
                Config(str(Path(__file__).resolve().parents[1] / "alembic.ini")), "head"
            )
        finally:
            get_settings.cache_clear()
    engine = build_engine(Settings(database_url=url, _env_file=None))
    try:
        yield engine
    finally:
        engine.dispose()


@pytest.fixture
def session(registry_engine):
    with registry_engine.connect() as connection:
        transaction = connection.begin()
        try:
            with Session(bind=connection, join_transaction_mode="create_savepoint") as session:
                yield session
        finally:
            transaction.rollback()
