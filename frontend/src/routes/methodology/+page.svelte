<svelte:head>
  <title>Metodologi — Equora</title>
  <meta
    name="description"
    content="Penjelasan metode, asumsi, dan batas interpretasi Equora."
  />
</svelte:head>

<script lang="ts">
  const sections = [
    { id: 'sources', label: 'Sumber dan kesiapan data' },
    { id: 'priority', label: 'Skor prioritas' },
    { id: 'missing', label: 'Missing dan coverage' },
    { id: 'allocation', label: 'Alokasi sandbox' },
    { id: 'glossary', label: 'Glosarium' },
    { id: 'limits', label: 'Batasan' }
  ];

  const glossary = [
    ['Coverage', 'Proporsi atau cakupan input yang tersedia dan dapat dipakai pada suatu perhitungan. Coverage rendah tidak otomatis berarti data salah.'],
    ['Release data', 'Kumpulan versi dataset yang dipatok bersama agar perbandingan memakai periode, unit, dan definisi yang kompatibel.'],
    ['Constraint', 'Aturan yang wajib dipenuhi model, misalnya anggaran, kapasitas, batas minimum, atau integritas bilangan.'],
    ['Feasible', 'Model menemukan solusi yang memenuhi constraint. Feasible belum berarti solusi tersebut terbaik menurut objective.'],
    ['Optimal', 'Solusi terbaik yang dibuktikan solver untuk objective dan constraint model pada batas toleransi yang dinyatakan.'],
    ['Demo assumption', 'Nilai contoh sintetis untuk menguji alur. Nilai ini bukan harga, kapasitas, atau keputusan resmi.']
  ];
</script>

<main>
  <nav class="nav" aria-label="Navigasi utama">
    <a class="wordmark" href="/">equora<span>.</span></a>
    <div class="nav-links">
      <a href="/">Beranda</a>
      <a href="/about">Tentang</a>
      <a class="active" href="/methodology" aria-current="page">Metodologi</a>
    </div>
  </nav>

  <header class="hero">
    <p class="eyebrow">Reference · Method v1 sandbox</p>
    <h1>Bagaimana Equora menjelaskan prioritas dan skenario.</h1>
    <p>
      Halaman ini menjelaskan metode yang sudah tersedia di sandbox sintetis. Ia membantu membaca
      skor dan status model, tetapi belum membuktikan hasil dari dataset produksi atau dampak nyata.
    </p>
    <div class="version-note">
      <strong>Status metode</strong>
      <span>Weighted normalized needs v1 · allocation sandbox single-intervention-demo-v1</span>
    </div>
  </header>

  <div class="layout">
    <aside class="toc" aria-label="Daftar isi">
      <p class="eyebrow">Di halaman ini</p>
      {#each sections as section}
        <a href={`#${section.id}`}>{section.label}</a>
      {/each}
    </aside>

    <div class="content">
      <section id="sources" aria-labelledby="sources-title">
        <p class="eyebrow">01 · Sumber data</p>
        <h2 id="sources-title">Metode dimulai dari data yang sebanding.</h2>
        <p>
          Perhitungan menerima kebutuhan yang sudah dinormalisasi ke rentang <code>[0, 1]</code>,
          dengan nilai lebih tinggi berarti kebutuhan lebih besar. Tahun, jenjang, unit, wilayah,
          dan versi data harus kompatibel sebelum perhitungan dijalankan.
        </p>
        <div class="callout">
          <strong>Belum terhubung ke release produksi</strong>
          <p>
            Audit sumber, lisensi, release data, dan provenance observasi masih menjadi gerbang data.
            Link sumber publik hanya menunjukkan lokasi rujukan, bukan bukti bahwa file sudah diimpor.
          </p>
          <a href="https://data.kemendikdasmen.go.id/" target="_blank" rel="noreferrer">Buka portal sumber pendidikan ↗</a>
        </div>
      </section>

      <section id="priority" aria-labelledby="priority-title">
        <p class="eyebrow">02 · Standardisasi dan bobot</p>
        <h2 id="priority-title">Skor prioritas adalah jumlah kontribusi indikator.</h2>
        <p>
          Untuk setiap wilayah <code>i</code>, bobot indikator harus nonnegatif dan totalnya tepat
          <code>1</code>. Nilai kebutuhan setiap indikator sudah berada pada rentang yang sama.
        </p>
        <div class="formula" aria-label="Rumus skor prioritas">
          <code>score_i = Σ (weight_j × need_ij)</code>
        </div>
        <div class="example">
          <div>
            <span class="example-label">Contoh sintetis · bukan data provinsi</span>
            <h3>SYN-A mendapat skor 0,55</h3>
          </div>
          <p>
            Dengan bobot sanitasi 0,75 dan air 0,25, kebutuhan SYN-A adalah 0,6 dan 0,4:
            <code>(0,75 × 0,6) + (0,25 × 0,4) = 0,55</code>.
          </p>
        </div>
        <ul class="rules">
          <li>Kontribusi setiap indikator disimpan agar skor dapat dijelaskan.</li>
          <li>Skor diurutkan menurun; kode wilayah menjadi tie-break deterministik.</li>
          <li>Skor tidak dibulatkan sebelum ranking.</li>
        </ul>
      </section>

      <section id="missing" aria-labelledby="missing-title">
        <p class="eyebrow">03 · Missing dan coverage</p>
        <h2 id="missing-title">Missing tidak diam-diam diubah menjadi nol.</h2>
        <p>
          Kebijakan sandbox yang tersedia adalah <code>exclude</code>. Wilayah yang kehilangan
          indikator dengan bobot positif dikeluarkan dari ranking dan dicatat bersama indikator yang
          hilang. Nilai nol tetap merupakan nilai valid dan berbeda dari missing.
        </p>
        <div class="state-grid">
          <div><strong>Nilai nol</strong><span>Masuk perhitungan sebagai kebutuhan 0.</span></div>
          <div><strong>Missing</strong><span>Dicatat dan dikeluarkan jika indikatornya berbobot positif.</span></div>
          <div><strong>Coverage</strong><span>Dilaporkan dari jumlah input, bukan ditebak sebagai kualitas.</span></div>
        </div>
      </section>

      <section id="allocation" aria-labelledby="allocation-title">
        <p class="eyebrow">04 · Alokasi sandbox</p>
        <h2 id="allocation-title">Model menguji paket integer dengan asumsi yang terlihat.</h2>
        <p>
          Kandidat CP-SAT sandbox memakai satu jenis intervensi dan biaya yang wajib diberi label
          <code>demo_assumption</code>. Jumlah paket <code>x_i</code> adalah integer per wilayah.
        </p>
        <div class="formula" aria-label="Rumus alokasi sandbox">
          <code>maximize Σ(priority_units_i × x_i)</code>
          <code>subject to Σ(cost_i × x_i) ≤ budget</code>
          <code>minimum_i ≤ x_i ≤ capacity_i</code>
        </div>
        <div class="callout warning">
          <strong>Interpretasi harus dibatasi</strong>
          <p>
            Objective adalah proxy kebutuhan berbobot. Ia bukan jumlah sekolah yang pasti terbantu,
            bukan prediksi dampak pendidikan, dan bukan keputusan anggaran. Manfaat marginal konstan
            sampai kapasitas adalah asumsi model sandbox.
          </p>
        </div>
        <h3>Status hasil</h3>
        <div class="status-table" role="table" aria-label="Arti status model">
          <div role="row"><span class="status-name" role="cell">optimal</span><span role="cell">Solusi terbaik dibuktikan untuk model dan batas waktu yang dinyatakan.</span></div>
          <div role="row"><span class="status-name" role="cell">feasible</span><span role="cell">Solusi memenuhi constraint, tetapi optimum belum terbukti.</span></div>
          <div role="row"><span class="status-name" role="cell">infeasible</span><span role="cell">Solver membuktikan tidak ada solusi yang memenuhi constraint.</span></div>
          <div role="row"><span class="status-name" role="cell">no_solution</span><span role="cell">Pencarian berhenti tanpa solusi; bukan bukti infeasible.</span></div>
        </div>
      </section>

      <section id="glossary" aria-labelledby="glossary-title">
        <p class="eyebrow">05 · Istilah</p>
        <h2 id="glossary-title">Glosarium singkat.</h2>
        <dl class="glossary">
          {#each glossary as [term, definition]}
            <div><dt>{term}</dt><dd>{definition}</dd></div>
          {/each}
        </dl>
      </section>

      <section id="limits" aria-labelledby="limits-title" class="limits">
        <p class="eyebrow">06 · Batas interpretasi</p>
        <h2 id="limits-title">Optimal menurut model bukan bukti keadilan universal.</h2>
        <ul>
          <li>Sandbox memakai kasus sintetis; belum ada benchmark representatif atau klaim latensi produksi.</li>
          <li>Biaya, kapasitas, dan fairness resmi belum ditetapkan di halaman ini.</li>
          <li>Hasil perlu dibaca bersama provenance, coverage, missing data, asumsi, dan versi metode.</li>
          <li>Verifikasi lapangan, pertimbangan kebijakan, dan proses penganggaran resmi tetap diperlukan.</li>
        </ul>
      </section>
    </div>
  </div>

  <footer class="footer">
    <span class="wordmark">equora<span>.</span></span>
    <a href="/">Kembali ke beranda</a>
  </footer>
</main>

<style>
  :global(body) { margin: 0; background: #e7e8ea; color: #24262b; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  :global(*) { box-sizing: border-box; }
  :global(a:focus-visible) { outline: 3px solid #236aab; outline-offset: 4px; }
  main { margin: 0 auto; max-width: 1180px; padding: 0 32px 72px; }
  .nav, .footer { align-items: center; display: flex; justify-content: space-between; min-height: 84px; }
  .wordmark { color: #24262b; font-size: 22px; font-weight: 800; letter-spacing: -.06em; text-decoration: none; }
  .wordmark span { color: #c94025; }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a, .footer a { color: #555c65; font-size: 14px; font-weight: 700; text-decoration: none; }
  .nav-links .active { color: #c94025; }
  .hero { border-bottom: 1px solid #cfd2d6; padding: 72px 0 48px; }
  .eyebrow { color: #c94025; font-size: 12px; font-weight: 800; letter-spacing: .1em; margin: 0 0 14px; text-transform: uppercase; }
  h1, h2, h3, p { margin-top: 0; }
  h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); letter-spacing: -.06em; line-height: 1; margin-bottom: 22px; max-width: 860px; }
  h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); letter-spacing: -.05em; line-height: 1.08; margin-bottom: 18px; }
  h3 { font-size: 20px; letter-spacing: -.03em; margin-bottom: 10px; }
  .hero > p:not(.eyebrow), .content section > p:not(.eyebrow) { color: #555c65; line-height: 1.65; max-width: 760px; }
  .version-note { align-items: center; background: #f0f1f2; border: 1px solid #cfd2d6; border-radius: 10px; display: inline-flex; gap: 14px; margin-top: 26px; padding: 12px 16px; }
  .version-note strong { font-size: 13px; }
  .version-note span { color: #686e76; font-size: 13px; }
  .layout { display: grid; gap: 68px; grid-template-columns: 220px 1fr; padding-top: 56px; }
  .toc { align-self: start; position: sticky; top: 24px; }
  .toc a { border-left: 2px solid transparent; color: #555c65; display: block; font-size: 14px; padding: 8px 0 8px 12px; text-decoration: none; }
  .toc a:hover, .toc a:focus-visible { border-color: #c94025; color: #24262b; }
  .content { min-width: 0; }
  .content section { border-bottom: 1px solid #cfd2d6; padding: 0 0 72px; }
  .content section + section { padding-top: 72px; }
  code { background: #f0f1f2; border-radius: 4px; color: #8e321f; font-size: .9em; padding: 2px 5px; }
  .callout, .example { background: #f9f9fa; border: 1px solid #cfd2d6; border-radius: 12px; margin-top: 24px; padding: 20px; }
  .callout strong, .example-label { color: #8e321f; display: block; font-size: 13px; font-weight: 800; margin-bottom: 8px; }
  .callout p, .example p { color: #555c65; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
  .callout a { color: #c94025; font-size: 14px; font-weight: 750; }
  .warning { background: #f7e4df; border-color: #e5b5a9; }
  .formula { background: #24262b; border-radius: 12px; display: grid; gap: 8px; margin-top: 24px; overflow-x: auto; padding: 20px; }
  .formula code { background: transparent; color: #f9f9fa; font-size: 15px; white-space: nowrap; }
  .example { align-items: center; display: grid; gap: 20px; grid-template-columns: 1fr 1fr; }
  .example h3 { margin-bottom: 0; }
  .example p { margin: 0; }
  .rules { color: #555c65; line-height: 1.7; margin: 24px 0 0; padding-left: 22px; }
  .state-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-top: 24px; }
  .state-grid div { background: #f0f1f2; border-radius: 10px; display: grid; gap: 8px; padding: 16px; }
  .state-grid strong { font-size: 14px; }
  .state-grid span { color: #555c65; font-size: 13px; line-height: 1.5; }
  .status-table { border: 1px solid #cfd2d6; border-radius: 10px; overflow: hidden; }
  .status-table div { display: grid; gap: 18px; grid-template-columns: 130px 1fr; padding: 14px 16px; }
  .status-table div + div { border-top: 1px solid #cfd2d6; }
  .status-name { color: #8e321f; font-size: 13px; font-weight: 800; }
  .status-table span { color: #555c65; font-size: 14px; line-height: 1.5; }
  .glossary { display: grid; gap: 0; margin: 0; }
  .glossary div { border-bottom: 1px solid #cfd2d6; display: grid; gap: 18px; grid-template-columns: 150px 1fr; padding: 16px 0; }
  .glossary dt { font-weight: 800; }
  .glossary dd { color: #555c65; font-size: 14px; line-height: 1.6; margin: 0; }
  .limits { background: #f7e4df; border: 1px solid #e5b5a9; border-radius: 14px; margin-top: 72px; padding: 28px; }
  .limits ul { color: #555c65; line-height: 1.7; margin: 0; padding-left: 22px; }
  .footer { border-top: 1px solid #cfd2d6; margin-top: 72px; }
  @media (max-width: 800px) {
    main { padding: 0 20px 48px; }
    .nav { align-items: flex-start; flex-direction: column; gap: 16px; padding: 20px 0; }
    .nav-links { flex-wrap: wrap; gap: 12px 18px; }
    .version-note { align-items: flex-start; flex-direction: column; gap: 4px; }
    .layout { display: block; padding-top: 36px; }
    .toc { position: static; }
    .toc a { display: inline-block; margin-right: 10px; }
    .example, .state-grid { grid-template-columns: 1fr; }
    .status-table div, .glossary div { gap: 8px; grid-template-columns: 1fr; }
    .footer { align-items: flex-start; flex-direction: column; gap: 12px; padding: 28px 0; }
  }
</style>
