# Fondasi UI publik

Mengikuti baseline yang sudah disetujui pada `DESIGN_Equora.md` v1.1, bagian 3–6. Tidak mengubah sitemap atau keputusan model pada system design.

## Arah dan keputusan visual

ENERGY 1 / RHYTHM 2 / MOTION 1. Identitasnya ruang kerja analitis yang tenang: canvas abu-abu, panel hampir putih, teks graphite, coral untuk tindakan utama. Tipografi Inter dengan fallback sistem mengikuti baseline, tanpa unduhan font. Ruang kosong memisahkan penjelasan dari bukti; border memisahkan metadata, tanpa efek glass atau gradient. Wordmark teks sementara `equora.` mengikuti dokumen desain, bukan logo baru.

## Kontrak bersama

- `frontend/src/app.css`: semantic color tokens `--eq-*`, radius, typography, container, tombol, focus visible dan reduced motion.
- `PublicShell.svelte`: menerima snippet `children` dan array `links` berisi `label`/`href`. Pemanggil hanya memasukkan route/anchor yang tersedia. Shell menyediakan satu `main` dengan `id="main-content"`, skip link, navigasi mobile nonmodal, Escape untuk menutup menu dan mengembalikan fokus, serta footer/disclaimer bersama. Jangan menambahkan elemen `main` kedua di halaman.
- `AvailabilityNotice.svelte`: judul dan snippet isi untuk status ketersediaan. Tidak memakai live region untuk informasi statis.

Shell dipasang oleh halaman publik yang membutuhkannya. Endpoint `/health` dan `/api/health` tetap terpisah dari UI. Tidak ada sidebar dashboard atau navigasi admin sebelum route serta kontrol aksesnya tersedia.

## Pemisahan pekerjaan

Branch `feat/shared-ui-foundation` hanya menyediakan fondasi bersama. Landing/about menggunakannya pada branch tersendiri. Uji interaksi browser dilakukan bersama halaman pemanggil karena fondasi ini tidak menambah route produk.
