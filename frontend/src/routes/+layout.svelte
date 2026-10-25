<script lang="ts">
  import '../app.css';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { createLandingMotion } from '$lib/motion';
  let { children } = $props();
  let motion: ReturnType<typeof createLandingMotion> | undefined;

  onMount(() => {
    motion = createLandingMotion();
    return () => motion?.destroy();
  });

  afterNavigate(async ({ from, to }) => {
    if (from?.url.pathname === to?.url.pathname) return;
    await tick();
    motion?.refresh();
  });
</script>

{@render children()}
