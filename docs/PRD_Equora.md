# Equora — Product Requirements Document (PRD)

**Versi:** 1.0 | **Status:** Engineering-ready draft, data schema provisional | **18 Oktober 2026**
**Referensi:** [BRD_Equora.md](./BRD_Equora.md)

## 1. Product statement
Equora membantu publik dan analis memahami kondisi akses fasilitas pendidikan dari open data, membandingkan kebutuhan wilayah, dan menguji skenario alokasi sumber daya yang dapat dijelaskan. **MVP bukan sistem resmi rekomendasi bantuan ataupun sistem prediksi realisasi dampak.**

## 2. User roles
- **Guest:** landing, explorer, sumber dan metodologi, contoh skenario read-only.
- **Analyst:** membuat, menyimpan, membandingkan, ekspor skenario (akun opsional untuk MVP; dapat gunakan local draft + link share ber-token).
- **Admin/Data steward:** unggah dataset, mapping kolom, validasi, publish/unpublish version, konfigurasi default biaya.

## 3. Sitemap
```text
/
├── /explore                         Regional Equity Explorer
│   └── /regions/[regionCode]        Detail wilayah, indikator, provenance
├── /datasets                        Katalog dataset + quality badges
│   └── /datasets/[datasetId]        Metadata, preview, quality report
├── /studio                          Scenario builder
│   ├── /scenarios/[id]              Hasil + explainability
│   └── /compare?left=&right=        Perbandingan skenario
├── /methodology                     Rumus, bobot, batasan, disclaimer
├── /about                           Project story + roadmap
└── /admin                           Admin-only: imports, mappings, releases
```

## 4. UX / identitas sementara
- Arah visual: **Soft Gray Enterprise / Coral**, mengikuti [DESIGN versi 1.1](./DESIGN_Equora.md), menggantikan Editorial Cobalt.
- Tokens baseline: `bg: #E7E8EA`, `surface: #F9F9FA`, `text: #24262B`, `primary: #C94025`. Dokumen DESIGN menjadi acuan lengkap.
- Landing page: hero satu kalimat manfaat, animasi ringan simulasi *before/after*, CTA `Explore public data` dan `Build a scenario`; 3-step workflow, methodology proof, featured dataset sources, disclaimer.
- Dashboard: sidebar ringkas, breadcrumbs, year/region selector, comparison mode, provenance per chart, small-screen table fallback.
- A11y: contrast >= WCAG AA untuk body, focus visible, semantic labels, mobile 360px+, color tidak jadi satu-satunya kode status.

## 5. Epics & acceptance criteria
### EP-01 Dataset registry & import — P0
**User story:** sebagai admin saya dapat mengimpor CSV/XLSX dengan metadata yang bisa ditelusuri.
- AC-01: form butuh `title`, `source_url`, `publisher`, `year/academic_year`, `region_level`, `education_level`, `unit`, `license_or_terms`, `retrieved_at`.
- AC-02: validasi tipe, duplikat natural key, null, rentang persen 0–100, jumlah >=0.
- AC-03: file asli tersimpan terpisah/immutable; hash SHA256 dicatat; versi publish dibekukan.
- AC-04: preview 20 baris dan error report downloadable; import invalid tidak langsung dipublish.

### EP-02 Harmonization & quality — P0
- AC-05: mapping source region labels ke `region_code` eksplisit, perubahan tercatat; tidak fuzzy join otomatis tanpa review.
- AC-06: natural key `(dataset_version_id, region_code, year, education_level, indicator_code)` unik.
- AC-07: indikator agregat berbeda jenjang dan periode tidak digabung tanpa warning; coverage join terlihat.
- AC-08: missing tetap null; rounding estimates bertanda `estimated` dan metode dicatat.

### EP-03 Explorer — P0
- AC-09: filter indikator/tahun/jenjang/wilayah memperbarui tabel dan grafik.
- AC-10: setiap nilai dapat membuka URL sumber dan informasi definisi/refresh.
- AC-11: peta ditampilkan hanya jika file boundary legal dan join region valid; selain itu gunakan sortable bar chart.
- AC-12: ekspor hasil filter dalam CSV lengkap metadata.

### EP-04 Priority engine — P0
**Method v1:** weighted multicriteria decision analysis (MCDA); score dihitung dari indikator kebutuhan yang sudah distandardisasi dan dirancang agar *nilai lebih tinggi = kebutuhan lebih tinggi*. Bobot nonnegative dan total 1.0.
- AC-13: user dapat ubah bobot dan langsung melihat rank serta kontribusi tiap indikator.
- AC-14: data kosong diproses sesuai kebijakan terpilih (`exclude` default; tidak auto dianggap nol).
- AC-15: tie-breaking deterministik (mis. region_code) dan hasil dapat direproduksi untuk versi data/bobot sama.
- AC-16: engine mengembalikan definisi indikator, formula normalization, cakupan, dan limitations.

### EP-05 Budget scenario simulator — P0
**Method v1:** multiple-choice knapsack / integer linear programming menggunakan OR-Tools pada *unit agregat wilayah*, **hanya setelah** cost per package dikonfigurasi.
- AC-17: input `total_budget_idr`, intervensi, `cost_per_package_idr`, capacity, fairness constraints yang dijelaskan.
- AC-18: output tidak melampaui anggaran; constraint wajib terpenuhi; jika infeasible tampil alasan, bukan fake recommendation.
- AC-19: outcome adalah `packages_allocated`, `budget_used`, `priority_coverage_proxy`—**bukan** sekolah pasti tertolong/angka dampak nyata bila data tidak mendukung.
- AC-20: semua biaya dan kapasitas berlabel `official_reference` atau `demo_assumption`.

### EP-06 Comparison & explanation — P0
- AC-21: simpan 2 scenario snapshot dengan dataset version, weights, costs, constraints, model version.
- AC-22: perbandingan menampilkan rank shifts, budget changes, fairness/coverage tradeoffs, kontribusi indikator.
- AC-23: ekspor PDF ringkasan berisi data sources, parameter, disclaimer, timestamp.

### EP-07 Account and admin — P1
- AC-24: admin authenticated; role guards berlaku di API dan UI; auditing setiap publish/edit.
- AC-25: rate limit upload dan scenario compute, file size/type guard, CSRF/CORS ditetapkan sesuai hosting.

### EP-08 Advanced ML/RAG — P2, conditional
- Forecasting hanya jika ada cukup tahun/label, temporal validation, baseline dan metrik yang dilaporkan.
- RAG hanya untuk Q&A dokumen metode/dataset metadata, selalu cite source dan abstain jika tidak ada jawaban.
- Tidak mengklaim SHAP atas optimasi deterministik; gunakan kontribusi bobot dan sensitivity analysis.

## 6. Core domain model
```text
regions(id, code, name, level, parent_code)
datasets(id, title, publisher, source_url, license_terms, description)
dataset_versions(id, dataset_id, version_label, year, academic_year, education_level,
  region_level, raw_file_path, sha256, downloaded_at, published_at, status)
indicators(id, code, name, unit, direction, definition, denominator_definition)
observations(id, dataset_version_id, region_code, indicator_code, year,
  education_level, value, numerator, denominator, estimated, raw_row_id)
quality_issues(id, dataset_version_id, row_no, issue_code, severity, message)
interventions(id, code, name, cost_idr, cost_source_type, cost_source_url, unit)
scenarios(id, name, data_release_id, budget_idr, method_version, created_at, params_json)
scenario_allocations(id, scenario_id, region_code, intervention_code, quantity,
  estimated_cost_idr, contribution_score)
audit_events(id, actor_id, action, entity_type, entity_id, detail_json, timestamp)
```
**Release ID** pins a compatible set of dataset versions; never compare a time-varying dataset silently.

## 7. Proposed API (FastAPI /api/v1)
| Method | Route | Function |
|---|---|---|
| GET | `/datasets` | Published dataset catalog |
| GET | `/datasets/{id}` | Metadata, provenance and version |
| GET | `/datasets/{id}/quality` | Missing/duplication/range report |
| POST | `/admin/datasets/import` | Upload staging CSV/XLSX, auth required |
| POST | `/admin/datasets/{versionId}/publish` | Approve and pin version |
| GET | `/regions` | Search geographic regions |
| GET | `/indicators` | Definitions and available years |
| GET | `/observations?region_code=&year=&level=&indicator=` | Explorer data |
| POST | `/priority/compute` | MCDA calculation + contributions |
| POST | `/scenarios` | Persist scenario + optimizer execution |
| GET | `/scenarios/{id}` | Scenario result and metadata |
| POST | `/scenarios/compare` | Side-by-side scenario diff |
| GET | `/scenarios/{id}/export` | PDF/CSV download |
| GET | `/health` | Health and build version |

### Example input: POST /priority/compute
```json
{
  "data_release_id": "release_2025_v1",
  "region_level": "province",
  "education_level": "all",
  "year": 2025,
  "indicator_weights": {"sanitation_gap_pct": 0.4, "water_gap_pct": 0.3, "internet_gap_pct": 0.3},
  "missing_policy": "exclude"
}
```
**Response** includes `coverage`, `ranking[]`, `contributions[]`, `warnings[]`, `method_version`, `provenance[]`. Input indicator availability must be validated.

## 8. Suggested stack and repository
- Frontend: **SvelteKit, TypeScript, Tailwind**, TanStack Query, ECharts; MapLibre optional based on geodata.
- Backend: **FastAPI, Pydantic v2, SQLAlchemy 2, Alembic**.
- DB: **PostgreSQL**; PostGIS optional for map geometry.
- Data ETL: **Polars/Pandas, openpyxl, Pandera**, manual source adapters first; Prefect only when recurring ingestion proves necessary.
- Optimization: **OR-Tools**; deterministic MCDA in Python module.
- Storage: local dev volume, S3-compatible object store for production raw files.
- Testing: pytest, httpx, Vitest, Playwright; CI GitHub Actions; Docker Compose for local development.
```text
equora/
├── apps/web/             # SvelteKit
├── services/api/         # FastAPI routes, services, models
├── packages/contracts/   # OpenAPI-generated TS contracts
├── data/raw/             # gitignored licensed/large official source files
├── data/metadata/        # source manifest & dictionaries (versioned)
├── data/processed/       # local derived data, gitignored
├── scripts/              # ingestion and validation
├── docs/                 # BRD, PRD, architecture, methodology
├── tests/                # fixtures and golden calculation examples
└── docker-compose.yml
```

## 9. Implementation order (milestones)
**M0 Data-first gate:** obtain 4–6 official XLSX; inspect sheet names/columns, reconcile geography & schooling level; create `dataset_manifest.yaml` and `data_dictionary.csv`; select truthful granularity.

**M1 Platform skeleton:** monorepo, CI, Postgres, migrations, static landing, navigation + design tokens.

**M2 Data pipeline:** import -> validation -> staging -> publish -> explorer; quality reports and provenance.

**M3 Decision engine:** standardized indicator transforms, MCDA and explanations, golden tests.

**M4 Scenario studio:** budget/cost assumptions, optimizer, constraint validations, compare and export.

**M5 Competition polish:** responsive UX, edge cases, performance, deployment + offline-ready local backup, presentation/demo fixtures.

**M6 Optional:** ML/RAG only if data demonstrates necessity.

## 10. Test plan
- Unit: percentages 0–100, null handling, denominator alignment, normalized score direction, weights sum to 1, budget feasibility.
- Property tests: increasing budget cannot reduce optimum objective under unchanged constraints; no negative allocations; reproducibility.
- Integration: XLSX -> normalized observations -> explorer -> scenario -> compare.
- E2E: guest explore; analyst create two scenarios; admin upload/reject/publish dataset; mobile keyboard navigation.
- Adversarial: malformed spreadsheets, spreadsheet formula injection on CSV export, large payloads, mismatched region codes, missing metadata.

## 11. Source data acquisition — downloadable source pages
**Start here; click 'Unduh Dataset' on each official portal page. Tautan diwarisi dari dokumen awal; halaman dan binary XLSX belum diverifikasi ulang dalam sesi setup ini.**

1. [Sanitasi dasar 2025 — percentage](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-terhadap-fasilitas-sanitasi-dasar-2025-indonesia)
2. [Air minum layak 2025 — percentage](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-terhadap-air-minum-layak-2025)
3. [Sekolah akses internet 2025 — count](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-akses-internet-untuk-pengajaran-2025-2)
4. [Sekolah akses komputer 2025 — count](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-akses-komputer-untuk-pengajaran-2025-2)
5. [Sekolah dengan fasilitas cuci tangan 2025 — count](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-fasilitas-cuci-tangan-2025-2)
6. [Sekolah memakai komputer & internet 2025 — count](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-yang-memanfaatkan-komputer-dan-internet-untuk-tujuan-pembelajaran-2025-2)
7. [Referensi Data Pendidikan — school counts/regions](https://referensi.data.kemendikdasmen.go.id/)
8. [DJPK — APBD](https://djpk.kemenkeu.go.id/portal/data/apbd)
9. [BPS — sociodemographic context](https://www.bps.go.id/)

**Download checklist:** preserve original filename; note URL, date, owner, coverage, licensing; don't commit raw files until terms checked. See BRD for useful dataset search keywords.

## 12. Definition of Done — WIA submission
- Main user flow functional in Chrome/Firefox/Edge and mobile, with demo data clearly marked.
- README clone/install/run, architecture and datasets; public repo free of secrets.
- First Draft PDF max 10 pages/10 MB, sitemap/mockup, screenshots landing + additional page; First Draft 1 November 2026 dengan nama WIA_FSDMIA2026_NamaTim.pdf sesuai Technical Meeting halaman 22.
- Final: proposal maksimal 30 halaman following supplied template, originality statement bermaterai Rp10.000, <=5min public YouTube demo; final demo URL and local backup.
- Every analytical chart and report provides source, year, method and limitations.

## 13. Open decisions before coding priority engine
1. Available common geography (`province` vs `district`) and education levels for all selected files?
2. Official total-school denominator compatible with percentages?
3. Official intervention unit prices/SSH or only labeled demonstration assumptions?
4. Auth necessary for scenario persistence or token-based share sufficient?
5. Approved source/data licensing and geographical boundary rights?

**Decision rule:** Do not implement real-world allocation results until these are answered; UI and sandbox calculations can run with clearly labeled synthetic fixtures.
