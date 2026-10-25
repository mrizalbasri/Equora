"""Lexicographic region coverage, followed by need within proven maximum coverage."""

import math
from dataclasses import dataclass

import ortools
from ortools.sat.python import cp_model

from app.optimization.allocation import (
    AllocationCase,
    AllocationResult,
    evaluate_allocation,
    validate_case,
)


@dataclass(frozen=True)
class CoverageResult:
    allocation: AllocationResult
    coverage_status: str
    receiving_regions: int | None = None


def solve_coverage(case: AllocationCase, *, max_time_seconds: float = 1.0) -> CoverageResult:
    validate_case(case)
    if isinstance(max_time_seconds, bool) or not math.isfinite(max_time_seconds):
        raise ValueError("Time limit must be finite and nonnegative")
    if max_time_seconds < 0:
        raise ValueError("Time limit must be finite and nonnegative")
    model = cp_model.CpModel()
    regions = sorted(case.regions, key=lambda row: row.region_code)
    quantities, receiving = {}, {}
    for row in regions:
        quantity = model.new_int_var(0, row.capacity, row.region_code)
        present = model.new_bool_var("receiving_" + row.region_code)
        model.add(quantity >= max(1, row.minimum_packages)).only_enforce_if(present)
        model.add(quantity == 0).only_enforce_if(present.Not())
        quantities[row.region_code], receiving[row.region_code] = quantity, present
    model.add(sum(row.cost_idr * quantities[row.region_code] for row in regions) <= case.budget_idr)
    coverage = sum(receiving.values())
    model.maximize(coverage)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = max_time_seconds / 2
    solver.parameters.num_search_workers = 1
    solver.parameters.random_seed = 0
    metadata = {
        "solver_version": ortools.__version__,
        "max_time_seconds": max_time_seconds,
        "workers": 1,
        "seed": 0,
    }
    if model.validate():
        return CoverageResult(
            AllocationResult("invalid_model", reason="Model jangkauan tidak valid", **metadata),
            "invalid_model",
        )
    try:
        status = solver.solve(model)
        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            label = (
                "infeasible"
                if status == cp_model.INFEASIBLE
                else "invalid_model"
                if status == cp_model.MODEL_INVALID
                else "no_solution"
            )
            return CoverageResult(
                AllocationResult(
                    label, reason="Belum ada alokasi jangkauan tervalidasi", **metadata
                ),
                label,
            )
        allocations = {code: solver.value(variable) for code, variable in quantities.items()}
        count = sum(value > 0 for value in allocations.values())
        coverage_status = "optimal" if status == cp_model.OPTIMAL else "feasible"
        bound = gap = None
        final_status = "feasible"
        if status == cp_model.OPTIMAL:
            model.add(coverage == count)
            model.maximize(sum(row.priority_units * quantities[row.region_code] for row in regions))
            status = solver.solve(model)
            if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
                allocations = {
                    code: solver.value(variable) for code, variable in quantities.items()
                }
                final_status = "optimal" if status == cp_model.OPTIMAL else "feasible"
                bound = solver.best_objective_bound
        evaluation = evaluate_allocation(case, allocations, allow_zero=True)
        if sum(value > 0 for value in allocations.values()) != count:
            raise ValueError("Independent coverage validation failed")
        if bound is not None:
            gap = max(0.0, bound - evaluation.objective_units)
        return CoverageResult(
            AllocationResult(final_status, allocations, evaluation, bound, gap, **metadata),
            coverage_status,
            count,
        )
    except ValueError:
        return CoverageResult(
            AllocationResult("invalid_result", reason="Validasi jangkauan gagal", **metadata),
            "invalid_result",
        )
    except Exception:
        return CoverageResult(
            AllocationResult("execution_error", reason="Solver jangkauan gagal", **metadata),
            "execution_error",
        )
