# Fondasi UI publik

Mengikuti baseline yang disetujui pada `DESIGN_Equora.md` v1.2, bagian 3–6, diperbarui 20 Oktober 2026. Tidak mengubah sitemap atau keputusan model pada system design.

## Arah dan keputusan visual

ENERGY 2 / RHYTHM 2 / MOTION 1. Identitas Clean Education Blue: canvas abu-abu sangat muda, panel putih, teks biru gelap/netral dan biru medium untuk tindakan utama. Tipografi Inter dengan fallback sistem mengikuti baseline, tanpa unduhan font. Ruang kosong memisahkan penjelasan dari bukti; border memisahkan metadata. Satu bingkai putih bersudut 28px dan bayangan tipis menandai workspace pada desktop; mobile menjadi bidang penuh tanpa bingkai. Wordmark teks sementara `equora.` mengikuti dokumen desain. Ilustrasi sekolah SVG lokal memperjelas konteks pendidikan tanpa mewakili sekolah nyata atau data.

## Kontrak bersama

- `frontend/src/app.css`: semantic color tokens `--eq-*`, radius, typography, container, tombol, focus visible dan reduced motion.
- `PublicShell.svelte`: menerima snippet `children` dan array `links` berisi `label`/`href`. Pemanggil hanya memasukkan route/anchor yang tersedia. Shell menyediakan satu `main` dengan `id="main-content"`, skip link, navigasi mobile nonmodal, Escape untuk menutup menu dan mengembalikan fokus, serta footer/disclaimer bersama. Jangan menambahkan elemen `main` kedua di halaman.
- `AvailabilityNotice.svelte`: judul dan snippet isi untuk status ketersediaan. Tidak memakai live region untuk informasi statis.
- `EducationScene.svelte`: ilustrasi sekolah lokal dengan nama aksesibel. Warna memakai token UI; tidak memuat angka, aset eksternal, atau hasil analisis.

Hero memakai headline dua baris dan ilustrasi lingkungan sekolah yang terbuka, menggantikan kartu metadata di sisi kanan. Buku/air/perangkat memperjelas konteks fasilitas; caption HTML tetap terbaca pada mobile dan status pengembangan berada di dekat CTA. Alur dan metadata rinci tetap berada di bawah hero agar pengantar lebih mudah dipahami.

Penyempurnaan `feat/hero-atmosphere` memberi latar putih menuju tint biru hanya pada hero: area baca tetap terang, sisi ilustrasi menjadi lingkungan sekolah yang lebih terasa. Ini pemisah hierarki, tanpa glow, glass atau pola grid. Pilihan Air minum/Sanitasi/Akses digital adalah tombol nyata dengan `aria-pressed`, caption live dan sorotan ikon terkait; tidak mengubah data atau menjalankan analisis. Ikon terpilih terangkat 8px selama transisi 220ms, tanpa loop. Reduced motion meniadakan perpindahan, menyisakan outline seleksi. CTA utama memiliki tepi bawah biru gelap untuk respons tekan, tanpa menggeser layout. ENERGY 2 / RHYTHM 2 / MOTION 1 tetap berlaku.

Shell dipasang oleh halaman publik yang membutuhkannya. Endpoint `/health` dan `/api/health` tetap terpisah dari UI. Tidak ada sidebar dashboard atau navigasi admin sebelum route serta kontrol aksesnya tersedia.

## Pemisahan pekerjaan

Branch `feat/shared-ui-foundation` hanya menyediakan fondasi bersama. Landing/about menggunakannya pada branch tersendiri. Uji interaksi browser dilakukan bersama halaman pemanggil karena fondasi ini tidak menambah route produk.

Revisi v1.2 berada pada `feat/clean-education-blue`, bergantung pada branch landing/about yang sudah tersedia. Perubahan UI dan dokumen dalam paket ini memakai satu baseline; paket fitur di branch lain mengikuti token baru saat diintegrasikan, tanpa mengubah pekerjaan kontributor secara diam-diam.
