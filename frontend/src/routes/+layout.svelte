<script lang="ts">
  import '@fontsource-variable/inter/wght.css';
  import '../app.css';
  import { onMount, tick } from 'svelte';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { createLandingMotion } from '$lib/motion';
  let { children } = $props();
  let motion: ReturnType<typeof createLandingMotion> | undefined;

  onMount(() => {
    motion = createLandingMotion();
    return () => motion?.destroy();
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      // A second navigation can skip the visual transition while routing succeeds.
      void transition.ready.catch(() => {});
    });
  });

  afterNavigate(async ({ from, to }) => {
    if (from?.url.pathname === to?.url.pathname) return;
    await tick();
    motion?.refresh();
  });
</script>

{@render children()}
