"""Public JSON contracts for the locally reviewed education workspace."""

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


class SavedScenarioView(BaseModel):
    id: str
    name: str
    created_at: str
    status: str
    release_id: str
