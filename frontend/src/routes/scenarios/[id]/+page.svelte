<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import ScenarioResult from '$lib/components/ScenarioResult.svelte';
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

<WorkspaceShell
  title="Snapshot skenario"
  subtitle="Parameter dan hasil perhitungan tersimpan bersama versi data yang digunakan."
  ><a href="/studio">← Studio</a>{#if error}<p class="work-error" role="alert">
      {error}
    </p>{:else if !result}<p role="status">
      Memuat snapshot…
    </p>{/if}{#if result}<ScenarioResult
      {result}
      {names}
    />{/if}</WorkspaceShell
>
