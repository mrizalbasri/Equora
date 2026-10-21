"""Opt-in local review import; never marks sources as publicly published."""

import json

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.registry import LocalRelease
from app.db.session import build_engine
from app.etl.local_release import build_release
from app.etl.registry import register_staging


def main():
    settings = get_settings()
    if not settings.database_url or make_url(settings.database_url).database != "equora":
        raise SystemExit("Use the dedicated equora database")
    payload, staged = build_release(settings.data_dir)
    engine = build_engine(settings)
    try:
        with Session(engine) as session, session.begin():
            for result in staged:
                register_staging(session, result)
            session.execute(
                insert(LocalRelease)
                .values(id=payload["id"], payload=payload)
                .on_conflict_do_nothing()
            )
    finally:
        engine.dispose()
    print(
        json.dumps(
            {
                "release_id": payload["id"],
                "status": "local_review",
                "sources": len(payload["sources"]),
                "scopes": len(payload["scopes"]),
                "observations": len(staged) * 38,
            }
        )
    )


if __name__ == "__main__":
    main()
