# Urutan implementasi pemilik

Permintaan sesi 19 Oktober 2026: seluruh tugas pemilik mengikuti dependensi, satu paket per branch dan PR. Landing/about juga diminta secara eksplisit meskipun pembagian awal menempatkannya pada teman. Jangan menyamakan paket dengan jumlah commit atau menganggap PR terbuka telah diintegrasikan.

## Paket dan dependensi

| Paket | Branch | Dasar / syarat | Hasil dan status |
|---|---|---|---|
| Fondasi UI bersama | `feat/shared-ui-foundation` | main | [PR #2](https://github.com/mrizalbasri/Equora/pull/2), token/shell/status publik, belum merge |
| Landing/about | `feat/landing-about` | fondasi UI | [PR #3](https://github.com/mrizalbasri/Equora/pull/3), root HTML/about, tes responsif dan screenshot, belum merge |
| Pemeriksaan API Windows | `fix/api-check-windows-newlines` | main, independen | [PR #4](https://github.com/mrizalbasri/Equora/pull/4), LF/CRLF diterima, kontrak usang ditolak, belum merge |
| Audit sumber | `docs/source-data-audit` | main, independen | [PR #5](https://github.com/mrizalbasri/Equora/pull/5), empat file dipin hash dan diperiksa; [audit](../../source-audit-2026-10-19.md) menunggu review release |
| MCDA sandbox | `feat/priority-engine` | definisi metode eksplisit, fixture sintetis | [PR #6](https://github.com/mrizalbasri/Equora/pull/6), 20 golden/edge tests, kontribusi/bobot/missing/tie-break; belum terhubung ke HTTP/data nyata |
| Optimasi sandbox | `feat/allocation-engine` | skor kebutuhan, biaya/kapasitas eksplisit per kasus | [PR #7](https://github.com/mrizalbasri/Equora/pull/7), 35 tests, validator independen, enumerasi, baseline, sensitivitas/status; bukan solver final produksi |
| Registry/import/kontrak | `feat/dataset-release-api` | audit/review scope, ketentuan data, target PostgreSQL | Belum dikerjakan; menjadi input katalog teman |
| Explorer/ekspor | `feat/regional-explorer` | published release, kontrak observasi, fondasi UI | Belum dikerjakan; grafik/tabel lebih dulu, tidak menunggu peta |
| Studio/snapshot | `feat/scenario-studio` | engine teruji, biaya/fairness disepakati, registry | Belum dikerjakan; snapshot immutable dan status solusi jelas |
| Comparison/ringkasan | `feat/scenario-comparison` | dua snapshot, versi data/metode konsisten | Belum dikerjakan |
| Peta/fallback | `feat/regional-map` | boundary/lisensi/join, PMTiles hosting | Belum dikerjakan; ikuti gerbang peta, bukan sekadar render basemap |
| Admin/operasi | `feat/admin-data-operations` | auth/roles dan target deployment dipilih | Belum dikerjakan; upload/publish terlindungi sebelum digunakan |
| Integrasi/demo | `test/owner-integration` | paket inti dan pendukung terintegrasi | Belum dikerjakan; explorer → scenario → compare, backup, bukti teknis submission |

Nama branch untuk paket yang belum dimulai adalah rencana, bukan branch atau implementasi yang sudah ada. Pekerjaan teman di luar landing/about tetap mengikuti pembagian awal. Semua PR masih terbuka dan belum digabung; MCDA dan alokasi merupakan library sandbox independen di atas main, belum integrasi pipeline atau demo penuh. Lima PR pertama (#2–#6) telah lulus workflow Documentation/Stack saat diperiksa; status terbaru tetap mengikuti GitHub. Konfigurasi lokal belum memiliki `DATABASE_URL`, sehingga target database tidak dapat disimpulkan dari lingkungan yang tersedia.

## Siklus setiap paket

1. Periksa working tree, keputusan dan syarat paket. Jangan memulai implementasi data nyata dengan syarat release yang belum terpenuhi.
2. Ambil main terbaru dan buat branch baru sebelum mengedit. Untuk paket yang menunggu fondasi yang masih dalam PR, gunakan branch bertingkat secara eksplisit dan catat base/dependensinya di PR. Jangan memasukkan perubahan independen ke PR bertingkat.
3. Implementasikan paket sampai dapat direview. Jalankan pemeriksaan yang relevan; perhitungan memakai kasus referensi, UI memakai browser pada mobile/desktop. Simpan bukti aktual.
4. Stage hanya file paket, cek diff, commit Conventional Commits, push branch, lalu buka PR dengan satu lingkup. Jangan klaim hasil CI sebelum selesai.
5. Pemilik review dan merge. Setelah dependensi digabung, perbarui base PR turunannya ke main dan verifikasi ulang. Jangan merge otomatis hanya untuk melanjutkan loop.
6. Mulai paket berikutnya yang syaratnya sudah terpenuhi. Bila ada syarat yang belum jelas, selesaikan pekerjaan independen dan catat input yang dibutuhkan; jangan menggantinya dengan data, kredensial atau hasil model rekaan.

## Input pemilik yang masih diperlukan

- Review scope usulan SD/provinsi/2025–2026 serta ketentuan penggunaan empat file. Persetujuan memakai data nyata belum diberikan.
- Nama target database/schema Equora pada PostgreSQL bersama. Jangan mengirim password di chat; konfigurasi rahasia tetap lokal.
- Sumber atau asumsi biaya paket, kapasitas dan kendala pemerataan untuk demo yang akan ditampilkan.
- Boundary/lisensi, konfigurasi PMTiles dan hosting deployment, serta kebutuhan admin/auth.

Acuan: [tugas pemilik](README.md), [aturan branch/PR](../ATURAN-KONTRIBUTOR.md), [gerbang data](../../data-readiness.md), dan [keputusan terbuka](../../decisions.md).
