from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.api.health import database_is_ready
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
        connection = engine.connect.return_value.__enter__.return_value
        connection.execute.return_value.scalars.return_value = ["0003"]
        connection.execute.return_value.scalar_one_or_none.return_value = {"scopes": {"SD": [{}]}}
        from alembic.config import Config
        from alembic.script import ScriptDirectory

        from app.core.config import BACKEND_DIR

        config = Config(str(BACKEND_DIR / "alembic.ini"))
        config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
        connection.execute.return_value.scalars.return_value = ScriptDirectory.from_config(
            config
        ).get_heads()
        assert client.get("/api/v1/health/ready").status_code == 200
        assert connection.execute.call_count == 2
        app.state.settings.require_published_data = True
        assert client.get("/api/v1/health/ready").status_code == 503
        connection.execute.return_value.scalar_one_or_none.return_value = {
            "status": "published",
            "scopes": {"SD": [{}]},
        }
        assert client.get("/api/v1/health/ready").status_code == 200


def test_readiness_rejects_stale_schema():
    connection = MagicMock()
    connection.execute.return_value.scalars.return_value = ["old-revision"]
    assert not database_is_ready(connection)


def test_readiness_rejects_missing_release():
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    from app.core.config import BACKEND_DIR

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    connection = MagicMock()
    connection.execute.return_value.scalars.return_value = ScriptDirectory.from_config(
        config
    ).get_heads()
    connection.execute.return_value.scalar_one_or_none.return_value = None
    assert not database_is_ready(connection)


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


def test_write_budget_rejects_repeated_posts_and_recovers(monkeypatch):
    import app.core.write_guard as guard

    clock = [100.0]
    monkeypatch.setattr(guard, "monotonic", lambda: clock[0])
    with TestClient(create_app(Settings(_env_file=None, write_requests_per_minute=1))) as client:
        assert client.post("/api/v1/absent").status_code == 404
        response = client.post("/api/v1/absent")
        assert response.status_code == 429
        assert response.headers["retry-after"] == "60"
        assert client.get("/api/v1/health/live").status_code == 200
        clock[0] += 61
        assert client.post("/api/v1/absent").status_code == 404
