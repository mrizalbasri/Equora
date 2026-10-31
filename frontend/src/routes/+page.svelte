<script lang="ts">
  import PublicShell from '#lib/components/PublicShell.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import { landingScroll } from '$lib/motion';

  const sources = [
    { icon: 'sanitation', name: 'Sanitasi dasar', unit: 'Persentase sekolah', slug: 'persentase-sekolah-dengan-akses-terhadap-fasilitas-sanitasi-dasar-2025-indonesia' },
    { icon: 'water', name: 'Air minum layak', unit: 'Persentase sekolah', slug: 'persentase-sekolah-dengan-akses-terhadap-air-minum-layak-2025' },
    { icon: 'internet', name: 'Internet pengajaran', unit: 'Jumlah sekolah', slug: 'jumlah-sekolah-dengan-akses-internet-untuk-pengajaran-2025-2' },
    { icon: 'computer', name: 'Komputer pengajaran', unit: 'Jumlah sekolah', slug: 'jumlah-sekolah-dengan-akses-komputer-untuk-pengajaran-2025-2' }
  ] as const;
</script>

<svelte:head>
  <title>Equora | Data pendidikan untuk keputusan yang lebih terarah</title>
  <meta name="description" content="Telusuri fasilitas pendidikan antarprovinsi, atur prioritas kebutuhan, dan uji skenario alokasi anggaran dengan data serta asumsi yang bisa ditelusuri." />
</svelte:head>

<PublicShell calm>
  <section class="landing-hero eq-container" aria-labelledby="hero-title" use:landingScroll>
    <div class="landing-progress" aria-hidden="true"></div>
    <div class="hero-copy">
      <div class="hero-pill-badge" data-motion="fade">
        <span class="pill-dot" aria-hidden="true"></span>
        <span class="pill-text">Web in Action 2026 · Platform Intelijensi Fasilitas Pendidikan</span>
      </div>
      <h1 id="hero-title" data-motion="focus"><span>Beda wilayah.</span><br />Beda kebutuhan.</h1>
      <p data-motion="fade" data-motion-delay="70">Bagaimana fasilitas sekolah di provinsi Anda?<br class="desktop-break" /> Lihat kondisi sanitasi, air, internet, dan komputer. Bandingkan angkanya dan periksa sumbernya.</p>
      <div class="hero-actions" data-motion="focus" data-motion-delay="140">
        <a class="landing-button primary" href="/daerah">Pendidikan di Daerah Saya</a>
        <a class="text-link" href="/explore">Telusuri data pendidikan</a>
      </div>
      <div class="hero-metrics-ribbon" data-motion="fade" data-motion-delay="180" aria-label="Statistik platform">
        <div class="metric-pill">
          <span class="metric-value">38</span>
          <span class="metric-label">Provinsi Terpetakan</span>
        </div>
        <div class="metric-divider" aria-hidden="true"></div>
        <div class="metric-pill">
          <span class="metric-value">10</span>
          <span class="metric-label">Indikator Resmi</span>
        </div>
        <div class="metric-divider" aria-hidden="true"></div>
        <div class="metric-pill">
          <span class="metric-value">6</span>
          <span class="metric-label">Jenjang Sekolah</span>
        </div>
        <div class="metric-divider" aria-hidden="true"></div>
        <div class="metric-pill">
          <span class="metric-value">CP-SAT</span>
          <span class="metric-label">Solver Optimasi</span>
        </div>
      </div>
    </div>

    <div id="pratinjau" class="product-preview" data-motion="unfold" data-motion-delay="210">
      <figure>
        <img class="school-illustration" src="/images/landing/school-editorial.webp"
          alt="Ilustrasi sekolah dengan ruang kelas, fasilitas air dan cuci tangan, serta laboratorium komputer."
          width="1738" height="905" fetchpriority="high" />
      </figure>
    </div>
  </section>

  <section id="alur" class="eq-container workflow" aria-labelledby="workflow-title">
    <div class="section-intro" data-motion="left">
      <h2 id="workflow-title">Dari data.<br /><span>Ke pilihan yang terukur.</span></h2>
      <p>Mulai dari daerah Anda. Pahami datanya terlebih dahulu, lalu coba simulasi jika ingin melihat pilihan alokasi.</p>
    </div>
    <ol class="workflow-list">
      <li data-motion="right">
        <span class="step-number">01</span>
        <div><h3>Kenali kondisi daerah Anda</h3><p>Pilih provinsi dan jenjang sekolah. Baca arti angka fasilitas serta sumbernya, lalu tambahkan pembanding jika perlu.</p><a href="/daerah">Lihat kondisi daerah</a></div>
      </li>
      <li data-motion="right" data-motion-delay="90">
        <span class="step-number">02</span>
        <div><h3>Tentukan prioritasnya</h3><p>Atur bobot kebutuhan, biaya per paket, kapasitas, dan anggaran sesuai asumsi yang ingin diuji.</p><a href="/studio">Atur simulasi</a></div>
      </li>
      <li data-motion="right" data-motion-delay="180">
        <span class="step-number">03</span>
        <div><h3>Sandingkan hasilnya</h3><p>Bandingkan skenario tersimpan. Periksa perubahan alokasi, penggunaan anggaran, dan pemerataan wilayah.</p><a href="/compare">Bandingkan skenario</a></div>
      </li>
    </ol>
  </section>

  <section class="scenario-section" aria-labelledby="scenario-title" data-motion="focus">
    <div class="scenario-copy">
      <h2 id="scenario-title"><span>Satu anggaran.</span><br />Banyak kemungkinan.</h2>
      <p>Bobot dan batasan yang berbeda dapat menghasilkan alokasi yang berbeda. Beri ruang untuk mengujinya sebelum menarik kesimpulan.</p>
      <a class="landing-button light" href="/studio">Coba skenario Anda</a>
    </div>
    <dl class="scenario-factors">
      <div><dt>Kebutuhan</dt><dd>Sanitasi, air, internet, komputer.</dd></div>
      <div><dt>Batasan</dt><dd>Anggaran, biaya, kapasitas, pemerataan.</dd></div>
      <div><dt>Jejak keputusan</dt><dd>Parameter, versi data, hasil tersimpan.</dd></div>
    </dl>
    <p class="scenario-note">Simulasi berbasis data dan asumsi. Bukan keputusan anggaran resmi.</p>
  </section>

  <section id="sumber" class="eq-container sources" aria-labelledby="sources-title">
    <div class="section-intro" data-motion="left">
      <h2 id="sources-title">Angka yang jelas.<br /><span>Sumber yang terbuka.</span></h2>
      <p>Empat indikator inti dari portal data Kemendikdasmen. Periksa definisi, satuan, dan cakupannya sebelum digunakan.</p>
      <a class="text-link" href="/datasets">Periksa katalog dataset</a>
    </div>
    <div class="source-list">
      {#each sources as source, index}
        <a class="source-row" data-motion="right" data-motion-delay={index * 65} href={'https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/' + source.slug}>
          <h3><Icon name={source.icon} size={20} /><span>{source.name}</span></h3>
          <span>{source.unit} · 2025</span>
          <span class="publisher">Kemendikdasmen</span>
        </a>
      {/each}
      <p class="source-note">Data lokal berstatus review. Tanggal unduh dan lisensi redistribusi belum terverifikasi. Tahun dan periode pada halaman penerbit perlu diperiksa.</p>
    </div>
  </section>

  <section id="metode" class="eq-container method" aria-labelledby="method-title">
    <div class="section-intro" data-motion="left">
      <h2 id="method-title">Pahami alasannya.<br /><span>Kenali batasannya.</span></h2>
      <p>Data, asumsi, dan metode selalu menjadi bagian dari cara membaca hasil.</p>
      <a class="text-link" href="/methodology">Baca metodologi</a>
    </div>
    <div class="method-details" data-motion="unfold" data-motion-delay="90">
      <details open>
        <summary>Bagaimana prioritas disusun?</summary>
        <p>Indikator kebutuhan digabung dengan bobot nonnegatif yang berjumlah 100%. MCDA membentuk skor kebutuhan; solver CP-SAT menghitung alokasi berdasarkan anggaran, biaya, kapasitas, dan batasan yang dipilih.</p>
      </details>
      <details>
        <summary>Bagaimana data kosong diperlakukan?</summary>
        <p>Nilai hilang bukan nol. Wilayah yang tidak memenuhi kelengkapan data dilaporkan dalam cakupan analisis. Perbandingan perlu memakai periode, jenjang, dan satuan yang setara.</p>
      </details>
      <details>
        <summary>Apa arti hasil alokasi?</summary>
        <p>Hasil menyatakan alokasi paket pada asumsi yang digunakan. Satu paket bukan bukti satu sekolah terbantu, dan hasil simulasi bukan prediksi dampak atau keputusan anggaran resmi.</p>
      </details>
      <details>
        <summary>Apakah semua skenario memiliki solusi?</summary>
        <p>Tidak selalu. Anggaran dan batasan dapat saling bertentangan. Periksa status solver untuk membedakan solusi optimal, solusi layak, proses yang belum menemukan solusi, dan skenario yang terbukti tidak layak.</p>
      </details>
    </div>
  </section>

  <section class="eq-container closing" aria-label="Mulai menggunakan Equora" data-motion="focus">
    <h2>Mulai dari pertanyaan<br /><span>yang ingin Anda jawab.</span></h2>
    <a class="landing-button primary" href="/daerah">Lihat pendidikan di daerah saya</a>
    <p>Pilih provinsi dan baca kondisi fasilitas sekolah tanpa login.</p>
  </section>
</PublicShell>

<style>
  .landing-hero { padding-top: 58px; position: relative; }
  .landing-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(1000px, 90vw);
    height: 440px;
    background: radial-gradient(circle at 50% 25%, rgba(18, 100, 216, 0.08) 0%, rgba(243, 245, 248, 0) 70%);
    pointer-events: none;
    z-index: 0;
  }
  .landing-progress { position: fixed; inset: 0 0 auto; z-index: 50; height: 3px; background: var(--eq-primary); transform-origin: left; scale: var(--landing-progress, 0) 1; pointer-events: none; }
  .hero-copy { text-align: center; margin-inline: auto; max-width: 850px; position: relative; z-index: 1; }
  
  .hero-pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(18, 100, 216, 0.22);
    box-shadow: 0 2px 10px rgba(18, 100, 216, 0.08);
    backdrop-filter: blur(8px);
    margin-bottom: 22px;
  }
  .pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--eq-primary);
    box-shadow: 0 0 8px rgba(18, 100, 216, 0.6);
  }
  .pill-text {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--eq-primary);
  }

  .hero-metrics-ribbon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px 20px;
    margin-top: 34px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid var(--eq-border);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(31, 45, 61, 0.04);
    backdrop-filter: blur(10px);
  }
  .metric-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .metric-value {
    font-size: 18px;
    font-weight: 750;
    color: var(--eq-primary);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .metric-label {
    font-size: 12px;
    font-weight: 550;
    color: var(--eq-text-secondary);
  }
  .metric-divider {
    width: 1px;
    height: 24px;
    background: var(--eq-border);
  }
  h1 { font-size: clamp(3.25rem, 6.4vw, 5.4rem); line-height: 1.03; font-weight: 620; letter-spacing: -0.04em; color: var(--eq-primary); }
  h1 > span { color: #637489; }
  .hero-copy > p { max-width: 570px; margin: 26px auto 0; color: var(--eq-text-secondary); font-size: 17px; line-height: 1.7; }
  .hero-actions { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 18px 28px; margin-top: 30px; }
  .landing-button { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 12px 22px; border-radius: 12px; font-size: 16px; font-weight: 600; text-decoration: none; transition: background-color 160ms ease, translate 180ms ease, box-shadow 180ms ease; }
  .primary { background: var(--eq-primary); color: white; }
  .primary:hover { background: var(--eq-primary-hover); }
  .light { background: white; color: var(--eq-primary-hover); }
  .light:hover { background: var(--eq-primary-tint); }
  .text-link { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; font-weight: 550; text-decoration-color: #afb5bb; text-underline-offset: 5px; }
  .text-link:hover { text-decoration-color: currentColor; }
  .product-preview { margin: 54px auto 0; max-width: 1160px; text-align: center; }
  figure { margin: 0; }
  .school-illustration { display: block; width: 100%; height: auto; }
  .workflow, .sources, .method { display: grid; grid-template-columns: 1fr 1.15fr; gap: 80px; padding-block: 112px; }
  .section-intro { align-self: start; max-width: 425px; }
  h2 { font-size: clamp(2rem, 3.5vw, 3.2rem); line-height: 1.08; font-weight: 590; letter-spacing: -0.035em; }
  h2 span { color: #747b82; }
  .section-intro > p { margin-top: 22px; max-width: 360px; color: var(--eq-text-secondary); font-size: 15px; line-height: 1.7; }
  .section-intro > a { margin-top: 18px; }
  .workflow-list { list-style: none; padding: 0; margin: 0; }
  .workflow-list li { display: grid; grid-template-columns: 30px 1fr; gap: 18px; padding: 26px 0; border-top: 1px solid #e8eaec; }
  .workflow-list li:first-child { padding-top: 0; border-top: 0; }
  .step-number { padding-top: 2px; color: #737980; font-size: 12px; font-variant-numeric: tabular-nums; }
  h3 { font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
  .workflow-list p { margin-top: 9px; color: var(--eq-text-secondary); font-size: 14px; line-height: 1.7; }
  .workflow-list a { display: inline-flex; align-items: center; min-height: 44px; margin-top: 4px; font-size: 13px; font-weight: 600; }
  .scenario-section { margin: 0 24px; padding: 68px 64px 30px; border-radius: 28px; background: #163a5f; color: #fff; display: grid; grid-template-columns: 1.2fr 1fr; gap: 56px 80px; }
  .scenario-copy h2 { font-size: clamp(2.8rem, 4.5vw, 4.1rem); }
  .scenario-copy h2 > span { color: #b8cee3; }
  .scenario-copy > p { max-width: 410px; color: #d0d7dd; font-size: 15px; line-height: 1.75; margin: 24px 0; }
  .scenario-factors { margin: 6px 0 0; align-self: center; }
  .scenario-factors > div { padding: 24px 0; border-top: 1px solid #496987; }
  .scenario-factors > div:first-child { padding-top: 0; border-top: 0; }
  dt { font-size: 17px; font-weight: 550; }
  dd { color: #bfc9d1; margin: 7px 0 0; font-size: 14px; }
  .scenario-note { grid-column: 1 / -1; font-size: 13px; color: #c5d6e6; border-top: 1px solid #496987; padding-top: 24px; }
  .sources { padding-bottom: 84px; }
  .source-row { display: grid; grid-template-columns: 1fr auto; gap: 8px 20px; padding: 24px 0; border-bottom: 1px solid #e8eaec; text-decoration: none; }
  .source-row:first-child { padding-top: 0; }
  .source-row h3 { display: flex; align-items: center; gap: 10px; }
  .source-row h3 :global(svg) { flex: 0 0 auto; color: var(--eq-primary); }
  .source-row:hover h3 { text-decoration: underline; text-underline-offset: 5px; }
  .source-row > span { color: #656b72; font-size: 13px; }
  .source-row > .publisher { grid-column: 1 / -1; }
  .source-note { color: #656b72; font-size: 13px; line-height: 1.7; margin-top: 22px; max-width: 490px; }
  .method { padding-top: 64px; border-top: 1px solid #e8eaec; }
  details { padding: 22px 0; border-bottom: 1px solid #e8eaec; }
  details:first-child { padding-top: 0; }
  summary { cursor: pointer; min-height: 44px; align-content: center; font-size: 15px; font-weight: 550; }
  details p { margin-top: 12px; font-size: 14px; line-height: 1.75; color: var(--eq-text-secondary); max-width: 500px; }
  .closing { text-align: center; padding-block: 40px 76px; }
  .closing .landing-button { margin-top: 28px; }
  .closing > p { margin-top: 16px; font-size: 13px; color: #656b72; }
  @media (prefers-reduced-motion: no-preference) {
    figure { translate: 0 calc(-1 * var(--preview-drift, 0px)); transition: translate 260ms ease-out; }
    .landing-progress { transition: scale 120ms linear; }
    .text-link { transition: color 180ms ease, text-decoration-color 180ms ease; }
    .workflow-list li { transition: border-color 180ms ease; }
    .step-number { transition: color 180ms ease, translate 180ms ease; }
    .workflow-list li:is(:hover, :focus-within) .step-number { color: var(--eq-primary); translate: 3px 0; }
    .workflow-list li:is(:hover, :focus-within) { border-color: var(--eq-primary); }
  }
  @media (prefers-reduced-motion: reduce) { .landing-progress { display: none; } }
  @media (min-width: 1024px) { .landing-hero { padding-top: 48px; } }
  @media (max-width: 900px) {
    .workflow, .sources, .method { gap: 40px; grid-template-columns: 1fr 1fr; padding-block: 80px; }
    .scenario-section { padding: 48px 36px 28px; gap: 36px; }
    .source-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 639px) {
    .landing-hero { padding-top: 40px; }
    h1 { font-size: clamp(2.8rem, 10.6vw, 4rem); }
    .hero-copy > p { font-size: 15px; margin-top: 22px; max-width: 350px; }
    .desktop-break { display: none; }
    .hero-actions { gap: 8px 20px; margin-top: 24px; }
    .hero-actions .text-link { font-size: 13px; }
    .product-preview { margin-top: 34px; }
    .workflow, .sources, .method { grid-template-columns: 1fr; gap: 34px; padding-block: 64px; }
    h2 { font-size: 34px; }
    .section-intro > p { margin-top: 18px; }
    .workflow-list li { padding-block: 20px; }
    .scenario-section { margin-inline: 12px; padding: 38px 24px 24px; grid-template-columns: 1fr; gap: 28px; border-radius: 20px; }
    .scenario-copy h2 { font-size: 42px; }
    .scenario-copy > p { font-size: 14px; }
    .scenario-factors > div { padding-block: 18px; }
    .sources { padding-bottom: 52px; }
    .method { padding-top: 52px; }
    .closing { padding-block: 24px 56px; }
    .closing h2 { font-size: 32px; }
  }
</style>
