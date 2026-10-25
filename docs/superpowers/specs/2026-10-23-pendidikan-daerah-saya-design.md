# Pendidikan di Daerah Saya

Tanggal: 23 Oktober 2026.
Status: arah fitur dan implementasi disetujui dalam percakapan. Alur lokal
diimplementasikan pada 23 Oktober 2026; lihat [hasil implementasi](../../public-region.md).

## Tujuan dan pengguna

Equora diarahkan untuk publik yang ingin memahami kesenjangan fasilitas pendidikan
di daerahnya. Siswa, mahasiswa, guru, dan orang tua menjadi calon pengguna awal
untuk pengujian kegunaan. Kebutuhan mereka belum dibuktikan melalui wawancara.
Pemilihan arah ini berasal dari pembahasan dengan pemilik project, bukan dari
asumsi pengguna pada BRD lama. Arah yayasan/CSR tidak menjadi fokus fitur ini.

Tugas pengguna: memilih provinsi dan jenjang, memahami kondisi fasilitas,
membandingkan wilayah yang datanya sepadan, mencoba prioritas dalam simulasi,
dan membagikan temuan beserta sumbernya.

## Alur yang dipilih

1. Masuk melalui tindakan **Pendidikan di Daerah Saya** pada halaman publik.
2. Pilih provinsi dan jenjang yang tersedia dalam rilis data aktif. Provinsi
   dipilih manual; akses lokasi perangkat tidak diperlukan.
3. Baca profil: nilai fasilitas, definisi singkat, periode setiap indikator,
   sumber, dan kondisi kelengkapan data. Unit analisis selalu ditulis provinsi.
4. Pilih satu provinsi pembanding. Tampilkan indikator yang sama dari rilis,
   jenjang, periode dan definisi yang kompatibel. Jelaskan ketidakcocokan.
5. Pilih **Coba prioritas fasilitas** untuk masuk ke Studio dengan konteks
   jenjang yang sama. Studio menjelaskan cakupan provinsi yang ikut simulasi,
   bobot, anggaran, biaya dan kapasitas sebelum pengguna menjalankan perhitungan.
6. Pilih **Bagikan temuan** untuk menyalin tautan profil/perbandingan beserta
   ringkasan teks, periode, rilis dan URL sumber. Skenario memakai snapshot yang
   sudah tersedia, sehingga hasil simulasi tetap dapat ditelusuri.

## Penjelasan kondisi

- Gunakan bahasa sehari-hari, misalnya "akses internet" dan "sanitasi dasar",
  dengan definisi sumber tersedia sebagai rincian.
- Untuk dua persentase akses yang sepadan, selisih ditulis dalam poin persentase.
- Bandingkan indikator yang sama antarwilayah. Jangan menentukan "fasilitas
  paling tertinggal" hanya dengan mengurutkan angka lintas indikator yang
  definisinya berbeda. Bila skor prioritas digunakan, tampilkan bobot dan metode.
- Jumlah sekolah ditampilkan sebagai jumlah; persentase hanya dihitung dengan
  denominator yang cocok wilayah, periode, jenjang dan definisinya.
- Data kosong tetap tidak tersedia. Denominator nol tidak menghasilkan akses 0%.
- Deskripsi kondisi tidak menyimpulkan penyebab, kualitas pemerintah, atau
  kebutuhan sekolah tertentu dari data agregat provinsi.
- Biaya asumsi dan paket simulasi tetap diberi label; jumlah paket tidak diubah
  menjadi klaim sekolah atau siswa terbantu.

## Integrasi dengan aplikasi

Alur publik tersedia di `/daerah`, memakai data wilayah dan metadata sumber
dari API yang sudah ada. Halaman teknis `/regions/[code]` tetap tersedia dengan
tautan ke profil publik pada rilis yang sama. Explorer menyediakan pintu masuk
ke profil. Rincian sel spreadsheet tersedia setelah penjelasan kondisi.

Pisahkan penyusunan ringkasan dan pemeriksaan kompatibilitas data dari komponen
tampilan. Perbandingan wilayah memakai observasi; halaman Compare yang sudah
ada tetap menangani perbandingan snapshot skenario.

URL profil/perbandingan menyimpan provinsi, pembanding opsional, jenjang dan
identitas rilis. Implementasi perlu memastikan API bisa membaca rilis yang
dirujuk. Bila rilis tersebut tidak tersedia, tampilkan status eksplisit dan
tawarkan membuka rilis aktif melalui tindakan pengguna, tanpa mengganti diam-diam.

Fitur publik membaca rilis yang diizinkan untuk publik. Data lokal berstatus
review tetap dapat dipakai untuk demo lokal berlabel. Tombol berbagi menjelaskan
bahwa URL localhost hanya dapat digunakan pada lingkungan lokal yang sesuai.
Penerbitan data dan hosting publik merupakan dependensi peluncuran publik.

## Status dan aksesibilitas

Sediakan loading, error dengan coba lagi, kode provinsi tidak ditemukan,
rilis tidak tersedia, dan data belum lengkap. Perubahan pilihan yang cepat
tidak boleh menampilkan respons lama sebagai hasil pilihan baru.

Semua pilihan dan penelusuran sumber bisa dipakai dengan keyboard. Perbandingan
tetap terbaca pada layar kecil, dan status tidak disampaikan hanya lewat warna.
Jika clipboard gagal, tampilkan teks serta tautan yang dapat disalin manual.

## Bukti selesai untuk implementasi

- Pengguna dapat menyelesaikan alur profil hingga sumber tanpa login.
- Pergantian provinsi/jenjang menjaga konteks dan tidak menyisakan hasil lama.
- Perbandingan menolak cakupan yang tidak kompatibel dan menampilkan selisih
  poin persentase secara benar, termasuk nol, missing dan denominator nol.
- Konteks jenjang terbawa ke Studio, dengan cakupan simulasi terlihat sebelum run.
- Tautan berbagi memulihkan konteks dan rilis; rilis yang hilang tidak diganti
  otomatis. Ringkasan memuat sumber dan batas data.
- Pemeriksaan browser mencakup mobile, desktop, keyboard, retry dan berbagi.
- Uji kegunaan dengan calon pengguna menilai apakah mereka bisa menjelaskan
  satu kondisi wilayah dan menemukan sumbernya tanpa arahan pembuat aplikasi.

## Urutan pengerjaan

1. Profil publik dengan pemilihan provinsi/jenjang dan penjelasan indikator.
2. Perbandingan dua provinsi dan tautan menuju simulasi.
3. Berbagi ringkasan dengan rilis yang dapat dibuka ulang.

Pengujian kegunaan memakai prototipe alur awal sebelum memperluas implementasi.
Rancangan ini menjadi acuan fitur publik; dokumen BRD/PRD lama perlu diselaraskan
tersendiri agar status implementasi dan asumsi historis tetap jelas.
