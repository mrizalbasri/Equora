# 04 - QA dan bukti demo

PIC: teman. Tujuan: menemukan masalah pemakaian dan menyiapkan bukti dari aplikasi yang benar-benar berjalan. Pengujian rumus/solver otomatis tetap tanggung jawab pemilik.

Mulai per fitur setelah build tersedia; pengujian seluruh alur menunggu integrasi. Catatan hasil dapat disimpan di subfolder `hasil/` pada folder ini ketika pengujian dilakukan. Belum ada laporan atau screenshot hasil uji saat panduan ini ditulis.

## Yang dikerjakan

1. Catat commit/build, URL, tanggal, browser, ukuran viewport dan release/fixture yang dipakai.
2. Uji landing -> explorer -> detail wilayah -> scenario -> compare -> ekspor pada bagian yang sudah tersedia. Route yang belum dibuat berstatus belum diuji, bukan lulus.
3. Uji mobile 360px, keyboard/fokus, loading/empty/error serta konsistensi filter dan label sumber. Untuk peta, uji missing versus nol dan fallback kegagalan peta sesuai rencana peta.
4. Bandingkan nilai tampilan dengan contoh referensi dari pemilik. Jika berbeda, laporkan; jangan mengubah rumus untuk menyamakan hasil.
5. Buat laporan bug dengan langkah reproduksi, ekspektasi, hasil aktual, bukti dan dampak. Perbaiki bug halaman milikmu; teruskan bug API/engine/peta ke pemilik.
6. Ambil screenshot setelah alur stabil dan tulis urutan narasi demo yang sesuai fitur nyata. Jika screenshot memuat peta, pertahankan atribusi.

## Format satu hasil uji

| Field | Isi saat pengujian |
|---|---|
| ID / fitur | Nama kasus dan halaman |
| Build / lingkungan | Commit, URL, browser, viewport dan data release/fixture |
| Prasyarat | Data/akun/parameter yang diperlukan, tanpa password/token |
| Langkah | Urutan tindakan yang bisa diulang |
| Ekspektasi | Perilaku dari PRD atau contoh referensi pemilik |
| Hasil aktual | Perilaku yang diamati dan tautan bukti |
| Status | Lulus, gagal, terblokir atau belum diuji |
| Tindak lanjut | Penanggung jawab dan hasil pengujian ulang |

## Bukti selesai

- [ ] Semua kasus yang dijalankan punya lingkungan, langkah dan hasil aktual; yang belum dijalankan tetap ditandai.
- [ ] Bug yang menghalangi alur demo dilaporkan ke pemilik dan diuji ulang setelah diperbaiki.
- [ ] Screenshot tidak mengandung data sensitif, angka rekaan atau klaim fitur yang belum berjalan.
- [ ] Ada narasi demo dan daftar keterbatasan untuk pemilik review.
- [ ] Ketentuan bukti pada submission checklist ditinjau; pengiriman/deployment tetap dilakukan pemilik.

Acuan: [PRD test plan](../../../PRD_Equora.md), [rencana peta](../../../map-plan.md), [submission checklist](../../../submission-checklist.md), [aturan serah terima](../../README.md).
