# Validasi penggunaan lokal — 25 Oktober 2026

## Pembaruan akses publik

Setelah validasi di bawah, diputuskan menghapus login pengguna publik dan integrasi
Clerk. Baris pengujian akun berikut merupakan catatan historis sebelum penghapusan.
Snapshot tetap berada di workspace bersama; impor admin tetap memakai token backend.

## Hasil

Frontend preview berjalan pada http://localhost:4185, API Python lokal pada http://127.0.0.1:18000, dan PostgreSQL memakai container `postgres-local` yang sudah ada. API membaca rilis `local_review` dengan 10 sumber, enam jenjang, 38 provinsi, dan 38 batas provinsi. Tidak ada data, identitas tim, atau hasil pendidikan yang direka untuk mengisi halaman.

Container API belum selesai dibangun karena unduhan dependensi; proses build dihentikan dan diganti dengan runtime Python proyek yang sudah terpasang. Ini bukan hasil deployment publik. Perintah untuk memulai ulang layanan terdapat pada [panduan workspace](local-workspace.md#api-dari-lingkungan-python-lokal) dan [scripts](../scripts/README.md).

## Perubahan

- About menjelaskan pengguna, pertanyaan awal, perbandingan data, status, dan batas penggunaan, dengan tautan ke fitur nyata.
- Daerah Saya menjelaskan alur memilih provinsi, membandingkan indikator, dan melanjutkan ke simulasi.
- Preset Studio menjelaskan perubahan bobot saja; label tidak menyatakan status darurat, penargetan wilayah 3T, atau rekomendasi resmi.
- Compare membedakan loading, kegagalan memuat, dan jumlah snapshot yang belum cukup. Kegagalan pemuatan menyediakan retry. Penjelasan objective dan kelengkapan data tidak disamakan dengan dampak atau kelayakan menerima paket.
- Akun memberi tautan kembali ke analisis dan menyatakan bahwa snapshot masih berada pada workspace bersama.
- Halaman error memberi pilihan pemulihan untuk 404 dan gangguan halaman.
- Ilustrasi dan ikon mengikuti aset Equora yang sudah ada; detail prompt terdapat pada [inventaris aset](../frontend/static/images/editorial/README.md).

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Svelte check | 0 error, 0 warning |
| Build frontend | Berhasil |
| Vitest | 17 lulus |
| Backend dengan database khusus `equora_test` | 200 lulus; satu peringatan deprecation dari dependensi TestClient |
| Playwright dengan fixture sintetis, dua worker | 50 lulus; tes login live dijalankan terpisah |
| Clerk development live | Daftar, verifikasi email pengujian, akun terverifikasi server, reload, keluar, masuk kembali, dan layout 390px lulus. Akun sintetis dihapus oleh cleanup tes. |
| API lokal | Health, workspace, katalog, provinsi, skenario, dan geometry mengembalikan HTTP 200 |
| Browser dengan data lokal | 10 sumber, 38 baris Explorer, peta, CSV, profil provinsi dan pembanding, simpan skenario, PDF snapshot, uji keputusan, perbandingan dan PDF perbandingan lulus |
| Layout langsung | About, Daerah Saya, Explorer, Studio, Compare, katalog dan metodologi pada 390px tanpa overflow horizontal; custom 404 tersedia; tanpa browser exception pada pemeriksaan ini |

Satu tes basemap awal melewati batas waktu saat suite berjalan paralel. Empat tes peta kemudian lulus terpisah; suite final dengan dua worker juga lulus seluruhnya. Tidak ada perubahan perilaku peta untuk melewatkan pengujian ini.

Dua skenario pemeriksaan dibuat melalui Studio memakai data rilis lokal, bernama `QA lokal 25 Oktober 2026 · awal` dan `QA lokal 25 Oktober 2026 · pembanding`. Keduanya tetap tersimpan agar alur hasil dan perbandingan dapat dibuka kembali. Biaya dan anggarannya adalah asumsi pengujian, bukan keputusan nyata.

Screenshot dan hasil pemeriksaan lokal tersimpan pada direktori ignored `tmp/readiness-live/`. File uji sementara tidak menjadi source aplikasi.

## Batas kesiapan

Siap digunakan di lingkungan lokal yang sudah dikonfigurasi. Hosting/domain, operasi backup produksi, serta persetujuan redistribusi data belum diverifikasi. Data tetap berstatus review lokal. Hasil simulasi tidak membuktikan dampak pendidikan atau keputusan anggaran resmi.
