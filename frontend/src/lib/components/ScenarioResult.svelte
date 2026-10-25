<script lang="ts">
  import { labels, number, rupiah, type Snapshot } from '$lib/api/workspace';
  import DecisionReview from './DecisionReview.svelte';
  import ScenarioEvidence from './ScenarioEvidence.svelte';

  let {
    result,
    names = {},
  }: { result: Snapshot; names?: Record<string, string> } = $props();
  const regionNames = $derived(result.region_names ?? names);

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
      </ul>
    </div>
  {/if}

  <div class="work-actions result-actions">
    <a class="eq-button eq-button-primary action-pdf-highlight" href={'/api/v1/scenarios/' + result.id + '/pdf'}>
      <span>Unduh Memo Kebijakan (PDF)</span>
    </a>
    <a class="eq-button" href={'/api/v1/scenarios/' + result.id + '/export'}>
      <span>Unduh Tabel Alokasi (CSV)</span>
    </a>
    <a class="eq-button" href={'/compare?left=' + result.id}>
      <span>Bandingkan Skenario</span>
    </a>
    <a class="eq-button" href={'/scenarios/' + result.id}>
      <span>Buka Tautan Snapshot</span>
    </a>
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

<nav class="result-tools" aria-label="Periksa hasil skenario">
  <a class="eq-button eq-button-primary" href="#uji-keputusan"> Uji keputusan & pemerataan
  </a>
  <a class="eq-button" href="#telusur-bukti"> Telusur bukti data
  </a>
</nav>

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
  }
  .stat-box .stat {
    margin-top: 6px;
  }
  .objective-meta {
    font-size: 13px;
    margin-bottom: 16px;
  }
  .result-actions {
    margin-block: 16px;
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
  .result-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-block: 20px 24px;
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
  }
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
  .action-pdf-highlight {
    background: var(--eq-primary);
    color: white;
    border-color: var(--eq-primary);
    font-weight: 650;
  }
  .action-pdf-highlight:hover {
    background: var(--eq-primary-hover);
    color: white;
  }
</style>
