# Equora

Platform web untuk membandingkan akses fasilitas pendidikan dari data publik dan menguji simulasi prioritas alokasi sumber daya yang dapat dijelaskan. Disiapkan untuk Web In Action (WIA), MIA 2026.

**Status workspace 21 Oktober 2026: Explorer, peta 38 provinsi, katalog API, Studio, snapshot, Compare, ekspor CSV/PDF dan impor admin lokal tersedia pada branch integrasi.** Sepuluh workbook pengguna menghasilkan 2.280 observasi berstatus `local_review`. Hosting dan release publik belum disiapkan; branch belum otomatis digabung ke main. Ikuti [panduan workspace lokal](docs/local-workspace.md) dan [audit kesiapan](docs/implementation-readiness.md).

**Pembaruan lokal 24 Oktober 2026:** [Pendidikan di Daerah Saya](docs/public-region.md) tersedia di `/daerah`: profil provinsi, perbandingan fasilitas, berbagi temuan dan melanjutkan ke Studio pada rilis yang sama. Ringkasan hasil simulasi membedakan jangkauan wilayah dari pemerataan antarsekolah serta tidak menyimpulkan penyebab alokasi tanpa bukti.

## Dokumentasi

Mulai dari [indeks docs](docs/README.md) dan [evaluasi kesesuaian lomba](docs/competition-alignment.md).

Dokumen utama hanya disimpan di `docs/`: [BRD](docs/BRD_Equora.md), [PRD](docs/PRD_Equora.md), dan [desain](docs/DESIGN_Equora.md).

Tema visual terbaru: **Clean Education Blue (DESIGN v1.2)**, disetujui 20 Oktober 2026. Landing/About memakai panel putih, latar abu-abu sangat muda dan biru utama; diagram serta dokumen System Design mengikuti palet yang sama.

Untuk kontributor yang mulai coding, ikuti [panduan mengambil fondasi](docs/pembagian-kerja/MULAI-NGODING.md). Fondasi UI publik tersedia dalam [panduan UI](docs/ui-foundation.md); kontrak workspace terdapat pada OpenAPI dan tipe TypeScript hasil generate.

## Stack

SvelteKit, TypeScript, Tailwind CSS, ECharts, MapLibre/PMTiles; FastAPI, PostgreSQL, SQLAlchemy/Alembic; Polars, openpyxl dan OR-Tools. Manifest dan lockfile tersedia di masing-masing aplikasi. Pemilihan solver final menunggu audit model/data dan benchmark. Lihat [alasan, alternatif dan protokol pembuktian](docs/technical-stack.md).

## Menjalankan project

Clone [repository Equora](https://github.com/mrizalbasri/Equora), lalu siapkan Node.js 24, pnpm 11.18.0, Python 3.14, uv dan Docker Desktop yang berjalan. PostgreSQL memakai instance Docker yang sudah ada, bukan server baru dari Compose Equora. Petunjuk lengkap: [backend](backend/README.md), [frontend](frontend/README.md), dan [data](data/README.md).

### macOS/Linux

Jalankan dari root repository. Terminal pertama menjalankan API:

```sh
cd backend
python3 -m pip install --user uv  # hanya jika uv belum tersedia
uv sync --locked --extra dev
cp -n .env.example .env
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal kedua menjalankan frontend:

```sh
cd frontend
pnpm install --frozen-lockfile
cp -n .env.example .env
pnpm dev
```

`cp -n` tidak menimpa `.env` yang sudah disesuaikan. Frontend tersedia di http://localhost:5173 dan API docs di http://localhost:8000/docs. Root menampilkan landing page; `/about`, `/datasets`, dan `/methodology` tersedia. Status server web tersedia di `/health`. Periksa koneksi frontend ke API di http://localhost:5173/api/health.

### Windows PowerShell

```powershell
cd backend
python -m pip install uv
uv sync --locked --extra dev
Copy-Item .env.example .env
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Di terminal kedua:

```powershell
cd frontend
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
```

Pasang uv bila belum tersedia dengan `python -m pip install uv`. Jangan menimpa `.env` yang sudah disesuaikan. Jika pnpm belum tersedia, aktifkan pnpm 11.18.0 melalui Corepack seperti dijelaskan di [panduan frontend](frontend/README.md). Frontend tersedia di http://localhost:5173 dan API docs di http://localhost:8000/docs. Root frontend menampilkan landing page; `/about` menjelaskan tujuan dan batas penggunaan. Status server web tetap tersedia di `/health`. Periksa koneksi frontend ke API di http://localhost:5173/api/health.

Frontend dijalankan langsung melalui `pnpm dev`. Untuk menjalankan API dalam container, jalankan `docker compose up --build -d` dari `backend/`; file Compose hanya tersedia di backend. API memakai network PostgreSQL yang sudah ada. Database lokal `equora` dan `equora_test` sudah disiapkan pada instance tersebut; [registry draft dan panduan migrasi](docs/dataset-registry.md) menjelaskan target dan pengujiannya. Koneksi tetap di `.env` lokal dan migrasi dijalankan manual.

Migrasi awal membentuk riwayat Alembic; migrasi `0002` menambah registry draft untuk menyimpan hasil staging, bukan release publik. Test memakai data sintetis; file sumber nyata dan artefak olahannya tetap di luar Git.

Setelah dependensi terpasang dan `.env` disiapkan, perintah berikut dapat dijalankan dari root menggunakan PowerShell:

```powershell
.\scripts\equora.ps1 dev
.\scripts\equora.ps1 check
.\scripts\equora.ps1 test
.\scripts\equora.ps1 openapi
```

`dev` menjalankan API Docker di background dan frontend lokal pada terminal yang sama. Ctrl+C menghentikan frontend; API tetap berjalan. Tidak ada database atau migrasi yang dibuat otomatis. Detail semua perintah dan pembagian alat tersedia di [panduan scripts](scripts/README.md).

Untuk memeriksa tautan dokumentasi dengan Python 3:

```sh
python scripts/check_docs.py
```

Untuk menjalankan tes E2E frontend secara lokal, unduh Chromium Playwright
sekali dari folder `frontend/`:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

## Progress

- [x] BRD, PRD dan baseline desain.
- [x] Evaluasi materi Technical Meeting dan checklist submission.
- [x] Struktur docs, template issue/PR, dan workflow pemeriksaan docs.
- [x] Fondasi backend/frontend, Compose backend, migrasi awal, kontrak OpenAPI dan CI stack.
- [x] Panduan clone, setup dan menjalankan fondasi pada macOS/Linux serta Windows.
- [x] Audit awal empat file dataset dan join provinsi; [hasil dan batasan](docs/source-audit-2026-10-19.md).
- [ ] Verifikasi ketentuan penggunaan dan persetujuan release data.
- [x] Landing page dan About responsif dengan penjelasan sumber/metode serta status fitur yang belum tersedia.
- [x] Katalog dan detail dataset memakai fixture berlabel; halaman metodologi sandbox.
- [ ] Explorer berjalan dengan release data terverifikasi.
- [ ] Simulasi, perbandingan skenario, dan pengujian.
- [x] Repository publik [mrizalbasri/Equora](https://github.com/mrizalbasri/Equora).
- [ ] Deployment, screenshot, PDF dan video submission.

## Batasan

Hasil alokasi adalah simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi. Data tahunan ditampilkan dengan tahun dan waktu pengambilan; tidak disebut real-time. Empat file telah diunduh lokal dan diaudit; metadata/hash tersedia di repository, raw data diabaikan Git. Belum ada release data yang disetujui. Pratinjau landing belum terhubung ke engine dan tidak menampilkan hasil wilayah atau alokasi nyata.

Lihat [panduan kontribusi](CONTRIBUTING.md) dan [setup GitHub](docs/github-setup.md). Lisensi publikasi kode belum dipilih pemilik project; repository publik tidak otomatis memberi izin penggunaan ulang.
