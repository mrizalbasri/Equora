# Data readiness

Status 19 Oktober 2026: empat file sumber telah diunduh secara lokal dan diperiksa dalam [audit awal](source-audit-2026-10-19.md). Metadata/hash serta quality report tersedia di `data/metadata/`; file mentah dan preview tetap diabaikan Git. Lisensi, persetujuan release, scope final serta mapping boundary belum diselesaikan. Jangan menyebutnya dataset siap pakai.

## Gerbang sebelum engine

1. Unduh calon sanitasi, air minum, komputer dan internet dari sumber resmi. Catat judul, URL, penerbit, tanggal akses, tahun/tahun ajaran, lisensi/ketentuan penggunaan, filename dan SHA256.
2. Periksa sheet, kolom dan 10 baris contoh setiap file. Catat definisi indikator, satuan, arah kebutuhan, jenjang dan level wilayah.
3. Tentukan irisan wilayah, tahun dan jenjang. Laporkan jumlah baris cocok, tidak cocok, duplikat, nilai hilang dan persen coverage join. Unit analisis mengikuti data yang tersedia.
4. Konversi persen ke jumlah hanya dengan denominator yang memiliki cakupan dan definisi sama. Jangan jumlahkan observasi agregat nasional dengan provinsi/kabupaten.
5. Tetapkan kebijakan missing, normalisasi, bobot, tie-breaking dan biaya. Biaya demo harus berlabel asumsi, terpisah dari referensi resmi.
6. Bekukan versi data dan rumus; simpan contoh perhitungan yang bisa direproduksi. Pemilik project meninjau hasil audit sebelum model dipakai untuk insight data nyata.

## Kriteria lulus

Untuk layer peta, jalankan juga [gerbang data geografis](map-plan.md): metadata/lisensi boundary, kesesuaian periode/kode, validitas geometri, pemeriksaan simplifikasi dan laporan join dua arah. Basemap OSM tidak menggantikan sumber indikator pendidikan; polygon tanpa observasi harus tampil sebagai missing.

- Seluruh indikator demo memiliki provenance, unit, tahun dan jenjang.
- Tidak ada natural key duplikat; persen berada di 0-100 dan count tidak negatif.
- Join yang gagal dilaporkan; data kosong tidak dianggap nol.
- Lisensi/ketentuan redistribusi ditinjau sebelum file dimasukkan ke repo publik.
- Bila irisan data tidak memadai, kurangi indikator atau turunkan scope analisis secara eksplisit.

Raw data disimpan lokal di `data/raw/` (diabaikan Git). Metadata empat calon sumber dan hasil audit awal tersedia di `data/metadata/`. Belum ada release data resmi Equora. Jangan membuat angka statistik atau hasil optimasi seolah berasal dari data resmi.

Adapter [staging lokal](dataset-staging.md) memeriksa hash/struktur/nilai dan menulis artefak review di `data/processed/`. Status staged bukan persetujuan release. Scope satu jenjang/Total serta namespace kode sumber eksplisit; crosswalk registry/boundary dan ketentuan penggunaan tetap menjadi gerbang sebelum publish.
