from typing import Literal

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(tags=["health"])


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
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        payload = HealthResponse(status="unavailable", service=request.app.title)
        return JSONResponse(status_code=503, content=payload.model_dump())
    return HealthResponse(status="ok", service=request.app.title)
