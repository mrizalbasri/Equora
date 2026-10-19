# 02 - Katalog dataset

PIC: teman. Tujuan: pengunjung mengetahui data apa yang tersedia, asalnya, cakupan dan keterbatasannya. Fitur baca data; pipeline import/publish tetap milik pemilik.

Route: `/datasets` dan `/datasets/[datasetId]`. Lokasi: `frontend/src/routes/datasets/` beserta komponen khusus halaman. Mulai setelah pemilik menyerahkan tipe/response API; fixture boleh dipakai terlebih dahulu dengan label demo. Tipe OpenAPI saat ini baru mencakup health, belum kontrak katalog.

## Yang dikerjakan

1. Buat daftar dataset dan pencarian judul/penerbit. Pencarian lokal hanya jika seluruh daftar dimuat; jika memakai pagination server, gunakan kontrak pencarian server dari pemilik.
2. Buat detail metadata: sumber yang bisa diklik, penerbit, periode, jenjang, level wilayah, unit, lisensi/ketentuan, versi dan waktu pengambilan bila tersedia.
3. Tampilkan ringkasan quality dari API: missing, duplikat, coverage atau masalah yang tersedia. Jangan menghitung ulang audit di browser atau menyatakan sehat jika informasi belum ada.
4. Sediakan loading, kosong, pencarian tanpa hasil, ID tidak ditemukan, error dan retry. Nilai metadata yang belum diketahui ditulis belum tersedia.
5. Hubungkan API katalog/detail/quality setelah siap. Hilangkan fallback fixture otomatis ketika API gagal; error data nyata tidak boleh disamarkan sebagai demo.

## Batas pekerjaan

Tidak mengerjakan upload XLSX/CSV, mapping kolom, validasi ETL, publish, login admin atau migrasi. Jangan mengubah bentuk kontrak tanpa koordinasi. Status data resmi/demo mengikuti input pemilik, bukan dugaan dari nama penerbit.

## Bukti selesai

- [ ] Daftar -> detail -> sumber berjalan pada fixture yang disepakati dan API saat tersedia.
- [ ] Loading, empty, not-found, error/retry diuji; pencarian konsisten dengan cakupan data yang dimuat.
- [ ] Metadata kosong tidak menjadi nol atau klaim kualitas baik.
- [ ] Mode fixture berlabel demo; tidak tampil menggantikan error API secara diam-diam.
- [ ] Mobile, keyboard serta pemeriksaan build/type yang tersedia diperiksa.
- [ ] Screenshot, contoh response yang digunakan dan keterbatasan dicatat pada PR.

Jika API belum siap, serahkan sebagai UI teruji dengan fixture; integrasi data nyata tetap berstatus belum selesai.

Acuan: [PRD EP-01 sampai EP-03](../../../PRD_Equora.md), [data readiness](../../../data-readiness.md), [aturan serah terima](../../README.md).
