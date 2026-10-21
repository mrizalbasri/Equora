<script lang="ts">
  import { navigation } from '$lib/api/workspace';
  import PublicShell from '$lib/components/PublicShell.svelte';

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

<svelte:head>
  <title>Metodologi — Equora</title>
  <meta
    name="description"
    content="Penjelasan metode, asumsi, dan batas interpretasi Equora."
  />
</svelte:head>

<PublicShell
  links={navigation}
>
  <article class="eq-container methodology">
    <header class="hero">
      <p class="eyebrow">Reference · Method v1 sandbox</p>
      <h1>Bagaimana Equora menjelaskan prioritas dan skenario.</h1>
      <p class="intro">
        Halaman ini menjelaskan perhitungan pada snapshot review lokal. Skor dan status model membantu
        membandingkan asumsi; hasilnya belum membuktikan dampak nyata atau kelayakan kebijakan.
      </p>
      <div class="version-note">
        <strong>Status metode</strong>
        <span>Weighted normalized needs v1 · allocation sandbox single-intervention-demo-v1</span>
      </div>
    </header>

    <div class="layout">
      <aside class="toc" aria-label="Daftar isi">
        <p class="toc-title">Di halaman ini</p>
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
            <strong>Snapshot review lokal · 2025/2026</strong>
            <p>
              Sepuluh workbook pengguna, 38 provinsi, enam jenjang dan kolom Total telah diproses.
              Hash, skala dan koordinat sel sumber tersedia pada katalog. Tanggal unduh pengguna
              serta lisensi redistribusi belum diverifikasi; ini belum release publik.
            </p>
            <a href="https://data.kemendikdasmen.go.id/" target="_blank" rel="noreferrer">Buka portal sumber pendidikan ↗</a>
          </div>
        </section>

        <section aria-labelledby="local-contract">
          <h2 id="local-contract">Kontrak input lokal</h2>
          <p>Empat indikator inti adalah sanitasi, air, internet dan komputer. Kebutuhan = 1 − akses / 100.
            Persentase internet/komputer di Excel berupa pecahan berformat persen dan dikalikan 100 sekali;
            air/sanitasi sudah berupa poin persentase. Jumlah sekolah hanya menjadi konteks dan denominator.</p>
          <p>Denominator nol berarti tidak ada sekolah pada scope tersebut. Nilai itu tidak ditafsirkan
            sebagai kebutuhan 100% dan wilayah tidak masuk peringkat. Missing pada indikator berbobot
            positif menyebabkan exclude; indikator berbobot nol tidak menghalangi wilayah masuk.</p>
          <p>Studio menerima biaya, kapasitas dan minimum sebagai asumsi demo. Satu paket tidak diklaim
            setara satu sekolah terbantu. CP-SAT memakai satu worker, seed 0 dan batas lima detik;
            skor objective dibulatkan HALF_UP ke skala 10.000. Baseline merata dan greedy memakai
            kendala yang sama. Snapshot menyimpan parameter, hasil, sumber dan versi data/metode/model.</p>
          <p>Compare menolak versi data, jenjang atau metode/model berbeda. Ketika bobot berubah,
            objective tidak dinyatakan sebanding sebagai dampak. Peta memakai batas komunitas yang
            disederhanakan dan crosswalk eksplisit, tanpa lokasi sekolah rekaan atau basemap.</p>
          <a href="/datasets">Periksa sumber dan kualitas →</a>
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
            <li>Workspace lokal memakai data pengguna yang diaudit; tes otomatis memakai fixture sintetis. Belum ada benchmark representatif atau klaim latensi produksi.</li>
            <li>Biaya, kapasitas, dan fairness resmi belum ditetapkan di halaman ini.</li>
            <li>Hasil perlu dibaca bersama provenance, coverage, missing data, asumsi, dan versi metode.</li>
            <li>Verifikasi lapangan, pertimbangan kebijakan, dan proses penganggaran resmi tetap diperlukan.</li>
          </ul>
        </section>
      </div>
    </div>
    <a class="eq-button" href="/">Kembali ke beranda</a>
  </article>
</PublicShell>

<style>
  .methodology {
    padding-block: 48px 80px;
  }
  .hero {
    border-bottom: 1px solid var(--eq-border);
    padding-bottom: 40px;
  }
  .eyebrow {
    color: var(--eq-primary);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin: 0 0 12px;
    text-transform: uppercase;
  }
  h1, h2, h3, p {
    margin-top: 0;
  }
  h1 {
    font-size: clamp(2.4rem, 4.5vw, 4rem);
    letter-spacing: -0.045em;
    line-height: 1.12;
    margin-bottom: 20px;
    max-width: 880px;
    color: var(--eq-text);
  }
  h2 {
    font-size: clamp(1.75rem, 3vw, 2.4rem);
    letter-spacing: -0.035em;
    line-height: 1.2;
    margin-bottom: 16px;
    color: var(--eq-text);
  }
  h3 {
    font-size: 1.15rem;
    font-weight: 650;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    color: var(--eq-text);
  }
  .intro,
  .content section > p:not(.eyebrow) {
    color: var(--eq-text-secondary);
    line-height: 1.65;
    max-width: 760px;
    font-size: 1rem;
  }
  .version-note {
    align-items: center;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    display: inline-flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
    padding: 12px 18px;
  }
  .version-note strong {
    font-size: 0.875rem;
    color: var(--eq-text);
  }
  .version-note span {
    color: var(--eq-text-secondary);
    font-size: 0.875rem;
  }
  .layout {
    display: grid;
    gap: 64px;
    grid-template-columns: 240px 1fr;
    padding-top: 48px;
  }
  .toc {
    align-self: start;
    position: sticky;
    top: 128px;
  }
  .toc-title {
    color: var(--eq-text-muted);
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .toc a {
    border-left: 2px solid transparent;
    border-radius: 0 var(--eq-radius-sm) var(--eq-radius-sm) 0;
    color: var(--eq-text-secondary);
    display: block;
    font-size: 0.875rem;
    padding: 8px 0 8px 14px;
    text-decoration: none;
    transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
  }
  .toc a:hover,
  .toc a:focus-visible {
    border-color: var(--eq-primary);
    background-color: var(--eq-primary-tint);
    color: var(--eq-primary);
  }
  .content {
    min-width: 0;
  }
  .content section {
    border-bottom: 1px solid var(--eq-border);
    padding: 0 0 64px;
  }
  .content section + section {
    padding-top: 64px;
  }
  code {
    background: var(--eq-primary-tint);
    border-radius: 4px;
    color: var(--eq-primary-hover);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.9em;
    padding: 2px 6px;
  }
  .callout,
  .example {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-md);
    margin-top: 24px;
    padding: 22px;
  }
  .callout strong,
  .example-label {
    color: var(--eq-primary);
    display: block;
    font-size: 0.875rem;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .callout p,
  .example p {
    color: var(--eq-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .callout a {
    color: var(--eq-primary);
    font-size: 0.875rem;
    font-weight: 650;
    text-decoration: none;
  }
  .callout a:hover {
    text-decoration: underline;
  }
  .callout.warning {
    background: #fff8f5;
    border-color: #f7d2c9;
  }
  .callout.warning strong {
    color: var(--eq-danger);
  }
  .formula {
    background: #101826;
    border: 1px solid #1f2d3d;
    border-radius: var(--eq-radius-md);
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
    display: grid;
    gap: 8px;
    margin-top: 24px;
    overflow-x: auto;
    padding: 20px;
  }
  .formula code {
    background: transparent;
    color: #e2e8f0;
    font-size: 0.95rem;
    white-space: nowrap;
    padding: 0;
  }
  .example {
    align-items: center;
    background: var(--eq-surface);
    box-shadow: var(--eq-shadow-card);
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr 1fr;
  }
  .example h3 {
    margin-bottom: 0;
  }
  .example p {
    margin: 0;
  }
  .rules {
    color: var(--eq-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.7;
    margin: 20px 0 0;
    padding-left: 20px;
  }
  .state-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 24px;
  }
  .state-grid div {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    display: grid;
    gap: 8px;
    padding: 18px;
  }
  .state-grid strong {
    color: var(--eq-text);
    font-size: 0.9375rem;
  }
  .state-grid span {
    color: var(--eq-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .status-table {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    margin-top: 16px;
    overflow: hidden;
  }
  .status-table div {
    align-items: baseline;
    display: grid;
    gap: 18px;
    grid-template-columns: 140px 1fr;
    padding: 14px 18px;
  }
  .status-table div + div {
    border-top: 1px solid var(--eq-border);
  }
  .status-name {
    color: var(--eq-primary);
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
    font-weight: 700;
  }
  .status-table span {
    color: var(--eq-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.55;
  }
  .glossary {
    display: grid;
    gap: 0;
    margin: 20px 0 0;
  }
  .glossary div {
    align-items: baseline;
    border-bottom: 1px solid var(--eq-border);
    display: grid;
    gap: 20px;
    grid-template-columns: 160px 1fr;
    padding: 18px 0;
  }
  .glossary dt {
    color: var(--eq-text);
    font-size: 0.9375rem;
    font-weight: 700;
  }
  .glossary dd {
    color: var(--eq-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0;
  }
  .limits {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-md);
    margin-top: 64px;
    padding: 28px;
  }
  .limits ul {
    color: var(--eq-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.7;
    margin: 0;
    padding-left: 20px;
  }
  .limits li + li {
    margin-top: 8px;
  }

  @media (max-width: 860px) {
    .methodology {
      padding-block: 28px 56px;
    }
    .layout {
      display: block;
      padding-top: 28px;
    }
    .toc {
      border-bottom: 1px solid var(--eq-border);
      margin-bottom: 32px;
      padding-bottom: 24px;
      position: static;
    }
    .toc a {
      background: var(--eq-surface-subtle);
      border-left: none;
      border-radius: var(--eq-radius-sm);
      display: inline-block;
      margin-bottom: 6px;
      margin-right: 8px;
      padding: 6px 12px;
    }
    .example,
    .state-grid {
      grid-template-columns: 1fr;
    }
    .status-table div,
    .glossary div {
      gap: 6px;
      grid-template-columns: 1fr;
    }
  }
</style>
