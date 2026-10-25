# Coverage di GitHub

Workflow `Stack checks` menjalankan test dengan coverage pada setiap pull request
dan push ke `main`. Hasil backend dan frontend diunggah ke Codecov dengan flag
terpisah serta disimpan sebagai artefak `coverage-backend` dan `coverage-frontend`
di halaman run GitHub Actions.

## Aktivasi Codecov

1. Masuk ke [Codecov Equora](https://app.codecov.io/gh/mrizalbasri/Equora).
2. Pastikan [aplikasi GitHub Codecov](https://github.com/apps/codecov) terpasang
   dan diberi akses ke repository Equora, lalu pilih **Setup repo** jika diperlukan.
3. Jalankan workflow melalui pull request. Kedua langkah upload memakai OIDC
   (`use_oidc: true`) dan izin `id-token: write` pada job terkait. Tidak diperlukan
   secret `CODECOV_TOKEN` atau instalasi CLI di komputer kontributor.

Ikuti [panduan OIDC resmi](https://github.com/codecov/codecov-action#using-oidc).
Kegagalan upload membuat job gagal agar integrasi yang belum aktif terlihat.
Persentase coverage bersifat informatif dalam `codecov.yml`; belum ada ambang
minimum atau aturan branch protection baru.

## Menjalankan lokal

Dari `backend/`:

```sh
uv sync --locked --extra dev
uv run pytest --cov --cov-report=term-missing --cov-report=xml --cov-report=html
```

Laporan XML tersedia di `backend/coverage/coverage.xml` dan HTML di
`backend/coverage/html/index.html`. Coverage mengukur statement dan branch pada
seluruh paket `app`, termasuk modul yang belum diuji. Test PostgreSQL tetap
dilewati jika `TEST_DATABASE_URL` tidak tersedia; laporan bukan bukti bahwa
integrasi database telah diuji.

Dari `frontend/`:

```sh
pnpm install --frozen-lockfile
pnpm run prepare
pnpm run test:coverage
```

Laporan LCOV tersedia di `frontend/coverage/lcov.info` dan HTML di
`frontend/coverage/index.html`. Provider V8 mengukur file TypeScript di `src/`,
termasuk file yang belum diuji, dengan pengecualian test dan deklarasi tipe.
Komponen `.svelte` dan test browser Playwright belum diukur. Test E2E tetap
dijalankan secara terpisah oleh CI. Artefak laporan dan data `.coverage` diabaikan
Git.
