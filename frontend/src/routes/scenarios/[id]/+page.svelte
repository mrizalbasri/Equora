<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import ScenarioResult from '$lib/components/ScenarioResult.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { api, type Snapshot } from '$lib/api/workspace';
  let result = $state<Snapshot>();
  let names = $state<Record<string, string>>({});
  let error = $state('');
  onMount(async () => {
    try {
      const [snapshot, regions] = await Promise.all([
        api<Snapshot>('scenarios/' + page.params.id),
        api<{ code: string; name: string }[]>('regions'),
      ]);
      result = snapshot;
      names = Object.fromEntries(regions.map((row) => [row.code, row.name]));
    } catch (e) {
      error = (e as Error).message;
    }
  });
</script>

<svelte:head><title>Snapshot skenario · Equora</title></svelte:head>
<WorkspaceShell
  title="Snapshot skenario"
  subtitle="Parameter dan hasil perhitungan tersimpan bersama versi data yang digunakan."
>
  <a href="/studio" class="eq-back-link">
    Kembali ke Studio Simulasi
  </a>

  {#if error}
    <div class="work-error" role="alert">
      <Icon name="alert" size={18} />
      <span>{error}</span>
    </div>
  {:else if !result}
    <div class="empty-state">
      <div class="empty-state-icon"><Icon name="chart" size={22} /></div>
      <p>Memuat snapshot skenario…</p>
    </div>
  {/if}

  {#if result}
    <ScenarioResult {result} {names} />
  {/if}
</WorkspaceShell>
