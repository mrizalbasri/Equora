<script lang="ts">
  import { tick } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import ScenarioResult from '$lib/components/ScenarioResult.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import CustomDropdown, { type DropdownOption } from '$lib/components/CustomDropdown.svelte';
  import { focusedWeights } from '$lib/studio-focus';
  import {
    api,
    labels,
    rupiah,
    type Workspace,
    type Snapshot,
    type SavedScenario,
  } from '$lib/api/workspace';
  let workspace = $state<Workspace>();
  let regions = $state<{ code: string; name: string }[]>([]);
  let saved = $state<SavedScenario[]>([]);
  let savedError = $state('');
  let loadingSaved = $state(true);
  let savedRequest = 0;
  let attempt = $state(0);
  let name = $state('Simulasi alokasi fasilitas sekolah');
  let level = $state('SD');
  let budget = $state<number | undefined>(1000000000);
  let cost = $state<number | undefined>(10000000);
  let capacity = $state<number | undefined>(10);
  let minimum = $state<number | undefined>(0);
  let activePreset = $state<'sanitation' | 'digital' | 'affirmation' | 'equal' | null>('equal');
  let focusIndicator = $state<string>();
  let weights = $state<Record<string, number>>({
    sanitation_percent: 25,
    water_percent: 25,
    internet_percent: 25,
    computers_percent: 25,
  });
  let selected = $state<string[]>([]);
  let regionQuery = $state('');
  let overrides = $state<
    Record<
      string,
      { cost_idr: number; capacity: number; minimum_packages: number }
    >
  >({});
  let result = $state<Snapshot>();
  let resultContainer = $state<HTMLDivElement>();
  let busy = $state(false);
  let error = $state('');
  let loadingRegions = $state(true);
  let contextRequest = 0;
  let regionRequest = 0;

  const levelDescriptions: Record<string, string> = {
    TK: 'Taman Kanak-Kanak / PAUD',
    SD: 'Sekolah Dasar',
    SMP: 'Sekolah Menengah Pertama',
    SMA: 'Sekolah Menengah Atas',
    SMK: 'Sekolah Menengah Kejuruan',
    SLB: 'Sekolah Luar Biasa',
  };
  const levelDropdownOptions = $derived<DropdownOption[]>(
    (workspace?.education_levels ?? ['SD']).map((lvl) => ({
      value: lvl,
      label: lvl,
      desc: levelDescriptions[lvl] ?? lvl,
      icon: 'education',
    })),
  );

  const names = $derived(
    Object.fromEntries(regions.map((row) => [row.code, row.name])),
  );
  const provinceParam = $derived(page.url.searchParams.get('province'));
  const baseId = $derived(page.url.searchParams.get('base'));
  const compareResultHref = $derived(baseId && result && baseId !== result.id &&
    result.parameters.education_level === page.url.searchParams.get('level') &&
    ['optimal', 'feasible'].includes(result.allocation.status)
    ? '/compare?' + new URLSearchParams({ left: baseId, right: result.id })
    : undefined);
  const provinceName = $derived(provinceParam ? names[provinceParam] : undefined);
  const total = $derived(
    Object.values(weights).reduce((a, b) => a + (Number(b) || 0), 0),
  );
  const filteredRegions = $derived(
    regions.filter((row) =>
      row.name.toLocaleLowerCase('id').includes(regionQuery.toLocaleLowerCase('id')),
    ),
  );

  function applyPreset(preset: 'sanitation' | 'digital' | 'affirmation' | 'equal') {
    focusIndicator = undefined;
    activePreset = preset;
    if (preset === 'sanitation') {
      name = 'Prioritas sanitasi dan air';
      weights = {
        sanitation_percent: 50,
        water_percent: 30,
        internet_percent: 10,
        computers_percent: 10,
      };
    } else if (preset === 'digital') {
      name = 'Prioritas komputer dan internet';
      weights = {
        sanitation_percent: 10,
        water_percent: 10,
        internet_percent: 35,
        computers_percent: 45,
      };
    } else if (preset === 'affirmation') {
      name = 'Prioritas fasilitas dasar';
      weights = {
        sanitation_percent: 35,
        water_percent: 35,
        internet_percent: 15,
        computers_percent: 15,
      };
    } else {
      name = 'Alokasi Berimbang 4 Indikator';
      weights = {
        sanitation_percent: 25,
        water_percent: 25,
        internet_percent: 25,
        computers_percent: 25,
      };
    }
  }

  function resetEqualWeights() {
    applyPreset('equal');
  }

  $effect(() => {
    attempt;
    const release = page.url.searchParams.get('release');
    const requestedLevel = page.url.searchParams.get('level') ?? 'SD';
    const requestedProvince = page.url.searchParams.get('province');
    const requestedFocus = page.url.searchParams.get('focus');
    const id = ++contextRequest;
    void loadContext(release, requestedLevel, requestedProvince, requestedFocus, id);
    void loadSaved();
    return () => { contextRequest++; regionRequest++; };
  });

  async function loadSaved() {
    const id = ++savedRequest;
    loadingSaved = true;
    savedError = '';
    try {
      const snapshots = await api<SavedScenario[]>('scenarios');
      if (id === savedRequest) saved = snapshots;
    } catch {
      if (id === savedRequest) savedError = 'Daftar skenario belum dapat dimuat. Coba lagi.';
    } finally {
      if (id === savedRequest) loadingSaved = false;
    }
  }

  async function loadContext(release: string | null, requestedLevel: string, requestedProvince: string | null, requestedFocus: string | null, id: number) {
    workspace = undefined;
    regions = [];
    selected = [];
    result = undefined;
    error = '';
    loadingRegions = true;
    try {
      const current = await api<Workspace>('workspace?' + new URLSearchParams(release ? { release_id: release } : {}));
      if (release && current.id !== release) throw new Error('Rilis yang diminta tidak tersedia.');
      if (!current.education_levels.includes(requestedLevel)) throw new Error('Jenjang tidak tersedia pada rilis ini.');
      const list = await api<{ code: string; name: string }[]>('regions?' + new URLSearchParams({ release_id: current.id, education_level: requestedLevel }));
      if (id !== contextRequest) return;
      level = requestedLevel;
      workspace = current;
      regions = list;
      const focused = focusedWeights(current.core_indicators, requestedFocus);
      if (focused && requestedFocus) {
        weights = focused;
        activePreset = null;
        focusIndicator = requestedFocus;
        name = `Fokus awal ${labels[requestedFocus] ?? requestedFocus}`;
      } else {
        applyPreset('equal');
      }
      selected =
        requestedProvince && list.some((row) => row.code === requestedProvince)
          ? [requestedProvince]
          : regions.map((row) => row.code);
    } catch (e) {
      if (id === contextRequest) error = (e as Error).message;
    } finally {
      if (id === contextRequest) loadingRegions = false;
    }
  }

  async function changeLevel(nextLevel: string) {
    if (!workspace) return;
    const releaseId = workspace.id;
    const context = contextRequest;
    const id = ++regionRequest;
    level = nextLevel;
    loadingRegions = true;
    regions = [];
    selected = [];
    overrides = {};
    result = undefined;
    error = '';
    try {
      const list = await api<{ code: string; name: string }[]>('regions?' + new URLSearchParams({ release_id: releaseId, education_level: nextLevel }));
      if (id !== regionRequest || context !== contextRequest) return;
      regions = list;
      selected = list.map((row) => row.code);
    } catch (e) {
      if (id === regionRequest && context === contextRequest) error = (e as Error).message;
    } finally {
      if (id === regionRequest && context === contextRequest) loadingRegions = false;
    }
  }

  async function calculate(event: SubmitEvent) {
    event.preventDefault();
    if (!workspace || loadingRegions || total !== 100 || !selected.length) return;
    busy = true;
    error = '';
    result = undefined;
    try {
      result = await api<Snapshot>('scenarios', {
        release_id: workspace.id,
        name,
        education_level: level,
        budget_idr: budget,
        cost_idr: cost,
        capacity,
        minimum_packages: minimum,
        weights: Object.fromEntries(
          Object.entries(weights).map(([key, value]) => [
            key,
            (value / 100).toFixed(2),
          ]),
        ),
        region_codes: selected,
        overrides: Object.fromEntries(
          Object.entries(overrides).filter(([code]) => selected.includes(code)),
        ),
      });
      await loadSaved();
      await tick();
      resultContainer?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }

  function toggleOverride(code: string) {
    if (overrides[code]) {
      const next = { ...overrides };
      delete next[code];
      overrides = next;
    } else {
      overrides = {
        ...overrides,
        [code]: {
          cost_idr: cost ?? 1,
          capacity: capacity ?? 0,
          minimum_packages: minimum ?? 0,
        },
      };
    }
  }
</script>

<svelte:head><title>Studio simulasi · Equora</title><meta name="description" content="Atur bobot prioritas indikator, cakupan wilayah, dan batasan anggaran untuk menguji skenario alokasi fasilitas pendidikan." /></svelte:head>
<WorkspaceShell
  title="Studio simulasi"
  subtitle="Atur kebutuhan dan anggaran, simpan skenario, lalu uji keputusan, pemerataan antarprovinsi, dan bukti sumbernya."
>
  {#if page.url.searchParams.has('release')}
    <aside class="work-panel" aria-label={baseId ? 'Konteks perbandingan' : 'Konteks dari profil wilayah'}>
      <strong>{baseId ? 'Menyiapkan skenario pembanding' : 'Melanjutkan dari profil wilayah'}{provinceName ? ` · ${provinceName}` : ''}</strong>
      <p>Rilis {page.url.searchParams.get('release')} · Jenjang {level}. {provinceName ? `Cakupan awal adalah ${provinceName}; tambahkan provinsi lain bila perlu.` : 'Cakupan awal adalah seluruh provinsi yang tersedia pada jenjang ini.'} Periksa cakupan dan asumsi sebelum menghitung.</p>
      {#if focusIndicator}<p><strong>Titik awal fokus: {labels[focusIndicator] ?? focusIndicator}.</strong> Bobot 70% hanya diisi sebagai titik awal dari profil wilayah dan dapat diubah; ini bukan rekomendasi kebijakan.</p>{/if}
      {#if error && !workspace}<a class="eq-button" href="/studio">Buka Studio dengan rilis aktif</a>{/if}
    </aside>
  {/if}
  {#if loadingRegions}<p role="status" class="eq-loading-status"><span class="eq-loading-line" aria-hidden="true"></span><span>Memuat cakupan provinsi pada rilis dan jenjang yang dipilih…</span></p>{/if}
  {#if error}
    <div class="work-error" role="alert">
      <Icon name="alert" size={18} />
      <div><strong>{!workspace ? 'Data simulasi belum dapat dimuat.' : 'Simulasi belum dapat dilanjutkan.'}</strong><p>{error}</p></div>
    </div>
    {#if !workspace && !loadingRegions}<button class="eq-button" onclick={() => attempt++}>Coba lagi memuat data</button>{/if}
  {/if}
  {#if error && workspace && !regions.length && !loadingRegions}
    <button class="eq-button" onclick={() => changeLevel(level)}>Coba lagi memuat provinsi</button>
  {/if}
  <form class="studio-form" onsubmit={calculate}>
    <fieldset aria-label="Parameter simulasi" disabled={!workspace || loadingRegions || busy}>
    <section class="work-panel">
      <h2>1. Cakupan dan asumsi biaya</h2>
      <p class="work-muted">
        Angka awal adalah asumsi demo yang dapat diubah. Satu paket adalah unit
        intervensi simulasi; pada estimasi dampak, satu paket diasumsikan
        rehabilitasi untuk satu satuan pendidikan.
      </p>
      <div class="work-grid">
        <label class="work-field">
          Nama skenario
          <input bind:value={name} required maxlength="100" />
        </label>
        <div class="work-field">
          <span class="field-title">Jenjang</span>
          <CustomDropdown
            id="studio-level-select"
            label="Jenjang"
            value={level}
            options={levelDropdownOptions}
            disabled={!workspace || busy}
            onchange={(val) => changeLevel(val)}
          />
        </div>
        <label class="work-field">
            <span class="field-title">Batas anggaran simulasi (Rp)</span>
          <input
            type="number"
            bind:value={budget}
            required
            min="0"
            max="10000000000000"
            step="1"
          />
          <span class="rupiah-hint">{rupiah(budget ?? 0)}</span>
        </label>
        <div class="work-field">
          <label>
            <span class="field-title">Biaya per Paket (Rp)</span>
            <input
              type="number"
              bind:value={cost}
              required
              min="1"
              max="1000000000000"
              step="1"
            />
            <span class="rupiah-hint">{rupiah(cost ?? 0)}</span>
          </label>
          <details class="cost-assumption">
            <summary>Dari mana angka ini?</summary>
            <p>
              Biaya per paket adalah <strong>asumsi yang Anda tentukan sendiri</strong>,
              bukan referensi anggaran resmi. Nilai awal Rp10 juta hanyalah contoh
              ilustrasi untuk demo — ganti sesuai konteks daerah Anda dan hasil
              simulasi akan menyesuaikan. Lihat <a href="/methodology">Metodologi</a>
              untuk batas penggunaan.
            </p>
          </details>
        </div>
        <label class="work-field">
          <span class="field-title">Maksimum paket per provinsi</span>
          <input
            type="number"
            bind:value={capacity}
            required
            min="0"
            max="10000"
            step="1"
          />
          <span class="field-help">Batas jumlah paket untuk setiap provinsi.</span>
        </label>
        <label class="work-field">
          <span class="field-title">Minimum paket per provinsi</span>
          <input
            type="number"
            bind:value={minimum}
            required
            min="0"
            max="10000"
            step="1"
          />
          <span class="field-help">Isi 0 jika tidak ada minimum. Total minimum tetap harus sesuai anggaran.</span>
        </label>
      </div>
    </section>

    <section class="work-panel">
      <div class="panel-header-action">
        <div>
          <h2>2. Bobot prioritas kebutuhan</h2>
          <p class="work-muted">
            Bobot yang lebih besar memberi pengaruh lebih besar pada fasilitas tersebut. Jumlah seluruh bobot harus 100%. Pilih titik awal, lalu sesuaikan jika perlu.
          </p>
        </div>
      </div>

      <!-- 1-Click Policy Presets Bar -->
      <div class="preset-box">
        <div class="preset-header">

          <span>Pilih titik awal bobot</span>
        </div>
        <p class="work-muted">Pilihan ini hanya mengisi bobot indikator. Cakupan provinsi tetap mengikuti pilihan Anda; preset tidak menetapkan status darurat, wilayah 3T, atau rekomendasi kebijakan.</p>
        <div class="preset-grid">
          <button
            type="button"
            class="preset-card"
            class:active={activePreset === 'sanitation'}
            aria-pressed={activePreset === 'sanitation'}
            onclick={() => applyPreset('sanitation')}
          >
            <div class="preset-card-top">
              <strong class="preset-card-title">Sanitasi dan air</strong>
            </div>
            <p class="preset-card-desc">Sanitasi 50% · Air 30% · Digital 20%</p>
          </button>

          <button
            type="button"
            class="preset-card"
            class:active={activePreset === 'digital'}
            aria-pressed={activePreset === 'digital'}
            onclick={() => applyPreset('digital')}
          >
            <div class="preset-card-top">
              <strong class="preset-card-title">Komputer dan internet</strong>
            </div>
            <p class="preset-card-desc">Komputer 45% · Internet 35% · Dasar 20%</p>
          </button>

          <button
            type="button"
            class="preset-card"
            class:active={activePreset === 'affirmation'}
            aria-pressed={activePreset === 'affirmation'}
            onclick={() => applyPreset('affirmation')}
          >
            <div class="preset-card-top">
              <strong class="preset-card-title">Fasilitas dasar</strong>
            </div>
            <p class="preset-card-desc">Kebutuhan Dasar 70% · Digital 30%</p>
          </button>

          <button
            type="button"
            class="preset-card"
            class:active={activePreset === 'equal'}
            aria-pressed={activePreset === 'equal'}
            onclick={() => applyPreset('equal')}
          >
            <div class="preset-card-top">
              <strong class="preset-card-title">Empat indikator seimbang</strong>
            </div>
            <p class="preset-card-desc">25% Rata ke 4 Indikator</p>
          </button>
        </div>
      </div>

      <div class="work-grid">
        {#each Object.keys(weights) as key}
          <label class="work-field">
            <span class="field-title">
              {labels[key]} (%)
            </span>
            <input
              type="number"
              bind:value={weights[key]}
              oninput={() => { activePreset = null; focusIndicator = undefined; }}
              required
              min="0"
              max="100"
              step="1"
            />
          </label>
        {/each}
      </div>

      <div class="weight-composition" aria-hidden="true">
        {#if total === 100}
          {#each Object.values(weights) as weight, index}
            <span
              style:width={weight + '%'}
              style:background={['#14507c', '#367fb5', '#74a9cf', '#b4d1e8'][index]}
            ></span>
          {/each}
        {/if}
      </div>
      <p class="weight-total" class:invalid={total !== 100} aria-live="polite">
        Total bobot: <strong>{total}%</strong> {total !== 100 ? '— harus tepat 100%' : '✓ valid'}
      </p>
    </section>

    <details class="region-override-details">
      <summary>
        <span class="region-summary-left">
          <span class="step-badge" aria-hidden="true">3</span>
          <strong>Pilih wilayah dan sesuaikan biaya/kapasitas</strong>
          <span class="selected-count-badge">
            {selected.length} dari {regions.length} terpilih
          </span>
        </span>
        <span class="region-summary-toggle">
          <span class="toggle-text">Atur wilayah</span>
          <span class="region-chevron" aria-hidden="true">▾</span>
        </span>
      </summary>

      <div class="region-filter-bar">
        <div class="search-wrap">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Cari provinsi dalam daftar..."
            aria-label="Cari provinsi untuk simulasi"
            bind:value={regionQuery}
            class="region-search-input"
          />
        </div>
        <div class="work-actions region-select-actions" style="margin: 0;">
          <button
            type="button"
            class="eq-button eq-button-sm"
            onclick={() => (selected = regions.map((row) => row.code))}
          >
            Pilih semua
          </button>
          <button
            type="button"
            class="eq-button eq-button-sm"
            onclick={() => (selected = [])}
          >
            Kosongkan
          </button>
        </div>
      </div>

      <div class="region-options-list">
        {#each filteredRegions as row}
          <div class="region-option">
            <label class="region-checkbox-label">
              <input type="checkbox" bind:group={selected} value={row.code} />
              <span>{row.name}</span>
            </label>
            <button
              type="button"
              class="eq-button eq-button-sm region-override-btn"
              onclick={() => toggleOverride(row.code)}
            >
              {overrides[row.code] ? 'Hapus penyesuaian' : 'Sesuaikan'}
            </button>
            {#if overrides[row.code]}
              <div class="work-grid override-grid">
                <label class="work-field">
                  Biaya paket {row.name}
                  <input
                    type="number"
                    bind:value={overrides[row.code].cost_idr}
                    required
                    min="1"
                    max="1000000000000"
                    step="1"
                  />
                  <span class="rupiah-hint">{rupiah(overrides[row.code].cost_idr)}</span>
                </label>
                <label class="work-field">
                  Kapasitas {row.name}
                  <input
                    type="number"
                    bind:value={overrides[row.code].capacity}
                    required
                    min="0"
                    max="10000"
                    step="1"
                  />
                </label>
                <label class="work-field">
                  Minimum {row.name}
                  <input
                    type="number"
                    bind:value={overrides[row.code].minimum_packages}
                    required
                    min="0"
                    max="10000"
                    step="1"
                  />
                </label>
              </div>
            {/if}
          </div>
        {/each}
        {#if !filteredRegions.length}
          <p class="work-muted" style="padding: 16px 0;">
            Tidak ada provinsi yang cocok dengan pencarian "{regionQuery}".
          </p>
        {/if}
      </div>
    </details>

    <div class="studio-submit-bar" aria-describedby="public-scenario-notice">
      <div class="studio-privacy-notice" id="public-scenario-notice">
        <span class="notice-icon" aria-hidden="true"><Icon name="shield" size={16} /></span>
        <span>Skenario disimpan di ruang bersama. Nama, parameter, dan hasil dapat dibaca pengguna lain. Jangan masukkan data pribadi atau informasi rahasia.</span>
      </div>
      <div class="studio-action-buttons">
        <button
          class="eq-button eq-button-primary studio-btn-calc"
          disabled={busy || loadingRegions || !workspace || total !== 100 || !selected.length}
        >
          <span class="btn-icon" aria-hidden="true"><Icon name="sliders" size={17} /></span>
          <span>{busy ? 'Menghitung dan memvalidasi…' : 'Hitung Alokasi & Simpan Snapshot'}</span>
        </button>
        <a class="eq-button studio-btn-compare" href={compareResultHref ?? (baseId ? '/compare?' + new URLSearchParams({ left: baseId }) : '/compare')}>
          <span class="btn-icon" aria-hidden="true"><Icon name="compare" size={17} /></span>
          <span>Bandingkan Snapshot</span>
        </a>
      </div>
    </div>
    </fieldset>
  </form>

  {#if result}
    <div bind:this={resultContainer} style="scroll-margin-top: 88px;">
      <ScenarioResult {result} {names} compareHref={compareResultHref} />
    </div>
  {/if}

  <section class="work-panel saved-panel" id="skenario-tersimpan">
    <div class="panel-header-action">
      <div>
        <h2>Skenario tersimpan</h2>
        <p class="work-muted">Snapshot hasil perhitungan yang siap diuji dan dibandingkan.</p>
      </div>
      {#if !loadingSaved && !savedError}<span class="eq-badge eq-badge-neutral">{saved.length} tersimpan</span>{/if}
    </div>

    {#if loadingSaved}
      <p role="status" class="eq-loading-status"><span class="eq-loading-line" aria-hidden="true"></span><span>Memuat skenario tersimpan…</span></p>
    {:else if savedError}
      <p role="alert">{savedError}</p>
      <button class="eq-button" type="button" onclick={loadSaved}>Coba lagi memuat skenario</button>
    {:else if !saved.length}
      <div class="empty-state">
        <div class="empty-state-icon">
          <Icon name="chart" size={24} />
        </div>
        <h3>Belum ada snapshot skenario</h3>
        <p>
          Isi parameter biaya dan bobot di atas, lalu klik <strong>Hitung & simpan snapshot</strong>
          untuk menyimpan skenario pertama Anda.
        </p>
      </div>
    {:else}
      <div class="saved-scenarios-grid">
        {#each saved as item}
          <div class="saved-scenario-card">
            <div class="saved-card-header">
              <div class="saved-title-group">
                <span class="saved-icon" aria-hidden="true"><Icon name="chart" size={15} /></span>
                <a href={'/scenarios/' + item.id} class="saved-title">{item.name}</a>
              </div>
              <span
                class="eq-badge {item.status?.toLowerCase() === 'optimal' || item.status?.toLowerCase() === 'feasible'
                  ? 'eq-badge-success'
                  : 'eq-badge-warning'}"
              >
                {item.status}
              </span>
            </div>
            <p class="work-muted saved-time">
              <span class="time-dot" aria-hidden="true">•</span>
              {new Date(item.created_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <div class="saved-actions">
              <a class="saved-action-btn saved-btn-primary" href={'/scenarios/' + item.id}>
                <span>Buka hasil</span>
                <span class="btn-arrow" aria-hidden="true">→</span>
              </a>
              <a class="saved-action-btn saved-btn-secondary" href={'/compare?left=' + item.id}>
                <span class="btn-icon" aria-hidden="true"><Icon name="compare" size={14} /></span>
                <span>Bandingkan</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</WorkspaceShell>

<style>
  fieldset { display: contents; border: 0; padding: 0; margin: 0; min-width: 0; }
  .studio-form {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    align-items: start;
    gap: 20px;
  }
  .studio-form .work-panel {
    margin: 0;
  }
  .studio-form .work-muted {
    font-size: 12px;
    line-height: 1.7;
    margin-bottom: 20px;
  }
  .studio-form .work-grid {
    row-gap: 18px;
  }
  .rupiah-hint {
    font-size: 11px;
    color: var(--eq-primary-hover);
    font-weight: 550;
    font-variant-numeric: tabular-nums;
  }
  .cost-assumption {
    font-size: 12px;
  }
  .cost-assumption summary {
    cursor: pointer;
    color: var(--eq-primary-hover);
    font-weight: 550;
  }
  .cost-assumption p {
    margin: 6px 0 0;
    color: var(--eq-text-secondary);
    line-height: 1.55;
  }
  .panel-header-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .studio-form fieldset > details,
  #public-scenario-notice {
    grid-column: 1/-1;
  }
  .studio-form fieldset > details {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    padding: 18px 24px;
  }
  .region-override-details summary {
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 48px;
    padding: 2px 0;
  }
  .region-summary-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .step-badge {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--eq-primary-tint);
    color: var(--eq-primary);
    font-weight: 700;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .selected-count-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    color: var(--eq-primary-hover);
  }
  .region-summary-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 550;
    color: var(--eq-text-secondary);
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
  }
  .region-chevron {
    transition: transform 180ms ease;
  }
  .region-override-details[open] .region-chevron {
    transform: rotate(180deg);
  }
  .studio-submit-bar {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 8px;
  }
  .studio-privacy-notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: 8px;
    font-size: 12.5px;
    color: var(--eq-text-muted);
    line-height: 1.5;
  }
  .notice-icon {
    color: var(--eq-primary);
    margin-top: 1px;
    flex-shrink: 0;
  }
  .studio-action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .studio-btn-calc {
    background: linear-gradient(135deg, #1264d8, #0e4faf);
    border-color: #0e4faf;
    box-shadow: 0 2px 8px rgb(18 100 216 / 20%);
    gap: 8px;
  }
  .studio-btn-calc:hover:not(:disabled) {
    background: linear-gradient(135deg, #0e4faf, #0a3d8a);
    box-shadow: 0 4px 14px rgb(18 100 216 / 30%);
    transform: translateY(-1px);
  }
  .studio-btn-compare {
    gap: 8px;
    background: var(--eq-surface);
  }
  .studio-btn-compare:hover {
    background: var(--eq-surface-subtle);
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
  .region-filter-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-top: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--eq-border);
  }
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 260px;
  }
  .search-wrap :global(svg) {
    position: absolute;
    left: 12px;
    color: var(--eq-text-secondary);
    pointer-events: none;
  }
  .region-search-input {
    padding-left: 36px !important;
    font-size: 16px;
  }
  .region-options-list {
    max-height: 480px;
    overflow-y: auto;
    padding-right: 6px;
  }
  .region-checkbox-label {
    display: inline-flex;
    align-items: center;
    min-width: 55%;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    min-height: 48px;
  }
  .override-grid {
    margin-top: 12px;
    padding: 14px;
    background: var(--eq-surface-subtle);
    border-radius: 8px;
    border: 1px solid var(--eq-border);
  }
  .weight-composition > span {
    transition: width 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .weight-composition {
    height: 8px;
    border-radius: 5px;
    background: var(--eq-border);
    overflow: hidden;
    display: flex;
    margin-top: 24px;
  }
  .weight-total {
    background: var(--eq-surface-subtle);
    font-size: 13px;
    font-weight: 550;
    padding: 12px 14px;
    border-radius: 8px;
    margin-top: 14px;
    color: var(--eq-success);
    border: 1px solid #bbf7d0;
  }
  .weight-total.invalid {
    color: var(--eq-danger);
    background: #fef2f2;
    border-color: #fecaca;
  }
  .saved-panel {
    margin-top: 32px;
    scroll-margin-top: 100px;
  }
  .saved-scenarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }
  .saved-scenario-card {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    box-shadow: var(--eq-shadow-card);
    transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  }
  .saved-scenario-card:hover {
    border-color: var(--eq-primary);
    box-shadow: 0 8px 20px rgb(18 100 216 / 8%);
    transform: translateY(-2px);
  }
  .saved-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .saved-title-group {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }
  .saved-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--eq-primary-tint);
    color: var(--eq-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .field-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .preset-box {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 20px;
  }
  .preset-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--eq-primary);
    margin-bottom: 12px;
  }
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .preset-card {
    background: #ffffff;
    border: 1.5px solid #dbe2ea;
    border-radius: 12px;
    padding: 11px 14px;
    text-align: left;
    cursor: pointer;
    user-select: none;
    position: relative;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      transform 120ms ease,
      box-shadow 150ms ease;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .preset-card:hover {
    border-color: #9cb5d9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.07);
  }
  .preset-card:active {
    transform: scale(0.985);
  }
  .preset-card.active {
    border-color: var(--eq-primary);
    background: #f0f6ff;
    box-shadow:
      0 0 0 1px var(--eq-primary),
      0 2px 8px rgba(18, 100, 216, 0.12);
  }
  .region-select-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .region-override-btn {
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 550;
    border-color: #cbd5e1;
    white-space: nowrap;
    margin-left: auto;
  }
  .region-override-btn:hover {
    border-color: var(--eq-primary);
    color: var(--eq-primary-hover);
  }
  .preset-card-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .preset-card-title {
    font-size: 13px;
    font-weight: 650;
    color: var(--eq-text);
  }
  .preset-card-desc {
    font-size: 11px;
    color: var(--eq-text-secondary);
    margin: 0;
    line-height: 1.4;
  }
  @media (max-width: 600px) {
    .preset-grid {
      grid-template-columns: 1fr;
    }
  }

  .saved-title {
    font-size: 14px;
    font-weight: 650;
    color: var(--eq-text);
    text-decoration: none;
    line-height: 1.4;
  }
  .saved-title:hover {
    color: var(--eq-primary-hover);
    text-decoration: underline;
  }
  .saved-time {
    font-size: 12px;
    margin: 0;
  }
  .saved-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
    flex-wrap: wrap;
    border-top: 1px solid var(--eq-border);
    padding-top: 12px;
  }
  .saved-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 600;
    text-decoration: none;
    transition: all 140ms ease;
    flex: 1 1 120px;
  }
  .saved-btn-primary {
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    border: 1px solid #bfdbfe;
  }
  .saved-btn-primary:hover {
    background: var(--eq-primary);
    color: #ffffff;
    border-color: var(--eq-primary);
    box-shadow: 0 2px 6px rgb(18 100 216 / 25%);
  }
  .btn-arrow {
    transition: transform 140ms ease;
    font-size: 13px;
  }
  .saved-btn-primary:hover .btn-arrow {
    transform: translateX(2px);
  }
  .saved-btn-secondary {
    background: var(--eq-surface-subtle);
    color: var(--eq-text-secondary);
    border: 1px solid var(--eq-border);
  }
  .saved-btn-secondary:hover {
    background: #ffffff;
    color: var(--eq-text);
    border-color: #cbd5e1;
    box-shadow: 0 2px 6px rgb(15 23 42 / 5%);
  }
  @media (max-width: 1100px) {
    .studio-form {
      grid-template-columns: 1fr;
    }
  }
  .region-option {
    padding: 12px 0;
    border-bottom: 1px solid var(--eq-border);
  }
  input[type='checkbox'] {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    vertical-align: middle;
  }
  .field-help { color: var(--eq-text-secondary); font-size: 14px; font-weight: 400; line-height: 1.6; }
</style>
