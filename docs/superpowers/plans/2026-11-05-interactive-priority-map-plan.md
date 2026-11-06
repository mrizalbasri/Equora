# Rencana Implementasi Peta Prioritas Interaktif

Tanggal: 5 November 2026
Branch: `feat/interactive-priority-map`
Ketergantungan: PR #15 (`feat/region-priority-summary`)
Spesifikasi: `docs/superpowers/specs/2026-11-05-interactive-priority-map-design.md`

## Seam Pengujian yang Disetujui

- API publik `GET /api/v1/regions/insights-map`.
- Model presentasi publik yang diberikan Explorer kepada `ProvinceMap`.
- Perilaku pengguna pada `/explore`: mode peta, pilihan provinsi, panel ringkasan, fallback error, dan CTA.
- Kontrak OpenAPI yang menghasilkan tipe frontend.

## Potongan 1 — Service Insight Agregat

1. Tambahkan test gagal pada `backend/tests/test_region_insights.py` untuk hasil seluruh provinsi, benchmark terpilih, kelengkapan, nilai kosong, unit nonpersentase, dan konsistensi dengan insight satu provinsi.
2. Tambahkan fungsi batch pada `backend/app/services/region_insights.py` dengan perhitungan bersama agar median dan peringkat tidak dihitung ulang per provinsi.
3. Jalankan test service sampai hijau.

## Potongan 2 — Endpoint dan Kontrak API

1. Tambahkan test gagal pada `backend/tests/test_workspace.py` untuk endpoint, keterikatan rilis/jenjang/indikator, respons 404/422, dan konteks yang dipin.
2. Tambahkan schema peta pada `backend/app/api/views.py`.
3. Tambahkan route statis `/regions/insights-map` sebelum route dinamis `/regions/{code}`.
4. Jalankan test endpoint sampai hijau.
5. Regenerasi `backend/openapi.json` dan `frontend/src/lib/api/schema.d.ts`, lalu jalankan pemeriksaan kontrak.

## Potongan 3 — Model Presentasi Peta

1. Tambahkan test gagal untuk model mode `value`, `median`, dan `completeness`, legenda, tooltip, warna kosong, serta indikator nonpersentase.
2. Buat modul murni `frontend/src/lib/maps/priority-map.ts` agar aturan visual tidak tertanam di MapLibre.
3. Jalankan test unit sampai hijau.

## Potongan 4 — Explorer dan ProvinceMap

1. Perluas fixture browser dengan respons insight-map.
2. Tambahkan test browser gagal untuk tiga mode, query `view`, panel ringkasan, sinkronisasi tabel, CTA profil/Studio, mobile, dan fallback insight.
3. Perluas tipe API frontend dari schema hasil generate.
4. Ubah Explorer agar memuat observasi dan insight agregat pada konteks yang sama, menolak respons usang, serta menjaga mode nilai saat insight gagal.
5. Ubah `ProvinceMap` agar menerima model presentasi, mengganti paint tanpa fetch baru, dan merender legenda sesuai mode.
6. Jalankan test browser terkait sampai hijau.

## Potongan 5 — Verifikasi

- Backend: Ruff, test service, test workspace, dan seluruh pytest yang tidak memerlukan database eksternal.
- Frontend: Vitest, `svelte-check`, pemeriksaan kontrak API, dan build.
- Browser: test Explorer pada viewport mobile dan desktop.
- Tinjau diff untuk bahasa interpretasi, fallback, data kosong, aksesibilitas, dan perubahan yang tidak terkait.

## Urutan Commit

1. `feat(api): add aggregate region map insights`
2. `feat(map): add interactive priority views`
3. `test(map): cover priority map journey` bila test browser perlu dipisahkan secara logis

Tidak ada push, PR baru, atau merge tanpa instruksi pengguna berikutnya.
