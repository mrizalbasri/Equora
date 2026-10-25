# Keputusan dan pertanyaan terbuka

Terakhir diperbarui: 21 Oktober 2026. Status keputusan mengikuti bukti di repo dan persetujuan eksplisit pengguna. [Audit kesiapan](implementation-readiness.md) mencatat status implementasi dan bukti pengujian terkini.

| ID | Topik | Status / langkah berikut |
|---|---|---|
| D-01 | Cabang WIA | Dasar review karena BRD/PRD menargetkan WIA; konfirmasi pendaftaran aktual |
| D-02 | Subtema | Rekomendasi utama Data-Driven Decision Support; lebih dari satu diperbolehkan pada slide 21 |
| D-03 | Arah UI | DESIGN v1.2 Clean Education Blue disetujui 20 Oktober 2026 berdasarkan referensi dashboard pengguna: panel putih, biru utama, canvas abu-abu sangat muda, sudut/bayangan lembut dan teks kontras. Menggantikan palet coral; PRD, web dan system design diselaraskan. Ilustrasi sekolah sederhana, tanpa maskot wajib |
| D-04 | Stack | Baseline SvelteKit/FastAPI/PostgreSQL, Polars, OR-Tools disetujui pengguna pada 19 Okt; fondasi dan dependensi disiapkan sesuai [setup stack](setup-stack.md), alasan dan alternatif di [stack teknis](technical-stack.md). MCDA/alokasi tersedia sebagai sandbox; data/API domain belum terintegrasi |
| D-05 | Granularitas, jenjang, tahun | Ditentukan setelah audit file sumber |
| D-06 | Biaya intervensi | Cari referensi resmi atau gunakan asumsi demo berlabel |
| D-07 | Nama tim, anggota dan PIC | Tim dua orang dikonfirmasi; pembagian PIC per paket tersedia, nama dan kapasitas jam belum diberikan |
| D-08 | GitHub | Pengguna memilih publik mrizalbasri/Equora; repository dibuat dan commit awal diunggah pada 18 Oktober 2026 |
| D-09 | Lisensi kode | Pemilik memilih sebelum memberi izin penggunaan ulang |
| D-10 | Scope first draft | Penyederhanaan di evaluasi kompetisi adalah usulan, belum perubahan PRD |
| D-11 | Rubrik final | Konfirmasi selisih total bobot slide 27 ke panitia |
| D-12 | Penggunaan AI | Konfirmasi aturan dan disclosure panitia sebelum klaim orisinalitas final |
| D-13 | Solver final | CP-SAT kandidat awal untuk paket integer/boolean; evaluasi MIP sesuai model. Pilihan final menunggu audit data, validasi, dan benchmark yang setara |
| D-14 | Bukti hasil engine | Sandbox sintetis di main: 20 tes MCDA dan 35 tes alokasi lulus pada 21 Oktober; enumerasi, baseline, sensitivitas, status dan reproduksibilitas dicakup. Belum merupakan benchmark data produksi atau validasi integrasi |
| D-15 | Target performa | Tetapkan ukuran kasus, latensi, memori dan concurrency setelah data/hosting diketahui, sebelum benchmark; belum ada angka yang disepakati |
| D-16 | Peta | MapLibre GL JS + Protomaps/PMTiles + basemap OSM diimplementasikan lokal pada 21 Okt. Layer indikator GeoJSON, label basemap, atribusi dan fallback tetap tersedia; lihat [rencana peta](map-plan.md) |
| D-17 | Aset dan hosting peta | Subset Indonesia bbox 94,-12,142,7, zoom 0–7 dari Protomaps 4.15.2 disajikan sebagai aset lokal. Versi/hash di [manifest](../data/metadata/basemap-local.json); font GitHub dipin. Hosting produksi, target performa serta audit boundary untuk redistribusi publik tetap terbuka |
| D-18 | Pembagian kerja | Pengguna menyetujui porsi mayoritas/inti di pemilik; perkiraan 75-80% pemilik dan 20-25% teman. [Panduan per fitur](pembagian-kerja/README.md) menetapkan landing/about, katalog, metodologi dan QA untuk teman; halaman pendukung sudah tersedia di main, pengukuran jam belum ada |
| D-19 | Database lokal | Pengguna mengonfirmasi memakai PostgreSQL Docker yang sudah ada, tanpa instance baru. Database `equora` dan `equora_test` dibuat 21 Oktober 2026 pada `postgres-local` dengan owner terpisah; migrasi/tes mengikuti [registry draft](dataset-registry.md). Target produksi belum dipilih |

Pertanyaan panitia disiapkan untuk pengguna; belum dikirim kepada siapa pun. Tidak ada deadline jam yang ditebak. Setelah mendapat jawaban, catat tanggal, kanal, isi keputusan dan dokumen yang perlu diperbarui.

## Akses publik — 25 Oktober 2026

Eksplorasi data, profil daerah dan simulasi tersedia tanpa akun. Integrasi Clerk dan halaman masuk, daftar serta akun dihapus karena belum ada fungsi pribadi per pengguna. Snapshot tetap memakai workspace bersama. Impor data tetap dibatasi dengan token admin backend.
