from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router
from app.api.workspace import router as workspace_router
from app.core.config import Settings, get_settings
from app.core.write_guard import WriteGuard
from app.db.session import build_engine


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.engine = build_engine(settings) if settings.database_url else None
        try:
            yield
        finally:
            if app.state.engine is not None:
                app.state.engine.dispose()

    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
    app.state.settings = settings
    app.add_middleware(
        WriteGuard,
        origins=settings.cors_origins,
        requests_per_minute=settings.write_requests_per_minute,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    app.include_router(router, prefix="/api/v1")
    app.include_router(workspace_router, prefix="/api/v1")
    return app


app = create_app()
