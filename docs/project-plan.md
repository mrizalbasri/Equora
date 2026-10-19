# Project Plan - Equora

| Item | Nilai |
|---|---|
| Proyek | Equora, target WIA MIA 2026 |
| Project manager | Belum ditetapkan pengguna |
| Durasi rencana | 18 Oktober-11 November 2026; final onsite 28 November jika lolos |
| Status | Usulan jadwal internal; belum disetujui sebagai komitmen tim |

## 1. Tujuan & Ringkasan

Menghasilkan demo web yang menelusurkan data fasilitas pendidikan ke peringkat kebutuhan dan perbandingan simulasi alokasi. Deliverable kompetisi mengikuti checklist submission, dengan data dan batasan yang bisa diperiksa.

## 2. Scope

In-scope mengikuti BRD/PRD: audit sumber, explorer, MCDA, simulasi anggaran, perbandingan dan provenance. Peta memerlukan geodata kompatibel. Forecasting/RAG tetap opsional. Keputusan anggaran resmi dan klaim dampak kausal berada di luar scope.

## 3. Deliverables

| Deliverable | Format | Bukti selesai |
|---|---|---|
| Audit data dan metode | Metadata, kamus data, laporan quality | Join dan definisi tervalidasi |
| Spesifikasi teknis | SRS/SDD dan desain database | Ditinjau setelah kontrak data diketahui |
| Validasi stack dan engine | Laporan pengujian/benchmark yang dapat dijalankan ulang | Enumerasi, constraint, baseline, sensitivitas, status dan reproduksibilitas mengikuti [protokol stack](technical-stack.md) |
| Demo First Draft | Aplikasi, repo publik, PDF | Landing + satu halaman nyata dan run instructions |
| Final penyisihan | Website, proposal, surat, video | Seluruh checklist final terpenuhi |

## 4. Work Breakdown Structure & Jadwal

Pembagian PIC per paket mengikuti [panduan dua orang](pembagian-kerja/README.md); nama anggota dan kapasitas jam belum dicatat. Tanggal di bawah adalah target internal yang disarankan.

| WBS | Task | Fase | Durasi | Target selesai |
|---|---|---|---|---|
| 1.1 | Review aturan dan baseline scope | Planning | 1 hari | 18 Okt |
| 2.1 | Audit dataset, lisensi, join, denominator | Analysis | 2 hari | 20 Okt |
| 3.1 | SRS/SDD, struktur API/DB, mockup | Design | 2 hari | 22 Okt |
| 4.1 | Landing, import, explorer dan provenance | Implementation | 4 hari | 26 Okt |
| 4.2 | MCDA, skenario dan comparison | Implementation | 3 hari | 29 Okt |
| 4.3 | Pengujian, deployment, screenshot dan PDF | Implementation | 2 hari | 31 Okt |
| 4.4 | Pengiriman First Draft | Submission | 1 hari | 1 Nov |
| 4.5 | Evaluasi mentor dan revisi | Review | 3-10 Nov | 10 Nov |
| 4.6 | Proposal, surat dan video final | Submission | Paralel revisi | 11 Nov |

## 5. Tim & Peran

Pengguna mengonfirmasi bekerja berdua dengan teman yang memiliki kemampuan full-stack. Pada 19 Oktober 2026, pembagian disepakati: pemilik memegang perkiraan 75-80% beban, teman 20-25%; ini perkiraan kompleksitas/scope, bukan jam yang sudah diukur. Nama tim/anggota dan kapasitas kerja harian belum diberikan.

Pemilik mengerjakan fondasi, data/API/DB, explorer/peta, MCDA, simulasi, comparison, integrasi dan deployment. Teman mengerjakan landing/about, katalog dataset read-only, halaman metodologi dari naskah pemilik, serta QA/bukti demo. Folder per fitur, input yang diperlukan dan checklist selesai tersedia pada [pembagian kerja](pembagian-kerja/README.md). Pengujian perhitungan dan tanggung jawab kebenaran model tetap di pemilik.

## 6. Milestone

Gerbang data: cakupan dan lisensi diketahui. Gerbang desain: spesifikasi ditinjau pemilik. Gerbang First Draft: demo dan PDF memenuhi checklist. Gerbang final: fitur teruji dan dokumen/video lengkap. Jangan menandai milestone lulus tanpa bukti.

Gerbang engine sebelum klaim hasil simulasi: V-01 sampai V-07 pada [stack teknis](technical-stack.md) lulus. Setelah audit data/hosting, tetapkan target kapasitas sebelum benchmark. Pengukuran dan evaluasi solver masuk task 4.2-4.3; durasi jadwal tetap usulan dan perlu ditinjau berdasarkan hasil audit. Persetujuan baseline stack pada 19 Oktober tidak berarti seluruh SDD atau jadwal disetujui.

## 7. Risiko

| Risiko | Probabilitas saat ini | Dampak | Mitigasi |
|---|---|---|---|
| Irisan data tidak cukup | Belum diukur | Tinggi | Audit sebelum engine; kurangi indikator secara eksplisit |
| Scope melebihi kapasitas tim | Belum diukur | Tinggi | Satu alur utuh; tinjau usulan penyederhanaan |
| Harga intervensi tidak valid | Belum diukur | Tinggi | Label asumsi demo dan tampilkan sumber |
| Akses GitHub CLI invalid | Terselesaikan 18 Okt | Sebelumnya menghambat publikasi | Pengguna login ulang; repository publik berhasil dibuat dan diunggah |

## 8. Komunikasi & Pelaporan

Usulan: update progress pada issue/PR saat milestone berubah, catat feedback mentor dan tautkan bukti. Jadwal rapat serta kanal internal belum ditentukan. Tidak ada pesan yang dikirim ke panitia atau anggota tim oleh setup ini.

## 9. Prosedur Perubahan Scope

Catat perubahan, dampak jadwal dan data, lalu minta keputusan pemilik project sebelum mengubah baseline PRD. Dokumen ini belum menyatakan planning atau desain disetujui.
