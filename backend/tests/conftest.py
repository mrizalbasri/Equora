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
from app.etl.local_release import CORE


@pytest.fixture
def payload():
    sources = [
        {
            "source_id": key,
            "unit": "percent",
            "source_url": "https://example.org/synthetic",
            "title": "Synthetic " + key,
            "sha256": "a" * 64,
            "license_status": "synthetic_fixture_only",
            "quality": {"SD": {"missing": 0, "numeric": 4}},
            "year": 2025,
            "academic_year": "2025/2026",
            "publisher": "Synthetic",
            "definition": "Synthetic tests only",
            "storage_scale": "percentage_points",
        }
        for key in CORE
    ]
    rows = [
        {
            "code": code,
            "name": "Synthetic " + code,
            "values": {**dict.fromkeys(CORE, value), "institutions_count": denominator},
            "cells": dict.fromkeys(CORE, "I5"),
        }
        for code, value, denominator in (
            ("11", "20", "10"),
            ("12", "60", "20"),
            ("13", "0", "0"),
            ("14", None, "10"),
        )
    ]
    return {
        "id": "synthetic-release-workspace",
        "status": "local_review",
        "year": 2025,
        "ownership": "Total",
        "adapter_version": "synthetic",
        "region_namespace": "synthetic",
        "academic_year": "2025/2026",
        "sources": sources,
        "scopes": {"SD": rows},
        "limitations": ["Synthetic tests only"],
    }


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
