# Equora dibandingkan dengan tiga layanan resmi pendidikan

Pemeriksaan 21 Oktober 2026, Asia/Jakarta. Dokumen ini melanjutkan
[pemeriksaan Geoportal](geoportal-comparison.md) dengan dua target tambahan:
[Sekolah Kita](https://sekolah.data.kemendikdasmen.go.id/) dan
[Portal Data](https://data.kemendikdasmen.go.id/).

## Kesimpulan yang diperbarui

Peta, katalog, informasi fasilitas, tabel, ekspor dan perbandingan secara umum
bukan klaim pembeda yang memadai untuk Equora. Sekolah Kita bahkan mempunyai
alur Sandingkan yang membandingkan profil sekolah. Nilai tambah implementasi
Equora yang masih dapat dibuktikan adalah eksperimen prioritas multiindikator
dan alokasi dengan kendala, baseline serta snapshot skenario.

Pernyataan ini tidak membuktikan fitur tersebut unik di seluruh ekosistem
Kemendikdasmen. Tidak ditemukan kontrol serupa pada halaman/alur dan artefak
publik yang diperiksa; backend, dashboard lain, fitur berizin dan seluruh rute
dinamis tidak tercakup.

## Perbandingan tujuan dan objek

| Layanan | Objek dan tugas yang diperiksa | Tumpang tindih dengan Equora |
| --- | --- | --- |
| Sekolah Kita | Mencari sekolah, membaca profil, peta lokasi, menyandingkan profil sekolah | Fasilitas, sanitasi/TIK, filter, peta dan perbandingan |
| Portal Data | Menemukan dataset, membaca data induk/agregat, mengunduh data dan publikasi | Katalog, pencarian, tabel, filter dan ekspor |
| Geoportal Pendidikan | Membaca sebaran indikator, tabel dan peringkat nilai per wilayah | Hampir seluruh alur Explorer dasar |
| Equora | Mengubah bobot kebutuhan dan kendala, menghitung dan membandingkan alokasi simulasi | Menggunakan data sebagai masukan eksperimen; bukan sumber data resmi pengganti |

## Sekolah Kita: bukti

### Artefak publik dan REA

- HTML beranda menyebut pencarian/profil sekolah, peta sekolah sekitar dan
  perbandingan sekolah. Menu publik memiliki Sekolah, Peta Sekolah dan Sandingkan.
- Bundle `main-55AIKZHM.js`, SHA-256
  `13219277a0ac05589bc9afa3961a9f67a4823588fb1f959fd887c2042d2cd43e`,
  memuat router `/sekolah`, `/profil-sekolah/:sekolah_id`, `/sandingkan`,
  `/informasi-kontak`, `/peta-sekolah`, dan formulir saran/komentar.
- Agar analisis REA tidak habis pada library pihak ketiga, TypeScript AST
  digunakan untuk memilih sepuluh deklarasi tingkat atas yang relevan tanpa
  menjalankan kode target. Berkas potongan mempertahankan teks asli dan memiliki
  manifest rentang byte serta hash berkas sumber. REA kemudian menganalisis
  potongan turunan itu: total 58.164 byte, sepuluh berkas, tanpa kegagalan parse.
  Ini analisis pilihan fitur, bukan analisis lengkap bundle atau runtime.
- Komponen Sandingkan menghapus ID duplikat dan membatasi pilihan hingga empat
  sekolah. Data detail masing-masing sekolah dipetakan menjadi kolom pembanding:
  status, akreditasi, siswa/rombongan belajar, rasio, ruang kelas, laboratorium,
  perpustakaan, listrik dan internet. Tidak ada perhitungan alokasi di komponen
  yang diperiksa.
- Implementasi profil memuat dialog sanitasi dan TIK. Kode sanitasi berisi
  atribut air dan toilet; kode TIK memuat kategori kepemilikan komputer.
  Implementasi juga menampilkan entri informasi program pembangunan/bantuan.
  Keberadaan kontrol/atribut ini bukan bukti semua sekolah memiliki data lengkap,
  atau bahwa informasi bantuan itu merupakan mesin usulan alokasi baru.
- Pencarian teks pada seluruh main bundle tidak menemukan istilah anggaran,
  skenario, bobot, simulasi, budget, optimasi, optimization, capacity atau
  minimum_packages. Hasil negatif ini terbatas pada carrier tersebut dan
  tidak membuktikan absennya kemampuan di seluruh platform.

### Observasi browser

Alur beranda -> [Sandingkan](https://sekolah.data.kemendikdasmen.go.id/sandingkan)
-> Tambah Sekolah diperiksa. Dialog meminta kabupaten/kota, bentuk pendidikan,
status dan sekolah yang dipilih. Ini memperkuat bahwa objek perbandingannya
adalah profil sekolah, bukan dua eksperimen anggaran.

Tidak dipilih sekolah contoh dan tidak diuji hasil perbandingan berisi data.
Profil, sanitasi dan TIK dibuktikan pada implementasi client, bukan diverifikasi
isinya pada setiap sekolah. CAPTCHA yang terlihat di pencarian beranda tidak
diselesaikan atau dilewati. Tidak ada pengiriman komentar atau pengambilan data
pribadi siswa/guru.

## Portal Data: bukti

- Beranda menyediakan Dataset, Data Induk, Publikasi, Platform, pencarian dan
  tautan ke Geoportal serta Sekolah Kita. Fitur-fitur ini teramati pada browser
  dan HTML publik.
- [Data Induk](https://data.kemendikdasmen.go.id/data-induk) menjelaskan data
  satuan pendidikan, yayasan, pendidik/tenaga kependidikan dan peserta didik,
  dengan format unduhan XLSX, CSV dan PDF. Ini keterangan portal; seluruh
  format/isi ekspor tidak diunduh atau diuji dalam pemeriksaan ini.
- [Jumlah Satuan Pendidikan](https://data.kemendikdasmen.go.id/data-induk/satpen/jumlah)
  benar-benar memuat ringkasan dan tabel agregat wilayah, pilihan mode jumlah
  atau daftar, serta tombol unduh. Filter wilayah, pembina, jalur, bentuk,
  status dan jenis terlihat di browser dan konfigurasi client.
- Frekuensi pembaruan tidak boleh digeneralisasi: landing Data Induk menyebut
  harian untuk beberapa topik, sedangkan halaman jumlah sekolah yang diperiksa
  menampilkan tanggal 17 Agustus 2026 dengan keterangan mingguan. Tidak dilakukan
  audit histori atau pengukuran keterkinian data. Karena itu dokumen ini tidak
  menyimpulkan semua dataset resmi selalu lebih baru dari snapshot Equora.
- REA memeriksa chunk halaman/layout beranda, skrip inline, dan chunk halaman
  Satuan Pendidikan. Analisis bersifat parsial karena dependensi bersama tidak
  seluruhnya diambil. JSON-LD yang masuk sebagai carrier JavaScript menyebabkan
  satu kegagalan parse pada analisis awal; ini bukan temuan bug pada portal.
- Tidak ditemukan kontrol bobot, anggaran dan skenario pada halaman serta chunk
  sampel. Ini bukan pencarian menyeluruh terhadap seluruh Platform, publikasi,
  dashboard tertaut, layanan internal atau backend.

## Perbedaan implementasi Equora yang masih relevan

Lihat bukti kode rinci pada [laporan sebelumnya](geoportal-comparison.md).

1. Menggabungkan empat indikator kebutuhan dengan bobot pengguna, bukan hanya
   menyandingkan atribut sekolah atau mengurutkan satu indikator.
2. Menghitung alokasi paket integer dengan anggaran, biaya, kapasitas dan minimum
   per wilayah. Pengguna dapat mengubah asumsi dan melihat konsekuensinya.
3. Membandingkan solver dengan pembagian merata dan greedy menggunakan kendala
   yang sama; menampilkan coverage serta wilayah yang dikeluarkan.
4. Menyimpan parameter, data masukan, versi, sumber dan hasil sebagai snapshot;
   membandingkan dua snapshot dengan pemeriksaan kompatibilitas dan peringatan
   saat bobot/cakupannya berbeda.

Kata "perbandingan" perlu dijelaskan pada UI: Sekolah Kita membandingkan sekolah,
sedangkan Compare Equora membandingkan hasil eksperimen alokasi. Keduanya punya
manfaat yang berbeda; nama fitur saja tidak membuktikan keunikan.

## Batas manfaat dan arah yang disarankan

Equora masih memakai agregat provinsi, biaya/kapasitas demo dan belum mempunyai
validasi manfaat oleh calon pengguna. Tidak ada bukti satu paket setara satu
sekolah terbantu atau bahwa objective adalah dampak pendidikan. Penentuan
penerima anggaran nyata membutuhkan data, biaya, kriteria dan proses kebijakan
yang tervalidasi di luar sandbox saat ini.

Hipotesis produk yang dapat diuji: alat eksperimen prioritas fasilitas untuk
analis, peneliti atau pembelajaran perencanaan. Uji satu tugas konkret: perubahan
prioritas/alokasi ketika bobot dan anggaran berubah, lengkap dengan alasan dan
kendala. Layanan resmi menjadi rujukan sumber; integrasi data tetap harus
memeriksa definisi, cut-off, cakupan, akses dan lisensi. Kebutuhan pengguna dan
hak integrasi belum terbukti hanya dari tersedianya fitur publik.

## Ledger Evidence REA dan keterbatasan

- Sekolah Kita, sepuluh deklarasi turunan dengan manifest rentang byte:
  `ev_022e63d3eabc14a8ba839c2247f59ca1f0bbaafb61f0c976c7cb0ce7f27511fe`.
  Ringkasan `ev_59249c30a82fead505d86fe9bee723bf728212ca72a6b32a87e79b8c68aebbdc`.
  Root turunan `b7593afd5a97a7b97b5d5916ee743b41d936b9ee878a50bcf7bcec5f88986e41`.
  Graf aplikasi selesai dalam pilihan tersebut; hubungan semantik/import
  eksternal belum seluruhnya terselesaikan. Bukan bukti eksekusi runtime.
- Portal Data beranda/layout:
  `ev_c52785830d056c0a713500769f434c7eacd46d4a07874f92eb2c11b199b94dc4`.
  Lima carrier, 127.045 byte; cakupan parsial termasuk JSON-LD non-JavaScript.
- Portal Data halaman jumlah sekolah:
  `ev_a4b448c6a4b18b95362547c1f023d45cb454aa0800d5336f930182088c0ad7e0`.
  Satu chunk 796 byte; konfigurasi halaman diketahui, dependensi bersama tidak
  diaudit seluruhnya.
- Screenshot dan pengamatan kontrol dilakukan melalui browser aplikasi sebagai
  bukti pendamping; jangan menyebutnya capture runtime REA. Ringkasan, manifest,
  catatan sumber dan screenshot disimpan di `tmp/rea-*` lokal.

Pertanyaan terjawab: tujuan layanan, keberadaan Sandingkan, tumpang tindih
fasilitas/katalog/ekspor, dan perbedaan objek perbandingan dengan Equora.
Terjawab sebagian: kemampuan profil individual dan seluruh ekspor.
Belum terjawab: fitur nonpublik/layanan lain dan manfaat Equora pada pekerjaan
nyata. Pemeriksaan ini tidak mengubah kode aplikasi atau data skenario.
