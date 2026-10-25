"""Recompute saved input only; preserve the original scenario and report every trial."""

from dataclasses import asdict
from datetime import UTC, datetime
from decimal import ROUND_HALF_UP, Decimal, localcontext

from app.analysis.priority import METHOD_VERSION
from app.etl.local_release import CORE
from app.optimization.allocation import MODEL_VERSION, AllocationCase, RegionOption
from app.optimization.coverage import solve_coverage
from app.services.workspace import calculate_scenario, json_values

REVIEW_VERSION = "decision-review-v1"


def changed_parameters(parameters, changes):
    if changes.weight_indicator not in CORE:
        raise ValueError("Indikator bobot tidak tersedia")

    def money(value, percent, minimum):
        result = int(
            (Decimal(value) * (100 + percent) / 100).to_integral_value(rounding=ROUND_HALF_UP)
        )
        return max(minimum, result)

    weights = dict(parameters.weights)
    key = changes.weight_indicator
    if changes.weight_change_percent:
        with localcontext() as context:
            context.prec = 50
            weights[key] *= Decimal(100 + changes.weight_change_percent) / 100
            total = sum(weights.values())
            if total <= 0:
                raise ValueError("Total bobot harus positif")
            weights = {name: value / total for name, value in weights.items()}
            # Assign rounding residue to a positive weight, keeping zeros inactive.
            largest = max(weights, key=weights.get)
            weights[largest] += Decimal(1) - sum(weights.values())
    updates = {
        "budget_idr": money(parameters.budget_idr, changes.budget_change_percent, 0),
        "cost_idr": money(parameters.cost_idr, changes.cost_change_percent, 1),
        "weights": weights,
        "overrides": {
            code: row.model_copy(
                update={"cost_idr": money(row.cost_idr, changes.cost_change_percent, 1)}
            )
            for code, row in parameters.overrides.items()
        },
    }
    candidate = parameters.model_copy(update=updates)
    return type(parameters).model_validate(candidate.model_dump())


def summary(snapshot):
    result = snapshot["allocation"]
    allocation, evaluation = result.get("allocations"), result.get("evaluation")
    return {
        "eligible_regions": len(snapshot["priority"]["ranked"]),
        "excluded_regions": len(snapshot["priority"]["excluded"]),
        "receiving_regions": sum(n > 0 for n in allocation.values())
        if allocation
        else (0 if allocation == {} else None),
        "total_packages": sum(allocation.values()) if allocation is not None else None,
        **{
            key: evaluation[key] if evaluation else None
            for key in ("budget_used_idr", "budget_remaining_idr", "objective_units")
        },
    }


def region_changes(original, candidate):
    before = original["allocation"].get("allocations")
    after = candidate["allocation"].get("allocations")
    ranks = [
        {row["region_code"]: row["rank"] for row in item["priority"]["ranked"]}
        for item in (original, candidate)
    ]
    codes = {row["code"] for row in original["input_rows"]}
    return [
        {
            "region_code": code,
            "before_packages": before.get(code) if before is not None else None,
            "after_packages": after.get(code) if after is not None else None,
            "delta": after[code] - before[code]
            if before is not None and after is not None and code in before and code in after
            else None,
            "before_rank": ranks[0].get(code),
            "after_rank": ranks[1].get(code),
        }
        for code in sorted(codes)
    ]


def trial(original, candidate, label):
    return {
        "label": label,
        "budget_idr": candidate["parameters"]["budget_idr"],
        "weights": candidate["parameters"]["weights"],
        "objective_comparable": all(
            Decimal(original["parameters"]["weights"][key])
            == Decimal(candidate["parameters"]["weights"][key])
            for key in CORE
        )
        and set(original["allocation"].get("allocations") or {})
        == {row["region_code"] for row in candidate["priority"]["ranked"]},
        **{key: candidate[key] for key in ("priority", "case", "allocation")},
        "summary": summary(candidate),
        "changes": region_changes(original, candidate),
    }


def stability(original, trials):
    baseline = original["allocation"].get("allocations")
    rows = []
    for source in original["input_rows"]:
        code = source["code"]
        evaluated = [
            item
            for item in trials
            if item["allocation"].get("evaluation")
            and code in (item["allocation"].get("allocations") or {})
        ]
        quantities = [item["allocation"]["allocations"][code] for item in evaluated]
        ranks = [
            row["rank"]
            for item in trials
            if item["allocation"]["status"] != "invalid_input"
            for row in item["priority"]["ranked"]
            if row["region_code"] == code
        ]
        rows.append(
            {
                "region_code": code,
                "eligible_trials": len(ranks),
                "evaluated_trials": len(evaluated),
                "same_packages_trials": sum(q == baseline.get(code) for q in quantities)
                if baseline is not None and code in baseline
                else 0,
                "receiving_trials": sum(q > 0 for q in quantities),
                "min_packages": min(quantities, default=None),
                "max_packages": max(quantities, default=None),
                "min_rank": min(ranks, default=None),
                "max_rank": max(ranks, default=None),
            }
        )
    return rows


def review_snapshot(snapshot, parameters, changes):
    if (
        snapshot["priority"]["method_version"] != METHOD_VERSION
        or snapshot["allocation"]["model_version"] != MODEL_VERSION
    ):
        raise ValueError("Versi snapshot tidak kompatibel; buat skenario dengan metode saat ini")
    payload = {
        "id": snapshot["release_id"],
        "scopes": {parameters.education_level: snapshot["input_rows"]},
        "status": snapshot["data_status"],
        "sources": snapshot["sources"],
        "limitations": [],
    }

    def run(change, label, *, allow_invalid=False):
        try:
            candidate = changed_parameters(parameters, change)
            calculated = calculate_scenario(payload, candidate, max_time_seconds=1)
        except ValueError:
            if not allow_invalid:
                raise
            calculated = {
                **snapshot,
                "allocation": {
                    "status": "invalid_input",
                    "allocations": None,
                    "evaluation": None,
                    "reason": "Perubahan melewati batas input; percobaan tidak dinilai",
                },
            }
        return {**trial(snapshot, calculated, label), "perturbation": change.model_dump()}

    what_if = run(changes, "Pilihan asumsi Anda")
    case = AllocationCase(
        **{key: value for key, value in snapshot["case"].items() if key != "regions"},
        regions=tuple(RegionOption(**row) for row in snapshot["case"]["regions"]),
    )
    coverage = solve_coverage(case)
    fair = {**snapshot, "allocation": asdict(coverage.allocation)}
    trials = []
    for field, label in (("budget_change_percent", "Anggaran"), ("cost_change_percent", "Biaya")):
        for delta in (-10, 10):
            change = type(changes)(
                **{field: delta, "budget_change_percent": 0}
                if field != "budget_change_percent"
                else {field: delta}
            )
            trials.append(run(change, f"{label} {delta:+d}%", allow_invalid=True))
    for key in CORE:
        if parameters.weights[key] == 0:
            continue
        for delta in (-10, 10):
            change = type(changes)(
                budget_change_percent=0, weight_indicator=key, weight_change_percent=delta
            )
            trials.append(run(change, f"Bobot {key} {delta:+d}% relatif", allow_invalid=True))
    return json_values(
        {
            "snapshot_id": snapshot["id"],
            "release_id": snapshot["release_id"],
            "review_version": REVIEW_VERSION,
            "computed_at": datetime.now(UTC).isoformat(),
            "changes": changes.model_dump(),
            "original": summary(snapshot),
            "what_if": what_if,
            "coverage": trial(snapshot, fair, "Jangkauan wilayah terlebih dahulu"),
            "coverage_status": coverage.coverage_status,
            "sensitivity": trials,
            "stability": stability(snapshot, trials),
            "limitations": [
                "Jangkauan menghitung provinsi penerima; bukan pemerataan antarsekolah atau siswa.",
                "Biaya dan kapasitas adalah asumsi demo; objective hanya proxy kebutuhan.",
                "Uji otomatis mengubah satu asumsi +/-10%; bukan prediksi probabilitas.",
                "Bobot diubah relatif lalu dinormalisasi; bobot nol tetap nol.",
                "Biaya dibulatkan HALF_UP ke rupiah, minimum Rp1, termasuk override wilayah.",
                "Perubahan yang melewati batas input ditolak. Satu detik solver per percobaan.",
                "Feasible belum membuktikan optimum; alokasi solusi setara dapat berbeda.",
                "Percobaan tanpa solusi tervalidasi tidak dihitung sebagai alokasi stabil.",
                "Review memakai input snapshot tersimpan dan tidak mengubah skenario awal.",
            ],
        }
    )
