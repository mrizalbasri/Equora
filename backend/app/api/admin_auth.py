"""Authenticate administrators without reading datasets or requiring a database."""

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel

from app.core.admin_auth import (
    SESSION_SECONDS,
    create_session,
    require_admin_session,
    require_admin_token,
)

router = APIRouter(prefix="/admin")


class AdminSession(BaseModel):
    session_token: str
    expires_in: int


@router.post("/session", dependencies=[Depends(require_admin_token)], response_model=AdminSession)
def login(request: Request, response: Response):
    response.headers["Cache-Control"] = "no-store"
    return {"session_token": create_session(request), "expires_in": SESSION_SECONDS}


@router.get("/session", dependencies=[Depends(require_admin_session)])
def session(response: Response):
    response.headers["Cache-Control"] = "no-store"
    return {"authenticated": True}
