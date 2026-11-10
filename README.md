<p align="center">
  <img src="frontend/static/images/brand/equora-logo.webp" alt="Logo Equora" width="144" height="144">
</p>

<h1 align="center">Equora</h1>

<p align="center">
  Memahami akses fasilitas pendidikan.<br>
  Menelusuri data daerah dan mencoba prioritas alokasi yang dapat dijelaskan.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square" alt="Python 3.14">
  <img src="https://img.shields.io/badge/SvelteKit-2-FF3E00?style=flat-square" alt="SvelteKit 2">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square" alt="PostgreSQL">
</p>

<p align="center">
  <a href="#fitur">Fitur</a> ·
  <a href="#progress-saat-ini">Progress</a> ·
  <a href="#bahasa-dan-teknologi">Teknologi</a> ·
  <a href="#menjalankan-proyek">Instalasi</a> ·
  <a href="#struktur-repository">Struktur</a> ·
  <a href="#tim-dan-kontribusi">Tim</a>
</p>

## Tentang proyek

Equora adalah aplikasi web untuk mengeksplorasi data fasilitas pendidikan di Indonesia, membandingkan kondisi antardaerah, dan menguji skenario alokasi sumber daya. Pengguna dapat menelusuri sumber indikator, mengubah asumsi simulasi, lalu membandingkan hasilnya.

Proyek ini disiapkan untuk Web In Action (WIA), MIA 2026. Antarmuka menggunakan Bahasa Indonesia, dengan penjelasan untuk publik serta rincian metode, sumber, dan batas data.

> **Status:** purwarupa frontend tersedia sebagai pratinjau publik di [equora-tau.vercel.app](https://equora-tau.vercel.app). Layanan data (API FastAPI + PostgreSQL) masih dijalankan secara lokal, sehingga fitur berbasis data pada pratinjau publik memerlukan backend yang aktif. Data workspace berstatus `local_review`; hasil simulasi bukan keputusan anggaran resmi.
>
> Panduan menyambungkan layanan data ke pratinjau publik: [docs/deployment-public.md](docs/deployment-public.md).

## Fitur

Alur aplikasi: **jelajahi kondisi daerah → coba skenario prioritas → baca temuan dan bandingkan skenario**.

| Bagian | Route | Yang dapat dilakukan |
| --- | --- | --- |
| Pendidikan di Daerah Saya | `/daerah` | Profil fasilitas per provinsi, benchmark relatif terhadap median provinsi, perbandingan indikator, penelusuran sumber, dan tautan temuan. |
| Explorer GIS | `/explore` | Peta tematik interaktif (MapLibre GL + PMTiles) untuk nilai indikator, posisi terhadap median, dan kelengkapan data, disertai tabel provinsi serta ekspor CSV. |
| Studio simulasi & Peta Urgensi | `/studio`, `/scenarios/[id]` | Mengatur bobot indikator (MCDA), anggaran, biaya, dan kapasitas (CP-SAT), dilengkapi **Peta GIS Tingkat Urgensi & Sebaran Alokasi Paket** interaktif. |
| Ringkasan temuan | `/studio`, `/compare` | Hasil simulasi sebagai narasi: konsentrasi anggaran, indikator fokus, estimasi sekolah difasilitasi, dan asumsi biaya. |
| Snapshot dan Compare | `/compare` | Menyimpan dan membandingkan dua skenario yang kompatibel, lengkap dengan ekspor Memo Kebijakan PDF. |
| Katalog dan metodologi | `/datasets`, `/methodology` | Metadata dataset, definisi indikator, metode perhitungan, dan batas penggunaannya. |
| Impor admin & Tata kelola | `/admin`, `/admin/login` | Login token admin dengan sesi satu jam; menyiapkan data lokal melalui manifest yang diaudit (SHA-256 & validasi skema ETL Polars). |

### Alur pengguna & batasan peran (User Flow)

Platform memisahkan interaksi antara masyarakat umum, perencana kebijakan/pemerintah, dan administrator data:

| Peran pengguna | Rute utama | Fokus interaksi | Batasan & transparansi |
| --- | --- | --- | --- |
| **Masyarakat Umum** | `/daerah`, `/explore`, `/datasets` | Memantau kondisi fasilitas sekolah provinsi sendiri, membaca peta GIS & benchmark median, serta mengunduh CSV terbuka. | Akses langsung tanpa login; bersifat *read-only* terhadap dataset rilis aktif. |
| **Perencana & Pemerintah** | `/studio`, `/compare`, `/scenarios/[id]` | Menguji simulasi bobot prioritas (MCDA) & optimasi anggaran (CP-SAT), menganalisis peta GIS tingkat urgensi alokasi, uji sensitivitas, dan mengunduh Memo Kebijakan PDF. | Menyimpan *snapshot* skenario terikat versi data (`release_id`) tanpa mengubah data dasar. |
| **Administrator Data** | `/admin` (`POST /api/v1/admin/import`) | Menjalankan *pipeline* ETL Polars untuk memverifikasi *manifest* berkas sumber Kemendikdasmen dan memperbarui *snapshot* rilis. | Dilindungi `Bearer ADMIN_TOKEN`; menolak otomatis (*fail-closed*) berkas yang gagal verifikasi SHA-256 atau struktur sel. |

Seluruh fitur publik dapat digunakan tanpa login atau pendaftaran. Dashboard admin memerlukan login memakai `ADMIN_TOKEN` backend; sesi berakhir setelah satu jam atau saat cookie dihapus melalui tombol keluar. Fitur yang memerlukan data membutuhkan backend, database, dan rilis lokal yang sudah disiapkan. Snapshot berada di workspace bersama dan dapat dibaca pengguna lain yang mengakses aplikasi; jangan menyimpan informasi pribadi di dalamnya.

### Peta situs & wireframe

Peta situs lengkap, alur pengguna per peran, dan inventaris wireframe tersedia di [docs/sitemap.md](docs/sitemap.md). Wireframe interaktif dapat dibuka melalui [docs/wireframe_preview.html](docs/wireframe_preview.html), dengan versi gambar di [docs/wireframe_equora.png](docs/wireframe_equora.png).

## Progress saat ini

Karya sementara yang telah diimplementasikan per tahap First Draft Submission:

- [x] **Landing page (`/`)** — antarmuka responsif, narasi masalah, dan alur eksplorasi awal.
- [x] **Pendidikan di Daerah Saya (`/daerah`)** — profil fasilitas per provinsi, benchmark median pada cakupan sepadan, jenjang sekolah, dan komparasi antardaerah.
- [x] **Explorer peta & data (`/explore`)** — peta tematik MapLibre GL, tabel indikator, filter wilayah, dan ekspor CSV.
- [x] **Studio simulasi (`/studio`)** — bobot prioritas kebutuhan, batasan anggaran, dan kalkulasi alokasi dengan solver optimasi.
- [x] **Ringkasan temuan & estimasi dampak** — narasi hasil simulasi pada Studio dan Compare, serta penjelasan asumsi biaya per paket.
- [x] **Komparasi skenario (`/compare`)** — perbandingan alokasi antar skenario dan pemerataan fasilitas.
- [x] **Katalog dataset & metodologi (`/datasets`, `/methodology`)** — metadata indikator resmi Kemendikdasmen dan batas penggunaan data.
- [x] **Pratinjau frontend publik (`equora-tau.vercel.app`)** — halaman statis dan rute utama dapat diakses sebagai pratinjau.
- [ ] **Layanan data publik (API + PostgreSQL terverifikasi)** — diperlukan agar Explorer GIS, Studio, dan Compare berjalan penuh di pratinjau publik.

## Bahasa dan teknologi

Bahasa utama proyek adalah **TypeScript** pada frontend dan **Python** pada backend. Svelte menyusun komponen antarmuka, CSS mengatur tampilan, dan PowerShell menyediakan perintah pengembangan lintas aplikasi.

| Lapisan | Teknologi | Peran |
| --- | --- | --- |
| Frontend | Svelte 5, SvelteKit 2, TypeScript 5.9 | Halaman publik, workspace, routing, dan integrasi API. |
| Tampilan | Tailwind CSS 4, Carbon Icons | Styling dan ikon antarmuka. |
| Peta dan grafik | MapLibre GL, PMTiles | Peta choropleth provinsi, basemap, dan legenda visual indikator. |
| Backend | Python 3.14, FastAPI, Pydantic 2 | API, validasi input, dan kontrak OpenAPI. |
| Database | PostgreSQL, SQLAlchemy 2, Alembic | Registry dataset, rilis lokal, snapshot, dan migrasi. |
| Pengolahan data | Polars, openpyxl | Membaca workbook, staging, dan pemeriksaan kualitas data. |
| Analisis dan alokasi | MCDA, OR-Tools | Peringkat prioritas dan simulasi alokasi dengan batas anggaran serta kapasitas. |
| Pengujian | pytest, Vitest, Playwright | Pengujian backend, unit frontend, dan alur browser. |
| Tooling | uv, pnpm, Ruff, Docker, GitHub Actions | Dependensi, pemeriksaan kode, container API, dan CI. |

Dependensi dikunci dalam `backend/uv.lock` dan `frontend/pnpm-lock.yaml`.

## Menjalankan proyek

### 1. Persiapan

Siapkan Python **3.14**, Node.js **24.11 atau lebih baru dalam seri 24**, pnpm **11.18.0**, dan uv. Fitur database memerlukan instance PostgreSQL khusus Equora yang dapat diakses.

```sh
git clone https://github.com/mrizalbasri/Equora.git
cd Equora
```

Salin `backend/.env.example` menjadi `backend/.env` dan `frontend/.env.example` menjadi `frontend/.env`. Jangan menimpa konfigurasi lokal yang sudah ada.

- Isi `DATABASE_URL` backend untuk database Equora milikmu. Migrasi tidak berjalan otomatis saat aplikasi dimulai.
- Sesuaikan `API_BASE_URL` frontend dengan alamat API, secara default `http://127.0.0.1:8000`.
- Tidak diperlukan konfigurasi akun atau penyedia login. Seluruh fitur publik dapat diakses langsung.

Compose backend memakai instance dan network PostgreSQL yang sudah ada; Compose tidak membuat server database baru. Lihat [setup backend](backend/README.md) untuk koneksi, target pengujian, dan alternatif Docker.

### 2. Jalankan backend

Di terminal pertama, dari root repository:

```sh
cd backend
uv sync --locked --extra dev
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Setelah database khusus Equora dan koneksinya siap, jalankan `uv run alembic upgrade head` dari folder `backend/`.

### 3. Jalankan frontend

Di terminal kedua, dari root repository:

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

| Alamat lokal | Kegunaan |
| --- | --- |
| [localhost:5173](http://localhost:5173) | Beranda aplikasi. |
| [localhost:5173/daerah](http://localhost:5173/daerah) | Profil dan perbandingan provinsi. |
| [localhost:5173/explore](http://localhost:5173/explore) | Explorer peta dan tabel. |
| [localhost:5173/studio](http://localhost:5173/studio) | Simulasi prioritas dan alokasi. |
| [localhost:8000/docs](http://localhost:8000/docs) | Dokumentasi interaktif API. |
| [localhost:5173/api/health](http://localhost:5173/api/health) | Pemeriksaan koneksi frontend ke backend. |

Petunjuk Windows, macOS/Linux, Corepack, dan konfigurasi lanjutan tersedia di [README frontend](frontend/README.md) serta [README backend](backend/README.md).

## Struktur repository & modularitas

Arsitektur dirancang modular untuk memudahkan pengembangan saat integrasi data publik skala besar (lintas tahun ajaran maupun perluasan cakupan ke tingkat Kabupaten/Kota):

```text
Equora/
├── frontend/                  Aplikasi SvelteKit 2 & TypeScript 5.9
│   └── src/
│       ├── routes/            Halaman publik, studio, perbandingan, dan admin
│       ├── lib/api/           Klien API & kontrak OpenAPI tergenerasi (schema.d.ts)
│       ├── lib/maps/          Adapter GIS murni (priority-map.ts) & tile PMTiles/MapLibre
│       ├── lib/insight/       Kalkulator analitik murni (konsentrasi, dampak sekolah)
│       └── lib/components/    Komponen modular (ProvinceMap, ScenarioResult, DecisionReview)
├── backend/                   API FastAPI & Python 3.14
│   └── app/
│       ├── api/               Endpoint workspace, decision views, dan health check
│       ├── etl/               Pipeline ingest Polars & validator fail-closed (SHA-256, sel, BPS)
│       ├── analysis/          Mesin skor kebutuhan MCDA (priority.py)
│       ├── optimization/      Solver OR-Tools CP-SAT & pembanding baseline (allocation.py, coverage.py)
│       ├── services/          Ringkasan wilayah, tinjauan keputusan, geometri, Memo Kebijakan PDF
│       ├── db/                Session, registry, dan base SQLAlchemy
│       └── core/              Konfigurasi, write guard, dan otorisasi admin
├── data/                      Metadata sumber, fixture sintetis, dan panduan data
├── scripts/                   Skrip pengujian dan alat pengembangan
└── .github/                   Workflow CI serta template issue dan pull request
```

## Pemeriksaan pengembangan

Backend, dari folder `backend/`:

```sh
uv run ruff check .
uv run pytest
```

Frontend, dari folder `frontend/`:

```sh
pnpm check
pnpm test
pnpm check:api
pnpm build
```

Untuk tes browser, jalankan `pnpm exec playwright install chromium` sekali, lalu `pnpm test:e2e` setelah build. Tes database memerlukan `TEST_DATABASE_URL` yang menunjuk ke target pengujian khusus. Lihat [perintah repository](scripts/README.md) untuk pemeriksaan gabungan serta laporan pengujian.

## Panduan kontribusi

Untuk petunjuk pengujian, alur pull request, dan standar kode, lihat [CONTRIBUTING.md](CONTRIBUTING.md) serta [Panduan data](data/README.md).

## Data dan batas penggunaan

- Indikator berasal dari agregat provinsi. Angka tersebut tidak menggambarkan kondisi setiap sekolah atau membuktikan penyebab kesenjangan.
- Median provinsi merupakan pembanding deskriptif, bukan ambang kelayakan atau rekomendasi kebijakan.
- Data tahunan disertai periode dan sumber. Data ini bukan data real-time.
- Biaya dan paket intervensi pada simulasi merupakan asumsi demo. Hasil alokasi bukan keputusan anggaran resmi atau bukti dampak pendidikan.
- Workbook sumber dan hasil olahan lokal tidak disertakan di Git. Repository menyimpan metadata, checksum, dan fixture sintetis; izin redistribusi sumber masih perlu diverifikasi.
- Rilis data publik, deployment, dan evaluasi bersama calon pengguna masih merupakan pekerjaan terpisah.

## Tim dan kontribusi

| Kontributor | GitHub |
| --- | --- |
| M. Rizal Basri | [@mrizalbasri](https://github.com/mrizalbasri) |
| Sheiren Arnelia | [@sheirenarnelia](https://github.com/sheirenarnelia) |

Mulai pekerjaan pada branch terpisah, gunakan Conventional Commits, dan ajukan pull request sesuai [panduan kontribusi](CONTRIBUTING.md). Logo pada README memakai aset asli Equora yang juga digunakan oleh aplikasi.

## Lisensi

Kode sumber Equora dilisensikan di bawah [Lisensi MIT](LICENSE). Ketentuan penggunaan dataset tetap mengikuti lisensi dan kebijakan instansi sumber masing-masing.
