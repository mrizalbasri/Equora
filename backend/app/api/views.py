"""Public JSON contracts for the locally reviewed education workspace."""

from typing import Literal

from pydantic import BaseModel

from app.etl.education import SourceMetadata


class QualityCount(BaseModel):
    missing: int
    numeric: int


class SourceView(SourceMetadata):
    definition: str
    storage_scale: str
    quality: dict[str, QualityCount]


class DatasetView(SourceView):
    release_id: str
    status: str
    limitations: list[str]


class CatalogView(BaseModel):
    release_id: str
    status: str
    items: list[SourceView]


class WorkspaceView(BaseModel):
    id: str
    status: str
    academic_year: str
    year: int
    ownership: str
    adapter_version: str
    region_namespace: str
    sources: list[SourceView]
    limitations: list[str]
    education_levels: list[str]
    region_count: int
    core_indicators: list[str]


class ObservationView(BaseModel):
    code: str
    name: str
    value: str | None
    source_value: str | None
    denominator: str | None
    source_cell: str
    status: str


class ObservationsView(BaseModel):
    release_id: str
    status: str
    year: int
    academic_year: str
    education_level: str
    ownership: str
    source: SourceView
    rows: list[ObservationView]
    limitations: list[str]


class ProvinceView(BaseModel):
    code: str
    name: str
    values: dict[str, str | None]
    cells: dict[str, str]


class RegionProfileView(ProvinceView):
    release_id: str
    status: str
    academic_year: str
    ownership: str
    education_level: str
    sources: list[SourceView]
    limitations: list[str]


class RegionReferenceView(BaseModel):
    code: str
    name: str


class RegionBenchmarkView(BaseModel):
    source_id: str
    value: str | None
    median: str | None
    delta_from_median: str | None
    rank: int | None
    available_regions: int
    comparison: Literal["below", "equal", "above", "unavailable"]
    unavailable_reason: str | None


class RegionInsightsView(BaseModel):
    release_id: str
    status: str
    academic_year: str
    education_level: str
    ownership: str
    region: RegionReferenceView
    available_indicators: int
    total_indicators: int
    attention_source_id: str | None
    strength_source_id: str | None
    benchmarks: list[RegionBenchmarkView]
    limitations: list[str]


class RegionMapIndicatorView(BaseModel):
    source_id: str
    title: str
    unit: Literal["percent", "school_count"]
    definition: str


class RegionMapRowView(BaseModel):
    code: str
    name: str
    value: str | None
    comparison: Literal["below", "equal", "above", "unavailable"]
    delta_from_median: str | None
    rank: int | None
    available_indicators: int
    total_indicators: int
    completeness_ratio: str | None
    attention_source_id: str | None
    unavailable_reason: str | None


class RegionMapInsightsView(BaseModel):
    release_id: str
    status: str
    academic_year: str
    education_level: str
    ownership: str
    indicator: RegionMapIndicatorView
    median: str | None
    available_regions: int
    total_regions: int
    rows: list[RegionMapRowView]
    limitations: list[str]


class SavedScenarioView(BaseModel):
    id: str
    name: str
    created_at: str
    status: str
    release_id: str
    education_level: str = "SD"
