<script lang="ts">
  import PublicShell from '#lib/components/PublicShell.svelte';
  import AvailabilityNotice from '#lib/components/AvailabilityNotice.svelte';
  import EducationScene from '#lib/components/EducationScene.svelte';

  let view = $state<'access' | 'allocation'>('access');
  const facilities = [
    { name: 'Sanitasi dasar', measure: 'Persentase sekolah dengan akses', note: 'Bandingkan pada tahun dan jenjang yang sama.' },
    { name: 'Air minum layak', measure: 'Persentase sekolah dengan akses', note: 'Periksa definisi akses dan cakupan wilayah.' },
    { name: 'Internet pengajaran', measure: 'Jumlah sekolah dengan akses', note: 'Perlu denominator setara untuk membaca proporsi.' },
    { name: 'Komputer pengajaran', measure: 'Jumlah sekolah dengan akses', note: 'Jumlah sekolah bukan jumlah perangkat.' }
  ];
  const sources = [
    { name: 'Sanitasi dasar', unit: 'Persentase', slug: 'persentase-sekolah-dengan-akses-terhadap-fasilitas-sanitasi-dasar-2025-indonesia' },
    { name: 'Air minum layak', unit: 'Persentase', slug: 'persentase-sekolah-dengan-akses-terhadap-air-minum-layak-2025' },
    { name: 'Internet pengajaran', unit: 'Jumlah sekolah', slug: 'jumlah-sekolah-dengan-akses-internet-untuk-pengajaran-2025-2' },
    { name: 'Komputer pengajaran', unit: 'Jumlah sekolah', slug: 'jumlah-sekolah-dengan-akses-komputer-untuk-pengajaran-2025-2' }
  ];
</script>

<svelte:head>
  <title>Equora | Akses pendidikan, prioritas yang dapat dijelaskan</title>
  <meta name="description" content="Kenali Equora: perbandingan akses fasilitas pendidikan dari data publik dan simulasi alokasi sumber daya dengan sumber, asumsi, dan batasan yang terbuka." />
</svelte:head>

<PublicShell links={[
  { label: 'Alur analisis', href: '#alur' },
  { label: 'Sumber data', href: '#sumber' },
  { label: 'Metode & batasan', href: '#metode' },
  { label: 'Tentang Equora', href: '/about' }
]}>
  <div class="hero-backdrop">
  <section class="eq-container hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eq-kicker">Data publik untuk pendidikan</p>
      <h1 id="hero-title">Beda wilayah,<br /><span>beda kebutuhan.</span></h1>
      <p class="intro">Dari air minum hingga akses digital, setiap wilayah punya konteksnya. Kenali kesenjangan fasilitas pendidikan dan pahami dasar pilihan alokasinya.</p>
      <div class="actions">
        <a class="eq-button eq-button-primary hero-primary" href="#pratinjau">Lihat alur perbandingan <span aria-hidden="true">↗</span></a>
        <a class="eq-button" href="#metode">Pahami cara simulasi</a>
      </div>
      <p class="hero-note"><span class="development-label">Dalam pengembangan</span><br />Simulasi, bukan keputusan anggaran resmi.</p>
    </div>
    <figure class="education-visual">
      <div class="education-scene"><EducationScene /></div>
    </figure>
  </section>
  </div>

  <section id="pratinjau" class="eq-container preview" aria-labelledby="preview-title">
    <div class="preview-header">
      <div><p class="eq-kicker">Kenali ruang kerjanya</p><h2 id="preview-title">Apa yang ingin Anda pahami?</h2></div>
      <p class="preview-caption">Pratinjau penjelasan<br />Tanpa data atau hasil simulasi</p>
    </div>
    <div class="view-switch" role="group" aria-label="Pilih penjelasan">
      <button aria-pressed={view === 'access'} onclick={() => view = 'access'}>Perbandingan akses</button>
      <button aria-pressed={view === 'allocation'} onclick={() => view = 'allocation'}>Simulasi alokasi</button>
    </div>
    {#if view === 'access'}
      <div class="preview-body">
        <div class="preview-context">
          <span class="step-label">01 / Baca kebutuhan</span>
          <h3>Bandingkan hal<br />yang setara.</h3>
          <p>Sanitasi, air minum, internet, dan komputer memberi sudut pandang berbeda. Periode, jenjang, dan satuan menentukan apakah nilainya bisa dibandingkan.</p>
          <p class="availability">Explorer belum tersedia.<br />Menunggu release data terverifikasi.</p>
        </div>
        <div class="facility-list">
          {#each facilities as facility}
            <div class="facility-row"><div><h3>{facility.name}</h3><p>{facility.measure}</p></div><p>{facility.note}</p></div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="preview-body">
        <div class="preview-context">
          <span class="step-label">02 / Uji pilihan</span>
          <h3>Satu anggaran.<br />Pilihan yang berbeda.</h3>
          <p>Ubah bobot kebutuhan, biaya per paket, kapasitas, dan batas pemerataan. Bandingkan alokasi serta trade-off pada data yang sama.</p>
          <p class="availability">Studio skenario belum tersedia.<br />Model biaya dan kendala belum dibekukan.</p>
        </div>
        <div class="allocation-explainer">
          <dl>
            <div><dt>Masukan</dt><dd>Release data, bobot, anggaran, biaya, kapasitas, dan kendala pemerataan.</dd></div>
            <div><dt>Hasil yang direncanakan</dt><dd>Alokasi paket per wilayah, anggaran terpakai, sisa anggaran, dan alasan prioritas.</dd></div>
            <div><dt>Selalu diperlihatkan</dt><dd>Asumsi biaya, versi metode, batasan data, serta status kelayakan solusi.</dd></div>
          </dl>
          <a href="#metode">Baca batas penggunaan simulasi</a>
        </div>
      </div>
    {/if}
  </section>

  <section id="alur" class="eq-container workflow" aria-labelledby="workflow-title">
    <div class="section-heading"><p class="eq-kicker">Alur yang dirancang</p><h2 id="workflow-title">Data → prioritas → skenario.</h2><p>Bukan sekadar peringkat. Setiap pilihan harus bisa ditelusuri kembali.</p></div>
    <ol>
      <li><span class="step-label">01</span><h3>Telusuri data</h3><p>Pilih wilayah, tahun, dan jenjang. Periksa definisi indikator serta sumbernya sebelum membandingkan.</p></li>
      <li><span class="step-label">02</span><h3>Susun prioritas</h3><p>Tentukan bobot kebutuhan. Lihat kontribusi setiap indikator, termasuk wilayah yang tidak memiliki data lengkap.</p></li>
      <li><span class="step-label">03</span><h3>Bandingkan skenario</h3><p>Uji anggaran dan kendala yang berbeda. Baca perubahan alokasi, sisa anggaran, dan trade-off secara berdampingan.</p></li>
    </ol>
  </section>

  <section id="sumber" class="sources-section" aria-labelledby="sources-title">
    <div class="eq-container sources-layout">
      <div class="source-intro"><p class="eq-kicker">Sumber sebelum kesimpulan</p><h2 id="sources-title">Nilai yang bisa<br />ditelusuri asalnya.</h2><p>Calon sumber dari portal data Kemendikdasmen. Tautan ini menuju halaman penerbit, bukan dataset yang sudah dirilis oleh Equora.</p><AvailabilityNotice title="Belum ada release data"><p>File, lisensi, cakupan, dan kesesuaian antarindikator masih perlu diaudit. Belum ada statistik resmi yang ditampilkan di Equora.</p></AvailabilityNotice></div>
      <div class="source-list">
        {#each sources as source}
          <a class="source-row" href={`https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/${source.slug}`}>
            <div><h3>{source.name}</h3><p>Kemendikdasmen · Periode pada judul sumber: 2025</p><p>{source.unit} · Belum diaudit Equora</p></div>
            <span class="source-link-label">Lihat sumber <span aria-hidden="true">↗</span></span>
          </a>
        {/each}
        <p class="source-footnote">Tahun ajaran, waktu pengambilan, unit, dan versi akan dicatat pada release. Data tahunan tidak disebut real-time.</p>
      </div>
    </div>
  </section>

  <section id="metode" class="eq-container method" aria-labelledby="method-title">
    <div class="section-heading"><p class="eq-kicker">Transparansi metode</p><h2 id="method-title">Pahami alasan.<br />Kenali batasannya.</h2><p>Metode dan parameter adalah bagian dari hasil, bukan catatan tersembunyi.</p></div>
    <div class="method-details">
      <details open><summary>Bagaimana prioritas disusun?</summary><p>Rancangan metode memakai MCDA: indikator kebutuhan distandardisasi, lalu digabung dengan bobot nonnegatif yang berjumlah 100%. Nilai lebih tinggi berarti kebutuhan relatif lebih tinggi. Kontribusi indikator harus dapat diperiksa; pilihan normalisasi final menunggu audit data.</p></details>
      <details><summary>Bagaimana data kosong diperlakukan?</summary><p>Nilai hilang bukan nol. Kebijakan awal yang direncanakan adalah mengeluarkan wilayah dengan data yang tidak lengkap dari perhitungan terkait dan melaporkan cakupannya. Perbandingan hanya memakai periode, jenjang, dan satuan yang setara.</p></details>
      <details><summary>Apa arti hasil alokasi?</summary><p>Hasil yang direncanakan berupa jumlah paket dan penggunaan anggaran berdasarkan biaya, kapasitas, serta kendala yang dipilih. Biaya referensi resmi dibedakan dari asumsi demo. Paket bukan bukti jumlah sekolah yang pasti tertolong atau prediksi dampak nyata.</p></details>
      <details><summary>Apakah semua skenario memiliki solusi?</summary><p>Tidak selalu. Anggaran dan kendala dapat saling bertentangan. Studio harus menjelaskan skenario yang terbukti tidak layak; proses yang berhenti tanpa solusi tidak otomatis berarti tidak layak. Solver final serta benchmark belum ditetapkan.</p></details>
      <AvailabilityNotice title="Batas penggunaan"><p>Equora mendukung eksplorasi dan pembelajaran. Simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi pemerintah atau pengganti kajian lapangan.</p></AvailabilityNotice>
    </div>
  </section>
</PublicShell>

<style>
  .hero-backdrop { position: relative; isolation: isolate; background: linear-gradient(110deg, var(--eq-surface) 30%, var(--eq-primary-tint) 100%); margin-bottom: 40px; }
  .hero-backdrop::before { content: ''; position: absolute; inset: 0; z-index: -1; border-bottom: 1px solid var(--eq-border); border-radius: 0 0 80px 0; pointer-events: none; }
  .hero { display: grid; grid-template-columns: 1.05fr 1fr; align-items: center; gap: 32px; padding-block: 56px 72px; }
  .hero-copy > .eq-kicker { margin-bottom: 24px; color: var(--eq-primary-hover); }
  h1 { font-size: clamp(2.6rem, 5vw, 4.5rem); line-height: 1.06; letter-spacing: -0.055em; }
  h1 span { color: var(--eq-primary-hover); }
  .intro { max-width: 500px; margin-top: 24px; color: var(--eq-text-secondary); font-size: 18px; line-height: 1.7; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
  .hero-primary { box-shadow: 0 4px 0 var(--eq-primary-hover); gap: 16px; transition: transform 160ms ease, box-shadow 160ms ease; }
  .hero-primary span { font-size: 20px; }
  .hero-primary:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--eq-primary-hover); }
  .hero-note { margin-top: 24px; font-size: 13px; line-height: 1.8; color: var(--eq-text-secondary); }
  .development-label { font-weight: 600; }
  .education-visual { min-width: 0; margin: 0; }
  .education-scene { width: 100%; }
  @media (prefers-reduced-motion: reduce) { .hero-primary:active { transform: none; } }
  dl { margin: 0; }
  dt { font-weight: 600; }
  dd { margin: 0; color: var(--eq-text-secondary); }
  .preview { border: 1px solid var(--eq-border); border-radius: var(--eq-radius-lg); background: var(--eq-surface-elevated); }
  .preview-header { padding: 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .preview-header h2 { margin-top: 8px; font-size: clamp(1.5rem, 2.5vw, 2rem); }
  .preview-caption { font-size: 13px; color: var(--eq-text-secondary); text-align: right; }
  .view-switch { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 32px 24px; border-bottom: 1px solid var(--eq-border); }
  .view-switch button { padding: 10px 16px; min-height: 44px; font-size: 14px; font-weight: 600; border: 1px solid transparent; border-radius: var(--eq-radius-sm); color: var(--eq-text-secondary); }
  .view-switch button:hover { background: var(--eq-surface-subtle); }
  .view-switch button[aria-pressed='true'] { background: var(--eq-primary-tint); color: var(--eq-primary-hover); border-color: var(--eq-primary-tint); }
  .view-switch button:active { border-color: var(--eq-primary); }
  .preview-body { display: grid; grid-template-columns: 0.85fr 1.7fr; min-height: 382px; }
  .preview-context { padding: 32px; background: var(--eq-surface-subtle); border-radius: 0 0 0 var(--eq-radius-lg); border-right: 1px solid var(--eq-border); }
  .step-label { display: block; font-size: 13px; font-weight: 600; color: var(--eq-text-secondary); }
  .preview-context h3 { margin-block: 20px 16px; font-size: 26px; }
  .preview-context p { font-size: 14px; color: var(--eq-text-secondary); }
  .preview-context .availability { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--eq-border); font-size: 13px; }
  .facility-list { padding-inline: 32px; }
  .facility-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-block: 24px; border-bottom: 1px solid var(--eq-border); }
  .facility-row:last-child { border-bottom: 0; }
  .facility-row h3 { font-size: 16px; margin-bottom: 6px; }
  .facility-row p { font-size: 13px; color: var(--eq-text-secondary); }
  .allocation-explainer { padding: 8px 32px 24px; }
  .allocation-explainer dl div { padding-block: 20px; border-bottom: 1px solid var(--eq-border); }
  .allocation-explainer dt { font-size: 14px; margin-bottom: 6px; }
  .allocation-explainer dd { font-size: 14px; }
  .allocation-explainer a { display: inline-flex; align-items: center; min-height: 44px; margin-top: 16px; font-size: 14px; }
  .workflow { padding-block: 96px; }
  .section-heading > p:last-child { margin-top: 20px; max-width: 370px; color: var(--eq-text-secondary); }
  .section-heading h2 { margin-top: 16px; }
  ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; margin: 40px 0 0; padding: 0; list-style: none; }
  li { padding-top: 20px; border-top: 1px solid var(--eq-border); }
  li h3 { margin-block: 24px 12px; }
  li p { color: var(--eq-text-secondary); font-size: 14px; }
  .sources-section { padding-block: 64px; background: var(--eq-surface-subtle); border-block: 1px solid var(--eq-border); }
  .sources-layout { display: grid; grid-template-columns: 1fr 1.35fr; gap: 80px; }
  .source-intro h2 { margin-block: 16px 24px; }
  .source-intro > p:not(.eq-kicker) { color: var(--eq-text-secondary); margin-bottom: 32px; }
  .source-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-block: 24px; border-bottom: 1px solid var(--eq-border); text-decoration: none; }
  .source-row:first-child { padding-top: 0; }
  .source-row h3 { font-size: 16px; margin-bottom: 8px; }
  .source-row p, .source-link-label, .source-footnote { font-size: 13px; color: var(--eq-text-secondary); }
  .source-link-label { flex-shrink: 0; text-decoration: underline; text-underline-offset: 4px; }
  .source-row:hover h3 { text-decoration: underline; text-underline-offset: 4px; }
  .source-footnote { margin-top: 24px; }
  .method { display: grid; grid-template-columns: 1fr 1.35fr; gap: 80px; padding-block: 96px; }
  .method-details details { border-top: 1px solid var(--eq-border); }
  .method-details summary { padding-block: 20px; font-weight: 600; cursor: pointer; }
  .method-details summary:hover { color: var(--eq-primary-hover); }
  .method-details details p { color: var(--eq-text-secondary); font-size: 14px; padding-bottom: 24px; }
  .method-details :global(aside) { margin-top: 24px; }
  @media (max-width: 1023px) {
    .hero { gap: 32px; padding-block: 40px 64px; }
    .hero .intro { font-size: 16px; }
    .sources-layout, .method { gap: 40px; }
    .preview-body { grid-template-columns: 1fr 1.4fr; }
    .facility-row { grid-template-columns: 1fr; gap: 8px; }
    ol { gap: 24px; }
  }
  @media (max-width: 767px) {
    .hero-backdrop { background: linear-gradient(180deg, var(--eq-surface) 35%, var(--eq-primary-tint) 100%); margin-bottom: 32px; }
    .hero { grid-template-columns: 1fr; gap: 32px; padding-top: 24px; }
    h1 { max-width: 620px; }
    .education-visual { width: min(100%, 520px); justify-self: center; }
    .preview-header { align-items: flex-start; flex-direction: column; gap: 12px; padding: 24px; }
    .preview-caption { text-align: left; }
    .preview-caption br { display: none; }
    .view-switch { padding-inline: 24px; }
    .preview-body { grid-template-columns: 1fr; }
    .preview-context { padding: 24px; border-right: 0; border-bottom: 1px solid var(--eq-border); border-radius: 0; }
    .preview-context h3 br { display: none; }
    .facility-list { padding-inline: 24px; }
    .facility-row { grid-template-columns: 1fr 1fr; gap: 24px; }
    .workflow { padding-block: 64px; }
    ol { grid-template-columns: 1fr; gap: 24px; margin-top: 32px; }
    li h3 { margin-block: 12px; }
    .sources-layout, .method { grid-template-columns: 1fr; gap: 32px; }
    .sources-section { padding-block: 40px; }
    .method { padding-block: 64px; }
  }
  @media (max-width: 479px) {
    .actions { flex-direction: column; align-items: stretch; }
    .view-switch { flex-direction: column; align-items: stretch; }
    .facility-row { grid-template-columns: 1fr; gap: 8px; }
    .source-row { align-items: flex-start; flex-direction: column; gap: 8px; }
    .source-link-label { display: inline-flex; align-items: center; min-height: 44px; }
  }
</style>
