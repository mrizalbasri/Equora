# Staging impor sumber pendidikan

Paket P0 setelah audit sumber: adapter XLSX lokal yang menghasilkan observasi dan quality report untuk ditinjau, sebelum registry/database/API publik. Dasar: PRD EP-01/EP-02 dan [audit sumber](source-audit-2026-10-19.md).

## Batas dan keputusan

Staging lokal dipilih agar validasi dan kontrak observasi dapat diuji tanpa menunggu target PostgreSQL. Membuat endpoint upload sekarang memerlukan auth/role yang belum ditentukan; langsung menghubungkan UI ke file mentah akan melewati gerbang release. Paket ini tidak menambah kedua jalur tersebut.

Adapter menerima file, metadata sumber dengan SHA256 dan waktu pengambilan eksplisit, serta satu jenjang yang dipilih pemanggil. Struktur enam jenjang dan kolom Negeri/Swasta/Total diperiksa, tetapi hanya kolom Total pada jenjang pilihan yang dinormalisasi. Persen dan jumlah sekolah tetap berbeda unit; tidak ada estimasi denominator, normalisasi kebutuhan atau penggabungan jenjang.

Kode wilayah disimpan sebagai `source_region_code` dalam namespace sumber. Nama asli dan koordinat sel dibawa ke tiap observasi. Belum ada klaim crosswalk ke registry/boundary resmi. Baris Indonesia dan Luar Negeri dikeluarkan dan dicatat; kode provinsi duplikat menjadi error. Natural key staging adalah hash versi sumber, kode sumber, tahun, jenjang dan indikator sumber.

Nilai kosong, string kosong, `-`, dan `…` menjadi null dengan issue missing. Nol tetap numerik. Formula, boolean, teks nonnumerik, nilai tak hingga/negatif, persen di atas 100 dan count pecahan menjadi error. Nilai valid disimpan sebagai Decimal dan JSON string agar tidak menambah pembulatan. Tidak ada penghitungan ulang Total dari Negeri/Swasta.

Artefak mencatat metadata, versi adapter, versi file berdasarkan hash, pilihan scope, observasi, jumlah baris/sel valid/null/error, agregat yang dikeluarkan dan issue per sel. Status hanya `staged` atau `invalid`, tidak ada status published. `staged` berarti lolos pemeriksaan struktur/nilai untuk scope tersebut, bukan lolos lisensi/release/crosswalk. Issue error membuat seluruh artefak invalid; observasi parsial hanya untuk diagnosis.

File dibaca sekali, hash diverifikasi sebelum workbook dibuka, batas ukuran ZIP/file/baris diperiksa, dan workbook ditutup setelah selesai. Artefak CLI dibuat dengan exclusive create agar hasil review sebelumnya tidak tertimpa. Output hanya boleh di `data/processed/` yang diabaikan Git. Tidak ada unduhan atau database write otomatis.

## Validasi

Tes memakai workbook sintetis yang dibuat saat pengujian: golden values, nol/null, provenance, hash berubah, header bergeser, formula, tipe/rentang invalid, duplicate key, agregat, scope jenjang, batas ukuran dan perilaku CLI. Empat workbook lokal yang sudah dipin hash dapat diperiksa ulang tanpa menyalin observasinya ke Git.

## Menjalankan

Dari `backend/`, setelah dependensi tersinkron dan file raw audit tersedia:

```powershell
uv run python -m app.etl.stage_education --source-id sanitation --file ../data/raw/source-audit-2026-10-19/sanitation.xlsx --education-level SD --output ../data/processed/staging/sanitation-sd-review.json
uv run pytest tests/test_education_staging.py
```

Gunakan `water`, `internet` atau `computers` dengan file dan nama output masing-masing. `--education-level` wajib memilih satu dari TK/SD/SMP/SMA/SMK/SLB; ini scope pemeriksaan lokal, bukan keputusan jenjang produk. Manifest `source-candidates.json` dan `source-audit.json` harus sepakat tentang hash. Waktu pengambilan berasal dari catatan audit, bukan timestamp saat impor.

Exit code 0 berarti artefak staged berhasil ditulis; 1 berarti report invalid ditulis untuk diperiksa; 2 berarti file/metadata/struktur/output ditolak. Perintah tidak menimpa output yang sudah ada; pilih nama baru setelah meninjau versi sebelumnya. Artefak tidak boleh dikonsumsi sebagai release published oleh API/Explorer.

Smoke test lokal pada 21 Oktober 2026: masing-masing sumber menghasilkan 38 observasi SD/Total, 0 missing dan 0 error; agregat Indonesia dan Luar Negeri dikeluarkan. Hasil ini hanya untuk slice SD/Total. Nilai kosong SD/Swasta pada komputer yang dicatat audit sebelumnya tetap di luar slice ini, bukan dianggap sudah hilang atau diperbaiki.

Validasi paket: 39 tes staging sintetis lulus; suite backend keseluruhan 100 passed, 1 skipped (PostgreSQL belum dikonfigurasi). Ruff lint/format lulus. Tidak ada perubahan endpoint, OpenAPI, tipe frontend atau dependensi.

Halaman resmi [sanitasi](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-terhadap-fasilitas-sanitasi-dasar-2025-indonesia) dan [air minum](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-terhadap-air-minum-layak-2025) diperiksa ulang 21 Oktober 2026: definisi dan tahun ajaran 2025/2026 tercantum, tetapi tidak ada field lisensi eksplisit pada halaman tersebut. Temuan ini tidak merupakan kesimpulan hukum atau izin redistribusi.

## Berikutnya

Registry/migrasi PostgreSQL dan published API memerlukan target database khusus, kontrak metadata yang ditinjau, crosswalk wilayah, ketentuan penggunaan dan persetujuan release. Staging tidak mengubah status `not_approved` pada manifest sumber.
