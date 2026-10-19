# Rencana peta Equora

Tanggal: 19 Oktober 2026. Status: pilihan teknologi dan kebutuhan peta diperbarui atas persetujuan pengguna. Belum diimplementasikan; boundary, file PMTiles, penyedia hosting, ukuran unduhan dan biaya belum diverifikasi.

## Pilihan dan alasan

Gunakan **MapLibre GL JS + basemap Protomaps melalui PMTiles**, dengan data dasar OpenStreetMap. MapLibre menampilkan peta dan layer analisis; Protomaps menyediakan basemap; PMTiles menjadi format distribusi tile. Pilihan ini memungkinkan basemap disajikan dari object storage tanpa tile server khusus. Hosting harus mendukung HTTP Range Requests serta CORS jika berbeda origin. Storage, request dan transfer tetap dapat menimbulkan biaya.

Peta menjadi cara tambahan menjelajahi indikator. Explorer tabel/grafik tetap bisa dipakai saat peta belum memenuhi gerbang data, koneksi gagal, atau WebGL tidak tersedia. Ini mempertahankan akses ke fungsi inti selama demo maupun penggunaan biasa.

## Layer dan sumber

| Layer | Peran | Syarat dan alasan |
|---|---|---|
| Basemap OSM/Protomaps | Orientasi jalan, tempat dan geografis | Pilih cakupan Indonesia serta zoom sesuai kebutuhan; catat versi/tanggal tileset. Basemap bukan sumber indikator pendidikan |
| Boundary analisis | Polygon wilayah untuk choropleth dan pemilihan wilayah | Sumber berlisensi sesuai penggunaan, kode wilayah dan periode cocok dengan data pendidikan; catat transformasi dan perubahan administrasi |
| Indikator pendidikan | Warna kebutuhan dan informasi detail | Gunakan release data tervalidasi; tampilkan indikator, unit, tahun, jenjang, coverage dan sumber |
| Hasil skenario | Alokasi paket atau perubahan antara skenario | Tampilkan unit, asumsi biaya dan status solver; jangan menyebutnya bukti dampak nyata |

Mulai dari GeoJSON boundary yang disederhanakan untuk cakupan MVP jika pengukuran menunjukkan ukuran dan render memadai. Pertahankan file sumber, catat metode/toleransi simplifikasi, dan periksa geometri/topologi hasil. Pindahkan boundary ke vector tiles jika pengukuran membuktikan kebutuhan. PMTiles basemap tidak mewajibkan seluruh layer dinamis dijadikan tile.

PostGIS ditambahkan bila ada kebutuhan query geometri seperti intersection atau radius. Join indikator ke polygon memakai kode wilayah yang tervalidasi tidak otomatis memerlukan PostGIS.

## Perilaku yang perlu dibuat

| Kebutuhan | Alasan | Kriteria penerimaan |
|---|---|---|
| Basemap netral, layer indikator menjadi fokus | Jalan/label tidak mengaburkan perbandingan kebutuhan | Label wilayah dan legenda terbaca; kategori indikator tidak mengandalkan warna saja, tersedia nilai dan tabel |
| Missing terpisah dari nol | Data kosong tidak boleh terlihat sebagai kondisi terbaik | Legenda memiliki kategori data tidak tersedia; detail menjelaskan missing/excluded dan nilai nol tetap ditampilkan sebagai nol |
| Legenda yang dapat dijelaskan | Warna harus punya arti yang dapat diperiksa | Tampilkan satuan, arah skor, metode klasifikasi dan batas kelas; rentang persen 0-100 hanya untuk indikator persen yang relevan |
| Skala konsisten saat compare | Skala otomatis terpisah dapat membesar-besarkan perubahan | Indikator/unit/metode yang setara memakai batas kelas sama pada kedua skenario; ketidaksetaraan ditandai, tidak dibandingkan diam-diam |
| Filter dan pemilihan tersinkron | Peta dan tabel harus menunjukkan data yang sama | Tahun/jenjang/indikator/release sama di peta, tabel dan detail; pilih polygon atau baris membuka wilayah yang sama |
| Detail sumber | Pengguna bisa menelusuri nilai | Detail memuat kode/nama wilayah, nilai/unit, tahun, jenjang, sumber, release dan status kualitas; data agregat tidak disajikan sebagai kondisi satu sekolah |
| Loading, error dan fallback | Aset peta dan API dapat gagal secara terpisah | Sediakan status loading, pesan kegagalan dan retry; kegagalan basemap atau WebGL tidak menutup tabel, filter, detail dan ekspor data |
| Akses keyboard dan mobile | Informasi tetap bisa dipakai tanpa interaksi pointer pada polygon | Semua pilihan wilayah tersedia lewat tabel/pencarian; fokus terlihat, tidak terjebak di peta, detail bisa ditutup dengan keyboard, atribusi tetap dapat diakses pada lebar 360px |

Titik sekolah OSM hanya boleh menjadi layer tambahan berlabel sumber dan cakupan yang diketahui. Jangan menghitung kelengkapan fasilitas pendidikan dari keberadaan atau ketiadaan titik OSM tanpa validasi terpisah. Tidak ada fitur routing, geocoding, atau pencarian alamat yang otomatis tercakup dalam pilihan basemap ini.

## Gerbang data geografis

1. Catat sumber, lisensi, tanggal akses, versi/periode, level wilayah, sistem koordinat, filename dan SHA256 boundary. Verifikasi transformasi ke koordinat yang didukung format layer.
2. Validasi geometri, keunikan kode wilayah, multipart yang sah, cakupan dan kesesuaian tahun administratif. Pemetaan kode lama/baru harus eksplisit dan direview; tidak ada fuzzy join otomatis.
3. Laporkan join dua arah: observasi tanpa polygon serta polygon tanpa observasi. Semua observasi yang ditampilkan di peta harus terpetakan secara tidak ambigu; observasi yang tidak cocok tetap dilaporkan di tabel/quality report. Polygon tanpa nilai mendapat kategori missing.
4. Bandingkan boundary sumber dengan hasil simplifikasi, termasuk pulau kecil, batas wilayah dan kasus multipart. Catat perbaikan; jangan menampilkan geometri yang diketahui salah.
5. Jika gerbang gagal, gunakan tabel/grafik dan jelaskan bahwa layer analisis peta belum tersedia.

## Atribusi dan aset

Contoh atribusi ketika aset yang dipilih memang memakai sumber tersebut:

> Data peta © [kontributor OpenStreetMap](https://www.openstreetmap.org/copyright). Basemap oleh [Protomaps](https://protomaps.com/), ditampilkan dengan [MapLibre](https://maplibre.org/).

Tampilkan kredit pada peta melalui kontrol atribusi. Sesuaikan kredit dengan metadata dan ketentuan tileset/style aktual, termasuk sumber tambahan. Cantumkan sumber boundary dan indikator secara terpisah pada panel sumber. Periksa lisensi style, sprite, dan font sebelum distribusi.

Untuk screenshot/PDF yang memuat peta, sertakan atribusi yang dapat dibaca dan URL copyright OSM ketika tautan tidak dapat diklik. Ekspor ringkasan tidak wajib memasukkan peta; jangan menghapus kredit ketika peta disertakan.

## Hosting, pengukuran dan demo

- Simpan manifest versi/hash basemap, boundary, style, sprite dan font beserta URL serta lisensinya. Pin versi aset agar perubahan basemap dapat dilacak terpisah dari release indikator.
- Tentukan cakupan dan zoom berdasarkan penggunaan MVP; hindari mengambil seluruh arsip dunia tanpa kebutuhan. Verifikasi ketentuan penyedia sebelum mengunduh/menyimpan aset.
- Uji respons range parsial, CORS, cache dan tipe konten di hosting sebenarnya. Jangan memakai endpoint contoh sebagai dependensi produksi tanpa memeriksa ketentuannya.
- Ukur transfer awal, waktu peta siap dipakai, respons filter dan penggunaan memori pada desktop/mobile dengan perangkat, jaringan dan cold/warm cache tercatat. Target ditetapkan setelah aset dan hosting dipilih, sebelum pengukuran; belum ada klaim performa.
- Siapkan demo lokal dengan subset aset yang boleh disimpan, termasuk style/sprite/font jika diperlukan. Sebut siap offline hanya setelah pengujian tanpa jaringan lulus; tabel tetap menjadi fallback.

## Referensi primer

Ditinjau pada 19 Oktober 2026; menjelaskan kemampuan dan ketentuan sumber, bukan hasil pengujian Equora.

- [Integrasi PMTiles dengan MapLibre](https://docs.protomaps.com/pmtiles/maplibre).
- [Hosting PMTiles, HTTP Range Requests dan CORS](https://docs.protomaps.com/pmtiles/cloud-storage).
- [Protomaps dan basemap OpenStreetMap](https://docs.protomaps.com/).
- [Copyright dan atribusi OpenStreetMap](https://www.openstreetmap.org/copyright).
