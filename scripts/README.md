# Perintah repository

`scripts/` berisi alat yang melintasi frontend/backend atau berlaku untuk seluruh repository. Alat khusus frontend, seperti pemeriksa tipe API hasil generate, berada di `frontend/scripts/`. Adapter ETL, perhitungan MCDA dan solver berada di modul `backend/app/`.

## PowerShell

Pasang dependensi terlebih dahulu sesuai [README utama](../README.md). Jalankan dari root repository:

```powershell
.\scripts\equora.ps1 dev
.\scripts\equora.ps1 check
.\scripts\equora.ps1 test
.\scripts\equora.ps1 openapi
```

| Perintah | Perilaku |
|---|---|
| `help` (default) | Menampilkan daftar perintah |
| `dev` | Menjalankan API Docker di background, lalu `pnpm dev` di terminal yang sama |
| `frontend` | Menjalankan frontend lokal saja |
| `backend` | Menjalankan API melalui `backend/compose.yaml` |
| `check` | Ruff, tautan dokumentasi, typecheck, kontrak TypeScript dan pemeriksaan whitespace Git |
| `test` | pytest, Vitest, build frontend dan tes HTTP Playwright |
| `openapi` | Mengekspor schema FastAPI dan membuat ulang tipe TypeScript; kedua artefak berubah jika kontrak berubah |

Skrip menghentikan rangkaian perintah jika ada kegagalan dan mengembalikan direktori kerja semula. Lokasi proyek ditentukan dari lokasi skrip, sehingga tetap bekerja jika dipanggil dari direktori lain menggunakan path lengkap.

`dev` dan `backend` memerlukan Docker Desktop serta instance PostgreSQL bersama dan network yang sudah ada. Keduanya tidak membuat database, menjalankan migrasi, atau menimpa `.env`. Frontend memerlukan `API_BASE_URL` yang sesuai port API, seperti dijelaskan di [panduan frontend](../frontend/README.md).

Ctrl+C pada `dev` menghentikan frontend. API Docker tetap berjalan. Untuk menghentikan API dari root:

```powershell
docker compose -f backend/compose.yaml stop api
```

`test` melewati pengujian migrasi jika `TEST_DATABASE_URL` belum dikonfigurasi. Hanya gunakan target pengujian khusus yang boleh diubah oleh migrasi; jangan arahkan ke database proyek lain. Detail ada di [panduan backend](../backend/README.md).

## Alat Python

- `check_docs.py`: memeriksa tautan file lokal dari Markdown root dan `docs/`.
- `export_openapi.py`: mengekspor kontrak backend tanpa server HTTP atau koneksi database.
