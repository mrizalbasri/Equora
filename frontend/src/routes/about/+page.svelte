<script lang="ts">
  import PublicShell from '#lib/components/PublicShell.svelte';
  import AvailabilityNotice from '#lib/components/AvailabilityNotice.svelte';
</script>

<svelte:head>
  <title>Tentang Equora | Data publik dan keputusan yang terukur</title>
  <meta name="description" content="Tujuan, status pengembangan, dan batas penggunaan Equora, platform perbandingan akses fasilitas pendidikan dan simulasi alokasi sumber daya." />
</svelte:head>

<PublicShell links={[{ label: 'Beranda', href: '/' }, { label: 'Sumber data', href: '/#sumber' }, { label: 'Metode & batasan', href: '/#metode' }]}>
  <article class="eq-container about">
    <p class="eq-kicker">Tentang Equora</p>
    <h1>Keputusan lebih terukur dimulai dari data yang bisa diperiksa.</h1>
    <p class="lead">Akses fasilitas pendidikan dapat berbeda antardaerah. Equora dirancang untuk membantu membaca perbedaan itu, memahami prioritas kebutuhan, dan membandingkan pilihan alokasi sumber daya.</p>
    <div class="content">
      <section aria-labelledby="purpose"><h2 id="purpose">Mengapa dibangun?</h2><p>Angka dari beberapa sumber tidak selalu bisa langsung dibandingkan. Tahun, jenjang, satuan, dan cakupan wilayah dapat berbeda. Equora menempatkan konteks tersebut bersama data, lalu memperlihatkan bagaimana bobot serta asumsi memengaruhi prioritas dan alokasi.</p></section>
      <section aria-labelledby="users"><h2 id="users">Untuk siapa?</h2><p>Publik, mahasiswa, dan peneliti yang ingin menelusuri data pendidikan, serta analis yang ingin belajar menguji skenario. Akses publik direncanakan tanpa login; operasi data administratif memerlukan perlindungan tersendiri.</p></section>
      <section aria-labelledby="status"><h2 id="status">Status pengembangan</h2><p>Fondasi SvelteKit dan FastAPI serta halaman pengenalan tersedia. Audit dataset, explorer, pemeringkatan prioritas, simulasi, perbandingan skenario, dan peta masih dalam pengembangan. Equora disiapkan untuk Web In Action, MIA 2026.</p><a href="https://github.com/mrizalbasri/Equora">Lihat kode dan dokumentasi proyek</a></section>
      <AvailabilityNotice title="Batas penggunaan"><p>Hasil alokasi adalah simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi, prediksi dampak pendidikan, atau pengganti kajian lapangan. Data yang hilang tidak diperlakukan sebagai nol.</p></AvailabilityNotice>
      <a class="eq-button eq-button-primary" href="/#pratinjau">Kenali alur analisis</a>
    </div>
  </article>
</PublicShell>

<style>
  .about { padding-block: 64px 96px; }
  h1 { max-width: 970px; margin-block: 24px; font-size: clamp(2.4rem, 4.5vw, 4rem); }
  .lead { max-width: 760px; color: var(--eq-text-secondary); font-size: 20px; }
  .content { max-width: 760px; margin-top: 64px; }
  section { border-top: 1px solid var(--eq-border); padding-block: 32px; }
  h2 { font-size: 26px; margin-bottom: 16px; }
  section p { color: var(--eq-text-secondary); }
  section a { display: inline-flex; align-items: center; min-height: 44px; margin-top: 16px; }
  .content > a { margin-top: 32px; }
  @media (max-width: 639px) {
    .about { padding-block: 32px 64px; }
    .lead { font-size: 18px; }
    .content { margin-top: 40px; }
  }
</style>
