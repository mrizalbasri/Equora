# Equora — UI/UX Design System & Interface Specification

**Versi:** 1.2 — Clean Education Blue · **Tanggal:** 20 Oktober 2026
**Status:** Arah desain disetujui sebagai baseline; warna tetap berupa tokens yang dapat diubah
**Dokumen terkait:** [BRD](./BRD_Equora.md) · [PRD](./PRD_Equora.md)

## 1. Tujuan & prinsip desain
Equora adalah platform eksplorasi open data pendidikan, pemeringkatan prioritas kebutuhan wilayah, dan simulasi alokasi sumber daya yang *transparan dan dapat dijelaskan*. UI harus terasa seperti produk data profesional, bukan landing page pemasaran yang mengorbankan keterbacaan.

Prinsip: (1) **Clarity over decoration** — angka beserta satuan, cakupan, tahun; (2) **Evidence first** — tampilkan sumber dan versi data pada visualisasi; (3) **Explain, don't mystify** — bobot, asumsi, trade-off dan batasan selalu dapat ditemukan; (4) **Honest states** — simulasi tidak disebut hasil resmi atau prediksi dampak; (5) **Responsive and accessible**.

**Referensi terbaru dari pengguna:** screenshot dashboard berpanel putih dengan aksen biru yang disetujui pada 20 Oktober 2026. Ambil prinsip ruang kerja ringan, bidang putih, latar abu-abu sangat muda, sudut membulat, bayangan tipis, dan hierarki teks yang jelas. Pertahankan navigasi berkelompok dan review berbasis bukti dari rancangan sebelumnya. Landing lebih terbuka dan bercerita tentang pendidikan; explorer/studio memakai struktur workspace saat tersedia. **Jangan menyalin logo, layout pixel-perfect, konten finansial, angka, avatar atau aset referensi**. Teks dibuat lebih gelap daripada referensi untuk keterbacaan.

## 2. Identitas & tone
- Nama tampil: **equora.** (wordmark sementara; perlu pemeriksaan merek).
- Deskriptor: *Public Resource Decision Intelligence*.
- Tagline utama: **Intelligence for Equitable Decisions.**
- Voice: jelas, tenang, analitis, tidak hiperbolis, tidak menyebut output simulasi sebagai rekomendasi resmi pemerintah.
- Bahasa: UI utama Bahasa Indonesia. Istilah teknis dapat diberi tooltip dan terjemahan; siapkan string localization agar English mudah ditambahkan.

## 3. Visual direction — Clean Education Blue

**Baseline disetujui: Clean Education Blue**, menggantikan palet coral versi 1.1. Fokus pada putih dan abu-abu sangat muda, teks biru gelap/netral, serta biru medium untuk tindakan dan pilihan aktif. Kesan yang dituju adalah platform data pendidikan yang bersih, ringan dan mudah didekati. Coral tidak lagi menjadi warna tindakan utama; warna warning/danger tetap semantik, bukan dekorasi.

### 3.1 Color tokens

| Semantic token | HEX | Pemakaian |
|---|---|---|
| `bg` | `#F3F5F8` | Canvas luar ruang kerja |
| `sidebar` | `#F5F8FC` | Sidebar dan area navigasi |
| `surface` | `#FFFFFF` | Kartu, panel, drawer |
| `surface-elevated` | `#FFFFFF` | Modal, dropdown, popover |
| `surface-subtle` | `#F5F8FC` | Subpanel, tabel alternate, input |
| `text` | `#1F2D3D` | Headings, data penting |
| `text-secondary` | `#536276` | Body sekunder |
| `text-muted` | `#5F6D7D` | Metadata; tetap terbaca pada latar terang |
| `primary` | `#1264D8` | Tombol utama dan tindakan penting; kontras teks putih |
| `primary-hover` | `#0E4FAF` | Hover dan teks pilihan aktif pada tint |
| `primary-tint` | `#EAF3FF` | Latar pilihan dan ilustrasi pendidikan |
| `border` | `#DCE4EE` | Divider dan batas panel dekoratif |
| `control-border` | `#7E8DA1` | Batas kontrol saat diperlukan kontras nonteks 3:1 |
| `chart-blue` | `#3979AB` | Seri data non-semantik |
| `chart-blue-light` | `#83A9C7` | Seri sekunder |
| `success` | `#246F56` | Lolos validasi |
| `warning` | `#8D5D13` | Butuh pemeriksaan |
| `danger` | `#B83A28` | Error / data gagal |
| `info` | `#205F9A` | Informasi |
| `focus` | `#0E4FAF` | Focus ring aksesibel |

**Aturan:** Biru merek menunjukkan tindakan/selection, bukan tingkat kebutuhan atau kualitas pendidikan. Warna grafik tetap mengikuti legend, unit dan seri yang dijelaskan. Status laporan data memakai label teks, bukan warna saja. Tint dipakai sebagai latar, bukan teks pada putih. Border panel yang halus tidak dipakai sebagai satu-satunya batas kontrol penting. Validasi WCAG dengan pengujian browser nyata sebelum final.

### 3.2 CSS variables — siap implementasi

```css
:root {
  color-scheme: light;
  --eq-bg: #F3F5F8;
  --eq-sidebar: #F5F8FC;
  --eq-surface: #FFFFFF;
  --eq-surface-elevated: #FFFFFF;
  --eq-surface-subtle: #F5F8FC;
  --eq-text: #1F2D3D;
  --eq-text-secondary: #536276;
  --eq-text-muted: #5F6D7D;
  --eq-primary: #1264D8;
  --eq-primary-hover: #0E4FAF;
  --eq-primary-tint: #EAF3FF;
  --eq-border: #DCE4EE;
  --eq-control-border: #7E8DA1;
  --eq-chart-blue: #3979AB;
  --eq-chart-blue-light: #83A9C7;
  --eq-success: #246F56;
  --eq-warning: #8D5D13;
  --eq-danger: #B83A28;
  --eq-info: #205F9A;
  --eq-focus: #0E4FAF;
  --eq-radius-sm: 12px;
  --eq-radius-md: 18px;
  --eq-radius-lg: 24px;
  --eq-shadow-card: 0 2px 10px rgba(30, 36, 43, 0.035);
}
```

### 3.3 Style rules
- Very light gray outer canvas and white primary panels; no gradient-heavy canvas or glassmorphism.
- Borders `1px` subtle; shadows only for dropdown, floating action, modal and occasional active card.
- Blue accent concentrated on primary CTA, selected workflow step and actionable review callout; never substitute brand color for chart semantics.
- Typography carries hierarchy; use restrained icons, spacious padding and concise labels.
- Ikon memakai `carbon-icons-svelte` melalui komponen `Icon.svelte`, dengan import langsung per ikon. Sidebar dashboard/workspace dan tautan bantuan boleh memakai ikon untuk memudahkan pemindaian navigasi. Tombol aksi berlabel, menu publik, preset, dan label formulir mengandalkan teks tanpa ikon dekoratif. Ikon juga dipakai untuk kontrol tanpa teks (menu/tutup), pencarian, status, dan penunjuk struktur seperti breadcrumb. Ukuran mengikuti konteks 16–20 px dan warna mengikuti teks; jangan menambahkan badge ikon berwarna atau panah pada setiap CTA.
- Public landing page can be more expressive; app workspace should prioritize scanability and dense information.

### 3.4 Ilustrasi pendidikan dan batas referensi
- Landing dapat memakai ilustrasi sekolah sederhana berwarna biru untuk menjelaskan konteks pendidikan. Ilustrasi bukan sekolah nyata atau hasil data dan tidak menggantikan visualisasi analitis.
- Gunakan SVG lokal yang ringan untuk bentuk sederhana; beri nama aksesibel jika informatif. Tidak perlu maskot khusus, karakter mengambang, avatar rekaan atau ikon finansial dari referensi.
- Ilustrasi kecil dapat membantu empty state dengan langkah berikutnya yang jelas; explorer/studio tetap memprioritaskan data dan sumber.
- Bayangan tipis boleh membedakan satu bingkai workspace dari canvas luar. Hindari bayangan pada setiap baris/kartu; radius dibedakan menurut peran kontrol/panel.

### 3.5 Penyederhanaan landing `/` — 22 Oktober 2026

Referensi FitMe dari pengguna memandu komposisi landing yang lebih tenang: ruang putih, judul dua warna, kontrol teks sederhana, dan satu bagian kontras. Pengguna menegaskan bahwa palet biru Equora tetap dipertahankan; referensi tidak mengubah identitas warna. Untuk visual hero, pengguna memilih opsi ketiga: ilustrasi editorial fasilitas sekolah, menggantikan blok screenshot workspace yang padat. Rincian ada di [arah visual landing](./landing-visual-direction.md), [provenance aset](../frontend/static/images/landing/README.md), dan [prompt ekspor ilustrasi](../frontend/static/images/landing/school-editorial-prompt.md). Referensi hanya memandu komposisi dan ritme, bukan konten, merek, atau klaim produk.

`PublicShell` memakai opsi `calm` hanya pada `/`; default tetap `false`. Opsi ini menyederhanakan komposisi shell dan tetap memakai token Clean Education Blue berikut. Warna hero dan bidang skenario dibatasi pada landing:

| Token/peran landing | Nilai | Pemakaian |
|---|---|---|
| `--eq-text` | `#1F2D3D` | Teks utama |
| `--eq-text-secondary` | `#536276` | Penjelasan dan navigasi sekunder |
| `--eq-primary` | `#1264D8` | CTA dan baris kedua judul hero |
| `--eq-primary-hover` | `#0E4FAF` | Hover CTA |
| `--eq-primary-tint` | `#EAF3FF` | Pilihan navigasi |
| `--eq-border` | `#DCE4EE` | Pemisah ringan |
| Surface | `#FFFFFF` | Latar baca putih |
| Judul hero sekunder | `#637489` | Baris pertama judul dua warna |
| Bagian skenario | `#163A5F` | Satu bidang biru tua dengan teks terang yang terbaca |

CTA hero memakai biru `#1264D8`, hover `#0E4FAF`, teks putih, radius 24px dan tinggi minimum 46px. Font sans-serif UI yang ada tetap digunakan. Shell calm menghapus bayangan bingkai, memakai header non-sticky, serta menyembunyikan deskriptor kecil wordmark. Header publik bersama memakai putih solid tanpa blur atau bayangan. Titik wordmark tetap biru `#1264D8`. Dashboard/workspace tetap memakai Clean Education Blue dan ikon navigasi Carbon sesuai §3.3; kontrol publik berlabel tetap mengandalkan teks. Catatan hasil workspace memakai putih polos, border netral, dan penomoran biru; aksi PDF hasil memakai tombol biru biasa.

## 4. Typography, spacing & grid
- Fonts (web-safe fallback): `Inter, system-ui, sans-serif` for UI; optional `Manrope` for headings, with proper font licenses and font-display swap. Avoid downloading or embedding proprietary reference-site fonts.
- Hero desktop: 56–72px / line-height 1.08, max 11–13 words per line; mobile: 38–44px.
- Section heading: 32–40px desktop, 26–30px mobile; page title: 28–34px; body: 16px / 1.55; small: 13–14px (never critical text below 13px).
- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96`px. Main content max-width `1200–1280px`.
- Dashboard desktop: left rail 256px (min 232 / max 280), content flexible, 24px gutters; tablet collapsed rail; mobile single column.
- Cards use 1px subtle border, soft radius 18–24px; public workspace frame may use 28px. Controls use 12px. Avoid heavy shadows and excessive glassmorphism.
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
[logo]       Navigasi produk dan referensi

[Hero terpusat: Beda wilayah. / Beda kebutuhan.]
[Penjelasan singkat tentang fasilitas, prioritas, dan simulasi anggaran]
[Buka Studio Simulasi] [Telusuri data pendidikan]
[Pilihan tujuan: Explorer | Studio simulasi]
[Ilustrasi editorial sekolah utuh, tanpa border/kartu]
[Ilustrasi fasilitas pendidikan + tautan biru ke workspace terpilih]

[3 langkah berbentuk daftar: Telusuri data > Atur prioritas > Bandingkan hasil]
[Bagian biru tua: anggaran, batasan, jejak keputusan + caveat simulasi]
[Daftar sumber resmi, satuan, tahun, dan status review lokal]
[Metodologi dan batasan dalam disclosure]
[CTA penutup ke Studio]
[Footer: repositori | katalog dataset | metodologi | disclaimer]
```

**Komposisi:** arah §3.5 mempertahankan palet biru Equora dan komposisi terbuka hanya untuk `/`. Judul dua baris terpusat, penjelasan singkat, dan satu CTA utama biru mendahului ilustrasi editorial opsi ketiga yang dipilih pengguna. Daftar alur/sumber dan disclosure metode memberi variasi ritme tanpa kartu pada setiap item. Bagian skenario biru tua tetap menyatakan bahwa simulasi bukan keputusan anggaran resmi.

**Ilustrasi dan kontrol native:** `/images/landing/school-editorial.webp` (1738 × 905) adalah artwork ImageGen fasilitas sekolah: ruang kelas, komputer, dan air/cuci tangan. Tampilkan utuh sesuai aspect ratio, tanpa crop, border, atau kartu pembungkus. Raster hanya berisi ilustrasi; selector, caption, dan tautan tetap berupa Svelte/HTML native. Selector Explorer/Studio memakai `aria-pressed` dan hanya mengubah tautan tujuan, bukan gambar: `Telusuri data pendidikan` ke `/explore`, atau `Atur simulasi anggaran` ke `/studio`. Caption tetap `Ilustrasi fasilitas pendidikan`; alt menyatakan konteks ilustratif. Gambar bukan sekolah nyata, peta, dataset, atau hasil alokasi, dan tidak membawa klaim data atau dampak. Screenshot Explorer/Studio terdahulu hanya aset historis dan tidak digunakan pada landing.

**Interaksi dan navbar:** CTA hero menuju `/studio` dan `/explore` yang tersedia. Header calm putih non-sticky memakai navigasi teks; bagian aktif memiliki tint biru, garis bawah dan `aria-current`. Di bawah 1024px, menu buka/tutup memiliki target minimum 44px, Escape mengembalikan fokus ke tombol, pilihan tautan menutup menu, dan tinggi menu dibatasi viewport dengan scroll. Selector tujuan, tautan sumber, disclosure metode, dan navigasi harus tetap berfungsi melalui keyboard. Gerak opsional menghormati `prefers-reduced-motion`; logo/testimoni yang menyesatkan tetap dilarang.

**Respons dan batasan:** pada mobile teks/tindakan membungkus dan bagian dua kolom menjadi satu kolom. Ilustrasi mengecil dengan aspect ratio penuh tanpa memotong fasilitas; caption dan caveat di luar gambar tetap terbaca (minimum 13px). Analisis nyata tersedia melalui tautan workspace. Token landing sebagian masih literal CSS pada route/shell; tabel §3.5 mencatat implementasi saat ini, bukan klaim bahwa seluruh palet landing sudah dapat diganti lewat token global.

### 6.2 `/explore` — Regional Equity Explorer (P0)
Header: title, source snapshot/year, selected education level. Toolbar: pilih indikator, wilayah, tahun, jenjang, urutkan. Body desktop: peta *jika coverage geometri valid* or ranked bar chart, companion metrics cards, detail table. On mobile: chart then searchable table; no sideways forced scrolling. Click a region => details. Every indicator has `Lihat sumber`, unit, year, and warnings.

### 6.3 `/explore/regions/[code]` — Region details (P0)
Regional header + badges for data coverage; compare against peer group; indicators, source provenance drawer, missing-data note. No ranking if incomparable periods/units.

### 6.4 `/datasets` & `/datasets/[id]` (P0)
Catalog table with search/filters: title, publisher, year, unit, coverage, last imported date, quality status. **Desain ala knowledge management:** tab `Semua sumber`, `Perlu ditinjau`, `Disetujui`, `Duplikat` (hanya tampil bila status ada); row source icon, title, file type, coverage, role/source label dan menu aksi. Detail: overview, source URL, license/usage terms, last download timestamp, checksum, preview 20 rows, quality flags, lineage. Expandable review card memperlihatkan dua nilai yang bertentangan, rujukan sumber, dan opsi `Tandai untuk ditinjau`, `Pilih versi` (admin, tercatat di audit log). **Sistem tidak memutuskan fakta benar hanya berdasarkan versi terbaru.** Missing and withheld values are **not zero**.

### 6.5 `/studio` — Scenario builder (P0, core demo)
Desktop workflow-style workspace dengan stepper horizontal (langkah aktif biru, completed graphite); mobile stepper vertikal/compact:
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

Main area: light canvas + large white result surface; side summary panel contains `Anggaran terpakai`, `Cakupan analisis`, `Jumlah wilayah yang layak`, and methodology. Use a single blue button for `Jalankan optimasi`; secondary actions outlined. Prioritization result card can expand to show indicator contribution and assumptions, similar to an evidence review panel.

### 8.3 Analytics widgets

KPI row in a full-width white panel with subtle vertical separators; contextual color dots with accessible text; charts inside white canvas with restrained analytical blue series. Active selections use a clear outline or text label so brand blue is not confused with the scale of need. Avoid imitating the reference's finance metrics and fake activity examples. Use educational dataset values exclusively once validated.

### 8.4 Button, tag, form, table and overlay specs

| Element | Visual | Interaction |
|---|---|---|
| Primary button | solid blue, white text, 12px radius, 44px min height | hover darken; disable while pending |
| Secondary button | white with gray 1px border | focus ring visible; no misleading primary hierarchy |
| Danger action | text + warning icon; red only for destructive action | confirmation dialog + recovery details |
| Status tag | gentle tint background, readable dark foreground | always include status text |
| Input | white/subtle gray, control border `#7E8DA1`, 12px radius | visible label, helper/error below |
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
1. Clean Education Blue tokens, typography, grouped sidebar, top bar, foundational components.
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
- [ ] Landing and workspace primary CTAs use Equora blue; charts preserve analytical semantics rather than brand-only colors.

## 15. Decisions to confirm later
- Clean Education Blue v1.2 remains the approved baseline for landing and workspace, including dataset review and scenario studio. Landing `/` uses the simplified composition in §3.5 and §6.1 while retaining this blue palette. Do not add placeholder routes just to demonstrate the theme.
- Decide whether `Manrope` headings improve visual identity; otherwise use Inter throughout.
- Verify accessible contrast of any final palette.
- Confirm downloaded dataset fields, region granularity and official licensing before final chart design.
- Technical Meeting page 21 permits more than one subtheme. Use Data-Driven Decision Support as the recommended primary; confirm whether annual data meets the supporting Open Government Data wording about real-time updates.
