# Kontribusi

Gunakan issue untuk pekerjaan dengan acceptance criteria dan bukti selesai. Periksa [PRD](docs/PRD_Equora.md), [desain](docs/DESIGN_Equora.md), dan [keputusan terbuka](docs/decisions.md) sebelum mengubah scope.

Untuk kerja dua orang, ikuti [aturan kontributor](docs/pembagian-kerja/ATURAN-KONTRIBUTOR.md) dan [folder tugas per fitur](docs/pembagian-kerja/README.md). Kontributor bekerja di branch sendiri dan mengajukan PR; pemilik mereview serta melakukan merge. Jangan push langsung ke branch utama. Aturan ini belum berarti branch protection GitHub sudah diaktifkan.

Setiap fitur, perbaikan, dokumentasi atau pekerjaan coding baru wajib dimulai pada branch terpisah sebelum mengedit file. Aturan berlaku untuk pemilik dan kontributor. Satu pekerjaan boleh berisi beberapa commit pada branch yang sama; jangan memakai ulang branch yang sudah digabung.

Branch memakai format `<type>/<deskripsi-kebab-case>` dengan prefix `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`, `perf/`, `build/`, `ci/`, `style/` atau `revert/`. Contoh: `feat/dataset-catalog`, `fix/catalog-empty-state`, `docs/contribution-workflow`. Jangan gunakan prefix nama asisten atau produk.

Pesan commit wajib mengikuti [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/): `<type>[optional scope][!]: <description>`. Contoh: `feat(datasets): add dataset catalog`, `fix(datasets): show empty search state`, `docs(team): clarify contribution workflow`. Scope opsional; deskripsi wajib jelas. Tandai breaking change dengan `!` sebelum titik dua atau footer `BREAKING CHANGE: ...`, lalu jelaskan perubahan dan migrasinya.

Conventional Commits mengatur pesan commit; format nama branch di atas adalah kesepakatan repository yang menggunakan jenis perubahan yang sama. Panduan jenis, contoh alur Git dan aturan PR ada di [aturan kontributor](docs/pembagian-kerja/ATURAN-KONTRIBUTOR.md).

Jangan menambahkan trailer `Co-authored-by`, label co-contributor, atau kredit asisten secara otomatis pada commit maupun PR. Author Git tetap mengikuti pembuat commit; jangan mengubah atau menghapus identitas kontributor dari riwayat. Ketentuan disclosure kompetisi tetap mengikuti keputusan yang dicatat di docs.

PR menjelaskan masalah, perubahan, dan validasi yang benar-benar dijalankan. Jangan menandai checklist dengan hasil yang belum diuji. Jalankan `python scripts/check_docs.py` dan `git diff --check` untuk perubahan docs.

Jangan commit token, `.env`, data pribadi, raw dataset tanpa izin redistribusi, atau file besar. Gunakan data sintetis berlabel untuk fixture. Perubahan rumus/constraint harus menyertakan pengujian dengan hasil yang dapat dihitung ulang.
