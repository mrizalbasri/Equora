# Kesesuaian Equora dengan WIA MIA 2026

**Pembaruan 27 Oktober 2026:** PDF Technical Meeting asli ditinjau secara visual.
Nama tim yang dikonfirmasi adalah **Lock In**. Implementasi lokal sekarang
memiliki alur publik tanpa akun; 60 tes browser dan 11 unit test frontend lulus
setelah login dihapus. Baca [matriks kesiapan terkini](competition-readiness-2026-10-27.md)
untuk persyaratan per tahap, bobot rubrik, bukti dan prioritas submission.
Subtema terdaftar, izin publikasi data dan kelengkapan pengumpulan belum
dibuktikan. Bagian berikut adalah audit awal, bukan inventaris fitur terbaru.

## Audit awal (historis)

**Kesimpulan: konsep sesuai; implementasi dan kelengkapan submission belum siap.** Penilaian ini membandingkan rencana di BRD/PRD dengan materi Technical Meeting pengguna, bukan penetapan kelulusan oleh panitia.

## Tema dan subtema

Halaman 20 menekankan transparansi data/layanan publik dan pengolahan data secara fungsional. Equora memakai data fasilitas pendidikan untuk menunjukkan kebutuhan wilayah, alasan prioritas, dan trade-off alokasi; ini mendukung tema tersebut.

Subtema utama yang disarankan: **Data-Driven Decision Support**. Open Government Data dapat menjadi pendukung, tetapi deskripsi di halaman 21 menyebut real-time. Dataset tahunan Equora harus tetap dilabeli tahunan; konfirmasi kepada panitia jika memilih subtema pendukung ini. Halaman 21 membolehkan lebih dari satu subtema, berbeda dari asumsi BRD sebelumnya. Subtema pendaftaran aktual belum diketahui.

## Pemetaan rubrik penyisihan (halaman 26)

| Kriteria | Bobot | Rencana yang relevan | Bukti yang belum ada |
|---|---:|---|---|
| Orisinalitas ide dan konsep | 20% | Perbandingan skenario dengan kontribusi bobot dan asumsi terbuka | Studi pembanding, catatan kontribusi tim, aset berlisensi |
| Fungsionalitas website | 25% | Explorer, ranking, simulator dan perbandingan | Aplikasi berjalan, responsive check, pengujian end-to-end |
| Desain dan estetika | 20% | Baseline UI Clean Education Blue | Mockup terverifikasi dan UI browser nyata |
| Konten dan informasi | 20% | Provenance, metode, tahun dan disclaimer | File sumber, kamus data, hasil quality check |
| Kesesuaian tema/subtema | 15% | Data publik menjadi insight keputusan | Demo yang membuktikan alur data hingga insight |

Bobot bukan skor yang sudah diperoleh. Konsep saja tidak membuktikan orisinalitas atau kualitas implementasi.

## Koreksi terhadap dokumen awal

| Topik | Materi Technical Meeting | Tindakan |
|---|---|---|
| Pemilihan subtema | Boleh lebih dari satu, hlm. 21 | Koreksi klaim wajib satu |
| First Draft | 1 November 2026, hlm. 15 dan 22 | Gunakan tanggal ini sebagai baseline |
| Nama PDF First Draft | WIA_FSDMIA2026_NamaTim, hlm. 22 | Gunakan tahun 2026 |
| Proposal penyisihan | Maksimal 30 halaman, hlm. 23 | Tambahkan pada checklist |
| Gamifikasi | Misi peserta wajib, hlm. 11-14 | Catat sebagai kegiatan peserta, bukan fitur Equora |
| Rubrik final | Baris bobot 15+25+20+20 = 80, total tertulis 100, hlm. 27 | Minta klarifikasi; jangan menciptakan bobot tambahan |

## Prioritas yang disarankan

Rencana P0 cukup besar untuk periode pengerjaan 19 Oktober-1 November. Utamakan satu alur utuh: sumber tervalidasi → explorer → peringkat dengan alasan → dua skenario → perbandingan. Mulai dari satu unit wilayah dan jenjang yang kompatibel. Peta, forecasting, RAG, dan orkestrasi ETL tetap bersyarat sesuai PRD.

Usulan penyederhanaan untuk ditinjau: impor melalui script terlebih dahulu, penyimpanan skenario lokal untuk demo, dan satu jenis intervensi. Ini belum mengganti persyaratan PRD tentang admin, penyimpanan, atau ekspor.

## Batas review

Tidak ada source code, dataset mentah, deployment, screenshot hasil aplikasi, atau pengujian produk saat review awal. Dokumen desain menyebut baseline disetujui; sesi ini tidak memverifikasi sejarah persetujuannya. Aturan penggunaan AI tidak dijelaskan secara eksplisit pada halaman WIA yang ditinjau; tanyakan panitia tentang penggunaan dan disclosure yang diperbolehkan, tanpa menganggap diperbolehkan atau dilarang.
