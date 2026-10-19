# Dokumentasi Equora

Status: baseline kerja, diperbarui 19 Oktober 2026. Dokumentasi menjelaskan rencana; tidak membuktikan implementasi sudah tersedia.

| Dokumen | Kegunaan |
|---|---|
| [Kesesuaian kompetisi](competition-alignment.md) | Penilaian konsep terhadap PPT dan gap submission |
| [BRD](BRD_Equora.md) | Masalah, tujuan, stakeholder dan scope bisnis |
| [PRD](PRD_Equora.md) | Fitur, acceptance criteria, stack dan model domain usulan |
| [Stack teknis](technical-stack.md) | Alasan pemilihan, alternatif solver, validasi hasil dan protokol benchmark |
| [Setup stack](setup-stack.md) | Fondasi implementasi, struktur folder, runtime dan petunjuk menjalankan aplikasi |
| [System Design](system-design/README.md) | Dokumen Word dari template, diagram arsitektur, kontrak dan kesiapan operasi |
| [Rencana peta](map-plan.md) | MapLibre/Protomaps, sumber layer, gerbang geografis, atribusi dan fallback |
| [Desain UI](DESIGN_Equora.md) | Baseline Soft Gray Enterprise / Coral |
| [Project plan](project-plan.md) | Prioritas, jadwal kerja usulan dan risiko |
| [Pembagian kerja dua orang](pembagian-kerja/README.md) | Porsi pemilik/teman, folder tugas per fitur, dependensi dan checklist serah terima |
| [Data readiness](data-readiness.md) | Gerbang validasi sebelum analisis |
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

Untuk visual, gunakan DESIGN versi 1.1; PRD diselaraskan ke baseline tersebut. Perubahan scope masih memerlukan keputusan pemilik project.
