<script lang="ts">
  import { onMount } from 'svelte';
  import { navigation } from '$lib/api/workspace';
  import PublicShell from '$lib/components/PublicShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { landingScroll } from '$lib/motion';

  const sections = [
    { id: 'sources', label: 'Sumber dan kesiapan data', icon: 'database' },
    { id: 'priority', label: 'Skor prioritas', icon: 'chart' },
    { id: 'missing', label: 'Missing dan coverage', icon: 'search' },
    { id: 'allocation', label: 'Alokasi sandbox', icon: 'sliders' },
    { id: 'glossary', label: 'Glosarium', icon: 'book' },
    { id: 'limits', label: 'Batasan', icon: 'alert' }
  ] as const;
  let activeSection = $state('sources');

  onMount(() => {
    const targets = sections.map(({ id }) => document.getElementById(id));
    const header = document.querySelector('.header-bar');
    let frame = 0;
    function updateActiveSection() {
      frame = 0;
      const readingLine = Math.max(128, (header?.getBoundingClientRect().bottom ?? 0) + 24);
      let current: string = sections[0].id;
      targets.forEach((target, index) => {
        if (target && target.getBoundingClientRect().top <= readingLine) current = sections[index].id;
      });
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1].id;
      }
      activeSection = current;
    }
    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateActiveSection);
    }
    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  });

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
  <article class="eq-container methodology" use:landingScroll>
    <div class="landing-progress" aria-hidden="true"></div>
    <header class="hero">
      <p class="eyebrow">Panduan membaca data dan simulasi</p>
      <h1 data-motion="focus">Bagaimana Equora menjelaskan prioritas dan skenario.</h1>
      <p class="intro" data-motion="fade" data-motion-delay="60">
        Halaman ini menjelaskan perhitungan pada snapshot review lokal. Skor dan status model membantu
        membandingkan asumsi; hasilnya belum membuktikan dampak nyata atau kelayakan kebijakan.
      </p>
      <div class="version-note" data-motion="fade" data-motion-delay="120">
        <strong>Status metode</strong>
        <span>Weighted normalized needs v1 · allocation sandbox single-intervention-demo-v1</span>
      </div>
      <p class="reading-guide">Baru menggunakan Equora? Mulai dengan <a href="/daerah">profil provinsi Anda</a>. Halaman ini menjelaskan sumber angka, cara prioritas dihitung, dan batas kesimpulan dari hasil simulasi.</p>
    </header>

    <div class="layout">
      <aside class="toc" aria-label="Daftar isi">
        <p class="toc-title">Di halaman ini</p>
        {#each sections as section}
          <a href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined}><Icon name={section.icon} size={16} /><span>{section.label}</span></a>
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
          <figure class="facilities-artwork" data-motion="unfold">
            <img src="/images/editorial/school-facilities.webp" alt="Ilustrasi fasilitas cuci tangan, tangki air, dan ruang komputer di sekolah." width="1983" height="793" loading="lazy" decoding="async" />
            <figcaption>Sanitasi, air, internet, dan komputer menjadi konteks indikator yang dibaca bersama. Ilustrasi fasilitas, bukan dokumentasi sekolah tertentu.</figcaption>
          </figure>
          <div class="callout" data-motion="fade">
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
            disederhanakan dan crosswalk eksplisit. Basemap memberi konteks geografis, bukan sumber
            indikator atau lokasi sekolah.</p>
          <a href="/datasets">Periksa sumber dan kualitas →</a>
        </section>

        <section id="priority" aria-labelledby="priority-title">
          <p class="eyebrow">02 · Standardisasi dan bobot</p>
          <h2 id="priority-title">Skor prioritas adalah jumlah kontribusi indikator.</h2>
          <p>
            Untuk setiap wilayah <code>i</code>, bobot indikator harus nonnegatif dan totalnya tepat
            <code>1</code>. Nilai kebutuhan setiap indikator sudah berada pada rentang yang sama.
          </p>
          <div class="formula" aria-label="Rumus skor prioritas" data-motion="unfold">
            <code>score_i = Σ (weight_j × need_ij)</code>
          </div>
          <div class="example" data-motion="focus">
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
          <div class="state-grid" data-motion="fade">
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
          <div class="formula" aria-label="Rumus alokasi sandbox" data-motion="unfold">
            <code>maximize Σ(priority_units_i × x_i)</code>
            <code>subject to Σ(cost_i × x_i) ≤ budget</code>
            <code>minimum_i ≤ x_i ≤ capacity_i</code>
          </div>
          <div class="callout warning" data-motion="fade">
            <strong>Interpretasi harus dibatasi</strong>
            <p>
              Objective adalah proxy kebutuhan berbobot. Ia bukan jumlah sekolah yang pasti terbantu,
              bukan prediksi dampak pendidikan, dan bukan keputusan anggaran. Manfaat marginal konstan
              sampai kapasitas adalah asumsi model sandbox.
            </p>
          </div>
          <h3>Status hasil</h3>
          <ul class="method-points">
            <li>
              <strong>Uji manual</strong>
              <span>Setelah menyimpan skenario di <a href="/studio">Studio simulasi</a>, Uji Keputusan dapat mengubah asumsi hingga ±25%.</span>
            </li>
            <li>
              <strong>Uji otomatis</strong>
              <span>Anggaran, biaya, dan tiap bobot positif diubah satu per satu sebesar ±10%; bobot kemudian dinormalisasi kembali ke total 100%.</span>
            </li>
            <li>
              <strong>Presisi biaya</strong>
              <span>Biaya seluruh wilayah, termasuk penyesuaian, dibulatkan <code>HALF_UP</code> ke rupiah dengan minimum Rp1.</span>
            </li>
          </ul>
          <h3>Cek pemerataan dan bukti</h3>
          <p>
            Pilihan jangkauan memaksimalkan jumlah provinsi penerima terlebih dahulu. Jika maksimum
            terbukti, tahap kedua memaksimalkan skor kebutuhan dengan jangkauan tersebut. Kedua pilihan
            memakai anggaran, biaya, kapasitas, dan minimum awal yang sama.
          </p>
          <ul class="method-points">
            <li>
              <strong>Batas pemerataan</strong>
              <span>Ukuran ini tidak membuktikan pemerataan antarsekolah atau siswa.</span>
            </li>
            <li>
              <strong>Telusur bukti</strong>
              <span>Nilai akses, kebutuhan, bobot, kontribusi skor, dan sel sumber dihubungkan kembali ke input snapshot.</span>
            </li>
            <li>
              <strong>Uji ketahanan</strong>
              <span>Setiap percobaan dibatasi satu detik. Timeout tanpa solusi dikeluarkan dari hitungan kestabilan; input di luar batas ditandai tidak valid.</span>
            </li>
            <li>
              <strong>Bukti portabel</strong>
              <span>Unduhan JSON menyertakan snapshot, parameter, versi metode, dan hasil percobaan untuk diperiksa ulang. Perbedaan alokasi dapat berasal dari solusi dengan skor setara.</span>
            </li>
          </ul>
          <div class="status-table" role="table" aria-label="Arti status model" data-motion="unfold">
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
          <div class="limits-heading" data-motion="focus">
            <span class="limits-number" aria-hidden="true">06</span>
            <div>
              <p class="limits-label">Batas interpretasi</p>
              <h2 id="limits-title">Optimal di model belum tentu adil di dunia nyata.</h2>
              <p class="limits-intro">
                Equora membantu membandingkan skenario secara transparan. Ia tidak menggantikan
                penilaian manusia, bukti lapangan, atau keputusan kebijakan.
              </p>
            </div>
          </div>

          <div class="limits-boundary" data-motion="fade" data-motion-delay="80">
            <div class="limits-column">
              <p class="limits-column-title"><span aria-hidden="true">01</span> Dapat digunakan untuk</p>
              <ul>
                <li>Membandingkan skenario berdasarkan data, bobot, dan asumsi yang terlihat.</li>
                <li>Menelusuri sumber, coverage, missing data, dan versi metode di balik hasil.</li>
              </ul>
            </div>
            <div class="limits-column limits-column-caution">
              <p class="limits-column-title"><span aria-hidden="true">02</span> Belum dapat digunakan untuk</p>
              <ul>
                <li>Mengklaim biaya, kapasitas, fairness, atau dampak sebagai angka resmi.</li>
                <li>Membuktikan performa produksi; benchmark saat ini belum representatif.</li>
              </ul>
            </div>
          </div>

          <div class="limits-decision">
            <p class="limits-decision-label">Keputusan tetap membutuhkan</p>
            <p>Verifikasi lapangan <span aria-hidden="true">·</span> pertimbangan kebijakan <span aria-hidden="true">·</span> proses penganggaran resmi</p>
          </div>
        </section>
      </div>
    </div>
    <div class="methodology-footer"><a class="eq-button" href="/">Kembali ke beranda</a></div>
  </article>
</PublicShell>

<style>
  :global(html:has(.methodology)) { scroll-behavior: smooth; }
  .landing-progress { position: fixed; inset: 0 0 auto; z-index: 50; height: 3px; background: var(--eq-primary); transform-origin: left; scale: var(--landing-progress, 0) 1; pointer-events: none; }
  .methodology-footer { margin-top: 48px; padding-top: 28px; border-top: 1px solid var(--eq-border); }
  @media (prefers-reduced-motion: no-preference) {
    .landing-progress { transition: scale 120ms linear; }
    .toc a { transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease; }

    .state-grid div { transition: border-color 180ms ease, box-shadow 180ms ease, translate 180ms ease; }
    .state-grid div:hover { border-color: var(--eq-primary); box-shadow: 0 8px 20px rgb(15 23 42 / 5%); translate: 0 -2px; }
    .glossary div { transition: border-color 180ms ease, translate 180ms ease; }
    .glossary div:hover { border-color: var(--eq-primary); translate: 4px 0; }
  }
  @media (prefers-reduced-motion: reduce) { .landing-progress { display: none; } }
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
  .reading-guide { max-width: 760px; margin-top: 20px; color: var(--eq-text-secondary); font-size: 14px; line-height: 1.7; }
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
    max-height: calc(100dvh - 152px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    font-size: 0.875rem;
    padding: 8px 12px 8px 14px;
    text-decoration: none;
    transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
  }
  .toc a:hover {
    background-color: var(--eq-surface-subtle);
    color: var(--eq-text);
  }
  .toc a:focus-visible {
    outline: 2px solid var(--eq-focus);
    outline-offset: -2px;
  }
  .toc a[aria-current='location'] {
    border-color: var(--eq-primary);
    background-color: var(--eq-primary-tint);
    color: var(--eq-primary);
    font-weight: 650;
  }
  .toc a[aria-current='location']:hover {
    background-color: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
  }
  .toc a :global(svg) { flex: 0 0 auto; }
  .facilities-artwork { max-width: 760px; margin: 28px 0; }
  .facilities-artwork img { display: block; width: 100%; height: auto; border-radius: 16px; border: 1px solid var(--eq-border); box-shadow: 0 16px 40px rgb(15 23 42 / 6%); }
  .facilities-artwork figcaption { margin-top: 12px; color: var(--eq-text-secondary); font-size: 13px; line-height: 1.6; }
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
  .content section > h3 {
    margin-top: 36px;
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
  .method-points {
    border-top: 1px solid var(--eq-border);
    list-style: none;
    margin: 20px 0 0;
    padding: 0;
  }
  .method-points li {
    border-bottom: 1px solid var(--eq-border);
    color: var(--eq-text-secondary);
    display: grid;
    font-size: 0.9375rem;
    gap: 20px;
    grid-template-columns: minmax(132px, 0.28fr) minmax(0, 1fr);
    line-height: 1.6;
    padding: 16px 0;
  }
  .method-points strong {
    color: var(--eq-text);
    font-size: 0.875rem;
  }
  .method-points span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .method-points a {
    color: var(--eq-primary-hover);
    font-weight: 650;
    text-underline-offset: 3px;
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
    min-width: 0;
    overflow-wrap: anywhere;
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
  .content .limits {
    background: #101826;
    border-radius: var(--eq-radius-md);
    color: #e2e8f0;
    margin-top: 64px;
    overflow: hidden;
    padding: clamp(28px, 5vw, 56px);
  }
  .limits-heading {
    align-items: start;
    display: grid;
    gap: clamp(20px, 4vw, 44px);
    grid-template-columns: auto minmax(0, 1fr);
  }
  .limits-number {
    color: #74a9cf;
    font-size: clamp(2.75rem, 6vw, 5.5rem);
    font-weight: 750;
    letter-spacing: -0.04em;
    line-height: 0.9;
  }
  .limits-label {
    color: #74a9cf;
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    margin: 0 0 12px;
    text-transform: uppercase;
  }
  .limits h2 {
    color: #f8fafc;
    font-size: clamp(2rem, 4.3vw, 3.75rem);
    letter-spacing: -0.04em;
    line-height: 1.05;
    margin-bottom: 18px;
    max-width: 760px;
    text-wrap: balance;
  }
  .limits-intro {
    color: #b8c5d6;
    font-size: clamp(1rem, 1.6vw, 1.125rem);
    line-height: 1.65;
    margin: 0;
    max-width: 680px;
  }
  .limits-boundary {
    border-bottom: 1px solid #2b3a4f;
    border-top: 1px solid #2b3a4f;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: clamp(32px, 5vw, 52px);
  }
  .limits-column {
    padding: 30px 32px 30px 0;
  }
  .limits-column + .limits-column {
    border-left: 1px solid #2b3a4f;
    padding-left: 32px;
    padding-right: 0;
  }
  .limits-column-title {
    align-items: center;
    color: #f8fafc;
    display: flex;
    font-size: 0.875rem;
    font-weight: 700;
    gap: 10px;
    margin: 0 0 18px;
  }
  .limits-column-title span {
    color: #74a9cf;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  .limits ul {
    color: #b8c5d6;
    display: grid;
    font-size: 0.9375rem;
    gap: 14px;
    line-height: 1.6;
    margin: 0;
    padding-left: 18px;
  }
  .limits li::marker {
    color: #74a9cf;
  }
  .limits-decision {
    align-items: baseline;
    display: grid;
    gap: 16px;
    grid-template-columns: minmax(140px, 0.55fr) minmax(0, 1.45fr);
    padding-top: 28px;
  }
  .limits-decision p {
    margin: 0;
  }
  .limits-decision-label {
    color: #74a9cf;
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .limits-decision p:last-child {
    color: #f8fafc;
    font-size: clamp(1rem, 1.8vw, 1.25rem);
    font-weight: 650;
    line-height: 1.5;
  }
  .limits-decision p:last-child span {
    color: #74a9cf;
    padding-inline: 4px;
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
      max-height: none;
      overflow: visible;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
    }
    .toc-title {
      width: 100%;
      margin-bottom: 4px;
    }
    .toc a {
      background: var(--eq-surface-subtle);
      border-left: none;
      border-radius: var(--eq-radius-sm);
      display: inline-flex;
      align-content: center;
      margin: 0;
      padding: 6px 12px;
    }
    .toc a:hover {
      background: var(--eq-border);
    }
    .toc a[aria-current='location'] {
      background-color: var(--eq-primary-tint);
      color: var(--eq-primary);
    }
    .example,
    .state-grid {
      grid-template-columns: 1fr;
    }
    .glossary div {
      gap: 6px;
      grid-template-columns: 1fr;
    }
    .limits-heading {
      grid-template-columns: 1fr;
    }
    .limits-number {
      font-size: 2.5rem;
    }
    .limits-boundary {
      grid-template-columns: 1fr;
    }
    .limits-column {
      padding: 24px 0;
    }
    .limits-column + .limits-column {
      border-left: 0;
      border-top: 1px solid #2b3a4f;
      padding: 24px 0;
    }
    .limits-decision {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .status-table div,
    .method-points li {
      gap: 6px;
      grid-template-columns: 1fr;
    }
  }
</style>
