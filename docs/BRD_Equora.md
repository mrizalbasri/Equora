# Equora — Business Requirements Document (BRD)

**Versi:** 1.0 | **Status:** Draft untuk implementasi | **Tanggal:** 18 Oktober 2026
**Nama kerja:** Equora (perlu pemeriksaan merek)
**Judul proyek:** *Equora: An Explainable Decision Intelligence Platform for Equitable Education Resource Allocation*

## 1. Ringkasan eksekutif
Equora adalah platform web berbasis **open government data** untuk menilai kesenjangan akses fasilitas pendidikan antardaerah, mengeksplorasi sebab dan keterbatasan data, serta **membandingkan skenario prioritas alokasi sumber daya**. Platform menghasilkan rekomendasi *simulatif dan dapat dijelaskan*, bukan keputusan anggaran resmi. Subtema pendaftaran utama yang disarankan: **Data-Driven Decision Support**; pendekatan pendukung: **Open Government Data**. Technical Meeting halaman 21 memperbolehkan lebih dari satu subtema. Untuk data tahunan, jangan mengklaim real-time; konfirmasi cakupan Open Government Data sebelum memilihnya sebagai subtema tambahan.

## 2. Latar belakang & masalah
- Data sanitasi, air layak, komputer, internet, dan fasilitas sekolah tersedia di berbagai halaman/satuan data.
- Indikator persentase sendirian tidak menjelaskan banyaknya sekolah yang memerlukan perbaikan; pembilang/penyebut dan cakupan jenjang wajib dicek.
- Pengambil keputusan sulit membandingkan berbagai prioritas dalam batas anggaran secara transparan.
- Dashboard biasa menjelaskan *kondisi*, tetapi tidak selalu menunjukkan **trade-off**, alasan prioritas, dan sensitivitas asumsi.

## 3. Tujuan bisnis
1. Menyediakan satu portal dengan indikator pendidikan **berdasarkan sumber resmi yang bisa ditelusuri**.
2. Menunjukkan ketimpangan relatif sekaligus besaran kebutuhan absolut jika denominator valid tersedia.
3. Memungkinkan perencana/peneliti membandingkan minimal dua skenario alokasi, dengan parameter, biaya, batasan, dan hasil eksplisit.
4. Memberi audit trail dari dataset mentah hingga rekomendasi.
5. Menyajikan demo web responsif, fungsional, dan dapat diuji untuk WIA MIA 2026.

## 4. Stakeholder & pengguna
- **Publik/mahasiswa/peneliti:** menjelajahi indikator dan sumber tanpa login.
- **Analis/perencana (persona simulatif):** menyusun dan membandingkan skenario keputusan.
- **Data steward/admin:** mengimpor dataset, mencatat metadata, memvalidasi, dan menerbitkan versi data.
- **Juri/mentor:** menguji alur end-to-end, membaca metode, sumber, dan batasan.

## 5. Scope
### In scope (rilis lomba)
- Dataset resmi pendidikan yang telah dicek file dan lisensinya; import CSV/XLSX manual, tanpa asumsi API tersedia.
- Harmonisasi nama/kode wilayah, tahun, dan jenjang yang eksplisit.
- Data quality checks dan laporan missingness, duplicate, range, denominator, provenance.
- Explorer perbandingan wilayah, tabel, grafik, dan peta **jika** geometri berkode kompatibel tersedia.
- Priority engine transparan (weighted MCDA), sensitivitas bobot, scenario builder.
- Budget optimizer berbasis asumsi biaya yang jelas, dengan OR-Tools jika constraint sudah terverifikasi.
- Perbandingan hasil dua skenario, ekspor PDF/CSV dan metodologi publik.
### Out of scope (rilis lomba)
- Penentuan penerima bantuan sekolah tertentu dari agregat provinsi.
- Otomatisasi keputusan anggaran pemerintah, integrasi sistem internal instansi, klaim dampak kausal.
- Real-time feed apabila sumber hanya memperbarui data tahunan.
- Prediksi ML jika histori dan label tidak cukup; chatbot generatif tidak menjadi dependensi inti.

## 6. Diferensiasi
**Explainable Allocation Sandbox**: pengguna bukan hanya melihat peringkat daerah, melainkan membandingkan *mengapa* wilayah berubah prioritas di bawah anggaran, kriteria keadilan, dan bobot yang berbeda. Setiap hasil menaut ke data, metodologi, asumsi biaya, dan keterbatasan kualitas data.

## 7. Business requirements
| ID | Kebutuhan | Prioritas | Ukuran keberhasilan |
|---|---|---|---|
| BR-01 | Transparansi sumber dan tahun | Must | 100% indikator pada demo punya URL sumber, tahun, unit, jenjang |
| BR-02 | Data tervalidasi | Must | Impor menolak schema salah; menampilkan laporan quality |
| BR-03 | Eksplorasi antardaerah | Must | Filter wilayah/tahun/indikator berfungsi |
| BR-04 | Prioritization & explanation | Must | Peringkat dapat dihitung ulang dan alasannya tampil |
| BR-05 | Simulasi anggaran | Must | Skenario mematuhi batas anggaran dan constraint yang dikonfigurasi |
| BR-06 | Perbandingan skenario | Must | Dua skenario side-by-side, delta dan trade-off |
| BR-07 | Aksesibilitas/responsif | Must | Demo desktop/mobile navigable; keyboard focus terlihat |
| BR-08 | ML forecasting | Could | Hanya jika data historis memadai dan baseline dikalahkan |
| BR-09 | RAG assistant | Could | Jawaban hanya berdasar sumber terindeks, dengan sitasi dan fallback |

## 8. Aturan analitis dan etika
- **Persentase != jumlah sekolah**. Konversi hanya dengan denominator sama wilayah, jenjang, tahun, dan definisi; tandai sebagai estimasi jika perlu pembulatan.
- **Nilai hilang != nol**. Ketidaklengkapan menyebabkan pengecualian atau penurunan kepercayaan, bukan pengisian diam-diam.
- **Tidak ada klaim realisasi biaya** dari simulasi; gunakan standar biaya resmi bila ditemukan, atau label **asumsi demo**.
- Penilaian wilayah bukan penghakiman kualitas pemerintah/sekolah. Cantumkan perubahan definisi, pembaruan, dan batasan.
- Tidak ada unggah data pribadi murid/individu dalam scope.

## 9. KPI produk (target internal, bukan skor juri)
- Minimal 3 dataset resmi berhasil diimpor dan terhubung pada **tingkat wilayah dan jenjang yang sama** (jika tidak terpenuhi, gunakan lebih sedikit indikator dan dokumentasikan).
- Setiap nilai pada explorer punya provenance; 0 data demo disamarkan sebagai data resmi.
- 2 skenario dapat dihitung, disimpan, dibuka, dan dibandingkan.
- 100% constraint anggaran dipatuhi dalam pengujian otomatis.
- Demo dari landing page -> dataset -> area -> skenario -> hasil -> sumber selesai tanpa langkah manual backend.

## 10. Dependensi & risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data lintas sumber tidak kompatibel | Prioritization tak valid | Audit schema sebelum fitur, satu tingkat wilayah dan jenjang |
| Tidak tersedia biaya valid | Optimasi tidak realistis | Skenario parameterized dengan label asumsi; jangan klaim sebagai estimasi fiskal resmi |
| Tidak tersedia histori | ML bias/tidak sahih | Tidak pakai forecasting; MCDA + OR tetap fungsional |
| Risiko merek Equora | Rebranding | Working name; cek DJKI/domain sebelum peluncuran permanen |
| Ketentuan lomba ambigu | Dokumen gagal format | Konfirmasi ke panitia; cek tanggal dan format di guidebook |

## 11. Jadwal kompetisi dan deliverable
- **18 Okt:** mentoring awal; audit sumber data, skema dan UI flows.
- **19 Okt–1 Nov:** implementasi; **First Draft 1 November 2026**, sesuai Technical Meeting halaman 15 dan 22; jam deadline belum diketahui.
- **First Draft:** repo publik GitHub/GitLab + README (judul, stack, run, progres); PDF maksimal 10 halaman, 10 MB; sitemap, mockup, fitur dan screenshot landing page + satu halaman lain.
- **3–10 Nov:** feedback mentor, revisi dan pengujian.
- **11 Nov:** final submission dengan proposal PDF maksimal 30 halaman sesuai template, surat orisinalitas bermaterai Rp10.000, video pitching YouTube publik maksimal 5 menit.
- **28 Nov:** final onsite jika lolos; demo online dan cadangan offline disiapkan.
- Technical Meeting halaman 22 menetapkan nama First Draft `WIA_FSDMIA2026_NamaTim.pdf`; ini menjadi baseline menggantikan catatan ambigu dokumen sebelumnya. Lihat [checklist submission](./submission-checklist.md).

## 12. Sumber dataset yang harus diunduh
**Status sesi 18 Oktober 2026: tautan diwarisi dari dokumen awal dan belum diverifikasi ulang; file dataset belum diunduh.**

**Semua tautan adalah halaman sumber resmi (pilih 'Unduh Dataset' / pilihan XLSX), bukan janji file direct-download.**

| Prioritas | Dataset | Jenis | Link |
|---|---|---|---|
| P0 | Sanitasi dasar sekolah 2025 | Persentase | https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-terhadap-fasilitas-sanitasi-dasar-2025-indonesia |
| P0 | Air minum layak 2025 | Persentase | https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-terhadap-air-minum-layak-2025 |
| P0 | Jumlah sekolah akses internet pengajaran 2025 | Jumlah | https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-akses-internet-untuk-pengajaran-2025-2 |
| P0 | Jumlah sekolah akses komputer pengajaran 2025 | Jumlah | https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-akses-komputer-untuk-pengajaran-2025-2 |
| P1 | Jumlah sekolah fasilitas cuci tangan 2025 | Jumlah | https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-fasilitas-cuci-tangan-2025-2 |
| P1 | Jumlah sekolah memakai komputer dan internet untuk pembelajaran 2025 | Jumlah | https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-yang-memanfaatkan-komputer-dan-internet-untuk-tujuan-pembelajaran-2025-2 |
| P1 | Total sekolah menurut kabupaten/kota dan jenjang | Denominator—perlu cek ekspor | https://referensi.data.kemendikdasmen.go.id/ |
| P2 | Data APBD wilayah 2025 | Konteks anggaran, bukan otomatis anggaran pendidikan/fasilitas | https://djpk.kemenkeu.go.id/portal/data/apbd |
| P2 | Statistik demografi wilayah | Konteks, cek kesesuaian wilayah/tahun | https://www.bps.go.id/ |

**Keyword untuk mencari denominator dan biaya**: `jumlah satuan pendidikan menurut kabupaten kota dan jenjang 2025`, `jumlah peserta didik kabupaten kota tahun ajaran 2025/2026`, `standar satuan harga pengadaan fasilitas sanitasi sekolah pemerintah daerah 2025`, `harga satuan perangkat komputer sekolah SSH 2025`, `kode wilayah sekolah referensi Kemendikdasmen BPS`.

## 13. Go/no-go data gate
Sebelum mengunci model: (1) unduh minimal 4 file P0; (2) buat data dictionary untuk 10 baris tiap file; (3) cek atribut wilayah, tahun, jenjang, numerator/denominator; (4) hitung coverage join dan missingness; (5) putuskan unit analisis **provinsi atau kabupaten/kota** berdasarkan data sebenarnya. Jika join gagal, tidak memaksakan rekomendasi tingkat kabupaten/kota.
