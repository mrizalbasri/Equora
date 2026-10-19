from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.core.config import Settings
from app.main import create_app


def test_liveness_does_not_require_database():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "Equora API"}


def test_readiness_without_configured_database():
    with TestClient(create_app(Settings(database_url=None, _env_file=None))) as client:
        response = client.get("/api/v1/health/ready")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable", "service": "Equora API"}


def test_readiness_checks_database():
    app = create_app(Settings(_env_file=None))
    with TestClient(app) as client:
        engine = MagicMock()
        app.state.engine = engine
        assert client.get("/api/v1/health/ready").status_code == 200
        engine.connect.return_value.__enter__.return_value.execute.assert_called_once()


def test_readiness_hides_connection_details_on_database_failure():
    app = create_app(Settings(_env_file=None))
    with TestClient(app) as client:
        engine = MagicMock()
        engine.connect.side_effect = OperationalError("secret connection", {}, Exception("secret"))
        app.state.engine = engine
        response = client.get("/api/v1/health/ready")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable", "service": "Equora API"}
    assert "secret" not in response.text


def test_cors_allows_only_configured_origin():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        allowed = client.get("/api/v1/health/live", headers={"Origin": "http://localhost:5173"})
        denied = client.get("/api/v1/health/live", headers={"Origin": "https://example.org"})
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-origin" not in denied.headers
