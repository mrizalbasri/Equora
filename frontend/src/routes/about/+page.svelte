<svelte:head>
  <title>Tentang Equora</title>
  <meta
    name="description"
    content="Tujuan, pendekatan, dan batas penggunaan Equora sebagai platform eksplorasi data pendidikan."
  />
</svelte:head>

<main>
  <nav class="nav" aria-label="Navigasi utama">
    <a class="wordmark" href="/" aria-label="Equora beranda">equora<span>.</span></a>
    <a class="back-link" href="/">← Kembali ke beranda</a>
  </nav>

  <section class="intro" aria-labelledby="about-title">
    <p class="eyebrow">Tentang produk</p>
    <h1 id="about-title">Membuat data pendidikan lebih mudah dipahami dan dipertanggungjawabkan.</h1>
    <p class="lead">
      Equora adalah platform eksplorasi open data untuk memahami akses fasilitas pendidikan,
      membandingkan kebutuhan wilayah, dan menguji skenario alokasi sumber daya yang dapat dijelaskan.
    </p>
  </section>

  <section class="content-grid" aria-label="Tujuan dan pendekatan Equora">
    <article class="content-card">
      <p class="eyebrow">Masalah</p>
      <h2>Perbandingan yang jujur membutuhkan konteks.</h2>
      <p>
        Dataset dapat berbeda dalam periode, cakupan wilayah, satuan, dan definisi indikator. Tanpa
        konteks itu, angka yang terlihat rapi dapat menghasilkan kesimpulan yang menyesatkan.
      </p>
    </article>
    <article class="content-card">
      <p class="eyebrow">Tujuan</p>
      <h2>Membuka jalan dari data ke pertanyaan yang lebih baik.</h2>
      <p>
        Equora menampilkan sumber, tahun, unit, asumsi, dan keterbatasan di dekat hasil analisis agar
        pengguna dapat menilai informasi sebelum menggunakannya untuk diskusi atau simulasi.
      </p>
    </article>
  </section>

  <section id="methodology" class="method-section" aria-labelledby="method-title">
    <div>
      <p class="eyebrow">Prinsip kerja</p>
      <h2 id="method-title">Transparansi adalah fitur, bukan catatan kaki.</h2>
    </div>
    <ol class="principles">
      <li>
        <span>01</span>
        <div><strong>Evidence first</strong><p>Sumber, tahun, definisi, dan versi data dapat ditelusuri.</p></div>
      </li>
      <li>
        <span>02</span>
        <div><strong>Explain, don't mystify</strong><p>Bobot, asumsi, trade-off, dan metode dijelaskan dengan bahasa yang dapat diperiksa.</p></div>
      </li>
      <li>
        <span>03</span>
        <div><strong>Honest states</strong><p>Missing, perbedaan cakupan, dan kegagalan proses tidak disamarkan menjadi nol atau hasil sukses.</p></div>
      </li>
    </ol>
  </section>

  <section class="limit-section" aria-labelledby="limit-title">
    <p class="eyebrow">Batas penggunaan</p>
    <h2 id="limit-title">Equora bukan sistem keputusan resmi.</h2>
    <p>
      Simulasi Equora bersifat eksploratif. Hasilnya bukan rekomendasi anggaran pemerintah, bukan
      prediksi dampak pendidikan, dan tidak menggantikan verifikasi lapangan, pertimbangan kebijakan,
      atau proses penganggaran resmi. Biaya dan kapasitas yang belum memiliki rujukan resmi harus
      ditandai sebagai asumsi demo.
    </p>
  </section>

  <section class="status-section" aria-labelledby="status-title">
    <div>
      <p class="eyebrow">Status saat ini</p>
      <h2 id="status-title">Fondasi tersedia; fitur produk dibangun bertahap.</h2>
    </div>
    <p>
      Explorer, katalog dataset, studio skenario, dan metodologi interaktif belum tersedia di route
      publik. Tautan yang belum siap ditampilkan sebagai status, bukan sebagai halaman kosong atau
      pengalaman palsu.
    </p>
  </section>

  <footer class="footer">
    <span class="wordmark">equora<span>.</span></span>
    <a href="/">Kembali ke beranda</a>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #e7e8ea;
    color: #24262b;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(a:focus-visible) {
    outline: 3px solid #236aab;
    outline-offset: 4px;
  }

  main {
    margin: 0 auto;
    max-width: 1100px;
    padding: 0 32px;
  }

  .nav,
  .footer {
    align-items: center;
    display: flex;
    justify-content: space-between;
    min-height: 84px;
  }

  .wordmark {
    color: #24262b;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.06em;
    text-decoration: none;
  }

  .wordmark span {
    color: #c94025;
  }

  .back-link,
  .footer a {
    color: #555c65;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
  }

  .intro {
    max-width: 850px;
    padding: 100px 0 110px;
  }

  .eyebrow {
    color: #c94025;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin: 0 0 16px;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin-top: 0;
  }

  h1 {
    font-size: clamp(2.75rem, 6vw, 5rem);
    letter-spacing: -0.065em;
    line-height: 1.02;
    margin-bottom: 28px;
  }

  h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    letter-spacing: -0.05em;
    line-height: 1.08;
    margin-bottom: 18px;
  }

  .lead {
    color: #555c65;
    font-size: 19px;
    line-height: 1.6;
    max-width: 700px;
  }

  .content-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, 1fr);
  }

  .content-card {
    background: #f9f9fa;
    border: 1px solid #cfd2d6;
    border-radius: 14px;
    padding: 32px;
  }

  .content-card h2 {
    font-size: 28px;
  }

  .content-card p:last-child,
  .limit-section > p:last-child,
  .status-section > p {
    color: #555c65;
    line-height: 1.65;
  }

  .method-section,
  .status-section {
    border-top: 1px solid #cfd2d6;
    display: grid;
    gap: 72px;
    grid-template-columns: 1fr 1fr;
    margin-top: 96px;
    padding: 80px 0;
  }

  .principles {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .principles li {
    border-bottom: 1px solid #cfd2d6;
    display: grid;
    gap: 20px;
    grid-template-columns: 32px 1fr;
    padding: 0 0 22px;
  }

  .principles li + li {
    padding-top: 22px;
  }

  .principles > li > span {
    color: #c94025;
    font-size: 13px;
    font-weight: 800;
  }

  .principles strong {
    display: block;
    font-size: 17px;
    margin-bottom: 6px;
  }

  .principles p {
    color: #555c65;
    line-height: 1.55;
    margin-bottom: 0;
  }

  .limit-section {
    background: #f7e4df;
    border: 1px solid #e5b5a9;
    border-radius: 14px;
    padding: 32px;
  }

  .limit-section h2 {
    font-size: 30px;
  }

  .limit-section > p:last-child {
    margin-bottom: 0;
    max-width: 760px;
  }

  .status-section {
    margin-top: 32px;
  }

  .footer {
    border-top: 1px solid #cfd2d6;
    margin-top: 16px;
    min-height: 100px;
  }

  @media (max-width: 700px) {
    main {
      padding: 0 20px;
    }

    .intro {
      padding: 64px 0 72px;
    }

    .content-grid,
    .method-section,
    .status-section {
      grid-template-columns: 1fr;
    }

    .method-section,
    .status-section {
      gap: 36px;
      margin-top: 64px;
      padding: 56px 0;
    }

    .footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
      padding: 28px 0;
    }
  }
</style>
