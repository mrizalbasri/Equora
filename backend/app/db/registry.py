"""Draft source registry; these tables do not represent published observation releases."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DatasetVersion(Base):
    __tablename__ = "dataset_versions"
    __table_args__ = (
        UniqueConstraint("dataset_id", "sha256"),
        CheckConstraint("sha256 ~ '^[a-f0-9]{64}$'", name="sha256_format"),
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    dataset_id: Mapped[str] = mapped_column(ForeignKey("datasets.id"))
    sha256: Mapped[str] = mapped_column(Text)
    source_metadata: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StagingImport(Base):
    __tablename__ = "staging_imports"
    __table_args__ = (
        UniqueConstraint("dataset_version_id", "education_level", "adapter_version"),
        CheckConstraint(
            "education_level IN ('TK','SD','SMP','SMA','SMK','SLB')", name="education_level"
        ),
        CheckConstraint("status IN ('staged','invalid')", name="status"),
        CheckConstraint(
            "numeric_values >= 0 AND missing_values >= 0 AND error_count >= 0", name="counts"
        ),
        CheckConstraint(
            "(status = 'staged' AND error_count = 0) OR (status = 'invalid' AND error_count > 0)",
            name="status_matches_errors",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    dataset_version_id: Mapped[str] = mapped_column(ForeignKey("dataset_versions.id"))
    education_level: Mapped[str] = mapped_column(Text)
    adapter_version: Mapped[str] = mapped_column(Text)
    fingerprint: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text)
    summary: Mapped[dict] = mapped_column(JSONB)
    numeric_values: Mapped[int] = mapped_column(Integer)
    missing_values: Mapped[int] = mapped_column(Integer)
    error_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StagedObservation(Base):
    __tablename__ = "staged_observations"
    __table_args__ = (
        CheckConstraint("source_region_code ~ '^[0-9]{2}$'", name="source_code"),
        CheckConstraint("unit IN ('percent','school_count')", name="unit"),
        CheckConstraint(
            "value IS NULL OR (value >= 0 AND value < 'Infinity'::numeric "
            "AND (unit <> 'percent' OR value <= 100) "
            "AND (unit <> 'school_count' OR value = trunc(value)))",
            name="value_range",
        ),
    )

    import_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("staging_imports.id"), primary_key=True)
    source_region_code: Mapped[str] = mapped_column(Text, primary_key=True)
    source_region_name: Mapped[str] = mapped_column(Text)
    unit: Mapped[str] = mapped_column(Text)
    value: Mapped[Decimal | None] = mapped_column(Numeric())
    source_cell: Mapped[str] = mapped_column(Text)


class QualityIssue(Base):
    __tablename__ = "quality_issues"
    __table_args__ = (CheckConstraint("severity IN ('warning','error')", name="severity"),)

    import_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("staging_imports.id"), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(Text)
    source_cell: Mapped[str | None] = mapped_column(Text)


class LocalRelease(Base):
    __tablename__ = "local_releases"
    id: Mapped[str] = mapped_column(Text, primary_key=True)
    payload: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ScenarioSnapshot(Base):
    __tablename__ = "scenario_snapshots"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    release_id: Mapped[str] = mapped_column(ForeignKey("local_releases.id"), index=True)
    payload: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
