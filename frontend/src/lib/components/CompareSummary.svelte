<script lang="ts">
  let { sentences = [] }: { sentences?: string[] } = $props();
</script>

{#if sentences.length}
  <div class="compare-summary" role="status">
    <span class="eq-kicker">RINGKASAN TEMUAN</span>
    <ul>
      {#each sentences as text}
        <li>{text}</li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .compare-summary {
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-left: 4px solid var(--eq-primary);
    border-radius: var(--eq-radius-sm);
    padding: 16px 20px;
    margin-bottom: 20px;
  }
  .compare-summary ul {
    margin: 8px 0 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--eq-text);
  }
</style>
