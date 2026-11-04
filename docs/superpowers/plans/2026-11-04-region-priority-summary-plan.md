# Rencana Implementasi Ringkasan Prioritas Provinsi

Tanggal: 4 November 2026
Desain: `docs/superpowers/specs/2026-11-04-region-priority-summary-design.md`

## 1. Benchmark service dan kontrak backend

- Tambahkan model respons insight wilayah di `backend/app/api/views.py`.
- Tambahkan service murni di `backend/app/services/region_insights.py` untuk validasi nilai, median, standard competition ranking, delta, tie-breaker, dan alasan data tidak tersedia.
- Tambahkan unit test service untuk median ganjil/genap, seri, nol sekolah, nilai kosong, semua sama, dan satu nilai valid.
- Tambahkan endpoint `GET /api/v1/regions/{code}/insights` di `backend/app/api/workspace.py` dengan validasi rilis dan jenjang yang sama seperti profil.
- Perluas API test untuk rilis tersemat, 404 wilayah, dan 422 jenjang.

## 2. Sinkronisasi OpenAPI dan tipe frontend

- Regenerasi `backend/openapi.json` dari aplikasi FastAPI.
- Regenerasi `frontend/src/lib/api/schema.d.ts` melalui script repository.
- Tambahkan alias `RegionInsights` di `frontend/src/lib/api/workspace.ts`.
- Jalankan pemeriksaan kontrak API.

## 3. Komponen ringkasan wilayah

- Tambahkan `frontend/src/lib/components/RegionPrioritySummary.svelte`.
- Render kartu perhatian, relatif kuat, kelengkapan, keadaan netral, rincian benchmark, provenance, dan CTA Studio.
- Gunakan markup semantik, status aksesibel, target sentuh yang memadai, dan layout satu kolom pada mobile.
- Integrasikan fetch insight independen ke `RegionJourney.svelte`; kegagalannya tidak boleh menghilangkan profil.
- Tolak respons yang tidak cocok dengan kode wilayah, rilis, atau jenjang aktif.

## 4. Preset fokus Studio

- Baca parameter `focus` saat memuat konteks Studio.
- Validasi terhadap `workspace.core_indicators`.
- Terapkan bobot 70/30 deterministik dengan total tepat 100 serta fallback seimbang.
- Tampilkan penjelasan bahwa bobot fokus merupakan titik awal yang dapat diubah, bukan rekomendasi resmi.

## 5. Pengujian frontend

- Perluas fixture API dengan respons insight sintetis.
- Tambahkan E2E untuk kartu, rincian, status review, CTA, parameter URL, bobot fokus, fokus invalid, error insight terisolasi, keyboard, dan viewport mobile.
- Tambahkan unit test helper bobot fokus bila logika diekstrak dari route Studio.

## 6. Verifikasi dan commit

- Jalankan Ruff serta pytest backend yang relevan, kemudian suite backend penuh.
- Jalankan test frontend, `pnpm check`, `pnpm check:api`, build, dan Playwright yang relevan.
- Periksa diff serta status worktree untuk memastikan tidak ada perubahan di luar fitur.
- Buat commit terpisah untuk backend, frontend, dan pengujian jika pembagian tetap atomik dan masing-masing lulus pemeriksaan terkait.
