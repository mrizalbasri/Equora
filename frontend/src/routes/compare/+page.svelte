<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import {
    api,
    downloadComparison,
    rupiah,
    type SavedScenario,
  } from '$lib/api/workspace';
  let saved = $state<SavedScenario[]>([]);
  let loading = $state(true);
  let left = $state('');
  let right = $state('');
  let error = $state('');
  let busy = $state(false);
  let names = $state<Record<string, string>>({});
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
  }>();

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

  async function load() {
    loading = true;
    error = '';
    try {
      const [items, regions] = await Promise.all([
        api<SavedScenario[]>('scenarios'),
        api<{ code: string; name: string }[]>('regions'),
      ]);
      saved = items;
      left = page.url.searchParams.get('left') ?? saved[0]?.id ?? '';
      right = saved.find((item) => item.id !== left)?.id ?? '';
      names = Object.fromEntries(regions.map((row) => [row.code, row.name]));
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
  {:else if saved.length < 2}
    <div class="empty-state">
      <div class="empty-state-icon">
        <Icon name="compare" size={24} />
      </div>
      <h3>Perlu minimal dua skenario tersimpan</h3>
      <p>
        Perbandingan alokasi membutuhkan sedikitnya dua snapshot skenario untuk
        menganalisis perbedaan peringkat, jangkauan provinsi, dan pergeseran anggaran.
      </p>
      <a class="eq-button eq-button-primary" href="/studio">
        Buka Studio Simulasi
      </a>
    </div>
  {:else}
    <form onsubmit={compare} class="work-panel compare-form">
      <h2>Pilih skenario untuk dibandingkan</h2>
      <div class="work-controls">
        <label>
          Skenario awal
          <select
            bind:value={left}
            onchange={() => (result = undefined)}
            required
          >
            <option value="">Pilih snapshot</option>
            {#each saved as item}
              <option value={item.id}>
                {item.name} · {formatDate(item.created_at)}
              </option>
            {/each}
          </select>
        </label>
        <label>
          Skenario pembanding
          <select
            bind:value={right}
            onchange={() => (result = undefined)}
            required
          >
            <option value="">Pilih snapshot</option>
            {#each saved as item}
              <option value={item.id}>
                {item.name} · {formatDate(item.created_at)}
              </option>
            {/each}
          </select>
        </label>
        <button
          class="eq-button eq-button-primary compare-submit"
          disabled={busy || !left || !right || left === right}
        >
          {busy ? 'Membandingkan…' : 'Bandingkan'}
        </button>
      </div>
      {#if left && right && left === right}
        <p class="work-muted helper-text">
          Pilih dua skenario berbeda untuk melihat pergeseran alokasi.
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

      <div class="work-grid compare-coverage-grid">
        {#each Object.entries(result.coverage) as [key, value]}
          <div class="coverage-box">
            <span class="eq-badge {key === 'left' ? 'eq-badge-neutral' : 'eq-badge-primary'}">
              {key === 'left' ? 'Skenario Awal' : 'Skenario Pembanding'}
            </span>
            <p class="stat stat-coverage">
              {value.receiving_regions}
              <span class="stat-unit">/ {value.eligible_regions} provinsi</span>
            </p>
            <p class="work-muted">
              Menerima <strong>{value.total_packages}</strong> paket total.
              {#if value.excluded_regions > 0}
                {value.excluded_regions} wilayah dikecualikan karena data tidak lengkap.
              {:else}
                Tidak ada wilayah yang dikeluarkan karena kelengkapan data.
              {/if}
            </p>
          </div>
        {/each}
      </div>

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
    margin-bottom: 20px;
  }
  .coverage-box {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    padding: 16px 20px;
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
