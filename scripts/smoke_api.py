"""Check a running API; --write explicitly creates two shared smoke-test scenarios."""

import argparse
import json
import time

import httpx


def post(client, path, body):
    # Only retry an explicit rejection, never a timeout or a potentially committed write.
    for attempt in range(4):
        response = client.post(path, json=body)
        if response.status_code != 429 or attempt == 3:
            response.raise_for_status()
            return response
        time.sleep(min(60, max(1, int(response.headers.get("Retry-After", "1")))))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:18000")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    with httpx.Client(
        base_url=args.base_url.rstrip("/") + "/api/v1/", timeout=30
    ) as client:
        for path in ("health/ready", "workspace", "regions", "datasets"):
            response = client.get(path)
            response.raise_for_status()
            print(path + "=ok")
        workspace = client.get("workspace").json()
        release = workspace["id"]
        query = {"release_id": release, "education_level": "SD"}
        regions = client.get("regions", params=query).json()
        response = client.get("regions/" + regions[0]["code"], params=query)
        response.raise_for_status()
        print("profile=ok")
        if not args.write:
            return
        body = {
            "release_id": release,
            "name": "Verifikasi operasional lokal A",
            "education_level": "SD",
            "budget_idr": 1000000000,
            "cost_idr": 10000000,
            "capacity": 10,
            "minimum_packages": 0,
            "weights": dict.fromkeys(workspace["core_indicators"], "0.25"),
            "region_codes": [row["code"] for row in regions],
        }
        identifiers = []
        for budget, name in [(1000000000, "A"), (1200000000, "B")]:
            body.update(budget_idr=budget, name="Verifikasi operasional lokal " + name)
            response = post(client, "scenarios", body)
            response.raise_for_status()
            snapshot = response.json()
            identifiers.append(snapshot["id"])
            if snapshot["allocation"]["status"] not in ("optimal", "feasible"):
                raise RuntimeError("Smoke scenario has no usable solution")
            root = "scenarios/" + snapshot["id"]
            reopened = client.get(root)
            reopened.raise_for_status()
            if reopened.json() != snapshot:
                raise RuntimeError("Saved snapshot differs from original result")
            pdf = client.get(root + "/pdf")
            pdf.raise_for_status()
            if not pdf.content.startswith(b"%PDF"):
                raise RuntimeError("Invalid PDF")
            csv = client.get(root + "/export")
            csv.raise_for_status()
            if not csv.content:
                raise RuntimeError("Empty CSV")
        pair = dict(zip(("left", "right"), identifiers, strict=True))
        post(client, "scenarios/compare", pair)
        pdf = post(client, "scenarios/compare/pdf", pair)
        pdf.raise_for_status()
        if not pdf.content.startswith(b"%PDF"):
            raise RuntimeError("Invalid comparison PDF")
        print(
            json.dumps(
                {"created_scenarios": identifiers, "comparison_and_exports": "ok"}
            )
        )


if __name__ == "__main__":
    main()
