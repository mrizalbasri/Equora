"""Synthetic reference cases, not measurements of real regions."""

from decimal import Decimal as D

import pytest

from app.analysis.priority import RegionNeeds, access_percentage_to_need, rank_needs


def test_golden_weighted_contributions_and_missing_coverage():
    result = rank_needs(
        [
            RegionNeeds("SYN-B", {"water": D("0.8"), "sanitation": D("0.2")}),
            RegionNeeds("SYN-A", {"water": D("0.4"), "sanitation": D("0.6")}),
            RegionNeeds("SYN-MISSING", {"water": None, "sanitation": D(1)}),
            RegionNeeds("SYN-ZERO", {"water": D(0), "sanitation": D(0)}),
        ],
        {"water": D("0.25"), "sanitation": D("0.75")},
    )
    assert result.input_regions == 4
    assert [(row.region_code, row.rank, row.score) for row in result.ranked] == [
        ("SYN-A", 1, D("0.55")),
        ("SYN-B", 2, D("0.35")),
        ("SYN-ZERO", 3, D(0)),
    ]
    assert result.ranked[0].contributions == {"sanitation": D("0.45"), "water": D("0.10")}
    assert result.excluded == {"SYN-MISSING": ("water",)}


def test_ties_and_output_are_independent_of_input_order():
    rows = [RegionNeeds("SYN-B", {"gap": D("0.5")}), RegionNeeds("SYN-A", {"gap": D("0.5")})]
    weights = {"gap": D(1)}
    result = rank_needs(rows, weights)
    assert result == rank_needs(list(reversed(rows)), weights)
    assert [row.region_code for row in result.ranked] == ["SYN-A", "SYN-B"]
    weights["gap"] = D(0)
    assert result.weights["gap"] == D(1)


def test_weight_sensitivity_changes_rank_and_zero_weight_needs_are_not_required():
    rows = [
        RegionNeeds("SYN-A", {"water": D(1)}),
        RegionNeeds("SYN-B", {"water": D(0), "sanitation": D(1)}),
    ]
    first = rank_needs(rows, {"water": D(1), "sanitation": D(0)})
    second = rank_needs(rows, {"water": D(0), "sanitation": D(1)})
    assert first.ranked[0].region_code == "SYN-A"
    assert second.ranked[0].region_code == "SYN-B"
    assert second.excluded == {"SYN-A": ("sanitation",)}


@pytest.mark.parametrize(
    "access, expected", [(D(0), D(1)), (D(100), D(0)), (D(25), D("0.75")), (None, None)]
)
def test_percentage_direction_and_missing(access, expected):
    assert access_percentage_to_need(access) == expected


@pytest.mark.parametrize("value", [D(-1), D(101), D("NaN"), D("Infinity"), True, 0.5])
def test_percentage_rejects_invalid_values(value):
    with pytest.raises(ValueError):
        access_percentage_to_need(value)


@pytest.mark.parametrize(
    "weights", [{}, {"gap": D("0.9")}, {"gap": D("-0.1")}, {"gap": D("NaN")}, {"gap": True}]
)
def test_rejects_invalid_weights(weights):
    with pytest.raises(ValueError):
        rank_needs([], weights)


def test_rejects_duplicates_unknown_indicators_and_out_of_range_needs():
    weights = {"gap": D(1)}
    bad_cases = [
        [RegionNeeds("SYN-A", {}), RegionNeeds("SYN-A", {})],
        [RegionNeeds("SYN-A", {"typo": D(1)})],
        [RegionNeeds("SYN-A", {"gap": D("1.1")})],
        [RegionNeeds("", {"gap": D(0)})],
    ]
    for rows in bad_cases:
        with pytest.raises(ValueError):
            rank_needs(rows, weights)
    with pytest.raises(ValueError):
        rank_needs([], weights, missing_policy="zero")


def test_empty_or_all_missing_results_remain_explicit():
    assert rank_needs([], {"gap": D(1)}).ranked == ()
    result = rank_needs([RegionNeeds("SYN-A", {})], {"gap": D(1)})
    assert result.ranked == ()
    assert result.excluded == {"SYN-A": ("gap",)}
