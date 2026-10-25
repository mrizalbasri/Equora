"""Integer-package allocation sandbox with explicit demo assumptions, not policy advice."""

import math
from collections.abc import Mapping
from dataclasses import dataclass
from fractions import Fraction

import ortools
from ortools.sat.python import cp_model

MODEL_VERSION = "single-intervention-demo-v1"
MAX_EXACT_INTEGER = 2**53 - 1


@dataclass(frozen=True)
class RegionOption:
    region_code: str
    cost_idr: int
    capacity: int
    priority_units: int
    minimum_packages: int = 0


@dataclass(frozen=True)
class AllocationCase:
    budget_idr: int
    priority_scale: int
    regions: tuple[RegionOption, ...]
    cost_source_type: str = "demo_assumption"


@dataclass(frozen=True)
class Evaluation:
    budget_used_idr: int
    budget_remaining_idr: int
    objective_units: int


@dataclass(frozen=True)
class AllocationResult:
    status: str
    allocations: Mapping[str, int] | None = None
    evaluation: Evaluation | None = None
    best_bound_units: float | None = None
    absolute_gap_units: float | None = None
    reason: str | None = None
    model_version: str = MODEL_VERSION
    solver_version: str | None = None
    max_time_seconds: float | None = None
    workers: int | None = None
    seed: int | None = None


def _integer(value, minimum, name):
    if type(value) is not int or not minimum <= value <= MAX_EXACT_INTEGER:
        raise ValueError(f"{name} must be an integer in [{minimum}, {MAX_EXACT_INTEGER}]")


def validate_case(case: AllocationCase):
    _integer(case.budget_idr, 0, "budget_idr")
    _integer(case.priority_scale, 1, "priority_scale")
    if case.cost_source_type != "demo_assumption":
        raise ValueError("This sandbox supports labeled demo assumptions only")
    codes = [region.region_code for region in case.regions]
    if not codes or len(set(codes)) != len(codes):
        raise ValueError("At least one unique region option is required")
    for region in case.regions:
        if not isinstance(region.region_code, str) or not region.region_code.strip():
            raise ValueError("Region codes must be nonempty strings")
        for name, minimum in (
            ("cost_idr", 1),
            ("capacity", 0),
            ("priority_units", 0),
            ("minimum_packages", 0),
        ):
            _integer(getattr(region, name), minimum, f"{region.region_code}/{name}")
        if region.minimum_packages > region.capacity:
            raise ValueError("minimum_packages cannot exceed capacity")
        if region.priority_units > case.priority_scale:
            raise ValueError("priority_units cannot exceed the declared scale")
    for name in ("cost_idr", "priority_units"):
        if (
            sum(getattr(region, name) * region.capacity for region in case.regions)
            > MAX_EXACT_INTEGER
        ):
            raise ValueError(f"Total {name} exceeds exact integer reporting range")


def evaluate_allocation(
    case: AllocationCase, allocations: Mapping[str, int], *, allow_zero: bool = False
) -> Evaluation:
    """Check returned quantities directly, independently of any solver model or status."""
    validate_case(case)
    if set(allocations) != {region.region_code for region in case.regions}:
        raise ValueError("Allocation region keys must match the case exactly")
    cost = objective = 0
    for region in case.regions:
        quantity = allocations[region.region_code]
        _integer(quantity, 0, "quantity")
        minimum = 0 if allow_zero else region.minimum_packages
        if not minimum <= quantity <= region.capacity:
            raise ValueError("Allocation violates minimum or capacity")
        cost += quantity * region.cost_idr
        objective += quantity * region.priority_units
    if cost > case.budget_idr:
        raise ValueError("Allocation exceeds budget")
    return Evaluation(cost, case.budget_idr - cost, objective)


def solve_allocation(case: AllocationCase, *, max_time_seconds: float = 5.0) -> AllocationResult:
    validate_case(case)
    if (
        isinstance(max_time_seconds, bool)
        or not math.isfinite(max_time_seconds)
        or max_time_seconds < 0
    ):
        raise ValueError("Time limit must be finite and nonnegative")
    model = cp_model.CpModel()
    regions = sorted(case.regions, key=lambda region: region.region_code)
    variables = {
        region.region_code: model.new_int_var(
            region.minimum_packages, region.capacity, region.region_code
        )
        for region in regions
    }
    model.add(
        sum(region.cost_idr * variables[region.region_code] for region in regions)
        <= case.budget_idr
    )
    model.maximize(sum(region.priority_units * variables[region.region_code] for region in regions))
    metadata = {
        "solver_version": ortools.__version__,
        "max_time_seconds": max_time_seconds,
        "workers": 1,
        "seed": 0,
    }
    if model.validate():
        return AllocationResult(
            "invalid_model", reason="Solver model validation failed", **metadata
        )
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = max_time_seconds
    solver.parameters.num_search_workers = 1
    solver.parameters.random_seed = 0
    try:
        status = solver.solve(model)
        if status == cp_model.INFEASIBLE:
            return AllocationResult(
                "infeasible",
                reason="Budget and minimum constraints cannot be satisfied",
                **metadata,
            )
        if status == cp_model.MODEL_INVALID:
            return AllocationResult("invalid_model", reason="Solver rejected the model", **metadata)
        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return AllocationResult(
                "no_solution",
                reason="Search stopped without a solution; infeasibility is not proven",
                **metadata,
            )
        allocations = {code: solver.value(variable) for code, variable in variables.items()}
        try:
            evaluation = evaluate_allocation(case, allocations)
        except ValueError:
            return AllocationResult(
                "invalid_result", reason="Independent allocation validation failed", **metadata
            )
        bound = solver.best_objective_bound
        return AllocationResult(
            "optimal" if status == cp_model.OPTIMAL else "feasible",
            allocations,
            evaluation,
            bound,
            max(0.0, bound - evaluation.objective_units),
            **metadata,
        )
    except Exception:
        return AllocationResult("execution_error", reason="Solver execution failed", **metadata)


def baseline_allocation(case: AllocationCase, *, strategy: str) -> AllocationResult:
    """Budget/capacity/minimum-equivalent equal-round and greedy-need comparators."""
    validate_case(case)
    if strategy not in ("equal", "greedy"):
        raise ValueError("Unknown baseline strategy")
    regions = sorted(case.regions, key=lambda region: region.region_code)
    allocations = {region.region_code: region.minimum_packages for region in regions}
    remaining = case.budget_idr - sum(
        region.cost_idr * region.minimum_packages for region in regions
    )
    if remaining < 0:
        return AllocationResult("infeasible", reason="Minimum packages exceed budget")
    if strategy == "greedy":
        # Benefit per cost uses exact fractions; ties use priority then region code.
        for region in sorted(
            regions,
            key=lambda row: (
                -Fraction(row.priority_units, row.cost_idr),
                -row.priority_units,
                row.region_code,
            ),
        ):
            quantity = min(
                region.capacity - allocations[region.region_code], remaining // region.cost_idr
            )
            allocations[region.region_code] += quantity
            remaining -= quantity * region.cost_idr
    else:
        while eligible := [
            region
            for region in regions
            if allocations[region.region_code] < region.capacity and region.cost_idr <= remaining
        ]:
            rounds = min(
                min(region.capacity - allocations[region.region_code] for region in eligible),
                remaining // sum(region.cost_idr for region in eligible),
            )
            for region in eligible:
                quantity = rounds if rounds else int(region.cost_idr <= remaining)
                allocations[region.region_code] += quantity
                remaining -= quantity * region.cost_idr
    return AllocationResult("feasible", allocations, evaluate_allocation(case, allocations))
