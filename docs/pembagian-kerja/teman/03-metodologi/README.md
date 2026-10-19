# 03 - Metodologi dan istilah

PIC: teman. Tujuan: pengguna bisa memahami asal skor, asumsi simulasi dan batas interpretasi tanpa membaca kode.

Route: `/methodology`. Lokasi: `frontend/src/routes/methodology/+page.svelte` dan komponen khususnya. Dependensi: naskah metode serta contoh hitung yang telah diperiksa pemilik.

## Yang dikerjakan

1. Susun halaman dengan daftar isi/anchor: sumber data, standardisasi indikator, bobot/kontribusi, missing, alokasi anggaran, status hasil dan batasan.
2. Tampilkan formula beserta arti variabel dan satu contoh hitung yang diberikan pemilik. Jika contoh sintetis, tulis label tersebut.
3. Buat glosarium untuk istilah yang digunakan aplikasi, seperti coverage, release data, constraint, feasible dan optimal; minta pemilik meninjau istilah teknis.
4. Cantumkan versi metode dan sumber. Link dari penjelasan ke katalog/sumber yang benar-benar tersedia.
5. Pastikan formula dan tabel terbaca di mobile, heading terstruktur dan tautan anchor dapat dioperasikan dengan keyboard.

## Batas pekerjaan

Pemilik menetapkan rumus, bobot, tie-breaking, missing policy, objective dan constraint. Teman tidak membuat metode pengganti, kalkulator interaktif, AI explanation atau contoh dampak pendidikan sendiri. Jika naskah belum final, laporkan bagian yang menunggu input; jangan mengisi dengan asumsi yang tampak resmi.

## Bukti selesai

- [ ] Formula, contoh, istilah dan versi cocok dengan naskah pemilik serta implementasi yang tersedia.
- [ ] Dijelaskan bahwa optimal mengikuti model, bukan bukti dampak atau keadilan universal.
- [ ] Missing tidak disebut nol; feasible tidak disamakan dengan optimal; timeout tanpa solusi tidak disebut infeasible.
- [ ] Sumber bisa dibuka; contoh sintetis dan asumsi biaya diberi label.
- [ ] Mobile/keyboard dan build/type yang tersedia diperiksa; pemilik menyetujui kebenaran konten teknis dalam review.

Acuan: [PRD](../../../PRD_Equora.md), [stack dan validasi](../../../technical-stack.md), [aturan serah terima](../../README.md).
