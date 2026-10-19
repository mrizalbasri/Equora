# System Design Equora

Status: usulan untuk review, 19 Oktober 2026.

- [Dokumen System Design](Equora_System_Design.docx) memakai template System Design yang dipilih pengguna dan menyertakan diagram arsitektur.
- [Diagram arsitektur](architecture.html) adalah HTML mandiri dengan inline SVG yang dapat dibuka di browser.
- [Sumber Mermaid](architecture.mmd) dapat diunduh dan diedit di editor Mermaid.
- [Gaya diagram](diagram-style.md) mencatat pemetaan token desain Equora.

Dokumen membedakan fondasi aktual dengan rancangan MVP. Frontend memakai pnpm secara lokal; backend dapat berjalan melalui Compose. PostgreSQL memakai instance bersama yang sudah ada. Database/schema Equora, API bisnis, ETL, MCDA dan model alokasi belum diimplementasikan. Dokumen ini tidak membuat database atau menjalankan migrasi.

## Sumber isi

- [PRD](../PRD_Equora.md): scope, peran, acceptance criteria, model domain dan API usulan.
- [Stack teknis](../technical-stack.md): batas keputusan solver, validasi dan benchmark.
- [Data readiness](../data-readiness.md): provenance, irisan data dan gerbang kualitas.
- [Rencana peta](../map-plan.md): boundary, join, atribusi dan fallback.
- [Keputusan terbuka](../decisions.md) dan [setup stack](../setup-stack.md): status implementasi dan batas operasi.
- [Desain Equora](../DESIGN_Equora.md): palet Soft Gray/Coral yang dikonfirmasi pengguna untuk diagram.
- [API aktual](../../backend/openapi.json), [Compose backend](../../backend/compose.yaml), serta kode dan manifest aplikasi saat dokumen disusun.

## Template dan diagram

Dokumen menggunakan salinan template System Design dari openai-templates. Ukuran halaman, margin, styles, font tertanam, tabel, numbering dan struktur 12 bagian dipertahankan. Isi instruksional diganti dengan rancangan Equora; gambar placeholder diganti diagram baru. Dua spacer diberi keep-with-next agar judul alternatif tetap bersama tabelnya. Template sumber tidak diubah.

Diagram mengikuti skill diagram-design dan token proyek. Terdapat tujuh komponen serta enam konektor ortogonal; garis putus-putus dan label menjelaskan komponen/relasi yang belum tersedia. HTML memuat font publik melalui Google Fonts, dengan fallback sistem jika offline. Gambar yang disisipkan ke Word sudah memuat hasil render font tersebut.

Keputusan mengenai target database, sumber data, biaya, autentikasi dan SLO masih terbuka. Tinjau kembali dokumen setelah audit dataset dan sebelum membuat schema domain.
