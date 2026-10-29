"""Back up the existing local Equora DB and optionally verify a disposable restore.

Uses the PostgreSQL tools and admin role already configured inside the container.
Never overwrites an existing dump or restores into an application database.
"""

import argparse
import json
import re
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4


def command(container, script, *arguments, stdin=None, stdout=None):
    result = subprocess.run(
        [
            "docker",
            "exec",
            "-i",
            container,
            "sh",
            "-ec",
            script,
            "equora-backup",
            *arguments,
        ],
        input=stdin,
        stdout=stdout if stdout is not None else subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode:
        raise RuntimeError(
            "PostgreSQL backup operation failed; inspect container health and access."
        )
    return result.stdout


def summary(container, database):
    sql = (
        "SELECT json_build_object('releases', (SELECT count(*) FROM local_releases), "
        "'scenarios', (SELECT count(*) FROM scenario_snapshots), "
        "'migration', (SELECT version_num FROM alembic_version))"
    )
    raw = command(
        container,
        'exec psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d "$1" -Atc "$2"',
        database,
        sql,
    )
    return json.loads(raw)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--container", default="postgres-local")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--verify-restore", action="store_true")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_.-]*", args.container):
        parser.error("Invalid container name")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    before = summary(args.container, "equora")
    # Exclusive create protects previous backups; a partial dump is never reported as valid.
    with args.output.open("xb") as output:
        command(
            args.container,
            'exec pg_dump -U "${POSTGRES_USER:-postgres}" -d equora -Fc',
            stdout=output,
        )
    manifest = {
        "created_at": datetime.now(UTC).isoformat(),
        "source": before,
        "restore_verified": False,
    }
    if args.verify_restore:
        scratch = "equora_restorecheck_" + uuid4().hex
        created = False
        try:
            command(
                args.container,
                'exec createdb -U "${POSTGRES_USER:-postgres}" "$1"',
                scratch,
            )
            created = True
            command(
                args.container,
                'exec pg_restore -U "${POSTGRES_USER:-postgres}" -d "$1" '
                "--no-owner --no-acl --exit-on-error",
                scratch,
                stdin=args.output.read_bytes(),
            )
            restored = summary(args.container, scratch)
            if restored != before:
                raise RuntimeError(
                    "Restored counts differ; rerun with scenario writes paused."
                )
            manifest["restore_verified"] = True
        finally:
            if created and re.fullmatch(r"equora_restorecheck_[0-9a-f]{32}", scratch):
                command(
                    args.container,
                    'exec dropdb -U "${POSTGRES_USER:-postgres}" "$1"',
                    scratch,
                )
    manifest_path = args.output.with_suffix(args.output.suffix + ".json")
    with manifest_path.open("x", encoding="utf-8") as output:
        json.dump(manifest, output, indent=2)
    print(json.dumps(manifest))


if __name__ == "__main__":
    main()
