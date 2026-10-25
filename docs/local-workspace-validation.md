# Validasi workspace lokal — 21 Oktober 2026

Target: aplikasi lokal, tanpa hosting/domain publik. Paket mengintegrasikan branch registry #24, audit tambahan #25, dan metodologi #26; main tidak di-merge otomatis.

## Pemeriksaan otomatis

| Pemeriksaan | Hasil lokal |
|---|---|
| Backend termasuk PostgreSQL khusus `equora_test` | 133 passed; transaksi test di-rollback |
| Ruff lint / format | Lulus |
| Ekspor OpenAPI dan production requirements | Identik dengan artefak yang dikomit |
| Tipe Svelte/TypeScript | 0 errors, 0 warnings |
| Vitest | 2 passed |
| Build produksi frontend | Lulus; MapLibre dimuat terpisah, worker dibundel |
| Kontrak OpenAPI → TypeScript | Sinkron |
| Playwright | 16 passed; landing lima viewport, workspace mobile/desktop, fallback peta, filter, missing, katalog/detail/error, bobot, snapshot, compare dan penolakan admin |
| Tautan dokumentasi / whitespace Git | Lulus |

E2E memakai fixture sintetis berlabel melalui intercept browser. Bukti itu tidak dianggap pengujian data nyata; smoke test berikut memakai layanan dan sumber lokal asli secara terpisah.

## Smoke test data asli dan Docker

- `equora-backend-api-1` dibangun ulang dari branch, healthy pada port host 18000; PostgreSQL tetap container `postgres-local`, database `equora`.
- Snapshot `local-2025-17dbcce0abdbebbc`: sepuluh sumber, enam jenjang, 38 provinsi, 2.280 observasi. Data tetap `local_review`.
- Explorer menampilkan 38 baris dan status peta siap; pemilihan Papua Tengah membuka detail yang sesuai kode 94. Worker MapLibre sempat gagal sebelum konfigurasi `setWorkerUrl` dibetulkan; smoke diulang sampai peta siap, bukan hanya canvas kosong.
- Browser melalui proxy SvelteKit berhasil menghitung skenario SD, menyimpan snapshot, membuka ulang snapshot, mengunduh PDF, membuka Compare dan menampilkan perubahan alokasi. Tidak ada `pageerror`; Explorer mobile 390px tidak overflow horizontal pada body.
- Permintaan admin dengan token environment berhasil memeriksa dan mengimpor ulang 60 scope. Release ID tetap sama. Token tidak dicetak atau disimpan di browser.
- PDF snapshot dan PDF perbandingan menghasilkan dokumen valid; halaman dirender ke PNG dan diperiksa visual. Tabel dapat berlanjut dengan header berulang, teks sumber/hash terbungkus, blok provenance tidak memisahkan judul dari isinya.
- Snapshot eksperimen awal yang dibuat oleh tes integrasi sebelum format lengkap dibuang; snapshot terbaru bisa dibuka ulang. Berkas sumber pengguna tidak diedit.

Screenshot dan PDF dengan angka nyata disimpan lokal di `tmp/`, bukan dikomit karena ketentuan redistribusi sumber belum diverifikasi. Snapshot biaya tetap asumsi demo, bukan rekomendasi kebijakan atau klaim dampak. Hasil ini tidak membuktikan deployment, benchmark kapasitas produksi, backup/restore produksi, ataupun submission lomba.

## Validasi basemap — 21 Oktober 2026

- `pnpm check`: nol error/warning; `pnpm test`: dua tes lulus; `pnpm build`: lulus (peringatan ukuran chunk MapLibre tetap ada).
- `tests/basemap.spec.ts`: empat tes lulus, mencakup archive PMTiles/HTTP Range, tampilan dan pemilihan provinsi pada 360/1440 px, fallback basemap serta retry setelah koneksi pulih. Tes memakai geometry/indikator sintetis dan basemap lokal asli; font glyph memakai GitHub yang dipin.
- `tests/workspace.spec.ts`: 12 tes lulus, termasuk filter, fallback boundary, Studio, Compare dan navigasi.
- Smoke adapter Node hasil build pada port sementara: `Range: bytes=0-126` menghasilkan `206`, `Content-Range: bytes 0-126/3246304` dan 127 byte.
- Smoke dengan data lokal asli belum dapat diulang: `API_BASE_URL` lokal menunjuk port 18000 yang tidak sedang melayani backend. Port 8000 yang aktif mengembalikan 404 untuk endpoint workspace/geometry. Pemeriksaan ini tidak mengubah konfigurasi backend atau database.
