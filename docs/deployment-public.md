# Menyambungkan Layanan Data ke Pratinjau Publik

Dokumen ini menjelaskan langkah agar pratinjau publik `https://equora-tau.vercel.app` menampilkan data, bukan hanya kerangka halaman.

## Kondisi saat ini

- Frontend Vercel merespons `200` untuk `/`, `/explore`, `/studio`, dan `/admin`.
- Endpoint data merespons `503` karena `API_BASE_URL` belum menunjuk backend publik yang aktif:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://equora-tau.vercel.app/api/health
# 503
```

Halaman statis tetap tampil, tetapi Explorer GIS, Studio, Compare, dan Admin memerlukan backend.

## Yang dibutuhkan

1. **Backend FastAPI dengan HTTPS publik**, misalnya VPS + reverse proxy, Render, Railway, atau Fly.io.
2. **PostgreSQL yang sudah dimigrasikan** dan berisi rilis data:
   ```bash
   cd backend
   uv run alembic upgrade head
   ```
3. **Environment backend**:
   | Variabel | Contoh | Catatan |
   | --- | --- | --- |
   | `DATABASE_URL` | `postgresql+psycopg://...neon.tech/equora?sslmode=require` | Gunakan URL pooled untuk runtime |
   | `DATABASE_URL_UNPOOLED` | URL langsung Neon | Untuk migrasi |
   | `ADMIN_TOKEN` | token acak panjang | Wajib untuk `POST /api/v1/admin/import` |
   | `CORS_ORIGINS` | `["https://equora-tau.vercel.app"]` | Harus sama persis dengan origin frontend |
   | `REQUIRE_PUBLISHED_DATA` | `true` | Kembalikan `false` hanya untuk pratinjau tanpa rilis |
   | `DATA_DIR` | `/data` | Hanya jika backend membaca berkas lokal |
4. **Environment Vercel**:
   | Variabel | Nilai |
   | --- | --- |
   | `API_BASE_URL` | `https://<domain-backend>` |

`API_BASE_URL` dibaca server-side (`$env/dynamic/private`), jadi tidak dikirim ke browser. Set untuk environment **Production** dan **Preview**, lalu redeploy.

## Opsi A — VPS dengan Compose

`compose.production.yaml` sudah menyediakan API + web + health check.

```bash
export DATABASE_URL='postgresql+psycopg://...'
export ADMIN_TOKEN='...'
export PUBLIC_ORIGIN='https://equora-tau.vercel.app'
export EQUORA_DATA_DIR='/path/ke/data'
docker compose -f compose.production.yaml up -d --build
```

Letakkan reverse proxy HTTPS (Caddy/Nginx) di depan port loopback web. Untuk arsitektur Vercel, cukup jalankan layanan `api` dan arahkan `API_BASE_URL` Vercel ke domain HTTPS API tersebut.

## Opsi B — Render / Railway

Gunakan `backend/Dockerfile` sebagai image:

- **Build context**: `backend`
- **Dockerfile**: `backend/Dockerfile`
- **Health check path**: `/api/v1/health/ready`
- **Port**: `8000`

Set environment yang sama seperti tabel di atas. Jalankan migrasi sekali dari mesin lokal yang terhubung ke database yang sama:

```bash
cd backend
DATABASE_URL_UNPOOLED='postgresql+psycopg://...' uv run alembic upgrade head
```

## Isi data rilis

Setelah backend dan database siap, unggah manifest melalui `/admin` atau endpoint admin:

```bash
curl -X POST https://<domain-backend>/api/v1/admin/import \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @manifest.json
```

Jika belum ada rilis dan `REQUIRE_PUBLISHED_DATA=true`, readiness akan tetap `503`.

## Verifikasi

```bash
# 1. Backend hidup
curl -s https://<domain-backend>/api/v1/health/live
# {"status":"ok","service":"Equora API"}

# 2. Backend siap + database + rilis
curl -s https://<domain-backend>/api/v1/health/ready
# {"status":"ok","service":"Equora API"}

# 3. Proxy Vercel sudah benar
curl -s https://equora-tau.vercel.app/api/health
# {"status":"ok","service":"Equora API"}

# 4. Data mengalir
curl -s -o /dev/null -w "%{http_code}\n" https://equora-tau.vercel.app/api/v1/datasets
# 200
```

Jika langkah 1–2 sudah `ok` tetapi langkah 3 masih `503`, periksa kembali `API_BASE_URL` di Vercel dan pastikan deployment ulang dilakukan setelah variabel diubah.

## Catatan keamanan

- Jangan commit `backend/.env`, `DATABASE_URL`, atau `ADMIN_TOKEN`.
- Batasi `CORS_ORIGINS` ke origin produksi; jangan gunakan `*`.
- Endpoint impor bersifat fail-closed terhadap checksum dan skema, tetapi tetap memerlukan token yang kuat.
