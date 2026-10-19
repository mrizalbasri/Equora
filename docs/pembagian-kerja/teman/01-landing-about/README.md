# 01 - Landing dan About

PIC: teman. Prioritas pertama. Tujuan: pengunjung memahami manfaat Equora, batas simulasi dan langkah menuju explorer/studio.

Route: `/` dan `/about`. Lokasi kode: `frontend/src/routes/+page.svelte` dan `frontend/src/routes/about/+page.svelte`. Shell/layout/navigasi global disiapkan pemilik.

Fondasi frontend dapat dijalankan sekarang. Root saat ini memiliki endpoint JSON `+server.ts`; koordinasikan halaman root dan pemeriksaan status dengan pemilik. Layout baru memuat CSS Tailwind, belum navigasi, tokens UI, atau komponen bersama. Jangan menganggap ketiganya sudah tersedia. Mulai dari outline konten dan halaman/komponen khusus paket; perubahan shell tetap dikoordinasikan.

## Yang dikerjakan

1. Baca PRD dan baseline desain, lalu gunakan komponen/tokens bersama.
2. Buat landing: manfaat, alur penggunaan tiga langkah, tautan sumber/metodologi, serta disclaimer simulasi.
3. Buat About: masalah yang ditangani, tujuan project dan batas penggunaan dari naskah pemilik. Nama tim/anggota hanya diisi bila sudah diberikan.
4. Hubungkan CTA ke explorer/studio yang sudah tersedia. Jika route belum siap, tampilkan status belum tersedia tanpa tautan aktif palsu.
5. Periksa layout mobile/desktop, keyboard, fokus, kontras dan panjang konten.

Animasi before/after hanya ditambahkan setelah pemilik menyediakan data/fixture berlabel dan mendahulukan alur nyata. Tidak perlu membuat optimizer, grafik hasil rekaan atau peta untuk menyelesaikan paket ini.

## Batas pekerjaan

Tidak mengubah API, database, layout global, rumus, autentikasi atau konfigurasi deployment. Tidak membuat statistik pengguna, testimoni, klaim dampak, logo sponsor maupun dataset unggulan tanpa sumber yang disetujui.

## Bukti selesai

- [ ] Kedua halaman berjalan dan isi konsisten dengan PRD.
- [ ] Setiap CTA/tautan tersedia atau diberi status belum tersedia secara jelas.
- [ ] Disclaimer membedakan simulasi dari keputusan anggaran resmi.
- [ ] Lebar 360px/desktop dan navigasi keyboard diperiksa; screenshot dilampirkan.
- [ ] Build/type/lint yang tersedia lulus atau keterbatasan dicatat; PR direview pemilik.

Acuan: [PRD](../../../PRD_Equora.md), [desain UI](../../../DESIGN_Equora.md), [aturan serah terima](../../README.md).
