# Tugas kamu: sistem inti dan integrasi

Porsi perkiraan 75-80%. Kamu memegang keputusan teknis utama dan integrasi akhir. Teman memiliki halaman pendukung yang dijelaskan di [indeks pembagian](../README.md).

Status paket, dependensi dan siklus satu branch/PR per pekerjaan tersedia pada [urutan implementasi](urutan-implementasi.md). Landing/about juga dikerjakan pada sesi ini atas permintaan eksplisit pengguna; pembagian paket pendukung lainnya tetap berlaku.

| Kelompok | Yang dikerjakan | Hasil yang harus tersedia |
|---|---|---|
| Fondasi | SvelteKit/TypeScript, FastAPI, PostgreSQL, migrasi, konfigurasi lokal, CI, layout/tokens/navigasi bersama | Aplikasi bisa dijalankan dengan petunjuk yang benar; komponen bersama tersedia untuk teman |
| Data | Audit sumber/lisensi, schema, import, validasi, mapping wilayah, release immutable dan provenance | Data terverifikasi, quality report, metadata dan kontrak API |
| Explorer | Filter, tabel/grafik indikator, detail wilayah, ekspor CSV | Semua tampilan memakai release dan definisi yang sama |
| Peta | MapLibre, Protomaps/PMTiles, boundary, join geografis, atribusi dan fallback | Lulus gerbang pada rencana peta |
| MCDA | Normalisasi, bobot, missing policy, ranking, kontribusi dan tie-breaking | Rumus terdokumentasi dan kasus referensi diuji |
| Simulasi | Model biaya/kapasitas/fairness, solver, validasi hasil, sensitivitas dan benchmark | Anggaran/constraint dipenuhi, status jujur dan hasil dapat diaudit |
| Skenario | Penyimpanan snapshot, comparison dan ekspor ringkasan | Dua skenario dapat dibandingkan dengan provenance dan asumsi |
| Akses dan operasi | Admin/auth sesuai kebutuhan scope, proteksi API/upload, deployment, konfigurasi aset dan backup demo | Alur admin terlindungi dan demo bisa dijalankan ulang |
| Integrasi | Review PR teman, kontrak, perbaikan bug inti, bukti teknis submission | Satu alur explorer -> scenario -> compare berjalan dan teruji |

## Input yang kamu serahkan ke teman

- Paket 01: shell, tokens, navigasi, route tersedia, naskah/manfaat dan sumber yang boleh ditampilkan.
- Paket 02: tipe TypeScript hasil OpenAPI, contoh response katalog/detail/quality, aturan status dan fixture berlabel. Kontrak memuat identitas dataset, judul, penerbit, sumber, periode, jenjang, level wilayah, unit, lisensi dan status kualitas sesuai ketersediaan.
- Paket 03: formula, arti variabel, bobot/default, missing policy, contoh hitung yang sudah diperiksa, istilah dan batasan. Tandai bagian metode yang belum final.
- Paket 04: URL/commit build, cara menjalankan, fixture dan akun uji yang diperlukan melalui kanal aman, alur yang sudah siap diuji serta hasil perhitungan referensi.

Jangan menjadikan teman penanggung jawab kebenaran model hanya karena dia menampilkan rumus atau menguji antarmuka. Kamu tetap menguji perhitungan dan constraint melalui unit/integration tests.

Acuan: [PRD](../../PRD_Equora.md), [kesiapan data](../../data-readiness.md), [stack dan validasi](../../technical-stack.md), [rencana peta](../../map-plan.md).
