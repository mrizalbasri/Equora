# Staging the six additional workbooks

The design approved on 22 October 2026 follows the [PR #25 audit](additional-source-audit-2026-10-21.md): a separate adapter with explicit source, scale and layout contracts. Extending the original positional parser would weaken its four-source contract; using the audit script directly would bypass staging resource limits and draft-import reporting.

The original staging adapter, source IDs, metadata files, adapter version and default CLI behavior remain unchanged. The additional path supports exactly:

| Source ID | Stored unit/scale | Layout |
|---|---|---|
| `institutions_count` | Integer school counts | 12 education groups; 53 columns, including empty trailing columns |
| `electricity_count` | Integer school counts | Six groups; 21 columns; context only |
| `water_count` | Integer school counts | Six groups; 21 columns |
| `handwashing_count` | Integer school counts | Six groups; 21 columns; context only |
| `internet_percent` | Excel fraction with `0.00%` format | Six groups; multiply by 100 exactly once |
| `computers_percent` | Excel fraction with `0.00%` format | Six groups; multiply by 100 exactly once |

Four duplicate workbooks in the additional manifest are deliberately rejected by this adapter. Use their original source IDs and the original adapter. Water/sanitation percentage points remain unchanged, including valid values below 1%.

## Validation and reporting

The manifest and audit must agree on hash, filename, title, unit, storage scale, layout and 38-province coverage. The file is size-limited, read once per staging invocation, hash-verified before opening, and checked for ZIP expansion, required sheets, title/metadata/unit/period, dimensions and headers. Region codes remain in the publisher's unmapped namespace. Duplicate, malformed or incomplete province rows invalidate the requested slice.

Education and ownership headers determine columns explicitly: SD/Total is AA in the denominator, I in the six-group files. Unknown, duplicate or missing groups, changed ownership headers and data in the denominator's empty trailing columns require review. Fractions are never inferred from small values. Changed percentage formats, values outside 0–1, fractional counts and formulas in selected cells are errors. Missing values stay null; no count is reconstructed from a percentage or ownership total.

Only one of TK/SD/SMP/SMA/SMK/SLB and ownership Total is imported. `available_levels`, `unsupported_levels` and `unimported_ownership` describe coverage. `unimported_issues` records cell-level missing/invalid/formula findings outside the selected slice. The denominator's 38 KB/Total formulas remain visible there without invalidating a valid SD/Total slice. Requesting KB or another unsupported scope is rejected. Errors in the selected slice make the report `invalid`; missing selected values remain warnings.

Zero institution counts stay zero and receive a warning that ratios are unavailable; staging computes no ratios and substitutes no access percentage. Unknown download dates stay null with a warning. License state remains unverified. Electricity and handwashing receive context-only warnings and are not added to MCDA weights or indicators.

## Commands

From `backend/`, with the audited user files available locally:

```powershell
uv run python -m app.etl.stage_education --source-set additional --source-id institutions_count --file ../data/datamentah/jumlah-satuan-pendidikan-2025-indonesia.xlsx --education-level SD --output ../data/processed/staging/institutions-sd-review.json
uv run pytest tests/test_additional_staging.py tests/test_education_staging.py tests/test_registry_cli.py
```

Use `--source-set additional` with `app.etl.register_education` for an explicitly requested draft import into the dedicated `equora` database. No database import is needed to validate or review a staging artifact. Staging output remains exclusive-create and confined to ignored `data/processed/`. Exit codes retain their original meaning: 0 staged, 1 invalid report, 2 rejected metadata/file/output. The additional CLI summary also reports unsupported levels and unimported issue counts.

The local-review importer routes these six IDs through the same adapter and verifies their manifest against the audit before building a snapshot. It refuses invalid Total slices or incomplete province coverage. The draft registry preserves the new source scale/layout and scope reports in its existing metadata/summary JSON. Registration remains transactional and idempotent; it never overwrites previously recorded source metadata. A source version previously registered by the older local-review reader can produce a metadata conflict and needs a separately reviewed migration; retrying does not overwrite it.

No source files, original manifests, database schema, publication status, region crosswalk or engine formulas are changed. Raw observations and workbooks remain outside Git.

## Validation on 22 October 2026

- 40 new synthetic tests cover the six contracts, fractions/format changes, denominator mapping, unsupported headers/trailing data, selected and unimported formulas/missing values, incomplete provinces, CLI reports, local-review routing and registry serialization.
- Full backend suite: 180 passed, 19 skipped. PostgreSQL integration tests were not run without a configured disposable test database. Ruff lint and format checks passed for the ETL modules and new tests; local Markdown link checks and diff whitespace checks passed.
- All 60 real-file Total slices in the local-review snapshot matched the independent audit reader, including all 36 slices for the six additions. The six SD/Total slices each staged 38 provinces with no selected errors; the denominator retained its 38 KB formula findings outside the imported scope.
- All 24 original four-source/education-level staging reports were byte-identical to the baseline implementation's JSON. These read-only checks performed no database writes and did not change the raw workbooks.
