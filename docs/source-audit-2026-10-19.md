# Audit awal sumber pendidikan

Tanggal akses dan unduh: 19 Oktober 2026. Status: **audit file selesai; release belum disetujui**. Audit ini tidak mengubah status lisensi, model, database atau peta.

Pembaruan 21 Oktober: pengguna menyediakan 10 workbook di `data/datamentah/`, termasuk kandidat denominator dan persentase internet/komputer. [Audit tambahan](additional-source-audit-2026-10-21.md) mencatat skala Excel dan rekonsiliasi; batas “denominator belum tersedia” di dokumen ini tetap merujuk empat file awal, bukan inventaris terbaru.

## Bukti dan reproduksi

Empat halaman resmi di [manifest sumber](../data/metadata/source-candidates.json) berhasil dibuka. Tautan XLSX diambil dari URL `src` pada preview Office yang ditautkan halaman penerbit. File asli tersimpan lokal di `data/raw/source-audit-2026-10-19/`, tidak masuk Git. Manifest mencatat halaman, URL download, tanggal unggah penerbit, dan SHA256. [Laporan mesin](../data/metadata/source-audit.json) mencatat ukuran, waktu unduh UTC, struktur dan quality counts.

Jalankan dari root dengan dependency backend terpasang:

```powershell
backend/.venv/Scripts/python.exe scripts/audit_education_sources.py
```

Pada Linux/macOS gunakan `backend/.venv/bin/python`. Script membaca berkas lokal, memeriksa hash yang dipin, memvalidasi urutan jenjang/status, dan menghasilkan ringkasan tanpa nilai indikator. Preview header serta 10 baris pertama per file hanya ditulis di folder raw yang diabaikan Git. Script bukan importer produksi atau persetujuan publish.

## Temuan file

| Sumber | Data mulai | Baris provinsi | Nilai numerik / 684 sel | Nol | Missing |
|---|---:|---:|---:|---:|---:|
| Sanitasi dasar | 6 | 38 | 684 | 12 | 0 |
| Air minum layak | 5 | 38 | 684 | 7 | 0 |
| Internet pengajaran | 5 | 38 | 684 | 7 | 0 |
| Komputer pengajaran | 6 | 38 | 683 | 35 | 1 |

Counts pada tabel adalah hasil pemeriksaan struktur/quality, bukan statistik dampak pendidikan. Setiap file mempunyai sheet `Data` dan `Metadata`. Kolom B kode wilayah sumber, C nama wilayah, D:U enam jenjang (TK/SD/SMP/SMA/SMK/SLB), masing-masing Negeri/Swasta/Total. Jangan mengimpor berdasarkan posisi tanpa memeriksa header: dua file memiliki satu baris header tambahan.

Tahun ajaran pada judul file adalah **2025/2026**, sedangkan halaman memakai label 2025. Tanggal unggah halaman berbeda dengan direktori tanggal pada CDN dan bukan periode observasi. Ketiganya harus disimpan terpisah.

Irisan kode sumber empat file adalah 38 dari union 38, tanpa duplikat kode provinsi. Ini **belum** validasi join dengan boundary atau registry wilayah. Baris `Luar Negeri` dan agregat `Indonesia` dikeluarkan dari irisan provinsi, tidak ditambahkan ke provinsi.

Semua 38 nilai `SD/Total` tersedia pada setiap sumber. Sel kosong komputer adalah `Data!H35` (SD/Swasta); total pada baris tersebut tersedia. Nilai kosong tetap null. Pembacaan XML XLSX secara terpisah mengonfirmasi sel kosong itu. Tidak ada nilai persen di luar 0–100 atau jumlah negatif/noninteger pada sel provinsi yang numerik. Tidak berarti seluruh definisi sumber telah tervalidasi.

## Definisi dan pembatasan

- Sanitasi dan air minum berupa persentase akses. Kebutuhan dapat dinyatakan sebagai komplemen akses hanya setelah definisi/arah indikator disepakati.
- Internet dan komputer adalah jumlah sekolah dengan akses, bukan persentase, jumlah perangkat atau jumlah sekolah tanpa akses. File ini tidak memberi denominator jumlah seluruh sekolah yang setara; jangan memakai jumlah akses mentah sebagai skor kekurangan.
- Metadata komputer mensyaratkan paling sedikit lima komputer. Definisi ini harus dibawa ke katalog dan explorer, bukan disingkat menjadi kepemilikan satu komputer.
- Header Negeri/Swasta/Total tidak boleh dijumlahkan bersama. Persentase antarstatus atau antarjenjang tidak boleh dirata-ratakan tanpa denominator.
- Tidak ada field lisensi/ketentuan pada sheet Metadata. Halaman sumber yang diperiksa tidak memberi lisensi redistribusi eksplisit. Pencarian portal belum menemukan ketentuan yang dapat dipastikan berlaku pada empat file. Ini temuan ketersediaan bukti, bukan kesimpulan hukum. Belum ada raw/processed observations yang dipublikasikan.

## Usulan untuk review pemilik

Mulai demo analisis nyata dari **provinsi, SD/Total, tahun ajaran 2025/2026, sanitasi + air minum**. Internet/komputer tetap sebagai konteks jumlah akses sampai denominator tersedia. Ini usulan, belum perubahan scope PRD atau release resmi.

Sebelum dipakai pada insight data nyata, pemilik perlu meninjau audit, memastikan ketentuan penggunaan, menetapkan indikator/normalisasi/bobot/missing policy serta mapping kode wilayah. Biaya intervensi, kapasitas dan fairness belum tersedia. Peta menunggu boundary berlisensi, join dua arah dan konfigurasi hosting. Target PostgreSQL Equora serta hosting aplikasi masih memerlukan penetapan.

Sandbox dengan fixture sintetis berlabel dapat dikembangkan tanpa mempublikasikan data ini, sesuai batas PRD. Perhitungan sandbox tidak menggantikan gerbang release data.
