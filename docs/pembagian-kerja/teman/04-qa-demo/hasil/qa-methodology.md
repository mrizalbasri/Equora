# QA metodologi dan kesiapan demo

Tanggal pengujian: 20 Oktober 2026

## Lingkungan

| Field | Isi |
|---|---|
| Build | `91fadcb` |
| URL | `http://127.0.0.1:4173` melalui production preview |
| Browser | Playwright Chromium |
| Viewport | Default Playwright; breakpoint mobile diperiksa melalui stylesheet |
| Data release/fixture | Tidak ada release produksi; contoh perhitungan sintetis dan asumsi sandbox diberi label |

## Hasil uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| METH-01 / route | Production preview berjalan | Buka `/methodology` | Halaman menjelaskan status metode dan tidak mengklaim integrasi produksi | Route tampil dengan label `Method v1 sandbox` dan status metode | Lulus | Tidak ada |
| METH-02 / daftar isi | Halaman terbuka | Periksa link `Skor prioritas` dan anchor | Anchor dapat dioperasikan dengan keyboard dan menunjuk ke bagian yang benar | Link menunjuk ke `#priority`; seluruh section memakai ID semantik | Lulus | Pemeriksaan keyboard manual lanjutan tetap diperlukan |
| METH-03 / rumus | Halaman terbuka | Baca bagian skor dan contoh | Rumus, variabel, bobot, kontribusi, dan contoh sintetis dijelaskan | Formula weighted normalized needs dan contoh SYN-A 0,55 tampil; contoh diberi label bukan data provinsi | Lulus | Tidak ada |
| METH-04 / missing | Halaman terbuka | Baca bagian missing dan coverage | Missing tidak disebut nol; kebijakan dinyatakan eksplisit | `exclude`, nilai nol, missing, dan coverage dibedakan | Lulus | Tidak ada |
| METH-05 / status alokasi | Halaman terbuka | Baca tabel status model | Feasible tidak disamakan dengan optimal; no_solution tidak disebut infeasible | `optimal`, `feasible`, `infeasible`, dan `no_solution` dijelaskan terpisah | Lulus | Tidak ada |
| METH-06 / batasan | Halaman terbuka | Baca bagian batas interpretasi | Optimal menurut model dibedakan dari dampak/keadilan nyata | Batasan sandbox, demo assumption, dan kebutuhan verifikasi lapangan ditampilkan | Lulus | Tidak ada |
| FLOW-01 / Explorer | Belum tersedia | Buka `/explore` | Route yang belum dibuat ditandai belum diuji, bukan lulus | Belum diuji; route belum tersedia pada branch ini | Terblokir | Menunggu implementasi pemilik |
| FLOW-02 / Studio dan Compare | Belum tersedia | Buka `/studio` dan `/studio/compare` | Alur belum diklaim selesai sebelum UI/API tersedia | Belum diuji; route dan integrasi belum tersedia | Terblokir | Menunggu implementasi pemilik |

## Narasi demo yang tersedia

1. Buka `/methodology` untuk menjelaskan bahwa halaman memakai sandbox sintetis, bukan release produksi.
2. Tunjukkan rumus skor, contoh SYN-A, dan perbedaan missing dengan nilai nol.
3. Tunjukkan status solver dan batas bahwa optimal hanya berlaku untuk objective/constraint model.
4. Akhiri dengan route yang belum tersedia sebagai keterbatasan, bukan simulasi alur palsu.

## Keterbatasan

- Tidak ada screenshot yang dilampirkan dalam commit ini; bukti route dan anchor berasal dari Playwright.
- QA ini tidak membuktikan kebenaran solver secara independen; pengujian engine tetap berada pada paket pemilik.
- Landing, katalog dataset, Explorer, Studio, Compare, ekspor, API, dan release data tidak tersedia bersamaan pada branch QA ini.
