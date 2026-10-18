# Setup GitHub

Repository publik [mrizalbasri/Equora](https://github.com/mrizalbasri/Equora) dibuat pada 18 Oktober 2026. Branch `main` melacak `origin/main`; commit awal dokumentasi `4432cd0` telah diunggah. Autentikasi CLI yang sebelumnya terhambat telah berhasil diperbaiki pengguna.

## Isi setup

- README dengan status aktual dan tautan docs.
- `.gitignore` untuk environment, kredensial, output build, cache, raw data dan file sementara.
- `.gitattributes` untuk normalisasi teks LF.
- Template bug, task dan pull request.
- GitHub Actions memeriksa link lokal Markdown dan whitespace pada perubahan.

## Jika autentikasi CLI perlu diperbaiki

Jalankan sendiri login interaktif; jangan menempel token/password ke chat:

```powershell
gh auth login -h github.com
gh auth status
```

Jika repo remote belum ada, dari root project:

```powershell
gh repo create mrizalbasri/Equora --public --source=. --remote=origin --push
```

Jika remote sudah ada, periksa isinya terlebih dahulu. Jangan force-push atau menginisialisasi ulang remote. Hubungkan/push hanya setelah memastikan riwayat kompatibel:

```powershell
git remote -v
git push -u origin main
```

## Pengaturan setelah publikasi

Verifikasi workflow `Documentation checks` berjalan. Rekomendasi: pull request untuk perubahan, pemeriksaan CI wajib, larangan force-push pada main. Proteksi branch, anggota, label, GitHub Project dan deployment belum dikonfigurasi otomatis. Pilih lisensi bersama pemilik dan periksa izin dataset sebelum redistribusi.

Repository publik wajib untuk First Draft. Tambahkan URL deployment dan instruksi install/run sebenarnya setelah kode tersedia.
