"""Weighted normalized-needs calculations, currently validated with synthetic cases only."""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from decimal import Decimal, localcontext

METHOD_VERSION = "weighted-normalized-needs-v1"
ZERO = Decimal(0)
ONE = Decimal(1)


@dataclass(frozen=True)
class RegionNeeds:
    region_code: str
    needs: Mapping[str, Decimal | None]


@dataclass(frozen=True)
class RankedRegion:
    region_code: str
    rank: int
    score: Decimal
    contributions: Mapping[str, Decimal]


@dataclass(frozen=True)
class PriorityResult:
    method_version: str
    missing_policy: str
    input_regions: int
    ranked: tuple[RankedRegion, ...]
    excluded: Mapping[str, tuple[str, ...]]
    weights: Mapping[str, Decimal]


def _unit_decimal(value: Decimal, name: str) -> Decimal:
    if not isinstance(value, Decimal) or not value.is_finite() or not ZERO <= value <= ONE:
        raise ValueError(f"{name} must be a finite Decimal in [0, 1]")
    return value


def access_percentage_to_need(access: Decimal | None) -> Decimal | None:
    """Complement a compatible access percentage; counts require a denominator upstream."""
    if access is None:
        return None
    if not isinstance(access, Decimal) or not access.is_finite() or not 0 <= access <= 100:
        raise ValueError("access must be a finite Decimal percentage in [0, 100]")
    with localcontext() as context:
        context.prec = 50
        return ONE - access / Decimal(100)


def rank_needs(
    regions: Sequence[RegionNeeds],
    weights: Mapping[str, Decimal],
    *,
    missing_policy: str = "exclude",
) -> PriorityResult:
    """Rank comparable, already normalized needs; higher scores mean greater need."""
    if missing_policy != "exclude":
        raise ValueError("Only explicit exclude missing policy is supported")
    if not weights or any(not isinstance(key, str) or not key.strip() for key in weights):
        raise ValueError("At least one named indicator is required")
    ordered_weights = {key: _unit_decimal(weights[key], f"weight {key}") for key in sorted(weights)}
    codes = [region.region_code for region in regions]
    if any(not isinstance(code, str) or not code.strip() for code in codes):
        raise ValueError("Region codes must be nonempty strings")
    if len(set(codes)) != len(codes):
        raise ValueError("Duplicate region codes are not allowed")
    with localcontext() as context:
        context.prec = 50
        if sum(ordered_weights.values(), ZERO) != ONE:
            raise ValueError("Nonnegative indicator weights must total exactly 1")
        active = [key for key, weight in ordered_weights.items() if weight > ZERO]
        scored = []
        excluded = {}
        for region in regions:
            if set(region.needs) - set(ordered_weights):
                raise ValueError(f"{region.region_code}: unknown indicators")
            for key, value in region.needs.items():
                if value is not None:
                    _unit_decimal(value, f"{region.region_code}/{key}")
            missing = tuple(key for key in active if region.needs.get(key) is None)
            if missing:
                excluded[region.region_code] = missing
                continue
            contributions = {key: ordered_weights[key] * region.needs[key] for key in active}
            scored.append((region.region_code, sum(contributions.values(), ZERO), contributions))
        scored.sort(key=lambda item: (-item[1], item[0]))
        ranked = tuple(
            RankedRegion(code, index, score, contributions)
            for index, (code, score, contributions) in enumerate(scored, 1)
        )
    return PriorityResult(
        METHOD_VERSION,
        missing_policy,
        len(regions),
        ranked,
        dict(sorted(excluded.items())),
        dict(ordered_weights),
    )
