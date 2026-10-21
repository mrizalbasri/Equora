"""Registry transactions run only on the explicitly configured disposable Equora test database."""

import os
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.registry import Dataset, DatasetVersion, QualityIssue, StagedObservation, StagingImport
from app.db.session import build_engine
from app.etl.education import Issue, Observation, SourceMetadata, StagingResult
from app.etl.registry import RegistryConflict, register_staging

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL is not set"
)


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
                with session.begin():
                    yield session
        finally:
            transaction.rollback()


@pytest.fixture
def result():
    source = SourceMetadata(
        source_id="synthetic-registry",
        title="Synthetic registry fixture",
        publisher="Tests",
        source_url="https://example.org/synthetic",
        sha256="a" * 64,
        year=2025,
        academic_year="2025/2026",
        unit="percent",
        retrieved_at=datetime(2026, 10, 21, tzinfo=UTC),
        license_status="synthetic_fixture_only",
    )
    return StagingResult(
        status="staged",
        source=source,
        dataset_version_id=f"{source.source_id}:sha256:{source.sha256}",
        education_level="SD",
        observations=(
            Observation(
                source_region_code="10",
                source_region_name="Provinsi Sintetis A",
                value=Decimal(0),
                source_cell="I5",
            ),
            Observation(
                source_region_code="11",
                source_region_name="Provinsi Sintetis B",
                value=None,
                source_cell="I6",
            ),
            Observation(
                source_region_code="12",
                source_region_name="Provinsi Sintetis C",
                value=Decimal("12.1234567890123456789"),
                source_cell="I7",
            ),
        ),
        issues=(Issue(code="missing", severity="warning", cell="I6"),),
        excluded_aggregates=("Indonesia", "Luar Negeri"),
        province_rows=3,
        numeric_values=2,
        missing_values=1,
        error_count=0,
    )


def count(session, model):
    return session.scalar(select(func.count()).select_from(model))


def test_registration_is_idempotent_with_exact_values_and_provenance(session, result):
    first = register_staging(session, result)
    second = register_staging(session, result)
    assert first.created is True
    assert second.created is False
    assert first.import_id == second.import_id
    assert (
        count(session, Dataset)
        == count(session, DatasetVersion)
        == count(session, StagingImport)
        == 1
    )
    assert count(session, StagedObservation) == 3
    assert count(session, QualityIssue) == 1
    stored = session.scalars(
        select(StagedObservation).order_by(StagedObservation.source_region_code)
    ).all()
    assert [row.value for row in stored] == [row.value for row in result.observations]
    assert stored[1].value is None
    assert stored[1].source_cell == "I6"
    version = session.get(DatasetVersion, result.dataset_version_id)
    assert version.source_metadata == result.source.model_dump(mode="json")
    assert (
        session.get(StagingImport, first.import_id).summary["region_namespace"]
        == "publisher_source_code_unmapped"
    )


def test_different_education_levels_are_distinct_imports_of_one_file(session, result):
    first = register_staging(session, result)
    second = register_staging(session, result.model_copy(update={"education_level": "SMP"}))
    assert first.import_id != second.import_id
    assert count(session, DatasetVersion) == 1
    assert count(session, StagingImport) == 2
    assert count(session, StagedObservation) == 6


def test_source_metadata_conflict_preserves_original(session, result):
    register_staging(session, result)
    changed = result.model_copy(
        update={"source": result.source.model_copy(update={"publisher": "Changed"})}
    )
    with pytest.raises(RegistryConflict, match="metadata differs"), session.begin_nested():
        register_staging(session, changed)
    assert count(session, StagingImport) == 1
    assert (
        session.get(DatasetVersion, result.dataset_version_id).source_metadata["publisher"]
        == "Tests"
    )


def test_changed_report_cannot_overwrite_existing_import(session, result):
    original = register_staging(session, result)
    observations = (
        result.observations[0].model_copy(update={"value": Decimal(25)}),
        *result.observations[1:],
    )
    with pytest.raises(RegistryConflict, match="different report"), session.begin_nested():
        register_staging(session, result.model_copy(update={"observations": observations}))
    assert count(session, StagedObservation) == 3
    assert session.get(StagedObservation, (original.import_id, "10")).value == 0


def test_caller_transaction_rolls_back_every_table(session, result):
    with pytest.raises(RuntimeError), session.begin_nested():
        register_staging(session, result)
        raise RuntimeError("Synthetic failure after registration")
    for model in (Dataset, DatasetVersion, StagingImport, StagedObservation, QualityIssue):
        assert count(session, model) == 0


@pytest.mark.parametrize(
    "change",
    [
        {"error_count": 1},
        {"numeric_values": 99},
        {"status": "invalid"},
        {"dataset_version_id": "wrong"},
    ],
)
def test_inconsistent_report_is_rejected_before_any_write(session, result, change):
    with pytest.raises(ValueError, match="must agree"):
        register_staging(session, result.model_copy(update=change))
    assert count(session, Dataset) == 0


def test_invalid_report_stays_invalid_with_diagnostic_rows(session, result):
    invalid = result.model_copy(
        update={
            "status": "invalid",
            "observations": result.observations[:1],
            "issues": (Issue(code="invalid_range", severity="error", cell="I6"),),
            "numeric_values": 1,
            "missing_values": 0,
            "error_count": 1,
        }
    )
    registration = register_staging(session, invalid)
    assert registration.status == "invalid"
    assert session.get(StagingImport, registration.import_id).status == "invalid"
    assert count(session, StagedObservation) == 1
    assert session.scalars(select(QualityIssue)).one().source_cell == "I6"


@pytest.mark.parametrize(
    ("value", "unit"),
    [
        (Decimal(-1), "percent"),
        (Decimal(101), "percent"),
        (Decimal("1.5"), "school_count"),
        (Decimal("NaN"), "percent"),
        (Decimal("Infinity"), "school_count"),
    ],
)
def test_database_constraints_reject_invalid_observations(session, result, value, unit):
    registration = register_staging(session, result)
    with pytest.raises(IntegrityError), session.begin_nested():
        session.execute(
            insert(StagedObservation).values(
                import_id=registration.import_id,
                source_region_code="99",
                source_region_name="Synthetic",
                value=value,
                unit=unit,
                source_cell="I99",
            )
        )
    assert count(session, StagedObservation) == 3


def test_database_rejects_orphans_and_duplicate_natural_keys(session, result):
    row = {
        "source_region_code": "10",
        "source_region_name": "Synthetic",
        "unit": "percent",
        "value": Decimal(0),
        "source_cell": "I5",
    }
    with pytest.raises(IntegrityError), session.begin_nested():
        session.execute(insert(StagedObservation).values(import_id=uuid4(), **row))
    registration = register_staging(session, result)
    with pytest.raises(IntegrityError), session.begin_nested():
        session.execute(insert(StagedObservation).values(import_id=registration.import_id, **row))
    assert count(session, StagedObservation) == 3
