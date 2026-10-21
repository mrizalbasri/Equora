# QA katalog dataset

Tanggal pengujian: 20 Oktober 2026

## Lingkungan

| Field | Isi |
|---|---|
| Build | `01e40b2` |
| URL | `http://127.0.0.1:4173` melalui production preview |
| Browser | Playwright Chromium |
| Viewport | Default Playwright; layout mobile diverifikasi melalui breakpoint 700px |
| Data release/fixture | Fixture sintetis berlabel `Demo v0.1`; belum ada API katalog |

## Hasil uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| DATA-01 / daftar | Production preview berjalan | Buka `/datasets` | Daftar dataset tampil dengan status demo dan metadata ringkas | Tiga dataset demo tampil; badge `Fixture demo · belum terhubung API` terlihat | Lulus | Tidak ada |
| DATA-02 / pencarian | Daftar terbuka | Isi `tidak ada` pada pencarian, lalu pilih `Hapus pencarian` | Empty state menjelaskan cakupan pencarian; daftar dapat dipulihkan | Empty state tampil dan daftar kembali setelah tombol dipilih | Lulus | Tidak ada |
| DATA-03 / detail | Daftar terbuka | Pilih `Akses fasilitas sanitasi dasar` | Detail menampilkan provenance, metadata, sumber dan quality tanpa klaim sehat | `/datasets/sanitasi-dasar-2025` tampil dengan source link dan tiga status `Belum diaudit` | Lulus | Tidak ada |
| DATA-04 / not-found | Production preview berjalan | GET `/datasets/does-not-exist` | ID tidak dikenal mengembalikan 404 | Respons HTTP 404 | Lulus | Tidak ada |
| DATA-05 / keyboard | Daftar terbuka | Navigasi dengan Tab ke input, kartu dan link | Kontrol dapat dicapai dan focus ring tersedia | Test browser dapat mengakses label pencarian dan link detail; focus ring didefinisikan | Lulus | Pemeriksaan visual keyboard manual tetap diperlukan |
| DATA-06 / mobile | Production preview berjalan | Buka katalog pada viewport kecil | Kartu menjadi satu kolom dan toolbar tidak memaksa scroll horizontal | CSS breakpoint mengubah katalog menjadi satu kolom dan toolbar menjadi satu kolom | Lulus | Screenshot mobile belum dilampirkan |

## Keterbatasan

- Fixture tidak mewakili observasi resmi dan tidak digunakan sebagai fallback saat API gagal.
- Quality report, status publish, lisensi final, checksum, dan waktu pengambilan nyata menunggu kontrak/API pemilik.
- Screenshot visual belum dilampirkan; bukti saat ini berasal dari assertion Playwright dan pemeriksaan kode.
- Upload, ETL, mapping, autentikasi admin, dan migrasi berada di luar paket ini.
