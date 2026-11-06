<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import CompareSummary from '$lib/components/CompareSummary.svelte';
  import { compareSummary, schoolImpact, type SchoolImpact } from '$lib/insight/insight';
  import {
    api,
    downloadComparison,
    labels,
    number,
    rupiah,
    type SavedScenario,
    type Snapshot,
  } from '$lib/api/workspace';
  let saved = $state<SavedScenario[]>([]);
  let loading = $state(true);
  let left = $state('');
  let right = $state('');
  let error = $state('');
  let busy = $state(false);
  let result = $state<{
    objective_comparable: boolean;
    coverage: Record<
      string,
      {
        eligible_regions: number;
        receiving_regions: number;
        total_packages: number;
        excluded_regions: number;
      }
    >;
    warnings: string[];
    budget_delta_idr: number;
    rows: {
      region_code: string;
      left_packages: number;
      right_packages: number;
      delta: number;
      left_rank: number | null;
      right_rank: number | null;
    }[];
    left: Snapshot;
    right: Snapshot;
  }>();

  const names = $derived<Record<string, string>>(
    result
      ? { ...result.right.region_names, ...result.left.region_names }
      : {},
  );
  const isSolvable = (item: SavedScenario) =>
    item.status === 'optimal' || item.status === 'feasible';
  const selectedLeft = $derived(saved.find((item) => item.id === left));
  const selectedRight = $derived(saved.find((item) => item.id === right));
  const studioHref = $derived(selectedLeft && isSolvable(selectedLeft)
    ? '/studio?' + new URLSearchParams({
        base: selectedLeft.id,
        release: selectedLeft.release_id,
        level: selectedLeft.education_level ?? 'SD',
      })
    : '/studio');
  const isCompatible = (item: SavedScenario, base = selectedLeft) =>
    isSolvable(item) &&
    (!base ||
      (item.release_id === base.release_id &&
        (item.education_level ?? 'SD') === (base.education_level ?? 'SD')));

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  }

  function selectLeft(id: string) {
    left = id;
    result = undefined;
    const base = saved.find((item) => item.id === left);
    const currentRight = saved.find((item) => item.id === right);
    if (!currentRight || currentRight.id === left || !isCompatible(currentRight, base)) {
      right = saved.find((item) => item.id !== left && isCompatible(item, base))?.id ?? '';
    }
  }

  async function load() {
    loading = true;
    error = '';
    try {
      const items = await api<SavedScenario[]>('scenarios');
      saved = items;
      const requestedLeft = page.url.searchParams.get('left');
      const validRequested = items.find(
        (item) => item.id === requestedLeft && isSolvable(item),
      );
      const paired = items.find((base) => isSolvable(base) &&
        items.some((item) => item.id !== base.id && isCompatible(item, base)));
      left = validRequested?.id ?? paired?.id ?? items.find(isSolvable)?.id ?? '';
      const base = items.find((item) => item.id === left);
      const matches = items.filter((item) => item.id !== left && isCompatible(item, base));
      right = matches.find((item) => item.id === page.url.searchParams.get('right'))?.id ?? matches[0]?.id ?? '';
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }
  onMount(load);

  async function exportPdf() {
    try {
      await downloadComparison(left, right);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function compare(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    error = '';
    result = undefined;
    try {
      result = await api('scenarios/compare', { left, right });
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }

  const scenarioLabel = (id: string) => saved.find((item) => item.id === id)?.name ?? 'Skenario';

  const summary = $derived(
    result
      ? compareSummary(
          {
            coverage: result.coverage,
            rows: result.rows,
            budget_delta_idr: result.budget_delta_idr,
            objective_comparable: result.objective_comparable,
          },
          names,
          scenarioLabel(left),
          scenarioLabel(right),
        )
      : [],
  );

  const impacts = $derived.by(() => {
    if (!result) return {} as Record<string, SchoolImpact | null>;
    return {
      left: schoolImpact(
        result.left.input_rows,
        result.left.parameters.weights,
        result.left.allocation.allocations,
      ),
      right: schoolImpact(
        result.right.input_rows,
        result.right.parameters.weights,
        result.right.allocation.allocations,
      ),
    };
  });

  const impactsVisible = $derived(
    (['left', 'right'] as const).some(
      (side) =>
        impacts[side] &&
        impacts[side]!.totalPackages > 0 &&
        impacts[side]!.schoolsInNeed > 0,
    ),
  );
</script>

<svelte:head><title>Perbandingan skenario · Equora</title></svelte:head>
<WorkspaceShell
  title="Perbandingan skenario"
  subtitle="Perubahan paket dan peringkat dibaca pada versi data, jenjang, metode, dan model yang kompatibel."
>
  {#if error}
    <div role="alert" class="work-error">
      <Icon name="alert" size={18} />
      <div><p>{error}</p>{#if saved.length < 2}<button type="button" class="eq-button" onclick={load}>Coba lagi</button>{/if}</div>
    </div>
  {/if}

  {#if loading}
    <p class="work-panel" role="status">Memuat skenario tersimpan…</p>
  {:else if error && saved.length < 2}
    <p class="work-muted">Daftar skenario belum dapat dimuat. Coba lagi atau buka <a href="/studio">Studio simulasi</a>.</p>
  {:else if saved.length < 2 || !selectedLeft}
    <section class="work-panel comparison-start">
      <h2>{selectedLeft ? 'Tambahkan skenario pembanding' : 'Siapkan perbandingan pertama'}</h2>
      <p class="work-muted">{selectedLeft
        ? 'Gunakan rilis dan jenjang yang sama. Coba ubah satu asumsi agar perbedaan hasil mudah ditelusuri.'
        : saved.length ? 'Skenario tersimpan belum menghasilkan alokasi. Hitung skenario yang memenuhi batas anggaran dan kapasitas di Studio.'
        : 'Mulai dengan satu anggaran, lalu bandingkan dua pilihan prioritas.'}</p>
      <dl class="scenario-slots">
        <div>
          <dt>Skenario awal</dt>
          <dd>{selectedLeft?.name ?? 'Belum tersedia'}</dd>
          {#if selectedLeft}<small>Jenjang {selectedLeft.education_level ?? 'SD'}</small>{/if}
        </div>
        <div class="open-slot">
          <dt>Skenario pembanding</dt>
          <dd>Belum tersedia</dd>
        </div>
      </dl>
      <a class="eq-button eq-button-primary" href={studioHref}>
        {selectedLeft ? 'Buat skenario pembanding' : 'Buat skenario awal'}
      </a>
    </section>
  {:else}
    <form onsubmit={compare} class="work-panel compare-form">
      <h2>Pilih skenario untuk dibandingkan</h2>
      <div class="work-controls">
        <label>
          Skenario awal
          <select
            value={left}
            disabled={busy}
            onchange={(event) => selectLeft(event.currentTarget.value)}
            required
          >
            <option value="" disabled>Pilih skenario</option>
            {#each saved as item}
              <option value={item.id} disabled={!isSolvable(item)}>
                {item.name} · {formatDate(item.created_at)}{!isSolvable(item) ? ' · tanpa solusi' : ''}
              </option>
            {/each}
          </select>
        </label>
        <label>
          Skenario pembanding
          <select
            bind:value={right}
            disabled={busy}
            onchange={() => (result = undefined)}
            required
          >
            <option value="">Pilih snapshot</option>
            {#each saved as item}
              <option value={item.id} disabled={item.id === left || !isCompatible(item)}>
                {item.name} · {formatDate(item.created_at)}{!isSolvable(item) ? ' · tanpa solusi' : !isCompatible(item) ? ' · rilis/jenjang berbeda' : ''}
              </option>
            {/each}
          </select>
        </label>
        <button
          class="eq-button eq-button-primary compare-submit"
          disabled={busy || !selectedLeft || !selectedRight || left === right || !isCompatible(selectedRight, selectedLeft)}
        >
          {busy ? 'Membandingkan…' : 'Bandingkan'}
        </button>
      </div>
      {#if !saved.some((item) => item.id !== left && isCompatible(item))}
        <p class="work-muted helper-text">
          Belum ada pembanding dengan rilis dan jenjang yang sama.
          <a href={studioHref}>Buat skenario pembanding</a>
        </p>
      {/if}
    </form>
  {/if}

  {#if result}
    <section class="work-panel">
      <div class="panel-header-action">
        <h2>Perubahan alokasi</h2>
        <button class="eq-button" onclick={exportPdf}> Unduh PDF perbandingan
        </button>
      </div>

      <CompareSummary sentences={summary} />

      <div class="work-grid compare-coverage-grid">
        {#each Object.entries(result.coverage) as [key, value]}
          <div class="coverage-box">
            <span class="eq-badge {key === 'left' ? 'eq-badge-neutral' : 'eq-badge-primary'}">
              {key === 'left' ? 'Skenario Awal' : 'Skenario Pembanding'}
            </span>
            <h3>{scenarioLabel(key === 'left' ? left : right)}</h3>
            <p class="stat stat-coverage">
              {value.receiving_regions}
              <span class="stat-unit">/ {value.eligible_regions} provinsi</span>
            </p>
            <p class="work-muted">
              menerima <strong>{number(value.total_packages)} paket</strong> dalam simulasi.
              {#if value.excluded_regions > 0}
                {value.excluded_regions} wilayah dikecualikan karena data tidak lengkap.
              {:else}
                Tidak ada wilayah yang dikeluarkan karena kelengkapan data.
              {/if}
            </p>
            {#if impacts[key] && impacts[key]!.totalPackages > 0 && impacts[key]!.schoolsInNeed > 0}
              <p class="impact-line">
                Dengan asumsi satu paket per sekolah, jumlah paket setara dengan
                {number(impacts[key]!.percent ?? 0, 1)}% dari estimasi kebutuhan
                {labels[impacts[key]!.focus]?.toLowerCase()} di provinsi penerima.
              </p>
            {/if}
          </div>
        {/each}
      </div>
      {#if impactsVisible}
        <p class="work-muted impact-footnote">
          Estimasi kebutuhan menggunakan data agregat sekolah. Rasio dapat melebihi 100% karena paket dapat mencakup beberapa jenis fasilitas.
          <a href="/methodology">Baca metodologi</a>.
        </p>
      {/if}

      <div class="delta-card">
        <div>
          <p class="work-muted">Selisih anggaran terpakai (pembanding − awal)</p>
          <p
            class="stat"
            class:delta-positive={result.budget_delta_idr > 0}
            class:delta-negative={result.budget_delta_idr < 0}
          >
            {result.budget_delta_idr > 0 ? '+' : ''}{rupiah(result.budget_delta_idr)}
          </p>
        </div>
        <p class="work-muted delta-note">
          {result.objective_comparable
            ? 'Bobot indikator identik; nilai objective dapat dibandingkan pada model yang sama, bukan sebagai ukuran dampak pendidikan.'
            : 'Bobot indikator berbeda; nilai objective tidak dapat dibandingkan secara langsung.'}
        </p>
      </div>

      {#each result.warnings as warning}
        <div class="review-notice">
          {warning}
        </div>
      {/each}
    </section>

    <div class="work-table">
      <table>
        <caption>Perbandingan paket dan peringkat</caption>
        <thead>
          <tr>
            <th>Provinsi</th>
            <th>Paket awal</th>
            <th>Pembanding</th>
            <th>Perubahan paket</th>
            <th>Peringkat (Awal → Pembanding)</th>
          </tr>
        </thead>
        <tbody>
          {#each result.rows as row}
            <tr>
              <td><strong>{names[row.region_code] ?? row.region_code}</strong></td>
              <td>{row.left_packages}</td>
              <td>{row.right_packages}</td>
              <td>
                {#if row.delta > 0}
                  <span class="eq-badge eq-badge-success">+{row.delta}</span>
                {:else if row.delta < 0}
                  <span class="eq-badge eq-badge-danger">{row.delta}</span>
                {:else}
                  <span class="eq-badge eq-badge-neutral">0</span>
                {/if}
              </td>
              <td>
                <span class="rank-flow">
                  <span>{row.left_rank ?? '—'}</span>
                  <span class="rank-arrow">→</span>
                  <span>{row.right_rank ?? '—'}</span>
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</WorkspaceShell>

<style>
  .comparison-start h2, .coverage-box h3 { margin: 0; }
  .scenario-slots {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 20px 0;
  }
  .scenario-slots > div {
    padding: 16px;
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    background: var(--eq-surface-subtle);
    overflow-wrap: anywhere;
  }
  .scenario-slots .open-slot { background: var(--eq-surface); border-style: dashed; }
  .scenario-slots dt, .scenario-slots small { color: var(--eq-text-secondary); font-size: .875rem; }
  .scenario-slots dd { margin: 4px 0; font-weight: 650; }
  .coverage-box h3 { margin-top: 10px; font-size: 1.05rem; overflow-wrap: anywhere; }
  @media (max-width: 600px) { .scenario-slots { grid-template-columns: 1fr; } }
  .compare-form {
    margin-bottom: 24px;
  }
  .compare-form h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
  }
  .compare-submit {
    align-self: flex-end;
  }
  .helper-text {
    margin-top: 10px;
    font-size: 13px;
    color: var(--eq-warning);
  }
  .panel-header-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .panel-header-action h2 {
    margin: 0;
  }
  .compare-coverage-grid {
    margin-bottom: 12px;
  }
  .impact-line {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--eq-text);
  }
  .impact-footnote {
    font-size: 12px;
    margin: 0 0 12px;
  }
  .coverage-box {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    padding: 16px 20px;
  }
  .compare-coverage-grid > .coverage-box:first-child {
    animation: eq-slide-from-left 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .compare-coverage-grid > .coverage-box:last-child {
    animation: eq-slide-from-right 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .stat-coverage {
    margin: 10px 0 6px;
  }
  .stat-unit {
    font-size: 14px;
    font-weight: 500;
    color: var(--eq-text-secondary);
  }
  .delta-card {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    padding: 18px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-block: 16px;
    animation: eq-fade-slide-up 260ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;
  }
  .delta-positive {
    color: var(--eq-primary-hover);
  }
  .delta-negative {
    color: var(--eq-danger);
  }
  .delta-note {
    max-width: 420px;
    font-size: 13px;
    line-height: 1.5;
  }
  .rank-flow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-variant-numeric: tabular-nums;
  }
  .rank-arrow {
    color: var(--eq-text-muted);
    font-size: 12px;
  }
</style>
