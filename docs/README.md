# Dokumentasi Equora

Status diperbarui 21 Oktober 2026. [Audit kesiapan](implementation-readiness.md) membedakan implementasi teruji, rencana, dan dependensi yang belum terpenuhi. Laporan QA bertanggal sebelumnya tetap merupakan bukti historis pada commit masing-masing.

| Dokumen | Kegunaan |
|---|---|
| [Kesesuaian kompetisi](competition-alignment.md) | Penilaian konsep terhadap PPT dan gap submission |
| [Kesiapan WIA 27 Oktober 2026](competition-readiness-2026-10-27.md) | Pemetaan PDF Technical Meeting asli ke rubrik, alur demo dan prioritas submission tim Lock In |
| [BRD](BRD_Equora.md) | Masalah, tujuan, stakeholder dan scope bisnis |
| [PRD](PRD_Equora.md) | Fitur, acceptance criteria, stack dan model domain usulan |
| [Pendidikan di Daerah Saya](public-region.md) | Alur publik lokal: profil provinsi, perbandingan wilayah, simulasi dan berbagi temuan; tindak lanjut validasi dan perbaikan ringkasan 24 Oktober 2026 |
| [Akses publik tanpa akun](public-access.md) | Perilaku tanpa login, batas snapshot bersama dan proteksi impor admin |
| [Stack teknis](technical-stack.md) | Alasan pemilihan, alternatif solver, validasi hasil dan protokol benchmark |
| [Setup stack](setup-stack.md) | Fondasi implementasi, struktur folder, runtime dan petunjuk menjalankan aplikasi |
| [System Design](system-design/README.md) | Dokumen Word dari template, diagram arsitektur, kontrak dan kesiapan operasi |
| [Rencana peta](map-plan.md) | MapLibre/Protomaps, sumber layer, gerbang geografis, atribusi dan fallback |
| [Desain UI](DESIGN_Equora.md) | Baseline Clean Education Blue v1.2 |
| [Project plan](project-plan.md) | Prioritas, jadwal kerja usulan dan risiko |
| [Audit kesiapan dan backlog](implementation-readiness.md) | Status main/PR terkini, hasil pemeriksaan, urutan kerja dan kriteria selesai |
| [Pembagian kerja dua orang](pembagian-kerja/README.md) | Porsi pemilik/teman, folder tugas per fitur, dependensi dan checklist serah terima |
| [Data readiness](data-readiness.md) | Gerbang validasi sebelum analisis |
| [Staging XLSX pendidikan](dataset-staging.md) | Adapter lokal, quality report, provenance, perintah dan batas release |
| [Registry draft PostgreSQL](dataset-registry.md) | Target database lokal, migrasi, idempotensi staging dan tes transaksi |
| [Submission checklist](submission-checklist.md) | Bukti yang perlu disiapkan per tahap |
| [Keputusan dan pertanyaan](decisions.md) | Keputusan yang masih perlu dikonfirmasi |
| [Setup GitHub](github-setup.md) | Publikasi repository, aturan branch dan CI |

## Cara menggunakan

1. Tinjau kesesuaian kompetisi dan konfirmasi keputusan yang terbuka.
2. Audit dataset sebelum mengunci unit analisis dan rumus.
3. Gunakan PRD dan desain sebagai input SRS/SDD sebelum implementasi. SRS, SDD dan desain database terperinci belum dibuat karena kontrak data belum diketahui.
4. Update checklist menggunakan bukti nyata: commit, hasil pengujian, screenshot dan URL demo.

## Acuan dan konflik

Materi utama review: PDF Technical Meeting MIA 2026 yang diberikan pengguna (40 halaman), khususnya halaman 15-17 dan 20-27. PDF tidak disalin ke repo.

Untuk aturan yang tercantum di PDF, koreksi lama mengenai satu subtema, tanggal 2 November, dan penamaan 2025 digantikan oleh catatan Technical Meeting. Review ini merupakan snapshot materi, bukan verifikasi pengumuman terbaru panitia. Guidebook asli belum tersedia untuk dibandingkan.

Untuk visual, gunakan DESIGN versi 1.2 (Clean Education Blue), disetujui 20 Oktober 2026; PRD dan system design diselaraskan ke baseline tersebut. Perubahan scope masih memerlukan keputusan pemilik project.
