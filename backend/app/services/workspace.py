"""Read-only local data views and reproducible decision calculations."""

from dataclasses import asdict
from decimal import ROUND_HALF_UP, Decimal

from app.analysis.priority import RegionNeeds, access_percentage_to_need, rank_needs
from app.etl.local_release import CORE
from app.optimization.allocation import (
    AllocationCase,
    RegionOption,
    baseline_allocation,
    solve_allocation,
)


def json_values(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, dict):
        return {key: json_values(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [json_values(item) for item in value]
    return value


def priority(payload, level, weights, region_codes=None):
    if set(weights) != set(CORE):
        raise ValueError("Empat indikator persentase harus memiliki bobot eksplisit")
    selected = set(region_codes) if region_codes else None
    rows = payload["scopes"][level]
    if selected and not selected <= {row["code"] for row in rows}:
        raise ValueError("Kode wilayah tidak tersedia pada snapshot")
    needs = []
    for row in rows:
        if selected is not None and row["code"] not in selected:
            continue
        denominator = row["values"]["institutions_count"]
        needs.append(
            RegionNeeds(
                row["code"],
                {
                    indicator: access_percentage_to_need(Decimal(row["values"][indicator]))
                    if row["values"][indicator] is not None
                    and denominator is not None
                    and Decimal(denominator) > 0
                    else None
                    for indicator in CORE
                },
            )
        )
    return rank_needs(needs, weights)


def calculate_scenario(payload, parameters, *, max_time_seconds=5):
    ranking = priority(
        payload, parameters.education_level, parameters.weights, parameters.region_codes
    )
    if not ranking.ranked:
        raise ValueError("Tidak ada wilayah dengan data lengkap untuk indikator berbobot positif")
    unknown = set(parameters.overrides) - {row.region_code for row in ranking.ranked}
    if unknown:
        raise ValueError("Override hanya boleh untuk wilayah yang masuk peringkat")
    options = []
    for row in ranking.ranked:
        override = parameters.overrides.get(row.region_code)
        options.append(
            RegionOption(
                row.region_code,
                override.cost_idr if override else parameters.cost_idr,
                override.capacity if override else parameters.capacity,
                int((row.score * 10000).to_integral_value(rounding=ROUND_HALF_UP)),
                override.minimum_packages if override else parameters.minimum_packages,
            )
        )
    case = AllocationCase(parameters.budget_idr, 10000, tuple(options))
    result = solve_allocation(case, max_time_seconds=max_time_seconds)
    return json_values(
        {
            "release_id": payload["id"],
            "region_names": {
                row["code"]: row["name"] for row in payload["scopes"][parameters.education_level]
            },
            "input_rows": [
                row
                for row in payload["scopes"][parameters.education_level]
                if not parameters.region_codes or row["code"] in parameters.region_codes
            ],
            "data_status": payload["status"],
            "parameters": parameters.model_dump(mode="json"),
            "priority": asdict(ranking),
            "allocation": asdict(result),
            "baselines": {
                strategy: asdict(baseline_allocation(case, strategy=strategy))
                for strategy in ("equal", "greedy")
            },
            "case": asdict(case),
            "sources": payload["sources"],
            "limitations": payload["limitations"]
            + [
                "Biaya dan kapasitas adalah asumsi demo pengguna, bukan referensi anggaran resmi.",
                (
                    "Objective adalah proxy kebutuhan; bukan jumlah sekolah pasti terbantu "
                    "atau bukti dampak."
                ),
                "Prioritas dibulatkan HALF_UP ke skala 10000 hanya untuk objective integer solver.",
            ],
        }
    )


def compare_snapshots(left, right):
    if (
        left["release_id"],
        left["parameters"]["education_level"],
        left["priority"]["method_version"],
        left["allocation"]["model_version"],
    ) != (
        right["release_id"],
        right["parameters"]["education_level"],
        right["priority"]["method_version"],
        right["allocation"]["model_version"],
    ):
        raise ValueError("Snapshot berbeda data, jenjang atau versi metode/model")
    if not left["allocation"].get("evaluation") or not right["allocation"].get("evaluation"):
        raise ValueError("Kedua snapshot memerlukan solusi yang tervalidasi")
    left_ranks = {row["region_code"]: row["rank"] for row in left["priority"]["ranked"]}
    right_ranks = {row["region_code"]: row["rank"] for row in right["priority"]["ranked"]}
    left_alloc, right_alloc = left["allocation"]["allocations"], right["allocation"]["allocations"]
    same_weights = all(
        Decimal(left["parameters"]["weights"][key]) == Decimal(right["parameters"]["weights"][key])
        for key in CORE
    )
    same_scope = set(left_ranks) == set(right_ranks)
    warnings = []
    if not same_weights:
        warnings.append("Bobot berbeda; objective proxy tidak dibandingkan sebagai dampak setara.")
    if not same_scope:
        warnings.append(
            "Cakupan wilayah layak berbeda; baca perubahan coverage dan wilayah exclude."
        )
    comparable = same_weights and same_scope
    return {
        "left": left,
        "right": right,
        "objective_comparable": comparable,
        "warnings": warnings,
        "coverage": {
            label: {
                "eligible_regions": len(snapshot["priority"]["ranked"]),
                "receiving_regions": sum(n > 0 for n in allocations.values()),
                "total_packages": sum(allocations.values()),
                "excluded_regions": len(snapshot["priority"]["excluded"]),
            }
            for label, snapshot, allocations in (
                ("left", left, left_alloc),
                ("right", right, right_alloc),
            )
        },
        "budget_delta_idr": right["allocation"]["evaluation"]["budget_used_idr"]
        - left["allocation"]["evaluation"]["budget_used_idr"],
        "rows": [
            {
                "region_code": code,
                "left_packages": left_alloc.get(code, 0),
                "right_packages": right_alloc.get(code, 0),
                "delta": right_alloc.get(code, 0) - left_alloc.get(code, 0),
                "left_rank": left_ranks.get(code),
                "right_rank": right_ranks.get(code),
            }
            for code in sorted(set(left_alloc) | set(right_alloc))
        ],
    }
