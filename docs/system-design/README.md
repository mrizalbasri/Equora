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
- [Desain Equora](../DESIGN_Equora.md): baseline v1.2 Clean Education Blue yang dikonfirmasi pada 20 Oktober 2026, diterapkan pada HTML diagram dan gambar dalam Word. Isi/status teknis dokumen tetap snapshot 19 Oktober 2026.
- [API aktual](../../backend/openapi.json), [Compose backend](../../backend/compose.yaml), serta kode dan manifest aplikasi saat dokumen disusun.

## Template dan diagram

Dokumen menggunakan salinan template System Design dari openai-templates. Ukuran halaman, margin, styles, font tertanam, tabel, numbering dan struktur 12 bagian dipertahankan. Isi instruksional diganti dengan rancangan Equora; gambar placeholder diganti diagram baru. Dua spacer diberi keep-with-next agar judul alternatif tetap bersama tabelnya. Template sumber tidak diubah.

Diagram mengikuti skill diagram-design dan token proyek. Terdapat tujuh komponen serta enam konektor ortogonal; garis putus-putus dan label menjelaskan komponen/relasi yang belum tersedia. HTML memuat font publik melalui Google Fonts, dengan fallback sistem jika offline. Gambar yang disisipkan ke Word sudah memuat hasil render font tersebut.

Verifikasi tema 20 Oktober 2026: hanya `word/media/image1.png` dalam DOCX yang diganti. Teks, XML style/tabel, relasi dan ukuran slot gambar tetap identik dengan sumber. Renderer LibreOffice tidak tersedia pada lingkungan Windows ini; dokumen diekspor read-only melalui Microsoft Word 16.0, lalu dirasterisasi dengan Poppler. Ketujuh halaman ditinjau, termasuk diagram biru pada halaman 3; tidak ditemukan clipping atau perubahan susunan halaman. PDF/PNG pemeriksaan disimpan lokal sebagai artefak QA, bukan dokumen submission tambahan.

Keputusan mengenai target database, sumber data, biaya, autentikasi dan SLO masih terbuka. Tinjau kembali dokumen setelah audit dataset dan sebelum membuat schema domain.
