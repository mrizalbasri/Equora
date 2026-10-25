<script lang="ts">
  import { page } from '$app/state';
  import { loadClerk } from '$lib/clerk';
  let { mode }: { mode: 'sign-in' | 'sign-up' } = $props();
  let container = $state<HTMLDivElement>();
  let error = $state(''), loading = $state(true), retry = $state(0);
  $effect(() => {
    void retry;
    const currentMode = mode;
    const target = container;
    if (!target) return;
    let cancelled = false;
    let unmount: (() => void) | undefined;
    error = '';
    loading = true;
    if (!page.data.clerk?.enabled) {
      error = 'Login belum dikonfigurasi. Hubungi pengelola Equora.';
      loading = false;
      return;
    }
    void loadClerk().then(clerk => {
      if (cancelled) return;
      if (clerk.user) { window.location.replace('/account'); return; }
      if (currentMode === 'sign-in') {
        clerk.mountSignIn(target, { routing: 'hash', signUpUrl: '/sign-up', forceRedirectUrl: '/account' });
        unmount = () => clerk.unmountSignIn(target);
      } else {
        clerk.mountSignUp(target, { routing: 'hash', signInUrl: '/sign-in', forceRedirectUrl: '/account' });
        unmount = () => clerk.unmountSignUp(target);
      }
    }).catch(() => { if (!cancelled) error = 'Layanan login belum dapat dimuat. Periksa koneksi lalu coba lagi.'; })
      .finally(() => { if (!cancelled) loading = false; });
    return () => { cancelled = true; unmount?.(); };
  });
</script>

<section class="auth-page" aria-labelledby="auth-title">
  <div class="auth-intro">
    <h1 id="auth-title">{mode === 'sign-in' ? 'Masuk ke Equora' : 'Buat akun Equora'}</h1>
    <p>Gunakan akun untuk mengelola identitas dan sesi Anda. Data publik dan ruang simulasi tetap dapat dijelajahi tanpa login.</p>
    <a href="/explore">Lanjut jelajahi data publik</a>
  </div>
  <div class="auth-form">
    {#if loading}<p role="status">Memuat layanan login…</p>{/if}
    {#if error}<p role="alert">{error}</p>{#if page.data.clerk?.enabled}<button class="eq-button" onclick={() => retry++}>Coba lagi</button>{/if}{/if}
    <div bind:this={container}></div>
    <p class="auth-switch">{mode === 'sign-in' ? 'Belum punya akun?' : 'Sudah punya akun?'} <a href={mode === 'sign-in' ? '/sign-up' : '/sign-in'}>{mode === 'sign-in' ? 'Daftar' : 'Masuk'}</a></p>
  </div>
</section>

<style>
  .auth-page { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 440px); align-items: start; gap: 64px; width: min(1080px, calc(100% - 64px)); margin: 64px auto; min-height: 480px; }
  h1 { font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -0.035em; }
  .auth-intro p { color: var(--eq-text-secondary); max-width: 45ch; margin: 24px 0; }
  .auth-intro a { display: inline-flex; align-items: center; min-height: 44px; color: var(--eq-primary-hover); }
  .auth-form { min-width: 0; }
  .auth-form > p { margin-bottom: 20px; }
  [role='alert'] { color: var(--eq-danger); }
  .auth-switch { font-size: 14px; margin-top: 24px; }
  .auth-switch a { display: inline-flex; align-items: center; min-height: 44px; color: var(--eq-primary-hover); }
  .auth-form :global(.cl-rootBox), .auth-form :global(.cl-cardBox), .auth-form :global(.cl-card) { width: 100%; max-width: 100%; min-width: 0; }
  @media (max-width: 760px) { .auth-page { grid-template-columns: minmax(0, 1fr); gap: 32px; margin-block: 32px; width: calc(100% - 32px); } }
</style>
