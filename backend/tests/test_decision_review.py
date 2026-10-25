"""Independent small optima and saved-input invariants for decision review."""

# Pytest resolves the imported fixture through arguments with the same name.
# ruff: noqa: F811

import copy
import os
from decimal import Decimal
from itertools import product

import pytest
from fastapi.testclient import TestClient

from app.api.decision_views import DecisionReview, ReviewInput
from app.api.workspace import session_for
from app.core.config import Settings
from app.db.registry import LocalRelease, ScenarioSnapshot
from app.main import create_app
from app.optimization.allocation import AllocationCase, RegionOption, evaluate_allocation
from app.optimization.coverage import solve_coverage
from app.services.decision_review import changed_parameters, review_snapshot, stability
from app.services.workspace import calculate_scenario
from tests.test_workspace import params, payload  # noqa: F401


@pytest.mark.parametrize("budget", range(0, 16))
def test_coverage_matches_independent_lexicographic_enumeration(budget):
    case = AllocationCase(
        budget,
        100,
        (
            RegionOption("A", 2, 4, 95),
            RegionOption("B", 5, 2, 25, 1),
            RegionOption("C", 3, 2, 10),
            RegionOption("D", 1, 0, 100),
        ),
    )
    expected = []
    for quantities in product(range(5), range(3), range(3), range(1)):
        if sum(q * row.cost_idr for q, row in zip(quantities, case.regions, strict=True)) <= budget:
            expected.append(
                (
                    sum(q > 0 for q in quantities),
                    sum(
                        q * row.priority_units
                        for q, row in zip(quantities, case.regions, strict=True)
                    ),
                )
            )
    result = solve_coverage(case)
    assert result.coverage_status == result.allocation.status == "optimal"
    assert (result.receiving_regions, result.allocation.evaluation.objective_units) == max(expected)
    assert (
        evaluate_allocation(case, result.allocation.allocations, allow_zero=True)
        == result.allocation.evaluation
    )


def test_coverage_timeout_and_execution_failure(monkeypatch):
    from ortools.sat.python import cp_model

    case = AllocationCase(10, 100, (RegionOption("A", 2, 10, 80),))
    assert solve_coverage(case, max_time_seconds=0).allocation.status == "no_solution"
    monkeypatch.setattr(
        cp_model.CpSolver,
        "solve",
        lambda *args: (_ for _ in ()).throw(RuntimeError("private error")),
    )
    assert solve_coverage(case).allocation.status == "execution_error"


def test_coverage_can_trade_need_for_more_receiving_regions():
    case = AllocationCase(
        5,
        100,
        (
            RegionOption("A", 1, 5, 100),
            RegionOption("B", 4, 1, 10),
        ),
    )
    result = solve_coverage(case)
    assert result.receiving_regions == 2
    assert result.allocation.allocations == {"A": 1, "B": 1}
    assert result.allocation.evaluation.objective_units == 110


def test_coverage_can_select_subset_when_minimum_packages_exceed_budget():
    case = AllocationCase(
        2,
        100,
        (
            RegionOption("A", 2, 4, 100, 1),
            RegionOption("B", 2, 4, 90, 1),
        ),
    )
    result = solve_coverage(case)
    assert result.coverage_status == result.allocation.status == "optimal"
    assert result.receiving_regions == 1
    assert sum(value > 0 for value in result.allocation.allocations.values()) == 1


def test_coverage_keeps_valid_first_stage_when_need_search_times_out(monkeypatch):
    from ortools.sat.python import cp_model

    original_solve = cp_model.CpSolver.solve
    calls = 0

    def stop_second(self, model):
        nonlocal calls
        calls += 1
        return original_solve(self, model) if calls == 1 else cp_model.UNKNOWN

    monkeypatch.setattr(cp_model.CpSolver, "solve", stop_second)
    case = AllocationCase(5, 100, (RegionOption("A", 1, 5, 100), RegionOption("B", 4, 1, 10)))
    result = solve_coverage(case)
    assert result.coverage_status == "optimal"
    assert result.allocation.status == "feasible"
    assert result.receiving_regions == 2
    assert result.allocation.best_bound_units is None
    assert evaluate_allocation(case, result.allocation.allocations) == result.allocation.evaluation


def test_changed_parameters_normalizes_and_scales_overrides(payload):
    base = params(payload, overrides={"11": {"cost_idr": 3, "capacity": 2}})
    candidate = changed_parameters(
        base,
        ReviewInput(budget_change_percent=10, cost_change_percent=25, weight_change_percent=10),
    )
    assert candidate.budget_idr == 33
    assert candidate.cost_idr == 13
    assert candidate.overrides["11"].cost_idr == 4
    assert sum(candidate.weights.values()) == 1
    assert candidate.weights["sanitation_percent"] > Decimal("0.25")
    assert base.cost_idr == 10
    weights = dict.fromkeys(base.weights, Decimal(0))
    weights["water_percent"] = Decimal(1)
    single = base.model_copy(update={"weights": weights})
    assert changed_parameters(single, ReviewInput(weight_change_percent=10)).weights == weights


def test_review_uses_saved_data_and_does_not_mutate_snapshot(payload):
    snapshot = calculate_scenario(payload, params(payload))
    snapshot["id"] = "11111111-1111-4111-8111-111111111111"
    before = copy.deepcopy(snapshot)
    result = review_snapshot(snapshot, params(payload), ReviewInput(budget_change_percent=-25))
    DecisionReview.model_validate(result)
    assert result["what_if"]["budget_idr"] == 23
    assert result["what_if"]["summary"]["total_packages"] == 2
    assert len(result["sensitivity"]) == 12
    assert result["coverage"]["case"] == snapshot["case"]
    assert result["coverage_status"] == "optimal"
    assert result["stability"][0]["evaluated_trials"] == 12
    assert result["stability"][2]["evaluated_trials"] == 0
    assert snapshot == before


def test_stability_excludes_failed_trials(payload):
    snapshot = calculate_scenario(payload, params(payload))
    failed = {
        "priority": snapshot["priority"],
        "allocation": {"status": "no_solution", "evaluation": None},
    }
    assert stability(snapshot, [failed])[0]["evaluated_trials"] == 0
    snapshot["priority"]["method_version"] = "old-method"
    with pytest.raises(ValueError, match="tidak kompatibel"):
        review_snapshot(snapshot, params(payload), ReviewInput())


def test_tiny_positive_weights_do_not_silently_become_inactive(payload):
    base = params(payload)
    weights = dict.fromkeys(base.weights, Decimal(0))
    weights["water_percent"] = Decimal("0.9999999999999")
    weights["sanitation_percent"] = Decimal("0.0000000000001")
    base = base.model_copy(update={"weights": weights})
    changed = changed_parameters(base, ReviewInput(weight_change_percent=-10))
    assert changed.weights["sanitation_percent"] > 0
    result = calculate_scenario(payload, changed)
    assert "14" in result["priority"]["excluded"]


def test_automatic_input_limit_is_reported_without_losing_other_trials(payload):
    parameters = params(payload).model_copy(update={"budget_idr": 10**13})
    snapshot = {**calculate_scenario(payload, parameters), "id": "synthetic"}
    result = review_snapshot(snapshot, parameters, ReviewInput(budget_change_percent=0))
    DecisionReview.model_validate(result)
    assert result["sensitivity"][1]["allocation"]["status"] == "invalid_input"
    assert result["sensitivity"][1]["summary"]["total_packages"] is None
    assert result["sensitivity"][0]["allocation"]["evaluation"] is not None


def test_review_route_contract_and_saved_snapshot_unchanged(payload, monkeypatch):
    from app.api import workspace

    snapshot = calculate_scenario(payload, params(payload))
    snapshot["id"] = "11111111-1111-4111-8111-111111111111"
    before = copy.deepcopy(snapshot)
    monkeypatch.setattr(workspace, "get_snapshot", lambda *args: snapshot)
    app = create_app(Settings(_env_file=None))
    app.dependency_overrides[session_for] = lambda: None
    with TestClient(app) as client:
        path = "/api/v1/scenarios/" + snapshot["id"] + "/review"
        response = client.post(path, json={"budget_change_percent": 10})
        assert response.status_code == 200, response.text
        assert response.json()["snapshot_id"] == snapshot["id"]
        assert len(response.json()["sensitivity"]) == 12
        for body in (
            {"budget_change_percent": 26},
            {"cost_change_percent": True},
            {"weight_indicator": "unknown"},
            {"extra": 1},
        ):
            assert client.post(path, json=body).status_code == 422
    assert snapshot == before


@pytest.mark.skipif(not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL is not set")
def test_review_from_postgres_remains_bound_to_original_release(payload, session):
    session.add(LocalRelease(id=payload["id"], payload=payload))
    session.flush()
    app = create_app(Settings(_env_file=None))
    app.dependency_overrides[session_for] = lambda: session
    with TestClient(app) as client:
        saved = client.post(
            "/api/v1/scenarios", json=params(payload).model_dump(mode="json")
        ).json()
        original_id = saved["release_id"]
        newer = {**payload, "id": "newer-synthetic-release", "sources": []}
        session.add(LocalRelease(id=newer["id"], payload=newer))
        session.flush()
        path = "/api/v1/scenarios/" + saved["id"]
        count_before = len(session.query(ScenarioSnapshot).all())
        reviewed = client.post(path + "/review", json={"budget_change_percent": 10})
        assert reviewed.status_code == 200, reviewed.text
        assert reviewed.json()["release_id"] == original_id
        assert client.get(path).json() == saved
        assert len(session.query(ScenarioSnapshot).all()) == count_before
        assert (
            client.post(
                "/api/v1/scenarios/00000000-0000-4000-8000-000000000000/review", json={}
            ).status_code
            == 404
        )
