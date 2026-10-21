"""add local release and scenario snapshots

Revision ID: 0003
Revises: 0002
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "local_releases",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_local_releases")),
    )
    op.create_table(
        "scenario_snapshots",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("release_id", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["release_id"],
            ["local_releases.id"],
            name=op.f("fk_scenario_snapshots_release_id_local_releases"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_scenario_snapshots")),
    )
    op.create_index(
        op.f("ix_scenario_snapshots_release_id"), "scenario_snapshots", ["release_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_scenario_snapshots_release_id"), table_name="scenario_snapshots")
    op.drop_table("scenario_snapshots")
    op.drop_table("local_releases")
