"""Fetch only the pinned boundary asset; never replace a different local file."""

import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "data/metadata/boundary-local.json").read_text("utf-8"))
target = root / "data/raw/boundary-local/provinces.geojson"
raw = target.read_bytes() if target.exists() else urlopen(manifest["url"], timeout=30).read()
if hashlib.sha256(raw).hexdigest() != manifest["sha256"]:
    raise SystemExit("Boundary hash mismatch; no file written")
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(raw)
print("Pinned boundary ready: 38 provinces, community source")
