<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import { api, labels, number, type Source } from '$lib/api/workspace';
  let data = $state<{
    name: string;
    values: Record<string, string | null>;
    cells: Record<string, string>;
    sources: Source[];
    education_level: string;
  }>();
  let error = $state('');
  onMount(async () => {
    try {
      data = await api(
        'regions/' +
          page.params.code +
          '?' +
          new URLSearchParams({
            education_level: page.url.searchParams.get('level') ?? 'SD',
          }),
      );
    } catch (e) {
      error = (e as Error).message;
    }
  });
</script>

<WorkspaceShell
  title={data?.name ?? 'Detail wilayah'}
  subtitle="Indikator fasilitas, denominator, dan koordinat sel sumber pada scope yang sama."
>
  <a href="/explore">← Explorer</a>{#if error}<p
      role="alert"
      class="work-error"
    >
      {error}
    </p>{/if}
  {#if data}<div class="work-table">
      <table>
        <caption>{data.education_level} · Total · 2025/2026</caption><thead
          ><tr
            ><th>Indikator</th><th>Nilai</th><th>Sel sumber</th><th
              >Provenance</th
            ></tr
          ></thead
        ><tbody
          >{#each data.sources as source}<tr
              ><td>{labels[source.source_id]}</td><td
                >{source.unit === 'percent' &&
                Number(data.values.institutions_count) === 0
                  ? 'Tidak ada sekolah pada scope ini'
                  : number(data.values[source.source_id]) +
                    (source.unit === 'percent' ? '%' : ' sekolah')}</td
              ><td>{data.cells[source.source_id]}</td><td
                ><a href={'/datasets/' + source.source_id}>Sumber & kualitas</a
                ></td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>{/if}
</WorkspaceShell>
