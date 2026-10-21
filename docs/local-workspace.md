# Menjalankan workspace lokal

Paket ini mengintegrasikan pratinjau publik, staging, registry PostgreSQL, audit sepuluh workbook dan halaman metodologi. Targetnya aplikasi lokal sesuai keputusan pengguna; hosting belum dipilih. PR yang terbuka tetap direview pemilik sebelum merge ke main.

## Data dan database

- Input: sepuluh workbook pengguna di `data/datamentah/`, dengan nama dan SHA-256 pada `data/metadata/additional-source-candidates.json`. Workbook dan hasil observasi tidak dimasukkan ke Git.
- Scope: 38 provinsi × enam jenjang × sepuluh indikator = 2.280 observasi pada kolom Total, tahun ajaran 2025/2026. Negeri/Swasta tidak dicampur dengan Total. Agregat nasional/Luar Negeri dikeluarkan.
- Internet/komputer berupa pecahan persen Excel dikalikan 100 sekali; air/sanitasi sudah berupa poin persentase. Header denominator SD/Total adalah AA, indikator I. Missing tetap null; denominator nol bukan kebutuhan 100%.
- PostgreSQL memakai container `postgres-local` yang sudah ada, port host `5434`. Aplikasi memakai database `equora`, pengujian memakai `equora_test`, dengan owner terpisah. Koneksi dan token hanya di `.env`; tidak ada instance PostgreSQL baru.
- Status tetap `local_review`. Tanggal unduh pengguna tidak diketahui; lisensi redistribusi belum diverifikasi. Snapshot lokal bukan persetujuan publikasi.

## Persiapan

Konfigurasikan `backend/.env` dan `frontend/.env` mengikuti contoh masing-masing. Jangan menimpa konfigurasi yang sudah berisi koneksi. `API_BASE_URL` frontend harus sama dengan port API host, misalnya `http://127.0.0.1:18000` untuk konfigurasi lokal pengguna ini; port default contoh adalah 8000.

Dari root repository:

```powershell
python scripts/fetch_local_boundary.py
cd backend
uv sync --locked --extra dev
uv run alembic upgrade head
uv run python -m app.etl.prepare_local
docker compose up --build -d api
cd ../frontend
pnpm install --frozen-lockfile
pnpm dev
```

`prepare_local` hanya menerima database bernama `equora`. Import ulang snapshot yang sama tidak menambah duplikat. Hash diperiksa sebelum workbook dibaca dari bytes yang sama. Migrasi `0003` menambah `local_releases` dan `scenario_snapshots`; downgrade menghapus kedua tabel beserta snapshotnya, sehingga simpan backup sebelum downgrade database yang berisi pekerjaan.

Frontend: [beranda lokal](http://localhost:5173), [Explorer](http://localhost:5173/explore), [Studio](http://localhost:5173/studio), [Compare](http://localhost:5173/compare), [katalog](http://localhost:5173/datasets), [admin](http://localhost:5173/admin). API docs konfigurasi pengguna: [Swagger lokal](http://localhost:18000/docs).

## Alur penggunaan

1. Explorer: pilih indikator dan jenjang, cari provinsi, urutkan tabel, pilih wilayah dari peta atau tombol tabel. Nilai, denominator, sel sumber, kualitas dan provenance dapat ditelusuri; CSV mengikuti filter.
2. Studio: tentukan bobot empat indikator (persen bulat, total 100), wilayah, anggaran, biaya paket, kapasitas dan minimum. Penyesuaian per wilayah tersedia. Biaya/kapasitas selalu berlabel asumsi demo. Satu paket tidak diklaim sama dengan satu sekolah terbantu.
3. Hasil: peringkat/kontribusi, wilayah exclude, status solver, bound/gap, penggunaan anggaran dan baseline merata/greedy. Snapshot menyimpan parameter, input, nama wilayah, sumber dan versi metode/model/solver. Tidak ada endpoint edit snapshot.
4. Compare: pilih dua snapshot kompatibel. Baca perubahan paket, peringkat, anggaran dan coverage wilayah penerima. Perbedaan bobot/scope diberi peringatan; objective tidak diklaim sebagai dampak. PDF perbandingan menyertakan parameter kedua skenario dan sumber.
5. Admin: masukkan `ADMIN_TOKEN` lokal untuk mengimpor ulang manifest yang diaudit. Token tidak disimpan di browser. Berkas berubah harus diaudit ulang; halaman ini tidak menerima upload arbitrer atau memublikasikan data.

API `/api/v1/` diproksikan server SvelteKit; URL database dan token admin tidak masuk bundle frontend. Write dibatasi 64 KiB dan satu permintaan aktif per proses. Origin browser harus tercatat pada `CORS_ORIGINS`; contoh mendukung localhost dan 127.0.0.1 port 5173. Snapshot guest dapat dibaca pengguna lokal melalui ID UUID; ini belum sistem akun/private share untuk deployment publik.

## Peta

Boundary komunitas dipin ke commit/hash dalam `data/metadata/boundary-local.json`, dengan atribusi Deny Herianto dan CC BY 4.0. [Lisensi sumber](https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/blob/80aa4a90ac7eef5136eaa2b551b6aa5d198be27d/DATA_LICENSE.md) mencatat ketidakpastian sumber upstream; verifikasi lebih lanjut diperlukan sebelum redistribusi publik. Geometry tidak diklaim sebagai batas resmi. Aset mentah diunduh lokal, tidak dikomit.

Crosswalk eksplisit menggunakan feature ID, bukan `KODE_PROV` yang berulang pada provinsi Papua baru. Pemetaan 91-A→91, 92-A→92, 91-C→93, 91-D→94, 91-B→95, 92-B→96; 32 wilayah lain dipetakan eksplisit satu per satu. Hash, jumlah fitur, nama dan keunikan kode diperiksa sebelum disajikan.

MapLibre memakai GeoJSON lokal tanpa basemap/PMTiles; tidak memerlukan layanan peta eksternal saat runtime. Worker v6 dibundel memakai `?worker&url` dan `setWorkerUrl`, mengikuti [panduan Vite resmi](https://maplibre.org/maplibre-gl-js/docs/). WebGL/aset gagal menampilkan status dan retry khusus peta, dengan tabel, filter, detail serta CSV tetap tersedia. Nilai missing/di luar filter berwarna abu-abu, terpisah dari nol.

## Validasi dan batas penyelesaian

Tes backend memakai fixture sintetis; tes transaksi hanya pada `equora_test` dan di-rollback. E2E port 4173 memakai respons sintetis berlabel melalui route mocking, sehingga tidak bergantung pada workbook pengguna atau database. Smoke browser terpisah memakai API Docker dan data asli, meliputi peta siap, 38 baris, Studio → snapshot → PDF → Compare serta mobile tanpa overflow.

```powershell
cd backend
uv run python ../scripts/test_postgres.py -q
uv run ruff check .
uv run ruff format --check .
cd ../frontend
pnpm check
pnpm check:api
pnpm test
pnpm build
pnpm test:e2e
```

Belum termasuk hosting/domain, akun multiuser/role produksi, upload sumber baru/publish, backup/restore operasional produksi, basemap PMTiles, validasi biaya/fairness kebijakan, benchmark kapasitas representatif, atau submission lomba. Semua itu tetap dibedakan dari alur aplikasi lokal yang dapat dijalankan. Sumber resmi, identitas tim dan ketentuan kompetisi tidak diisi dengan data rekaan.
