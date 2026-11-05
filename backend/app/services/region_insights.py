"""Deterministic, evidence-linked benchmarks for a single region profile."""

from decimal import Decimal, InvalidOperation
from statistics import median


def _access_value(row: dict, source_id: str) -> tuple[Decimal | None, str | None]:
    raw = row["values"].get(source_id)
    denominator = row["values"].get("institutions_count")
    if raw is None or str(raw).strip() == "":
        return None, "missing"
    try:
        value = Decimal(str(raw))
        schools = Decimal(str(denominator)) if denominator not in (None, "") else None
    except InvalidOperation:
        return None, "invalid"
    if schools is not None and schools <= 0:
        return None, "no_schools"
    if value < 0 or value > 100:
        return None, "invalid"
    return value, None


def _decimal_text(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return format(value.normalize(), "f")


def build_region_insights(payload: dict, education_level: str, region_code: str) -> dict:
    """Build comparable percent benchmarks without producing policy claims."""

    rows = payload["scopes"][education_level]
    target = next((row for row in rows if row["code"] == region_code), None)
    if target is None:
        raise ValueError("Wilayah tidak ditemukan")

    percent_sources = [source for source in payload["sources"] if source["unit"] == "percent"]
    benchmarks = []
    deltas: list[tuple[int, str, Decimal]] = []

    for source_index, source in enumerate(percent_sources):
        source_id = source["source_id"]
        values = []
        for row in rows:
            value, _ = _access_value(row, source_id)
            if value is not None:
                values.append((row["code"], value))

        target_value, unavailable_reason = _access_value(target, source_id)
        benchmark_median = median([value for _, value in values]) if values else None
        delta = (
            target_value - benchmark_median
            if target_value is not None and benchmark_median is not None
            else None
        )
        rank = (
            1 + sum(value > target_value for _, value in values)
            if target_value is not None
            else None
        )
        comparison = (
            "unavailable"
            if delta is None
            else "below"
            if delta < 0
            else "above"
            if delta > 0
            else "equal"
        )
        benchmarks.append(
            {
                "source_id": source_id,
                "value": _decimal_text(target_value),
                "median": _decimal_text(benchmark_median),
                "delta_from_median": _decimal_text(delta),
                "rank": rank,
                "available_regions": len(values),
                "comparison": comparison,
                "unavailable_reason": unavailable_reason,
            }
        )
        if delta is not None and len(values) > 1:
            deltas.append((source_index, source_id, delta))

    attention = min(
        (item for item in deltas if item[2] < 0),
        key=lambda item: (item[2], item[0]),
        default=None,
    )
    strength = max(
        (item for item in deltas if item[2] > 0),
        key=lambda item: (item[2], -item[0]),
        default=None,
    )
    return {
        "release_id": payload["id"],
        "status": payload["status"],
        "academic_year": payload["academic_year"],
        "education_level": education_level,
        "ownership": payload["ownership"],
        "region": {"code": target["code"], "name": target["name"]},
        "available_indicators": sum(item["value"] is not None for item in benchmarks),
        "total_indicators": len(benchmarks),
        "attention_source_id": attention[1] if attention else None,
        "strength_source_id": strength[1] if strength else None,
        "benchmarks": benchmarks,
        "limitations": payload["limitations"],
    }
