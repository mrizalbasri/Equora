# QA Allocation Engine

## Ringkasan

Pengujian dilakukan pada branch `test/allocation-engine-qa` terhadap commit
`e57cd85ef449829fdd34dd6b1b9318108cbe9c08` (`feat(optimization): validate
allocation sandbox against enumeration and baselines`). Modul yang diuji
adalah allocation sandbox CP-SAT dengan satu intervensi dan paket integer.
Modul belum terhubung ke HTTP, database, data release produksi, atau UI.

## Lingkungan

| Field | Isi |
|---|---|
| Build / commit | `e57cd85ef449829fdd34dd6b1b9318108cbe9c08` |
| URL | Tidak ada; pengujian dilakukan pada modul backend lokal |
| Runtime | Python 3.14, `uv`, environment dev dari `uv sync --locked --extra dev` |
| Browser / viewport | Tidak berlaku; belum ada route UI untuk modul ini |
| Data | Fixture sintetis SYN-A, SYN-B, dan SYN-C |
| Solver | OR-Tools CP-SAT, satu worker, seed 0 |
| Tanggal | 20 Oktober 2026 |

## Kasus uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| ALLOC-01 / optimum enumerasi | Environment backend tersinkron | Jalankan `uv run pytest tests/test_allocation.py` dari `backend/` | Hasil solver sama dengan optimum brute-force pada budget 0-20 | 35 tes lulus | Lulus | Tidak ada |
| ALLOC-02 / baseline | Fixture sintetis valid | Jalankan suite Allocation Engine | Baseline `equal` dan `greedy` memakai constraint yang sama dan tidak melebihi optimum | Dicakup suite; lulus | Lulus | Tidak ada |
| ALLOC-03 / evaluasi independen | Hasil alokasi solver atau eksternal | Jalankan suite Allocation Engine | Key wilayah, integer, budget, minimum, dan kapasitas divalidasi ulang | Dicakup suite; lulus | Lulus | Tidak ada |
| ALLOC-04 / status solver | Budget, batas waktu, dan exception solver bervariasi | Jalankan suite Allocation Engine | `optimal`, `infeasible`, `no_solution`, `execution_error`, dan `invalid_result` dibedakan; tidak ada alokasi parsial pada status gagal | Dicakup suite; lulus | Lulus | Tidak ada |
| ALLOC-05 / input invalid | Opsi wilayah, batas kasus, biaya, dan time limit invalid | Jalankan suite Allocation Engine | Input invalid ditolak secara eksplisit sebelum atau selama proses yang sesuai | Dicakup suite; lulus | Lulus | Tidak ada |
| ALLOC-06 / sensitivitas dan repeatability | Budget/biaya diubah dan kasus kapasitas nol | Jalankan suite Allocation Engine | Budget lebih besar tidak menurunkan objective; biaya lebih mahal tidak meningkatkan objective; hasil repeatable | Dicakup suite; lulus | Lulus | Tidak ada |
| ALLOC-07 / integrasi HTTP/UI | Kontrak API dan route UI belum tersedia | Periksa scope modul dan jalur aplikasi | Integrasi tidak boleh diklaim selesai | Tidak dijalankan karena belum tersedia | Terblokir | Menunggu kontrak API dan integrasi pemilik |

## Validasi tambahan

Perintah berikut dijalankan sesuai dokumentasi backend:

```text
cd backend
uv run pytest tests/test_allocation.py
35 passed

uv run pytest
41 passed, 1 skipped

uv run ruff check . ../scripts/export_openapi.py
All checks passed

uv run ruff format --check . ../scripts/export_openapi.py
20 files already formatted
```

Tes PostgreSQL dilewati karena `TEST_DATABASE_URL` tidak disetel. Allocation
Engine tidak membutuhkan database untuk pengujian sandbox.

## Keterbatasan dan narasi demo

1. Model hanya mencakup satu intervensi, paket integer, objective linear,
   kapasitas, minimum paket, dan constraint anggaran.
2. Biaya menggunakan `demo_assumption`; belum ada biaya resmi, kapasitas resmi,
   fairness constraint, atau data wilayah nyata.
3. Objective adalah proxy berbobot prioritas, bukan dampak pendidikan atau
   jumlah sekolah yang pasti tertolong.
4. Belum ada diminishing returns, banyak jenis intervensi, API, persistence,
   halaman Scenario Studio, benchmark representatif, atau uji deployment.
5. Belum ada screenshot browser karena belum tersedia route UI yang memakai
   modul ini.

Urutan demo yang aman: jelaskan asumsi demo dan constraint, jalankan kasus
sintetis, bandingkan hasil optimal dengan baseline, tunjukkan validasi
independen dan status solver, lalu jelaskan bahwa integrasi produksi masih
menunggu kontrak API, data release, biaya, kapasitas, dan constraint yang
disetujui pemilik.
