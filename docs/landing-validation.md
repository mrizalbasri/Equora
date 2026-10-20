# Verifikasi landing dan About

Pembaruan: 20 Oktober 2026. Baseline: [DESIGN v1.2 Clean Education Blue](DESIGN_Equora.md) dan [system design](system-design/README.md). Branch tema `feat/clean-education-blue` bergantung pada `feat/landing-about`; perubahan tema tidak menambah route produk.

## Perilaku dan visual

`/` sekarang mengirim HTML landing, menggantikan JSON status fondasi. Status server tetap di `/health`; proxy backend tetap di `/api/health`. `/about` menjelaskan masalah, pengguna, status proyek dan batas penggunaan. Landing tidak membutuhkan backend, database atau request eksternal untuk tampil.

Tema memakai panel putih, canvas sangat muda, biru utama, serta satu bingkai workspace dengan bayangan tipis di desktop dan layout penuh di mobile. Ilustrasi sekolah SVG lokal memperjelas konteks pendidikan; bukan sekolah nyata atau data indikator. Warna ilustrasi mengikuti token UI. Tidak ada maskot atau aset finansial/avatar dari referensi.

CTA menuju anchor penjelasan yang tersedia. Tombol perbandingan/simulasi mengganti penjelasan, bukan menjalankan solver. Explorer/studio, release data, dan metode final ditandai belum tersedia. Tidak ada angka indikator, hasil optimasi, peta, testimoni atau dampak rekaan. Empat URL sumber mengacu pada calon sumber di BRD; halaman penerbit berhasil dibuka saat verifikasi, tetapi audit file/lisensi terpisah.

## Pemeriksaan aktual

- `pnpm check`: 0 errors, 0 warnings.
- `pnpm test`: 2 unit tests lulus.
- `pnpm build`: lulus.
- `PLAYWRIGHT_CHANNEL=msedge pnpm test:e2e` (PowerShell memakai `$env:PLAYWRIGHT_CHANNEL = 'msedge'`): 6 tests lulus pada hasil build. Memeriksa root HTML, health JSON, satu main/H1, keyboard skip link, pilihan penjelasan, semua rincian metode, CTA/anchor, menu mobile/Escape, About, tidak ada tautan ke route produk yang belum tersedia, tidak ada horizontal overflow dan tidak ada uncaught page errors.
- Screenshot landing dan About pada 360/390/768/1024/1440px tersimpan di `frontend/test-results/`. Desktop dan mobile ditinjau secara visual; salinan landing terbaru disimpan di [desktop](evidence/landing/desktop.png) dan [mobile](evidence/landing/mobile.png).
- `python scripts/check_docs.py` dan `git diff --check`: lulus.
- `pnpm check:api`: mismatch bawaan checkout CRLF Windows telah direproduksi; isi sama setelah normalisasi newline. Ditangani pada branch terpisah karena tidak ada perubahan API dalam paket landing.

## Gate Anti Slop

PASS Hard Gate: tidak ada klaim/statistik rekaan, overflow atau tautan produk palsu; interaksi dan keyboard diuji pada lima viewport. Loading/error jaringan tidak berlaku karena halaman tidak memuat API; keadaan kosong dan ketersediaan dijelaskan secara statis. Ilustrasi mengikuti konteks pendidikan yang disetujui pengguna.

PASS Purpose Gate: warna dan font mengikuti DESIGN v1.2; biru menandai tindakan/selection, panel membedakan alur dari metadata. Panah hanya menunjukkan aliran data atau tautan sumber eksternal. Ilustrasi sekolah mendukung konteks fasilitas pendidikan. Bayangan tipis hanya membedakan bingkai workspace dari canvas, tanpa glass atau gradient.

PASS Liveliness: ENERGY 2 / RHYTHM 2 / MOTION 1; headline biru, ilustrasi pendidikan, panel penjelasan, alur linear dan sumber berbentuk daftar memberi identitas dan ritme berbeda. Motif data → prioritas → skenario konsisten; fokus utama headline dan satu CTA utama. Tidak ada animasi dekoratif; reduced-motion dipertahankan.

PASS Craftsmanship: screenshot ditinjau, interaksi diuji, status fitur jujur. Kontras teks putih pada biru utama **5.47:1**; secondary pada subpanel **5.84:1**; muted pada canvas **4.84:1**; selected text pada tint **6.81:1**. Control border **3.38:1** pada putih memenuhi batas nonteks 3:1 dan tidak dipakai sebagai warna teks. Border panel yang lebih pucat hanya dekoratif.

## Keterbatasan

Pengujian lokal memakai Edge desktop dengan viewport mobile, bukan perangkat fisik. CI dikonfigurasi memasang Chromium; hasil CI perlu diperiksa pada PR. Belum ada integrasi explorer, dataset atau solver. Favicon belum ditentukan dan browser dapat meminta `/favicon.ico` yang mengembalikan 404; ini tidak menghalangi halaman.
