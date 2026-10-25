<script lang="ts">
  let { compact = false }: { compact?: boolean } = $props();
</script>

<span class="brand-mark" class:compact>
  <img src="/images/brand/equora-logo.webp" alt="" width="40" height="40" />
  <span>EQUORA</span>
</span>

<style>
  .brand-mark { display: inline-flex; align-items: center; gap: 8px; color: var(--eq-text); font-size: 24px; font-weight: 800; letter-spacing: -0.8px; line-height: 1; white-space: nowrap; }
  img { display: block; width: 40px; height: 40px; flex-shrink: 0; }
  .compact { gap: 6px; font-size: 20px; letter-spacing: -0.6px; }
  .compact img { width: 32px; height: 32px; }
</style>
