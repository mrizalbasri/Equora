# Kontribusi

Gunakan issue untuk pekerjaan dengan acceptance criteria dan bukti selesai. Periksa [PRD](docs/PRD_Equora.md), [desain](docs/DESIGN_Equora.md), dan [keputusan terbuka](docs/decisions.md) sebelum mengubah scope.

Branch memakai prefix semantik: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`. Contoh: `docs/data-audit`. Commit awal dokumentasi: `docs: prepare Equora competition documentation`.

PR menjelaskan masalah, perubahan, dan validasi yang benar-benar dijalankan. Jangan menandai checklist dengan hasil yang belum diuji. Jalankan `python scripts/check_docs.py` dan `git diff --check` untuk perubahan docs.

Jangan commit token, `.env`, data pribadi, raw dataset tanpa izin redistribusi, atau file besar. Gunakan data sintetis berlabel untuk fixture. Perubahan rumus/constraint harus menyertakan pengujian dengan hasil yang dapat dihitung ulang.
