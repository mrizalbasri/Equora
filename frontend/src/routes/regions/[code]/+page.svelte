<script lang="ts">
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { api, labels, number } from '$lib/api/workspace';
  import { facilityValue, type RegionProfile } from '$lib/region-profile';
  let data = $state<RegionProfile>();
  let error = $state('');
  let attempt = $state(0);
  let requestId = 0;
  $effect(() => {
    const code = page.params.code;
    const level = page.url.searchParams.get('level') ?? 'SD';
    const release = page.url.searchParams.get('release') ?? '';
    attempt;
    const id = ++requestId;
    void load(code ?? '', level, release, id);
    return () => { requestId++; };
  });
  async function load(code: string, level: string, release: string, id: number) {
    data = undefined;
    error = '';
    try {
      const profile = await api<RegionProfile>(
        'regions/' +
          encodeURIComponent(code) +
          '?' +
          new URLSearchParams({
            education_level: level,
            ...(release ? { release_id: release } : {}),
          }),
      );
      if (profile.code !== code || profile.education_level !== level || (release && profile.release_id !== release)) {
        throw new Error('Konteks profil tidak sesuai dengan rilis dan jenjang yang diminta.');
      }
      if (id === requestId) data = profile;
    } catch (e) {
      if (id === requestId) error = (e as Error).message;
    }
  }
</script>

<svelte:head><title>{data?.name ?? 'Detail wilayah'} · Equora</title></svelte:head>
<WorkspaceShell
  title={data?.name ?? 'Detail wilayah'}
  subtitle="Indikator fasilitas, denominator sekolah, dan koordinat sel sumber pada scope yang sama."
>
  <a href="/explore" class="eq-back-link">
    Kembali ke Explorer
  </a>

  {#if error}
    <div role="alert" class="work-error">
      <Icon name="alert" size={18} />
      <span>{error}</span>
      <button class="eq-button" onclick={() => attempt++}>Coba lagi</button>
    </div>
  {:else if !data}
    <div class="empty-state">
      <div class="empty-state-icon"><Icon name="map" size={22} /></div>
      <p>Memuat profil wilayah…</p>
    </div>
  {/if}

  {#if data}
    <p style="margin-block: 16px;"><a class="eq-button eq-button-primary" href={'/daerah?' + new URLSearchParams({ province: page.params.code ?? '', level: data.education_level, release: data.release_id })}>Pahami dan bandingkan kondisi wilayah</a></p>
    <div class="work-panel" style="margin-top: 8px;">
      <div class="region-meta-header">
        <div>
          <span class="eq-badge eq-badge-primary">Jenjang {data.education_level} · Total</span>
          <h2 style="margin: 8px 0 4px;">{data.name}</h2>
          <p class="work-muted">Data agregat tahun ajaran {data.academic_year}</p>
        </div>
      </div>
    </div>

    <div class="work-table">
      <table>
        <caption>Fasilitas sekolah dan provenance sel data</caption>
        <thead>
          <tr>
            <th>Indikator</th>
            <th>Nilai terukur</th>
            <th>Sel sumber spreadsheet</th>
            <th>Verifikasi & rincian</th>
          </tr>
        </thead>
        <tbody>
          {#each data.sources as source}
            <tr>
              <td><strong>{labels[source.source_id] ?? source.title}</strong></td>
              <td>
                {#if source.unit === 'percent' && data.values.institutions_count != null && data.values.institutions_count.trim() !== '' && Number(data.values.institutions_count) === 0}
                  <span class="eq-badge eq-badge-neutral">Tidak ada sekolah pada scope ini</span>
                {:else if facilityValue(data, source) === null}
                  <span class="eq-badge eq-badge-warning">Data tidak tersedia</span>
                {:else}
                  <span class="indicator-stat">
                    {number(data.values[source.source_id])}
                    <span class="unit-txt">{source.unit === 'percent' ? '%' : 'sekolah'}</span>
                  </span>
                {/if}
              </td>
              <td><code class="cell-ref">{data.cells[source.source_id]}</code></td>
              <td>
                <a
                  href={'/datasets/' + source.source_id + '?' + new URLSearchParams({ release_id: data.release_id })}
                  class="provenance-link"
                >
                  Sumber & kualitas
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</WorkspaceShell>

<style>
  .region-meta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .indicator-stat {
    font-size: 15px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }
  .unit-txt {
    font-size: 13px;
    font-weight: normal;
    color: var(--eq-text-secondary);
    margin-left: 2px;
  }
  .cell-ref {
    font-family: ui-monospace, monospace;
    font-size: 12px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--eq-text-secondary);
  }
  .provenance-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--eq-primary-hover);
    text-decoration: none;
    font-size: 13px;
    font-weight: 550;
  }
  .provenance-link:hover {
    text-decoration: underline;
  }
</style>
