# Setup fondasi stack

Keputusan implementasi: 19 Oktober 2026. Struktur memakai folder `frontend/`, `backend/`, dan `data/`. Sesuai keputusan terbaru pengguna, frontend berjalan langsung melalui pnpm; Compose hanya tersedia untuk backend.

- Backend: FastAPI/Pydantic, SQLAlchemy/Alembic, PostgreSQL; modul ETL, MCDA dan optimasi terpisah dari HTTP.
- Frontend: SvelteKit/TypeScript/Tailwind; dependensi ECharts, MapLibre dan PMTiles tersedia untuk implementasi fitur berikutnya.
- Data: raw dan processed tidak masuk Git; fixture sintetis boleh masuk Git.
- Kontrak: OpenAPI dari backend diekspor dan menjadi sumber tipe TypeScript. CI memeriksa sinkronisasi kedua artefak.
- Lingkungan: Node 24, pnpm 11.18.0, Python 3.14, instance PostgreSQL 18/pgvector yang sudah ada di Docker (`postgres-local`); pnpm lock dan uv lock mengunci dependensi.
- Pemeriksaan: health endpoint, kegagalan database yang menghasilkan 503, batas CORS, smoke test Polars/openpyxl/OR-Tools, round-trip migrasi PostgreSQL, typecheck, unit test, build dan pemeriksaan HTTP hasil build frontend.

Frontend berjalan lokal melalui `pnpm dev`; API dapat berjalan lokal atau melalui Compose backend. PostgreSQL memakai instance bersama yang sudah ada. Compose Equora tidak membuat PostgreSQL, volume database, atau database baru. API memakai network eksternal `tera_default`; migrasi tersedia pada profile `tools` dan hanya dijalankan manual setelah target Equora disiapkan.

Belum ada tabel domain, dataset publik, perhitungan MCDA, model alokasi produk, halaman produk, atau basemap yang diimplementasikan. Migrasi awal hanya menyiapkan riwayat Alembic. Integrasi peta/data mengikuti gerbang pada [rencana peta](map-plan.md) dan [kesiapan data](data-readiness.md).

SvelteKit 2.70 dipilih agar TypeScript 5.9 tetap kompatibel dengan `openapi-typescript` 7.13. Saat setup, SvelteKit 3 memerlukan TypeScript 6 dan generator tersebut masih menyatakan peer TypeScript 5. Tidak menggunakan `--force` atau mengabaikan peer dependencies.

Dependensi transitive `cookie` untuk SvelteKit dipatch ke 0.7.2 melalui override pada `frontend/pnpm-workspace.yaml` untuk menangani GHSA-pxg6-pf52-xh8x. MapLibre menggunakan 6.15 atau lebih baru untuk menghindari GHSA-jrc7-96c5-q579. Evaluasi ulang override ketika generator mendukung TypeScript yang diperlukan SvelteKit 3.

Panduan perintah: [backend](../backend/README.md), [frontend](../frontend/README.md), [struktur data](../data/README.md).

Referensi konfigurasi: [SvelteKit](https://svelte.dev/docs/kit/migrating-to-sveltekit-3), [FastAPI Settings](https://fastapi.tiangolo.com/advanced/settings/).

## Hasil verifikasi lokal

Riwayat verifikasi setup awal pada 19 Oktober 2026 di Windows dan Docker Linux, sebelum penyesuaian ke PostgreSQL bersama:

| Pemeriksaan | Hasil |
|---|---|
| pytest dengan PostgreSQL khusus test | 6 lulus, termasuk upgrade/downgrade/upgrade Alembic |
| Ruff lint dan format | Lulus |
| Dependensi Python | `pip check` lulus |
| TypeScript/Svelte | 0 error dan 0 warning dari `svelte-check` |
| Unit test frontend | 2 lulus |
| Playwright HTTP hasil build | 1 lulus |
| Kontrak API | OpenAPI diekspor; tipe TypeScript hasil generate sinkron |
| Audit dependency setup awal | 0 kerentanan dilaporkan setelah pembaruan dependensi |
| Docker | Kedua image berhasil dibangun; web, API dan PostgreSQL healthy; migrasi exit 0 |
| Integrasi container | Frontend ke API HTTP 200; readiness API ke PostgreSQL HTTP 200 |
| Dependensi analisis dalam Linux | Polars/openpyxl berhasil diimpor; CP-SAT menyelesaikan kasus sintetis kecil |
| Dokumentasi | Pemeriksa tautan lokal dan `git diff --check` lulus |

Starlette memberi satu peringatan deprecation terkait transport httpx pada test client; seluruh tes backend tetap lulus. Workflow GitHub Actions sudah dikonfigurasi tetapi belum dijalankan di GitHub.

Koreksi pengguna: container PostgreSQL dan migrasi buatan setup awal sudah dihentikan dan dibersihkan, volume database lamanya dipertahankan. Konfigurasi memakai server `postgres-local` yang sudah ada di port 5434 dan network `tera_default`. Pada 21 Oktober 2026, database khusus `equora` dan `equora_test` dibuat pada instance yang sama sesuai persetujuan pengguna; [registry draft](dataset-registry.md) menjelaskan migrasi dan tes aktual. Tidak ada migrasi terhadap database proyek lain. API tetap dapat berjalan tanpa koneksi target; readiness mengembalikan 503 bila koneksi belum dikonfigurasi. Frontend tetap di 5173 dan port API mengikuti konfigurasi lokal.

Verifikasi setelah koreksi: koneksi read-only `SELECT 1` ke server bersama lulus; 6 tes backend lulus dan 1 tes migrasi dilewati karena target pengujian belum dikonfigurasi; Ruff lulus. CI tidak membuat server/database PostgreSQL; uji migrasi memerlukan target test yang disiapkan tersendiri.

Frontend kemudian dipindahkan ke pnpm 11.18.0 sesuai permintaan pengguna: lockfile dikonversi ke `pnpm-lock.yaml`, konfigurasi override dipindahkan ke `pnpm-workspace.yaml`, dan lockfile npm dihapus. Dockerfile, CI, Playwright dan seluruh petunjuk frontend memakai pnpm. Instalasi frozen lockfile, typecheck, kontrak API, 2 unit test, 1 tes HTTP, build lokal dan build image Docker lulus. `pnpm audit` melaporkan 0 kerentanan. Container frontend tidak dijalankan sebagai bagian migrasi ini; server preview sementara untuk tes dihentikan setelah tes selesai.

Keputusan terbaru: Docker frontend dihapus. `frontend/Dockerfile`, `frontend/compose.yaml`, `.dockerignore`, dan langkah validasi Compose frontend di CI dihapus. Panduan aktif menggunakan `pnpm dev` dan `API_BASE_URL` ke port backend yang dipublikasikan. Hasil build Docker di atas merupakan riwayat setup sebelumnya.

Perapian root: stub BRD/PRD/DESIGN di root dihapus; dokumen utama tetap di `docs/`. Contoh struktur PRD diselaraskan dengan folder aktual. [Skrip PowerShell repository](../scripts/README.md) menyediakan `dev`, `frontend`, `backend`, `check`, `test`, dan `openapi` dari root. Compose tetap hanya di backend, frontend memakai pnpm, dan skrip tidak membuat database atau menjalankan migrasi otomatis. Alat lintas repository berada di `scripts/`; alat khusus frontend tetap di `frontend/scripts/`.
