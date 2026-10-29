# Akses publik tanpa akun

Keputusan produk diperbarui 27 Oktober 2026: Equora digunakan untuk membaca
data pendidikan publik dan mencoba simulasi tanpa login atau pendaftaran.
Integrasi Clerk, halaman akun, dan dependensi autentikasi frontend dihapus.

## Perilaku aplikasi

- Beranda, profil daerah, Explorer, katalog, metodologi, Studio, Compare dan
  ekspor tersedia tanpa akun.
- Tidak ada tombol Masuk, Daftar, Akun saya, atau Keluar pada navigasi.
- Route lama `/sign-in`, `/sign-up`, dan `/account` mengembalikan 404.
- Cookie sesi lama tidak dipakai; aplikasi tidak memanggil penyedia login.
- Snapshot tetap disimpan dalam workspace bersama, bukan koleksi pribadi.
  Pengguna lain yang mengakses aplikasi dapat membaca snapshot tersebut.
  Jangan memasukkan informasi pribadi dalam skenario.

## Pengelolaan data

Impor melalui `/admin` tetap memerlukan `ADMIN_TOKEN` backend. Token tidak
memberikan identitas akun dan tidak diperlukan untuk membaca data publik.
PostgreSQL tetap menyimpan registry, rilis lokal dan snapshot skenario.

Status `local_review` tidak menyembunyikan data dari API. Izin publikasi data,
konfigurasi HTTPS, hak akses database, pembatasan pemakaian dan kebijakan
penyimpanan snapshot perlu disiapkan sebelum deployment publik.

Catatan pengujian akun pada laporan bertanggal sebelumnya adalah bukti historis,
bukan petunjuk konfigurasi aplikasi saat ini.
