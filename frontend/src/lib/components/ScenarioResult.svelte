<script lang="ts">
  import { labels, number, rupiah, type Snapshot } from '$lib/api/workspace';
  import {
    equityConcentration,
    focusIndicator,
    schoolImpact,
  } from '$lib/insight/insight';
  import {
    buildScenarioMapView,
    type ScenarioMapMode,
  } from '$lib/maps/priority-map';
  import ProvinceMap from './ProvinceMap.svelte';
  import DecisionReview from './DecisionReview.svelte';
  import ScenarioEvidence from './ScenarioEvidence.svelte';
  import Icon from './Icon.svelte';

  let {
    result,
    names = {},
    compareHref,
  }: { result: Snapshot; names?: Record<string, string>; compareHref?: string } = $props();
  const regionNames = $derived({
    ...Object.fromEntries(result.input_rows.map((row) => [row.code, row.name])),
    ...names,
    ...(result.region_names ?? {}),
  });

  let mapMode = $state<ScenarioMapMode>('urgency');
  let mapAttempt = $state(0);
  let selectedMapCode = $state('');

  const allocations = $derived(result.allocation.allocations ?? {});
  const totalAllocatedPackages = $derived(
    Object.values(allocations).reduce((sum, count) => sum + (count ?? 0), 0)
  );
  const allocatedRegions = $derived(
    Object.entries(allocations)
      .filter(([_, count]) => (count ?? 0) > 0)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
  );
  const zeroAllocationRegions = $derived(
    result.case.regions.filter((region) => (allocations[region.region_code] ?? 0) === 0)
  );
  const top3Regions = $derived(
    allocatedRegions.slice(0, 3).map(([code, count]) => ({
      name: regionNames[code] ?? code,
      count,
    }))
  );
  const solverOk = $derived(
    result.allocation.status === 'optimal' || result.allocation.status === 'feasible'
  );
  const focus = $derived(solverOk ? focusIndicator(result.parameters.weights) : null);
  const concentration = $derived(
    solverOk ? equityConcentration(result.priority.ranked, result.allocation.allocations) : null
  );
  const impact = $derived(
    solverOk ? schoolImpact(result.input_rows, result.parameters.weights, result.allocation.allocations) : null
  );
  const activeMapMode = $derived<ScenarioMapMode>(
    mapMode === 'allocation' && !solverOk ? 'urgency' : mapMode
  );
  const scenarioMapPresentation = $derived(
    buildScenarioMapView(result, activeMapMode, regionNames)
  );
  const activeRegionCode = $derived(
    selectedMapCode && result.priority.ranked.some((r) => r.region_code === selectedMapCode)
      ? selectedMapCode
      : (result.priority.ranked[0]?.region_code ?? '')
  );
  const activeRankedRow = $derived(
    result.priority.ranked.find((r) => r.region_code === activeRegionCode)
  );
</script>

<section class="work-panel result-summary-panel">
  <div class="result-top-bar">
    <div>
      <span class="eq-kicker">SNAPSHOT TERSIMPAN</span>
      <h2 class="result-title">{result.parameters.name}</h2>
    </div>
    <div class="status-wrap">
      <span
        class="eq-badge {result.allocation.status === 'optimal' || result.allocation.status === 'feasible'
          ? 'eq-badge-success'
          : 'eq-badge-warning'}"
      >
        Solver: {result.allocation.status}
      </span>
      <span class="eq-badge eq-badge-neutral">Jenjang {result.parameters.education_level}</span>
    </div>
  </div>

  {#if result.allocation.reason}
    <div class="review-notice" role="status">
      {result.allocation.reason}
    </div>
  {/if}

  {#if result.allocation.evaluation}
    <div class="work-grid stat-card-grid">
      <div class="stat-box">
        <p class="work-muted">Anggaran dialokasikan</p>
        <p class="stat">
          {rupiah(result.allocation.evaluation.budget_used_idr)}
        </p>
      </div>
      <div class="stat-box">
        <p class="work-muted">Sisa anggaran</p>
        <p class="stat">
          {rupiah(result.allocation.evaluation.budget_remaining_idr)}
        </p>
      </div>
    </div>
    <p class="work-muted objective-meta">
      Objective proxy: <strong>{number(result.allocation.evaluation.objective_units / 10000, 4)}</strong> ·
      Batas terbaik: <strong>{number(result.allocation.best_bound_units)}</strong> unit ·
      Gap alokasi: <strong>{number(result.allocation.absolute_gap_units)}</strong> unit
    </p>

    <div class="executive-takeaway-card">
      <div class="takeaway-header">
        <div class="takeaway-badge">
          <span>Ringkasan hasil simulasi</span>
        </div>
        <span class="takeaway-meta">Berdasarkan snapshot tersimpan</span>
      </div>

      <ul class="takeaway-list">
        <li>
          <span class="takeaway-bullet bullet-target">1</span>
          <div>
            <strong>Paket yang dialokasikan:</strong>
            <span>
              Total <strong>{totalAllocatedPackages} paket simulasi</strong> teralokasi ke <strong>{allocatedRegions.length} provinsi</strong>.
              {#if top3Regions.length > 0}
                Penerima paket terbanyak pada hasil ini: {#each top3Regions as item, i}<strong>{item.name}</strong> ({item.count} paket){#if i < top3Regions.length - 1}, {/if}{/each}.
                Jumlah paket juga dipengaruhi biaya dan batasan model; bukan urutan kebutuhan saja.
              {/if}
            </span>
          </div>
        </li>

        <li>
          <span class="takeaway-bullet bullet-budget">2</span>
          <div>
            <strong>Penggunaan anggaran simulasi:</strong>
            <span>
              Anggaran digunakan sebesar <strong>{rupiah(result.allocation.evaluation.budget_used_idr)}</strong>
              dari plafon {rupiah(result.parameters.budget_idr)}
              ({number((result.allocation.evaluation.budget_used_idr / (result.parameters.budget_idr || 1)) * 100, 1)}% dari anggaran).
              {#if result.allocation.evaluation.budget_remaining_idr > 0}
                Tersisa {rupiah(result.allocation.evaluation.budget_remaining_idr)} yang belum dialokasikan.
                Periksa biaya, kapasitas, minimum paket dan status solver untuk menelusuri alasannya.
              {:else}
                Anggaran terpakai 100% tanpa sisa.
              {/if}
            </span>
          </div>
        </li>

        <li>
          <span class="takeaway-bullet bullet-fairness">3</span>
          <div>
            <strong>Jangkauan antarprovinsi:</strong>
            <span>
              Dari {result.case.regions.length} provinsi yang masuk model, {allocatedRegions.length} menerima paket dan {zeroAllocationRegions.length} belum menerima paket.
              {#if Object.keys(result.priority.excluded).length > 0}
                {Object.keys(result.priority.excluded).length} provinsi dikecualikan dari peringkat karena data belum memenuhi syarat; kebutuhan mereka tidak dianggap nol.
              {/if}
              Ini menggambarkan jangkauan simulasi antarprovinsi, bukan bukti pemerataan antarsekolah.
            </span>
          </div>
        </li>

        {#if concentration}
          <li>
            <span class="takeaway-bullet bullet-target">4</span>
            <div>
              <strong>Konsentrasi pada kebutuhan tertinggi:</strong>
              <span>
                Sebanyak <strong>{number(concentration.percent, 1)}%</strong> paket
                ({concentration.packages} dari {concentration.total}) mengalir ke
                {concentration.regions.length} provinsi dengan skor kebutuhan tertinggi
                ({#each concentration.regions as code, i}{regionNames[code] ?? code}{#if i < concentration.regions.length - 1}, {/if}{/each}).
              </span>
            </div>
          </li>
        {/if}

        {#if focus}
          <li>
            <span class="takeaway-bullet bullet-fairness">{concentration ? '5' : '4'}</span>
            <div>
              <strong>Indikator fokus:</strong>
              <span>
                Skenario ini memprioritaskan <strong>{labels[focus]}</strong>
                ({number(Number(result.parameters.weights[focus]) * 100)}% bobot)
                sebagai indikator kebutuhan terbesar; peringkat wilayah dan alokasi paket mengikutinya.
              </span>
            </div>
          </li>
        {/if}
      </ul>
    </div>

    {#if impact && impact.totalPackages > 0 && impact.schoolsInNeed > 0}
      <div class="impact-card">
        <p class="impact-headline">
          <strong>{number(impact.totalPackages)} paket</strong> dialokasikan dalam simulasi.
        </p>
        <p class="impact-assumption">
          Di provinsi penerima, sekitar <strong>{number(impact.schoolsInNeed)} sekolah</strong>
          diperkirakan masih membutuhkan {labels[impact.focus]?.toLowerCase()}.
          Dengan asumsi satu paket per sekolah, jumlah paket setara dengan
          {number(impact.percent ?? 0, 1)}% dari kebutuhan tersebut. Rasio dapat melebihi
          100% karena paket dapat mencakup beberapa jenis fasilitas.
          <a href="/methodology">Baca metodologi</a>.
        </p>
        {#if impact.regions.length > 0}
          <details class="impact-details">
            <summary>Cakupan estimasi per provinsi penerima</summary>
            <table>
              <thead>
                <tr>
                  <th>Provinsi</th>
                  <th>Paket</th>
                  <th>Sekolah kebutuhan terdata</th>
                  <th>Cakupan</th>
                </tr>
              </thead>
              <tbody>
                {#each impact.regions as row}
                  <tr>
                    <td>{regionNames[row.code] ?? row.code}</td>
                    <td>{number(row.packages)}</td>
                    <td>{number(row.schoolsInNeed)}</td>
                    <td>{number(row.coveragePercent, 1)}%</td>
                  </tr>
                {/each}
              </tbody>
            </table>
            {#if impact.skippedRegions > 0}
              <p class="impact-assumption">
                {impact.skippedRegions} provinsi penerima dilewati dari hitungan kebutuhan
                karena estimasi kebutuhannya nol atau datanya belum lengkap. Paket mereka tetap dihitung.
              </p>
            {/if}
          </details>
        {/if}
      </div>
    {/if}
  {/if}

  <div class="scenario-action-bar" aria-label="Tindakan dokumen dan skenario">
    <div class="action-bar-group primary-actions">
      <a
        class="action-btn action-btn-pdf"
        href={'/api/v1/scenarios/' + result.id + '/pdf'}
        aria-label="Unduh Memo Kebijakan (PDF)"
      >
        <span class="btn-icon" aria-hidden="true"><Icon name="download" size={16} /></span>
        <span class="btn-text">Unduh Memo Kebijakan (PDF)</span>
        <span class="btn-chip" aria-hidden="true">Resmi</span>
      </a>
      <a class="action-btn action-btn-secondary" href={'/api/v1/scenarios/' + result.id + '/export'}>
        <span class="btn-icon" aria-hidden="true"><Icon name="database" size={16} /></span>
        <span class="btn-text">Unduh Tabel Alokasi (CSV)</span>
      </a>
    </div>
    <div class="action-bar-group secondary-actions">
      <a class="action-btn action-btn-ghost" href={compareHref ?? '/compare?left=' + result.id}>
        <span class="btn-icon" aria-hidden="true"><Icon name="compare" size={16} /></span>
        <span class="btn-text">{compareHref ? 'Bandingkan dengan skenario awal' : 'Bandingkan Skenario'}</span>
      </a>
      <a class="action-btn action-btn-ghost" href={'/scenarios/' + result.id}>
        <span class="btn-icon" aria-hidden="true"><Icon name="share" size={16} /></span>
        <span class="btn-text">Buka Tautan Snapshot</span>
      </a>
    </div>
  </div>

  <details class="params-details">
    <summary>Parameter & jejak perhitungan</summary>
    <dl>
      <dt>ID Rilis Data</dt>
      <dd><code class="mini-code">{result.release_id}</code></dd>
      <dt>Waktu Pembuatan</dt>
      <dd>{result.created_at}</dd>
      <dt>Versi Metode</dt>
      <dd>{result.priority.method_version}</dd>
      <dt>Model & Solver</dt>
      <dd>
        {result.allocation.model_version} / {result.allocation.solver_version} (maks {result.allocation.max_time_seconds}s)
      </dd>
      <dt>Plafon Anggaran</dt>
      <dd>{rupiah(result.parameters.budget_idr)}</dd>
      <dt>Biaya per Paket Default</dt>
      <dd>{rupiah(result.parameters.cost_idr)}</dd>
      <dt>Kapasitas / Minimum Default</dt>
      <dd>
        {result.parameters.capacity} / {result.parameters.minimum_packages} paket
      </dd>
    </dl>
    <div class="weights-summary-list">
      <strong>Bobot Kebutuhan:</strong>
      {#each Object.entries(result.parameters.weights) as [key, value]}
        <span class="eq-badge eq-badge-neutral">{labels[key]}: {number(Number(value) * 100)}%</span>
      {/each}
    </div>
  </details>
</section>

<nav class="result-nav-panel" aria-label="Periksa hasil skenario">
  <div class="result-nav-header">
    <span class="eq-kicker">NAVIGASI LAPORAN SIMULASI</span>
    <p class="result-nav-subtitle">Lompat langsung ke visualisasi spasial, uji sensitivitas keputusan, atau audit data:</p>
  </div>
  <div class="result-nav-links">
    <a class="result-nav-card" href="#peta-urgensi">
      <span class="nav-card-num" aria-hidden="true">1</span>
      <span class="nav-card-body">
        <strong class="nav-card-title">Peta GIS urgensi & alokasi</strong>
        <span class="nav-card-sub" aria-hidden="true">Visualisasi spasial & solver CP-SAT</span>
      </span>
      <span class="nav-card-arrow" aria-hidden="true">↓</span>
    </a>
    <a class="result-nav-card" href="#uji-keputusan">
      <span class="nav-card-num" aria-hidden="true">2</span>
      <span class="nav-card-body">
        <strong class="nav-card-title">Uji keputusan & pemerataan</strong>
        <span class="nav-card-sub" aria-hidden="true">Uji asumsi anggaran & Indeks Gini</span>
      </span>
      <span class="nav-card-arrow" aria-hidden="true">↓</span>
    </a>
    <a class="result-nav-card" href="#telusur-bukti">
      <span class="nav-card-num" aria-hidden="true">3</span>
      <span class="nav-card-body">
        <strong class="nav-card-title">Telusur bukti data</strong>
        <span class="nav-card-sub" aria-hidden="true">Peringkat 38 provinsi & bukti SHA-256</span>
      </span>
      <span class="nav-card-arrow" aria-hidden="true">↓</span>
    </a>
  </div>
</nav>

<section id="peta-urgensi" class="work-panel scenario-gis-panel" aria-labelledby="scenario-gis-title">
  <div class="gis-header">
    <div>
      <span class="eq-kicker">DASBOR ANALITIK GIS</span>
      <h2 id="scenario-gis-title" class="gis-title">Peta sebaran tingkat urgensi & alokasi paket</h2>
      <p class="work-muted">
        Visualisasi spasial hasil perhitungan MCDA dan solver optimasi CP-SAT pada cakupan {result.case.regions.length} provinsi ({result.parameters.education_level}).
      </p>
    </div>
    <div class="gis-mode-switch" role="group" aria-label="Mode peta simulasi">
      <button
        type="button"
        class="gis-mode-btn"
        aria-pressed={activeMapMode === 'urgency'}
        onclick={() => (mapMode = 'urgency')}
      >
        <span class="mode-btn-label">Tingkat urgensi (MCDA)</span>
        <span class="mode-btn-tag">Kebutuhan sekolah</span>
      </button>
      <button
        type="button"
        class="gis-mode-btn"
        aria-pressed={activeMapMode === 'allocation'}
        disabled={!solverOk}
        onclick={() => (mapMode = 'allocation')}
      >
        <span class="mode-btn-label">Sebaran alokasi (CP-SAT)</span>
        <span class="mode-btn-tag">Distribusi anggaran</span>
      </button>
    </div>
  </div>

  {#key `${result.id}-${mapAttempt}`}
    <ProvinceMap
      silentStatus
      presentation={scenarioMapPresentation}
      selected={activeRegionCode}
      onselect={(code) => (selectedMapCode = code)}
      onretry={() => mapAttempt++}
    />
  {/key}

  {#if activeRankedRow}
    <div class="gis-inspector" aria-label="Sorotan provinsi pada peta simulasi">
      <div class="gis-inspector-main">
        <span class="eq-kicker">SOROTAN WILAYAH · PERINGKAT #{activeRankedRow.rank}</span>
        <strong>{regionNames[activeRankedRow.region_code] ?? activeRankedRow.region_code}</strong>
        <p class="work-muted">
          Skor kebutuhan MCDA: <code>{number(activeRankedRow.score, 4)}</code> ·
          Alokasi: <strong>{number(allocations[activeRankedRow.region_code] ?? 0)} paket</strong>
        </p>
      </div>
      <div class="gis-inspector-actions">
        <a
          class="eq-button"
          href={'/daerah?' + new URLSearchParams({
            province: activeRankedRow.region_code,
            level: result.parameters.education_level,
            release: result.release_id,
          })}
        >
          Profil wilayah
        </a>
      </div>
    </div>
  {/if}
</section>

{#key result.id}
  <DecisionReview snapshot={result} />
  <ScenarioEvidence snapshot={result} />
{/key}

<div class="work-table">
  <table>
    <caption>Peringkat kebutuhan dan alokasi paket (agregat provinsi)</caption>
    <thead>
      <tr>
        <th>Peringkat</th>
        <th>Wilayah</th>
        <th>Skor kebutuhan (MCDA)</th>
        <th>Paket dialokasikan</th>
      </tr>
    </thead>
    <tbody>
      {#each result.priority.ranked as row}
        <tr>
          <td><span class="rank-index">{row.rank}</span></td>
          <td>
            <strong>{regionNames[row.region_code] ?? row.region_code}</strong>
            <details class="contrib-details">
              <summary>Rincian kontribusi</summary>
              <div class="contrib-grid">
                {#each Object.entries(row.contributions) as [key, value]}
                  <div class="contrib-item">
                    <span>{labels[key]}:</span>
                    <code>{number(value, 4)}</code>
                  </div>
                {/each}
              </div>
            </details>
          </td>
          <td><code>{number(row.score, 4)}</code></td>
          <td>
            {#if result.allocation.allocations?.[row.region_code] != null}
              {#if result.allocation.allocations[row.region_code] > 0}
                <span class="eq-badge eq-badge-success">
                  {result.allocation.allocations[row.region_code]} paket
                </span>
              {:else}
                <span class="eq-badge eq-badge-neutral">0 paket</span>
              {/if}
            {:else}
              <span class="eq-badge eq-badge-warning">Belum ada solusi</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="work-table">
  <table>
    <caption>Perbandingan dengan baseline strategi alternatif</caption>
    <thead>
      <tr>
        <th>Strategi alokasi</th>
        <th>Status solusi</th>
        <th>Anggaran terpakai</th>
        <th>Objective proxy</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(result.baselines) as [key, value]}
        <tr>
          <td>
            <strong>
              {key === 'equal'
                ? 'Pembagian merata bergiliran (Equal)'
                : 'Greedy kebutuhan/biaya'}
            </strong>
          </td>
          <td>
            <span class="eq-badge {value.status === 'optimal' || value.status === 'feasible' ? 'eq-badge-success' : 'eq-badge-warning'}">
              {value.status}
            </span>
          </td>
          <td>
            {value.evaluation ? rupiah(value.evaluation.budget_used_idr) : 'Tidak tersedia'}
          </td>
          <td>
            {value.evaluation ? number(value.evaluation.objective_units / 10000, 4) : 'Tidak tersedia'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if Object.keys(result.priority.excluded).length}
  <details class="excluded-details">
    <summary>
      Wilayah yang dikeluarkan ({Object.keys(result.priority.excluded).length} provinsi)
    </summary>
    <div class="excluded-content">
      {#each Object.entries(result.priority.excluded) as [code, indicators]}
        <p class="excluded-row">
          <strong>{regionNames[code] ?? code}:</strong>
          <span class="work-muted">data missing pada indikator {indicators.map((key) => labels[key]).join(', ')}</span>
        </p>
      {/each}
    </div>
  </details>
{/if}

<section class="work-panel limitations-panel">
  <h2>Batas interpretasi model</h2>
  <ul class="limitations-list">
    {#each result.limitations as text}
      <li>{text}</li>
    {/each}
  </ul>
  <details class="sources-details">
    <summary>Daftar berkas sumber pada snapshot ({result.sources.length})</summary>
    {#each result.sources as source}
      <p class="source-item">
        <a href={source.source_url} target="_blank" rel="noreferrer" class="source-link">
          {source.title}
        </a>
        <code class="mini-code">{source.sha256}</code>
      </p>
    {/each}
  </details>
</section>

<style>
  .result-summary-panel {
    border-top: 4px solid var(--eq-primary);
    animation: eq-fade-slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .result-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .result-title {
    font-size: 1.5rem;
    margin-top: 4px;
  }
  .status-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .stat-card-grid {
    margin-block: 16px;
  }
  .stat-box {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    padding: 16px 20px;
    animation: eq-scale-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .stat-card-grid .stat-box:nth-child(2) {
    animation-delay: 60ms;
  }
  .stat-box .stat {
    margin-top: 6px;
  }
  .objective-meta {
    font-size: 13px;
    margin-bottom: 16px;
  }
  .scenario-action-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block: 20px 24px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    box-shadow: 0 1px 3px rgb(15 23 42 / 4%);
  }
  .action-bar-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .action-btn-pdf {
    background: linear-gradient(135deg, #1264d8, #0e4faf);
    color: #ffffff;
    border: 1px solid #0e4faf;
    box-shadow: 0 2px 6px rgb(18 100 216 / 25%);
  }
  .action-btn-pdf:hover {
    background: linear-gradient(135deg, #0e4faf, #0a3d8a);
    box-shadow: 0 4px 12px rgb(18 100 216 / 35%);
    transform: translateY(-1px);
  }
  .action-btn-pdf .btn-chip {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
  .action-btn-secondary {
    background: var(--eq-surface);
    color: var(--eq-text);
    border: 1px solid var(--eq-border);
  }
  .action-btn-secondary:hover {
    background: var(--eq-surface-subtle);
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgb(15 23 42 / 6%);
  }
  .action-btn-ghost {
    background: var(--eq-surface-subtle);
    color: var(--eq-text-secondary);
    border: 1px solid var(--eq-border);
  }
  .action-btn-ghost:hover {
    background: #ffffff;
    color: var(--eq-primary-hover);
    border-color: var(--eq-primary);
    transform: translateY(-1px);
  }
  @media (max-width: 760px) {
    .scenario-action-bar {
      flex-direction: column;
      align-items: stretch;
      padding: 10px;
    }
    .action-bar-group {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
    }
    .action-btn {
      width: 100%;
      justify-content: center;
    }
  }
  .params-details {
    margin-top: 16px;
    background: var(--eq-surface-subtle);
    padding: 14px 18px;
    border-radius: 8px;
  }
  .params-details summary {
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .mini-code {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    background: white;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--eq-border);
  }
  .weights-summary-list {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--eq-border);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 13px;
  }
  .result-nav-panel {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 14px;
    padding: 16px 20px 18px;
    margin-block: 20px 24px;
    box-shadow: var(--eq-shadow-card);
  }
  .result-nav-header {
    margin-bottom: 12px;
  }
  .result-nav-subtitle {
    font-size: 13px;
    color: var(--eq-text-secondary);
    margin-top: 3px;
  }
  .result-nav-links {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .result-nav-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    text-decoration: none;
    color: var(--eq-text);
    transition: background-color 140ms ease, border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
  }
  .result-nav-card:hover {
    background: #ffffff;
    border-color: var(--eq-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgb(18 100 216 / 8%);
  }
  .nav-card-num {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: var(--eq-primary-tint);
    color: var(--eq-primary);
    font-weight: 750;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .nav-card-body {
    display: grid;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .nav-card-title {
    font-size: 13px;
    font-weight: 650;
    color: var(--eq-text);
  }
  .nav-card-sub {
    font-size: 11px;
    color: var(--eq-text-muted);
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .nav-card-arrow {
    color: var(--eq-text-muted);
    font-size: 13px;
    transition: transform 140ms ease, color 140ms ease;
    flex-shrink: 0;
  }
  .result-nav-card:hover .nav-card-arrow {
    transform: translateY(2px);
    color: var(--eq-primary);
  }
  @media (max-width: 860px) {
    .result-nav-links {
      grid-template-columns: 1fr;
    }
  }
  .rank-index {
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }
  .contrib-details {
    margin-top: 6px;
    font-size: 12px;
  }
  .contrib-details summary {
    cursor: pointer;
    color: var(--eq-primary-hover);
    font-weight: 500;
  }
  .contrib-grid {
    display: grid;
    gap: 4px;
    padding: 8px 0;
  }
  .contrib-item {
    display: flex;
    justify-content: space-between;
    max-width: 280px;
    font-size: 11px;
    color: var(--eq-text-secondary);
  }
  .excluded-details {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 10px;
    padding: 16px 20px;
    margin-block: 16px;
  }
  .excluded-details summary {
    font-weight: 600;
    cursor: pointer;
    color: var(--eq-warning);
  }
  .excluded-content {
    margin-top: 12px;
    display: grid;
    gap: 8px;
    font-size: 13px;
  }
  .excluded-row {
    margin: 0;
  }
  .limitations-panel {
    background: var(--eq-surface-subtle);
  }
  .limitations-list {
    margin: 12px 0 20px 20px;
    padding: 0;
    color: var(--eq-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
  .sources-details {
    padding-top: 14px;
    border-top: 1px solid var(--eq-border);
  }
  .sources-details summary {
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }
  .source-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    margin-block: 8px;
  }
  .source-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--eq-primary-hover);
    text-decoration: none;
  }
  .source-link:hover {
    text-decoration: underline;
  }

  /* Executive Policy Takeaway Card */
  .executive-takeaway-card {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 14px;
    padding: 20px;
    margin-block: 20px;
  }
  .takeaway-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--eq-border);
  }
  .takeaway-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 650;
    color: var(--eq-text);
  }
  .takeaway-meta {
    font-size: 13px;
    font-weight: 500;
    color: var(--eq-text-secondary);
  }
  .takeaway-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .takeaway-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: eq-fade-slide-up 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .takeaway-list li:nth-child(1) { animation-delay: 40ms; }
  .takeaway-list li:nth-child(2) { animation-delay: 90ms; }
  .takeaway-list li:nth-child(3) { animation-delay: 140ms; }
  .takeaway-list li:nth-child(4) { animation-delay: 190ms; }
  .takeaway-list li:nth-child(5) { animation-delay: 240ms; }
  .takeaway-bullet {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 750;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .bullet-target, .bullet-budget, .bullet-fairness { background: var(--eq-primary-tint); color: var(--eq-primary-hover); }
  .takeaway-list li div strong {
    font-size: 14px;
    color: var(--eq-text);
    margin-right: 4px;
  }
  .takeaway-list li div span {
    font-size: 13px;
    color: var(--eq-text-secondary);
    line-height: 1.55;
  }


  /* Estimasi dampak: sekolah difasilitasi */
  .impact-card {
    background: var(--eq-surface);
    border: 1px dashed var(--eq-border);
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }
  .impact-headline {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: var(--eq-text);
  }
  .impact-assumption {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.55;
    color: var(--eq-text-secondary);
  }
  .impact-details {
    margin-top: 12px;
  }
  .impact-details summary {
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--eq-primary-hover);
  }
  .impact-details table {
    margin-top: 10px;
  }
  .scenario-gis-panel {
    margin-bottom: 24px;
    scroll-margin-top: 88px;
  }
  .gis-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .gis-title {
    font-size: 1.25rem;
    margin: 4px 0 6px;
  }
  .gis-mode-switch {
    display: inline-grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 4px;
    border: 1px solid var(--eq-border);
    border-radius: 10px;
    background: var(--eq-surface-subtle);
    gap: 4px;
    max-width: 100%;
  }
  .gis-mode-btn {
    min-height: 44px;
    padding: 6px 14px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--eq-text-secondary);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: left;
    cursor: pointer;
    transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  }
  .gis-mode-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.7);
    color: var(--eq-text);
  }
  .gis-mode-btn[aria-pressed='true'] {
    background: var(--eq-surface);
    color: var(--eq-primary-hover);
    border-color: var(--eq-border);
    box-shadow: 0 1px 4px rgb(15 23 42 / 8%);
  }
  .mode-btn-label {
    font-size: 12px;
    font-weight: 650;
  }
  .mode-btn-tag {
    font-size: 10px;
    color: var(--eq-text-muted);
  }
  .gis-mode-btn[aria-pressed='true'] .mode-btn-tag {
    color: var(--eq-primary);
  }
  .gis-mode-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .gis-inspector {
    margin-top: 14px;
    padding: 14px 16px;
    border: 1px solid var(--eq-border);
    border-radius: 10px;
    background: var(--eq-surface-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .gis-inspector-main {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .gis-inspector-main strong {
    font-size: 15px;
    color: var(--eq-text);
  }
  .gis-inspector-main p {
    margin: 0;
    font-size: 13px;
  }
  @media (max-width: 600px) {
    .gis-mode-switch {
      width: 100%;
    }
  }
</style>
