# Data Equora

- `raw/`: file sumber asli, immutable setelah dicatat hash dan metadata sumbernya.
- `datamentah/`: 10 workbook unduhan pengguna; diabaikan Git, lihat [audit tambahan](../docs/additional-source-audit-2026-10-21.md).
- `processed/`: hasil pengolahan yang dapat dibuat ulang dari sumber dan konfigurasi.
- `fixtures/`: data sintetis berlabel untuk pengujian, boleh masuk Git.

`raw/` dan `processed/` diabaikan Git. Empat calon sumber telah diunduh lokal untuk [audit awal](../docs/source-audit-2026-10-19.md). `metadata/` berisi URL, SHA256 dan laporan quality; belum ada lisensi/release yang disetujui. Jangan menaruh data pribadi maupun raw dataset tanpa izin redistribusi di Git. Metadata katalog dan snapshot skenario nantinya disimpan di PostgreSQL; file besar tetap di direktori ini atau object storage.

Compose backend memasang direktori ini read-only untuk API. Jalankan proses ETL terpisah dengan akses tulis saat implementasi import tersedia.
