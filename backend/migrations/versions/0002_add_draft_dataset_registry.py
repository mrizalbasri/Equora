"""add draft dataset registry

Revision ID: 0002
Revises: 0001
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "datasets",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_datasets")),
    )
    op.create_table(
        "dataset_versions",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("dataset_id", sa.Text(), nullable=False),
        sa.Column("sha256", sa.Text(), nullable=False),
        sa.Column("source_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "sha256 ~ '^[a-f0-9]{64}$'", name=op.f("ck_dataset_versions_sha256_format")
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"], name=op.f("fk_dataset_versions_dataset_id_datasets")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_dataset_versions")),
        sa.UniqueConstraint("dataset_id", "sha256", name=op.f("uq_dataset_versions_dataset_id")),
    )
    op.create_table(
        "staging_imports",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("dataset_version_id", sa.Text(), nullable=False),
        sa.Column("education_level", sa.Text(), nullable=False),
        sa.Column("adapter_version", sa.Text(), nullable=False),
        sa.Column("fingerprint", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("numeric_values", sa.Integer(), nullable=False),
        sa.Column("missing_values", sa.Integer(), nullable=False),
        sa.Column("error_count", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "(status = 'staged' AND error_count = 0) OR (status = 'invalid' AND error_count > 0)",
            name=op.f("ck_staging_imports_status_matches_errors"),
        ),
        sa.CheckConstraint(
            "education_level IN ('TK','SD','SMP','SMA','SMK','SLB')",
            name=op.f("ck_staging_imports_education_level"),
        ),
        sa.CheckConstraint(
            "status IN ('staged','invalid')", name=op.f("ck_staging_imports_status")
        ),
        sa.CheckConstraint(
            "numeric_values >= 0 AND missing_values >= 0 AND error_count >= 0",
            name=op.f("ck_staging_imports_counts"),
        ),
        sa.ForeignKeyConstraint(
            ["dataset_version_id"],
            ["dataset_versions.id"],
            name=op.f("fk_staging_imports_dataset_version_id_dataset_versions"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_staging_imports")),
        sa.UniqueConstraint(
            "dataset_version_id",
            "education_level",
            "adapter_version",
            name=op.f("uq_staging_imports_dataset_version_id"),
        ),
    )
    op.create_table(
        "quality_issues",
        sa.Column("import_id", sa.UUID(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("code", sa.Text(), nullable=False),
        sa.Column("severity", sa.Text(), nullable=False),
        sa.Column("source_cell", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "severity IN ('warning','error')", name=op.f("ck_quality_issues_severity")
        ),
        sa.ForeignKeyConstraint(
            ["import_id"],
            ["staging_imports.id"],
            name=op.f("fk_quality_issues_import_id_staging_imports"),
        ),
        sa.PrimaryKeyConstraint("import_id", "position", name=op.f("pk_quality_issues")),
    )
    op.create_table(
        "staged_observations",
        sa.Column("import_id", sa.UUID(), nullable=False),
        sa.Column("source_region_code", sa.Text(), nullable=False),
        sa.Column("source_region_name", sa.Text(), nullable=False),
        sa.Column("unit", sa.Text(), nullable=False),
        sa.Column("value", sa.Numeric(), nullable=True),
        sa.Column("source_cell", sa.Text(), nullable=False),
        sa.CheckConstraint(
            "source_region_code ~ '^[0-9]{2}$'", name=op.f("ck_staged_observations_source_code")
        ),
        sa.CheckConstraint(
            "unit IN ('percent','school_count')", name=op.f("ck_staged_observations_unit")
        ),
        sa.CheckConstraint(
            "value IS NULL OR (value >= 0 AND value < 'Infinity'::numeric "
            "AND (unit <> 'percent' OR value <= 100) "
            "AND (unit <> 'school_count' OR value = trunc(value)))",
            name=op.f("ck_staged_observations_value_range"),
        ),
        sa.ForeignKeyConstraint(
            ["import_id"],
            ["staging_imports.id"],
            name=op.f("fk_staged_observations_import_id_staging_imports"),
        ),
        sa.PrimaryKeyConstraint(
            "import_id", "source_region_code", name=op.f("pk_staged_observations")
        ),
    )


def downgrade() -> None:
    op.drop_table("staged_observations")
    op.drop_table("quality_issues")
    op.drop_table("staging_imports")
    op.drop_table("dataset_versions")
    op.drop_table("datasets")
