"""Pinned community boundary, joined through a reviewed explicit crosswalk."""

import hashlib
import json
from pathlib import Path

BUNDLED_BOUNDARY_DIR = Path(__file__).resolve().parent / "boundary_data"


def geometry(data_dir=None):
    if (
        data_dir
        and (data_dir / "metadata/boundary-local.json").exists()
        and (data_dir / "raw/boundary-local/provinces.geojson").exists()
    ):
        manifest_path = data_dir / "metadata/boundary-local.json"
        raw_path = data_dir / "raw/boundary-local/provinces.geojson"
    else:
        manifest_path = BUNDLED_BOUNDARY_DIR / "boundary-local.json"
        raw_path = BUNDLED_BOUNDARY_DIR / "provinces.geojson"

    manifest = json.loads(manifest_path.read_text("utf-8"))
    raw = raw_path.read_bytes()
    normalized = raw.replace(b"\r\n", b"\n")
    if hashlib.sha256(normalized).hexdigest() != manifest["sha256"]:
        raise ValueError("Boundary hash changed")
    payload = json.loads(normalized)
    mapping = {row["feature_id"]: row for row in manifest["crosswalk"]}
    if len(mapping) != 38 or len(payload["features"]) != 38:
        raise ValueError("Boundary count changed")
    seen = set()
    for feature in payload["features"]:
        row = mapping[feature["properties"]["id"]]
        if feature["properties"]["PROVINSI"] != row["boundary_name"]:
            raise ValueError("Boundary name changed")
        code = row["source_code"]
        if code in seen:
            raise ValueError("Duplicate source region")
        seen.add(code)
        feature["id"] = code
        feature["properties"] = {"code": code, "name": row["boundary_name"]}
    payload["attribution"] = manifest["attribution"]
    payload["source_url"] = manifest["url"]
    payload["license_url"] = manifest["license_url"]
    return payload
