# Pemeriksaan kesiapan produksi Equora

Tanggal: 28 Oktober 2026. Target: working tree lokal `D:\Coding\Equora`,
branch `main`, basis commit `6176831f9335d5c6e986b47503807d1137e50c4b`.
Perubahan lokal yang sudah ada dipertahankan. Pemeriksaan ini tidak mengubah kode
aplikasi, konfigurasi privat, database, remote, atau deployment.

## Keputusan

**Belum layak dinyatakan siap produksi publik.** Build dan tes aplikasi lulus,
tetapi koneksi database lokal gagal, integrasi PostgreSQL belum diuji pada sesi
ini, dan kesiapan deployment serta operasi produksi belum dibuktikan.
Kegagalan lokal bukan bukti bahwa suatu server produksi juga gagal.

## Hasil pemeriksaan yang dijalankan

| Pemeriksaan | Hasil |
| --- | --- |
| `pnpm check` | 0 error, 0 warning |
| `pnpm test` | 11 tes lulus dalam 3 file |
| `pnpm check:api` | Tipe TypeScript sinkron dengan OpenAPI |
| `pnpm build` | Berhasil; adapter Node |
| `pnpm exec playwright test --workers=2` | 60 lulus; alur data memakai fixture sintetis |
| Backend `.venv/Scripts/python.exe -m pytest -q` | 182 lulus, 19 dilewati, 1 warning deprecation TestClient |
| Backend Ruff lint dan format | Lulus; 48 file sudah terformat |
| `git diff --check` sebelum penambahan laporan | Lulus |
| Docker daemon | Tidak dapat dihubungi pada named pipe Docker Desktop Linux |
| Koneksi TCP ke target database lokal yang dikonfigurasi | Tidak dapat dihubungi |
| Koneksi SQLAlchemy ke database yang dikonfigurasi | Gagal: `OperationalError`; detail koneksi tidak dicetak |
| GET `/api/v1/health/live` melalui TestClient dengan konfigurasi aktual | 200 |
| GET `/api/v1/health/ready` melalui TestClient dengan konfigurasi aktual | 503 |
| GET `/api/v1/workspace` melalui TestClient dengan konfigurasi aktual | 503: database belum siap |

Tes HTTP memakai lifespan aplikasi aktual dan engine database dari konfigurasi
lokal, bukan override database fixture. Tes terfokus snapshot PostgreSQL juga
mengonfirmasi skip karena `TEST_DATABASE_URL` tidak disetel pada proses pytest.
Tidak menjalankan migrasi atau import untuk memperbaiki lingkungan.

CI GitHub terbaru yang diperiksa sukses untuk commit basis tersebut:
[Stack checks](https://github.com/mrizalbasri/Equora/actions/runs/40283359741).
CI itu tidak mencakup perubahan working tree yang belum dikomit.
API GitHub Deployments mengembalikan daftar kosong dan homepage repository
kosong. Ini tidak membuktikan tidak ada hosting melalui jalur lain.

## Kekurangan dan kriteria selesai

| Prioritas | Status dan bukti | Pekerjaan yang diperlukan | Kriteria selesai |
| --- | --- | --- | --- |
| P0 | Terbukti: database lokal tidak terjangkau, ready/workspace 503 | Pulihkan layanan PostgreSQL yang memang digunakan, periksa migrasi dan rilis data | Ready dan workspace 200; data yang dipilih bisa dibaca tanpa fixture |
| P0 | Terbukti pada source: data dibuat sebagai `local_review`; metadata menyatakan tanggal unduh dan lisensi redistribusi belum diverifikasi | Verifikasi sumber, izin publikasi, provenance boundary dan proses penerbitan data | Ada keputusan publikasi dan metadata yang dapat ditelusuri; label review tidak sekadar diganti menjadi published |
| P1 | Terbukti: tes integrasi PostgreSQL dilewati; workflow Stack checks tidak menyediakan service PostgreSQL maupun `TEST_DATABASE_URL` | Jalankan tes dengan database khusus `equora_test`, lalu jadikan gerbang CI | Tes registry/transaksi/snapshot benar-benar dieksekusi dan lulus, tanpa menyentuh database aplikasi |
| P1 | Terbukti pada source: Compose mengecek `/health/live`, readiness hanya `SELECT 1`, frontend `/health` selalu 200 | Pertahankan liveness untuk proses; gunakan readiness database/skema/rilis untuk routing dan alert | Gangguan DB, migrasi tertinggal, atau rilis hilang terdeteksi sebagai aplikasi belum siap |
| P1 | Terbukti pada source: WriteGuard membatasi body 64 KiB dan satu POST aktif per proses, tetapi belum menyediakan kuota permintaan per pengunjung atau batas penyimpanan snapshot | Tetapkan pembatasan penggunaan dan retensi sesuai kapasitas hosting, lalu uji beban | Batas permintaan/penyimpanan terukur dan perilaku saat sibuk jelas; kapasitas beberapa pengguna terbukti |
| P1 | Perilaku produk terkonfirmasi: snapshot disimpan dan didaftarkan dalam workspace bersama tanpa akun | Pertahankan akses publik; jelaskan keterbukaan nama/parameter sebelum menyimpan dan tetapkan retensi | Pengguna mengetahui skenario bersifat publik; kebijakan penyimpanan diterapkan. Login bukan syarat otomatis |
| P1 | Belum terverifikasi: target hosting/domain, HTTPS, konfigurasi origin/proxy, DB persistence dan izin minimum | Siapkan staging yang mewakili deployment final dan catat konfigurasi operasional tanpa rahasia | Alur data nyata berfungsi melalui domain HTTPS, tetap tersimpan setelah restart, origin dan impor admin diverifikasi |
| P1 | Belum ditemukan bukti operasional pada repository: backup terjadwal, uji restore, alert dan rollback | Siapkan backup, pemulihan, pemantauan dan prosedur rilis | Restore diuji pada target terpisah; alert mendeteksi gangguan; rollback kode/migrasi punya prosedur yang jelas |
| P2 | Terlihat pada audit UI sesi sebelumnya dan source: error konteks Studio berada setelah formulir; kegagalan pemuatan dapat terlihat seperti nol skenario | Pisahkan loading/error/empty, tampilkan kegagalan lebih awal dan sediakan retry | Gangguan API tidak ditampilkan sebagai koleksi kosong; pengguna memahami tombol hitung yang nonaktif |

Source utama: `backend/app/api/health.py`, `backend/compose.yaml`,
`backend/app/core/write_guard.py`, `backend/app/api/workspace.py`,
`backend/app/etl/local_release.py`, `data/metadata/boundary-local.json`,
`frontend/src/routes/health/+server.ts`, `frontend/src/routes/studio/+page.svelte`,
`frontend/src/routes/api/v1/[...path]/+server.ts`, `.github/workflows/stack.yml`,
dan `docs/public-access.md`.

## Urutan menuju rilis

1. Pulihkan database lokal dan verifikasi migrasi/rilis; jalankan tes PostgreSQL
   pada database pengujian khusus.
2. Selesaikan gerbang publikasi data dan keterbukaan snapshot publik.
3. Perbaiki indikator readiness, penanganan error UI dan batas penggunaan.
4. Deploy staging; uji profil daerah, sumber, dua skenario yang benar-benar
   dihitung, buka ulang snapshot, bandingkan, ekspor PDF/CSV dan restart layanan.
5. Buktikan backup/restore, alert, rollback dan kapasitas yang ditargetkan.

## Batas kesimpulan

Tidak dilakukan deployment, migrasi, import, perubahan akun/secret,
benchmark beban, pemindaian keamanan menyeluruh, atau pemeriksaan hosting yang
tidak diketahui. Tidak menyatakan bahwa kontrol di luar repository tidak ada.
Tes browser sintetis membuktikan perilaku yang dicakup tes, bukan keberhasilan
API nyata, keamanan produksi, ataupun izin publikasi data.
