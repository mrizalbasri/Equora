"""Synthetic benchmark cases for region insight summaries."""

import pytest

from app.etl.local_release import CORE
from app.services.region_insights import build_region_insights


def release(rows, *, source_ids=CORE):
    return {
        "id": "synthetic-release",
        "status": "local_review",
        "academic_year": "2025/2026",
        "ownership": "Total",
        "sources": [{"source_id": source_id, "unit": "percent"} for source_id in source_ids],
        "scopes": {"SD": rows},
        "limitations": ["Synthetic tests only"],
    }


def row(code, values, schools="10"):
    return {
        "code": code,
        "name": f"Synthetic {code}",
        "values": {**values, "institutions_count": schools},
    }


def test_builds_even_median_standard_rank_and_deterministic_ties():
    payload = release(
        [
            row("11", dict.fromkeys(CORE, "20")),
            row("12", dict.fromkeys(CORE, "60")),
            row("13", dict.fromkeys(CORE, "60")),
            row("14", dict.fromkeys(CORE, "100")),
        ]
    )
    result = build_region_insights(payload, "SD", "12")
    first = result["benchmarks"][0]
    assert first == {
        "source_id": CORE[0],
        "value": "60",
        "median": "60",
        "delta_from_median": "0",
        "rank": 2,
        "available_regions": 4,
        "comparison": "equal",
        "unavailable_reason": None,
    }
    assert result["attention_source_id"] is None
    assert result["strength_source_id"] is None

    payload["scopes"]["SD"][0]["values"].update(
        {CORE[0]: "10", CORE[1]: "10", CORE[2]: "90", CORE[3]: "90"}
    )
    result = build_region_insights(payload, "SD", "11")
    assert result["attention_source_id"] == CORE[0]
    assert result["strength_source_id"] == CORE[2]


def test_excludes_missing_invalid_and_no_school_values():
    payload = release(
        [
            row("11", {CORE[0]: "25"}),
            row("12", {CORE[0]: None}),
            row("13", {CORE[0]: "0"}, schools="0"),
            row("14", {CORE[0]: "invalid"}),
            row("15", {CORE[0]: "75"}),
        ],
        source_ids=(CORE[0],),
    )
    result = build_region_insights(payload, "SD", "11")
    benchmark = result["benchmarks"][0]
    assert benchmark["median"] == "50"
    assert benchmark["delta_from_median"] == "-25"
    assert benchmark["available_regions"] == 2
    assert result["attention_source_id"] == CORE[0]

    assert (
        build_region_insights(payload, "SD", "12")["benchmarks"][0]["unavailable_reason"]
        == "missing"
    )
    assert (
        build_region_insights(payload, "SD", "13")["benchmarks"][0]["unavailable_reason"]
        == "no_schools"
    )
    assert (
        build_region_insights(payload, "SD", "14")["benchmarks"][0]["unavailable_reason"]
        == "invalid"
    )


@pytest.mark.parametrize("invalid_value", ["-1", "101"])
def test_rejects_percentages_outside_the_valid_range(invalid_value):
    payload = release(
        [row("11", {CORE[0]: invalid_value}), row("12", {CORE[0]: "50"})],
        source_ids=(CORE[0],),
    )
    benchmark = build_region_insights(payload, "SD", "11")["benchmarks"][0]
    assert benchmark["value"] is None
    assert benchmark["unavailable_reason"] == "invalid"
    assert benchmark["available_regions"] == 1


def test_single_valid_region_does_not_create_relative_claims():
    payload = release(
        [row("11", {CORE[0]: "25"}), row("12", {CORE[0]: None})],
        source_ids=(CORE[0],),
    )
    result = build_region_insights(payload, "SD", "11")
    assert result["available_indicators"] == 1
    assert result["benchmarks"][0]["available_regions"] == 1
    assert result["attention_source_id"] is None
    assert result["strength_source_id"] is None


def test_unknown_region_is_rejected():
    payload = release([row("11", {CORE[0]: "25"})], source_ids=(CORE[0],))
    with pytest.raises(ValueError, match="Wilayah tidak ditemukan"):
        build_region_insights(payload, "SD", "99")
