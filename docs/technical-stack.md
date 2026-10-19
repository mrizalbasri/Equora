# Stack teknis dan rencana pembuktian Equora

Tanggal keputusan: 19 Oktober 2026.

Status: baseline stack disetujui pengguna; fondasi backend/frontend kini disiapkan pada [setup stack](setup-stack.md). Fitur domain, benchmark, dan audit dataset belum tersedia. Setup ini tidak menetapkan solver final, target kapasitas, maupun seluruh desain sistem.

## 1. Dasar keputusan

Equora membutuhkan explorer data, peringkat kebutuhan MCDA, dan simulasi alokasi anggaran yang dapat ditelusuri. Stack dipilih berdasarkan kecocokan terhadap kebutuhan tersebut, kemampuan diuji, dan beban pengembangan/operasional. Tidak ada klaim bahwa pilihan ini paling cepat atau paling kuat secara universal.

| Bagian | Baseline | Alasan dan batas keputusan |
|---|---|---|
| Web | SvelteKit, TypeScript, Tailwind CSS | Explorer dan scenario studio dalam satu aplikasi; keputusan berdasarkan kebutuhan produk, belum perbandingan performa frontend |
| Visualisasi | ECharts | Grafik perbandingan wilayah, kontribusi indikator, dan perubahan skenario |
| Peta | MapLibre GL JS, Protomaps/PMTiles, basemap OSM | Baseline peta disetujui; layer analisis hanya setelah lisensi boundary dan join kode wilayah tervalidasi; tabel/grafik tetap tersedia. Lihat [rencana peta](map-plan.md) |
| API | FastAPI, Pydantic v2 | Validasi input dan skema OpenAPI; komputasi tetap dalam modul Python terpisah |
| Kontrak web/API | Tipe TypeScript yang dihasilkan dari OpenAPI | Hindari mendefinisikan bentuk request/response secara manual di dua tempat; CI memeriksa kontrak yang tidak sinkron |
| Persistensi | PostgreSQL, SQLAlchemy 2, Alembic | Relasi, constraint, versi dataset, dan snapshot skenario; PostGIS hanya jika query spasial dibutuhkan |
| ETL | Polars, openpyxl, validasi schema | Polars menjadi pilihan utama; Pandas ditambahkan jika adapter/library membutuhkan kompatibilitasnya |
| Analisis | Modul MCDA Python dan OR-Tools | Rumus, missing policy, constraint, dan kontribusi dapat diuji tanpa HTTP; solver final mengikuti bentuk model dan benchmark |
| Raw files | Volume lokal saat development; object storage kompatibel S3 saat production | File sumber immutable, metadata lisensi dan hash tercatat |
| Verifikasi | pytest/httpx, Vitest, Playwright, GitHub Actions | Uji perhitungan, kontrak API, dan alur pengguna; Docker Compose untuk lingkungan lokal |

TanStack Query digunakan bila kebutuhan cache, refetch, dan mutation di browser membenarkannya; tidak wajib untuk setiap halaman. Redis, antrean worker, Prefect, Kubernetes, dan RAG tidak menjadi dependensi wajib MVP. Worker ditambahkan jika pengukuran menunjukkan komputasi mengganggu respons API atau melampaui batas request hosting.

## 2. Alternatif dan pemicu evaluasi ulang

| Alternatif | Kapan layak dievaluasi | Bukti sebelum mengganti baseline |
|---|---|---|
| Next.js menggantikan SvelteKit | Kompetensi tim atau integrasi React menjadi kebutuhan dominan | Prototype satu alur explorer/studio, waktu implementasi, dependensi yang diperlukan, dan hasil pengujian alur yang sama |
| Django menggantikan FastAPI | Admin, akun, dan workflow CRUD mendominasi scope | Perbandingan kebutuhan admin/auth, usaha integrasi engine, dan biaya migrasi kontrak API |
| Pandas menggantikan/melengkapi Polars | Library atau adapter data membutuhkan Pandas | Kompatibilitas dan pengukuran waktu/memori pada file sumber yang sama |
| PostGIS melengkapi PostgreSQL | Perlu query radius, intersection, atau join geometri | Query konkret dan kebutuhan indeks; peta choropleth berbasis kode wilayah saja tidak mewajibkannya |
| HiGHS atau SCIP sebagai solver alternatif | Model linear memakai variabel kontinu dan integer, atau baseline solver tidak memenuhi kebutuhan | Benchmark model matematis yang setara dengan batas waktu, hardware, dan toleransi yang dicatat |

Alternatif bukan dependensi yang otomatis ditambahkan. Tidak ada perubahan framework hanya berdasarkan popularitas atau benchmark yang tidak mewakili Equora.

## 3. Pemilihan solver dan batas metode

- CP-SAT menjadi kandidat awal untuk jumlah paket integer dan keputusan boolean. Koefisien harus direpresentasikan sebagai integer dengan skala/rounding yang terdokumentasi; jangan mengubah biaya diam-diam.
- Jika model memakai variabel kontinu bersama integer, evaluasi solver MIP seperti SCIP atau HiGHS. OR-Tools adalah toolkit, bukan satu solver tunggal.
- Jika struktur model benar-benar dapat dinyatakan sebagai network flow, evaluasi solver khusus tanpa menghilangkan aturan pemerataan yang disyaratkan.
- Pisahkan pembentukan model, pemanggilan solver, dan validasi hasil. Uji alternatif pada objective dan constraint yang setara; catat perbedaan jika kesetaraan tidak dapat dicapai.
- Snapshot mencatat metode normalisasi, bobot, kebijakan missing, biaya, kapasitas, constraint, versi data/model, solver/versi, seed bila tersedia, batas waktu, toleransi, dan jumlah worker/thread. Simpan hasil yang dipakai agar dapat diaudit; jangan menjanjikan alokasi identik untuk beberapa optimum tanpa aturan tie-breaking yang diuji.

## 4. Bukti yang wajib tersedia

| ID | Pengujian | Kriteria lulus / laporan |
|---|---|---|
| V-01 | Kasus kecil dengan enumerasi seluruh alokasi | Objective hasil yang dinyatakan optimal sama dengan optimum enumerasi; alokasi memenuhi seluruh constraint |
| V-02 | Validasi hasil independen dari solver | Hitung ulang biaya dan constraint dari alokasi; tidak melampaui budget/capacity, tidak negatif, jumlah paket integer |
| V-03 | Baseline alokasi merata dan greedy skor kebutuhan | Terapkan aturan budget/capacity/fairness yang sama; jika baseline infeasible, laporkan. Bandingkan objective, budget terpakai, cakupan, dan pemerataan; tidak wajib optimizer menang pada semua ukuran |
| V-04 | Status dan penghentian solver | Bedakan optimal, feasible belum terbukti optimal, infeasible terbukti, berhenti tanpa solusi, model invalid, dan kegagalan eksekusi. Timeout tanpa solusi tidak boleh disebut infeasible |
| V-05 | Sensitivitas | Jalankan bobot dan biaya baseline serta variasi -10%/+10%; normalisasi ulang bobot ke total 1, catat pembulatan biaya dan parameter yang berubah. Laporkan perubahan ranking, alokasi, objective, dan feasibility |
| V-06 | Reproduksibilitas | Ulangi kasus referensi dari snapshot; verifikasi skor dan feasibility serta objective dalam toleransi yang dicatat. Perbedaan alokasi akibat optimum ganda dijelaskan |
| V-07 | Kontrak dan alur produk | CI memeriksa tipe OpenAPI sinkron; E2E explorer -> dua skenario -> compare/export menampilkan sumber, asumsi, dan status hasil |

Simpan objective terbaik dan bound solver jika tersedia serta definisi gap sesuai solver. Jika tidak tersedia, tulis unavailable; jangan menganggap gap nol. Klaim optimal hanya mengikuti status solver dan toleransi yang dinyatakan, setelah validasi hasil lulus.

## 5. Protokol benchmark

Setelah audit data, tetapkan kasus kecil yang bisa dienumerasi, kasus representatif cakupan MVP, dan kasus stress sintetis berlabel. Catat jumlah wilayah, intervensi, variabel, constraint, dan karakteristik data setiap kasus.

Untuk setiap kandidat solver, jalankan satu warm-up dan lima pengulangan terukur dengan model setara. Catat OS, CPU, RAM, versi runtime/library, konfigurasi thread, seed, batas waktu, dan toleransi. Pisahkan waktu pembentukan model, solving, dan total request. Laporkan median/maksimum waktu, peak memory dengan metode pengukurannya, status, objective, bound/gap bila tersedia, dan pelanggaran constraint.

Ukuran kasus serta target latensi, memori, dan concurrency ditetapkan setelah dataset dan hosting diketahui, sebelum benchmark dijalankan. Angka hasil tidak boleh diisi dari perkiraan. Pilih kandidat yang lulus validasi dan memenuhi target; jika setara, prioritaskan implementasi dan operasi yang lebih sederhana. Jika tidak ada yang lulus, catat keterbatasan dan tinjau model/scope secara eksplisit.

Hasil benchmark disimpan bersama commit kode, konfigurasi, hash input, dan instruksi menjalankan ulang. Repository saat ini belum berisi hasil benchmark.

## 6. Pertanggungjawaban hasil

Optimal berarti terbaik untuk objective, data, dan constraint yang dipakai, dalam toleransi solver yang dinyatakan. Itu tidak membuktikan dampak pendidikan, kelayakan kebijakan, atau keadilan secara universal. Laporan harus menyertakan provenance, coverage/missing data, alasan bobot dan constraint, sumber biaya atau label asumsi demo, serta sensitivitas hasil. Jangan menyebut proxy cakupan sebagai jumlah sekolah yang pasti terbantu.

## 7. Referensi primer

Ditinjau pada 19 Oktober 2026. Referensi menjelaskan kemampuan teknologi; bukan benchmark Equora.

- [FastAPI features](https://fastapi.tiangolo.com/features/): validasi Pydantic, OpenAPI, dan dokumentasi schema.
- [Polars lazy optimizations](https://docs.pola.rs/user-guide/lazy/optimizations/): optimasi query pada lazy API; tidak menjamin setiap workload lebih cepat.
- [OR-Tools MIP dan pemilihan solver](https://developers.google.com/optimization/mip): pemilihan metode mengikuti struktur masalah.
- [OR-Tools CP-SAT](https://developers.google.com/optimization/cp/cp_solver): representasi integer dan status hasil solver.
- [HiGHS](https://highs.dev/): alternatif solver LP/MIP/QP.
- [PostGIS](https://postgis.net/docs/en/index.html): penyimpanan, indeks, dan pemrosesan data geografis.
