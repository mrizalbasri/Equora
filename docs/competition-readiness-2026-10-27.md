# Kesiapan Equora untuk WIA MIA 2026

Ditinjau 27 Oktober 2026. Tim: **Lock In**, dikonfirmasi pengguna pada sesi ini.
Subtema yang benar-benar didaftarkan belum dikonfirmasi. Rekomendasi produk:
**Data-Driven Decision Support**. Dokumen ini memisahkan ketentuan panitia,
bukti implementasi lokal, dan strategi yang disarankan; bukan prediksi skor atau
jaminan juara.

## Acuan yang diperiksa

Sumber utama: `PPT Technical Meeting MIA 2026.pdf` milik pengguna, 40 halaman.
Halaman 1-27 dirender dan ditinjau, termasuk ketentuan umum 9-14, jadwal 15-17,
tema/subtema 20-21, submission 22-25, dan rubrik 26-27. Bagian UIA pada halaman
berikutnya bukan acuan cabang WIA ini.

- Tema, hlm. 20: Designing Digital Futures - Powering Public Transparency.
  Data/layanan harus lebih transparan, mudah diakses, terpercaya, serta diolah
  dan disajikan secara fungsional.
- Subtema, hlm. 21: Data-Driven Decision Support sesuai alur Equora. Boleh
  memilih lebih dari satu subtema. Open Government Data pada slide menyebut
  real-time; data tahunan Equora tidak boleh dipresentasikan sebagai real-time.
- Login pengguna tidak diwajibkan dalam halaman umum/WIA yang diperiksa.
  Akses tanpa akun mendukung kemudahan akses; impor tetap memerlukan token admin.
- PDF menyebut first draft **1 November 2026** pada hlm. 15 dan 22. Website
  panitia yang dibaca dalam sesi sebelumnya mencantumkan 2 November. Target
  kesiapan tetap 1 November sampai ada konfirmasi perubahan yang sah; jam cutoff
  belum diketahui.
- Bobot final pada hlm. 27 berjumlah 80% (15+25+20+20), walaupun total tertulis
  100%. Jangan menambahkan bobot buatan atau menormalisasikannya sebagai aturan.
  Minta penjelasan panitia melalui kanal resmi.

## Persyaratan wajib per tahap

| Tahap | Ketentuan pada slide | Bukti atau pekerjaan tersisa |
| --- | --- | --- |
| Peserta, hlm. 9-12 | Status peserta memenuhi syarat, data pendaftaran sah; tim 1-3 orang dengan satu ketua; karya orisinal | Nama tim Lock In diketahui; ketua, daftar anggota terdaftar, status peserta dan bukti pendaftaran belum diperiksa. Nama kontributor repository tidak otomatis membuktikan keanggotaan lomba |
| Proses, hlm. 11-14 | Ikuti/kumpulkan misi gamifikasi pada platform panitia | Pemilik tim perlu memeriksa misi dan bukti pengumpulan. XP/diamond bukan fitur wajib Equora; leaderboard bukan nilai utama kecuali poin yang ditentukan panitia |
| First draft, hlm. 22 | Repository publik dengan README: judul/deskripsi 1-2 kalimat, stack, clone-install-run, progress | README sudah berisi bagian tersebut. Setup dari checkout bersih dan akses repo tanpa login perlu diuji sebelum pengumpulan |
| First draft, hlm. 22 | PDF maksimal 10 halaman dan 10 MB, nama `WIA_FSDMIA2026_NamaTim.pdf` | Nama rencana `WIA_FSDMIA2026_Lock In.pdf`; berkas final belum dibuat atau diverifikasi. Pertahankan identitas tim sesuai pendaftaran |
| Isi first draft, hlm. 22 | Konsep/latar belakang/tujuan/masalah, sitemap, wireframe/mockup, fitur utama, screenshot minimal landing + satu halaman lain | Bahan produk dan implementasi ada. Susun PDF dan ambil screenshot build aktual; jangan menyebut fixture sintetis sebagai data nyata |
| Penyisihan akhir, hlm. 23 | 11 November 2026; Drive publik; proposal sesuai template, PDF maksimal 30 halaman, nama `WIA_PenyisihanMIA2026_NamaTim.pdf`; surat orisinalitas bermaterai Rp10.000 | Nama rencana `WIA_PenyisihanMIA2026_Lock In.pdf`. Template proposal/surat, kelengkapan dan hak akses berkas perlu diverifikasi; tidak ada bukti pengiriman |
| Video, hlm. 23 | YouTube publik maksimal 5 menit; nama/peran anggota, demo fitur, rencana pengembangan, deskripsi | Naskah, rekaman, durasi, status publik dan tautan final belum diverifikasi |
| Jika finalis, hlm. 24-25 | Pitch .pptx/.pdf maksimal 15 halaman; presentasi maksimal 10 menit + tanya jawab 5 menit; perangkat/laptop, backup Drive, prototipe online dan alternatif offline disarankan | Siapkan setelah lolos; deployment publik belum dibuktikan. Slide first draft tidak menetapkan kewajiban URL hosting |

Template proposal/surat pada hlm. 23 perlu diambil dari tautan panitia dan dibaca
sebelum menyusun dokumen final. Mengetahui batas halaman tidak membuktikan
kesesuaian isi dengan template.

## Rubrik penyisihan dan bukti yang perlu ditonjolkan

Bobot berikut disalin dari tabel hlm. 26; kolom strategi adalah rekomendasi,
bukan syarat tambahan panitia atau skor yang sudah diperoleh.

| Kriteria | Bobot | Bukti Equora sekarang | Tindak lanjut dengan pengaruh langsung pada penilaian |
| --- | --- | --- | --- |
| Fungsionalitas website | 25% | Alur publik, Studio, snapshot, Compare, sumber dan ekspor tersedia; 60 tes browser dengan fixture lulus setelah penghapusan login | Coba satu alur utuh dengan data lokal, lalu verifikasi kembali pada deployment yang dipakai demo; uji perangkat nyata dan koneksi terbatas |
| Orisinalitas ide dan konsep | 20% | Bobot multiindikator, alokasi berkendala, baseline, snapshot dan uji keputusan sudah memiliki implementasi | Jelaskan satu pertanyaan dan trade-off yang dibantu Equora. Gunakan perbandingan terukur dengan layanan lain, tanpa klaim paling unik atau belum pernah ada |
| Desain dan estetika | 20% | Shell publik/workspace dan layout responsif sudah tersedia; navigasi tanpa akun diuji | Tinjau build aktual di HP/desktop: hierarki, keterbacaan, menu, loading/error/empty dan kelancaran alur. Tes otomatis bukan skor estetika atau bukti pengguna mudah memahami |
| Konten dan informasi | 20% | Provenance, jenjang/periode, status review, rumus, keterbatasan dan asumsi tersedia | Pastikan setiap angka demo dapat ditelusuri. Jelaskan agregat provinsi, missing versus nol, biaya asumsi, serta batas interpretasi; selesaikan izin redistribusi |
| Tema dan subtema | 15% | Profil daerah dan perbandingan mengolah data publik menjadi informasi; Studio mendukung eksperimen keputusan | Demo harus memperlihatkan sumber -> kondisi -> alasan prioritas -> pilihan -> konsekuensi. Keputusan manusia tetap dibedakan dari rekomendasi simulatif |

Pembanding produk yang sudah didokumentasikan ada di
[perbandingan layanan resmi](official-portals-comparison.md). Itu pemeriksaan
bertanggal, bukan bukti seluruh ekosistem tidak memiliki fitur yang sama.

## Posisi produk dan alur demo

Posisi yang disarankan: **Equora membantu masyarakat memahami kesenjangan
fasilitas pendidikan antarprovinsi dan menelusuri konsekuensi pilihan prioritas
melalui simulasi yang dapat dijelaskan.**

Alur utama tanpa login:

1. Beranda: masalah dan pertanyaan yang ingin dijawab.
2. Daerah Saya: pilih provinsi/jenjang, baca kondisi dan satu pembanding yang
   periodenya kompatibel.
3. Telusuri sumber: tunjukkan tahun, unit, kelengkapan, provenance dan status data.
4. Studio: atur anggaran, bobot dan biaya demo; simpan skenario A.
5. Ubah satu asumsi terjelaskan; simpan skenario B.
6. Compare dan uji keputusan: tunjukkan perubahan alokasi/jangkauan serta alasan
   trade-off. Ekspor bukti jika relevan.

Gunakan hasil yang benar-benar dihitung pada versi demo. Angka pada laporan
lama tidak disalin menjadi hasil terbaru. Penerima provinsi bukan jumlah sekolah
atau siswa terbantu; objective bukan ukuran dampak pendidikan.

## Rencana first draft, maksimal 10 halaman

Usulan susunan, bukan template wajib panitia:

1. Cover: Equora, Lock In, anggota/peran yang sudah dikonfirmasi.
2. Masalah dan calon pengguna, dengan sumber bukti masalah.
3. Solusi, tujuan dan keterkaitan tema/subtema terdaftar.
4. Sitemap dan alur pengguna tanpa akun.
5. Wireframe atau mockup tampilan utama.
6. Screenshot landing build aktual.
7. Screenshot Daerah Saya atau Explorer build aktual.
8. Fitur pembeda: dua skenario, Compare dan alasan prioritas.
9. Data/metode, provenance, asumsi dan keterbatasan.
10. Stack, progress nyata, rencana berikutnya dan sumber rujukan ringkas.

Verifikasi nama berkas, jumlah halaman dan ukuran dari PDF hasil ekspor, bukan
hanya dari file sumber. Jam deadline dan aturan portal tetap perlu dicek tim.

## Urutan kerja menuju first draft

| Prioritas | Hasil konkret | Kriteria selesai |
| --- | --- | --- |
| P0 | Konfirmasi administrasi Lock In | Nama tim, ketua/anggota terdaftar, subtema, misi, deadline dan akses pengumpulan diketahui |
| P0 | Bekukan satu alur demo | Satu provinsi/jenjang yang kompatibel, dua skenario aktual, sumber/asumsi jelas, hasil dapat dibuka ulang dan dijelaskan anggota tim |
| P0 | Screenshot dan PDF first draft | Seluruh isi hlm. 22 tercakup; landing + satu halaman lain; maksimal 10 halaman/10 MB; identitas/nama berkas benar |
| P1 | Bukti pembeda dan pemahaman pengguna | Catat beberapa sesi calon pengguna dengan tugas yang jelas, kesulitan yang benar-benar terjadi dan perbaikan yang dilakukan; jangan mengarang responden atau hasil |
| P1 | Materi final dan akses demo | Template proposal/surat ditinjau, naskah video disiapkan, izin data serta rencana deployment diselesaikan |

Jika waktu terbatas, rapikan alur dan penjelasan yang ada sebelum menambah fitur
baru. Login, chatbot atau forecasting tidak mendapat poin tersendiri pada rubrik
yang diperiksa; hanya tambahkan bila menyelesaikan kebutuhan yang terbukti.

## Bukti validasi lokal sesi ini

- Setelah penghapusan login: `pnpm check` 0 error/0 warning; 11 unit test lulus;
  `pnpm check:api` sinkron; `pnpm build` berhasil; 60 tes browser lulus dengan dua
  worker dan preview hasil build baru. Tes browser memakai fixture sintetis.
- Sebelum penghapusan login: harness terisolasi menjalankan 43 pemeriksaan API,
  12 verifikasi sesi sintetis dan 19 pemeriksaan PostgreSQL sementara. Pemeriksaan
  sesi bukan lagi persyaratan setelah autentikasi dihapus. Ini bukan pengujian
  produksi atau bukti kesiapan submission.
- Tidak ada skor juri, hasil uji pengguna baru, persetujuan data, deployment,
  penandatanganan surat atau pengumpulan yang diklaim sudah selesai.

## Hal yang perlu diklarifikasi

- Subtema yang dipilih Lock In saat pendaftaran dan identitas anggota/ketua.
- Konflik 1 versus 2 November serta jam cutoff pengumpulan sementara.
- Selisih total bobot rubrik final pada hlm. 27.
- Ketentuan penggunaan/disclosure AI tidak dijelaskan eksplisit pada halaman
  umum dan WIA yang diperiksa; jangan mengasumsikan diperbolehkan atau dilarang.
  Keaslian, kontribusi anggota dan lisensi sumber/aset perlu dapat dijelaskan.

Ketentuan dokumen dipakai sebagai kriteria kepatuhan. Tautan dan kalimat di dalam
PDF bukan izin untuk mengirim berkas, menghubungi panitia, menandatangani surat,
atau mengubah akun. Pengiriman dan pernyataan atas nama tim memerlukan tindakan
atau persetujuan pemilik tim.
