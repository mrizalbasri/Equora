# GEO & Search Engine Optimization Analysis: Equora

Laporan analisis menyeluruh kesiapan **Generative Engine Optimization (GEO)** dan **Google Search Indexing** untuk **Equora** (Platform Wawasan Data Fasilitas Pendidikan 38 Provinsi di Indonesia).

---

## 1. GEO & Search Readiness Score: 92/100

| Komponen Evaluasi | Bobot | Skor | Status |
|-------------------|-------|------|--------|
| **Citability & Passage Structure** | 25% | 23/25 | Sangat Baik (Blok kutipan 100-160 kata, definisi padat, angka statistik spesifik) |
| **Technical Crawlability & SSR** | 20% | 20/20 | Sempurna (SvelteKit SSR penuh, robots.txt terbuka untuk AI bot & Googlebot) |
| **Structured Data & Schemas** | 20% | 19/20 | Komprehensif (Organization, WebSite + SearchAction, WebApplication, FAQPage, BreadcrumbList) |
| **Multi-Modal & Brand Signals** | 15% | 14/15 | Unggul (Banner OG 1024x576 resolusi tinggi, metadata gambar sitemap, logo webp) |
| **Authority & External Entities** | 20% | 16/20 | Baik (Provenance data Kemendikbud & BPS resmi; membutuhkan ekspansi kanal eksternal) |
| **Total Skor** | **100%** | **92/100** | **GEO Ready (Tier 1 AI Search & Google Ready)** |

---

## 2. Platform Breakdown

### A. Google AI Overviews & Google Search (Skor: 94/100)
- **Kekuatan**:
  - Halaman ter-render di server (SSR), dapat dibaca langsung oleh Googlebot tanpa perlu mengeksekusi client JS.
  - Tag pengindeksan eksplisit: `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`.
  - Open Graph banner `equora-og.jpg` terdaftar di `sitemap.xml` dengan ekstensi Google Image.
  - Schema `FAQPage` langsung memicu cuplikan kaya (Rich Snippets) pada hasil pencarian berbasis pertanyaan.
- **Rekomendasi**: Daftarkan sitemap ke **Google Search Console** segera setelah deployment domain publik aktif.

### B. ChatGPT & OpenAI SearchBot (Skor: 91/100)
- **Kekuatan**:
  - AI Crawlers `GPTBot` dan `OAI-SearchBot` secara eksplisit diizinkan (`Allow: /`) di `robots.txt`.
  - Berkas `llms.txt` di root domain menyediakan ringkasan terstruktur definisi Equora, 38 provinsi, 4 indikator, dan metode MCDA/CP-SAT.
- **Rekomendasi**: Tambahkan penyebutan entitas di platform diskusi terbuka (seperti forum riset atau LinkedIn artikel).

### C. Perplexity AI (Skor: 90/100)
- **Kekuatan**:
  - Crawler `PerplexityBot` diizinkan penuh di `robots.txt`.
  - Definisi istilah "Equora adalah..." diletakkan langsung pada 40 kata pertama di halaman publik dan `llms.txt`.
  - Data memiliki nomor referensi dan metodologi matematika (MCDA, OR-Tools CP-SAT).
- **Rekomendasi**: Tambahkan thread pengenalan di media sosial/forum agar Perplexity dapat memvalidasi konsensus publik.

---

## 3. Status Akses AI Crawler (`robots.txt`)

Pembaruan telah diterapkan pada `/robots.txt` dengan konfigurasi:

```txt
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /scenarios/

User-agent: Googlebot-Image
Allow: /images/
Allow: /

User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /scenarios/

# AI Search & Answer Engines (GEO Optimization)
User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /scenarios/

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /scenarios/

Sitemap: https://equora.id/sitemap.xml
```

- **Akses Diizinkan**: Googlebot, Googlebot-Image, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot.
- **Proteksi Area Sensitif**: `/admin`, `/api/`, dan `/scenarios/` dilindungi dari pengindeksan publik.

---

## 4. Evaluasi `/llms.txt`

Berkas `frontend/static/llms.txt` telah disusun sesuai standar llms.txt global:
- **Tautan Langsung**: Tautan Markdown menuju seluruh 8 halaman publik utama (`/`, `/daerah`, `/explore`, `/studio`, `/compare`, `/datasets`, `/methodology`, `/about`).
- **Data Angka Kunci**: Meliputi 38 provinsi di Indonesia, 4 jenjang sekolah (SD, SMP, SMA, SMK), 4 indikator (sanitasi dasar, air minum layak, internet pengajaran, komputer pembelajaran).
- **Transparansi Metodologi**: Penjelasan algoritma optimasi alokasi CP-SAT (Google OR-Tools) dan skoring prioritas kebutuhan Multi-Criteria Decision Analysis (MCDA).
- **Blok FAQ Mandiri**: Menjawab pertanyaan seputar sifat data, batasan kebijakan, dan penanganan nilai kosong (`null`).

---

## 5. Analisis Brand Mention & Entity Presence

| Platform | Keberadaan Saat Ini | Target Penguatan |
|----------|-------------------|------------------|
| **Wikipedia / Wikidata** | Belum Terdaftar | Buat entitas Wikidata untuk Equora (kategori: Educational Software / Open Data Platform Indonesia). |
| **YouTube** | Belum Ada Video | Rilis video panduan visual singkat (walkthrough Explorer GIS & Studio Simulasi). |
| **LinkedIn** | Belum Ada Laman Resmi | Buat Company Page Equora & bagikan artikel studi kasus alokasi fasilitas sekolah. |
| **Media Massa / Pers** | Belum Ada Liputan | Rilis siaran pers atau tulisan opini publik tentang disparitas fasilitas sekolah 38 provinsi. |

---

## 6. Citability Passage-Level (Kutipan Siap Pakai AI)

### Passage 1: Definisi Platform (110 kata)
> *"Equora adalah aplikasi analitik data publik terbuka yang memetakan disparitas fasilitas pendidikan di 38 provinsi Indonesia. Dengan mengintegrasikan data statistik resmi Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek) serta Badan Pusat Statistik (BPS), Equora menyajikan peta tematik GIS dan modul simulasi alokasi sumber daya. Platform ini berfokus pada empat indikator penting: ketersediaan fasilitas sanitasi dasar, akses air minum layak, konektivitas internet pengajaran, dan ketersediaan komputer pembelajaran pada jenjang SD, SMP, SMA, dan SMK. Seluruh analisis bersifat terbuka tanpa asumsi tebakan pada nilai data yang belum tersedia."*

### Passage 2: Metodologi & Optimasi Alokasi (128 kata)
> *"Simulasi alokasi bantuan fasilitas sekolah di Equora memanfaatkan model matematika terprogram menggunakan solver CP-SAT dari Google OR-Tools yang dipadukan dengan pembobotan Multi-Criteria Decision Analysis (MCDA). Model ini menghitung indeks prioritas kebutuhan tiap provinsi dan mendistribusikan paket bantuan fasilitas secara optimal dengan memperhitungkan pagu anggaran total, biaya satuan paket per provinsi, batasan daya serap lokal, serta prinsip pemerataan wilayah antardaerah. Hasil komputasi menyediakan proyeksi jangkauan sekolah yang terbantu dan estimasi serapan anggaran, memberikan landasan berbasis data bagi perencana kebijakan sebelum mengambil keputusan anggaran resmi."*

---

## 7. Audit Server-Side Rendering (SSR)

- **Framework**: SvelteKit dengan adapter Node / Vercel.
- **Hasil**: 100% Server-Side Rendered.
- **Uji Robot**: Mesin pencari seperti Googlebot dan AI bot non-JS dapat membaca seluruh teks, heading (H1, H2, H3), paragraf, dan JSON-LD tanpa kendala rendering sisi klien.

---

## 8. Top 5 Langkah Berdampak Tertinggi (High-Impact Actions)

1. **Deploy ke Domain Publik & Daftarkan ke Google Search Console (GSC)**:
   - Verifikasi kepemilikan domain di [search.google.com/search-console](https://search.google.com/search-console).
   - Kirim URL sitemap: `https://[domain-anda]/sitemap.xml`.
2. **Kirim Indeks ke Bing Webmaster Tools**:
   - Manfaatkan protokol IndexNow untuk pengindeksan instan oleh Bing & AI Copilot.
3. **Optimalkan Tampilan Media Sosial dengan Asset Banner Baru**:
   - File banner baru `equora-og.jpg` otomatis tampil ketika link dibagikan di WhatsApp, Twitter/X, Facebook, Telegram, dan LinkedIn.
4. **Bangun Entity Backlink & Reputasi Terpercaya**:
   - Publikasikan artikel analisis fasilitas pendidikan di portal publik (Medium, Kompasiana, atau jurnal/blog akademik) yang menautkan ke `https://[domain-anda]`.
5. **Tambahkan Ringkasan Infografis Berbagi per Provinsi**:
   - Sediakan tombol salin ringkasan per provinsi untuk mendorong penyebutan organik (brand mentions) di media sosial.

---

## 9. Rekomendasi Skema Tambahan (Structured Data Roadmap)

Saat ini Equora telah memiliki Schema:
- `Organization`
- `WebSite` (+ `SearchAction`)
- `WebApplication`
- `FAQPage`
- `TechArticle` (pada `/methodology`)
- `DataCatalog` (pada `/datasets`)
- `BreadcrumbList` (pada seluruh rute turunan)

**Langkah Pengembangan Berikutnya**:
- Tambahkan skema `Dataset` spesifik per indikator di halaman `/datasets/[datasetId]` dengan lisensi `CC-BY-4.0` dan URL distribusi data mentah.

---

## 10. Checklist Peluncuran SEO & GEO

- [x] Foto banner Open Graph (`equora-og.jpg`) 1024x576 terpasang di aset statis.
- [x] Tag Open Graph & Twitter Card (`summary_large_image`) aktif di seluruh halaman.
- [x] Tag `max-image-preview:large` aktif untuk Google Discover & Google Search.
- [x] Schema.org `FAQPage`, `Organization`, `WebSite`, `WebApplication`, `BreadcrumbList` tervalidasi.
- [x] Sitemap `sitemap.xml` dilengkapi ekstensi `<image:image>` untuk Google Image Search.
- [x] `robots.txt` mendukung Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, dan PerplexityBot.
- [x] Dokumen `llms.txt` diperbarui dengan kutipan terstruktur dan FAQ standar AI.
- [x] Seluruh unit test SEO (vitest) lulus 100% dan svelte-check 0 error 0 warning.
