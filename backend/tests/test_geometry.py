from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.services.geometry import geometry


def test_geometry_bundled_fallback(tmp_path: Path):
    # Test that even when data_dir is empty or does not exist, bundled boundary is used
    result = geometry(tmp_path / "missing_data_dir")
    assert result["type"] == "FeatureCollection"
    assert len(result["features"]) == 38
    assert "attribution" in result
    assert "source_url" in result
    assert "license_url" in result

    # Verify sample province feature
    first = result["features"][0]
    assert "id" in first
    assert "properties" in first
    assert "code" in first["properties"]
    assert "name" in first["properties"]


def test_geometry_endpoint():
    # Test the API endpoint returns 200 with the 38 provinces
    app = create_app(Settings(_env_file=None, data_dir=Path("/non/existent/data")))
    with TestClient(app) as client:
        response = client.get("/api/v1/geometry")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 38
