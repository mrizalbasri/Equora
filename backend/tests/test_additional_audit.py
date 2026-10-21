"""Scale and reconciliation checks use synthetic values, without distributing workbooks."""

import importlib.util
from decimal import Decimal
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location(
    "audit_local_education",
    Path(__file__).resolve().parents[2] / "scripts/audit_local_education.py",
)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def test_fraction_percent_is_scaled_once_while_points_and_counts_stay_unchanged():
    fraction = {"unit": "percent", "storage_scale": "fraction_with_percent_format"}
    points = {"unit": "percent", "storage_scale": "percentage_points"}
    count = {"unit": "school_count", "storage_scale": "count"}
    assert audit.normalize_value(0.75, fraction, "0.00%") == (Decimal(75), None)
    assert audit.normalize_value(75, points, "General") == (Decimal(75), None)
    assert audit.normalize_value(1250, count, "General") == (Decimal(1250), None)
    assert audit.normalize_value(None, fraction, "0.00%") == (None, "missing")
    assert audit.normalize_value(0, fraction, "0.00%") == (Decimal(0), None)


def test_storage_declarations_fail_closed():
    fraction = {"unit": "percent", "storage_scale": "fraction_with_percent_format"}
    with pytest.raises(ValueError, match="format changed"):
        audit.normalize_value(0.75, fraction, "General")
    assert audit.normalize_value(75, fraction, "0.00%") == (None, "invalid_range")
    with pytest.raises(ValueError, match="Unsupported"):
        audit.normalize_value(0.75, {"unit": "percent", "storage_scale": "unknown"}, "0.00%")


def test_reconciliation_distinguishes_match_mismatch_missing_and_zero_denominator():
    keys = [(str(index), "SD", "Total") for index in range(4)]
    numerator = dict(zip(keys, (Decimal(3), Decimal(2), None, Decimal(0)), strict=True))
    denominator = dict(zip(keys, (Decimal(4), Decimal(4), Decimal(4), Decimal(0)), strict=True))
    percentages = dict(zip(keys, (Decimal(75), Decimal(25), Decimal(0), Decimal(0)), strict=True))
    result = audit.reconcile(numerator, percentages, denominator)
    assert result["outcomes"] == {
        "match": 1,
        "mismatch": 1,
        "missing_or_invalid": 1,
        "zero_denominator": 1,
    }
    assert result["sd_total_outcomes"] == result["outcomes"]
    assert result["mismatch_keys"] == [
        {"source_region_code": "1", "level": "SD", "ownership": "Total"}
    ]
