"""Deterministic, evidence-linked benchmarks for region profiles and maps."""

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


def _benchmark_scope(payload: dict, education_level: str) -> tuple[list[dict], dict[str, dict]]:
    rows = payload["scopes"][education_level]
    percent_sources = [source for source in payload["sources"] if source["unit"] == "percent"]
    scope: dict[str, dict] = {}
    for source in percent_sources:
        source_id = source["source_id"]
        values: dict[str, Decimal] = {}
        reasons: dict[str, str | None] = {}
        for row in rows:
            value, reason = _access_value(row, source_id)
            reasons[row["code"]] = reason
            if value is not None:
                values[row["code"]] = value
        ordered = list(values.values())
        scope[source_id] = {
            "values": values,
            "reasons": reasons,
            "median": median(ordered) if ordered else None,
            "ranks": {
                code: 1 + sum(other > value for other in ordered) for code, value in values.items()
            },
        }
    return percent_sources, scope


def _region_summary(
    target: dict, percent_sources: list[dict], scope: dict[str, dict]
) -> tuple[list[dict], str | None, str | None]:
    benchmarks = []
    deltas: list[tuple[int, str, Decimal]] = []
    code = target["code"]
    for source_index, source in enumerate(percent_sources):
        source_id = source["source_id"]
        stats = scope[source_id]
        target_value = stats["values"].get(code)
        benchmark_median = stats["median"]
        delta = (
            target_value - benchmark_median
            if target_value is not None and benchmark_median is not None
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
                "rank": stats["ranks"].get(code),
                "available_regions": len(stats["values"]),
                "comparison": comparison,
                "unavailable_reason": stats["reasons"].get(code),
            }
        )
        if delta is not None and len(stats["values"]) > 1:
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
    return (
        benchmarks,
        attention[1] if attention else None,
        strength[1] if strength else None,
    )


def build_region_insights(payload: dict, education_level: str, region_code: str) -> dict:
    """Build comparable percent benchmarks without producing policy claims."""

    rows = payload["scopes"][education_level]
    target = next((row for row in rows if row["code"] == region_code), None)
    if target is None:
        raise ValueError("Wilayah tidak ditemukan")

    percent_sources, scope = _benchmark_scope(payload, education_level)
    benchmarks, attention_source_id, strength_source_id = _region_summary(
        target, percent_sources, scope
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
        "attention_source_id": attention_source_id,
        "strength_source_id": strength_source_id,
        "benchmarks": benchmarks,
        "limitations": payload["limitations"],
    }


def _non_percent_value(row: dict, source_id: str) -> tuple[Decimal | None, str | None]:
    raw = row["values"].get(source_id)
    if raw is None or str(raw).strip() == "":
        return None, "missing"
    try:
        value = Decimal(str(raw))
    except InvalidOperation:
        return None, "invalid"
    if value < 0:
        return None, "invalid"
    return value, None


def build_region_map_insights(payload: dict, education_level: str, indicator: str) -> dict:
    """Build one batch of map-ready evidence without per-region API calls."""

    source = next((item for item in payload["sources"] if item["source_id"] == indicator), None)
    if source is None:
        raise ValueError("Indikator tidak tersedia")

    rows = payload["scopes"][education_level]
    percent_sources, scope = _benchmark_scope(payload, education_level)
    selected_stats = scope.get(indicator)
    result_rows = []
    available_selected = 0
    for target in rows:
        benchmarks, attention_source_id, _ = _region_summary(target, percent_sources, scope)
        available_indicators = sum(item["value"] is not None for item in benchmarks)
        total_indicators = len(benchmarks)
        completeness = (
            Decimal(available_indicators) / Decimal(total_indicators) if total_indicators else None
        )
        if selected_stats is not None:
            selected = next(item for item in benchmarks if item["source_id"] == indicator)
            if selected["value"] is not None:
                available_selected += 1
            value = selected["value"]
            comparison = selected["comparison"]
            delta = selected["delta_from_median"]
            rank = selected["rank"]
            unavailable_reason = selected["unavailable_reason"]
        else:
            raw_value, _ = _non_percent_value(target, indicator)
            if raw_value is not None:
                available_selected += 1
            value = _decimal_text(raw_value)
            comparison = "unavailable"
            delta = None
            rank = None
            unavailable_reason = "unsupported_unit"
        result_rows.append(
            {
                "code": target["code"],
                "name": target["name"],
                "value": value,
                "comparison": comparison,
                "delta_from_median": delta,
                "rank": rank,
                "available_indicators": available_indicators,
                "total_indicators": total_indicators,
                "completeness_ratio": _decimal_text(completeness),
                "attention_source_id": attention_source_id,
                "unavailable_reason": unavailable_reason,
            }
        )

    return {
        "release_id": payload["id"],
        "status": payload["status"],
        "academic_year": payload["academic_year"],
        "education_level": education_level,
        "ownership": payload["ownership"],
        "indicator": {
            "source_id": source["source_id"],
            "title": source["title"],
            "unit": source["unit"],
            "definition": source["definition"],
        },
        "median": _decimal_text(selected_stats["median"]) if selected_stats else None,
        "available_regions": available_selected,
        "total_regions": len(rows),
        "rows": result_rows,
        "limitations": payload["limitations"],
    }
