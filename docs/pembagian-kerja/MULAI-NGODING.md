# Mulai ngoding dari fondasi Equora

Frontend sudah dapat di-install, diperiksa dan dibangun. Halaman produk, navigasi, komponen bersama, API katalog, dataset dan engine belum tersedia. Mulai dari paket [landing/about](teman/01-landing-about/README.md) sambil mengoordinasikan shell dengan pemilik.

## Ambil branch fondasi sebelum PR digabung

Jika repository belum ada di mesinmu, clone dulu:

```powershell
git clone https://github.com/mrizalbasri/Equora.git
cd Equora
```

Dengan checkout bersih, ambil fondasi dan buat branch pekerjaan sendiri:

```powershell
git fetch origin
git switch --no-track -c feat/landing-about origin/chore/project-foundation
cd frontend
pnpm install --frozen-lockfile
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm dev
```

Perintah membuat branch baru; jika `feat/landing-about` sudah ada, gunakan branch milikmu yang sesuai tanpa menimpanya. Setelah PR fondasi digabung, pekerjaan baru dimulai dari `main` terbaru mengikuti [aturan kontributor](ATURAN-KONTRIBUTOR.md).

## Kebutuhan untuk pekerjaan frontend

- Node.js 24 dan pnpm 11.18.0, sesuai `frontend/package.json`.
- Frontend berjalan di http://localhost:5173, tanpa Docker frontend.
- Backend/database tidak diperlukan untuk mulai mengerjakan halaman frontend. Root saat ini menampilkan JSON status fondasi.
- Jika backend belum berjalan, `/api/health` mengembalikan 503. Ini tidak berarti instalasi frontend gagal.
- `API_BASE_URL` pada `.env` menunjuk backend yang disepakati. Port default contoh 8000; mesin pemilik memakai 18000. Jangan menyalin kredensial database pemilik.

Jika pnpm belum tersedia, ikuti [panduan frontend](../../frontend/README.md). Untuk integrasi backend, minta kontrak dan URL kepada pemilik. PostgreSQL memakai instance bersama yang sudah ada; database lokal `equora`/`equora_test` dan registry draft tersedia sesuai [panduan registry](../dataset-registry.md). Jangan membuat server/database baru atau menjalankan migrasi saat mengerjakan UI.

## Pemeriksaan sebelum push

Jalankan dari folder frontend:

```powershell
pnpm check
pnpm check:api
pnpm test
pnpm build
pnpm test:e2e
```

Tes HTTP fondasi belum menggantikan pemeriksaan browser, keyboard dan mobile untuk halaman yang kamu tambahkan. Perbarui tes sesuai perubahan route. Root `+server.ts` dan `/health` adalah endpoint fondasi; jangan menghapusnya tanpa koordinasi.

Kembali ke root, stage hanya file paketmu, lalu commit dan push branch sendiri:

```powershell
cd ..
git status
git add frontend/src/routes/about/
git diff --cached
git commit -m "feat(web): add about page"
git push -u origin feat/landing-about
```

Contoh staging di atas berlaku setelah halaman About dibuat. Sertakan file fitur lain yang memang kamu ubah, lalu ajukan PR. Selama fondasi belum digabung, target PR fitur ke `chore/project-foundation` agar diff hanya berisi fitur; setelah fondasi digabung, ubah target ke `main`. Pemilik mereview dan mengintegrasikan perubahan.

Tugas katalog menunggu kontrak katalog; tugas metodologi menunggu naskah formula dan contoh hitung yang sudah diperiksa. Tipe yang dihasilkan OpenAPI saat ini hanya mencakup health. Fixture harus sintetis dan berlabel demo.
