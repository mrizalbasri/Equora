"""CLI for local staging from the pinned source manifest and audit metadata."""

import argparse
import json
from pathlib import Path

from app.etl.additional_education import audited_additional_source, stage_additional_workbook
from app.etl.education import LEVELS, SourceMetadata, stage_workbook

ROOT = Path(__file__).resolve().parents[3]
PROCESSED_ROOT = ROOT / "data/processed"


def audited_source(source_id: str, manifest: dict, audit: dict) -> SourceMetadata:
    source = next((row for row in manifest["sources"] if row["id"] == source_id), None)
    report = next((row for row in audit["sources"] if row["id"] == source_id), None)
    if source is None or report is None:
        raise ValueError("Source must exist in both the manifest and audit report")
    if source["sha256"] != report["sha256"]:
        raise ValueError("Manifest and audit SHA256 do not match")
    return SourceMetadata(
        source_id=source_id,
        title=report["title"],
        publisher=manifest["publisher"],
        source_url=source["source_url"],
        sha256=source["sha256"],
        year=int(manifest["academic_year"].split("/")[0]),
        academic_year=manifest["academic_year"],
        unit=source["unit"],
        retrieved_at=report["retrieved_at"],
        license_status=manifest["license_status"],
    )


def write_staging(output: Path, result) -> None:
    output = output.resolve()
    if not output.is_relative_to(PROCESSED_ROOT.resolve()):
        raise ValueError("Write staging output only under data/processed")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x", encoding="utf-8", newline="\n") as stream:
        stream.write(result.model_dump_json(indent=2) + "\n")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--source-set", choices=("original", "additional"), default="original")
    parser.add_argument("--file", required=True, type=Path)
    parser.add_argument("--education-level", required=True, choices=LEVELS)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args(argv)
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
        write_staging(args.output, result)
    except (OSError, ValueError, KeyError) as exc:
        parser.exit(2, f"Staging failed: {exc}\n")
    print(
        json.dumps(
            {
                "status": result.status,
                "observations": len(result.observations),
                "missing": result.missing_values,
                "errors": result.error_count,
                "release_status": "not_approved",
                **(
                    {
                        "warnings": sum(issue.severity == "warning" for issue in result.issues),
                        "unimported_issues": len(result.unimported_issues),
                        "unsupported_levels": result.unsupported_levels,
                    }
                    if args.source_set == "additional"
                    else {}
                ),
            }
        )
    )
    return 1 if result.status == "invalid" else 0


if __name__ == "__main__":
    raise SystemExit(main())
