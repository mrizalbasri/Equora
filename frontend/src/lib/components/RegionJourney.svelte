<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import WorkspaceShell from './WorkspaceShell.svelte';
  import ProvincePicker from './ProvincePicker.svelte';
  import Icon from './Icon.svelte';
  import { api, labels, number, type Workspace } from '$lib/api/workspace';
  import { facilityValue, comparisonDifference, profilePath, profileSummary, type RegionProfile } from '$lib/region-profile';

  let workspace = $state<Workspace>();
  let regions = $state<{ code: string; name: string }[]>([]);
  let profile = $state<RegionProfile>();
  let comparison = $state<RegionProfile>();
  let loading = $state(true);
  let error = $state('');
  let attempt = $state(0);
  let shareText = $state('');
  let shareStatus = $state('');
  let requestId = 0;
  const province = $derived(page.url.searchParams.get('province') || '');
  const level = $derived(page.url.searchParams.get('level') || 'SD');
  const release = $derived(page.url.searchParams.get('release') || '');
  const compare = $derived(page.url.searchParams.get('compare') || '');
  const percentSources = $derived(profile?.sources.filter((s) => s.unit === 'percent') ?? []);
  const local = $derived(workspace?.status !== 'published');
  const availableCount = $derived(profile ? percentSources.filter((source) => facilityValue(profile!, source) !== null).length : 0);
  const levelNames: Record<string, string> = { TK: 'Taman Kanak-kanak', SD: 'Sekolah Dasar', SMP: 'Sekolah Menengah Pertama', SMA: 'Sekolah Menengah Atas', SMK: 'Sekolah Menengah Kejuruan', SLB: 'Sekolah Luar Biasa' };

  $effect(() => {
    const params = { province, level, release, compare, attempt };
    const id = ++requestId;
    void load(id, params);
    return () => { requestId++; };
  });

  async function load(id: number, params: { province: string; level: string; release: string; compare: string }) {
    loading = true;
    error = '';
    profile = undefined;
    comparison = undefined;
    shareText = '';
    shareStatus = '';
    try {
      const current = await api<Workspace>('workspace?' + new URLSearchParams(
        params.release ? { release_id: params.release } : {},
      ));
      if (params.release && current.id !== params.release) throw new Error('Rilis yang diminta tidak tersedia.');
      if (!current.education_levels.includes(params.level)) throw new Error('Jenjang tidak tersedia pada rilis ini.');
      const query = new URLSearchParams({ education_level: params.level, release_id: current.id });
      const [list, left, right] = await Promise.all([
        api<{ code: string; name: string }[]>('regions?' + query),
        params.province ? api<RegionProfile>('regions/' + encodeURIComponent(params.province) + '?' + query) : undefined,
        params.province && params.compare ? api<RegionProfile>('regions/' + encodeURIComponent(params.compare) + '?' + query) : undefined,
      ]);
      if (id !== requestId) return;
      if ([left, right].some((item, index) => item && (item.release_id !== current.id || item.education_level !== params.level || item.code !== (index === 0 ? params.province : params.compare)))) {
        throw new Error('Konteks profil tidak sesuai dengan rilis dan jenjang yang diminta.');
      }
      workspace = current;
      regions = list;
      profile = left;
      comparison = right;
      if (!params.release) {
        void goto(profilePath(params.province, params.level, current.id, params.compare), { replaceState: true, keepFocus: true, noScroll: true });
      }
    } catch (e) {
      if (id === requestId) error = e instanceof Error ? e.message : 'Profil belum dapat dimuat.';
    } finally {
      if (id === requestId) loading = false;
    }
  }

  function navigate(code = province, nextLevel = level, nextCompare = compare) {
    shareText = '';
    shareStatus = '';
    void goto(profilePath(code, nextLevel, release || workspace?.id || '', nextCompare === code ? '' : nextCompare), { keepFocus: true, noScroll: true });
  }

  async function share() {
    if (!profile || !workspace) return;
    const context = requestId;
    shareText = profileSummary(profile, page.url.origin, comparison);
    try {
      await navigator.clipboard.writeText(shareText);
      if (context === requestId) shareStatus = 'Ringkasan dan tautan berhasil disalin.';
    } catch {
      if (context === requestId) shareStatus = 'Penyalinan otomatis tidak tersedia. Salin teks di bawah secara manual.';
    }
  }
</script>

<svelte:head>
  <title>{profile ? 'Pendidikan di ' + profile.name : 'Pendidikan di Daerah Saya'} · Equora</title>
  <meta name="description" content="Pahami fasilitas pendidikan provinsi Anda, bandingkan dengan provinsi lain dan telusuri sumber datanya." />
</svelte:head>

<WorkspaceShell
  title={profile ? 'Pendidikan di ' + profile.name : 'Profil Wilayah'}
  subtitle="Bagaimana fasilitas sekolah di provinsi Anda? Pilih daerah, baca kondisinya, lalu bandingkan jika perlu."
>
<div class="region-page">
  <section class="journey-intro" aria-label="Pilih daerah dan jenjang sekolah">
    <h2>Daerah mana yang ingin Anda lihat?</h2>
    <p>Pilih provinsi dan jenjang sekolah. Anda tidak perlu masuk akun.</p>
    <div class="journey-controls">
      <ProvincePicker id="your-province" label="Provinsi Anda" options={regions} value={province} onchange={(code) => navigate(code)} disabled={!workspace || !!error} />
      <label><span class="control-label" id="school-level-label"><Icon name="education" size={20} />Jenjang sekolah</span>
        <select aria-labelledby="school-level-label" aria-describedby="school-level-hint" value={level} onchange={(event) => navigate(province, event.currentTarget.value)} disabled={!workspace || !!error}>
          {#each workspace?.education_levels ?? [level] as item}<option value={item}>{item} · {levelNames[item] ?? item}</option>{/each}
        </select>
        <span class="control-hint" id="school-level-hint">Pilih tingkat sekolah yang ingin Anda lihat.</span>
      </label>
    </div>
  </section>

  {#if loading}<p role="status" class="loading-message">Memuat kondisi fasilitas pendidikan…</p>
  {:else if error}
    <section class="journey-message" role="alert">
      <h2>Profil belum dapat dibuka</h2><p>{error}</p>
      <p>Rilis yang tidak tersedia tidak diganti secara otomatis.</p>
      <div class="journey-actions"><button class="eq-button" onclick={() => attempt++}><Icon name="retry" />Coba lagi</button><a class="eq-button" href="/daerah"><Icon name="map" />Pilih dari rilis aktif</a></div>
    </section>
  {:else if workspace}
    {#if local}<aside class="review-message" aria-label="Status data"><strong>Data masih dalam pemeriksaan.</strong> Anda sedang melihat data review lokal, yang belum diterbitkan sebagai rilis publik terverifikasi.</aside>{/if}
    {#if profile}
      <section class="profile-overview" aria-labelledby="region-profile-title">
        <div>
          <h2 id="region-profile-title">Kondisi fasilitas di {profile.name}</h2>
          <p class="profile-scope">{level} · {profile.ownership === 'Total' ? 'Sekolah negeri dan swasta' : profile.ownership} · Tahun ajaran {profile.academic_year}</p>
          <p>{availableCount === percentSources.length && availableCount > 0 ? `${availableCount} indikator fasilitas dapat dibaca di bawah.` : `${availableCount} dari ${percentSources.length} indikator fasilitas memiliki nilai yang dapat dibaca. Data lainnya belum tersedia.`} Angka merangkum provinsi; kondisi setiap sekolah bisa berbeda.</p>
        </div>
        <button class="eq-button eq-button-primary" onclick={share}><Icon name="share" />Bagikan temuan</button>
      </section>
      {#if shareText}
        <section class="share-result" aria-label="Bagikan kondisi daerah">
          <p role="status">{shareStatus}</p>
          <label class="share-label">Ringkasan dan tautan temuan<textarea readonly rows="8" value={shareText}></textarea></label>
        </section>
      {/if}
      <details class="comparison-picker" open={!!compare}>
        <summary><Icon name="compare" /><span class="summary-label">Bandingkan dengan provinsi lain</span><span class="optional-label">Opsional</span></summary>
        <div class="comparison-content">
          <ProvincePicker id="comparison-province" label="Bandingkan dengan" options={regions.filter((region) => region.code !== province)} value={compare} emptyLabel="Tanpa pembanding" onchange={(code) => navigate(province, level, code)} disabled={!workspace || !!error} />
          <p>Bandingkan fasilitas yang sama pada jenjang dan periode yang sepadan. Selisih akses belum menjelaskan penyebab perbedaannya.</p>
        </div>
        {#if comparison}<button class="eq-button remove-comparison" onclick={() => navigate(province, level, '')}><Icon name="close" size={18} />Hapus pembanding</button>{/if}
      </details>
      <section class="facility-section" aria-label="Angka dan penjelasan fasilitas">
        <h2>Apa arti angka fasilitasnya?</h2>
        <p class="section-description">Baca satu fasilitas pada satu waktu. Angka yang lebih rendah pada fasilitas berbeda tidak otomatis berarti kebutuhan paling mendesak.</p>
        <details class="reading-help"><summary><Icon name="info" /><span class="summary-label">Bagaimana membaca persentase dan selisihnya?</span></summary><p>Persentase menunjukkan bagian sekolah yang memenuhi definisi sumber. Misalnya, 20% berarti 20 dari setiap 100 sekolah. Jika pembandingnya 60%, selisihnya 40 poin persentase. Angka 20% dan 60% ini hanya contoh cara membaca, bukan kondisi semua provinsi.</p></details>
        {#if comparison}<p class="comparison-heading">Pembanding: <strong>{comparison.name}</strong>. Selisih dihitung sebagai provinsi Anda dikurangi pembanding.</p>{/if}
        {#each percentSources as source}
          {@const value = facilityValue(profile, source)}
          {@const difference = comparison ? comparisonDifference(profile, comparison, source) : null}
          {@const other = comparison && difference?.compatible ? facilityValue(comparison, source) : null}
          <article class="facility-row" aria-label={labels[source.source_id] ?? source.title}>
            <div class="facility-explanation">
              <h3>{labels[source.source_id] ?? source.title}</h3>
              <p>{source.definition}</p>
              <small>Periode {source.academic_year} · Tahun data {source.year}</small>
            </div>
            <div class="facility-value">
              <strong>{value === null ? 'Tidak tersedia' : number(value) + '%'}</strong>
              <p>{value === null ? (profile.values.institutions_count?.trim() && Number(profile.values.institutions_count) === 0 ? 'Tidak ada sekolah pada cakupan ini.' : 'Data belum lengkap; bukan berarti aksesnya 0%.') : 'sekolah pada cakupan data'}</p>
              {#if comparison}
                <p>Pembanding: {other === null ? 'Tidak tersedia' : number(other) + '%'}</p>
                <p class="difference">{difference?.value == null ? difference?.reason : difference.value === 0 ? 'Sama dengan pembanding.' : `${number(Math.abs(difference.value))} poin persentase ${difference.value > 0 ? 'lebih tinggi' : 'lebih rendah'} dari pembanding.`}</p>
              {/if}
            </div>
            <details class="facility-source">
              <summary><Icon name="book" /><span class="summary-label">Telusuri sumber</span></summary>
              <p><strong>Apa yang dihitung?</strong> {source.definition}</p>
              <p>{source.publisher} · {source.title}</p>
              <p>Sel provinsi Anda: {profile.cells[source.source_id] ?? 'Tidak tersedia'}{comparison ? ` · Sel pembanding: ${comparison.cells[source.source_id] ?? 'Tidak tersedia'}` : ''}</p>
              <a href={source.source_url} target="_blank" rel="noreferrer">Buka sumber asli<Icon name="external" size={18} /><span class="eq-sr-only"> (tab baru)</span></a>
              <details class="technical-source"><summary>Rincian verifikasi berkas</summary><p>Identitas berkas (SHA-256): <code>{source.sha256}</code></p></details>
            </details>
          </article>
        {/each}
        {#if !percentSources.length}<p>Belum ada indikator persentase fasilitas pada rilis ini.</p>{/if}
        <details class="additional-values">
          <summary>Lihat jumlah sekolah dan konteks lainnya</summary>
          {#each profile.sources.filter((source) => source.unit !== 'percent') as source}
            <p><strong>{labels[source.source_id] ?? source.title}:</strong> {number(facilityValue(profile, source), 0)} sekolah · {source.academic_year} · <a href={source.source_url} target="_blank" rel="noreferrer">Sumber asli</a></p>
          {/each}
          <p>Jumlah sekolah merupakan konteks, bukan skor prioritas kebutuhan.</p>
        </details>
      </section>
      <section class="next-step" aria-labelledby="try-priority-title">
        <h2 id="try-priority-title">Ingin mencoba pilihan prioritas?</h2>
        <p>Di Studio, Anda dapat memilih fasilitas yang lebih diprioritaskan dan mencoba anggaran. Simulasi dimulai dari seluruh provinsi pada rilis dan jenjang yang sama; cakupannya dapat diubah sebelum dihitung.</p>
        <p>Biaya dan jumlah paket adalah asumsi simulasi. Hasilnya belum menyatakan berapa sekolah atau siswa yang terbantu.</p>
        <div class="journey-actions">
          <a class="eq-button" href={'/studio?' + new URLSearchParams({ level, release: workspace.id })}><Icon name="sliders" />Coba prioritas fasilitas</a>
          <a class="plain-link" href={'/regions/' + encodeURIComponent(profile.code) + '?' + new URLSearchParams({ level, release: workspace.id })}>Lihat data wilayah terperinci<Icon name="arrow" size={18} /></a>
        </div>
      </section>
      <details class="data-context"><summary>Batas penggunaan data ini</summary>
        <p>Data agregat tidak menjelaskan penyebab kesenjangan dan tidak menentukan sekolah penerima bantuan.</p>
        {#each profile.limitations as limitation}<p>{limitation}</p>{/each}
        <a href="/methodology">Baca metodologi</a>
      </details>
      <details class="data-context" aria-label="Konteks data"><summary>Periode dan versi data</summary><p>{workspace.academic_year} · {level} · Rilis <span>{workspace.id}</span></p><p>Periode masing-masing fasilitas tercantum di atas. Tautan halaman ini menyimpan versi data yang sedang Anda baca.</p></details>
    {:else}
      <section class="journey-start" aria-labelledby="journey-start-title">
        <h2 id="journey-start-title">Mulai dari satu provinsi</h2>
        <p>Pilih provinsi Anda di atas. Setelah itu, Anda dapat membaca fasilitas sekolah, melihat perbandingan, dan membagikan temuan beserta sumbernya.</p>
        <p>Data yang tersedia mencakup fasilitas seperti sanitasi, air, internet, dan komputer. Data ini merangkum provinsi, bukan kondisi masing-masing sekolah.</p>
        <a class="plain-link" href="/methodology">Cara membaca data pendidikan</a>
      </section>
    {/if}
  {/if}
</div>
</WorkspaceShell>

<style>
  .region-page { max-width: 1056px; padding-block: 8px 64px; }
  h2 { font-size: clamp(1.35rem, 2.5vw, 1.8rem); letter-spacing: -.025em; line-height: 1.25; }
  p { line-height: 1.7; max-width: 72ch; }
  .journey-intro { padding: 28px; background: var(--eq-surface-subtle); border-radius: 16px; }
  .journey-intro > p { margin-top: 8px; color: var(--eq-text-secondary); }
  .journey-controls { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-top: 24px; }
  label { display: grid; gap: 10px; font-size: 16px; font-weight: 600; min-width: 0; }
  .control-label { display: flex; align-items: center; gap: 8px; }
  .control-label :global(svg) { color: var(--eq-primary-hover); }
  .control-hint { font-size: 14px; font-weight: 400; color: var(--eq-text-secondary); line-height: 1.5; }
  select, textarea { width: 100%; max-width: 100%; border: 1px solid var(--eq-control-border); border-radius: 8px; padding: 12px; background: var(--eq-surface); color: var(--eq-text); font: inherit; min-height: 52px; }
  .review-message { margin-top: 20px; color: var(--eq-warning); background: var(--eq-warning-tint); padding: 16px 20px; border-radius: 8px; font-size: 14px; line-height: 1.7; }
  .profile-overview { display: flex; justify-content: space-between; align-items: start; gap: 24px; padding-block: 40px 24px; }
  .profile-overview > div { min-width: 0; }
  .profile-overview > button { flex-shrink: 0; }
  .profile-overview p { margin-top: 12px; }
  .profile-scope { font-weight: 600; color: var(--eq-primary-hover); }
  .comparison-picker { border-block: 1px solid var(--eq-border); margin-bottom: 40px; }
  summary { cursor: pointer; min-height: 52px; display: flex; align-items: center; gap: 10px; padding: 14px 8px; border-radius: 6px; font-weight: 600; line-height: 1.5; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: ''; width: 9px; height: 9px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg); flex-shrink: 0; margin-left: auto; margin-right: 6px; }
  details[open] > summary::after { transform: rotate(225deg); }
  summary:hover { background: var(--eq-primary-tint); }
  summary :global(svg) { flex-shrink: 0; }
  .summary-label { min-width: 0; }
  .comparison-picker .optional-label { color: var(--eq-text-secondary); font-size: 14px; font-weight: 400; }
  .remove-comparison { margin-bottom: 24px; }
  .comparison-content { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 8px 0 24px; align-items: center; }
  .comparison-content p, .section-description { color: var(--eq-text-secondary); }
  .section-description { margin-top: 12px; }
  .reading-help { margin-top: 16px; color: var(--eq-text-secondary); }
  .reading-help summary { color: var(--eq-primary-hover); }
  .reading-help p { padding-bottom: 16px; }
  .facility-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px 32px; border-top: 1px solid var(--eq-border); padding-block: 28px; }
  .facility-row:first-of-type { margin-top: 24px; }
  .facility-row h3 { font-size: 20px; margin-bottom: 12px; }
  .facility-row p { margin-block: 8px; }
  .facility-explanation small { color: var(--eq-text-secondary); display: block; margin-top: 12px; font-size: 14px; }
  .facility-value { background: var(--eq-surface-subtle); padding: 20px; border-radius: 12px; align-self: start; }
  .facility-value strong { font-size: 32px; font-variant-numeric: tabular-nums; line-height: 1.2; }
  .facility-value p { font-size: 15px; color: var(--eq-text-secondary); }
  .facility-value .difference { color: var(--eq-text); font-weight: 550; }
  .facility-source { grid-column: 1 / -1; overflow-wrap: anywhere; }
  .facility-source summary { color: var(--eq-primary-hover); }
  .facility-source > p { font-size: 15px; }
  .facility-source a, .additional-values a, .data-context > a, .plain-link { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; color: var(--eq-primary-hover); font-weight: 550; }
  .technical-source { margin-top: 8px; font-size: 14px; }
  .technical-source summary { color: var(--eq-text-secondary); }
  .additional-values { border-top: 1px solid var(--eq-border); padding-block: 8px 20px; }
  .additional-values p { margin-block: 12px; }
  .comparison-heading { margin-block: 20px; }
  .next-step { background: var(--eq-surface-subtle); border-radius: 16px; padding: 28px; margin-block: 24px; }
  .next-step p { margin-top: 12px; }
  .next-step p + p { color: var(--eq-text-secondary); font-size: 14px; }
  .journey-actions { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 20px; }
  .share-result { background: var(--eq-primary-tint); padding: 24px; border-radius: 12px; margin-bottom: 24px; }
  .share-label { margin-top: 16px; }
  textarea { font-size: 16px; line-height: 1.7; font-weight: 400; resize: vertical; }
  .data-context { border-bottom: 1px solid var(--eq-border); overflow-wrap: anywhere; }
  .data-context p { margin-bottom: 16px; color: var(--eq-text-secondary); }
  .journey-start { max-width: 700px; padding-block: 36px 12px; }
  .journey-start p { margin-top: 16px; color: var(--eq-text-secondary); }
  .journey-start a { margin-top: 12px; }
  .loading-message, .journey-message { padding-block: 32px; }
  .journey-message p { margin-top: 12px; }
  @media (max-width: 700px) {
    .region-page { padding-block: 8px 40px; }
    .journey-intro, .next-step { padding: 20px; }
    .journey-controls, .facility-row, .comparison-content { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .profile-overview { flex-direction: column; padding-top: 28px; gap: 20px; }
    .profile-overview > button { width: 100%; }
    .journey-actions > * { width: 100%; text-align: center; justify-content: center; }
    .share-result { padding: 20px; }
  }
</style>
