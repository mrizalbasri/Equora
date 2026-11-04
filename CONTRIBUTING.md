# Kontribusi

Gunakan issue untuk pekerjaan dengan acceptance criteria dan bukti selesai. Diskusikan dan sepakati kebutuhan sebelum mengubah scope.

Setiap kontributor bekerja di branch sendiri dan mengajukan PR ke branch utama untuk direview sebelum merge. Jangan push langsung ke branch utama.

Setiap fitur, perbaikan, dokumentasi atau pekerjaan coding baru wajib dimulai pada branch terpisah sebelum mengedit file. Aturan berlaku untuk pemilik dan kontributor. Satu pekerjaan boleh berisi beberapa commit pada branch yang sama; jangan memakai ulang branch yang sudah digabung.

Branch memakai format `<type>/<deskripsi-kebab-case>` dengan prefix `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`, `perf/`, `build/`, `ci/`, `style/` atau `revert/`. Contoh: `feat/dataset-catalog`, `fix/catalog-empty-state`, `docs/contribution-workflow`. Jangan gunakan prefix nama asisten atau produk.

Pesan commit wajib mengikuti [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/): `<type>[optional scope][!]: <description>`. Contoh: `feat(datasets): add dataset catalog`, `fix(datasets): show empty search state`, `docs(team): clarify contribution workflow`. Scope opsional; deskripsi wajib jelas. Tandai breaking change dengan `!` sebelum titik dua atau footer `BREAKING CHANGE: ...`, lalu jelaskan perubahan dan migrasinya.

Conventional Commits mengatur pesan commit; format nama branch di atas adalah kesepakatan repository yang menggunakan jenis perubahan yang sama.

Jangan menambahkan trailer `Co-authored-by`, label co-contributor, atau kredit asisten secara otomatis pada commit maupun PR. Author Git tetap mengikuti pembuat commit; jangan mengubah atau menghapus identitas kontributor dari riwayat.

PR menjelaskan masalah, perubahan, dan validasi yang benar-benar dijalankan. Jangan menandai checklist dengan hasil yang belum diuji. Jalankan `python scripts/check_docs.py` dan `git diff --check` untuk perubahan docs.

Jangan commit token, `.env`, data pribadi, raw dataset tanpa izin redistribusi, atau file besar. Gunakan data sintetis berlabel untuk fixture. Perubahan rumus/constraint harus menyertakan pengujian dengan hasil yang dapat dihitung ulang.
