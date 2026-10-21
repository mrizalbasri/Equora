# Uji keputusan, pemerataan, dan bukti Equora

Pengguna menyetujui pengerjaan rangkaian fitur ini dan PR pada 22 Oktober 2026,
setelah pembahasan alternatif serta kesesuaian dengan rubrik lomba.

## Tujuan dan alur

Analis menyimpan skenario di Studio, membuka hasil, lalu menguji asumsi dan
jangkauan alokasi. Pembaca publik dapat membuka tautan snapshot lokal tanpa login
untuk memeriksa angka, sumber, dan batas interpretasi. Hosting belum dipilih.

1. Uji keputusan mengubah anggaran, biaya seluruh wilayah (termasuk override),
   atau satu bobot relatif. Bobot dinormalisasi kembali hingga total tepat satu.
2. Cek pemerataan membandingkan solusi awal dengan solusi yang memaksimalkan
   jumlah provinsi penerima terlebih dahulu, lalu skor kebutuhan pada jangkauan
   maksimum yang terbukti. Anggaran, biaya, kapasitas, minimum, dan cakupan tetap
   sama. Jangkauan bukan ukuran kesetaraan antarsekolah atau dampak pendidikan.
3. Uji kestabilan mengubah satu asumsi setiap kali: anggaran dan biaya +/-10%,
   serta setiap bobot positif +/-10% relatif. Tampilkan status setiap percobaan,
   perubahan paket, penerima, peringkat, dan jumlah percobaan yang dapat dinilai.
   Solusi feasible bukan bukti optimum dan solusi setara dapat berbeda alokasinya.
4. Telusur bukti menampilkan nilai akses, kebutuhan, bobot, kontribusi, sel sumber,
   definisi, tahun ajaran, checksum, URL, dan status data. Missing dan denominator
   nol dijelaskan sebagai pengecualian, tidak diubah menjadi kebutuhan nol.

## Batas modul dan data

- Mesin optimasi menambah tujuan jangkauan dua tahap dengan evaluasi independen.
- Layanan review menghitung dari input_rows snapshot tersimpan, bukan rilis terbaru.
- Endpoint POST review menerima perubahan terbatas +/-25%, mengembalikan kontrak
  bertipe, dan tidak mengubah snapshot. Maksimum satu detik solver per percobaan.
- Komponen hasil menautkan panel review dan bukti. Review dihitung hanya ketika
  diminta; hasil lama dikosongkan saat input atau snapshot berubah.
- Unduhan JSON menyertakan snapshot lengkap, parameter percobaan, versi metode,
  hasil dan batas interpretasi. PDF snapshot yang sudah ada tetap tersedia.
- Tidak menambah akun, kanal laporan masyarakat, atau direktori sekolah tanpa data
  NPSN tervalidasi. Tidak mengklaim fitur unik di seluruh ekosistem pemerintah.

## Desain dan aksesibilitas

Mengikuti Clean Education Blue yang telah disetujui: ENERGY 1 / RHYTHM 2 /
MOTION 1. Panel perbandingan memiliki hierarki hasil yang jelas; biru untuk
tindakan, teks untuk status, angka selalu bersama satuan. Ikon slider untuk uji
asumsi, chart untuk jangkauan, dan book untuk bukti berfungsi sebagai penanda.
Disclosure membatasi kepadatan metadata, bukan menyembunyikan batas interpretasi.
Kontrol berlabel, target sentuh 44px, focus terlihat, layout satu kolom di ponsel,
dan tabel dapat digulir di dalam kontainernya. Tidak menambah dependensi ikon.

## Error dan verifikasi

Versi snapshot yang tidak kompatibel ditolak. Tidak ada solusi, infeasible, dan
timeout dibedakan. Percobaan tanpa evaluasi tidak masuk hitungan stabilitas.
Tidak menyimpulkan sebab tidak terpilih dari skor semata; hanya biaya, kapasitas,
minimum, dan sisa anggaran yang dapat diperiksa langsung yang disebut sebagai fakta.

Uji sintetis membuktikan trade-off cakupan, kelayakan biaya/minimum, normalisasi,
override, pengecualian, batas parameter, snapshot tetap, dan status timeout.
Pengujian browser desktop/ponsel memeriksa perubahan input, retry, bukti, unduhan,
keyboard, dan overflow. API riil/PostgreSQL lokal dan render PDF diperiksa terpisah.

## Urutan implementasi

1. Tambahkan solver jangkauan dan layanan review beserta uji matematika.
2. Tambahkan endpoint/kontrak OpenAPI dan pengujian rute PostgreSQL.
3. Tambahkan komponen Uji Keputusan dan Telusur Bukti pada hasil tersimpan.
4. Perbarui petunjuk Studio/metodologi, uji browser dan data lokal.
5. Commit hanya perubahan fitur ini, buat PR bertumpuk di branch navbar terbaru,
   dan lampirkan bukti pengujian. Perubahan basemap yang sudah ada tetap terpisah.

## Review spesifikasi

Lingkup hanya audit skenario tersimpan; tidak ada migrasi database atau perubahan
data mentah. Definisi pemerataan, perubahan bobot, dan batas klaim eksplisit.
