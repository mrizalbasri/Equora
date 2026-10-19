# Aturan kerja kontributor Equora

Berlaku untuk pembagian kerja dua orang mulai 19 Oktober 2026. Dokumen ini adalah kesepakatan alur kerja; belum merupakan pengaturan pembatasan akses atau branch protection di GitHub.

## 1. Ambil tugas yang sudah dibagi

Tugas kontributor adalah landing/about, katalog dataset, metodologi dan QA demo. Baca [folder tugas](README.md) sebelum mulai. Kerjakan satu paket sampai siap direview, lalu lanjutkan paket berikutnya. Mulai dari landing/about setelah fondasi tersedia; sambil menunggu, siapkan outline konten dan sumber.

Pemilik memegang sistem inti, kontrak data/API, database, MCDA/solver, explorer/peta, comparison, integrasi dan deployment. Jika menemukan kebutuhan di luar paket, catat dan diskusikan dahulu. Ini mencegah pekerjaan tumpang tindih dan perubahan yang membuat bagian lain rusak.

## 2. Branch wajib sebelum coding dan Conventional Commits

- Setiap pekerjaan baru wajib memakai branch terpisah sebelum mengedit kode/dokumentasi. Berlaku untuk pemilik dan kontributor; jangan commit/push langsung ke branch utama. Buat branch dari branch utama terbaru.
- Gunakan nama `<type>/<deskripsi-kebab-case>`, huruf kecil dan tanda hubung. Contoh paket: `feat/landing-about`, `feat/dataset-catalog`, `feat/methodology`, `test/demo-qa`. Jangan memakai prefix nama asisten atau produk.
- Lanjutkan pekerjaan yang sama pada branch yang sama; tidak perlu branch baru setiap commit. Setelah PR digabung, pekerjaan berikutnya memakai branch baru dari branch utama terbaru.
- Satu branch/PR membahas satu paket atau perbaikan yang jelas. Hindari menyertakan format ulang atau perubahan file yang tidak terkait.
- Push hanya branch pekerjaan sendiri dan buka PR ke branch utama. Pemilik mereview serta melakukan merge setelah perubahan siap.
- Jangan force-push branch utama atau branch orang lain, menghapus branch orang lain, maupun mengubah pengaturan repository tanpa kesepakatan pemilik.
- Jika ada konflik yang melibatkan file bersama, koordinasikan dengan pemilik. Jangan menimpa perubahan orang lain agar konflik terlihat selesai.

### Jenis perubahan

| Type / prefix branch | Kegunaan | Contoh commit |
|---|---|---|
| `feat` | Fitur baru | `feat(datasets): add dataset catalog` |
| `fix` | Perbaikan bug | `fix(datasets): handle empty search results` |
| `docs` | Dokumentasi | `docs(team): clarify task handover` |
| `refactor` | Struktur kode tanpa menambah fitur/memperbaiki bug | `refactor(web): extract dataset metadata component` |
| `test` | Penambahan/perbaikan pengujian | `test(datasets): cover failed catalog requests` |
| `chore` | Pemeliharaan umum | `chore(repo): update ignore patterns` |
| `perf` | Peningkatan performa | `perf(explorer): avoid repeated indicator transforms` |
| `build` | Build dan dependensi | `build(web): configure production adapter` |
| `ci` | Workflow CI | `ci: check generated API contracts` |
| `style` | Format kode tanpa perubahan perilaku | `style(web): format dataset components` |
| `revert` | Membatalkan perubahan | `revert: undo catalog layout change` |

Perubahan tampilan/fitur UI yang mengubah perilaku atau hasil yang terlihat memakai `feat`/`fix` sesuai tujuan; `style` di tabel ini untuk format kode saja. Prefix branch mengikuti tujuan utama pekerjaan, sedangkan type setiap commit mengikuti isi commit tersebut.

Pesan commit mengikuti [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

Gunakan type huruf kecil agar konsisten. Scope opsional, misalnya `web`, `datasets`, `methodology`, `api` atau `team`. Deskripsi menyebut perubahan konkret; hindari pesan seperti `update`, `fix bug` atau `done` tanpa konteks. Pisahkan perubahan yang tidak terkait ke commit berbeda.

Jangan menambahkan trailer `Co-authored-by`, label co-contributor, atau kredit asisten secara otomatis pada pesan commit, body maupun footer PR. Aturan ini berlaku juga untuk pesan yang dihasilkan alat bantu. Author Git tetap orang yang membuat commit; jangan mengganti identitas author atau menghapus kontribusi orang lain dari riwayat. Aturan disclosure kompetisi tetap ditangani sesuai keputusan project.

Breaking change diberi `!` sebelum `:` atau footer `BREAKING CHANGE: ...`. Jelaskan kontrak yang berubah dan cara migrasinya; jangan mengubah kontrak bersama tanpa koordinasi. Untuk `revert`, catat SHA commit yang dibatalkan pada body/footer.

### Contoh alur satu fitur

Contoh berikut mengasumsikan checkout bersih, remote `origin` dan branch utama `main` seperti setup repo. Periksa `git status` lebih dulu; jika ada perubahan belum disimpan, jangan pindah branch atau membuang file secara paksa.

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feat/dataset-catalog
# Kerjakan fitur dan jalankan pemeriksaan yang sesuai.
git add frontend/src/routes/datasets/
git diff --cached
git commit -m "feat(datasets): add dataset catalog"
git push -u origin feat/dataset-catalog
```

Folder frontend sudah tersedia; route datasets dibuat ketika paket katalog dikerjakan. Stage hanya file yang memang termasuk pekerjaan, periksa diff, lalu buka PR. Jangan menjalankan contoh sebagai script tanpa memeriksa hasil setiap langkah; jika pull gagal, selesaikan penyebabnya sebelum lanjut.

Judul PR memakai format Conventional Commits juga agar pesan squash commit konsisten. Pemilik memeriksa judul/pesan akhir sebelum merge. Format branch adalah aturan internal Equora; spesifikasi Conventional Commits sendiri mengatur pesan commit. Dokumen ini belum memasang commit hook, commitlint atau pemeriksaan otomatis format branch/commit.

## 3. Hormati batas file

Kontributor mengubah halaman dan komponen khusus paketnya di `frontend/` sesuai folder tugas. Fondasi aplikasi tersedia; halaman fitur dan komponen bersama belum diimplementasikan.

Layout/navigasi global, tokens/komponen bersama, manifest dependensi dan lockfile, konfigurasi build/CI, kontrak API, migrasi, engine dan deployment dikoordinasikan dengan pemilik sebelum diubah. Bila perlu komponen bersama, laporkan kegunaannya agar bisa dipakai konsisten oleh seluruh aplikasi.

Jangan membuat backend, app shell atau aplikasi kedua sebagai jalan pintas ketika fondasi belum tersedia. Jangan mengganti stack atau memasang dependency baru tanpa membahas kebutuhan dan alasannya.

## 4. Gunakan data dan konten yang bisa ditelusuri

- Ikuti PRD dan baseline desain. Rumus, bobot, definisi indikator dan klaim teknis mengikuti naskah yang ditinjau pemilik.
- Fixture sintetis harus berlabel demo. Jangan membuat angka hasil, testimoni, statistik pengguna, atau sumber seolah-olah resmi.
- Tampilkan metadata yang belum diketahui sebagai belum tersedia. Missing tidak boleh diam-diam diubah menjadi nol.
- Jangan memakai fixture sebagai pengganti tersembunyi ketika API nyata gagal; tampilkan error dan retry.
- Pertahankan kredit peta serta catat sumber/lisensi aset yang dipakai.

## 5. Periksa sebelum menyerahkan

- Jalankan aplikasi dan cek interaksi yang berubah, lebar 360px/desktop, keyboard/fokus serta state loading/empty/error yang relevan.
- Jalankan build/type/lint/test yang tersedia dan sesuai perubahan. Catat perintah serta hasilnya; jangan menulis lulus jika belum dijalankan.
- Untuk perubahan dokumentasi, jalankan `python scripts/check_docs.py` dan `git diff --check` dari root repository.
- Jika backend/fondasi belum siap, tulis batas pengujian dan kebutuhan yang masih menunggu. UI dengan fixture tidak berarti integrasi API selesai.
- Perbaiki bug pada halaman milikmu. Laporkan bug API/engine/peta dengan langkah reproduksi untuk ditangani pemilik.

## 6. Isi PR yang mudah direview

Cantumkan fitur/masalah, ringkasan perubahan, route/file utama, langkah uji dan hasil aktual, screenshot bila tampilan berubah, serta keterbatasan/dependensi yang tersisa. Tautkan folder tugas atau issue terkait. Pemilik menilai kebenaran konten teknis dan integrasi sebelum merge.

Jika tugas terhambat, laporkan apa yang sudah selesai, hambatan, dan input yang dibutuhkan. Jangan memperluas scope sendiri untuk menutup hambatan.

## 7. Jaga repository publik

Jangan commit `.env`, password, API key, token, kredensial akun uji, data pribadi atau raw dataset tanpa izin redistribusi. Contoh konfigurasi hanya memakai placeholder. Jangan sertakan rahasia dalam screenshot atau log PR. Jika rahasia terlanjur terunggah, segera beri tahu pemilik agar dicabut/dirotasi; menghapus file saja tidak cukup.

Selesai berarti checklist paket terpenuhi, bukti pengujian tersedia, dan pemilik menerima hasil review. Seluruh paket tetap berstatus belum dikerjakan sampai ada implementasi dan bukti.
