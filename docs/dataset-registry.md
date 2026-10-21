# Registry draft PostgreSQL

Paket lanjutan [staging XLSX](dataset-staging.md), berdasarkan PRD EP-01/EP-02. Registry menyimpan hasil staging untuk ditinjau; belum ada published release, mapping wilayah resmi, endpoint impor admin, atau API observasi publik.

## Target lokal

Sesuai persetujuan pengguna 21 Oktober 2026, memakai container PostgreSQL yang sudah ada: `postgres-local`, PostgreSQL 18, `localhost:5434` / port container 5432. Tidak membuat instance/container PostgreSQL baru dan tidak menjalankan migrasi pada `postgres`, `tera`, atau `hygeia`.

- `equora`: database development, dimiliki role `equora_owner`.
- `equora_test`: database khusus tes migrasi/registry, dimiliki `equora_test_owner`.

Kedua role non-superuser, tanpa hak create database/role, dan tidak diberi akses CONNECT ke database Equora yang lain. Koneksi/password di `backend/.env` lokal yang diabaikan Git. Role owner diperlukan untuk migrasi lokal; akun runtime deployment dengan hak lebih sempit tetap perlu dirancang sebelum publikasi.

Database tersebut sudah dibuat lokal; kontributor lain memakai target khususnya sendiri. Compose tetap hanya berisi API/migrate dan memakai network PostgreSQL eksternal. Tidak ada auto-create database atau auto-migrate saat startup.

## Struktur dan identitas

| Tabel | Fungsi / kunci |
|---|---|
| `datasets` | ID sumber stabil; metadata versi tidak ditimpa pada impor berikutnya |
| `dataset_versions` | ID sumber + SHA256; unik `(dataset_id, sha256)`; snapshot metadata/provenance JSONB |
| `staging_imports` | Satu scope jenjang/Total per versi adapter dan file; unik `(dataset_version_id, education_level, adapter_version)` |
| `staged_observations` | PK `(import_id, source_region_code)`; NUMERIC tanpa pembatas presisi, null dan lokasi sel asli |
| `quality_issues` | PK `(import_id, position)`; kode, severity dan lokasi sel |

Indeks PK/unique diawali kolom FK untuk akses anak per parent. Constraint database memeriksa format hash/kode sumber, jenjang, status/error count, unit dan rentang nilai. Count harus integer; persen maksimal 100; NaN/infinity/negatif ditolak. Kode tetap `publisher_source_code_unmapped`, bukan ID wilayah canonical. Jenjang, tahun, indikator sumber dan versi tersimpan pada parent import/version, sehingga observasi tidak mengulang metadata scope.

ID import berupa UUID deterministik dari versi file, jenjang dan versi adapter. Fingerprint SHA256 atas seluruh report mendeteksi perubahan hasil untuk identitas yang sama. Registrasi ulang report yang sama mengembalikan `created: false` tanpa menambah observasi/issue; perubahan metadata versi atau report ditolak, bukan ditimpa. `INSERT ... ON CONFLICT DO NOTHING` dan pemeriksaan fingerprint berjalan dalam satu transaksi. Pemanggil service wajib rollback ketika registrasi gagal; CLI melakukannya otomatis.

Report invalid tetap boleh disimpan dengan status `invalid` dan baris diagnostik parsial. Tidak ada status `published` pada tabel impor ini. Import staged/invalid tidak boleh dipakai sebagai data Explorer atau insight resmi.

## Migrasi, registrasi dan pemeriksaan

Dari `backend/`, setelah `DATABASE_URL` diarahkan ke database khusus Equora:

```powershell
uv run alembic upgrade head
uv run alembic check
uv run python -m app.etl.register_education --source-id sanitation --file ../data/raw/source-audit-2026-10-19/sanitation.xlsx --education-level SD
uv run python ../scripts/test_postgres.py
```

Gunakan ID/file sumber lain sesuai manifest. CLI menghitung ulang staging dari file yang cocok hash, lalu menyimpannya dalam satu transaksi. CLI membatasi target ke database bernama `equora`, tanpa argumen password pada command line. Kesalahan SQL hanya menghasilkan pesan umum, tanpa URL/parameter koneksi. Exit code 0 untuk staged, 1 untuk report invalid yang tercatat, 2 untuk kegagalan konfigurasi/registrasi.

Skrip tes hanya membaca `TEST_DATABASE_URL` dari environment atau `.env`; field JSON lain tetap dibaca Pydantic seperti biasa. Tidak perlu mengekspor seluruh `.env` ke shell. Tes menolak target selain `equora_test`; kasus registry memakai transaksi yang di-rollback. Uji migrasi melakukan downgrade/upgrade hanya pada database tes tersebut. Jangan menjalankan downgrade pada `equora` yang berisi draft yang ingin dipertahankan.

## Bukti lokal

Migrasi 0002 diterapkan ke `equora`; `alembic check` tidak menemukan perbedaan model/schema. Empat file audit diimpor untuk SD/Total: 4 dataset, 4 versi, 4 import dan 152 observasi staged. Registrasi sanitasi kedua menghasilkan `created: false` dan ID import sama. Tidak ada raw data atau observasi yang ditambahkan ke Git; release tetap `not_approved`.

Tes registry memeriksa idempotensi, preservasi Decimal/null/sel, scope jenjang, konflik metadata/report, rollback seluruh tabel, report invalid, FK, natural key serta constraint nilai langsung di PostgreSQL. CI tanpa `TEST_DATABASE_URL` tetap melewati tes database; bukti pengujian PostgreSQL pada paket ini berasal dari instance lokal yang sudah ada.

Hasil lokal final: `uv run python ../scripts/test_postgres.py -q` menghasilkan **122 passed**, tanpa skip. Ini mencakup 16 tes registry PostgreSQL, 5 tes guard CLI dan round-trip migrasi. Ruff lint/format lulus; inspeksi kedua role mengonfirmasi bukan superuser, tanpa create database/role, dan tidak dapat CONNECT ke database Equora yang lain. Database tes tidak menyisakan baris fixture setelah suite selesai.

Berikutnya: review kontrak registry produksi, mapping wilayah, ketentuan penggunaan dan gerbang publish; baru kemudian API katalog/observasi published dan integrasi Explorer. Paket ini tidak menyatakan PRD registry/import produksi seluruhnya selesai.
