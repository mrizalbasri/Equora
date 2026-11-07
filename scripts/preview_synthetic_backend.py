"""Temporary local preview server for the interactive map without PostgreSQL."""

import uvicorn
from fastapi import HTTPException

import app.api.workspace as workspace_api
from app.api.workspace import session_for
from app.core.config import Settings
from app.etl.local_release import CORE
from app.main import create_app


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


def preview_release(_session, release_id=None):
    if release_id not in (None, payload["id"]):
        raise HTTPException(404, "Rilis preview tidak ditemukan")
    return payload


workspace_api.local_release = preview_release
app = create_app(Settings(_env_file=None))
app.dependency_overrides[session_for] = lambda: None


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
