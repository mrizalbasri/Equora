"""Opt-in registration into the dedicated Equora database, without publication."""

import argparse
import json
from pathlib import Path

from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import build_engine
from app.etl.additional_education import audited_additional_source, stage_additional_workbook
from app.etl.education import LEVELS, stage_workbook
from app.etl.registry import register_staging
from app.etl.stage_education import ROOT, audited_source


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--source-set", choices=("original", "additional"), default="original")
    parser.add_argument("--file", required=True, type=Path)
    parser.add_argument("--education-level", required=True, choices=LEVELS)
    args = parser.parse_args(argv)
    settings = get_settings()
    try:
        valid_target = (
            settings.database_url and make_url(settings.database_url).database == "equora"
        )
    except SQLAlchemyError:
        valid_target = False
    if not valid_target:
        parser.exit(2, "Configure DATABASE_URL for the dedicated equora database\n")
    engine = build_engine(settings)
    try:
        prefix = "additional-" if args.source_set == "additional" else ""
        manifest = json.loads(
            (ROOT / f"data/metadata/{prefix}source-candidates.json").read_text("utf-8")
        )
        audit = json.loads((ROOT / f"data/metadata/{prefix}source-audit.json").read_text("utf-8"))
        resolve = audited_additional_source if args.source_set == "additional" else audited_source
        stage = stage_additional_workbook if args.source_set == "additional" else stage_workbook
        source = resolve(args.source_id, manifest, audit)
        result = stage(args.file, source, education_level=args.education_level)
        with Session(engine) as session, session.begin():
            registration = register_staging(session, result)
    except SQLAlchemyError:
        parser.exit(2, "Registry transaction failed; check connectivity and migrations locally\n")
    except (OSError, ValueError, KeyError) as exc:
        if args.source_set == "additional":
            parser.exit(2, f"Additional source rejected; no import was committed: {exc}\n")
        parser.exit(2, "Source or staging metadata rejected; no import was committed\n")
    finally:
        engine.dispose()
    print(
        json.dumps(
            {
                "import_id": str(registration.import_id),
                "created": registration.created,
                "status": registration.status,
                "release_status": "not_approved",
                **(
                    {
                        "missing": result.missing_values,
                        "errors": result.error_count,
                        "unimported_issues": len(result.unimported_issues),
                        "unsupported_levels": result.unsupported_levels,
                    }
                    if args.source_set == "additional"
                    else {}
                ),
            }
        )
    )
    return 1 if registration.status == "invalid" else 0


if __name__ == "__main__":
    raise SystemExit(main())
