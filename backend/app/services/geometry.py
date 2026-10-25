"""Pinned community boundary, joined through a reviewed explicit crosswalk."""

import hashlib
import json


def geometry(data_dir):
    manifest = json.loads((data_dir / "metadata/boundary-local.json").read_text("utf-8"))
    raw = (data_dir / "raw/boundary-local/provinces.geojson").read_bytes()
    if hashlib.sha256(raw).hexdigest() != manifest["sha256"]:
        raise ValueError("Boundary hash changed")
    payload = json.loads(raw)
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
