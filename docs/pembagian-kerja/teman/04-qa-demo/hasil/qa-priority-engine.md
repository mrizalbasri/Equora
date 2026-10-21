# QA Priority Engine

## Ringkasan

Pengujian dilakukan pada branch `test/priority-engine-qa` terhadap commit
`29fed39a1b06983354ffafaabf054d6c2927d9a3` (`feat(analysis): add explainable
MCDA sandbox with golden cases`). Modul yang diuji adalah MCDA sandbox tanpa
HTTP, database, data release produksi, atau UI.

## Lingkungan

| Field | Isi |
|---|---|
| Build / commit | `29fed39a1b06983354ffafaabf054d6c2927d9a3` |
| URL | Tidak ada; pengujian dilakukan pada modul backend lokal |
| Runtime | Python 3.14, `uv`, environment dev dari `uv sync --locked --extra dev` |
| Browser / viewport | Tidak berlaku; belum ada route UI untuk modul ini |
| Data | Fixture sintetis pada `backend/tests/test_priority.py` |
| Tanggal | 19 Oktober 2026 |

## Kasus uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| PRIO-01 / golden MCDA | Environment backend tersinkron | Jalankan `uv run pytest tests/test_priority.py` dari `backend/` | Contoh sintetis menghasilkan skor dan ranking sesuai dokumentasi | 20 tes lulus | Lulus | Tidak ada |
| PRIO-02 / kontribusi indikator | Fixture kebutuhan dan bobot valid | Jalankan suite Priority Engine | Kontribusi per indikator dikembalikan tanpa pembulatan skor lebih awal | Dicakup suite; lulus | Lulus | Tidak ada |
| PRIO-03 / missing dan nol | Fixture dengan nilai `null` dan `0` | Jalankan suite Priority Engine | Missing dikeluarkan secara eksplisit; nol tetap valid dan tidak diperlakukan sebagai missing | Dicakup suite; lulus | Lulus | Tidak ada |
| PRIO-04 / helper akses | Persentase akses valid dan `null` | Jalankan suite Priority Engine | Kebutuhan dihitung sebagai `1 - access / 100`; `null` tetap `null` | Dicakup suite; lulus | Lulus | Tidak ada |
| PRIO-05 / tie-break dan urutan input | Wilayah dengan skor sama dan input berbeda urutan | Jalankan suite Priority Engine | Ranking deterministik berdasarkan kode wilayah; urutan input tidak mengubah hasil | Dicakup suite; lulus | Lulus | Tidak ada |
| PRIO-06 / input invalid | Bobot, indikator, kode wilayah dan nilai invalid | Jalankan suite Priority Engine | Input ditolak secara eksplisit | Dicakup suite; lulus | Lulus | Tidak ada |
| PRIO-07 / integrasi HTTP/UI | Kontrak API dan route UI belum tersedia | Periksa scope modul dan jalur aplikasi | Integrasi tidak boleh diklaim selesai | Tidak dijalankan karena belum tersedia | Terblokir | Menunggu kontrak API dan integrasi pemilik |

## Validasi tambahan

Perintah berikut dijalankan dari root/backend sesuai dokumentasi:

```text
cd backend
uv run pytest tests/test_priority.py
20 passed

uv run pytest
26 passed, 1 skipped

uv run ruff check . ../scripts/export_openapi.py
All checks passed

uv run ruff format --check . ../scripts/export_openapi.py
20 files already formatted
```

Tes PostgreSQL dilewati karena `TEST_DATABASE_URL` tidak disetel. Modul
Priority Engine tidak membutuhkan database.

## Keterbatasan dan narasi demo

1. Demo hanya menunjukkan perhitungan MCDA pada kebutuhan yang sudah
   dinormalisasi ke `[0,1]`; ini bukan hasil analisis data wilayah nyata.
2. Fixture sintetis harus ditampilkan sebagai contoh teknis, bukan statistik
   resmi atau insight produksi.
3. Modul belum terhubung ke endpoint HTTP, data release, persistence, atau
   halaman Explorer/Scenario Studio.
4. Belum ada screenshot browser karena belum tersedia route UI yang memakai
   modul ini.
5. Benchmark latensi, integrasi database, dan validasi provenance belum
   diklaim.

Urutan demo yang aman: jelaskan kontrak input dan kebijakan `exclude`, jalankan
golden case sintetis, tunjukkan kontribusi dan ranking deterministik, lalu
jelaskan bahwa integrasi produksi masih menunggu kontrak API dan data release.
