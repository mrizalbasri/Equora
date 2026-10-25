<script lang="ts">
  import { page } from '$app/state';
  import { loadClerk } from '$lib/clerk';
  let busy = $state(false), error = $state('');

  async function signOut() {
    if (busy) return;
    busy = true;
    error = '';
    try {
      const clerk = await loadClerk();
      await clerk.signOut({ redirectUrl: '/' });
      window.location.assign('/');
    } catch { error = 'Belum dapat keluar. Coba lagi.'; }
    finally { busy = false; }
  }
</script>

{#if page.data.clerk?.enabled}
  <div class="account-controls">
    {#if page.data.clerk.signedIn}
      <a href="/account">Akun saya</a>
      <button type="button" disabled={busy} onclick={signOut}>{busy ? 'Keluar…' : 'Keluar'}</button>
    {:else}
      <a href="/sign-in">Masuk</a>
    {/if}
    {#if error}<span role="alert">{error}</span>{/if}
  </div>
{/if}

<style>
  .account-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  a, button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 12px; border: 1px solid var(--eq-border); border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; background: var(--eq-surface); color: var(--eq-primary-hover); white-space: nowrap; }
  a:hover, button:hover { background: var(--eq-primary-tint); }
  span { color: var(--eq-danger); font-size: 13px; max-width: 220px; }
</style>
