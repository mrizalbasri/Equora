# MCDA sandbox

Status: modul perhitungan tanpa HTTP/database, diuji dengan fixture sintetis. Bukan insight data nyata dan bukan persetujuan formula/release produksi. Batas ini mengikuti PRD bagian 13.

`backend/app/analysis/priority.py` menerima kebutuhan yang **sudah** dinormalisasi ke [0,1], dengan nilai lebih tinggi berarti kebutuhan lebih besar. Untuk persentase akses yang kompatibel, helper eksplisit `access_percentage_to_need` menghitung `1 - access/100`; null tetap null. Jumlah akses tidak boleh dimasukkan ke helper tanpa denominator yang benar. Modul tidak melakukan min-max dari kumpulan wilayah atau menebak normalisasi indikator lain.

## Kontrak perhitungan

- `RegionNeeds`: kode wilayah unik dan kebutuhan per indikator berupa `Decimal` atau null. Data harus sudah setara tahun, jenjang, unit dan versi sebelum pemanggilan. Modul ini tidak membuktikan provenance.
- Bobot nonnegatif dalam [0,1] harus berjumlah tepat 1. Tidak ada bobot default yang dianggap resmi. Decimal menghindari pembulatan float diam-diam; local precision 50 untuk hasil konsisten terhadap context pemanggil.
- `score_i = sum(weight_j * need_ij)`. Kontribusi per indikator dikembalikan, tanpa membulatkan skor sebelum ranking.
- Missing policy hanya `exclude`: wilayah yang kehilangan indikator berbobot positif dikeluarkan dengan daftar indikator yang hilang. Indikator berbobot nol tidak memerlukan nilai; jika nilai diberikan tetap divalidasi. Null tidak menjadi nol, sedangkan angka nol tetap valid.
- Skor turun, lalu kode wilayah naik sebagai tie-break deterministik. Rank ordinal unik; skor sama tetap dapat dibaca dari kontribusinya. Indicator keys dan excluded codes diurutkan agar input order tidak mengubah hasil.
- Duplikat kode, unknown indicator, NaN/infinity, nilai di luar batas dan kebijakan missing yang tidak didukung ditolak. Hasil kosong atau semua wilayah excluded tetap dikembalikan secara eksplisit.

## Contoh sintetis terverifikasi

Bobot sanitasi 0.75 dan air 0.25. SYN-A memiliki kebutuhan 0.6/0.4: kontribusi 0.45 + 0.10 = **0.55**. SYN-B memiliki 0.2/0.8: 0.15 + 0.20 = **0.35**. SYN-ZERO bernilai nol tetap ikut; SYN-MISSING tanpa air dikeluarkan dan dihitung pada cakupan input. Ini bukan data suatu provinsi.

Jalankan dari `backend/`: `uv run pytest tests/test_priority.py`. Tes mencakup golden case, kontribusi, missing/nol, arah persentase, tie-break, perubahan bobot/rank, urutan input, hasil kosong, dan penolakan input invalid. Pada 19 Oktober 2026, 20 tes modul lulus; suite backend keseluruhan 26 lulus, 1 tes PostgreSQL dilewati karena `TEST_DATABASE_URL` tidak disetel. Ruff check/format dan pemeriksaan docs/diff lulus. HTTP, data release, persistence dan UI belum dihubungkan. Benchmark/latensi belum diklaim.
