<script lang="ts">
  import { enhance } from '$app/forms';
  import PublicShell from '$lib/components/PublicShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let busy = $state(false);
</script>

<svelte:head>
  <title>Masuk Admin · Equora</title>
  <meta name="description" content="Autentikasi administrator untuk mengelola data Equora." />
</svelte:head>

<PublicShell>
  <div class="login-container">
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-icon"><Icon name="shield" size={28} /></div>
      <p class="eq-kicker">AREA TERBATAS</p>
      <h1 id="login-title">Masuk sebagai admin</h1>
      <p class="login-intro">
        Verifikasi token admin untuk membuka pusat kendali dan mengimpor data.
        Eksplorasi serta simulasi publik tetap dapat digunakan tanpa login.
      </p>
      <form method="POST" use:enhance={() => {
        busy = true;
        return async ({ update, formElement }) => {
          formElement.reset();
          try { await update(); } finally { busy = false; }
        };
      }}>
        <label for="admin-login-token">Token admin</label>
        <input id="admin-login-token" name="token" type="password"
          autocomplete="off" required maxlength="4096"
          aria-describedby="token-help" disabled={busy} />
        <p id="token-help" class="token-help">
          Gunakan ADMIN_TOKEN yang dikonfigurasi pengelola di backend. Jangan bagikan token ini.
        </p>
        {#if form?.message}<p class="login-error" role="alert">{form.message}</p>{/if}
        <button class="eq-button eq-button-primary" type="submit" disabled={busy}>
          {busy ? 'Memverifikasi…' : 'Masuk ke dashboard'}
        </button>
        <p class="session-note">Sesi berlaku satu jam. Token utama tidak disimpan di browser.</p>
      </form>
      <a class="public-link" href="/explore">Kembali ke eksplorasi publik →</a>
    </section>
  </div>
</PublicShell>

<style>
  .login-container { display: grid; place-items: center; padding: 64px 20px 88px; min-height: 65vh; }
  .login-card { width: 100%; max-width: 480px; padding: clamp(24px, 5vw, 40px); border: 1px solid var(--eq-border); border-radius: 16px; background: var(--eq-surface); }
  .login-icon { display: inline-flex; padding: 12px; border-radius: 12px; background: var(--eq-primary-tint); color: var(--eq-primary); margin-bottom: 20px; }
  h1 { font-size: clamp(26px, 5vw, 34px); letter-spacing: -0.035em; margin: 10px 0 16px; line-height: 1.15; }
  .login-intro { color: var(--eq-text-secondary); line-height: 1.7; margin-bottom: 28px; }
  label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  input { width: 100%; min-height: 48px; border: 1px solid var(--eq-border); border-radius: 8px; padding: 10px 12px; font: inherit; color: var(--eq-text); background: var(--eq-surface); }
  input:focus-visible { outline: 2px solid var(--eq-primary); outline-offset: 2px; }
  .token-help, .session-note { color: var(--eq-text-secondary); font-size: 12px; line-height: 1.6; }
  .token-help { margin: 10px 0 20px; }
  button { width: 100%; }
  .login-error { color: var(--eq-danger); border-left: 3px solid currentColor; padding-left: 12px; font-size: 14px; line-height: 1.6; }
  .session-note { text-align: center; margin: 14px 0 24px; }
  .public-link { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; text-underline-offset: 4px; }
</style>
