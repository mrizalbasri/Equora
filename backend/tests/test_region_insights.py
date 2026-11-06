"""Synthetic benchmark cases for region insight summaries."""

import pytest

from app.etl.local_release import CORE
from app.services.region_insights import build_region_insights, build_region_map_insights


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


def test_builds_map_insights_for_all_regions_from_one_benchmark_scope():
    payload = release(
        [
            row("11", dict.fromkeys(CORE, "20")),
            row("12", dict.fromkeys(CORE, "60")),
            row("13", dict.fromkeys(CORE, "60")),
            row("14", dict.fromkeys(CORE, "100")),
        ]
    )
    for source in payload["sources"]:
        source.update(title=f"Synthetic {source['source_id']}", definition="Synthetic only")

    result = build_region_map_insights(payload, "SD", CORE[0])

    assert result["indicator"] == {
        "source_id": CORE[0],
        "title": f"Synthetic {CORE[0]}",
        "unit": "percent",
        "definition": "Synthetic only",
    }
    assert result["median"] == "60"
    assert result["available_regions"] == 4
    assert result["total_regions"] == 4
    assert result["rows"][1] == {
        "code": "12",
        "name": "Synthetic 12",
        "value": "60",
        "comparison": "equal",
        "delta_from_median": "0",
        "rank": 2,
        "available_indicators": 4,
        "total_indicators": 4,
        "completeness_ratio": "1",
        "attention_source_id": None,
        "unavailable_reason": None,
    }


def test_map_insights_preserve_missing_reasons_and_match_region_insights():
    payload = release(
        [
            row("11", {CORE[0]: "25", CORE[1]: "50"}),
            row("12", {CORE[0]: None, CORE[1]: "75"}),
            row("13", {CORE[0]: "0", CORE[1]: "0"}, schools="0"),
        ],
        source_ids=(CORE[0], CORE[1]),
    )
    for source in payload["sources"]:
        source.update(title=source["source_id"], definition="Synthetic only")

    result = build_region_map_insights(payload, "SD", CORE[0])
    by_code = {item["code"]: item for item in result["rows"]}

    assert result["median"] == "25"
    assert by_code["12"]["value"] is None
    assert by_code["12"]["comparison"] == "unavailable"
    assert by_code["12"]["unavailable_reason"] == "missing"
    assert by_code["12"]["available_indicators"] == 1
    assert by_code["12"]["completeness_ratio"] == "0.5"
    assert by_code["13"]["unavailable_reason"] == "no_schools"

    single = build_region_insights(payload, "SD", "11")
    selected = next(item for item in single["benchmarks"] if item["source_id"] == CORE[0])
    assert by_code["11"]["value"] == selected["value"]
    assert by_code["11"]["delta_from_median"] == selected["delta_from_median"]
    assert by_code["11"]["rank"] == selected["rank"]
    assert by_code["11"]["attention_source_id"] == single["attention_source_id"]


def test_map_insights_keep_completeness_for_non_percent_indicators():
    payload = release(
        [row("11", {CORE[0]: "25", "institutions_count": "10"})],
        source_ids=(CORE[0],),
    )
    payload["sources"].append(
        {
            "source_id": "institutions_count",
            "unit": "school_count",
            "title": "Jumlah sekolah",
            "definition": "Synthetic only",
        }
    )
    payload["sources"][0].update(title=CORE[0], definition="Synthetic only")

    result = build_region_map_insights(payload, "SD", "institutions_count")
    item = result["rows"][0]

    assert result["median"] is None
    assert item["value"] == "10"
    assert item["comparison"] == "unavailable"
    assert item["delta_from_median"] is None
    assert item["rank"] is None
    assert item["unavailable_reason"] == "unsupported_unit"
    assert item["completeness_ratio"] == "1"


def test_map_insights_reject_unknown_indicator():
    payload = release([row("11", {CORE[0]: "25"})], source_ids=(CORE[0],))
    with pytest.raises(ValueError, match="Indikator tidak tersedia"):
        build_region_map_insights(payload, "SD", "absent")
