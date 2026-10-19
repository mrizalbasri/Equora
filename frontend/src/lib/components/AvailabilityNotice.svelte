<script lang="ts">
  let { title, children }: { title: string; children: import('svelte').Snippet } = $props();
</script>

<aside aria-label={title}>
  <strong>{title}</strong>
  <div>{@render children()}</div>
</aside>

<style>
  aside { padding: 20px 24px; border-left: 3px solid var(--eq-border); background: var(--eq-surface-subtle); border-radius: 0 var(--eq-radius-sm) var(--eq-radius-sm) 0; }
  strong { display: block; margin-bottom: 4px; font-size: 14px; }
  div { color: var(--eq-text-secondary); font-size: 14px; line-height: 1.6; }
</style>
