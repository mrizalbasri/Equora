# QA landing dan About

Tanggal pengujian: 21 Oktober 2026

## Lingkungan

| Field | Isi |
|---|---|
| Build | `bea36ee` / `b1037c1` |
| URL | `http://127.0.0.1:4173` melalui production preview |
| Browser | Playwright Chromium |
| Viewport | 360x900, 390x900, 768x900, 1024x900, dan 1440x900 |
| Data release/fixture | Data pratinjau sintetis berlabel; belum ada API atau solver produksi |

## Hasil uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| LAND-01 / landing | Production preview berjalan | Buka `/`; baca hero, heading, dan CTA | Hero menjelaskan manfaat; hanya ada satu `h1` dan satu `main`; tidak ada overflow horizontal | Single `h1`, single `main`, `scrollWidth <= innerWidth` di 5 viewport | Lulus | Tidak ada |
| LAND-02 / skip link & aksesibilitas | Landing terbuka | Tekan `Tab` lalu `Enter` | Skip link `Lewati ke konten utama` fokus pertama dan memindahkan fokus ke `main` | Skip link memfokuskan `#main-content` | Lulus | Tidak ada |
| LAND-03 / pratinjau interaktif | Landing terbuka | Toggle `Perbandingan akses` dan `Simulasi alokasi` | Tombol memakai `aria-pressed`; status rute yang belum selesai ditandai transparan tanpa angka klaim palsu | Status `Explorer belum tersedia` dan `Studio skenario belum tersedia` tampil jelas | Lulus | Tidak ada |
| LAND-04 / FAQ accordion | Landing terbuka | Buka/tutup accordion dengan tombol `Enter` dan klik | Detail metodologi dapat dibuka/tutup dengan keyboard dan klik mouse | Accordion membuka/menutup dengan atribut `open` sesuai interaksi | Lulus | Tidak ada |
| LAND-05 / navigasi mobile | Viewport < 1024px | Buka menu navigasi, lalu tekan tombol `Escape` | Menu membuka dengan `aria-expanded="true"`, dan `Escape` menutup menu serta mengembalikan fokus ke tombol | Menu terbuka/tertutup dengan benar; fokus kembali ke tombol menu | Lulus | Tidak ada |
| LAND-06 / sticky header offset | Landing terbuka | Klik navigasi anchor (`#alur`, `#sumber`, `#metode`) | Posisi scroll memperhitungkan tinggi header sticky (offset 112px) sehingga judul tidak tertutup | Section berada di bawah header (`section.y >= header.y + header.height`) | Lulus | Tidak ada |
| LAND-07 / About | Landing terbuka | Klik `Tentang Equora`; periksa rute `/about` | Halaman `/about` tampil dengan tujuan, status pengembangan, dan disclaimer simulasi | Rute `/about` tampil rapi dalam `PublicShell` bersama disclaimer | Lulus | Tidak ada |

## Keterbatasan

- Rute Explorer (`/explore`) dan Studio Skenario (`/studio`) berstatus pratinjau (`Segera`) dan menunggu integrasi rilis data/solver dari pemilik.
- Data yang ditampilkan pada pratinjau merupakan data contoh indikator berlabel dan belum terhubung ke database atau API backend langsung.
- Pengujian visual otomatis dijalankan via suite Playwright `landing.spec.ts` dan `foundation.spec.ts`.
