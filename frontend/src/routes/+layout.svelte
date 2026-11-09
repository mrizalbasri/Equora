<script lang="ts">
  import '@fontsource-variable/inter/wght.css';
  import '../app.css';
  import { onMount, tick } from 'svelte';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { createLandingMotion } from '$lib/motion';
  import { buildStructuredData, normalizePathname, resolveSeo } from '$lib/seo';

  let { children } = $props();
  let motion: ReturnType<typeof createLandingMotion> | undefined;

  const cleanPath = $derived(normalizePathname(page.url.pathname));
  const seo = $derived(resolveSeo(cleanPath));
  const canonicalUrl = $derived(
    `${page.url.origin}${cleanPath === '/' ? '' : cleanPath}`,
  );
  const ogImageUrl = $derived(
    `${page.url.origin}/images/editorial/education-discussion.webp`,
  );
  const jsonLdTag = $derived(
    `<script type="application/ld+json">${buildStructuredData(page.url.origin, cleanPath)}</` +
      'script>',
  );

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

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <meta name="theme-color" content="#0f4c81" />
  <meta property="og:site_name" content="Equora" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:type" content={seo.ogType} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImageUrl} />
  <meta
    property="og:image:alt"
    content="Ilustrasi diskusi perencanaan fasilitas pendidikan antardaerah di Equora"
  />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={ogImageUrl} />
  {#if seo.noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
  {@html jsonLdTag}
</svelte:head>

{@render children()}
