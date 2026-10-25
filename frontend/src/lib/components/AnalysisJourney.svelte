<section class="journey" aria-label="Alur Analisis dan Simulasi Equora">
  <div class="journey-heading">
    <h2>Mulai Simulasi atau Audit Keputusan</h2>
    <p>Akses langsung tanpa login. Pilih tahapan analisis sesuai kebutuhan pengujian Anda.</p>
  </div>
  <ol>
    <li class="journey-card card-studio">
      <div class="card-body">
        <span class="step-num">01 · Simulasi Alokasi</span>
        <strong>Uji Formula & Anggaran</strong>
        <p>Atur bobot prioritas (Sanitasi vs TIK) dan plafon anggaran. Solver CP-SAT menghitung alokasi paket paling optimal ke 38 provinsi.</p>
      </div>
      <a class="step-cta cta-primary" href="/studio">
        <span>Buka Studio Simulasi</span>
      </a>
    </li>

    <li class="journey-card card-compare">
      <div class="card-body">
        <span class="step-num">02 · Sandingkan Skenario</span>
        <strong>Bandingkan 2 Kebijakan</strong>
        <p>Sandingkan dua hasil simulasi berdampingan. Lihat daerah mana yang bergeser nasib alokasinya dan verifikasi konsistensi parameter.</p>
      </div>
      <a class="step-cta" href="/compare">
        <span>Bandingkan Skenario</span>
      </a>
    </li>

    <li class="journey-card card-explore">
      <div class="card-body">
        <span class="step-num">03 · Verifikasi Data</span>
        <strong>Telusuri Peta & Sumber</strong>
        <p>Periksa data dasar agregat 38 provinsi yang dipakai simulasi. Cek kelengkapan indikator dan tautan provenance resmi Kemendikdasmen.</p>
      </div>
      <a class="step-cta" href="/explore">
        <span>Buka Data Explorer</span>
      </a>
    </li>
  </ol>
  <div class="references">
    <div class="ref-item">
      <span>Metadata & unduhan berkas di <a href="/datasets">katalog dataset</a></span>
    </div>
    <div class="ref-item">
      <span>Formula matematis di <a href="/methodology">metodologi simulasi</a></span>
    </div>
  </div>
</section>

<style>
  .journey {
    text-align: left;
    border: 1px solid var(--eq-border);
    border-radius: 22px;
    padding: 28px;
    background: var(--eq-surface);
    box-shadow: 0 4px 20px rgb(31 45 61 / 3%);
  }
  .journey-heading {
    margin-bottom: 24px;
  }
  h2 {
    font-size: 22px;
    font-weight: 750;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
    color: var(--eq-text);
  }
  p {
    color: var(--eq-text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
  ol {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .journey-card {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: 16px;
    padding: 22px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 18px;
    transition: border-color 180ms ease;
  }
  .journey-card:hover {
    border-color: var(--eq-primary);
  }
  .card-studio {
    border-color: var(--eq-primary);
    background: var(--eq-surface);
  }
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .step-num {
    font-size: 12px;
    font-weight: 700;
    color: var(--eq-primary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .card-body strong {
    font-size: 17px;
    font-weight: 700;
    color: var(--eq-text);
    letter-spacing: -0.01em;
  }
  .card-body p {
    font-size: 13px;
    color: var(--eq-text-secondary);
    line-height: 1.55;
  }
  .step-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 10px 14px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 650;
    color: var(--eq-text);
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    text-decoration: none;
    transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
  }
  .step-cta:hover {
    background: var(--eq-primary-tint);
    color: var(--eq-primary);
    border-color: var(--eq-primary);
  }
  .step-cta.cta-primary {
    background: var(--eq-primary);
    color: white;
    border-color: var(--eq-primary);
  }
  .step-cta.cta-primary:hover {
    background: var(--eq-primary-hover);
    color: white;
  }
  .references {
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid var(--eq-border);
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 13px;
    color: var(--eq-text-secondary);
  }
  .ref-item {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .ref-item a {
    color: var(--eq-primary);
    text-decoration: none;
    font-weight: 600;
  }
  .ref-item a:hover {
    text-decoration: underline;
  }
  @media (max-width: 900px) {
    ol {
      grid-template-columns: 1fr;
      gap: 14px;
    }
  }
</style>
