# Workspace analitis lokal

Target pengguna: seluruh alur lokal dapat dipakai, hosting belum dipilih (21 Oktober 2026). Baseline PRD/desain tetap berlaku; paket ini mengintegrasikan branch #22–#25 tanpa merge ke main. Data pengguna tidak dipublikasikan atau dimasukkan ke Git.

Arsitektur: adapter eksplisit untuk sepuluh file dan enam jenjang/Total; snapshot lokal immutable beserta hash/provenance; FastAPI membaca snapshot melalui service; PostgreSQL menyimpan snapshot skenario. Frontend memanggil API melalui proxy server SvelteKit. API data tetap ditandai local_review, dengan status lisensi/tanggal unduh yang belum diketahui terlihat.

Explorer menggunakan tabel, bar chart dan peta provinsi tersinkron, detail sumber serta ekspor CSV. Peta menggunakan boundary beratribusi dengan crosswalk kode sumber eksplisit; kesalahan WebGL/aset tetap menyediakan tabel. Tidak ada lokasi sekolah rekaan atau join fuzzy otomatis.

Studio menghitung MCDA dari empat indikator persentase, bobot nonnegative total 1, kebijakan missing exclude. Alokasi memakai engine satu intervensi yang sudah diuji, input biaya/kapasitas/minimum dari pengguna dan label demo_assumption. Snapshot menyimpan release/model/solver/parameter/hasil; compare hanya menerima scope/data/metode kompatibel. CSV/PDF memuat sumber dan batas interpretasi.

Admin lokal memakai token dari environment, origin guard dan batas payload; operasi impor/publish tidak dibuka tanpa autentikasi. Karena target lokal, tidak ada login cloud atau hosting baru. Kelengkapan publikasi kompetisi/hosting terpisah dari penyelesaian aplikasi lokal.

Kriteria selesai:

- [x] Sepuluh file diproses dengan skala dan header eksplisit; hash, null, quality dan source-cell terjaga.
- [x] Katalog/detail/API observasi/quality/provenance dan ekspor berjalan tanpa data sintetis tersembunyi.
- [x] Explorer, detail wilayah, chart dan peta/fallback teruji pada mobile/desktop.
- [x] Studio, baseline, status solver, snapshot immutable, compare dan ekspor teruji.
- [x] Admin lokal dan validasi input terlindungi; database proyek lain tidak disentuh.
- [x] Build, backend termasuk PostgreSQL, E2E browser dan smoke test lokal lulus.
- [x] PR berisi hasil validasi dan batas penggunaan yang nyata; main tidak di-merge otomatis.

Arah UI: Clean Education Blue, ENERGY 2 / RHYTHM 2 / MOTION 1. Panel sumber tetap dekat angka; workspace mengutamakan tabel/grafik dan satu area analisis utama. Token dan shell bersama digunakan pada halaman katalog/metodologi agar navigasi tidak mengubah tema global.

Hasil pemeriksaan lokal dicatat pada [laporan validasi](local-workspace-validation.md). Integrasi tersedia dalam [PR #27](https://github.com/mrizalbasri/Equora/pull/27), di atas registry #24. Hosting belum dipilih dan main tetap menunggu review pemilik.
