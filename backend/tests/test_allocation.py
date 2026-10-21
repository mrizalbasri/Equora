"""Synthetic integer-package cases, with independent brute-force reference optima."""

from dataclasses import replace
from itertools import product

import pytest
from ortools.sat.python import cp_model

from app.optimization.allocation import (
    AllocationCase,
    RegionOption,
    baseline_allocation,
    evaluate_allocation,
    solve_allocation,
)


def synthetic_case(budget=10):
    return AllocationCase(
        budget,
        100,
        (
            RegionOption("SYN-A", 4, 2, 90),
            RegionOption("SYN-B", 3, 3, 65, 1),
            RegionOption("SYN-C", 2, 2, 35),
        ),
    )


def enumerate_optimum(case):
    # Deliberately does not call production validation or reuse solver constraints.
    feasible = []
    for quantities in product(
        *(range(region.minimum_packages, region.capacity + 1) for region in case.regions)
    ):
        cost = sum(
            quantity * region.cost_idr
            for quantity, region in zip(quantities, case.regions, strict=True)
        )
        if cost <= case.budget_idr:
            feasible.append(
                sum(
                    quantity * region.priority_units
                    for quantity, region in zip(quantities, case.regions, strict=True)
                )
            )
    return max(feasible) if feasible else None


@pytest.mark.parametrize("budget", range(0, 21))
def test_solver_matches_enumeration_and_equivalent_baselines(budget):
    case = synthetic_case(budget)
    expected = enumerate_optimum(case)
    result = solve_allocation(case)
    baselines = [baseline_allocation(case, strategy=strategy) for strategy in ("equal", "greedy")]
    if expected is None:
        assert result.status == "infeasible"
        assert result.allocations is None and result.evaluation is None
        assert all(row.status == "infeasible" for row in baselines)
    else:
        assert result.status == "optimal"
        assert result.evaluation.objective_units == expected
        assert result.evaluation.budget_used_idr <= budget
        assert result.absolute_gap_units == 0
        assert evaluate_allocation(case, result.allocations) == result.evaluation
        for baseline in baselines:
            assert baseline.evaluation.objective_units <= expected
            assert evaluate_allocation(case, baseline.allocations) == baseline.evaluation


def test_sensitivity_budget_and_cost():
    case = synthetic_case()
    small = solve_allocation(case).evaluation.objective_units
    large = solve_allocation(replace(case, budget_idr=14)).evaluation.objective_units
    expensive = replace(
        case, regions=tuple(replace(row, cost_idr=row.cost_idr + 1) for row in case.regions)
    )
    assert large >= small
    assert solve_allocation(expensive).evaluation.objective_units <= small


def test_validator_rejects_bad_solver_or_external_quantities():
    case = synthetic_case()
    for allocations in (
        {"SYN-A": 1, "SYN-B": 1},
        {"SYN-A": 0, "SYN-B": 0, "SYN-C": 0},
        {"SYN-A": 3, "SYN-B": 1, "SYN-C": 0},
        {"SYN-A": 2, "SYN-B": 3, "SYN-C": 2},
        {"SYN-A": 0.5, "SYN-B": 1, "SYN-C": 0},
        {"SYN-A": True, "SYN-B": 1, "SYN-C": 0},
    ):
        with pytest.raises(ValueError):
            evaluate_allocation(case, allocations)


def test_stopped_search_is_not_reported_as_infeasible():
    result = solve_allocation(synthetic_case(), max_time_seconds=0)
    assert result.status == "no_solution"
    assert result.allocations is None and result.evaluation is None
    assert result.best_bound_units is None


def test_execution_error_does_not_leak_partial_results(monkeypatch):
    def fail(*args, **kwargs):
        raise RuntimeError("private solver diagnostic")

    monkeypatch.setattr(cp_model.CpSolver, "solve", fail)
    result = solve_allocation(synthetic_case())
    assert result.status == "execution_error"
    assert result.allocations is None and result.evaluation is None
    assert "private" not in result.reason


def test_solver_results_must_pass_independent_validation(monkeypatch):
    monkeypatch.setattr(cp_model.CpSolver, "value", lambda *args: 10**10)
    result = solve_allocation(synthetic_case())
    assert result.status == "invalid_result"
    assert result.allocations is None and result.evaluation is None


def test_optimizer_can_improve_on_greedy_and_equal_baselines():
    case = AllocationCase(
        10,
        100,
        (
            RegionOption("SYN-A", 6, 1, 90),
            RegionOption("SYN-B", 5, 2, 70),
        ),
    )
    optimal = solve_allocation(case)
    assert optimal.evaluation.objective_units == enumerate_optimum(case) == 140
    assert optimal.allocations == {"SYN-A": 0, "SYN-B": 2}
    for strategy in ("equal", "greedy"):
        assert baseline_allocation(case, strategy=strategy).evaluation.objective_units == 90


@pytest.mark.parametrize(
    "option",
    [
        RegionOption("SYN-A", 0, 1, 1),
        RegionOption("SYN-A", 2, -1, 1),
        RegionOption("SYN-A", 2, 1, 101),
        RegionOption("SYN-A", 2, 1, 1, 2),
        RegionOption("SYN-A", True, 1, 1),
        RegionOption("", 2, 1, 1),
    ],
)
def test_invalid_options_are_rejected_before_solving(option):
    with pytest.raises(ValueError):
        solve_allocation(AllocationCase(10, 100, (option,)))


def test_invalid_case_limits_and_official_cost_claims_are_rejected():
    case = synthetic_case()
    for invalid in (
        replace(case, budget_idr=-1),
        replace(case, cost_source_type="official_reference"),
        replace(case, regions=()),
        replace(case, regions=(case.regions[0], case.regions[0])),
    ):
        with pytest.raises(ValueError):
            solve_allocation(invalid)
    for limit in (-1, float("inf"), float("nan"), True):
        with pytest.raises(ValueError):
            solve_allocation(case, max_time_seconds=limit)


def test_zero_capacity_and_zero_priority_are_valid_and_repeatable():
    case = AllocationCase(0, 100, (RegionOption("SYN-A", 1, 0, 0),))
    first = solve_allocation(case)
    assert first == solve_allocation(case)
    assert first.status == "optimal"
    assert first.allocations == {"SYN-A": 0}
    assert first.evaluation.objective_units == 0
