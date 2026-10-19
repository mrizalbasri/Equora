"""Export the API schema without a running server or database."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.main import create_app  # noqa: E402

target = ROOT / "backend" / "openapi.json"
target.write_text(json.dumps(create_app().openapi(), indent=2) + "\n", encoding="utf-8")
print(f"Exported {target}")
