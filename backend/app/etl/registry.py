"""Record immutable staging results atomically, with idempotency scoped to an import slice."""

import hashlib
import json
from dataclasses import dataclass
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db.registry import Dataset, DatasetVersion, QualityIssue, StagedObservation, StagingImport
from app.etl.education import StagingResult


class RegistryConflict(ValueError):
    pass


@dataclass(frozen=True)
class Registration:
    import_id: UUID
    created: bool
    status: str


def register_staging(session: Session, result: StagingResult) -> Registration:
    """Caller owns the transaction; exceptions must roll back the entire registration."""
    errors = sum(issue.severity == "error" for issue in result.issues)
    missing = sum(row.value is None for row in result.observations)
    if (
        result.dataset_version_id != f"{result.source.source_id}:sha256:{result.source.sha256}"
        or result.error_count != errors
        or result.missing_values != missing
        or result.numeric_values != len(result.observations) - missing
        or result.status != ("invalid" if errors else "staged")
    ):
        raise ValueError("Staging identity, counts and status must agree with the report")
    payload = result.model_dump(mode="json")
    fingerprint = hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    identity = json.dumps(
        [
            result.dataset_version_id,
            result.education_level,
            result.adapter_version,
        ]
    )
    import_id = uuid5(NAMESPACE_URL, f"equora:staging:{identity}")
    session.execute(insert(Dataset).values(id=result.source.source_id).on_conflict_do_nothing())
    session.execute(
        insert(DatasetVersion)
        .values(
            id=result.dataset_version_id,
            dataset_id=result.source.source_id,
            sha256=result.source.sha256,
            source_metadata=payload["source"],
        )
        .on_conflict_do_nothing()
    )
    version = session.get(DatasetVersion, result.dataset_version_id)
    if version is None or version.source_metadata != payload["source"]:
        raise RegistryConflict("Source version metadata differs from the recorded version")
    summary = {
        key: value
        for key, value in payload.items()
        if key not in ("observations", "issues", "source")
    }
    created = session.execute(
        insert(StagingImport)
        .values(
            id=import_id,
            dataset_version_id=result.dataset_version_id,
            education_level=result.education_level,
            adapter_version=result.adapter_version,
            fingerprint=fingerprint,
            status=result.status,
            summary=summary,
            numeric_values=result.numeric_values,
            missing_values=result.missing_values,
            error_count=result.error_count,
        )
        .on_conflict_do_nothing()
        .returning(StagingImport.id)
    ).scalar_one_or_none()
    if created is None:
        recorded = session.get(StagingImport, import_id)
        if recorded is None or recorded.fingerprint != fingerprint:
            raise RegistryConflict("Import identity already contains a different report")
        return Registration(import_id, False, recorded.status)
    if result.observations:
        session.execute(
            insert(StagedObservation),
            [
                {
                    "import_id": import_id,
                    "source_region_code": row.source_region_code,
                    "source_region_name": row.source_region_name,
                    "unit": result.source.unit,
                    "value": row.value,
                    "source_cell": row.source_cell,
                }
                for row in result.observations
            ],
        )
    if result.issues:
        session.execute(
            insert(QualityIssue),
            [
                {
                    "import_id": import_id,
                    "position": index,
                    "code": issue.code,
                    "severity": issue.severity,
                    "source_cell": issue.cell,
                }
                for index, issue in enumerate(result.issues)
            ],
        )
    return Registration(import_id, True, result.status)
