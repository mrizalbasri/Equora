# Geoportal Pendidikan dan Equora: perbandingan berbasis bukti

Pemeriksaan lanjutan terhadap Sekolah Kita dan Portal Data tersedia pada
[perbandingan tiga layanan resmi](official-portals-comparison.md). Sekolah Kita
juga mempunyai fitur perbandingan profil sekolah; klaim pembeda Equora harus
menjelaskan bahwa yang dibandingkan adalah skenario alokasi.

Pemeriksaan: 21 Oktober 2026 (Asia/Jakarta). Target: situs publik
[Geoportal Pendidikan](https://geoportal.data.kemendikdasmen.go.id/) dan kode lokal
Equora. Pemeriksaan ini tidak mengubah kode aplikasi atau data skenario.

## Kesimpulan

Explorer Equora tumpang tindih dengan Geoportal pada peta, tabel, penyaringan,
metadata, dan ekspor data. Perbedaan yang dapat dibuktikan pada implementasi Equora
adalah prioritas multiindikator berbobot, simulasi alokasi dengan kendala,
perbandingan dengan baseline, dan snapshot skenario yang dapat dibandingkan.

Pada alur publik dan JavaScript Geoportal yang diperiksa, tidak ditemukan alur
bobot/anggaran/skenario tersebut. Ini adalah hasil pencarian terbatas, bukan
pernyataan bahwa seluruh sistem Kemendikdasmen tidak mempunyai kemampuan itu.

## Metode dan batas cakupan

1. Mengambil HTML dan 16 berkas JavaScript publik, total 1.679.109 byte, dari
   origin Geoportal. Impor statis/dinamis yang dirujuk bundle diikuti untuk
   inventaris ini; tidak memindai endpoint atau sistem internal yang tidak terkait.
2. Menjalankan REA `analyze_javascript_application` pada salinan berkas publik,
   lalu memeriksa inventaris modul dengan `inspect_analysis_view`.
3. Analisis luas mengalami batas memori pada graf semantik vendor. Dilanjutkan
   dengan analisis terfokus pada dua chunk fitur peta dan katalog (39.080 byte),
   yang selesai tanpa pemotongan graf aplikasi. Resolusi dinamis/import eksternal
   dan sebagian hubungan semantik tetap tidak diketahui.
4. Memeriksa browser nyata: beranda -> katalog -> sanitasi H2 SD provinsi ->
   tab Peta, Tabel, dan Metadata. Browser menampilkan data 38 provinsi pada tabel
   yang diperiksa. Ekspor tidak diunduh; kontrol dan implementasinya diperiksa.
5. Membaca implementasi Equora, bukan menjalankan eksperimen alokasi baru atau
   membuat snapshot tambahan untuk pemeriksaan ini.

Manifest unduhan, ringkasan Evidence REA, dan screenshot disimpan di `tmp/`
lokal. Berkas publik yang dianalisis tidak dimasukkan ke Git. Hash identitas
penting dicatat di bawah agar pemeriksaan dapat dibedakan dari rilis berikutnya.

## Perbandingan

| Fungsi | Geoportal yang diperiksa | Equora saat ini | Implikasi |
| --- | --- | --- | --- |
| Peta indikator, tabel, filter | Teramati pada browser | Ada di Explorer | Tumpang tindih, bukan pembeda utama |
| Metadata dan ekspor | Metadata teramati; CSV, Excel, gambar tersedia di kontrol dan kode | Metadata sumber, CSV, laporan PDF skenario/perbandingan | Klaim sekadar transparansi atau ekspor terlalu umum |
| Cakupan wilayah | Pilihan provinsi/kabupaten-kota; 38 provinsi teramati pada tabel sanitasi | Analisis agregat 38 provinsi | Geoportal menawarkan pilihan wilayah lebih rinci; kelengkapan semua dataset tidak diuji |
| Indikator | APK/APM dan keluarga sanitasi WASH ada di kode; CTPS SD tersedia pada katalog langsung | Empat indikator inti sanitasi, air, internet, komputer; indikator jumlah sebagai konteks | Kategori WASH bertumpang tindih, definisi dan periode harus tetap dicocokkan |
| Peringkat | Nilai satu indikator diurutkan menurun | Skor kebutuhan gabungan dengan bobot pengguna dan kontribusi per indikator | Peringkat capaian satu indikator berbeda dari prioritas kebutuhan multiindikator |
| Simulasi alokasi | Tidak ditemukan pada alur/bundle yang diperiksa | CP-SAT dengan anggaran, biaya, kapasitas dan minimum paket per wilayah | Pembeda implementasi terkuat yang ditemukan |
| Baseline dan perbandingan | Tidak ditemukan pada alur/bundle yang diperiksa | Baseline equal/greedy; delta paket, peringkat, anggaran, coverage | Membantu menguji pilihan, bukan sekadar melihat posisi wilayah |
| Penyimpanan hasil | Filter peta tercermin pada URL; bukan bukti snapshot skenario | Snapshot tersimpan beserta parameter, input, sumber dan versi | Dapat membuka ulang dan membandingkan eksperimen |

## Bukti Geoportal

- Router publik dalam `main-IL6FMKFB.js` memuat beranda, `peta`, `katalog`, dan
  `kontak`, dengan impor komponen peta/katalog. Tidak ada rute skenario pada
  konfigurasi router yang diperiksa.
- `chunk-CMFOYYBR.js` memuat pilihan Peta/Tabel/Metadata, indikator APK/APM/WASH,
  perhitungan quantile lima kelas, ringkasan nilai minimum/maksimum/rata-rata,
  pencarian wilayah, serta ekspor CSV, XLSX dan PNG.
- Pada `tableRows` (offset karakter 10972 pada teks UTF-8 terdekode), nilai
  diambil dari satu indikator aktif, diurutkan menurun, lalu diberi nomor
  peringkat. Tidak ada penggabungan bobot kebutuhan pada fungsi ini.
- `downloadMapImage` (offset karakter 17697) memakai tangkapan elemen peta;
  ekspor gambar ini bukan ekspor laporan keputusan skenario.
- `chunk-VCLJPZ2L.js` memuat pencarian katalog dan filter kategori, jenjang,
  tahun, serta level wilayah. Katalog/data terhubung ke GeoNode lewat layanan
  publik yang dirujuk bundle, bukan data Equora.
- Pencarian case-insensitive di 16 JavaScript yang diunduh tidak menemukan
  `simulasi`, `skenario`, `anggaran`, `bobot`, `budget`, `optimasi`, atau
  `optimization`. Kata `snapshot` muncul pada framework/router; itu tidak
  membuktikan fitur snapshot eksperimen. Kata `allocation` yang muncul di
  pustaka ekspor tidak diperlakukan sebagai mesin alokasi anggaran.
- Browser: katalog menampilkan 10 dataset saat diperiksa. Salah satu yang
  dibuka adalah [CTPS SD provinsi](https://geoportal.data.kemendikdasmen.go.id/peta?indikator=san_h2_sd&level=provinsi&source=geonode).
  Metadata resmi tersedia, walaupun beberapa field berisi tanda kosong.

Definisi CTPS di Geoportal tidak boleh langsung disamakan dengan indikator
toilet/sanitasi Equora. Tahun publikasi metadata juga tidak otomatis berarti
tahun observasi data. Pemeriksaan ini tidak melakukan rekonsiliasi angka.

## Bukti implementasi Equora

- [Prioritas](../backend/app/analysis/priority.py): kebutuhan dari persentase
  akses, bobot nonnegatif dengan jumlah tepat satu, kontribusi per indikator,
  kebijakan exclude untuk missing berbobot positif, dan tie-break deterministik.
- [Orkestrasi skenario](../backend/app/services/workspace.py): empat indikator
  inti, pengecualian denominator nol, parameter per wilayah, hasil solver serta
  baseline equal/greedy. Perbandingan memeriksa versi data, jenjang, metode dan
  model; perubahan bobot/cakupan diberi peringatan.
- [Alokasi](../backend/app/optimization/allocation.py): CP-SAT memaksimalkan
  objective kebutuhan berbobot dengan paket integer dan kendala anggaran,
  biaya, minimum serta kapasitas; hasil alokasi divalidasi terpisah.
- [API skenario](../backend/app/api/workspace.py): menyimpan snapshot PostgreSQL,
  membaca snapshot, membandingkan dua snapshot, serta mengunduh laporan PDF.
- [Studio](../frontend/src/routes/studio/+page.svelte) dan
  [Perbandingan](../frontend/src/routes/compare/+page.svelte) menyediakan alur UI
  untuk parameter dan hasil tersebut.

Keberadaan fungsi di kode tidak sama dengan validasi kebijakan atau manfaat
lapangan. Tidak ada benchmark baru atau uji pengguna dalam pemeriksaan ini.

## Arti untuk arah produk

Posisi yang paling masuk akal berdasarkan bukti ini: simulator prioritas dan
alokasi fasilitas pendidikan yang dapat ditelusuri. Peta/katalog merupakan
pintu masuk dan konteks data. Jangan memosisikan Equora sebagai pengganti portal
data resmi atau mengklaim fitur yang unik di seluruh ekosistem pemerintah.

Contoh tugas yang cocok: membandingkan hasil ketika bobot sanitasi dinaikkan,
anggaran diubah, atau minimum paket beberapa wilayah ditetapkan. Hasil harus
menampilkan alasan perubahan, kendala, coverage dan konsekuensinya.

Kelemahan Equora yang masih nyata: hanya agregat provinsi, biaya dan kapasitas
berstatus asumsi demo, belum ada validasi manfaat oleh calon pengguna, dan
lisensi redistribusi sumber lokal belum diverifikasi. Satu paket tidak dapat
diklaim setara satu sekolah terbantu. Perbedaan fitur belum membuktikan adanya
kebutuhan pengguna atau dampak yang lebih baik.

## Ledger REA

- Analisis luas: `ev_d041b647ecaa2234d1e5d1bab1b613059fb1b1656a66e3c01ef2658a34b74979`.
  Cakupan semantik parsial karena resource limit; bukan dasar untuk klaim tidak
  adanya fitur di seluruh sistem.
- Analisis fitur: `ev_2dae5da432c130cda4cc855f2f5ce2abb2dd3b9c834cf857d794a2a70bfa7901`.
  Dua chunk peta/katalog; graf aplikasi selesai, hubungan semantik dinamis
  masih parsial. Root SHA-256:
  `7e48b93805209194d0da3567a80a411bb5c155cd49911f8ed68747d36db58a3a`.
- Identitas asset komponen peta:
  `ev_da77268514a41a00aaa8276b48fac2d00b121752d4bbfa7e775faac81f89e0b8`.
  SHA-256 `6366fae6e9f3e57cd9d3304d8e0ead8d883b165c3e5469726feb5180ec2c2545`.
- Observasi browser dan pembacaan kode Equora merupakan bukti pendamping;
  bukan capture runtime oleh REA. REA menganalisis JavaScript sebagai teks
  statis dan tidak menjalankan bootstrap aplikasi.

Pertanyaan terjawab: kesamaan Explorer, sifat peringkat, fitur simulasi lokal,
dan batas klaim pembeda. Belum terjawab: kemampuan backend/fitur nonpublik
Geoportal, kelengkapan semua dataset kabupaten/kota, hasil uji seluruh ekspor,
dan validasi kebutuhan pengguna Equora.
