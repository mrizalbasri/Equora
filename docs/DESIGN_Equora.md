# Equora — UI/UX Design System & Interface Specification

**Versi:** 1.1 — Soft Gray Enterprise UI · **Tanggal:** 18 Oktober 2026
**Status:** Arah desain disetujui sebagai baseline; warna tetap berupa tokens yang dapat diubah
**Dokumen terkait:** [BRD](./BRD_Equora.md) · [PRD](./PRD_Equora.md)

## 1. Tujuan & prinsip desain
Equora adalah platform eksplorasi open data pendidikan, pemeringkatan prioritas kebutuhan wilayah, dan simulasi alokasi sumber daya yang *transparan dan dapat dijelaskan*. UI harus terasa seperti produk data profesional, bukan landing page pemasaran yang mengorbankan keterbacaan.

Prinsip: (1) **Clarity over decoration** — angka beserta satuan, cakupan, tahun; (2) **Evidence first** — tampilkan sumber dan versi data pada visualisasi; (3) **Explain, don't mystify** — bobot, asumsi, trade-off dan batasan selalu dapat ditemukan; (4) **Honest states** — simulasi tidak disebut hasil resmi atau prediksi dampak; (5) **Responsive and accessible**.

**Referensi terbaru dari pengguna:** tiga screenshot dashboard Retainr-like (knowledge management, activity overview, review konflik). Gunakan prinsip *soft gray workspace*, kartu putih, sidebar navigasi berkelompok, panel review, tombol coral, status yang jelas, dan tipografi hierarkis. Referensi SaaS terdahulu (Framer / Adopt / Brainfish / Genie) tetap berlaku khusus landing. **Jangan menyalin logo, layout pixel-perfect, konten, atau aset milik produk lain**.

## 2. Identitas & tone
- Nama tampil: **equora.** (wordmark sementara; perlu pemeriksaan merek).
- Deskriptor: *Public Resource Decision Intelligence*.
- Tagline utama: **Intelligence for Equitable Decisions.**
- Voice: jelas, tenang, analitis, tidak hiperbolis, tidak menyebut output simulasi sebagai rekomendasi resmi pemerintah.
- Bahasa: UI utama Bahasa Indonesia. Istilah teknis dapat diberi tooltip dan terjemahan; siapkan string localization agar English mudah ditambahkan.

## 3. Visual direction final sementara — Soft Gray Enterprise

**Pilihan baseline: Soft Gray Enterprise / Coral** (menggantikan default Editorial Cobalt). Fokus warna abu-abu lembut, panel hampir putih, teks graphite, coral sebagai aksen tindakan. Palet tidak dibuat menyerupai identitas produk referensi secara persis.

### 3.1 Color tokens

| Semantic token | HEX | Pemakaian |
|---|---|---|
| `bg` | `#E7E8EA` | Canvas dashboard |
| `sidebar` | `#E3E4E6` | Sidebar dan area navigasi |
| `surface` | `#F9F9FA` | Kartu, panel, drawer |
| `surface-elevated` | `#FFFFFF` | Modal, dropdown, popover |
| `surface-subtle` | `#F0F1F2` | Subpanel, tabel alternate, input |
| `text` | `#24262B` | Headings, data penting |
| `text-secondary` | `#555C65` | Body sekunder |
| `text-muted` | `#686E76` | Metadata; hindari terlalu pucat |
| `primary` | `#C94025` | Tombol utama dan tindakan penting; lebih gelap untuk kontras teks putih |
| `primary-hover` | `#B33720` | Hover |
| `primary-tint` | `#F7E4DF` | Selection, tags coral lembut |
| `border` | `#CFD2D6` | Divider, input border |
| `chart-blue` | `#3979AB` | Seri data non-semantik |
| `chart-blue-light` | `#83A9C7` | Seri sekunder |
| `success` | `#246F56` | Lolos validasi |
| `warning` | `#8D5D13` | Butuh pemeriksaan |
| `danger` | `#B83A28` | Error / data gagal |
| `info` | `#2E668C` | Informasi |
| `focus` | `#236AAB` | Focus ring aksesibel |

**Aturan:** Coral bukan kode warna untuk risiko, kemiskinan, atau kebutuhan tinggi. Status laporan data memakai label teks + ikon + warna. Jangan gunakan tint pucat sebagai warna teks pada putih. Validasi WCAG dengan pengujian browser nyata sebelum final.

### 3.2 CSS variables — siap implementasi

```css
:root {
  color-scheme: light;
  --eq-bg: #E7E8EA;
  --eq-sidebar: #E3E4E6;
  --eq-surface: #F9F9FA;
  --eq-surface-elevated: #FFFFFF;
  --eq-surface-subtle: #F0F1F2;
  --eq-text: #24262B;
  --eq-text-secondary: #555C65;
  --eq-text-muted: #686E76;
  --eq-primary: #C94025;
  --eq-primary-hover: #B33720;
  --eq-primary-tint: #F7E4DF;
  --eq-border: #CFD2D6;
  --eq-chart-blue: #3979AB;
  --eq-chart-blue-light: #83A9C7;
  --eq-success: #246F56;
  --eq-warning: #8D5D13;
  --eq-danger: #B83A28;
  --eq-info: #2E668C;
  --eq-focus: #236AAB;
  --eq-radius-sm: 10px;
  --eq-radius-md: 14px;
  --eq-radius-lg: 22px;
  --eq-shadow-card: 0 2px 10px rgba(30, 36, 43, 0.035);
}
```

### 3.3 Style rules
- Gray outer canvas, near-white primary panels, no gradient-heavy canvas and no glassmorphism.
- Borders `1px` subtle; shadows only for dropdown, floating action, modal and occasional active card.
- Coral accent concentrated on primary CTA, selected workflow step and actionable review callout; never across entire analytics chart.
- Typography carries hierarchy; use restrained icons, spacious padding and concise labels.
- Public landing page can be more expressive; app workspace should prioritize scanability and dense information.

## 4. Typography, spacing & grid
- Fonts (web-safe fallback): `Inter, system-ui, sans-serif` for UI; optional `Manrope` for headings, with proper font licenses and font-display swap. Avoid downloading or embedding proprietary reference-site fonts.
- Hero desktop: 56–72px / line-height 1.08, max 11–13 words per line; mobile: 38–44px.
- Section heading: 32–40px desktop, 26–30px mobile; page title: 28–34px; body: 16px / 1.55; small: 13–14px (never critical text below 13px).
- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96`px. Main content max-width `1200–1280px`.
- Dashboard desktop: left rail 256px (min 232 / max 280), content flexible, 24px gutters; tablet collapsed rail; mobile single column.
- Cards use 1px subtle border, soft radius 14–22px; avoid heavy shadows and excessive glassmorphism.
- Buttons 40–44px minimum control height; interactive targets >= 44x44 when feasible.

## 5. Navigation & application shell

Struktur URL tetap konsisten dengan PRD:

```text
/                                      public landing
/explore                               Regional Explorer
/explore/regions/[regionCode]          Regional detail
/datasets                              Dataset catalog
/datasets/[datasetId]                  Dataset detail
/studio                                Scenario wizard
/studio/scenarios/[id]                 Scenario result
/studio/compare?left=&right=           Scenario comparison
/methodology                           Metodologi
/about                                 Tentang produk
/admin                                 Admin data operations (protected)
```

### Sidebar desktop (pola referensi)

```text
[ equora. ]                          [Global search / command palette]  [Help] [User]

OVERVIEW
  ▦ Dashboard / Explorer              -> /explore
  ◫ Regional detail                   -> /explore/regions/[regionCode]

DATA INTELLIGENCE
  ▤ Dataset Catalog                   -> /datasets
     · Dataset detail                 -> /datasets/[datasetId]
  ◉ Data Review                       -> /admin (role-gated)

DECISION INTELLIGENCE
  ◉ Scenario Studio                   -> /studio
     · Scenario Results               -> /studio/scenarios/[id]
     · Compare Scenarios              -> /studio/compare

REFERENCE
  ▧ Methodology                       -> /methodology
  ⓘ About / Help                      -> /about
```

Navigation item terdiri dari ikon, label, active background putih/hampir putih dan font medium; nested item diindent dengan connecting rail tipis. Jangan tampilkan menu admin untuk publik. *Dashboard* pada fase awal boleh berarti Explorer; jangan menambah URL `/dashboard` yang tak ada di PRD tanpa perubahan PRD eksplisit.

**Top header**: global search (dataset, indikator, wilayah) bila tersedia, breadcrumb pada detail, help, profile untuk role login. Tidak perlu notification bell palsu ketika belum ada sistem notifikasi. CTA header harus kontekstual (`Buat skenario`, `Unggah dataset` hanya untuk admin).

**Responsive**: >=1024 sidebar fixed; 640–1023 compact/collapsible; <640 sidebar drawer dengan focus management; header pencarian menjadi trigger search modal. Konten utama jangan terpotong horizontal.

## 6. Halaman & wireframe tekstual

### 6.1 `/` — Landing (P0)
**Tujuan:** dalam 10 detik menjelaskan *data → prioritas → skenario* dan mengarahkan pengunjung ke pengalaman nyata.

```text
[logo]       Jelajahi Data   Studio Skenario   Metodologi    [Mulai eksplorasi]

[Eyebrow: Transparansi data dan keputusan]
[Pahlawan: Dari data publik menuju keputusan yang lebih terukur.]
[Deskripsi 2 baris, caveat simulator] [Jelajahi data] [Bangun skenario]

[Product preview: contoh explorer, grafik, scenario output yang bisa diklik]
[3 langkah: Telusuri data > Susun prioritas > Bandingkan skenario]
[Section: Mengapa Equora? + contoh provenance source]
[Section: Dataset resmi & periode, update label]
[Section: Transparansi metode, batasan, dan asumsi]
[Footer: sumber | metodologi | disclaimer | kontak proyek]
```

**Interactions:** CTA navigate; product preview no fake live metrics; no misleading logos/testimonials. Hero motion optional and respects `prefers-reduced-motion`.

### 6.2 `/explore` — Regional Equity Explorer (P0)
Header: title, source snapshot/year, selected education level. Toolbar: pilih indikator, wilayah, tahun, jenjang, urutkan. Body desktop: peta *jika coverage geometri valid* or ranked bar chart, companion metrics cards, detail table. On mobile: chart then searchable table; no sideways forced scrolling. Click a region => details. Every indicator has `Lihat sumber`, unit, year, and warnings.

### 6.3 `/explore/regions/[code]` — Region details (P0)
Regional header + badges for data coverage; compare against peer group; indicators, source provenance drawer, missing-data note. No ranking if incomparable periods/units.

### 6.4 `/datasets` & `/datasets/[id]` (P0)
Catalog table with search/filters: title, publisher, year, unit, coverage, last imported date, quality status. **Desain ala knowledge management:** tab `Semua sumber`, `Perlu ditinjau`, `Disetujui`, `Duplikat` (hanya tampil bila status ada); row source icon, title, file type, coverage, role/source label dan menu aksi. Detail: overview, source URL, license/usage terms, last download timestamp, checksum, preview 20 rows, quality flags, lineage. Expandable review card memperlihatkan dua nilai yang bertentangan, rujukan sumber, dan opsi `Tandai untuk ditinjau`, `Pilih versi` (admin, tercatat di audit log). **Sistem tidak memutuskan fakta benar hanya berdasarkan versi terbaru.** Missing and withheld values are **not zero**.

### 6.5 `/studio` — Scenario builder (P0, core demo)
Desktop workflow-style workspace dengan stepper horizontal (langkah aktif coral, completed graphite); mobile stepper vertikal/compact:
1. **Pilih wilayah & indikator**: dataset version and coverage; missing-data handling explicitly selected.
2. **Atur prioritas**: indicator weight sliders totaling 100%; normalization method and explainable per-region contribution.
3. **Anggaran & kendala**: budget (IDR), intervention type, cost per package with `official_reference` / `demo_assumption`, capacities and fairness constraints; calculate.

Use side-by-side preview for desktop; stepper on mobile. Results card: eligible regions, priority rank, allocations, budget used, unallocated budget, trade-offs, model version. No claim of impact or specific schools helped without school-level data.

### 6.6 `/studio/scenarios/[id]` — Results (P0)
Summary metrics, ranked regions, allocation plot, transparent explanation with contribution bars, input snapshot, sensitivity comparison, methodology link, `Bandingkan`, `Unduh ringkasan`. Unfeasible scenario => detailed constraint failure + actionable adjustments.

### 6.7 `/studio/compare` — Scenario comparison (P0)
Two source-labeled scenario cards, delta of budget usage, rank movement, coverage proxy, constraint settings, trade-offs. Use connected comparisons and direct labels; avoid misleading percentage comparisons when bases differ.

### 6.8 `/methodology` (P0)
Plain-language definitions, MCDA normalization formula, weights, missing data handling, OR-Tools optimization constraints, known limitations and data coverage. Use expandable technical detail and worked example. Separate official source values from assumptions.

### 6.9 `/admin` (P1)
Authenticated dataset import flow: upload area dashed border (`CSV/XLSX` jika memang backend support), file list, map columns, async progress, validation summary, duplicate/conflict review, preview, approval then publish; registry versions/history; status audits. **Never advertise PDF/DOCX/PPTX imports unless parsers exist**. Failed data never auto-publishes. Buttons with explicit confirm for irreversible actions. Konflik tidak diselesaikan diam-diam; reviewer menentukan pilihan berdasarkan bukti yang tersedia dan alasannya tercatat.

## 7. Component inventory (SvelteKit)
| Component | Key props/states | Accessibility / behavior |
|---|---|---|
| `AppShell` | area, role, currentRoute | skip-to-content, responsive nav |
| `TopNav`, `SideNav`, `SidebarGroup` | links, active, nested items | active semantics, keyboard navigation |
| `GlobalSearch` | results, scope, role | supports escape, keyboard, empty states |
| `Stepper` | steps, current, completed | aria-current and text labels |
| `FileDropzone` | supportedFormats, files, progress | clickable alternative; error text |
| `SourceReviewCard` | leftSource, rightSource, discrepancy, action | separate missing from conflicting; logged actions |
| `ReviewTabs` | counts, activeTab | keyboard tablist semantics |
| `ActivityPanel` | events, timestamp, actor | role-aware; no fabricated activity |
| `PageHeader` | title, description, actions | one H1 per page |
| `StatCard` | value, unit, source, timestamp | unit always visible; no fake loading value |
| `IndicatorPicker` | indicator, year, level | labels, unavailable disabled with reason |
| `RegionSelector` | level, code, regionOptions | searchable accessible combobox |
| `DataTable` | rows, sort, filter, export | semantic table, empty state |
| `RegionMap` | geoJSON, values, legend | table fallback and keyboard alternative |
| `DataProvenance` | publisher, URL, date, version | human-readable citations |
| `QualityBadge` | warningLevel, details | text labels in addition to color |
| `WeightSlider` | name, percentage, onChange | numeric input alternative; sum validation |
| `BudgetInput` | amountIDR, range | number validation, Indonesian formatting |
| `AssumptionNotice` | method, provenance | persistent when assumptions affect results |
| `OptimizationResult` | allocations, metrics | uncertainty, infeasibility handled |
| `ScenarioCompare` | left, right, diff | source-normalized comparisons |
| `EmptyState` | reason, CTA | meaningful action |
| `Toast`, `ConfirmDialog` | kind, action | aria-live; focus trapping for dialog |

### Component states
**Every interactive component** must define: default, hover (pointer), focus visible, pressed, disabled, loading, error, empty, success as applicable. Show data freshness, incomplete data, compute timeout, source unavailable, and infeasible optimization explicitly.

## 8. UI patterns from user reference

### 8.1 Dataset ingestion & source review

```text
[Sidebar]  [Breadcrumb: Dataset > Import]         [Help] [Profile]
           [H1: Kelola sumber data]              [Unggah dataset (admin)]
           [Stepper: 1 Unggah ✓ — 2 Validasi ● — 3 Review — 4 Publikasi]
           ┌─────────────────────────────────────────────────────┐
           │ Drop .csv/.xlsx here or browse                      │
           │ Beri keterangan batas ukuran sesuai backend         │
           └─────────────────────────────────────────────────────┘
           [Processed] [Warnings] [Duplicates] [Conflicts]
           [Semua sumber] [Perlu ditinjau] [Disetujui] [Duplikat]
           [Source row: nama, penerbit, tahun, status, tindakan]
           [Expanded review: sumber A vs B, detail, evidence, pilih/flag]
```

**State machine review**: `uploaded -> validating -> needs_review | validated -> approved -> published`, with `rejected` or `failed` branches. Only privileged roles may approve/publish, all resolution changes audited (user, time, prior value, new value, reason). Distinguish real conflicts from different year, unit, coverage, school level, or metadata omission.

### 8.2 Decision workspace

Main area: light canvas + large white result surface; side summary panel contains `Anggaran terpakai`, `Cakupan analisis`, `Jumlah wilayah yang layak`, and methodology. Use a single coral button for `Jalankan optimasi`; secondary actions outlined. Prioritization result card can expand to show indicator contribution and assumptions, similar to an evidence review panel.

### 8.3 Analytics widgets

KPI row in a full-width white panel with subtle vertical separators; contextual color dots with accessible text; charts inside white canvas with restrained blue bars and coral solely for interaction/selection where semantically correct. Avoid imitating the reference's agent metrics and fake activity examples. Use educational dataset values exclusively once validated.

### 8.4 Button, tag, form, table and overlay specs

| Element | Visual | Interaction |
|---|---|---|
| Primary button | solid dark coral, white text, 12px radius, 44px min height | hover darken; disable while pending |
| Secondary button | white with gray 1px border | focus ring visible; no misleading primary hierarchy |
| Danger action | text + warning icon; red only for destructive action | confirmation dialog + recovery details |
| Status tag | gentle tint background, readable dark foreground | always include status text |
| Input | white/subtle gray, border `#CFD2D6`, 12px radius | visible label, helper/error below |
| Data table | white rows, separator lines, sticky header on desktop | keyboard sortable, mobile card fallback |
| Review expand panel | white nested panel, lightweight border, slight shadow | content not hidden solely by hover |
| Modal | white floating surface with backdrop; max width 560px | trap focus, esc dismiss except critical flows |
| Empty state | concise reason + relevant next step | no empty fake KPI placeholders |

## 9. Data visualization rules
- Never drop missing observations from a comparison without counting them in a coverage notice.
- Use bars for rank, lines for time series only when temporal observations exist, choropleth only with verified geometry and comparable normalization; legends include units.
- Each plot: descriptive title, axis names, year, denominator (when percentage), dataset reference, download data CTA.
- Do not use green=good/red=bad without text annotations; verify color-blind distinguishability.
- Map baselayers must honor attribution/license; map is enhancement, not a dependency for core demo.

## 10. UX copy examples
| Context | Suggested copy |
|---|---|
| Main CTA | `Bangun skenario` |
| Data CTA | `Jelajahi data publik` |
| Assumed cost | `Biaya per paket menggunakan asumsi simulasi, bukan tarif resmi.` |
| Missing data | `Indikator tidak tersedia untuk wilayah dan tahun ini.` |
| Infeasible | `Tidak ada alokasi yang memenuhi seluruh batasan. Ubah anggaran atau kendala.` |
| Score | `Skor prioritas relatif — bukan peringkat resmi pemerintah.` |
| Data source | `Sumber: [instansi], [tahun], diperbarui [tanggal]` |

## 11. Responsive breakpoints & accessibility
- Small: 360–639px — single-column, drawers for filters, stepper instead of 3 columns.
- Medium: 640–1023px — two-column cards, compact sidebar.
- Large: >=1024px — full app sidebar and analysis workspace.
- Test 360, 390, 768, 1024, 1440px and browser zoom 200%; no essential content clipped.
- WCAG 2.2 AA ambition: contrast >=4.5:1 standard text, >=3:1 large text and meaningful UI boundaries, labeled inputs/errors, semantic headings, keyboard focus order, visible focus, reduced motion.
- Use `Intl.NumberFormat('id-ID')` for number formatting; currency `IDR`; show precise units and do not round source values in exports.

## 12. Starter folder mapping
```text
apps/web/src/
  lib/
    components/{layout,ui,data,charts,studio}/
    styles/{tokens.css,globals.css}/
    stores/
    types/
  routes/
    +page.svelte
    explore/+page.svelte
    explore/regions/[regionCode]/+page.svelte
    datasets/+page.svelte
    datasets/[datasetId]/+page.svelte
    studio/+page.svelte
    studio/scenarios/[id]/+page.svelte
    studio/compare/+page.svelte
    methodology/+page.svelte
    about/+page.svelte
    admin/+page.svelte
```

## 13. Design delivery order
1. Soft Gray tokens, typography, grouped sidebar, top bar, foundational components.
2. Landing + Explorer + source provenance card (first draft screenshots); avoid stale theme examples.
3. Dataset catalog + details and responsive data visualizations.
4. Scenario Studio + explainability results + comparison.
5. Admin file import, conflict review UI and audit activity; PDF export styling and optional dark theme/motion.

## 14. UI QA acceptance checklist
- [ ] Landing communicates problem, value, and transparent limitations within first screen.
- [ ] All nav/CTAs lead to real pages; keyboard works.
- [ ] Explorer shows source/year/units beside every metric; empty and missing states tested.
- [ ] Dataset view has URL, definition, year, coverage, provenance and warnings.
- [ ] Studio weights sum to 100% with explicit validation; currency and assumptions visible.
- [ ] Optimizer errors/infeasibility do not masquerade as successful results.
- [ ] Scenario compare labels both data versions and methodological differences.
- [ ] Screens are legible and functional at 360px, tablet and desktop.
- [ ] Chart titles, table fallback, focus rings, form errors and reduced-motion are implemented.
- [ ] Colors can be changed by swapping semantic tokens, without touching UI component logic.
- [ ] Sidebar groups and active/nested navigation match the approved reference *principles*, not a copied design.
- [ ] Import UI advertises only formats actually supported by backend.
- [ ] Source conflict review has evidence, manual approval, reason and audit trace.
- [ ] Primary CTA uses coral; charts preserve analytical semantics rather than brand-only colors.

## 15. Decisions to confirm later
- Soft Gray Enterprise is baseline; review actual **landing + dataset review + scenario studio** screenshots before finalizing coral hue.
- Decide whether `Manrope` headings improve visual identity; otherwise use Inter throughout.
- Verify accessible contrast of any final palette.
- Confirm downloaded dataset fields, region granularity and official licensing before final chart design.
- Technical Meeting page 21 permits more than one subtheme. Use Data-Driven Decision Support as the recommended primary; confirm whether annual data meets the supporting Open Government Data wording about real-time updates.
