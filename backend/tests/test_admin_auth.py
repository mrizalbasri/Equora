"""Admin authentication uses synthetic secrets and never imports user data."""

import importlib
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def admin_app():
    return create_app(
        Settings(_env_file=None, database_url=None, admin_token=SecretStr("synthetic-admin-token"))
    )


def test_login_requires_configured_bearer_token(admin_app):
    with TestClient(admin_app) as client:
        for headers in ({}, {"Authorization": "Bearer wrong"}):
            response = client.post("/api/v1/admin/session", headers=headers)
            assert response.status_code == 401
            assert "synthetic-admin-token" not in response.text
        response = client.post(
            "/api/v1/admin/session",
            headers={"Authorization": "Bearer synthetic-admin-token"},
        )
        assert response.status_code == 200
        assert response.headers["cache-control"] == "no-store"
        body = response.json()
        assert body["expires_in"] == 3600
        assert "synthetic-admin-token" not in body["session_token"]
        client.cookies.set("equora_admin_session", body["session_token"])
        assert client.get("/api/v1/admin/session").status_code == 200


def test_unconfigured_admin_cannot_log_in():
    app = create_app(Settings(_env_file=None, database_url=None, admin_token=None))
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/admin/session", headers={"Authorization": "Bearer synthetic-admin-token"}
        )
        assert response.status_code == 401


def test_session_rejects_forgery_expiry_and_token_rotation(admin_app, monkeypatch):
    module = importlib.import_module("app.core.admin_auth")
    with TestClient(admin_app) as client:
        assert client.get("/api/v1/admin/session").status_code == 401
        token = client.post(
            "/api/v1/admin/session",
            headers={"Authorization": "Bearer synthetic-admin-token"},
        ).json()["session_token"]
        for forged in ("true", token + "x", "9" * 10000):
            client.cookies.set("equora_admin_session", forged)
            assert client.get("/api/v1/admin/session").status_code == 401
        client.cookies.set("equora_admin_session", token)
        with monkeypatch.context() as patch:
            patch.setattr(module.time, "time", lambda: 9999999999)
            assert client.get("/api/v1/admin/session").status_code == 401
        admin_app.state.settings.admin_token = SecretStr("rotated-synthetic-token")
        assert client.get("/api/v1/admin/session").status_code == 401


def test_import_requires_auth_even_without_database(admin_app):
    with TestClient(admin_app) as client:
        assert client.post("/api/v1/admin/import", json={}).status_code == 401
        client.cookies.set("equora_admin_session", "forged")
        assert client.post("/api/v1/admin/import", json={}).status_code == 401


def test_valid_session_and_legacy_bearer_authorize_import(admin_app, monkeypatch):
    from app.api.workspace import session_for

    # Exercise the real import route, replacing only file/DB side effects.
    etl = importlib.import_module("app.etl.local_release")
    monkeypatch.setattr(etl, "build_release", lambda _path: ({"id": "synthetic-release"}, []))
    database = Mock()
    admin_app.dependency_overrides[session_for] = lambda: database

    with TestClient(admin_app) as client:
        token = client.post(
            "/api/v1/admin/session",
            headers={"Authorization": "Bearer synthetic-admin-token"},
        ).json()["session_token"]
        client.cookies.set("equora_admin_session", token)
        assert client.post("/api/v1/admin/import").status_code == 200
        database.commit.assert_called_once()
        # A session cannot mint a fresh session without the original credential.
        assert client.post("/api/v1/admin/session").status_code == 401
        client.cookies.clear()
        assert (
            client.post(
                "/api/v1/admin/import",
                headers={"Authorization": "Bearer synthetic-admin-token"},
            ).status_code
            == 200
        )


def test_login_rejects_cross_origin_and_is_rate_limited(admin_app):
    with TestClient(admin_app) as client:
        assert (
            client.post(
                "/api/v1/admin/session",
                headers={
                    "Authorization": "Bearer synthetic-admin-token",
                    "Origin": "https://evil.example",
                },
            ).status_code
            == 403
        )
        for _ in range(60):
            assert client.post("/api/v1/admin/session").status_code == 401
        assert client.post("/api/v1/admin/session").status_code == 429
