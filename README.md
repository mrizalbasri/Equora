# Equora

Platform web untuk membandingkan akses fasilitas pendidikan dari data publik dan menguji simulasi prioritas alokasi sumber daya yang dapat dijelaskan. Disiapkan untuk Web In Action (WIA), MIA 2026.

**Status 18 Oktober 2026: dokumentasi dan persiapan repository. Aplikasi belum diimplementasikan.**

## Dokumentasi

Mulai dari [indeks docs](docs/README.md) dan [evaluasi kesesuaian lomba](docs/competition-alignment.md).

## Stack yang direncanakan

SvelteKit, TypeScript, Tailwind CSS, ECharts; FastAPI, PostgreSQL; Polars/Pandas dan OR-Tools. Ini rencana teknis dalam PRD, belum menjadi dependensi terpasang.

## Menjalankan project

Saat ini tidak ada aplikasi atau perintah install/run. Buka repository lokal dan baca [PRD](docs/PRD_Equora.md). Setelah frontend/backend dibuat, bagian ini wajib dilengkapi URL clone sebenarnya, versi runtime, konfigurasi environment, instalasi dependensi, migrasi/seed, serta perintah menjalankan aplikasi sebelum First Draft.

Untuk memeriksa tautan dokumentasi dengan Python 3:

```sh
python scripts/check_docs.py
```

## Progress

- [x] BRD, PRD dan baseline desain.
- [x] Evaluasi materi Technical Meeting dan checklist submission.
- [x] Struktur docs, template issue/PR, dan workflow pemeriksaan docs.
- [ ] Audit file dataset dan lisensi.
- [ ] Landing page dan explorer berjalan.
- [ ] Simulasi, perbandingan skenario, dan pengujian.
- [x] Repository publik [mrizalbasri/Equora](https://github.com/mrizalbasri/Equora).
- [ ] Deployment, screenshot, PDF dan video submission.

## Batasan

Hasil alokasi adalah simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi. Data tahunan ditampilkan dengan tahun dan waktu pengambilan; tidak disebut real-time. Belum ada dataset yang diunduh atau diverifikasi dalam repository ini.

Lihat [panduan kontribusi](CONTRIBUTING.md) dan [setup GitHub](docs/github-setup.md). Lisensi publikasi kode belum dipilih pemilik project; repository publik tidak otomatis memberi izin penggunaan ulang.
