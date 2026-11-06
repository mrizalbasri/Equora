# Desain Peta Prioritas Interaktif

Tanggal: 5 November 2026
Status: Siap direview pengguna
Ketergantungan: Ringkasan Prioritas Provinsi (PR #15)

## Ringkasan

Equora akan meningkatkan peta pada `/explore` dari peta nilai tunggal menjadi alat pembacaan kondisi relatif provinsi. Pengguna dapat berpindah antara nilai indikator, posisi terhadap median provinsi pada cakupan sepadan, dan kelengkapan data tanpa meninggalkan konteks rilis serta jenjang yang sedang dipilih.

Peta tidak menetapkan prioritas kebijakan resmi. Warna dan label hanya merangkum data deskriptif yang sudah tersedia. Setiap kondisi relatif harus dapat ditelusuri ke nilai, median, selisih, peringkat, periode, dan sumbernya.

## Tujuan

- Membantu pengguna menemukan pola antardaerah sebelum membuka profil provinsi.
- Menghubungkan Explorer, Ringkasan Kondisi Relatif, dan Studio dalam satu alur yang jelas.
- Mempertahankan tabel sebagai alternatif aksesibel dan fallback ketika peta gagal.
- Menghindari permintaan insight satu per satu untuk setiap provinsi.
- Menjaga interpretasi data kosong terpisah dari nilai rendah.

## Bukan Tujuan

- Menetapkan provinsi prioritas resmi atau ambang intervensi.
- Menggabungkan indikator menjadi skor baru di halaman Explorer.
- Menjelaskan penyebab perbedaan antardaerah.
- Menambah data kabupaten/kota, sekolah, atau koordinat individual.
- Menyimpan pilihan peta ke akun pengguna.
- Mengganti Studio sebagai tempat simulasi bobot dan alokasi.

## Alur Pengguna

1. Pengguna membuka `/explore`, memilih indikator dan jenjang.
2. Peta dimuat pada mode **Nilai indikator** sebagai mode awal.
3. Pengguna dapat memilih tiga mode:
   - **Nilai indikator:** menampilkan besaran indikator yang sedang dipilih.
   - **Terhadap median:** menampilkan posisi provinsi di bawah, sama dengan, atau di atas median pada cakupan sepadan.
   - **Kelengkapan data:** menampilkan proporsi indikator inti yang dapat dibandingkan untuk setiap provinsi.
4. Hover pada peta atau fokus/pilih baris tabel menampilkan nama provinsi dan ringkasan sesuai mode.
5. Klik provinsi membuka panel rincian berisi nilai, median, selisih, peringkat, periode, sumber, dan batas interpretasi.
6. Dari panel rincian, pengguna dapat membuka profil lengkap atau membawa indikator fokus ke Studio dengan preset bobot awal 70% yang tetap dapat diubah.
7. Pilihan provinsi juga menyinkronkan baris tabel agar alur peta dan tabel tidak terpisah.

## Kontrak API

Tambahkan endpoint agregat:

```text
GET /api/v1/regions/insights-map
  ?education_level=SD
  &release_id=<release-id>
  &indicator=<source-id>
```

Respons mengunci konteks dan mengembalikan seluruh provinsi dalam satu permintaan:

```text
release_id
status
academic_year
education_level
ownership
indicator:
  source_id
  title
  unit
  definition
median | null
available_regions
total_regions
rows[]:
  code
  name
  value | null
  comparison: below | equal | above | unavailable
  delta_from_median | null
  rank | null
  available_indicators
  total_indicators
  completeness_ratio
  attention_source_id | null
  unavailable_reason | null
limitations[]
```

Endpoint menggunakan rilis, sumber, jenjang, kepemilikan, periode, unit, dan definisi yang sama dengan endpoint insight per provinsi. `indicator` harus tersedia pada rilis. Indikator persentase memperoleh benchmark median; untuk indikator nonpersentase, `median` dan field relatif bernilai `null`, `comparison` bernilai `unavailable`, serta `unavailable_reason` menjelaskan bahwa unit tersebut tidak termasuk benchmark kondisi relatif. Kelengkapan data tetap tersedia. Kode error untuk rilis, jenjang, atau indikator yang tidak valid mengikuti pola endpoint workspace yang sudah ada.

Backend mengambil observasi seluruh provinsi sekali, lalu menggunakan service benchmark yang sama dengan `/regions/{code}/insights`. Perhitungan median, peringkat, alasan data kosong, dan tie handling tidak boleh diduplikasi pada router atau frontend.

## Aturan Visualisasi

### Mode nilai indikator

- Indikator persentase memakai skala tetap 0–100 agar warna dapat dibandingkan ketika pengguna berpindah provinsi.
- Indikator jumlah memakai rentang nilai valid hasil filter dan harus menampilkan rentang aktual pada legenda.
- Nilai kosong memakai abu-abu dan label **Data tidak tersedia**, bukan nilai nol.
- Untuk indikator nonpersentase, mode **Terhadap median** dinonaktifkan dengan penjelasan bahwa benchmark kondisi relatif hanya berlaku pada indikator akses persentase.

### Mode terhadap median

- Nilai di bawah median memakai skala jingga yang tenang, nilai sama memakai warna netral, dan nilai di atas median memakai skala biru.
- Intensitas menunjukkan besar selisih absolut yang diamati, bukan tingkat urgensi kebijakan.
- Legenda menggunakan istilah **Di bawah median**, **Setara median**, **Di atas median**, dan **Tidak tersedia**.
- Peta tidak menggunakan istilah baik/buruk, tertinggal/maju, atau rekomendasi intervensi.

### Mode kelengkapan data

- Warna menunjukkan rasio `available_indicators / total_indicators`.
- Skala tidak memakai warna bahaya agar data kosong tidak disalahartikan sebagai kondisi fasilitas yang buruk.
- Tooltip menampilkan jumlah indikator yang tersedia dan alasan data yang tidak dapat dibandingkan bila ada.

### Seleksi dan legenda

- Provinsi terpilih memiliki garis luar kontras yang tetap terlihat di semua mode.
- Legenda selalu berubah mengikuti mode dan menampilkan satuan serta cakupan.
- Tooltip dan panel menyertakan label teks; warna bukan satu-satunya pembeda.

## Antarmuka `/explore`

Kontrol mode ditempatkan pada header panel peta setelah pemilih indikator dan jenjang. Kontrol berupa segmented control dengan tiga pilihan, dapat digunakan dengan keyboard, dan menyimpan pilihan pada query `view=value|median|completeness` agar tautan dapat dibagikan.

Panel provinsi yang sudah ada diperluas menjadi **Ringkasan wilayah**:

- nama serta kode provinsi;
- nilai indikator dan satuan;
- median, selisih poin persentase, serta posisi `x dari n`;
- kelengkapan indikator;
- periode, status rilis, dan sumber;
- kalimat batas interpretasi;
- CTA **Pahami kondisi wilayah**;
- CTA **Coba fokus ini di Studio** hanya ketika indikator valid untuk Studio.

Pada desktop, panel tetap berada di kanan peta. Pada mobile, panel menggunakan komponen isi yang sama dan ditempatkan setelah peta sebagai panel lipat; tidak memakai modal yang mengunci navigasi atau menutupi seluruh peta.

Tabel tetap berada di bawah peta. Memilih baris tabel memperbarui provinsi terpilih pada peta dan panel. Memilih provinsi pada peta memindahkan fokus ke ringkasan wilayah tanpa memaksa scroll pada desktop; pada mobile, halaman menggulir secara halus ke panel ringkasan dengan mempertimbangkan `prefers-reduced-motion`.

## Integrasi Studio

CTA menggunakan kontrak yang sudah ditetapkan oleh Ringkasan Prioritas Provinsi:

```text
/studio?level=<level>&release=<release-id>&province=<code>&focus=<source-id>
```

Jika mode peta memakai indikator yang dapat difokuskan, CTA membawa indikator tersebut. Jika indikator tidak termasuk `core_indicators`, CTA Studio tidak ditampilkan dan pengguna tetap dapat membuka profil wilayah. Studio tetap memvalidasi parameter dan memperlakukan bobot 70% sebagai preset yang dapat diubah, bukan rekomendasi kebijakan.

## Batas Modul

- **Service benchmark wilayah:** menyediakan hasil batch seluruh provinsi dan tetap menjadi sumber tunggal aturan median serta peringkat.
- **Router workspace:** memvalidasi parameter dan menyajikan endpoint agregat.
- **Schema OpenAPI:** mendefinisikan respons peta bertipe dan menjadi sumber tipe frontend.
- **Explorer page:** mengelola filter, mode, pilihan provinsi, query URL, loading, dan error insight.
- **ProvinceMap:** hanya merender geometri, warna, legenda, tooltip, fokus, dan event seleksi dari model presentasi yang diberikan.
- **Region map summary:** menyajikan rincian provinsi serta CTA tanpa menghitung benchmark sendiri.

`ProvinceMap` tidak melakukan fetch insight. Halaman Explorer mengambil observasi dan insight agregat, memvalidasi konteks respons, lalu memberikan data siap tampil kepada peta. Pemisahan ini menjaga komponen peta dapat diuji tanpa jaringan.

## Data Flow dan Performa

1. Explorer memuat workspace dan observasi sesuai indikator serta jenjang.
2. Explorer memuat endpoint insight agregat pada konteks rilis yang sama.
3. Geometry tetap dimuat satu kali dari `/api/v1/geometry` oleh komponen peta.
4. Perubahan mode hanya mengganti paint properties; tidak memicu permintaan API baru.
5. Perubahan indikator atau jenjang membatalkan atau mengabaikan respons lama menggunakan request id yang sudah dipakai halaman.
6. Respons dengan rilis, jenjang, atau indikator berbeda dari filter aktif ditolak sebelum dirender.

Satu endpoint agregat mencegah pola N+1 terhadap endpoint insight setiap provinsi. Endpoint tidak memperkenalkan cache persisten pada tahap ini; optimasi tambahan hanya dilakukan jika pengukuran produksi menunjukkan kebutuhan.

## Error dan Keadaan Kosong

- Jika basemap gagal, layer provinsi, legenda, panel, dan tabel tetap berfungsi seperti perilaku saat ini.
- Jika geometri gagal, tabel dan ringkasan hasil filter tetap tersedia dengan tombol muat ulang peta.
- Jika insight agregat gagal, mode **Nilai indikator** tetap tersedia. Mode median dan kelengkapan dinonaktifkan dengan pesan serta tombol coba lagi khusus insight.
- Jika observasi utama gagal, pertahankan error halaman yang sudah ada dan jangan menampilkan insight tanpa konteks.
- Jika semua nilai indikator kosong, tampilkan keadaan kosong yang eksplisit; jangan membuat skala warna palsu.
- Jika hanya satu provinsi memiliki nilai, median tetap dapat ditampilkan tetapi panel menjelaskan bahwa pembanding hanya satu wilayah.
- Kegagalan CTA atau navigasi tidak boleh mengubah data yang sedang ditampilkan.

## Aksesibilitas dan Responsif

- Segmented control memiliki nama grup, state aktif, urutan tab, dan indikator fokus yang terlihat.
- Peta tetap memiliki deskripsi singkat serta mengarahkan pengguna keyboard ke tabel sebagai kontrol wilayah lengkap.
- Tooltip hover tidak menjadi satu-satunya cara memperoleh informasi.
- Panel rincian memakai heading dan daftar deskripsi yang semantik.
- Target sentuh minimal 44 piksel dan tidak ada horizontal overflow pada lebar 320 piksel.
- Perubahan loading, error, dan pilihan wilayah diumumkan melalui live region yang sesuai tanpa mengumumkan setiap gerakan pointer.
- Animasi menghormati `prefers-reduced-motion`.

## Pengujian

### Backend

- Endpoint agregat mengembalikan seluruh provinsi pada rilis dan jenjang yang sama.
- Median ganjil/genap, peringkat tie, delta, serta nilai sama dengan median.
- Nilai kosong, wilayah tanpa sekolah, indikator tidak valid, dan hanya satu nilai valid.
- Kelengkapan indikator per provinsi dan alasan ketidaktersediaan.
- Keterikatan rilis, sumber, jenjang, periode, kepemilikan, unit, dan definisi.
- Endpoint batch dan endpoint provinsi menghasilkan benchmark yang konsisten.

### Frontend

- Mode awal, perpindahan tiga mode, legenda, dan warna data kosong.
- Sinkronisasi seleksi peta, panel, tabel, serta query URL.
- Panel menampilkan nilai, median, delta, peringkat, periode, sumber, dan limitasi.
- CTA profil dan Studio hanya muncul pada konteks yang valid.
- Insight error tidak merusak mode nilai, tabel, atau seleksi wilayah.
- Respons konteks lama atau tidak sesuai tidak dirender.
- Navigasi keyboard, live region, reduced motion, dan layout mobile.

### Kontrak dan Browser

- OpenAPI dan tipe frontend diperbarui bersama.
- Pemeriksaan schema memastikan kontrak tidak ditulis manual pada hasil generate.
- Alur browser mencakup memilih indikator, berpindah mode, memilih provinsi, membuka profil, dan membuka Studio dengan konteks yang benar.
- Fallback basemap serta geometri gagal tetap menyisakan jalur tabel yang dapat digunakan.

## Kriteria Penerimaan

- Pengguna dapat membaca nilai, posisi terhadap median, dan kelengkapan data tanpa meninggalkan Explorer.
- Semua kondisi relatif dapat ditelusuri ke angka, pembanding, periode, rilis, dan sumber.
- Mode peta tidak memicu permintaan insight per provinsi.
- Data kosong tidak diperlakukan sebagai nol atau kondisi fasilitas yang buruk.
- Kegagalan basemap, geometri, atau insight memiliki fallback yang tetap dapat digunakan.
- Peta dan tabel memiliki pilihan provinsi yang konsisten pada desktop dan mobile.
- CTA Studio menggunakan preset 70% yang dapat diubah dan tidak diklaim sebagai rekomendasi resmi.
- Fitur lulus pemeriksaan backend, frontend, kontrak API, build, dan alur browser yang relevan.
