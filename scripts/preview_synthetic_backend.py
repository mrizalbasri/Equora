"""Local preview server for the interactive map and studio without PostgreSQL."""

import os
from datetime import UTC, datetime
from uuid import uuid4

import uvicorn
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

import app.api.workspace as workspace_api
from app.api.workspace import ScenarioInput, session_for
from app.core.config import Settings
from app.db.registry import ScenarioSnapshot
from app.etl.local_release import CORE, build_release
from app.main import create_app
from app.services.workspace import calculate_scenario

settings = Settings(_env_file=None)

try:
    payload, _ = build_release(settings.data_dir)
    allowed_source_keys = {
        "source_id",
        "title",
        "publisher",
        "source_url",
        "sha256",
        "year",
        "academic_year",
        "unit",
        "retrieved_at",
        "license_status",
        "definition",
        "storage_scale",
        "quality",
    }
    payload["sources"] = [
        {k: v for k, v in s.items() if k in allowed_source_keys}
        for s in payload["sources"]
    ]
except Exception:
    def source(source_id: str, title: str) -> dict:
        return {
            "source_id": source_id,
            "title": title,
            "publisher": "Fixture sintetis Equora",
            "source_url": "https://example.org/equora-synthetic-preview",
            "sha256": "a" * 64,
            "year": 2025,
            "academic_year": "2025/2026",
            "unit": "percent",
            "retrieved_at": None,
            "license_status": "synthetic_fixture_only",
            "definition": "Data sintetis untuk meninjau antarmuka; bukan kondisi provinsi sebenarnya.",
            "storage_scale": "percentage_points",
            "quality": {"SD": {"missing": 0, "numeric": 4}},
        }

    sources = [
        source("sanitation_percent", "Sanitasi dasar"),
        source("water_percent", "Ketersediaan air"),
        source("internet_percent", "Akses internet"),
        source("computers_percent", "Ketersediaan komputer"),
    ]

    def region(code: str, name: str, values: tuple[str | None, ...], schools: str) -> dict:
        mapped = dict(zip(CORE, values, strict=True)) | {"institutions_count": schools}
        return {
            "code": code,
            "name": name,
            "values": mapped,
            "cells": {key: f"SYNTHETIC-{code}-{key}" for key in mapped},
        }

    payload = {
        "id": "synthetic-interactive-map-preview",
        "status": "local_review",
        "year": 2025,
        "academic_year": "2025/2026",
        "ownership": "Total",
        "adapter_version": "synthetic-preview-v1",
        "region_namespace": "kemendagri-province-code",
        "sources": sources,
        "scopes": {
            "SD": [
                region("11", "Provinsi Aceh", ("32", "45", "51", "28"), "120"),
                region("31", "Provinsi DKI Jakarta", ("78", "84", "91", "72"), "95"),
                region("32", "Provinsi Jawa Barat", ("54", "67", "73", "49"), "140"),
                region("74", "Provinsi Sulawesi Tenggara", (None, "39", "44", "31"), "88"),
            ]
        },
        "limitations": [
            "Data sintetis hanya untuk preview antarmuka.",
            "Bukan rilis data pendidikan dan bukan rekomendasi kebijakan.",
        ],
    }


class PreviewSession:
    # ponytail: in-memory session stub for PostgreSQL-free local preview (resets on restart)
    def __init__(self):
        self.info: dict = {}
        self.records: dict[str, object] = {}

    def execute(self, _stmt):
        return None

    def scalar(self, _stmt):
        return len(self.records)

    def scalars(self, _stmt):
        items = list(reversed(list(self.records.values())))
        return type("Result", (), {"all": lambda self: items})()

    def add(self, record):
        self.records[str(record.id)] = record

    def commit(self):
        return None

    def get(self, _model, key):
        return self.records.get(str(key))


def preview_release(_session, release_id=None):
    if release_id and release_id != payload["id"]:
        return payload
    return payload


preview_session = PreviewSession()
workspace_api.local_release = preview_release
app = create_app(Settings(_env_file=None))
app.dependency_overrides[session_for] = lambda: preview_session

# Seed a default 38-province scenario if available
try:
    preset_id = uuid4()
    preset_input = ScenarioInput(
        release_id=payload["id"],
        education_level="SD",
        weights={
            "sanitation_percent": 0.25,
            "water_percent": 0.25,
            "internet_percent": 0.25,
            "computers_percent": 0.25,
        },
        region_codes=[r["code"] for r in payload["scopes"]["SD"]],
        cost_idr=10000000,
        capacity=10,
        minimum_packages=0,
        budget_idr=1000000000,
        name="Alokasi Berimbang 4 Indikator",
        cost_source_type="demo_assumption",
        overrides={},
    )
    preset_result = calculate_scenario(payload, preset_input)
    preset_result.update(id=str(preset_id), created_at=datetime.now(UTC).isoformat())
    preview_session.add(
        ScenarioSnapshot(
            id=preset_id,
            release_id=payload["id"],
            payload=jsonable_encoder(preset_result),
        )
    )
except Exception:
    pass


if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "18000"))
    uvicorn.run(app, host="127.0.0.1", port=port)
