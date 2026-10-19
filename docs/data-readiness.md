# Data readiness

Status: belum ada dataset mentah di repo. URL calon sumber pada BRD/PRD diwarisi dari dokumen awal; belum diverifikasi ulang pada sesi ini. Jangan menyebutnya dataset siap pakai.

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

Raw data disimpan lokal di `data/raw/` (diabaikan Git). Metadata yang telah diperiksa dapat ditempatkan di `data/metadata/`. Kedua folder belum berisi data. Jangan membuat angka statistik atau hasil optimasi seolah berasal dari data resmi.
