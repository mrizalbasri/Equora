# Backend Equora

Fondasi FastAPI, Pydantic v2, SQLAlchemy, Alembic, PostgreSQL, Polars, openpyxl, dan OR-Tools. Python 3.14 diperlukan. Dependensi dikunci lintas platform dalam `uv.lock`; `requirements.lock` adalah ekspor production untuk Docker.

## Development di Windows PowerShell

Jalankan dari folder `backend/`:

```powershell
python -m pip install uv
uv sync --locked --extra dev
Copy-Item .env.example .env
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Jangan menimpa `.env` yang sudah berisi konfigurasi sendiri. Untuk macOS/Linux, ganti `Copy-Item` dengan `cp`. Database memakai instance Docker `postgres-local` yang sudah ada (PostgreSQL 18, host port 5434, network `tera_default`). Compose Equora tidak menyediakan layanan PostgreSQL atau volume database.

Per 21 Oktober 2026, database lokal `equora` dan `equora_test` sudah dibuat pada instance tersebut dengan role owner terpisah. Detail ada pada [registry draft](../docs/dataset-registry.md). Kontributor lain menyiapkan target khususnya sendiri, lalu mengisi `DATABASE_URL` untuk proses lokal dan `DOCKER_DATABASE_URL` untuk container menggunakan contoh `.env.example`. Password harus di-URL-encode dan disimpan hanya pada `.env` lokal. Jangan arahkan migrasi ke database `postgres`, `tera`, `hygeia`, atau database proyek lain.

- API: http://localhost:8000/docs
- Liveness: http://localhost:8000/api/v1/health/live
- Readiness database: http://localhost:8000/api/v1/health/ready

Liveness tidak memerlukan database. Readiness mengembalikan 503 jika koneksi belum dikonfigurasi atau database gagal dihubungi, tanpa membocorkan detail koneksi. Readiness memeriksa konektivitas, bukan kelengkapan schema bisnis. Tidak ada pembuatan database, `create_all`, atau migrasi saat startup.

## Seluruh backend lewat Docker

```powershell
docker compose up --build -d
docker compose logs -f api
```

Compose hanya menjalankan API secara default. API bergabung ke network eksternal PostgreSQL yang sudah ada (`POSTGRES_NETWORK`) dan network internal `equora-local`. Container memakai hostname `postgres-local` dan port internal 5432; proses lokal memakai localhost:5434. Health container memeriksa liveness, sedangkan `/api/v1/health/ready` tetap menunjukkan kesiapan database secara terpisah.

Setelah target Equora dan koneksinya siap, migrasi dijalankan secara manual:

```powershell
uv run alembic upgrade head
# Alternatif dalam Docker:
docker compose --profile tools run --rm migrate
```

Jika port API 8000 sudah digunakan, atur `API_PORT` pada `.env`, misalnya 18000. Sesuaikan `API_BASE_URL` pada `frontend/.env`. API lokal melalui Uvicorn memakai argumen `--port` yang sama.

Alternatif dari root dengan PowerShell: `.\scripts\equora.ps1 backend`. Perintah gabungan tersedia di [panduan scripts](../scripts/README.md).

## Struktur

```text
app/
  api/           # Route dan schema HTTP
  core/          # Konfigurasi environment
  db/            # Engine dan metadata model
  etl/           # Adapter dan validasi sumber data
  analysis/      # Perhitungan MCDA
  optimization/  # Model solver dan validasi hasil
migrations/      # Alembic
tests/
```

ETL menyediakan [adapter staging XLSX pendidikan](../docs/dataset-staging.md) untuk scope satu jenjang/Total, quality report dan provenance lokal. [Registry draft](../docs/dataset-registry.md) dapat mencatat hasil staging secara transaksional di PostgreSQL; belum menerbitkan release. Analisis dan optimasi menyediakan sandbox sintetis sesuai [MCDA](../docs/priority-sandbox.md) dan [alokasi](../docs/allocation-sandbox.md), belum terhubung ke HTTP, database atau UI. Import admin, registry published dan API domain belum tersedia. Migrasi `0001` menginisialisasi riwayat; `0002` menambah lima tabel registry draft.

## Pemeriksaan

```powershell
uv run ruff check . ../scripts/export_openapi.py
uv run ruff format --check . ../scripts/export_openapi.py
uv run pytest
uv run python ../scripts/export_openapi.py
```

Tes PostgreSQL dilewati bila `TEST_DATABASE_URL` tidak tersedia. Untuk menjalankannya, gunakan database khusus pengujian yang boleh diubah migrasinya:

```powershell
$env:TEST_DATABASE_URL = 'postgresql+psycopg://USER:PASSWORD@localhost:5434/equora_test'
uv run pytest
```

Jika `TEST_DATABASE_URL` sudah tersimpan pada `.env` lokal, gunakan `uv run python ../scripts/test_postgres.py`. Skrip hanya memuat URL tes dan menolak database selain `equora_test`. Tes registry di-rollback; tes migrasi melakukan downgrade/upgrade pada target tersebut.

CI tidak membuat PostgreSQL atau database baru. Uji migrasi bersifat opt-in setelah database pengujian khusus disiapkan. Jangan arahkan variabel pengujian ke database bersama milik proyek lain atau production.

## Mengubah dependensi dan kontrak API

Setelah mengubah `pyproject.toml`:

```powershell
uv lock
uv sync --locked --extra dev
uv export --locked --no-dev --no-hashes --no-emit-project --output-file requirements.lock
```

Setelah mengubah route atau schema, ekspor `openapi.json`, lalu jalankan `pnpm generate:api` dari `frontend/`. Commit schema dan tipe hasil generate bersama perubahan API. CI memeriksa keduanya.
