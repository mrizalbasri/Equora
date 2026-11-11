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
    seo.image
      ? (seo.image.startsWith('http') ? seo.image : `${page.url.origin}${seo.image}`)
      : `${page.url.origin}/images/brand/equora-og.jpg`,
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
  <meta name="author" content="Equora" />
  <meta name="publisher" content="Equora" />
  <meta
    name="keywords"
    content="Equora, data pendidikan Indonesia, fasilitas sekolah, sanitasi sekolah, air bersih sekolah, internet sekolah, laboratorium komputer, simulasi anggaran pendidikan, analisis data daerah, 38 provinsi, BPS, Kemendikbudristek, optimasi alokasi, pemerataan pendidikan"
  />
  <meta name="geo.region" content="ID" />
  <meta name="geo.placename" content="Indonesia" />

  <!-- Directives for Google & search crawlers with large preview support -->
  {#if seo.noindex}
    <meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />
  {:else}
    <meta
      name="robots"
      content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    />
    <meta
      name="googlebot"
      content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    />
  {/if}

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
  <meta property="og:site_name" content="Equora" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:type" content={seo.ogType} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:secure_url" content={ogImageUrl} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="576" />
  <meta
    property="og:image:alt"
    content={seo.imageAlt ?? 'Equora - Wawasan Data untuk Indonesia | Peta & Analisis Fasilitas Pendidikan 38 Provinsi'}
  />

  <!-- Twitter / X Card with Large Image Preview -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={ogImageUrl} />
  <meta
    name="twitter:image:alt"
    content={seo.imageAlt ?? 'Equora - Wawasan Data untuk Indonesia'}
  />

  {@html jsonLdTag}
</svelte:head>

{@render children()}
