<script lang="ts">
  import { onMount } from 'svelte';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import ProvinceMap from '$lib/components/ProvinceMap.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import {
    api,
    labels,
    number,
    type Workspace,
    type Observations,
  } from '$lib/api/workspace';
  let workspace = $state<Workspace>();
  let data = $state<Observations>();
  let indicator = $state('sanitation_percent');
  let level = $state('SD');
  let query = $state('');
  let selected = $state('');
  let error = $state('');
  let loading = $state(true);
  let descending = $state(false);
  let requestId = 0;
  let mapAttempt = $state(0);
  const filtered = $derived(
    (data?.rows ?? [])
      .filter((row) =>
        row.name
          .toLocaleLowerCase('id')
          .includes(query.toLocaleLowerCase('id')),
      )
      .toSorted((a, b) =>
        a.value === null
          ? b.value === null
            ? 0
            : 1
          : b.value === null
            ? -1
            : (Number(a.value) - Number(b.value)) * (descending ? -1 : 1),
      ),
  );
  const detail = $derived(data?.rows.find((row) => row.code === selected));
  const isPercent = $derived(data?.source.unit === 'percent');
  const available = $derived(filtered.filter((row) => row.value !== null));
  const values = $derived(available.map((row) => Number(row.value)));
  const minimum = $derived(values.length ? Math.min(...values) : null);
  const maximum = $derived(values.length ? Math.max(...values) : null);
  const shortlist = $derived(
    available
      .toSorted(
        (a, b) => (Number(a.value) - Number(b.value)) * (isPercent ? 1 : -1),
      )
      .slice(0, 5),
  );
  const max = $derived(isPercent ? 100 : Math.max(1, ...values));
  const exportUrl = $derived(
    '/api/v1/observations/export?' +
      new URLSearchParams({ indicator, education_level: level, q: query }),
  );
  const shortName = (name: string) => name.replace(/^Provinsi /, '');
  async function load() {
    const id = ++requestId;
    loading = true;
    error = '';
    data = undefined;
    try {
      if (!workspace) workspace = await api<Workspace>('workspace');
      const result = await api<Observations>(
        'observations?' +
          new URLSearchParams({ indicator, education_level: level }),
      );
      if (id === requestId) data = result;
    } catch (e) {
      if (id === requestId) error = (e as Error).message;
    } finally {
      if (id === requestId) loading = false;
    }
  }
  onMount(load);
</script>

<svelte:head><title>Explorer pendidikan · Equora</title></svelte:head>
<WorkspaceShell
  title="Explorer pendidikan"
  subtitle="Telusuri akses fasilitas sekolah, bandingkan wilayah, dan periksa sumber di balik angkanya."
>
  <section class="explorer-filters" aria-label="Filter data pendidikan">
    <label class="indicator-filter"
      >Indikator<select
        bind:value={indicator}
        onchange={load}
        disabled={!workspace}
        >{#each workspace?.sources ?? [] as source}<option
            value={source.source_id}
            >{labels[source.source_id] ?? source.title}</option
          >{/each}</select
      ></label
    >
    <label
      >Jenjang<select bind:value={level} onchange={load}
        >{#each workspace?.education_levels ?? ['SD'] as item}<option
            >{item}</option
          >{/each}</select
      ></label
    >
    <label class="province-filter"
      >Cari provinsi<span class="search-control"
        ><Icon name="search" size={17} /><input
          type="search"
          bind:value={query}
          oninput={() => (selected = '')}
          placeholder="Nama provinsi…"
        /></span
      ></label
    >
    <div class="filter-scope">
      <span>Tahun ajaran</span><strong>2025/2026</strong><small
        >Negeri + Swasta</small
      >
    </div>
  </section>
  {#if loading}<div class="explorer-loading" role="status">
      <span class="loading-line"></span>Memuat observasi pendidikan…
    </div>{/if}
  {#if error}<div class="work-error" role="alert">{error}</div>
    <button class="eq-button" onclick={load}>Coba lagi</button>{/if}
  {#if data}
    <section class="data-summary" aria-label="Ringkasan hasil filter">
      <div>
        <p>Wilayah ditampilkan</p>
        <strong>{filtered.length}<span>provinsi</span></strong><small
          >Dari {data.rows.length} provinsi dalam snapshot</small
        >
      </div>
      <div>
        <p>Ketersediaan data</p>
        <strong
          >{available.length}<span>/ {filtered.length} provinsi</span></strong
        ><small
          >{filtered.length - available.length
            ? `${filtered.length - available.length} nilai tidak tersedia pada scope ini`
            : 'Seluruh hasil filter memiliki nilai'}</small
        >
      </div>
      <div>
        <p>Rentang {isPercent ? 'akses antarprovinsi' : 'jumlah sekolah'}</p>
        <strong class="range-value"
          >{minimum === null ? '—' : number(minimum)}<span class="range-dash"
            >—</span
          >{maximum === null ? '—' : number(maximum)}<span
            >{isPercent ? '%' : 'sekolah'}</span
          ></strong
        ><small>Nilai minimum–maksimum hasil filter</small>
      </div>
    </section>
    <div class="explorer-grid">
      <section class="geography-panel" aria-labelledby="geography-title">
        <header class="geography-heading">
          <div>
            <p class="panel-eyebrow">PETA SEBARAN</p>
            <h2 id="geography-title">{labels[indicator]}</h2>
          </div>
          <span class="scope-badge">{level} · Total</span>
        </header>
        <p class="indicator-definition">{data.source.definition}</p>
        {#key mapAttempt}<ProvinceMap
            onretry={() => mapAttempt++}
            rows={filtered}
            percent={isPercent}
            {selected}
            onselect={(code) => (selected = code)}
          />{/key}
      </section>
      <aside class="region-panel" aria-label="Tinjauan wilayah">
        <div class="region-panel-header">
          <Icon name="map" size={18} /><span>Tinjauan wilayah</span
          >{#if detail}<button
              aria-label="Hapus pilihan wilayah"
              onclick={() => (selected = '')}
              ><Icon name="close" size={17} /></button
            >{/if}
        </div>
        {#if detail}
          <section class="selected-region" aria-live="polite">
            <span class="region-code">WILAYAH {detail.code}</span>
            <h2>{detail.name}</h2>
            <p class="selected-value">
              {number(detail.value)}{#if detail.value !== null}<span
                  >{isPercent ? '%' : 'sekolah'}</span
                >{/if}
            </p>
            <p class="selected-label">{labels[indicator]} · {level}</p>
            <dl>
              <dt>Status</dt>
              <dd>
                {detail.status === 'available'
                  ? 'Data tersedia'
                  : detail.status === 'no_schools'
                    ? 'Tidak ada sekolah pada scope ini'
                    : 'Data tidak tersedia'}
              </dd>
              <dt>Jumlah sekolah</dt>
              <dd>{number(detail.denominator, 0)}</dd>
              <dt>Sel sumber</dt>
              <dd>{detail.source_cell}</dd>
              <dt>Tahun ajaran</dt>
              <dd>{data.academic_year}</dd>
            </dl>
            <a
              class="eq-button region-detail-link"
              href={'/regions/' + detail.code + '?level=' + level}
              >Seluruh indikator wilayah <Icon name="arrow" size={16} /></a
            >
          </section>
        {:else}
          <div class="region-intro">
            <h2>Mulai dari satu wilayah.</h2>
            <p>
              Pilih provinsi di peta atau tabel untuk melihat nilai dan
              sumbernya.
            </p>
          </div>
          <div class="shortlist">
            <h3>
              {isPercent ? 'Lima akses terendah' : 'Lima jumlah tertinggi'}
            </h3>
            <p class="shortlist-caption">
              {isPercent
                ? 'Pada indikator yang sedang dipilih'
                : 'Pada hasil filter yang ditampilkan'}
            </p>
            {#each shortlist as row, index}<button
                class="shortlist-row"
                aria-label={'Pilih ' + row.name}
                onclick={() => (selected = row.code)}
                ><span class="shortlist-index">{index + 1}</span><span
                  >{shortName(row.name)}</span
                ><strong>{number(row.value)}{isPercent ? '%' : ''}</strong
                ></button
              >{/each}{#if !shortlist.length}<p class="work-muted">
                Belum ada nilai pada hasil filter ini.
              </p>{/if}
          </div>
        {/if}
        <div class="interpretation">
          <Icon name="info" size={17} />
          <p>
            {isPercent
              ? 'Akses lebih rendah menunjukkan kebutuhan lebih besar. Ini belum skor prioritas berbobot.'
              : 'Jumlah sekolah adalah konteks. Nilai ini tidak digunakan langsung sebagai skor kebutuhan.'}
          </p>
        </div>
      </aside>
    </div>
    <section class="observation-panel" aria-labelledby="observation-title">
      <header class="observation-heading">
        <div>
          <p class="panel-eyebrow">DATA PER PROVINSI</p>
          <h2 id="observation-title">Bandingkan angkanya</h2>
          <p>
            {filtered.length} provinsi · {data.academic_year} · {level}, Total
          </p>
        </div>
        <div class="table-actions">
          <a class="eq-button" href={'/datasets/' + indicator}
            ><Icon name="database" size={16} />Sumber & kualitas</a
          ><a class="eq-button eq-button-primary" href={exportUrl}
            ><Icon name="download" size={16} />Unduh CSV hasil filter</a
          >
        </div>
      </header>
      <div class="table-toolbar">
        <p>
          <span class="legend-dot"></span>{labels[indicator]}
          <span class="unit-label">{isPercent ? '(%)' : '(sekolah)'}</span>
        </p>
        <button class="sort-button" onclick={() => (descending = !descending)}
          ><Icon name="sliders" size={16} />Urutan: {descending
            ? 'nilai tertinggi'
            : 'nilai terendah'}</button
        >
      </div>
      <div class="observation-table">
        <table>
          <caption class="eq-sr-only"
            >Nilai akses / ketersediaan · {level} · {data.academic_year}</caption
          ><thead
            ><tr
              ><th scope="col">Provinsi</th><th scope="col"
                >Nilai {isPercent ? '(%)' : '(sekolah)'}</th
              ><th scope="col">Kualitas data</th><th scope="col">Sel sumber</th
              ></tr
            ></thead
          ><tbody>
            {#each filtered as row}<tr class:selected={selected === row.code}
                ><td
                  ><button
                    class="region-pick"
                    aria-pressed={selected === row.code}
                    onclick={() => (selected = row.code)}
                    >{row.name}<span class="row-arrow"
                      ><Icon name="arrow" size={15} /></span
                    ></button
                  ></td
                ><td
                  ><div class="value-cell">
                    <span>{number(row.value)}</span
                    >{#if row.value !== null}<span class="value-track"
                        ><span
                          style:width={Math.max(
                            0.5,
                            (Number(row.value) / max) * 100,
                          ) + '%'}
                        ></span></span
                      >{/if}
                  </div></td
                ><td
                  >{#if row.status === 'available'}<span
                      class="quality-available">Tersedia</span
                    >{:else}<span class="quality-missing"
                      >{row.status === 'no_schools'
                        ? 'Tidak ada sekolah pada scope ini'
                        : 'Data tidak tersedia'}</span
                    >{/if}</td
                ><td class="source-cell">{row.source_cell}</td></tr
              >{/each}
            {#if !filtered.length}<tr
                ><td colspan="4" class="empty-results"
                  >Tidak ada provinsi yang sesuai pencarian.</td
                ></tr
              >{/if}
          </tbody>
        </table>
      </div>
      <footer class="table-provenance">
        <span>Snapshot <span class="snapshot-id">{data.release_id}</span></span
        ><a href={data.source.source_url} target="_blank" rel="noreferrer"
          >Sumber asli <Icon name="arrow" size={14} /></a
        >
      </footer>
    </section>
  {/if}
</WorkspaceShell>

<style>
  .explorer-filters {
    display: grid;
    grid-template-columns:
      minmax(190px, 1.4fr) minmax(80px, 0.55fr) minmax(160px, 1fr)
      auto;
    gap: 20px;
    align-items: end;
    padding: 14px 20px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .explorer-filters label {
    display: grid;
    gap: 7px;
    font-size: 12px;
    color: var(--eq-text-secondary);
    font-weight: 550;
    min-width: 0;
  }
  .explorer-filters select {
    max-width: none;
    font-size: 13px;
    border-color: var(--eq-control-border);
    padding-inline: 12px 30px;
  }
  .filter-scope {
    border-left: 1px solid var(--eq-border);
    padding: 0 0 1px 20px;
    display: grid;
    gap: 2px;
    min-height: 64px;
  }
  .filter-scope > span {
    font-size: 11px;
    color: var(--eq-text-secondary);
  }
  .filter-scope strong {
    font-size: 14px;
    font-weight: 600;
  }
  .filter-scope small {
    font-size: 11px;
    color: var(--eq-text-secondary);
  }
  .search-control {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-control :global(svg) {
    position: absolute;
    left: 12px;
    color: var(--eq-text-secondary);
    pointer-events: none;
  }
  .search-control input {
    padding-left: 36px;
    font-size: 13px;
  }
  .data-summary {
    display: grid;
    grid-template-columns: 1fr 1fr 1.25fr;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    margin-bottom: 22px;
    padding: 16px 0;
  }
  .data-summary > div {
    padding: 0 24px;
    min-width: 0;
  }
  .data-summary > div + div {
    border-left: 1px solid var(--eq-border);
  }
  .data-summary p {
    font-size: 12px;
    color: var(--eq-text-secondary);
    margin-bottom: 7px;
  }
  .data-summary strong {
    font-size: clamp(23px, 2.4vw, 30px);
    line-height: 1.25;
    font-weight: 650;
    display: block;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
  }
  .data-summary strong span {
    font-size: 12px;
    color: var(--eq-text-secondary);
    font-weight: 400;
    margin-left: 8px;
    letter-spacing: 0;
  }
  .data-summary .range-value {
    font-size: clamp(21px, 2vw, 27px);
  }
  .data-summary .range-dash {
    margin-inline: 8px;
    font-size: 20px;
  }
  .data-summary small {
    display: block;
    font-size: 11px;
    color: var(--eq-text-secondary);
    margin-top: 6px;
  }
  .explorer-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 290px;
    gap: 20px;
    align-items: stretch;
    margin-bottom: 22px;
  }
  .geography-panel,
  .region-panel,
  .observation-panel {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    min-width: 0;
    overflow: hidden;
  }
  .geography-panel {
    padding: 22px;
  }
  .geography-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
  }
  .panel-eyebrow {
    font-size: 10px;
    letter-spacing: 0.12em;
    font-weight: 600;
    color: var(--eq-text-muted);
    margin-bottom: 7px;
  }
  .geography-heading h2,
  .observation-heading h2 {
    font-size: 19px;
    letter-spacing: -0.025em;
  }
  .scope-badge {
    background: var(--eq-sidebar);
    border: 1px solid var(--eq-border);
    padding: 5px 9px;
    border-radius: 5px;
    color: var(--eq-text-secondary);
    font-size: 11px;
    white-space: nowrap;
  }
  .indicator-definition {
    font-size: 12px;
    color: var(--eq-text-secondary);
    margin: 12px 0 16px;
    line-height: 1.6;
  }
  .region-panel {
    display: flex;
    flex-direction: column;
  }
  .region-panel-header {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 57px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--eq-border);
    font-size: 13px;
    font-weight: 600;
  }
  .region-panel-header :global(svg) {
    color: var(--eq-text-secondary);
  }
  .region-panel-header button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: none;
    border: 0;
    margin: -8px -10px -8px auto;
  }
  .region-intro {
    padding: 22px 20px 18px;
  }
  .region-intro h2 {
    font-size: 18px;
    line-height: 1.3;
  }
  .region-intro p {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--eq-text-secondary);
  }
  .shortlist {
    padding: 0 20px 22px;
  }
  .shortlist h3 {
    font-size: 12px;
    font-weight: 600;
  }
  .shortlist-caption {
    font-size: 11px;
    color: var(--eq-text-secondary);
    margin: 4px 0 12px;
  }
  .shortlist-row {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 9px;
    width: 100%;
    min-height: 46px;
    padding: 10px 0;
    border: 0;
    border-bottom: 1px solid var(--eq-border);
    background: none;
    font-size: 12px;
  }
  .shortlist-row:hover {
    color: var(--eq-primary-hover);
  }
  .shortlist-row strong {
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .shortlist-index {
    color: var(--eq-text-muted);
    min-width: 14px;
    font-size: 11px;
  }
  .interpretation {
    display: flex;
    gap: 10px;
    margin-top: auto;
    background: var(--eq-sidebar);
    border-top: 1px solid var(--eq-border);
    padding: 16px 20px;
  }
  .interpretation :global(svg) {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--eq-text-secondary);
  }
  .interpretation p {
    font-size: 11px;
    line-height: 1.7;
    color: var(--eq-text-secondary);
  }
  .selected-region {
    padding: 22px 20px;
  }
  .region-code {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--eq-text-secondary);
  }
  .selected-region h2 {
    font-size: 21px;
    line-height: 1.3;
    margin-top: 8px;
  }
  .selected-value {
    font-size: 38px;
    line-height: 1.3;
    letter-spacing: -0.05em;
    font-weight: 650;
    margin-top: 22px;
    color: var(--eq-primary-hover);
    font-variant-numeric: tabular-nums;
  }
  .selected-value span {
    font-size: 16px;
    margin-left: 5px;
    font-weight: 450;
  }
  .selected-label {
    font-size: 12px;
    color: var(--eq-text-secondary);
    margin-top: 5px;
  }
  .selected-region dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-size: 12px;
    gap: 12px;
    padding-top: 22px;
    margin-top: 22px;
    border-top: 1px solid var(--eq-border);
  }
  .selected-region dt {
    color: var(--eq-text-secondary);
  }
  .selected-region dd {
    margin: 0;
    text-align: right;
  }
  .region-detail-link {
    margin-top: 24px;
    width: 100%;
    font-size: 12px;
    padding-inline: 10px;
    gap: 8px;
  }
  .observation-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 24px;
  }
  .observation-heading > div > p:last-child {
    font-size: 12px;
    color: var(--eq-text-secondary);
    margin-top: 7px;
  }
  .table-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .table-actions .eq-button {
    font-size: 12px;
    padding: 10px 14px;
    gap: 8px;
  }
  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 10px 24px;
    border-top: 1px solid var(--eq-border);
    border-bottom: 1px solid var(--eq-border);
  }
  .table-toolbar > p {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    font-weight: 550;
  }
  .legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background: var(--eq-primary);
  }
  .unit-label {
    color: var(--eq-text-secondary);
  }
  .sort-button {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 44px;
    border: 0;
    padding: 6px 0;
    background: none;
    color: var(--eq-text-secondary);
    font-size: 12px;
  }
  .observation-table {
    overflow-x: auto;
  }
  .observation-table table {
    font-size: 13px;
  }
  .observation-table th {
    font-size: 11px;
    color: var(--eq-text-secondary);
    font-weight: 550;
    padding: 13px 24px;
  }
  .observation-table td {
    padding: 8px 24px;
    vertical-align: middle;
  }
  .observation-table th:first-child {
    width: 36%;
  }
  .observation-table th:nth-child(2) {
    width: 28%;
  }
  .region-pick {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: none;
    border: 0;
    min-height: 44px;
    width: 100%;
    padding: 4px 0;
    text-align: left;
    color: var(--eq-text);
    font-size: 13px;
  }
  .region-pick:hover,
  .region-pick[aria-pressed='true'] {
    color: var(--eq-primary-hover);
  }
  .row-arrow {
    color: var(--eq-text-muted);
    opacity: 0.7;
  }
  .value-cell {
    display: flex;
    align-items: center;
    gap: 14px;
    font-variant-numeric: tabular-nums;
    min-width: 150px;
  }
  .value-cell > span:first-child {
    min-width: 45px;
  }
  .value-track {
    background: var(--eq-primary-tint);
    height: 5px;
    width: 100%;
    max-width: 150px;
    border-radius: 3px;
    display: block;
  }
  .value-track > span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--eq-chart-blue);
  }
  .quality-available {
    display: inline-flex;
    padding: 3px 8px;
    background: var(--eq-success-tint);
    color: var(--eq-success);
    border-radius: 5px;
    font-size: 11px;
    white-space: nowrap;
  }
  .quality-missing {
    color: var(--eq-warning);
    font-size: 12px;
  }
  .source-cell {
    font-family: ui-monospace, monospace;
    color: var(--eq-text-secondary);
    font-size: 12px;
  }
  .empty-results {
    height: 130px;
    text-align: center;
    color: var(--eq-text-secondary);
  }
  .table-provenance {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 24px;
    font-size: 11px;
    color: var(--eq-text-secondary);
    border-top: 1px solid var(--eq-border);
  }
  .table-provenance a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--eq-primary-hover);
    text-decoration: none;
    white-space: nowrap;
  }
  .snapshot-id {
    font-family: ui-monospace, monospace;
    overflow-wrap: anywhere;
  }
  .explorer-loading {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--eq-text-secondary);
    font-size: 14px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
  }
  .loading-line {
    width: 48px;
    height: 4px;
    background: var(--eq-primary-tint);
    border-radius: 4px;
    overflow: hidden;
  }
  .loading-line::before {
    content: '';
    display: block;
    height: 100%;
    width: 50%;
    background: var(--eq-primary);
    animation: loading 1s ease-in-out infinite alternate;
  }
  @keyframes loading {
    to {
      transform: translateX(100%);
    }
  }
  @media (max-width: 1200px) {
    .explorer-grid {
      grid-template-columns: minmax(0, 1fr) 260px;
      gap: 16px;
    }
    .data-summary > div {
      padding-inline: 18px;
    }
    .geography-panel {
      padding: 18px;
    }
    .explorer-filters {
      gap: 14px;
    }
    .observation-heading {
      align-items: flex-start;
    }
  }
  @media (max-width: 1050px) {
    .explorer-filters {
      grid-template-columns: minmax(160px, 1fr) 90px minmax(140px, 1fr);
    }
    .filter-scope {
      grid-column: 1/-1;
      min-height: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 0;
      border-top: 1px solid var(--eq-border);
      padding: 12px 0 0;
    }
    .filter-scope strong {
      font-size: 12px;
    }
    .filter-scope small {
      margin-left: auto;
    }
    .explorer-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .region-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .region-panel-header {
      grid-column: 1/-1;
    }
    .shortlist {
      padding-top: 22px;
    }
    .interpretation {
      grid-column: 1/-1;
    }
    .selected-region {
      grid-column: 1/-1;
    }
    .observation-heading {
      flex-direction: column;
    }
  }
  @media (max-width: 600px) {
    .explorer-filters {
      grid-template-columns: minmax(0, 1fr) 90px;
      padding: 16px;
      gap: 14px;
    }
    .province-filter {
      grid-column: 1/-1;
    }
    .data-summary {
      grid-template-columns: 1fr 1fr;
      padding: 16px 0;
      margin-bottom: 16px;
    }
    .data-summary > div {
      padding-inline: 16px;
    }
    .data-summary > div:last-child {
      grid-column: 1/-1;
      border-left: 0;
      border-top: 1px solid var(--eq-border);
      padding-top: 14px;
      margin-top: 14px;
    }
    .data-summary strong {
      font-size: 27px;
    }
    .data-summary small {
      font-size: 10px;
    }
    .data-summary strong span {
      font-size: 11px;
    }
    .data-summary .range-value {
      font-size: 25px;
    }
    .geography-panel {
      padding: 16px;
    }
    .geography-heading h2 {
      font-size: 18px;
    }
    .region-panel {
      display: flex;
    }
    .shortlist {
      padding-top: 0;
    }
    .region-intro h2 {
      font-size: 17px;
    }
    .shortlist-row {
      min-height: 48px;
    }
    .observation-heading {
      padding: 18px 16px;
    }
    .table-actions {
      width: 100%;
    }
    .table-actions .eq-button {
      flex-grow: 1;
    }
    .table-toolbar {
      flex-wrap: wrap;
      gap: 2px;
      padding: 12px 16px;
    }
    .observation-table td,
    .observation-table th {
      padding-inline: 16px;
    }
    .observation-table th:first-child {
      min-width: 190px;
    }
    .observation-table th:nth-child(3) {
      min-width: 150px;
    }
    .observation-table th:last-child {
      min-width: 100px;
    }
    .table-provenance {
      align-items: flex-start;
      padding-inline: 16px;
    }
    .table-provenance > span {
      max-width: 70%;
    }
  }
</style>
