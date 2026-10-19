# QA landing dan About

Tanggal pengujian: 19 Oktober 2026

## Lingkungan

| Field | Isi |
|---|---|
| Build | `ce114c6` |
| URL | `http://127.0.0.1:4173` melalui production preview |
| Browser | Playwright Chromium |
| Viewport | Default Playwright dan 360x800 |
| Data release/fixture | Tidak ada; halaman hanya berisi konten produk dan status route |

## Hasil uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| LAND-01 / landing | Production preview berjalan | Buka `/`; baca hero dan CTA | Hero menjelaskan manfaat; route yang belum tersedia tidak menjadi tautan palsu | Hero tampil; Explorer/Studio tampil sebagai status `Segera`; About dapat dibuka | Lulus | Tidak ada |
| LAND-02 / About | Landing terbuka | Klik `Tentang`; baca tujuan dan batasan | Route `/about` tampil dengan tujuan, prinsip, dan disclaimer simulasi | Route dan heading tampil; batasan menyebut simulasi bukan keputusan anggaran resmi | Lulus | Tidak ada |
| LAND-03 / keyboard | About terbuka | Tekan `Tab` | Fokus terlihat dan berpindah ke kontrol interaktif | Fokus pertama berada pada link wordmark dengan `aria-label` beranda | Lulus | Pemeriksaan visual manual lanjutan tetap diperlukan |
| LAND-04 / mobile | Production preview berjalan | Buka `/` pada viewport 360x800 | Konten terbaca tanpa layout desktop memaksa navigasi atau overflow horizontal | Hero terlihat; navigasi desktop disederhanakan; test memastikan overflow horizontal tidak aktif | Lulus | Screenshot mobile belum dilampirkan |
| LAND-05 / health | Production preview berjalan | GET `/health` | Endpoint health tetap mengembalikan status fondasi | Mengembalikan `{ "status": "ok" }` | Lulus | Tidak ada |

## Keterbatasan

- Screenshot belum diambil karena pemeriksaan ini memakai assertion browser otomatis.
- Route `/explore`, `/studio`, katalog, dan metodologi belum diuji sebagai alur karena belum tersedia.
- API katalog, data release, dan fixture analitik belum tersedia; tidak ada klaim integrasi data.
