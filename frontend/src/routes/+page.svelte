<svelte:head>
  <title>Equora — Intelligence for Equitable Decisions</title>
  <meta
    name="description"
    content="Equora membantu memahami akses fasilitas pendidikan dari data publik dan menguji skenario alokasi sumber daya yang transparan."
  />
</svelte:head>

<script lang="ts">
  const steps = [
    {
      number: '01',
      title: 'Telusuri data',
      description: 'Mulai dari sumber publik, periode, wilayah, dan definisi indikator yang dapat ditelusuri.'
    },
    {
      number: '02',
      title: 'Susun prioritas',
      description: 'Bandingkan kebutuhan wilayah dengan bobot dan asumsi yang terlihat, bukan angka yang tersembunyi.'
    },
    {
      number: '03',
      title: 'Uji skenario',
      description: 'Jelajahi trade-off alokasi secara transparan sebelum mengambil keputusan yang lebih terinformasi.'
    }
  ];

  const unavailableRoutes = [
    { label: 'Jelajahi data', route: '/explore' },
    { label: 'Bangun skenario', route: '/studio' }
  ];
</script>

<main>
  <nav class="nav" aria-label="Navigasi utama">
    <a class="wordmark" href="/" aria-label="Equora beranda">equora<span>.</span></a>
    <div class="nav-links">
      <a href="/about">Tentang</a>
      <a href="/about#methodology">Metodologi</a>
      <span class="nav-status">Explorer dan Studio segera tersedia</span>
    </div>
    <a class="button button-small" href="/about">Pelajari proyek</a>
  </nav>

  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">Transparansi data dan keputusan</p>
      <h1 id="hero-title">Dari data publik menuju keputusan yang lebih terukur.</h1>
      <p class="lead">
        Equora membantu publik dan analis memahami akses fasilitas pendidikan, membandingkan kebutuhan
        wilayah, dan menguji skenario alokasi yang dapat dijelaskan.
      </p>
      <div class="actions">
        {#each unavailableRoutes as item}
          <span class="button button-disabled" aria-label={`${item.label}; belum tersedia`}>
            {item.label}
            <span class="status">Segera</span>
          </span>
        {/each}
        <a class="text-link" href="/about">Kenali batasan simulasi <span aria-hidden="true">→</span></a>
      </div>
    </div>
    <div class="preview" aria-label="Pratinjau alur Equora">
      <div class="preview-header">
        <span class="preview-label">Equity overview</span>
        <span class="preview-period">Demo interface</span>
      </div>
      <div class="preview-title">Data → Prioritas → Skenario</div>
      <div class="preview-bars" aria-hidden="true">
        <span style="height: 42%"></span>
        <span style="height: 66%"></span>
        <span style="height: 54%"></span>
        <span style="height: 82%"></span>
        <span style="height: 61%"></span>
        <span style="height: 74%"></span>
      </div>
      <div class="preview-footer">
        <span><i class="dot dot-blue"></i>indikator</span>
        <span><i class="dot dot-coral"></i>prioritas</span>
        <span class="preview-note">Contoh tampilan, bukan hasil analisis</span>
      </div>
    </div>
  </section>

  <section class="section workflow" aria-labelledby="workflow-title">
    <div class="section-heading">
      <p class="eyebrow">Cara kerja</p>
      <h2 id="workflow-title">Buat keputusan yang bisa dijelaskan.</h2>
      <p>Setiap langkah menjaga sumber, asumsi, dan keterbatasan tetap terlihat.</p>
    </div>
    <div class="step-grid">
      {#each steps as step}
        <article class="step-card">
          <span class="step-number">{step.number}</span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="section split-section" aria-labelledby="why-title">
    <div>
      <p class="eyebrow">Mengapa Equora?</p>
      <h2 id="why-title">Kejelasan lebih penting daripada kepastian palsu.</h2>
    </div>
    <div class="split-copy">
      <p>
        Data pendidikan sering datang dengan cakupan, tahun, dan definisi yang berbeda. Equora
        dirancang untuk membuat perbedaan itu terbaca sebelum dipakai untuk membandingkan wilayah.
      </p>
      <a class="text-link" href="/about">Baca prinsip dan batasan <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <section class="notice" aria-labelledby="notice-title">
    <div>
      <p class="eyebrow">Catatan penting</p>
      <h2 id="notice-title">Simulasi, bukan keputusan anggaran resmi.</h2>
    </div>
    <p>
      Hasil Equora adalah eksplorasi berbasis data, parameter, dan asumsi yang dicatat. Hasilnya tidak
      memprediksi dampak nyata dan tidak menggantikan penilaian resmi, verifikasi lapangan, atau proses
      penganggaran pemerintah.
    </p>
  </section>

  <footer class="footer">
    <span class="wordmark">equora<span>.</span></span>
    <span>Public Resource Decision Intelligence</span>
    <a href="/about">Tentang dan sumber</a>
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

  :global(a:focus-visible),
  :global([tabindex]:focus-visible) {
    outline: 3px solid #236aab;
    outline-offset: 4px;
  }

  main {
    margin: 0 auto;
    max-width: 1280px;
    padding: 0 32px;
  }

  .nav,
  .footer {
    align-items: center;
    display: flex;
    gap: 28px;
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

  .nav-links {
    align-items: center;
    display: flex;
    gap: 24px;
    margin-left: auto;
  }

  .nav-links a,
  .footer a {
    color: #555c65;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }

  .nav-status {
    color: #686e76;
    font-size: 12px;
  }

  .button {
    align-items: center;
    border-radius: 10px;
    display: inline-flex;
    font-size: 14px;
    font-weight: 700;
    gap: 10px;
    justify-content: center;
    min-height: 44px;
    padding: 0 18px;
    text-decoration: none;
  }

  .button-small {
    background: #c94025;
    color: white;
  }

  .button-disabled {
    background: #f0f1f2;
    border: 1px solid #cfd2d6;
    color: #686e76;
    cursor: not-allowed;
  }

  .status {
    background: #e3e4e6;
    border-radius: 999px;
    font-size: 11px;
    padding: 3px 7px;
  }

  .hero {
    align-items: center;
    display: grid;
    gap: 64px;
    grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
    min-height: 570px;
    padding: 72px 0 96px;
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
  h3,
  p {
    margin-top: 0;
  }

  h1 {
    font-size: clamp(2.75rem, 6vw, 5rem);
    letter-spacing: -0.065em;
    line-height: 1.02;
    margin-bottom: 24px;
    max-width: 760px;
  }

  h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    letter-spacing: -0.05em;
    line-height: 1.08;
    margin-bottom: 16px;
  }

  .lead {
    color: #555c65;
    font-size: 18px;
    line-height: 1.6;
    max-width: 620px;
  }

  .actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 32px;
  }

  .text-link {
    color: #24262b;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
  }

  .text-link span {
    color: #c94025;
    margin-left: 5px;
  }

  .preview {
    background: #f9f9fa;
    border: 1px solid #cfd2d6;
    border-radius: 22px;
    box-shadow: 0 16px 36px rgb(30 36 43 / 7%);
    min-height: 340px;
    padding: 28px;
  }

  .preview-header,
  .preview-footer {
    align-items: center;
    color: #686e76;
    display: flex;
    font-size: 12px;
    justify-content: space-between;
  }

  .preview-label {
    color: #24262b;
    font-weight: 800;
  }

  .preview-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin: 64px 0 32px;
  }

  .preview-bars {
    align-items: end;
    border-bottom: 1px solid #cfd2d6;
    display: flex;
    gap: 14px;
    height: 130px;
    padding: 0 8px;
  }

  .preview-bars span {
    background: #3979ab;
    border-radius: 7px 7px 0 0;
    flex: 1;
    min-height: 20px;
  }

  .preview-bars span:nth-child(2n) {
    background: #c94025;
  }

  .preview-footer {
    gap: 14px;
    justify-content: flex-start;
    margin-top: 18px;
  }

  .preview-footer > span {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }

  .preview-note {
    margin-left: auto;
    text-align: right;
  }

  .dot {
    border-radius: 50%;
    height: 8px;
    width: 8px;
  }

  .dot-blue {
    background: #3979ab;
  }

  .dot-coral {
    background: #c94025;
  }

  .section {
    padding: 80px 0;
  }

  .section-heading {
    max-width: 600px;
  }

  .section-heading > p:last-child,
  .split-copy p {
    color: #555c65;
    line-height: 1.6;
  }

  .step-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 40px;
  }

  .step-card {
    background: #f9f9fa;
    border: 1px solid #cfd2d6;
    border-radius: 14px;
    min-height: 210px;
    padding: 24px;
  }

  .step-number {
    color: #c94025;
    font-size: 13px;
    font-weight: 800;
  }

  .step-card h3 {
    font-size: 22px;
    letter-spacing: -0.04em;
    margin: 52px 0 10px;
  }

  .step-card p {
    color: #555c65;
    line-height: 1.55;
    margin-bottom: 0;
  }

  .split-section {
    border-top: 1px solid #cfd2d6;
    display: grid;
    gap: 80px;
    grid-template-columns: 1fr 1fr;
  }

  .split-copy {
    padding-top: 46px;
  }

  .notice {
    align-items: start;
    background: #f7e4df;
    border: 1px solid #e5b5a9;
    border-radius: 14px;
    display: grid;
    gap: 40px;
    grid-template-columns: 1fr 1fr;
    margin: 32px 0 80px;
    padding: 32px;
  }

  .notice h2 {
    font-size: 28px;
    margin-bottom: 0;
  }

  .notice > p {
    color: #555c65;
    line-height: 1.6;
    margin-bottom: 0;
  }

  .footer {
    border-top: 1px solid #cfd2d6;
    color: #686e76;
    font-size: 12px;
    min-height: 96px;
  }

  @media (max-width: 800px) {
    main {
      padding: 0 20px;
    }

    .nav {
      gap: 16px;
    }

    .nav-links {
      display: none;
    }

    .hero {
      gap: 40px;
      grid-template-columns: 1fr;
      padding: 56px 0 72px;
    }

    .preview {
      min-height: 300px;
    }

    .step-grid,
    .split-section,
    .notice {
      grid-template-columns: 1fr;
    }

    .split-copy {
      padding-top: 0;
    }

    .notice {
      gap: 12px;
    }

    .footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
      padding: 28px 0;
    }
  }

  @media (max-width: 480px) {
    .nav {
      min-height: 72px;
    }

    .nav .button {
      font-size: 12px;
      padding: 0 12px;
    }

    h1 {
      font-size: 2.75rem;
    }

    .actions {
      align-items: stretch;
      flex-direction: column;
    }

    .actions > * {
      width: 100%;
    }

    .preview-footer {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .preview-note {
      flex-basis: 100%;
      margin-left: 0;
      text-align: left;
    }
  }
</style>
