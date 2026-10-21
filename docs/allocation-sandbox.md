# Sandbox alokasi paket integer

Status: kandidat CP-SAT **sandbox**, hanya biaya berlabel `demo_assumption`. Belum dipilih sebagai solver final, belum memakai data nyata, belum ada HTTP/persistence/UI atau benchmark representatif. Tidak menetapkan harga/kapasitas/fairness resmi. Batas ini mengikuti PRD bagian 13.

## Model yang diuji

Satu jenis intervensi, pilihan jumlah paket integer per wilayah `x_i`:

```text
maximize sum(priority_units_i * x_i)
sum(cost_idr_i * x_i) <= budget_idr
minimum_packages_i <= x_i <= capacity_i
```

Prioritas berupa bilangan bulat pada skala yang **wajib** dinyatakan pemanggil. Modul tidak membulatkan skor MCDA secara diam-diam. Objective adalah proxy linear berbobot kebutuhan, bukan dampak pendidikan atau jumlah sekolah yang pasti tertolong. Manfaat marjinal konstan sampai kapasitas adalah asumsi model sandbox, bukan temuan data. Tidak mendukung banyak jenis intervensi, diminishing returns atau fairness lintas kelompok.

Biaya positif, anggaran nonnegatif, kapasitas/minimum integer, kode unik, dan prioritas [0, scale] divalidasi. Minimum di atas kapasitas adalah input invalid; total biaya minimum di atas anggaran adalah kasus infeasible. Total objective/biaya maksimum dibatasi pada integer yang dapat dilaporkan tepat sebagai float oleh solver (2^53−1). Ini batas representasi sandbox, bukan target kapasitas produksi.

## Status dan verifikasi

- `optimal` dan `feasible` memiliki alokasi yang dihitung ulang secara independen: keys wilayah, integrality, budget, minimum dan kapasitas.
- `infeasible` hanya saat solver membuktikannya. `no_solution` berarti pencarian berhenti tanpa solusi dan bukan bukti infeasible.
- `invalid_model`, `execution_error`, dan `invalid_result` tidak mengembalikan alokasi parsial. Input invalid ditolak sebelum solver.
- Hasil menyertakan versi model/OR-Tools, batas waktu, satu worker dan seed 0. Untuk hasil solusi, bound dan absolute gap disertakan. Tidak ada klaim alokasi unik ketika beberapa optimum tersedia atau alokasi identik lintas versi solver.
- Dua baseline menggunakan budget/capacity/minimum yang sama: `equal` membagi putaran paket tambahan dalam urutan kode wilayah, `greedy` memakai benefit/cost ratio eksak lalu prioritas/kode sebagai tie-break. Keduanya bukan bukti optimal. Sisa anggaran tetap dilaporkan.

## Bukti sintetis

Tes memakai SYN-A/B/C, biaya dan prioritas fiktif berlabel di kode tes. Enumerasi terpisah menghitung seluruh kombinasi kapasitas kecil, kemudian membandingkan optimum untuk anggaran 0–20. Baseline diperiksa pada setiap budget. Tes lain memeriksa sensitivitas budget/biaya, alokasi yang melanggar constraint, berhenti tanpa solusi, exception solver, input invalid, kapasitas nol dan repeatability pada kasus optimum unik.

Jalankan dari `backend/`: `uv run pytest tests/test_allocation.py`. Verifikasi 19 Oktober 2026: 35 tes modul lulus, termasuk hasil solver yang sengaja dirusak ditolak validator dan contoh optimum 140 dibanding baseline 90. Suite backend pada branch ini 41 lulus, 1 tes PostgreSQL dilewati karena target uji belum disetel. Ruff check/format serta pemeriksaan docs/diff lulus. Tidak ada benchmark/stress/performa atau uji deployment yang dapat disimpulkan dari kasus kecil ini. Referensi API/status: [dokumentasi primer CP-SAT](https://developers.google.com/optimization/cp/cp_solver).
