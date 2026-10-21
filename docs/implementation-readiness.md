# Audit kesiapan implementasi

**Pembaruan workspace lokal 21 Oktober 2026:** branch integrasi menyambungkan sepuluh workbook, API katalog/observasi, Explorer dengan peta/fallback, Studio, snapshot, Compare, CSV/PDF dan admin token. Lihat [panduan lokal dan batasnya](local-workspace.md). Bagian audit main serta backlog di bawah adalah baseline sebelum integrasi, bukan klaim bahwa fitur lokal masih belum tersedia. Release publik, hosting, operasi produksi dan submission tetap terpisah.

Pemeriksaan 21 Oktober 2026 terhadap main `b1037c11b2394dca45a4531aba6bca54a858c911`, setelah `git pull --ff-only` menghasilkan `Already up to date`. Dokumen ini menggantikan klaim status terkini pada laporan lama, tanpa mengubah bukti historisnya. Prioritas di bawah mengikuti dependensi PRD, bukan perubahan scope atau jadwal kompetisi.

## Yang tersedia

| Bagian | Bukti di main | Batas |
|---|---|---|
| Fondasi web/API | PR #1, #2, #4; health endpoints, OpenAPI dan tipe frontend | Belum ada endpoint domain |
| Landing/About | PR #21; tes browser lima viewport | Pratinjau belum terhubung data/engine |
| Audit empat sumber | PR #5; manifest, SHA256, laporan join 38 provinsi | Ketentuan penggunaan, release dan mapping wilayah belum tuntas |
| MCDA | PR #6; 20 tes prioritas | Library sandbox, bukan endpoint produk |
| Alokasi integer | PR #7; 35 tes alokasi | Satu intervensi, biaya asumsi demo, belum fairness produksi |
| Katalog/detail | PR #9; `/datasets`, pencarian dan detail | Fixture berlabel, belum API katalog |
| Metodologi | Halaman `/methodology` ada di main; QA PR #11 | PR #10 ditutup tanpa merge; keberadaan halaman dibuktikan dari source/build saat ini |
| QA terpisah | PR #12, #13, #14, #11 | Hasil lama berlaku pada commit yang disebut, bukan otomatis pada main terbaru |

Status GitHub diperiksa dengan `gh pr list --state all`: tidak ada PR terbuka saat audit. #1, #2, #4–#7, #9, #11–#16, dan #21 sudah merged. #3, #8, #10, #17–#20 closed tanpa merge. Isi yang menyerupai PR tertutup tidak menjadi bukti bahwa PR tersebut merged.

## Perbaikan pada paket ini

- Hilangkan persentase akses, jumlah paket, penggunaan anggaran dan klaim solusi optimal/pemerataan yang tidak berasal dari data atau engine. Tampilkan status belum tersedia/belum dihitung dan kebutuhan denominator untuk internet/komputer.
- Beri label contoh antarmuka yang terlihat pada kedua mode. Bobot 35/45/20 tetap ilustrasi tampilan dan diberi label tidak digunakan engine.
- Ganti role tab yang tidak memiliki kontrak tabpanel/keyboard dengan kelompok tombol toggle berstatus `aria-pressed`; kedua mode diuji dengan keyboard dan mouse.
- Hubungkan Landing/About ke katalog dan metodologi melalui footer bersama. Jangan tautkan Explorer/Studio sebelum routenya tersedia.
- Hapus pemasangan Chromium kedua dalam job CI yang sama; pemasangan pertama tetap berjalan sebelum E2E.
- Selaraskan README, keputusan dan urutan implementasi dengan keadaan source serta status GitHub.

## Backlog berurutan

Setiap baris menjadi paket branch/PR sendiri. Jangan mencentang selesai hanya karena dependensi atau library sudah terpasang.

| Prioritas / paket | Yang harus dikerjakan | Kriteria selesai / dependensi |
|---|---|---|
| P0 · Metadata dan release | Tinjau ketentuan sumber; tetapkan jenjang/periode/indikator, mapping kode, kamus data, missing dan versi release | Provenance per indikator; hash cocok; natural key unik; join dua arah; status publish eksplisit. Raw data tidak dipublikasikan sebelum ketentuannya jelas |
| P0 · Kontrak dan impor | Registry dataset/release, validasi XLSX, quality report dan API katalog/observasi | Import dapat diulang; null berbeda dari nol; agregat Indonesia/Luar Negeri tidak dijumlahkan ke provinsi; fixture kontrak dan tes import/API lulus |
| P0 · Database | Tentukan database/schema khusus Equora, konfigurasi lokal, model/migrasi dan tes upgrade/downgrade pada target pengujian khusus | Tidak menyentuh database proyek lain; migrasi manual; koneksi readiness berhasil. Docker lokal saat audit tidak berjalan |
| P1 · Katalog dan konsistensi UI | Sambungkan katalog/detail ke API; satukan shell dan token biru pada katalog/detail/metodologi | Loading/error/empty/not-found nyata, skip link dan navigasi keyboard; tidak ada CSS body global yang menimpa tema saat perpindahan route; mobile 360px dan desktop teruji |
| P1 · Explorer | Filter tahun/jenjang/indikator, tabel/grafik, detail wilayah, provenance dan ekspor | Memakai published release; missing/coverage terlihat; ekspor membawa sumber/versi/filter; API dan browser diuji. Tabel/grafik dapat selesai sebelum peta |
| P1 · Integrasi prioritas | Adapter observasi ke kebutuhan, bobot dan kontribusi, versi metode | Golden cases tetap lulus; indikator count tidak dijadikan persen tanpa denominator; input invalid dan missing dilaporkan |
| P1 · Studio/snapshot | Kontrak biaya/kapasitas/budget, API sandbox, baseline, snapshot immutable dan UI | Tampilkan asumsi demo, status solver, bound/gap dan validator independen; gagal/infeasible tidak menghasilkan alokasi palsu; tes API/UI dan reproduksi snapshot |
| P1 · Comparison | Bandingkan dua snapshot dengan versi/metode yang kompatibel | Selisih anggaran/objective/alokasi dapat direproduksi; versi berbeda diberi alasan tidak kompatibel; ekspor membawa asumsi |
| P2 · Peta/fallback | Boundary berlisensi, crosswalk kode, join/geometry, PMTiles/atribusi dan fallback | Ikuti [rencana peta](map-plan.md); missing bukan nol; tabel tetap berfungsi jika tile/WebGL gagal |
| P2 · Admin/operasi | Tentukan kebutuhan auth/role, impor/publish terlindungi, audit perubahan | Endpoint tulis tidak terbuka; otorisasi diuji; backup/restore diuji pada data uji |
| P1 · Integrasi/deployment | Jalankan Explorer → Studio → Compare; konfigurasi hosting/API/database dan pengukuran kapasitas | Tes kontrak/E2E, loading/error, mobile/keyboard, provenance, smoke test URL deploy; target performa ditetapkan sebelum benchmark |
| P1 · Submission | Identitas tim, screenshot build aktual, PDF first draft, proposal/surat/video final dan bukti pengumpulan | Ikuti [checklist submission](submission-checklist.md); ukuran/halaman/nama file diperiksa; jangan klaim sudah dikirim tanpa bukti |

Pembaruan paket berikutnya, 21 Oktober 2026: [staging XLSX](dataset-staging.md) dan [registry draft PostgreSQL](dataset-registry.md) tersedia pada branch paket masing-masing. Database lokal `equora`/`equora_test` sudah dibuat di instance Docker yang ada dan tes PostgreSQL telah dijalankan. Tabel backlog tetap membedakan registry draft dari published release/API; hasil baseline di bawah berasal dari audit sebelum paket tersebut.

Input yang masih diperlukan: target hosting/konfigurasi produksi, ketentuan sumber yang berlaku, pilihan unit analisis final, asumsi biaya/kapasitas/fairness, identitas tim, serta boundary/PMTiles. Kredensial tetap di konfigurasi lokal; tidak diminta di chat.

## Bukti validasi

Baseline sebelum perubahan:

- Backend `uv run pytest`: 61 passed, 1 skipped; tes PostgreSQL dilewati karena `TEST_DATABASE_URL` tidak tersedia. `uv run ruff check .`: lulus.
- Frontend `pnpm check`: 0 errors, 0 warnings; `pnpm test`: 2 passed; `pnpm build` dan `pnpm check:api`: lulus.
- Browser `pnpm test:e2e`: 9 passed; Landing/About pada 360, 390, 768, 1024 dan 1440px, katalog/search/detail/404, metodologi dan health.
- `python scripts/check_docs.py`: 36 berkas Markdown diperiksa. Lolos tautan tidak membuktikan isi status dokumen benar.
- Tes regresi baru pada 360px gagal pada build lama karena label batas pratinjau tidak ada; pesan `element(s) not found` membuktikan tes menangkap masalah awal.

Pemeriksaan lokal tidak membuktikan release data, migrasi PostgreSQL, deployment, performa representatif, atau submission selesai. Laporan QA lama tetap disimpan untuk keterlacakan. Hasil sesudah perubahan juga dicatat pada PR.

Sesudah perbaikan: `pnpm check` 0 errors/0 warnings; `pnpm build`, `pnpm check:api` dan 2 unit tests lulus; 9 tes E2E lulus termasuk mode alokasi, navigasi footer dan pemeriksaan overflow di lima viewport. Ruff lint/format dan ekspor OpenAPI lulus, tanpa perubahan kontrak. Tautan pada 37 Markdown diperiksa; `git diff --check` bersih.

Gerbang perbaikan UI yang diubah:

- R-17/R-36 PASS: angka akses/alokasi dan klaim optimal/pemerataan dihapus dari source; tes memastikan nilai lama tidak tampil dan status belum dihitung terlihat.
- R-26/R-32 PASS: kedua mode memakai tombol dengan `aria-pressed`; keyboard Enter dan klik mengubah konten; tautan footer diuji sampai route tujuan.
- R-03/R-35 PASS: build dan 9 E2E lulus; tidak ada overflow pada kedua mode di 360/390/768/1024/1440px; tidak ada pageerror dalam alur Landing/About.
- Arah visual tetap mengikuti fondasi Clean Education Blue yang sudah disetujui. Paket ini memperbaiki representasi data dan interaksi, tidak menyatakan seluruh halaman produk sudah lolos audit desain/aksesibilitas menyeluruh.

Bukti screenshot sesudah perbaikan: [akses desktop](evidence/readiness/access-desktop.png), [alokasi desktop](evidence/readiness/allocation-desktop.png), dan [alokasi mobile](evidence/readiness/allocation-mobile.png). Ini bukti pratinjau antarmuka, bukan hasil engine atau bukti submission.
