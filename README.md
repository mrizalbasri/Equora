# Equora

Platform web untuk membandingkan akses fasilitas pendidikan dari data publik dan menguji simulasi prioritas alokasi sumber daya yang dapat dijelaskan. Disiapkan untuk Web In Action (WIA), MIA 2026.

**Status 20 Oktober 2026: fondasi backend/frontend, priority engine, allocation engine, dan landing/about interaktif tersedia; explorer, skenario, serta release dataset resmi belum terintegrasi ke main.**

## Dokumentasi

Mulai dari [indeks docs](docs/README.md) dan [evaluasi kesesuaian lomba](docs/competition-alignment.md).

Dokumen utama hanya disimpan di `docs/`: [BRD](docs/BRD_Equora.md), [PRD](docs/PRD_Equora.md), dan [desain](docs/DESIGN_Equora.md).

Tema visual terbaru: **Clean Education Blue (DESIGN v1.2)**, disetujui 20 Oktober 2026. Landing/About memakai panel putih, latar abu-abu sangat muda dan biru utama; diagram serta dokumen System Design mengikuti palet yang sama.

Untuk kontributor yang mulai coding, ikuti [panduan mengambil fondasi](docs/pembagian-kerja/MULAI-NGODING.md). Pekerjaan frontend dapat dimulai tanpa database; fondasi UI publik tersedia dalam [panduan UI](docs/ui-foundation.md), sedangkan kontrak katalog belum tersedia.

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

`cp -n` tidak menimpa `.env` yang sudah disesuaikan. Frontend tersedia di http://localhost:5173 dan API docs di http://localhost:8000/docs. Root frontend saat ini berupa JSON status fondasi, belum halaman produk. Periksa koneksi frontend ke API di http://localhost:5173/api/health.

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

Frontend dijalankan langsung melalui `pnpm dev`. Untuk menjalankan API dalam container, jalankan `docker compose up --build -d` dari `backend/`; file Compose hanya tersedia di backend. API memakai network PostgreSQL yang sudah ada. Database/schema Equora belum dibuat; isi koneksi setelah target disiapkan, lalu jalankan migrasi secara manual sesuai panduan backend.

Belum ada seed statistik atau tabel domain sebelum audit dataset. Migrasi awal hanya membentuk riwayat Alembic. Test memakai data sintetis sementara.

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
- [ ] Audit file dataset dan lisensi.
- [x] Landing page dan About responsif dengan penjelasan sumber/metode serta status fitur yang belum tersedia.
- [ ] Explorer berjalan dengan release data terverifikasi.
- [ ] Simulasi, perbandingan skenario, dan pengujian.
- [x] Repository publik [mrizalbasri/Equora](https://github.com/mrizalbasri/Equora).
- [ ] Deployment, screenshot, PDF dan video submission.

## Batasan

Hasil alokasi adalah simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi. Data tahunan ditampilkan dengan tahun dan waktu pengambilan; tidak disebut real-time. Belum ada dataset yang diunduh atau diverifikasi dalam repository ini.

Lihat [panduan kontribusi](CONTRIBUTING.md) dan [setup GitHub](docs/github-setup.md). Lisensi publikasi kode belum dipilih pemilik project; repository publik tidak otomatis memberi izin penggunaan ulang.
