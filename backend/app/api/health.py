from typing import Literal

from alembic.config import Config
from alembic.script import ScriptDirectory
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(tags=["health"])


def database_is_ready(connection, *, require_published: bool = False) -> bool:
    from app.core.config import BACKEND_DIR

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    heads = set(ScriptDirectory.from_config(config).get_heads())
    installed = set(connection.execute(text("SELECT version_num FROM alembic_version")).scalars())
    if installed != heads:
        return False
    release = connection.execute(
        text("SELECT payload FROM local_releases ORDER BY created_at DESC, id DESC LIMIT 1")
    ).scalar_one_or_none()
    return (
        isinstance(release, dict)
        and bool(release.get("scopes", {}).get("SD"))
        and (not require_published or release.get("status") == "published")
    )


class HealthResponse(BaseModel):
    status: Literal["ok", "unavailable"]
    service: str


@router.get("/health/live", response_model=HealthResponse, operation_id="getLiveness")
def liveness(request: Request) -> HealthResponse:
    return HealthResponse(status="ok", service=request.app.title)


@router.get(
    "/health/ready",
    response_model=HealthResponse,
    responses={503: {"model": HealthResponse}},
    operation_id="getReadiness",
)
def readiness(request: Request) -> HealthResponse | JSONResponse:
    if request.app.state.engine is None:
        payload = HealthResponse(status="unavailable", service=request.app.title)
        return JSONResponse(status_code=503, content=payload.model_dump())
    try:
        with request.app.state.engine.connect() as connection:
            if not database_is_ready(
                connection, require_published=request.app.state.settings.require_published_data
            ):
                payload = HealthResponse(status="unavailable", service=request.app.title)
                return JSONResponse(status_code=503, content=payload.model_dump())
    except SQLAlchemyError:
        payload = HealthResponse(status="unavailable", service=request.app.title)
        return JSONResponse(status_code=503, content=payload.model_dump())
    return HealthResponse(status="ok", service=request.app.title)
