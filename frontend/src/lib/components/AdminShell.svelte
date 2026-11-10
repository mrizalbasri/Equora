<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { page } from '$app/state';
  import BrandMark from './BrandMark.svelte';
  import Icon from './Icon.svelte';

  let { children }: { children: Snippet } = $props();
  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let closeButton = $state<HTMLButtonElement>();
  let sidebar = $state<HTMLElement>();
  const sections = [
    { id: 'overview', label: 'Ringkasan data', icon: 'chart' },
    { id: 'sync', label: 'Sinkronisasi & impor', icon: 'sliders' },
    { id: 'catalog', label: 'Katalog indikator', icon: 'database' },
    { id: 'governance', label: 'Peran & keamanan', icon: 'shield' },
  ] as const;
  const current = $derived(sections.find((section) => '#' + section.id === page.url.hash) ?? sections[0]);

  async function closeMenu() {
    menuOpen = false;
    await tick();
    menuButton?.focus();
  }

  async function toggleMenu() {
    if (menuOpen) return closeMenu();
    menuOpen = true;
    await tick();
    closeButton?.focus();
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && menuOpen) closeMenu();
    if (event.key !== 'Tab' || !menuOpen || !sidebar) return;
    const controls = [...sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
      .filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
</script>

<svelte:window onkeydown={onKey} onresize={() => {
  if (window.innerWidth > 900 && menuOpen) closeMenu();
}} />

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="admin-frame">
  {#if menuOpen}
    <button class="backdrop" tabindex="-1" aria-label="Tutup navigasi admin" onclick={closeMenu}></button>
  {/if}
  <aside class:open={menuOpen} id="admin-sidebar" bind:this={sidebar} aria-label="Panel admin">
    <div class="brand-row">
      <a href="/admin" aria-label="Equora, panel admin"><BrandMark compact /></a>
      <button class="close-menu" bind:this={closeButton} aria-label="Tutup menu admin" onclick={closeMenu}>
        <Icon name="close" />
      </button>
    </div>
    <p class="admin-caption"><Icon name="shield" size={16} /> Administrasi data</p>
    <nav aria-label="Navigasi admin">
      {#each sections as section}
        <a
          href={'/admin#' + section.id}
          aria-current={current.id === section.id ? 'location' : undefined}
          onclick={() => { menuOpen = false; }}
        >
          <Icon name={section.icon} size={18} />
          <span>{section.label}</span>
        </a>
      {/each}
    </nav>
    <div class="sidebar-bottom">
      <div class="session-note">
        <strong>Peran: Admin Data</strong>
        <span>Sesi terbatas · 1 jam sejak login</span>
      </div>
      <a class="public-link" href="/explore"><Icon name="home" size={18} /> Buka aplikasi publik</a>
      <form method="POST" action="/admin/logout">
        <button class="logout" type="submit">Keluar admin</button>
      </form>
    </div>
  </aside>

  <div class="admin-body" inert={menuOpen}>
    <header class="topbar">
      <div class="topbar-start">
        <button class="menu-button" bind:this={menuButton} aria-label="Menu admin"
          aria-expanded={menuOpen} aria-controls="admin-sidebar" onclick={toggleMenu}>
          <Icon name="menu" />
        </button>
        <span class="panel-label">Panel Admin</span>
        <span class="breadcrumb"><Icon name="chevron" size={14} /> {current.label}</span>
      </div>
      <span class="access-label"><Icon name="shield" size={16} /> Akses terbatas</span>
    </header>
    <main id="main-content" tabindex="-1">
      <header class="heading" id="overview">
        <h1>Pusat Kendali Tata Kelola Data</h1>
        <p>Area terbatas administrasi dataset pendidikan nasional, verifikasi integritas berkas, dan sinkronisasi rilis snapshot.</p>
      </header>
      {@render children()}
      <footer>Equora · Administrasi dataset pendidikan nasional</footer>
    </main>
  </div>
</div>

<style>
  .admin-frame { min-height: 100dvh; background: var(--eq-bg); }
  .skip-link { position: fixed; top: -100px; left: 16px; z-index: 60; padding: 12px; background: var(--eq-surface); }
  .skip-link:focus { top: 12px; }
  aside {
    position: fixed; inset: 0 auto 0 0; z-index: 40; width: 252px;
    display: flex; flex-direction: column; padding: 28px 16px 20px;
    background: var(--eq-surface); border-right: 1px solid var(--eq-border); overflow-y: auto;
  }
  .brand-row { display: flex; justify-content: space-between; align-items: center; padding-inline: 8px; }
  .admin-caption { display: flex; align-items: center; gap: 8px; margin: 16px 8px 32px; color: var(--eq-text-secondary); font-size: 12px; }
  nav { display: grid; gap: 8px; }
  nav a, .public-link { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 12px; border-radius: 8px; color: var(--eq-text-secondary); text-decoration: none; font-size: 14px; }
  nav a:hover, .public-link:hover { background: var(--eq-surface-subtle); color: var(--eq-text); }
  nav a[aria-current] { background: var(--eq-primary-tint); color: var(--eq-primary-hover); font-weight: 650; }
  nav a :global(svg), .public-link :global(svg) { flex-shrink: 0; }
  .sidebar-bottom { margin-top: auto; padding-top: 40px; display: grid; gap: 12px; }
  .session-note { display: grid; gap: 4px; padding: 16px 12px; border-top: 1px solid var(--eq-border); font-size: 12px; }
  .session-note span { color: var(--eq-text-secondary); font-size: 11px; }
  .logout { width: 100%; min-height: 44px; border: 1px solid var(--eq-border); border-radius: 8px; background: var(--eq-surface); color: var(--eq-text); cursor: pointer; font-weight: 600; }
  .logout:hover { background: var(--eq-surface-subtle); border-color: var(--eq-text-muted); }
  .admin-body { margin-left: 252px; min-width: 0; }
  .topbar { min-height: 68px; padding: 12px 32px; border-bottom: 1px solid var(--eq-border); background: var(--eq-surface); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .topbar-start, .breadcrumb, .access-label { display: flex; align-items: center; gap: 12px; }
  .panel-label { font-size: 14px; font-weight: 700; white-space: nowrap; }
  .breadcrumb, .access-label { font-size: 12px; color: var(--eq-text-secondary); }
  main { max-width: 1680px; margin: 0 auto; padding: 32px 32px 0; }
  .heading { margin-bottom: 24px; scroll-margin-top: 24px; }
  h1 { margin: 0 0 12px; font-size: clamp(24px, 2.3vw, 32px); line-height: 1.2; letter-spacing: -0.03em; }
  .heading p { max-width: 720px; margin: 0; font-size: 14px; line-height: 1.6; color: var(--eq-text-secondary); }
  footer { margin-top: 48px; padding: 24px 0; border-top: 1px solid var(--eq-border); font-size: 12px; color: var(--eq-text-secondary); }
  .menu-button, .close-menu { display: none; }
  .admin-frame :global(.work-panel) { background: var(--eq-surface); border-radius: 12px; margin-block: 20px; }
  .admin-frame :global(.work-panel h2) { font-size: 20px; margin-bottom: 16px; }
  .admin-frame :global(.work-table) { background: var(--eq-surface); border-radius: 10px; font-variant-numeric: tabular-nums; }
  .admin-frame :global(.eq-button) { gap: 8px; }
  @media (max-width: 900px) {
    aside { width: min(300px, 85vw); transform: translateX(-100%); visibility: hidden; }
    aside.open { transform: translateX(0); visibility: visible; }
    .admin-body { margin-left: 0; }
    .backdrop { position: fixed; inset: 0; z-index: 35; border: 0; background: rgb(20 36 54 / 25%); }
    .menu-button, .close-menu { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid var(--eq-border); border-radius: 8px; background: var(--eq-surface); color: var(--eq-text); cursor: pointer; }
    .topbar { padding-inline: 20px; }
    main { padding: 24px 20px 0; }
  }
  @media (max-width: 550px) {
    .breadcrumb, .access-label { display: none; }
    .topbar { padding-inline: 16px; }
    main { padding-inline: 16px; }
  }
</style>
