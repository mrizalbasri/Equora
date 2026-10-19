# Data Equora

- `raw/`: file sumber asli, immutable setelah dicatat hash dan metadata sumbernya.
- `processed/`: hasil pengolahan yang dapat dibuat ulang dari sumber dan konfigurasi.
- `fixtures/`: data sintetis berlabel untuk pengujian, boleh masuk Git.

`raw/` dan `processed/` diabaikan Git. Buat keduanya saat pertama kali menjalankan import. Belum ada dataset publik yang diunduh atau diverifikasi. Jangan menaruh data pribadi maupun raw dataset tanpa izin redistribusi di Git. Metadata katalog dan snapshot skenario nantinya disimpan di PostgreSQL; file besar tetap di direktori ini atau object storage.

Compose backend memasang direktori ini read-only untuk API. Jalankan proses ETL terpisah dengan akses tulis saat implementasi import tersedia.
