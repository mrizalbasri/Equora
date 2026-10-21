<script lang="ts">
  import PublicShell from '#lib/components/PublicShell.svelte';
  import AvailabilityNotice from '#lib/components/AvailabilityNotice.svelte';
  import EducationScene from '#lib/components/EducationScene.svelte';

  let view = $state<'access' | 'allocation'>('access');
  let heroPreviewTab = $state<'access' | 'allocation'>('access');

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
      <!-- Centered Header Copy -->
      <div class="hero-header">
        <h1 id="hero-title">Beda wilayah,<br /><span>beda kebutuhan.</span></h1>
        <p class="intro">Dari air minum hingga akses digital, setiap wilayah punya konteksnya. Kenali kesenjangan fasilitas pendidikan dan pahami dasar pilihan alokasinya.</p>
        <div class="actions">
          <a class="eq-button eq-button-primary hero-primary" href="/explore">Buka Explorer <span class="hero-arrow" aria-hidden="true">↓</span></a>
          <a class="eq-button hero-secondary" href="#metode">Pahami cara simulasi</a>
        </div>
        <p class="hero-note"><span class="development-label">Dalam pengembangan</span><br />Simulasi, bukan keputusan anggaran resmi.</p>
      </div>

      <!-- Outcrowd-inspired Interactive Product Showcase -->
      <div class="hero-showcase">
        <!-- Floating Accent Badges -->
        <div class="floating-badge badge-left" aria-hidden="true">
          <div class="badge-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div class="badge-content">
            <span class="badge-heading">Audit Kesenjangan</span>
            <span class="badge-caption">Air, Sanitasi & Akses Digital</span>
          </div>
        </div>

        <div class="floating-badge badge-right" aria-hidden="true">
          <div class="badge-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
              <path d="M7 21h10"></path>
              <path d="M12 3v18"></path>
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
            </svg>
          </div>
          <div class="badge-content">
            <span class="badge-heading">Simulasi Multi-Kriteria</span>
            <span class="badge-caption">Bobot Terbuka (MCDA)</span>
          </div>
        </div>

        <!-- The App Window -->
        <div class="preview-window">
          <!-- Window Header (Browser Chrome Style) -->
          <div class="window-header">
            <div class="window-controls" aria-hidden="true">
              <span class="win-dot dot-close"></span>
              <span class="win-dot dot-min"></span>
              <span class="win-dot dot-max"></span>
            </div>
            <div class="window-url">
              <span class="url-lock" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <span class="url-text">Equora <em>/ contoh antarmuka</em></span>
            </div>
            <div class="window-tag">
              <span>Belum ada release data</span>
            </div>
          </div>

          <!-- Window Toolbar with Interactive Tabs -->
          <div class="window-toolbar">
            <div class="toolbar-tabs" role="group" aria-label="Pilih mode pratinjau antarmuka">
              <button
                type="button"
                class="tb-btn"
                class:active={heroPreviewTab === 'access'}
                aria-pressed={heroPreviewTab === 'access'}
                onclick={() => heroPreviewTab = 'access'}
              >
                <span class="tb-dot" aria-hidden="true"></span>
                Perbandingan Akses
              </button>
              <button
                type="button"
                class="tb-btn"
                class:active={heroPreviewTab === 'allocation'}
                aria-pressed={heroPreviewTab === 'allocation'}
                onclick={() => heroPreviewTab = 'allocation'}
              >
                <span class="tb-dot" aria-hidden="true"></span>
                Simulasi Alokasi
              </button>
            </div>
            <div class="toolbar-meta">
              <span class="live-indicator" aria-hidden="true"></span>
              <span class="live-text">Contoh antarmuka</span>
            </div>
          </div>

          <!-- Window Body Content -->
          <div class="window-body">
            <p class="preview-disclaimer">Contoh antarmuka · belum terhubung data atau engine</p>
            {#if heroPreviewTab === 'access'}
              <div class="preview-split">
                <!-- Left: Metrics with animated bars -->
                <div class="preview-metrics">
                  <div class="metrics-header">
                    <h3>Indikator Fasilitas Sekolah</h3>
                    <p>Nilai akses menunggu release data terverifikasi.</p>
                  </div>

                  <div class="metrics-list">
                    <div class="metric-row">
                      <div class="metric-top">
                        <span class="metric-title">Sanitasi Dasar</span>
                        <span class="metric-val">Belum tersedia</span>
                      </div>
                      <div class="progress-track">
                        <div class="progress-bar bar-blue" style="--target-width: 0%;"></div>
                      </div>
                    </div>

                    <div class="metric-row">
                      <div class="metric-top">
                        <span class="metric-title">Air Minum Layak</span>
                        <span class="metric-val">Belum tersedia</span>
                      </div>
                      <div class="progress-track">
                        <div class="progress-bar bar-teal" style="--target-width: 0%;"></div>
                      </div>
                    </div>

                    <div class="metric-row">
                      <div class="metric-top">
                        <span class="metric-title">Internet Pengajaran</span>
                        <span class="metric-val">Perlu denominator</span>
                      </div>
                      <div class="progress-track">
                        <div class="progress-bar bar-indigo" style="--target-width: 0%;"></div>
                      </div>
                    </div>

                    <div class="metric-row">
                      <div class="metric-top">
                        <span class="metric-title">Komputer Pengajaran</span>
                        <span class="metric-val">Perlu denominator</span>
                      </div>
                      <div class="progress-track">
                        <div class="progress-bar bar-purple" style="--target-width: 0%;"></div>
                      </div>
                    </div>
                  </div>

                  <div class="preview-insight">
                    <span class="insight-pill">Status data</span>
                    <span class="insight-text">Belum ada temuan wilayah. Sumber internet dan komputer berupa jumlah sekolah, bukan persentase akses.</span>
                  </div>
                </div>

                <!-- Right: Education Illustration -->
                <figure class="preview-visual" aria-label="Visualisasi lingkungan fasilitas sekolah">
                  <div class="visual-canvas">
                    <EducationScene />
                  </div>
                </figure>
              </div>
            {:else}
              <div class="preview-split allocation-mode">
                <div class="allocation-showcase">
                  <div class="metrics-header">
                    <h3>Contoh tampilan simulasi alokasi</h3>
                    <p>Input dan integrasi solver belum tersedia pada pratinjau ini.</p>
                  </div>

                  <div class="alloc-cards-grid">
                    <div class="alloc-card">
                      <span class="alloc-card-label">Paket Teralokasi</span>
                      <span class="alloc-card-number">Belum dihitung</span>
                      <span class="alloc-card-sub">Menunggu input dan integrasi engine</span>
                    </div>

                    <div class="alloc-card">
                      <span class="alloc-card-label">Penggunaan Anggaran</span>
                      <span class="alloc-card-number">Belum dihitung</span>
                      <span class="alloc-card-sub">Penggunaan anggaran bukan ukuran dampak</span>
                    </div>

                    <div class="alloc-card">
                      <span class="alloc-card-label">Metode Pembobotan</span>
                      <span class="alloc-card-number">MCDA</span>
                      <span class="alloc-card-sub">Sandbox sintetis, belum terhubung UI</span>
                    </div>
                  </div>

                  <div class="alloc-weights-box">
                    <span class="weights-title">Contoh bobot tampilan · asumsi ilustratif, tidak digunakan engine</span>
                    <div class="weights-bar">
                      <div class="w-segment w-sanitasi" style="width: 35%;"><span>Sanitasi 35%</span></div>
                      <div class="w-segment w-digital" style="width: 45%;"><span>Digital 45%</span></div>
                      <div class="w-segment w-air" style="width: 20%;"><span>Air 20%</span></div>
                    </div>
                  </div>

                  <div class="preview-insight">
                    <span class="insight-pill">Status Model</span>
                    <span class="insight-text">Belum ada hasil solver. Biaya, kapasitas, dan kendala pemerataan belum ditetapkan.</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </section>
  </div>

  <section id="pratinjau" class="eq-container preview" aria-labelledby="preview-title">
    <div class="preview-header">
      <div><p class="eq-kicker">Kenali ruang kerjanya</p><h2 id="preview-title">Apa yang ingin Anda pahami?</h2></div>
      <p class="preview-caption">Pratinjau penjelasan <span class="break-desktop"><br /></span>Tanpa data atau hasil simulasi</p>
    </div>
    <div class="view-switch" role="group" aria-label="Pilih penjelasan">
      <button aria-pressed={view === 'access'} onclick={() => view = 'access'}>Perbandingan akses</button>
      <button aria-pressed={view === 'allocation'} onclick={() => view = 'allocation'}>Simulasi alokasi</button>
    </div>
    {#if view === 'access'}
      <div class="preview-body">
        <div class="preview-context">
          <span class="step-label">01 / Baca kebutuhan</span>
          <h3>Bandingkan hal <span class="break-desktop"><br /></span>yang setara.</h3>
          <p>Sanitasi, air minum, internet, dan komputer memberi sudut pandang berbeda. Periode, jenjang, dan satuan menentukan apakah nilainya bisa dibandingkan.</p>
          <p class="availability">Explorer lokal tersedia.<br /><a href="/explore">Telusuri data 38 provinsi →</a></p>
        </div>
        <div class="facility-list">
          {#each facilities as facility}
            <div class="facility-row">
              <div>
                <h3>{facility.name}</h3>
                <p>{facility.measure}</p>
              </div>
              <p>{facility.note}</p>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="preview-body">
        <div class="preview-context">
          <span class="step-label">02 / Uji pilihan</span>
          <h3>Satu anggaran. <span class="break-desktop"><br /></span>Pilihan yang berbeda.</h3>
          <p>Ubah bobot kebutuhan, biaya per paket, kapasitas, dan batas pemerataan. Bandingkan alokasi serta trade-off pada data yang sama.</p>
          <p class="availability">Studio lokal tersedia.<br /><a href="/studio">Hitung dan bandingkan skenario →</a></p>
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
    <div class="section-heading">
      <p class="eq-kicker">Alur yang dirancang</p>
      <h2 id="workflow-title">Data → prioritas → skenario.</h2>
      <p>Bukan sekadar peringkat. Setiap pilihan harus bisa ditelusuri kembali.</p>
    </div>
    <ol>
      <li>
        <span class="step-label">01</span>
        <h3>Telusuri data</h3>
        <p>Pilih wilayah, tahun, dan jenjang. Periksa definisi indikator serta sumbernya sebelum membandingkan.</p>
      </li>
      <li>
        <span class="step-label">02</span>
        <h3>Susun prioritas</h3>
        <p>Tentukan bobot kebutuhan. Lihat kontribusi setiap indikator, termasuk wilayah yang tidak memiliki data lengkap.</p>
      </li>
      <li>
        <span class="step-label">03</span>
        <h3>Bandingkan skenario</h3>
        <p>Uji anggaran dan kendala yang berbeda. Baca perubahan alokasi, sisa anggaran, dan trade-off secara berdampingan.</p>
      </li>
    </ol>
  </section>

  <section id="sumber" class="sources-section" aria-labelledby="sources-title">
    <div class="eq-container sources-layout">
      <div class="source-intro">
        <p class="eq-kicker">Sumber sebelum kesimpulan</p>
        <h2 id="sources-title">Nilai yang bisa<br />ditelusuri asalnya.</h2>
        <p>Empat indikator inti dari portal data Kemendikdasmen. Tautan ini menuju halaman penerbit; definisi, hash, dan kualitas berkas tersedia pada katalog lokal.</p>
        <AvailabilityNotice title="Data tersedia untuk review lokal">
          <p>Sepuluh berkas pengguna telah diperiksa. Tanggal unduh dan lisensi redistribusi belum terverifikasi; data ini belum menjadi release publik Equora.</p>
        </AvailabilityNotice>
      </div>
      <div class="source-list">
        {#each sources as source}
          <a class="source-row" href={`https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/${source.slug}`}>
            <div>
              <h3>{source.name}</h3>
              <p>Kemendikdasmen · Periode pada judul sumber: 2025</p>
              <p>{source.unit} · Belum diaudit Equora</p>
            </div>
            <span class="source-link-label">Lihat sumber <span aria-hidden="true">↗</span></span>
          </a>
        {/each}
        <p class="source-footnote">Tahun ajaran, waktu pengambilan, unit, dan versi akan dicatat pada release. Data tahunan tidak disebut real-time.</p>
      </div>
    </div>
  </section>

  <section id="metode" class="eq-container method" aria-labelledby="method-title">
    <div class="section-heading">
      <p class="eq-kicker">Transparansi metode</p>
      <h2 id="method-title">Pahami alasan.<br />Kenali batasannya.</h2>
      <p>Metode dan parameter adalah bagian dari hasil, bukan catatan tersembunyi.</p>
    </div>
    <div class="method-details">
      <details open>
        <summary>Bagaimana prioritas disusun?</summary>
        <p>Rancangan metode memakai MCDA: indikator kebutuhan distandardisasi, lalu digabung dengan bobot nonnegatif yang berjumlah 100%. Nilai lebih tinggi berarti kebutuhan relatif lebih tinggi. Kontribusi indikator harus dapat diperiksa; pilihan normalisasi final menunggu audit data.</p>
      </details>
      <details>
        <summary>Bagaimana data kosong diperlakukan?</summary>
        <p>Nilai hilang bukan nol. Kebijakan awal yang direncanakan adalah mengeluarkan wilayah dengan data yang tidak lengkap dari perhitungan terkait dan melaporkan cakupannya. Perbandingan hanya memakai periode, jenjang, dan satuan yang setara.</p>
      </details>
      <details>
        <summary>Apa arti hasil alokasi?</summary>
        <p>Hasil yang direncanakan berupa jumlah paket dan penggunaan anggaran berdasarkan biaya, kapasitas, serta kendala yang dipilih. Biaya referensi resmi dibedakan dari asumsi demo. Paket bukan bukti jumlah sekolah yang pasti tertolong atau prediksi dampak nyata.</p>
      </details>
      <details>
        <summary>Apakah semua skenario memiliki solusi?</summary>
        <p>Tidak selalu. Anggaran dan kendala dapat saling bertentangan. Studio harus menjelaskan skenario yang terbukti tidak layak; proses yang berhenti tanpa solusi tidak otomatis berarti tidak layak. Studio lokal memakai OR-Tools CP-SAT dengan baseline merata dan greedy.</p>
      </details>
      <AvailabilityNotice title="Batas penggunaan">
        <p>Equora mendukung eksplorasi dan pembelajaran. Simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi pemerintah atau pengganti kajian lapangan.</p>
      </AvailabilityNotice>
    </div>
  </section>
</PublicShell>

<style>
  /* Base Hero Backdrop */
  .hero-backdrop {
    position: relative;
    background: radial-gradient(circle at 50% -20%, var(--eq-primary-tint) 0%, var(--eq-surface) 70%);
    border-bottom: 1px solid var(--eq-border);
    margin-bottom: 48px;
    overflow: hidden;
  }
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-block: 48px 64px;
    gap: 40px;
  }

  /* Hero Header & Typography */
  .hero-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 820px;
    margin-inline: auto;
  }
  h1 {
    font-size: clamp(2.6rem, 5.5vw, 4.6rem);
    line-height: 1.05;
    letter-spacing: -0.055em;
    color: var(--eq-text);
  }
  h1 span {
    color: var(--eq-primary);
  }
  .intro {
    max-width: 580px;
    margin-top: 20px;
    color: var(--eq-text-secondary);
    font-size: 18px;
    line-height: 1.65;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-top: 32px;
  }
  .hero-primary {
    box-shadow: 0 4px 14px rgb(18 100 216 / 25%);
    gap: 12px;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }
  .hero-primary:hover {
    box-shadow: 0 6px 20px rgb(18 100 216 / 35%);
  }
  .hero-primary:active {
    transform: translateY(2px);
  }
  .hero-arrow {
    font-size: 16px;
    transition: transform 160ms ease;
  }
  .hero-primary:hover .hero-arrow {
    transform: translateY(2px);
  }
  .hero-note {
    margin-top: 20px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--eq-text-secondary);
  }
  .development-label {
    font-weight: 600;
  }

  /* Interactive Product Showcase */
  .hero-showcase {
    position: relative;
    width: 100%;
    max-width: 1060px;
    margin-top: 8px;
  }

  /* Floating Accent Badges */
  .floating-badge {
    position: absolute;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-md);
    box-shadow: 0 12px 32px rgb(31 45 61 / 10%);
    pointer-events: none;
    transition: transform 200ms ease;
  }
  .badge-left {
    top: -24px;
    left: -20px;
    animation: floatBadgeA 5s ease-in-out infinite;
  }
  .badge-right {
    top: 40px;
    right: -24px;
    animation: floatBadgeB 6s ease-in-out infinite 1s;
  }
  .badge-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--eq-primary-tint);
    color: var(--eq-primary);
    border-radius: 10px;
  }
  .badge-content {
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .badge-heading {
    font-size: 13px;
    font-weight: 650;
    color: var(--eq-text);
  }
  .badge-caption {
    font-size: 11px;
    color: var(--eq-text-secondary);
  }

  /* App Window Chrome */
  .preview-window {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 20px;
    box-shadow: 0 20px 60px -15px rgb(18 100 216 / 12%), 0 0 0 1px rgb(220 228 238 / 60%);
    overflow: hidden;
    text-align: left;
  }
  .window-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 20px;
    background: var(--eq-surface-subtle);
    border-bottom: 1px solid var(--eq-border);
  }
  .window-controls {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .win-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  .dot-close { background: #ff5f56; }
  .dot-min { background: #ffbd2e; }
  .dot-max { background: #27c93f; }
  .window-url {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 16px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 8px;
    font-size: 12px;
    color: var(--eq-text-secondary);
  }
  .url-lock {
    display: inline-flex;
    align-items: center;
    color: var(--eq-text-muted);
  }
  .url-text { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .url-text em { font-style: normal; color: var(--eq-text-muted); }
  .window-tag {
    font-size: 11px;
    font-weight: 600;
    color: var(--eq-primary-hover);
    background: var(--eq-primary-tint);
    padding: 4px 10px;
    border-radius: 6px;
  }

  /* Window Toolbar */
  .window-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid var(--eq-border);
    background: var(--eq-surface);
  }
  .toolbar-tabs {
    display: flex;
    gap: 8px;
  }
  .tb-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    color: var(--eq-text-secondary);
    transition: all 160ms ease;
  }
  .tb-btn:hover {
    background: var(--eq-surface-subtle);
    color: var(--eq-text);
  }
  .tb-btn.active {
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    border-color: rgba(18, 100, 216, 0.2);
  }
  .tb-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.6;
  }
  .toolbar-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 550;
    color: var(--eq-text-secondary);
  }
  .live-indicator {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--eq-text-muted);
  }

  /* Window Body & Panels */
  .window-body {
    padding: 24px;
    background: #fafcff;
  }
  .preview-disclaimer {
    margin-bottom: 16px;
    color: var(--eq-text-secondary);
    font-size: 13px;
  }
  .preview-split {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 24px;
    align-items: center;
  }
  .preview-metrics {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 16px;
    padding: 24px;
  }
  .metrics-header h3 {
    font-size: 17px;
    margin-bottom: 4px;
  }
  .metrics-header p {
    font-size: 13px;
    color: var(--eq-text-secondary);
  }
  .metrics-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .metric-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .metric-top {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 600;
  }
  .metric-val {
    color: var(--eq-primary-hover);
    font-feature-settings: "tnum";
  }
  .progress-track {
    width: 100%;
    height: 8px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: 999px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    border-radius: 999px;
    width: var(--target-width);
    animation: growBar 800ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }
  .bar-blue { background: #1264d8; }
  .bar-teal { background: #246f56; }
  .bar-indigo { background: #3979ab; }
  .bar-purple { background: #6366f1; }

  .preview-insight {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--eq-surface-subtle);
    border-radius: 10px;
    font-size: 12px;
  }
  .insight-pill {
    padding: 3px 8px;
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    font-weight: 650;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .insight-text {
    color: var(--eq-text-secondary);
  }

  /* Right Visual */
  .preview-visual {
    margin: 0;
    padding: 16px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .visual-canvas {
    width: 100%;
    max-width: 360px;
  }

  /* Allocation Mode View */
  .allocation-mode {
    grid-template-columns: 1fr;
  }
  .allocation-showcase {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 16px;
    padding: 24px;
  }
  .alloc-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .alloc-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
  }
  .alloc-card-label {
    font-size: 12px;
    color: var(--eq-text-secondary);
    margin-bottom: 6px;
  }
  .alloc-card-number {
    font-size: 24px;
    font-weight: 700;
    color: var(--eq-text);
  }
  .alloc-card-sub {
    font-size: 11px;
    color: var(--eq-text-muted);
    margin-top: 4px;
  }
  .alloc-weights-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background: var(--eq-surface-subtle);
    border-radius: 12px;
    border: 1px solid var(--eq-border);
  }
  .weights-title {
    font-size: 13px;
    font-weight: 600;
  }
  .weights-bar {
    display: flex;
    height: 28px;
    border-radius: 8px;
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    color: white;
  }
  .w-segment {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 300ms ease;
  }
  .w-sanitasi { background: #1264d8; }
  .w-digital { background: #3979ab; }
  .w-air { background: #246f56; }

  /* Keyframe Animations */
  @keyframes floatBadgeA {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }
  @keyframes floatBadgeB {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes growBar {
    from { width: 0; }
    to { width: var(--target-width); }
  }

  /* Section Pratinjau */
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

  /* Section Workflow */
  .workflow { padding-block: 96px; }
  .section-heading > p:last-child { margin-top: 20px; max-width: 370px; color: var(--eq-text-secondary); }
  .section-heading h2 { margin-top: 16px; }
  ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; margin: 40px 0 0; padding: 0; list-style: none; }
  li { padding: 24px; border-top: 1px solid var(--eq-border); border-radius: var(--eq-radius-sm); transition: transform 200ms ease, background 200ms ease, box-shadow 200ms ease; }
  li:hover { transform: translateY(-3px); background: var(--eq-surface-subtle); box-shadow: 0 8px 24px rgb(18 100 216 / 4%); }
  li h3 { margin-block: 20px 12px; }
  li p { color: var(--eq-text-secondary); font-size: 14px; }

  /* Section Sources */
  .sources-section { padding-block: 64px; background: var(--eq-surface-subtle); border-block: 1px solid var(--eq-border); }
  .sources-layout { display: grid; grid-template-columns: 1fr 1.35fr; gap: 80px; }
  .source-intro h2 { margin-block: 16px 24px; }
  .source-intro > p:not(.eq-kicker) { color: var(--eq-text-secondary); margin-bottom: 32px; }
  .source-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 20px 24px; border-radius: var(--eq-radius-sm); border-bottom: 1px solid var(--eq-border); text-decoration: none; transition: background 160ms ease, transform 160ms ease; }
  .source-row:first-child { padding-top: 20px; }
  .source-row:hover { background: var(--eq-surface); transform: translateX(3px); }
  .source-row h3 { font-size: 16px; margin-bottom: 8px; }
  .source-row p, .source-link-label, .source-footnote { font-size: 13px; color: var(--eq-text-secondary); }
  .source-link-label { flex-shrink: 0; text-decoration: underline; text-underline-offset: 4px; }
  .source-row:hover h3 { text-decoration: underline; text-underline-offset: 4px; }
  .source-footnote { margin-top: 24px; }

  /* Section Method */
  .method { display: grid; grid-template-columns: 1fr 1.35fr; gap: 80px; padding-block: 96px; }
  .method-details details { border-top: 1px solid var(--eq-border); }
  .method-details summary { display: flex; align-items: center; justify-content: space-between; padding-block: 20px; font-weight: 600; cursor: pointer; list-style: none; }
  .method-details summary::-webkit-details-marker { display: none; }
  .method-details summary::after {
    content: '';
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--eq-control-border);
    border-bottom: 2px solid var(--eq-control-border);
    transform: rotate(45deg);
    transition: transform 200ms ease, border-color 200ms ease;
    flex-shrink: 0;
    margin-left: 16px;
  }
  .method-details details[open] summary::after {
    transform: rotate(-135deg);
    border-color: var(--eq-primary);
  }
  .method-details summary:hover { color: var(--eq-primary-hover); }
  .method-details details p { color: var(--eq-text-secondary); font-size: 14px; padding-bottom: 24px; }
  .method-details :global(aside) { margin-top: 24px; }

  /* Responsive Rules */
  @media (max-width: 1023px) {
    .hero { gap: 32px; padding-block: 40px 56px; }
    .hero-header { max-width: 100%; }
    .floating-badge { display: none; }
    .preview-split { grid-template-columns: 1fr; }
    .sources-layout, .method { gap: 40px; }
    .preview-body { grid-template-columns: 1fr 1.4fr; }
    .facility-row { grid-template-columns: 1fr; gap: 8px; }
    ol { gap: 24px; }
  }

  @media (max-width: 767px) {
    .hero-backdrop { margin-bottom: 32px; }
    .hero { padding-block: 32px 48px; gap: 28px; }
    h1 { max-width: 620px; }
    .intro { font-size: 16px; }
    .preview-window { border-radius: 16px; }
    .window-header { padding: 10px 14px; }
    .window-url { display: none; }
    .window-toolbar { padding: 10px 16px; flex-direction: column; align-items: flex-start; gap: 10px; }
    .window-body { padding: 16px; }
    .alloc-cards-grid { grid-template-columns: 1fr; }
    .preview-visual { display: none; }

    /* Fix mobile line breaks */
    .break-desktop br { display: none; }
    .preview-header { align-items: flex-start; flex-direction: column; gap: 12px; padding: 24px; }
    .preview-caption { text-align: left; }
    .view-switch { padding-inline: 24px; }
    .preview-body { grid-template-columns: 1fr; }
    .preview-context { padding: 24px; border-right: 0; border-bottom: 1px solid var(--eq-border); border-radius: 0; }
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
    .actions { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; }
    .view-switch { flex-direction: column; align-items: stretch; }
    .facility-row { grid-template-columns: 1fr; gap: 8px; }
    .source-row { align-items: flex-start; flex-direction: column; gap: 8px; }
    .source-link-label { display: inline-flex; align-items: center; min-height: 44px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-bar {
      animation: none !important;
    }
    .badge-left, .badge-right {
      animation: none !important;
    }
  }
</style>
