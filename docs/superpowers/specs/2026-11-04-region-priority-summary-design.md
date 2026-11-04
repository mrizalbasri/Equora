# Desain Ringkasan Prioritas Provinsi

Tanggal: 4 November 2026
Status: Siap direview pengguna

## Ringkasan

Equora akan menambahkan ringkasan benchmark pada halaman `/daerah`. Ringkasan membantu pengguna menemukan indikator fasilitas yang nilainya relatif lebih rendah atau lebih tinggi dibanding median provinsi pada rilis, jenjang, periode, kepemilikan, dan definisi data yang sama.

Fitur ini bersifat deskriptif. Ringkasan tidak menetapkan wilayah prioritas resmi, tidak menjelaskan penyebab perbedaan, dan tidak menggantikan penilaian kebijakan. Seluruh perhitungan deterministik dan tidak menggunakan AI atau sumber data baru.

## Tujuan

- Mengubah deretan angka profil provinsi menjadi titik awal analisis yang mudah dipahami.
- Menjaga setiap insight dapat ditelusuri ke nilai, median, periode, rilis, dan sumbernya.
- Menghubungkan indikator yang perlu diperhatikan ke Studio tanpa menghilangkan kontrol pengguna atas bobot, wilayah, biaya, atau kapasitas.
- Menangani data kosong, wilayah tanpa sekolah, dan status `local_review` secara eksplisit.

## Bukan Tujuan

- Menyatakan sebuah provinsi "buruk", darurat, atau pasti membutuhkan intervensi.
- Menentukan penyebab kesenjangan fasilitas.
- Menghasilkan rekomendasi anggaran resmi.
- Membandingkan data yang berbeda rilis, jenjang, periode, kepemilikan, unit, atau definisi.
- Menambah data kabupaten/kota, wilayah 3T, atau sumber eksternal baru.

## Alur Pengguna

1. Pengguna memilih provinsi dan jenjang pada `/daerah`.
2. Profil dan ringkasan benchmark dimuat pada rilis yang sama.
3. Pengguna melihat tiga bagian:
   - **Perlu diperhatikan:** indikator dengan selisih negatif terbesar terhadap median, hanya jika ada indikator di bawah median.
   - **Relatif kuat:** indikator dengan selisih positif terbesar terhadap median, hanya jika ada indikator di atas median.
   - **Kelengkapan data:** jumlah indikator yang dapat dibandingkan dan alasan indikator lain tidak disertakan.
4. Pengguna dapat membuka rincian semua indikator benchmark.
5. Dari bagian "Perlu diperhatikan", pengguna dapat memilih **Coba fokus ini di Studio**.
6. Studio membuka rilis, jenjang, dan provinsi yang sama serta mengisi bobot awal untuk indikator tersebut. Pengguna tetap harus memeriksa dan dapat mengubah seluruh asumsi sebelum menghitung.

## Kontrak API

Tambahkan endpoint:

```text
GET /api/v1/regions/{code}/insights
  ?education_level=SD
  &release_id=<release-id>
```

Respons memuat konteks yang dikunci dan benchmark mentah:

```text
release_id
status
academic_year
education_level
ownership
region: { code, name }
available_indicators
total_indicators
attention_source_id | null
strength_source_id | null
benchmarks[]:
  source_id
  value | null
  median | null
  delta_from_median | null
  rank | null
  available_regions
  comparison: below | equal | above | unavailable
  unavailable_reason | null
limitations[]
```

Endpoint memakai `local_release()` yang sama dengan profil wilayah. Kode wilayah, rilis, dan jenjang yang tidak tersedia menggunakan perilaku 404/422 yang sudah berlaku pada endpoint profil.

## Aturan Perhitungan

- Hanya sumber dengan unit `percent` yang masuk benchmark.
- Kelompok pembanding hanya terdiri dari provinsi pada rilis, jenjang, kepemilikan, periode, unit, definisi, dan sumber yang sama.
- Nilai `null`, nilai tidak valid, dan persentase pada wilayah dengan jumlah sekolah nol dikeluarkan dari median serta peringkat.
- Median memakai median statistik biasa. Untuk jumlah nilai genap, median adalah rata-rata dua nilai tengah.
- `delta_from_median = value - median` dalam poin persentase.
- Peringkat diurutkan dari akses tertinggi ke terendah dan memakai standard competition ranking (`1, 1, 3`). Nilai yang sama memperoleh peringkat yang sama.
- `attention_source_id` adalah indikator valid dengan delta negatif paling kecil. Jika tidak ada nilai di bawah median, nilainya `null`.
- `strength_source_id` adalah indikator valid dengan delta positif paling besar. Jika tidak ada nilai di atas median, nilainya `null`.
- Jika dua indikator memiliki delta yang sama, urutan `core_indicators` pada rilis menjadi tie-breaker agar hasil deterministik.
- API mengembalikan angka dan kategori, bukan klaim penyebab atau kalimat kebijakan.

## Antarmuka `/daerah`

Ringkasan ditempatkan setelah ikhtisar profil dan sebelum pemilih provinsi pembanding. Penempatan ini membuat insight terlihat lebih awal tanpa menggantikan rincian sumber. Judul yang terlihat oleh pengguna adalah **Ringkasan kondisi relatif**, agar kata "prioritas" tidak disalahartikan sebagai penetapan resmi.

### Kartu perlu diperhatikan

- Menampilkan nama indikator, nilai provinsi, median, selisih poin persentase, dan posisi `x dari n`.
- Menggunakan frasa "akses relatif lebih rendah dibanding median provinsi pada cakupan yang sama".
- Menyertakan tautan ke rincian indikator dan tombol menuju Studio.
- Jika tidak ada indikator di bawah median, tampilkan keadaan netral; jangan memaksakan indikator terendah sebagai masalah.

### Kartu relatif kuat

- Menampilkan bukti yang sama untuk indikator dengan delta positif terbesar.
- Menjelaskan bahwa nilai lebih tinggi tidak membuktikan kualitas layanan, pemerataan antarsekolah, atau penyebab tertentu.
- Jika tidak ada indikator di atas median, tampilkan keadaan netral.

### Kelengkapan dan rincian

- Menampilkan `available_indicators dari total_indicators`.
- Daftar rincian memuat semua indikator, median, selisih, peringkat, jumlah provinsi pembanding, periode, dan tautan sumber.
- Indikator yang tidak tersedia tetap ditampilkan dengan alasan yang spesifik.
- Status `local_review` dan batas penggunaan profil tetap terlihat.

## Integrasi Studio

Tautan menggunakan parameter berikut:

```text
/studio?level=<level>&release=<release-id>&province=<code>&focus=<source-id>
```

Studio memvalidasi `focus` terhadap `workspace.core_indicators`. Jika valid, bobot awal menjadi 70 untuk indikator fokus dan sisa 30 dibagi ke indikator inti lain. Pembagian memakai bilangan bulat; sisa pembulatan diberikan mengikuti urutan `core_indicators` sehingga total selalu 100. Jika hanya ada satu indikator inti, bobotnya menjadi 100. Jika `focus` tidak valid, Studio mempertahankan preset seimbang dan menampilkan konteks profil tanpa error.

Studio harus menjelaskan bahwa bobot tersebut hanya titik awal dari profil provinsi. Pengguna dapat mengubah bobot dan cakupan; Equora tidak menyatakan bobot tersebut sebagai rekomendasi kebijakan.

## Batas Modul

- Backend workspace API: validasi konteks dan serialisasi endpoint.
- Service benchmark wilayah baru: perhitungan median, peringkat, delta, pilihan indikator, dan alasan data tidak tersedia.
- Schema OpenAPI: kontrak respons bertipe untuk frontend.
- Komponen ringkasan wilayah baru: presentasi kartu, keadaan netral, rincian, dan CTA.
- Studio: pembacaan serta validasi parameter `focus` saja; logika benchmark tidak diduplikasi di frontend.

## Error dan Keadaan Kosong

- Kegagalan ringkasan tidak menghilangkan profil wilayah. UI menampilkan pesan ringkas dan tombol coba lagi khusus insight.
- Respons profil dan insight yang berbeda rilis, jenjang, atau kode wilayah ditolak oleh frontend dan tidak dirender bersama.
- Jika semua indikator tidak tersedia, tampilkan penjelasan kelengkapan tanpa kartu perhatian atau kekuatan.
- Jika hanya satu provinsi memiliki nilai valid, median dapat dihitung tetapi UI menjelaskan bahwa pembanding hanya satu wilayah dan tidak menyajikan klaim relatif.

## Aksesibilitas dan Responsif

- Urutan heading tetap logis dan kartu menggunakan elemen semantik, bukan warna sebagai satu-satunya pembeda.
- Status loading, error, dan retry diumumkan melalui `role="status"` atau `role="alert"` yang sesuai.
- Tombol dan tautan memiliki nama aksesibel serta target sentuh minimal 44 piksel.
- Pada layar kecil kartu menjadi satu kolom tanpa horizontal overflow.
- Tabel rincian menggunakan caption dan header kolom; pada mobile tersedia area scroll yang diberi label.

## Pengujian

### Backend

- Median untuk jumlah nilai ganjil dan genap.
- Peringkat dengan nilai yang sama.
- Tie-breaker indikator deterministik.
- Pengecualian nilai kosong, invalid, dan wilayah tanpa sekolah.
- Keadaan semua sama, semua kosong, dan hanya satu nilai valid.
- Keterikatan kode wilayah, rilis, jenjang, periode, unit, definisi, dan sumber.
- Respons 404/422 mengikuti endpoint profil.

### Frontend

- Kartu perhatian, kekuatan, kelengkapan, dan keadaan netral.
- Insight error tidak menghilangkan profil.
- Penolakan konteks insight yang tidak sesuai profil.
- Rincian sumber, status `local_review`, dan batas penggunaan tetap terlihat.
- CTA menghasilkan parameter Studio yang benar.
- Studio menerapkan fokus valid serta fallback aman untuk fokus invalid.
- Navigasi keyboard, nama aksesibel, tampilan mobile, dan tanpa overflow.

### Kontrak

- OpenAPI dan tipe frontend diperbarui bersama.
- Pemeriksaan schema memastikan field baru tidak ditulis manual pada file hasil generate.

## Kriteria Penerimaan

- Pengguna dapat memahami indikator yang relatif di bawah atau di atas median tanpa memilih provinsi pembanding secara manual.
- Setiap klaim relatif menampilkan nilai, median, cakupan pembanding, periode, dan sumber yang dapat ditelusuri.
- Tidak ada bahasa kausal atau rekomendasi anggaran resmi.
- Data tidak lengkap tidak diperlakukan sebagai nol.
- Studio menerima konteks fokus sebagai preset yang dapat diubah, bukan keputusan otomatis.
- Fitur lulus pemeriksaan backend, frontend, kontrak API, build, dan alur browser yang relevan.
