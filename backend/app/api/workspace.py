"""Local-review data endpoints and immutable scenario snapshots."""

import csv
import io
import json
import secrets
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.analysis.priority import PriorityResult
from app.api.decision_views import DecisionReview, ReviewInput
from app.api.views import (
    CatalogView,
    DatasetView,
    ObservationsView,
    ProvinceView,
    RegionProfileView,
    SavedScenarioView,
    SourceView,
    WorkspaceView,
)
from app.db.registry import LocalRelease, ScenarioSnapshot
from app.etl.education import EducationLevel
from app.etl.local_release import CORE
from app.optimization.allocation import AllocationCase, AllocationResult
from app.services.workspace import calculate_scenario, compare_snapshots, json_values, priority

router = APIRouter()


@router.get("/geometry")
def boundary(request: Request):
    from app.services.geometry import geometry

    try:
        return geometry(request.app.state.settings.data_dir)
    except (OSError, ValueError, KeyError) as exc:
        raise HTTPException(503, "Peta belum tersedia; tabel tetap dapat digunakan") from exc


def session_for(request: Request):
    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        raise HTTPException(503, "Database Equora belum tersedia")
    try:
        with Session(engine) as session:
            yield session
    except SQLAlchemyError as exc:
        raise HTTPException(503, "Database belum siap; periksa koneksi dan migrasi lokal") from exc


DBSession = Annotated[Session, Depends(session_for)]


def local_release(session: Session, release_id: str | None = None):
    query = select(LocalRelease)
    if release_id:
        query = query.where(LocalRelease.id == release_id)
    record = session.scalars(
        query.order_by(LocalRelease.created_at.desc(), LocalRelease.id.desc()).limit(1)
    ).first()
    if record is None:
        raise HTTPException(
            503 if not release_id else 404, "Snapshot lokal belum tersedia; jalankan prepare_local"
        )
    return record.payload


def get_snapshot(session, snapshot_id):
    record = session.get(ScenarioSnapshot, snapshot_id)
    if record is None:
        raise HTTPException(404, "Skenario tidak ditemukan")
    return record.payload


class PriorityInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    release_id: str = Field(min_length=1, max_length=100)
    education_level: EducationLevel = "SD"
    weights: dict[str, Decimal]
    region_codes: list[str] | None = Field(default=None, min_length=1, max_length=38)

    @field_validator("weights", mode="before")
    @classmethod
    def reject_boolean_weights(cls, value):
        if isinstance(value, dict) and any(isinstance(weight, bool) for weight in value.values()):
            raise ValueError("Bobot harus berupa angka, bukan boolean")
        return value

    @field_validator("region_codes")
    @classmethod
    def unique_codes(cls, codes):
        if codes and len(set(codes)) != len(codes):
            raise ValueError("Kode wilayah tidak boleh duplikat")
        return codes


class RegionParameters(BaseModel):
    model_config = ConfigDict(extra="forbid")
    cost_idr: int = Field(strict=True, ge=1, le=10**12)
    capacity: int = Field(strict=True, ge=0, le=10000)
    minimum_packages: int = Field(default=0, strict=True, ge=0, le=10000)


class ScenarioInput(PriorityInput, RegionParameters):
    budget_idr: int = Field(strict=True, ge=0, le=10**13)
    name: str = Field(min_length=1, max_length=100)
    cost_source_type: Literal["demo_assumption"] = "demo_assumption"
    overrides: dict[str, RegionParameters] = Field(default_factory=dict, max_length=38)


class CompareInput(BaseModel):
    left: UUID
    right: UUID


class ScenarioView(BaseModel):
    id: str
    release_id: str
    data_status: str
    created_at: str
    region_names: dict[str, str]
    input_rows: list[ProvinceView]
    parameters: ScenarioInput
    priority: PriorityResult
    allocation: AllocationResult
    baselines: dict[str, AllocationResult]
    case: AllocationCase
    sources: list[SourceView]
    limitations: list[str]


@router.get("/workspace", response_model=WorkspaceView)
def workspace(session: DBSession, release_id: str | None = None):
    payload = local_release(session, release_id)
    return {key: value for key, value in payload.items() if key != "scopes"} | {
        "education_levels": list(payload["scopes"]),
        "region_count": len(payload["scopes"]["SD"]),
        "core_indicators": CORE,
    }


@router.get("/datasets", response_model=CatalogView)
def datasets(session: DBSession):
    payload = local_release(session)
    return {"release_id": payload["id"], "status": payload["status"], "items": payload["sources"]}


@router.get("/datasets/{source_id}", response_model=DatasetView)
def dataset(source_id: str, session: DBSession):
    payload = local_release(session)
    source = next(
        (source for source in payload["sources"] if source["source_id"] == source_id), None
    )
    if source is None:
        raise HTTPException(404, "Dataset tidak ditemukan")
    return {
        **source,
        "release_id": payload["id"],
        "status": payload["status"],
        "limitations": payload["limitations"],
    }


@router.get("/datasets/{source_id}/quality")
def quality(source_id: str, session: DBSession):
    source = dataset(source_id, session)
    return {
        "source_id": source_id,
        "release_id": source["release_id"],
        "quality": source["quality"],
        "scope": "enam jenjang / Total; agregat nasional dan luar negeri dikeluarkan",
        "limitations": source["limitations"],
    }


@router.get("/regions")
def regions(
    session: DBSession, education_level: EducationLevel = "SD", release_id: str | None = None
):
    payload = local_release(session, release_id)
    if education_level not in payload["scopes"]:
        raise HTTPException(422, "Jenjang tidak tersedia pada rilis ini")
    return [
        {"code": row["code"], "name": row["name"]} for row in payload["scopes"][education_level]
    ]


@router.get("/regions/{code}", response_model=RegionProfileView)
def region(
    code: str,
    session: DBSession,
    education_level: EducationLevel = "SD",
    release_id: str | None = None,
):
    payload = local_release(session, release_id)
    if education_level not in payload["scopes"]:
        raise HTTPException(422, "Jenjang tidak tersedia pada rilis ini")
    row = next((row for row in payload["scopes"][education_level] if row["code"] == code), None)
    if row is None:
        raise HTTPException(404, "Wilayah tidak ditemukan")
    return {
        **row,
        "release_id": payload["id"],
        "status": payload["status"],
        "academic_year": payload["academic_year"],
        "ownership": payload["ownership"],
        "education_level": education_level,
        "sources": payload["sources"],
        "limitations": payload["limitations"],
    }


@router.get("/observations", response_model=ObservationsView)
def observations(
    session: DBSession,
    indicator: str = "sanitation_percent",
    education_level: EducationLevel = "SD",
    q: str = Query(default="", max_length=100),
    region_code: str | None = None,
):
    payload = local_release(session)
    source = next(
        (source for source in payload["sources"] if source["source_id"] == indicator), None
    )
    if source is None:
        raise HTTPException(422, "Indikator tidak tersedia")
    rows = []
    for row in payload["scopes"][education_level]:
        if q.casefold() not in row["name"].casefold() or (
            region_code and row["code"] != region_code
        ):
            continue
        denominator = row["values"]["institutions_count"]
        source_value = row["values"][indicator]
        no_schools = (
            source["unit"] == "percent" and denominator is not None and Decimal(denominator) == 0
        )
        rows.append(
            {
                "code": row["code"],
                "name": row["name"],
                "value": None if no_schools else source_value,
                "source_value": source_value,
                "denominator": denominator,
                "source_cell": row["cells"][indicator],
                "status": "no_schools"
                if no_schools
                else "missing"
                if source_value is None
                else "available",
            }
        )
    return {
        "release_id": payload["id"],
        "status": payload["status"],
        "year": payload["year"],
        "academic_year": payload["academic_year"],
        "education_level": education_level,
        "ownership": "Total",
        "source": source,
        "rows": rows,
        "limitations": payload["limitations"],
    }


def csv_response(rows, filename):
    output = io.StringIO()
    writer = csv.writer(output)
    for row in rows:
        writer.writerow(
            [
                (
                    "'" + value
                    if isinstance(value, str) and value.startswith(("=", "+", "-", "@", "\t", "\r"))
                    else value
                )
                for value in row
            ]
        )
    return Response(
        "\ufeff" + output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/observations/export")
def export_observations(
    session: DBSession,
    indicator: str = "sanitation_percent",
    education_level: EducationLevel = "SD",
    q: str = Query(default="", max_length=100),
    region_code: str | None = None,
):
    result = observations(session, indicator, education_level, q, region_code)
    rows = [
        [
            "release_id",
            "status",
            "academic_year",
            "education_level",
            "ownership",
            "region_code",
            "region_name",
            "indicator",
            "value",
            "source_value",
            "unit",
            "quality",
            "denominator",
            "source_cell",
            "source_url",
            "sha256",
            "downloaded_at",
            "license_status",
        ]
    ]
    for row in result["rows"]:
        rows.append(
            [
                result["release_id"],
                result["status"],
                result["academic_year"],
                education_level,
                "Total",
                row["code"],
                row["name"],
                indicator,
                row["value"],
                row["source_value"],
                result["source"]["unit"],
                row["status"],
                row["denominator"],
                row["source_cell"],
                result["source"]["source_url"],
                result["source"]["sha256"],
                result["source"].get("retrieved_at"),
                result["source"]["license_status"],
            ]
        )
    return csv_response(rows, "equora-observations.csv")


@router.post("/priority/compute", response_model=PriorityResult)
def compute_priority(body: PriorityInput, session: DBSession):
    from dataclasses import asdict

    try:
        payload = local_release(session, body.release_id)
        return json_values(
            asdict(priority(payload, body.education_level, body.weights, body.region_codes))
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/scenarios", response_model=list[SavedScenarioView])
def list_scenarios(session: DBSession):
    records = session.scalars(
        select(ScenarioSnapshot).order_by(ScenarioSnapshot.created_at.desc()).limit(50)
    ).all()
    return [
        {
            "id": str(record.id),
            "name": record.payload["parameters"]["name"],
            "created_at": record.payload["created_at"],
            "status": record.payload["allocation"]["status"],
            "release_id": record.release_id,
        }
        for record in records
    ]


@router.post("/scenarios", status_code=201, response_model=ScenarioView)
def create_scenario(body: ScenarioInput, session: DBSession):
    try:
        payload = local_release(session, body.release_id)
        result = calculate_scenario(payload, body)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    snapshot_id = uuid4()
    result.update(id=str(snapshot_id), created_at=datetime.now(UTC).isoformat())
    session.add(
        ScenarioSnapshot(id=snapshot_id, release_id=payload["id"], payload=jsonable_encoder(result))
    )
    session.commit()
    return result


@router.post("/scenarios/compare")
def compare(body: CompareInput, session: DBSession):
    try:
        return compare_snapshots(
            get_snapshot(session, body.left), get_snapshot(session, body.right)
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/scenarios/{snapshot_id}", response_model=ScenarioView)
def scenario(snapshot_id: UUID, session: DBSession):
    return get_snapshot(session, snapshot_id)


@router.post("/scenarios/{snapshot_id}/review", response_model=DecisionReview)
def decision_review(snapshot_id: UUID, body: ReviewInput, session: DBSession):
    from app.services.decision_review import review_snapshot

    snapshot = get_snapshot(session, snapshot_id)
    try:
        return review_snapshot(snapshot, ScenarioInput.model_validate(snapshot["parameters"]), body)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.post("/scenarios/compare/pdf")
def export_comparison_pdf(body: CompareInput, session: DBSession):
    from app.services.report import snapshot_pdf

    result = compare(body, session)
    return Response(
        snapshot_pdf(result["left"], comparison=result),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="equora-comparison.pdf"'},
    )


@router.get("/scenarios/{snapshot_id}/export")
def export_scenario(snapshot_id: UUID, session: DBSession):
    result = get_snapshot(session, snapshot_id)
    metadata = [["section", "key", "value"]]
    for key in ("id", "release_id", "data_status", "created_at"):
        metadata.append(["snapshot", key, result[key]])
    for key, value in result["parameters"].items():
        metadata.append(["parameters", key, json.dumps(value, ensure_ascii=False)])
    for key, value in result["allocation"].items():
        if key != "allocations":
            metadata.append(["solver", key, json.dumps(value)])
    for key, value in result["baselines"].items():
        metadata.append(["baseline", key, json.dumps(value)])
    for value in result["limitations"]:
        metadata.append(["limitation", "interpretation", value])
    for source in result["sources"]:
        metadata.append(["source", source["source_id"], json.dumps(source, ensure_ascii=False)])
    metadata.append(["excluded", "regions", json.dumps(result["priority"]["excluded"])])
    metadata.append(["priority", "details", json.dumps(result["priority"])])
    rows = [
        [
            "snapshot_id",
            "release_id",
            "data_status",
            "region_code",
            "packages",
            "cost_source_type",
            "model_version",
            "created_at",
        ]
    ]
    for code, packages in (result["allocation"].get("allocations") or {}).items():
        rows.append(
            [
                result["id"],
                result["release_id"],
                "local_review",
                code,
                packages,
                "demo_assumption",
                result["allocation"]["model_version"],
                result["created_at"],
            ]
        )
    return csv_response(metadata + [[]] + rows, f"equora-scenario-{snapshot_id}.csv")


@router.get("/scenarios/{snapshot_id}/pdf")
def export_pdf(snapshot_id: UUID, session: DBSession):
    from app.services.report import snapshot_pdf

    return Response(
        snapshot_pdf(get_snapshot(session, snapshot_id)),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="equora-{snapshot_id}.pdf"'},
    )


def require_admin(request: Request, authorization: str | None = Header(default=None)):
    configured = request.app.state.settings.admin_token
    if (
        not configured
        or not authorization
        or not secrets.compare_digest(
            authorization.encode(), ("Bearer " + configured.get_secret_value()).encode()
        )
    ):
        raise HTTPException(
            401, "Token admin lokal diperlukan", headers={"WWW-Authenticate": "Bearer"}
        )


@router.post("/admin/import", dependencies=[Depends(require_admin)])
def admin_import(request: Request, session: DBSession):
    from sqlalchemy.dialects.postgresql import insert

    from app.etl.local_release import build_release
    from app.etl.registry import register_staging

    try:
        payload, staged = build_release(request.app.state.settings.data_dir)
        for result in staged:
            register_staging(session, result)
        session.execute(
            insert(LocalRelease).values(id=payload["id"], payload=payload).on_conflict_do_nothing()
        )
        session.commit()
        return {
            "release_id": payload["id"],
            "status": "local_review",
            "sources": 10,
            "imports": len(staged),
        }
    except (ValueError, OSError, KeyError) as exc:
        session.rollback()
        raise HTTPException(
            422, "File/metadata lokal tidak sesuai audit; impor dibatalkan"
        ) from exc
