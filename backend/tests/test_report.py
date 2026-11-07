import copy
from decimal import Decimal

from app.etl.local_release import CORE
from app.services.report import (
    _region_label,
    _rupiah,
    _weights_summary,
    snapshot_pdf,
)
from app.services.workspace import calculate_scenario, compare_snapshots
from tests.test_workspace import params


def test_report_helpers():
    assert _rupiah(None) == "Tidak tersedia"
    assert _rupiah(0) == "Rp 0"
    assert _rupiah(1500000) == "Rp 1.500.000"
    assert _rupiah(-500000) == "-Rp 500.000"

    assert _region_label({"11": "Aceh"}, "11") == "Aceh (11)"
    assert _region_label({"11": "11"}, "11") == "11"
    assert _region_label({}, "11") == "11"

    weights = {"sanitation_percent": Decimal("0.25"), "custom_key": "not-a-number"}
    summary = _weights_summary(weights)
    assert "Sanitasi dasar: 25%" in summary
    assert "custom_key: not-a-number" in summary


def test_snapshot_pdf_single_and_with_overrides(payload):
    snapshot = calculate_scenario(payload, params(payload))
    snapshot["id"] = "snapshot-1"
    snapshot["created_at"] = "2026-11-07T00:00:00Z"
    snapshot["parameters"]["overrides"] = {
        "11": {"cost_idr": 15, "capacity": 3, "minimum_packages": 1}
    }
    pdf_bytes = snapshot_pdf(snapshot)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")


def test_snapshot_pdf_with_and_without_excluded(payload):
    snapshot = calculate_scenario(payload, params(payload))
    assert snapshot["priority"]["excluded"]
    pdf_with_excluded = snapshot_pdf(snapshot)
    assert pdf_with_excluded.startswith(b"%PDF")

    no_excluded = copy.deepcopy(snapshot)
    no_excluded["priority"]["excluded"] = {}
    pdf_no_excluded = snapshot_pdf(no_excluded)
    assert pdf_no_excluded.startswith(b"%PDF")


def test_snapshot_pdf_unallocated_or_reason(payload):
    snapshot = calculate_scenario(payload, params(payload))
    snapshot["allocation"]["allocations"] = {"11": None}
    snapshot["baselines"]["custom"] = {
        "status": "failed",
        "evaluation": None,
        "reason": "Simulated solver timeout",
    }
    pdf_bytes = snapshot_pdf(snapshot)
    assert pdf_bytes.startswith(b"%PDF")


def test_snapshot_pdf_comparison_positive_and_negative(payload):
    left = calculate_scenario(payload, params(payload))
    left["id"] = "left-scenario-id"
    left["created_at"] = "2026-11-07T00:00:00Z"

    right = copy.deepcopy(left)
    right["parameters"]["weights"][CORE[0]] = "0.50"
    right["parameters"]["name"] = "Alternative scenario"
    right["id"] = "right-scenario-id"

    comparison = compare_snapshots(left, right)
    comparison["budget_delta_idr"] = 5000
    comparison["warnings"] = ["Budget limit differed slightly."]
    comparison["rows"][0]["delta"] = 1
    comparison["rows"][0]["left_rank"] = None
    comparison["rows"][0]["right_rank"] = 2

    pdf_pos = snapshot_pdf(left, comparison=comparison)
    assert pdf_pos.startswith(b"%PDF")

    comparison_neg = copy.deepcopy(comparison)
    comparison_neg["budget_delta_idr"] = -5000
    comparison_neg["rows"][0]["delta"] = -1
    comparison_neg["rows"][0]["left_rank"] = 1
    comparison_neg["rows"][0]["right_rank"] = None
    pdf_neg = snapshot_pdf(left, comparison=comparison_neg)
    assert pdf_neg.startswith(b"%PDF")
