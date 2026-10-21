# Audit file tambahan dari pengguna

Tanggal pemeriksaan: 21 Oktober 2026. Input: 10 workbook XLSX pada `data/datamentah/`, disediakan pengguna. File asli tidak diubah/dipindahkan. Direktori ditambahkan ke `.gitignore`; hanya metadata/hash, ringkasan audit, skrip dan tes sintetis yang disimpan di Git. Belum ada release baru atau perubahan database dari paket audit ini.

## Inventaris dan provenance

[Manifest](../data/metadata/additional-source-candidates.json) merekam filename lengkap, SHA256, judul, unit, skala penyimpanan, halaman sumber dan kecocokan hash terhadap audit lama. Tanggal unduh pengguna tidak diketahui dan disimpan null, bukan diambil dari waktu modifikasi file. Enam halaman sumber tambahan diperiksa; file tidak diunduh ulang dari penerbit untuk mengklaim kecocokan byte remote.

| ID | Isi | Dibanding audit 19 Oktober |
|---|---|---|
| institutions_count | Jumlah satuan pendidikan | Tambahan; kandidat denominator per jenjang/status |
| internet_count | Jumlah sekolah dengan akses internet | SHA256 sama persis |
| computers_count | Jumlah sekolah dengan akses komputer | SHA256 sama persis |
| electricity_count | Jumlah sekolah dengan akses listrik | Tambahan konteks; belum ditambahkan ke model |
| water_count | Jumlah sekolah dengan akses air minum layak | Tambahan untuk rekonsiliasi persen |
| handwashing_count | Jumlah sekolah dengan fasilitas cuci tangan | Tambahan konteks; belum ditambahkan ke model |
| internet_percent | Persentase sekolah dengan akses internet | Tambahan; pecahan Excel dengan format persen |
| computers_percent | Persentase sekolah dengan akses komputer | Tambahan; pecahan Excel dengan format persen |
| water_percent | Persentase akses air minum layak | SHA256 sama persis |
| sanitation_percent | Persentase akses sanitasi dasar | SHA256 sama persis, walaupun filename memiliki suffix `(1)` |

Halaman tambahan resmi: [jumlah satuan pendidikan](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-satuan-pendidikan-2025-indonesia), [persentase internet](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-internet-untuk-pengajaran-2025-2), [persentase komputer](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-sekolah-dengan-akses-komputer-untuk-pengajaran-2025), [listrik](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-akses-listrik-2025-2), [air minum jumlah](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-akses-terhadap-air-minum-layak-2025-2), dan [cuci tangan](https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/jumlah-sekolah-dengan-fasilitas-cuci-tangan-2025-2). Judul/definisi/tahun pada halaman konsisten dengan metadata workbook yang diperiksa. Ini bukan bukti lisensi atau tanggal unduh pengguna.

## Struktur, unit dan penyimpanan

Seluruh workbook memiliki sheet Data/Metadata, tahun ajaran 2025/2026 dan 38 kode provinsi unik. Irisan kode pada 10 file adalah 38/38; nama provinsi juga cocok. Baris Indonesia dan Luar Negeri dikeluarkan dari analisis provinsi.

Sembilan file indikator memiliki enam jenjang TK/SD/SMP/SMA/SMK/SLB dengan Negeri/Swasta/Total. Jumlah satuan pendidikan memuat 12 kelompok termasuk PAUD/Dikmas, sehingga kolom SD/Total berada di AA, bukan I. `max_column` file denominator adalah 53 karena kolom tambahan yang kosong; parser memetakan header eksplisit dan menolak data di luar grup yang dikenali. Jangan memaksakan adapter lama dengan layout 21 kolom pada file ini.

**Persentase memiliki dua skala penyimpanan berbeda:**

- Internet/komputer: nilai sel 0–1 dengan format `0.00%`; audit mengalikan 100 tepat sekali untuk membandingkannya dalam poin persentase.
- Air minum/sanitasi: nilai sel sudah 0–100 dengan format angka biasa; tidak dikalikan 100 lagi.

Manifest mencatat storage_scale secara eksplisit. Skala tidak ditebak dari nilai kecil saja, karena persentase asli di bawah 1% juga sah. Perubahan format/declared scale harus ditinjau, bukan diterima diam-diam. Jumlah sekolah tetap count integer dan bukan jumlah perangkat; definisi komputer tetap paling sedikit lima komputer. Cuci tangan memerlukan sabun dan air mengalir. Air minum pada file jumlah mencakup penyediaan sekolah maupun dibawa siswa dari rumah.

## Hasil kualitas dan rekonsiliasi

[Laporan mesin](../data/metadata/additional-source-audit.json) mencatat issue per koordinat sel, quality counts, join, batas numerator serta rekonsiliasi. Tidak memuat observasi provinsi mentah.

- Semua nilai numerik yang diperiksa berada dalam rentang unitnya; count tidak negatif/noninteger dan persen setelah normalisasi berada di 0–100.
- Komputer jumlah: satu missing di SD/Swasta, konsisten dengan audit lama. Persentase pada posisi itu tidak digunakan untuk mengisi jumlah yang kosong.
- Denominator: 38 sel KB/Total berupa formula Excel. Formula dicatat sebagai `formula_not_allowed` untuk kebijakan staging dan tidak dievaluasi atau diganti cached value. Ini catatan pemrosesan, bukan tuduhan data sumber salah. SD/Total dan enam jenjang bersama tidak memakai sel formula tersebut.
- Untuk count yang tersedia, Negeri + Swasta cocok dengan Total. Persentase tidak dirata-ratakan antarstatus/jenjang.
- Kelima numerator count (internet, komputer, air minum, listrik, cuci tangan) tidak melebihi denominator yang tersedia pada key wilayah/jenjang/status sama.

Pemeriksaan `100 × jumlah akses / jumlah satuan pendidikan` dibandingkan dengan persentase penerbit, menggunakan toleransi absolut `1e-8` poin persentase:

| Indikator | Cocok pada enam jenjang × tiga status | Denominator nol | Missing numerator | SD/Total |
|---|---:|---:|---:|---|
| Internet | 678 | 6 | 0 | 38/38 cocok |
| Komputer | 677 | 6 | 1 | 38/38 cocok |
| Air minum | 678 | 6 | 0 | 38/38 cocok |

Tidak ada mismatch pada kasus yang dapat dibandingkan. Denominator nol tidak dihitung sebagai kecocokan atau akses nol; nilai yang tidak bisa dibagi tetap tidak tersedia. Selisih maksimum pada kasus valid kurang dari `1.5e-14` poin persentase. Enam spot-check SD/Total pada kode sumber 11 dan 96 juga diperiksa langsung dari XML XLSX dengan aritmetika Fraction, terpisah dari pembacaan openpyxl dan perhitungan Decimal.

## Reproduksi dan batas integrasi

Dari root, dengan openpyxl tersedia:

```powershell
python scripts/audit_local_education.py
```

Atau dari `backend/`: `uv run python ../scripts/audit_local_education.py`. Skrip memverifikasi hash sebelum membaca dan menghasilkan laporan audit, tanpa mengubah file raw atau mengimpor database. CI tidak memerlukan file pengguna; tiga tes sintetis memeriksa normalisasi skala, penolakan format/scale yang salah, serta perbedaan match/mismatch/missing/denominator nol.

Kandidat denominator dan persentase internet/komputer sekarang tersedia serta konsisten secara numerik untuk SD/Total. Pernyataan lama “denominator belum tersedia” berlaku pada empat file audit awal saja. Ini belum menetapkan scope final, mapping kode ke registry/boundary, bobot, biaya, fairness, atau ketentuan release. Metadata workbook tidak memiliki field lisensi eksplisit.

Langkah berikutnya: perluas adapter/kontrak untuk storage scale dan layout denominator, uji regresinya, lalu staging/registry draft untuk sumber tambahan. Jangan mengubah manifest empat sumber lama atau memaksa format baru melewati validasi adapter lama. Data listrik/cuci tangan merupakan kandidat konteks tambahan, bukan otomatis indikator MCDA baru. Tidak ada klaim published release atau insight publik dari paket audit ini.
