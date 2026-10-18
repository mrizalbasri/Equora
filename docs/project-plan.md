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
| Demo First Draft | Aplikasi, repo publik, PDF | Landing + satu halaman nyata dan run instructions |
| Final penyisihan | Website, proposal, surat, video | Seluruh checklist final terpenuhi |

## 4. Work Breakdown Structure & Jadwal

PIC setiap task belum ditetapkan; tanggal di bawah adalah target internal yang disarankan.

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

Nama tim, anggota, ketua/PIC dan kapasitas kerja harian belum diberikan. Peran yang harus dialokasikan: koordinasi/submission, analisis data, frontend, backend/engine, QA, serta presentasi. Satu orang boleh menangani beberapa peran; jangan menganggap tersedia beberapa developer.

## 6. Milestone

Gerbang data: cakupan dan lisensi diketahui. Gerbang desain: spesifikasi ditinjau pemilik. Gerbang First Draft: demo dan PDF memenuhi checklist. Gerbang final: fitur teruji dan dokumen/video lengkap. Jangan menandai milestone lulus tanpa bukti.

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
