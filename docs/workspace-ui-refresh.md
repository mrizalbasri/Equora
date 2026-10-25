# Penyegaran UI workspace — 21 Oktober 2026

Permintaan pengguna: tampilan masih kurang; gunakan skill UI UX Pro Max dari nextlevelbuilder. Skill dipasang global di Codex, tidak disalin ke repository.

Baseline tetap Clean Education Blue dalam DESIGN v1.2. Pencarian skill `analytics dashboard --design-system --density 8` menghasilkan style **Data-Dense Dashboard**, yang sesuai untuk Explorer. Saran pattern **Enterprise Gateway** tidak sesuai aplikasi analisis dan tidak digunakan; navigasi mengikuti kebutuhan produk/rekomendasi UX umum. Font dan warna tetap mengikuti keputusan repo, bukan mengganti identitas dengan palet/font hasil pencarian otomatis. Stack Svelte 5 memakai `$app/state`, status dinamis aksesibel, dan cleanup map tetap dipertahankan.

Masalah saat ini: shell pemasaran dipakai di workspace, heading/peringatan menghabiskan layar pertama, peta/detail/tabel tersusun vertikal panjang, dan navigasi antarhalaman analisis kurang jelas.

Desain yang diterapkan:

- Shell aplikasi penuh: sidebar desktop dengan label/icon konsisten, lokasi halaman aktif, periode data, tautan metode/admin, serta menu mobile dengan Escape dan pengembalian fokus.
- Header ringkas, status review lokal dengan detail disclosure. Sumber/peringatan tetap dapat diakses tanpa mendominasi tampilan data.
- Explorer: filter dalam satu toolbar; ringkasan coverage, rentang nilai dan periode yang dihitung dari data asli; peta utama dengan panel pilihan wilayah/daftar akses terendah di samping.
- Tabel tetap tersedia untuk keyboard dan fallback peta, dengan angka tabular, status teks, pemilihan baris dan sumber sel. Peta tidak dipakai sebagai satu-satunya alat memilih wilayah.
- Shell/form/tabel bersama menyelaraskan Studio, katalog, Compare, snapshot dan admin. Landing/About tetap menggunakan shell publik.
- Mobile satu kolom, target kontrol minimal 44px, tabel overflow hanya di wadahnya, visible focus, reduced motion dan loading/error tetap tersedia.

Tidak mengubah data, formula prioritas, biaya demo, solver atau status publikasi. Ringkasan rentang adalah min/max provinsi pada hasil filter, bukan rata-rata nasional atau klaim dampak. Pemeriksaan akhir: typecheck, build, kontrak, tes interaksi serta visual browser desktop/mobile dengan data nyata dan fixture yang berlabel.

## Bukti validasi

- Typecheck 0 errors/0 warnings, build produksi dan kontrak API lulus; dua unit test frontend lulus.
- Dua puluh E2E lulus, termasuk empat kasus baru navigasi workspace/disclosure pada 375, 768, 1024 dan 1440px, dengan reduced motion. Menu memindahkan fokus ke tombol tutup saat dibuka, Tab mencapai navigasi, Escape mengembalikan fokus ke pemicu.
- Smoke browser data asli: Explorer/peta siap, panel provinsi, Studio, mobile 375px tanpa body overflow dan tanpa pageerror. Screenshot aktual tersimpan lokal dalam tmp/ui-refresh; tidak dikomit karena berisi data sumber yang belum disetujui untuk redistribusi.
- Pemeriksaan kontras pasangan teks utama: primary/putih 5,47:1; secondary/putih 6,22:1; muted/canvas 4,84:1; success/tint 5,47:1; review/tint 5,26:1. Ini pemeriksaan pasangan token yang dipakai, bukan klaim audit aksesibilitas seluruh produk.
