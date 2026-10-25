# Fondasi UI publik

Mengikuti baseline yang disetujui pada `DESIGN_Equora.md` v1.2, bagian 3–6, diperbarui 20 Oktober 2026. Tidak mengubah sitemap atau keputusan model pada system design.

## Arah dan keputusan visual

ENERGY 2 / RHYTHM 2 / MOTION 1. Identitas Clean Education Blue: canvas abu-abu sangat muda, panel putih, teks biru gelap/netral dan biru medium untuk tindakan utama. Tipografi Inter dengan fallback sistem mengikuti baseline, tanpa unduhan font. Ruang kosong memisahkan penjelasan dari bukti; border memisahkan metadata. Satu bingkai putih bersudut 28px dan bayangan tipis menandai workspace pada desktop; mobile/tablet di bawah 1024px menjadi bidang penuh tanpa bingkai. Wordmark teks sementara `equora.` mengikuti dokumen desain. Ilustrasi sekolah SVG lokal memperjelas konteks pendidikan tanpa mewakili sekolah nyata atau data.

## Kontrak bersama

- `frontend/src/app.css`: semantic color tokens `--eq-*`, radius, typography, container, tombol, focus visible dan reduced motion.
- `PublicShell.svelte`: menerima snippet `children` dan array `links` berisi `label`/`href`. Pemanggil hanya memasukkan route/anchor yang tersedia. Shell menyediakan satu `main` dengan `id="main-content"`, skip link, navigasi mobile nonmodal, Escape untuk menutup menu dan mengembalikan fokus, serta footer/disclaimer bersama. Jangan menambahkan elemen `main` kedua di halaman.
- `AvailabilityNotice.svelte`: judul dan snippet isi untuk status ketersediaan. Tidak memakai live region untuk informasi statis.
- `EducationScene.svelte`: ilustrasi sekolah lokal dengan nama aksesibel. Warna memakai token UI; tidak memuat angka, aset eksternal, atau hasil analisis.

Hero terbaru di main berasal dari PR #21: headline dua baris, ilustrasi sekolah dan contoh workspace dengan dua mode. Per 21 Oktober, angka akses/alokasi tanpa sumber diganti status belum tersedia/belum dihitung. Bobot pada contoh diberi label ilustratif dan tidak digunakan engine. Kelompok tombol mode memakai `aria-pressed`, dapat diaktifkan dengan keyboard, dan belum menjalankan API/solver. Nama aksesibel ilustrasi menjelaskan bahwa ini bukan data sekolah nyata. Status pengembangan tetap di dekat CTA.

Latar putih menuju tint biru hanya pada hero memisahkan area baca dari ilustrasi, tanpa glow, glass atau grid. CTA utama memiliki tepi bawah biru gelap untuk respons tekan, tanpa menggeser layout. ENERGY 2 / RHYTHM 2 / MOTION 1 tetap berlaku.

Navbar publik memakai header sticky putih solid, penanda aktif dengan `aria-current` dan outline pada Tentang Equora. Landing dan About memakai daftar menu yang sama. Breakpoint menu 1024px mencegah menu berdesakan di tablet; bingkai luar juga menjadi penuh di bawah breakpoint ini. Menu buka/tutup mendukung Escape, penutupan setelah navigasi, dan batas tinggi viewport dengan scroll. Offset anchor 112px menghindari judul tertutup header. Transisi ikon menu mengikuti reduced motion global.

Shell dipasang oleh halaman publik yang membutuhkannya. Endpoint `/health` dan `/api/health` tetap terpisah dari UI. Tidak ada sidebar dashboard atau navigasi admin sebelum route serta kontrol aksesnya tersedia.

Footer Landing/About menautkan `/datasets` dan `/methodology` yang sudah tersedia. Katalog/detail/metodologi masih memakai layout dan CSS lama; penyatuan token/shell masuk [backlog integrasi](implementation-readiness.md). Jangan menganggap seluruh route sudah mengikuti fondasi bersama hanya karena landing menggunakannya.

## Pemisahan pekerjaan

Branch `feat/shared-ui-foundation` hanya menyediakan fondasi bersama. Landing/about menggunakannya pada branch tersendiri. Uji interaksi browser dilakukan bersama halaman pemanggil karena fondasi ini tidak menambah route produk.

Revisi v1.2 berada pada `feat/clean-education-blue`, bergantung pada branch landing/about yang sudah tersedia. Perubahan UI dan dokumen dalam paket ini memakai satu baseline; paket fitur di branch lain mengikuti token baru saat diintegrasikan, tanpa mengubah pekerjaan kontributor secara diam-diam.
