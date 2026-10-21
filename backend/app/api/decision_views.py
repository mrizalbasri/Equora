"""Typed contracts for bounded, non-persistent reviews of a saved scenario."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.analysis.priority import PriorityResult
from app.optimization.allocation import AllocationCase, AllocationResult


class ReviewInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    budget_change_percent: int = Field(default=10, strict=True, ge=-25, le=25)
    cost_change_percent: int = Field(default=0, strict=True, ge=-25, le=25)
    weight_indicator: str = "sanitation_percent"
    weight_change_percent: int = Field(default=0, strict=True, ge=-25, le=25)


class ReviewSummary(BaseModel):
    eligible_regions: int
    excluded_regions: int
    receiving_regions: int | None
    total_packages: int | None
    budget_used_idr: int | None
    budget_remaining_idr: int | None
    objective_units: int | None


class RegionChange(BaseModel):
    region_code: str
    before_packages: int | None
    after_packages: int | None
    delta: int | None
    before_rank: int | None
    after_rank: int | None


class ReviewTrial(BaseModel):
    label: str
    changes: list[RegionChange]
    perturbation: ReviewInput | None = None
    budget_idr: int
    weights: dict[str, Decimal]
    objective_comparable: bool
    priority: PriorityResult
    case: AllocationCase
    allocation: AllocationResult
    summary: ReviewSummary


class StabilityRow(BaseModel):
    region_code: str
    evaluated_trials: int
    same_packages_trials: int
    receiving_trials: int
    eligible_trials: int
    min_packages: int | None
    max_packages: int | None
    min_rank: int | None
    max_rank: int | None


class DecisionReview(BaseModel):
    snapshot_id: str
    release_id: str
    review_version: str
    computed_at: str
    changes: ReviewInput
    original: ReviewSummary
    what_if: ReviewTrial
    coverage: ReviewTrial
    coverage_status: str
    sensitivity: list[ReviewTrial]
    stability: list[StabilityRow]
    limitations: list[str]
