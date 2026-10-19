# Verifikasi landing dan About

Tanggal: 19 Oktober 2026. Baseline: [DESIGN v1.1](DESIGN_Equora.md) dan [system design](system-design/README.md). Bergantung pada `feat/shared-ui-foundation`; PR landing hanya memuat halaman, tes dan dokumentasi terkait.

## Perilaku

`/` sekarang mengirim HTML landing, menggantikan JSON status fondasi. Status server tetap di `/health`; proxy backend tetap di `/api/health`. `/about` menjelaskan masalah, pengguna, status proyek dan batas penggunaan. Landing tidak membutuhkan backend, database atau request eksternal untuk tampil.

CTA menuju anchor penjelasan yang tersedia. Tombol perbandingan/simulasi mengganti penjelasan, bukan menjalankan solver. Explorer/studio, release data, dan metode final ditandai belum tersedia. Tidak ada angka indikator, hasil optimasi, peta, testimoni atau dampak rekaan. Empat URL sumber mengacu pada calon sumber di BRD; halaman penerbit berhasil dibuka saat verifikasi, tetapi audit file/lisensi terpisah.

## Pemeriksaan aktual

- `pnpm check`: 0 errors, 0 warnings.
- `pnpm test`: 2 unit tests lulus.
- `pnpm build`: lulus.
- `PLAYWRIGHT_CHANNEL=msedge pnpm test:e2e` (PowerShell memakai `$env:PLAYWRIGHT_CHANNEL = 'msedge'`): 4 tests lulus pada hasil build. Memeriksa root HTML, health JSON, satu main/H1, keyboard skip link, pilihan penjelasan, semua rincian metode, CTA/anchor, menu mobile/Escape, About, tidak ada tautan ke route produk yang belum tersedia, tidak ada horizontal overflow dan tidak ada uncaught page errors.
- Screenshot landing dan About pada 360/768/1440px tersimpan di `frontend/test-results/`. Desktop dan mobile ditinjau secara visual; salinan landing disimpan di [desktop](evidence/landing/desktop.png) dan [mobile](evidence/landing/mobile.png).
- `python scripts/check_docs.py` dan `git diff --check`: lulus.
- `pnpm check:api`: mismatch bawaan checkout CRLF Windows telah direproduksi; isi sama setelah normalisasi newline. Ditangani pada branch terpisah karena tidak ada perubahan API dalam paket landing.

## Gate Anti Slop

PASS Hard Gate: tidak ada klaim/statistik rekaan, overflow atau tautan produk palsu; interaksi dan keyboard diuji pada tiga viewport. Loading/error jaringan tidak berlaku karena halaman tidak memuat API; keadaan kosong dan ketersediaan dijelaskan secara statis.

PASS Purpose Gate: warna dan font mengikuti baseline; coral hanya tindakan/selection, panel membedakan alur dari metadata. Panah hanya menunjukkan aliran data atau tautan sumber eksternal. Tiga langkah mengikuti alur domain yang ditetapkan, tanpa dekorasi/ikon atau gradient.

PASS Liveliness: ENERGY 1 / RHYTHM 2 / MOTION 1; hero analitis, panel penjelasan, alur linear dan sumber berbentuk daftar memberi ritme berbeda. Motif data → prioritas → skenario konsisten; fokus utama satu headline dan satu CTA coral.

PASS Craftsmanship: screenshot ditinjau, interaksi diuji, status fitur jujur. Warna teks yang dipakai lulus pemeriksaan kontras: graphite pada abu-abu/putih, secondary `#555C65` pada canvas 5.52:1 dan subpanel 5.98:1; teks tombol putih pada coral 4.95:1; selected text `#B33720` pada tint 4.91:1. Tidak mengubah token baseline untuk menyamarkan kegagalan; pemakaian teks muted/coral yang gagal kontras diganti di halaman.

## Keterbatasan

Pengujian lokal memakai Edge desktop dengan viewport mobile, bukan perangkat fisik. CI dikonfigurasi memasang Chromium; hasil CI perlu diperiksa pada PR. Belum ada integrasi explorer, dataset atau solver. Favicon belum ditentukan dan browser dapat meminta `/favicon.ico` yang mengembalikan 404; ini tidak menghalangi halaman.
