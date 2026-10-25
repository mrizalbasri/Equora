<script lang="ts">
  import PublicShell from '#lib/components/PublicShell.svelte';
  import AvailabilityNotice from '#lib/components/AvailabilityNotice.svelte';
  import Icon from '#lib/components/Icon.svelte';
</script>

<svelte:head>
  <title>Tentang Equora | Data publik dan keputusan yang terukur</title>
  <meta name="description" content="Tujuan, status pengembangan, dan batas penggunaan Equora, platform perbandingan akses fasilitas pendidikan dan simulasi alokasi sumber daya." />
</svelte:head>

<PublicShell>
  <article class="eq-container about">
    <p class="eq-kicker">Tentang Equora</p>
    <h1>Keputusan lebih terukur dimulai dari data yang bisa diperiksa.</h1>
    <p class="lead">Akses fasilitas pendidikan dapat berbeda antardaerah. Equora dirancang untuk membantu membaca perbedaan itu, memahami prioritas kebutuhan, dan membandingkan pilihan alokasi sumber daya.</p>
    <figure class="about-artwork">
      <img src="/images/editorial/education-discussion.webp" alt="Ilustrasi tiga pendidik mendiskusikan kebutuhan fasilitas sekolah di perpustakaan." width="1536" height="1024" decoding="async" />
      <figcaption>Memahami kebutuhan sekolah dimulai dari pertanyaan dan konteks yang tepat. Ilustrasi.</figcaption>
    </figure>
    <div class="content">
      <section aria-labelledby="purpose"><h2 id="purpose"><Icon name="education" size={22} />Mengapa dibangun?</h2><p>Angka dari beberapa sumber tidak selalu bisa langsung dibandingkan. Tahun, jenjang, satuan, dan cakupan wilayah dapat berbeda. Equora menempatkan konteks tersebut bersama data, lalu memperlihatkan bagaimana bobot serta asumsi memengaruhi prioritas dan alokasi.</p></section>
      <section aria-labelledby="users">
        <h2 id="users"><Icon name="users" size={22} />Untuk siapa?</h2>
        <dl class="audiences">
          <div><dt>Warga dan komunitas</dt><dd>Kenali fasilitas pendidikan di provinsi Anda dan bandingkan dengan provinsi lain pada jenjang yang sama.</dd></div>
          <div><dt>Mahasiswa dan peneliti</dt><dd>Telusuri definisi indikator, cakupan, dan sel sumber sebelum memakai angka dalam kajian.</dd></div>
          <div><dt>Analis dan pembelajar kebijakan</dt><dd>Uji bagaimana bobot, biaya, kapasitas, dan anggaran mengubah alokasi dalam model simulasi.</dd></div>
        </dl>
        <p>Penelusuran data dan simulasi dapat digunakan tanpa login. Akun mengelola identitas dan sesi; impor data memerlukan token admin terpisah.</p>
      </section>
      <section aria-labelledby="start">
        <h2 id="start"><Icon name="compass" size={22} />Mulai dari pertanyaan Anda</h2>
        <div class="starting-points">
          <a href="/daerah"><span><strong>Bagaimana kondisi di daerah saya?</strong><small>Pilih provinsi, baca fasilitasnya, lalu tambahkan pembanding.</small></span><Icon name="arrow" size={20} /></a>
          <a href="/datasets"><span><strong>Dari mana angka ini berasal?</strong><small>Periksa definisi, periode, cakupan, dan catatan kualitas sumber.</small></span><Icon name="arrow" size={20} /></a>
          <a href="/studio"><span><strong>Bagaimana jika prioritasnya diubah?</strong><small>Atur asumsi, hitung alokasi, dan simpan hasil untuk dibandingkan.</small></span><Icon name="arrow" size={20} /></a>
        </div>
      </section>
      <section aria-labelledby="reading">
        <h2 id="reading"><Icon name="database" size={22} />Membaca data dengan konteks</h2>
        <p>Persentase akses menunjukkan proporsi sekolah yang memenuhi definisi fasilitas pada sumbernya. Jumlah sekolah memberi konteks ukuran wilayah. Bandingkan indikator, jenjang, dan periode yang sama; angka antarfasilitas tidak otomatis menunjukkan urutan prioritas.</p>
        <p>Data agregat provinsi tidak menggambarkan kondisi setiap sekolah. Nilai yang tidak tersedia ditandai secara terpisah, sehingga tidak tertukar dengan akses nol persen.</p>
        <a href="/methodology">Pelajari cara membaca hasil <Icon name="arrow" size={16} /></a>
      </section>
      <section aria-labelledby="status"><h2 id="status"><Icon name="development" size={22} />Status pengembangan</h2><p>Explorer, peta provinsi, katalog dataset, simulasi, penyimpanan snapshot, dan perbandingan skenario tersedia untuk review lokal. Hosting publik belum dipilih; lisensi redistribusi data masih perlu diverifikasi. Equora disiapkan untuk Web In Action, MIA 2026.</p><a href="https://github.com/mrizalbasri/Equora">Lihat kode dan dokumentasi proyek</a></section>
      <AvailabilityNotice title="Batas penggunaan"><p>Hasil alokasi adalah simulasi berbasis data dan asumsi, bukan keputusan anggaran resmi, prediksi dampak pendidikan, atau pengganti kajian lapangan. Data yang hilang tidak diperlakukan sebagai nol.</p></AvailabilityNotice>
      <a class="eq-button eq-button-primary" href="/#pratinjau">Kenali alur analisis</a>
    </div>
  </article>
</PublicShell>

<style>
  .about { padding-block: 64px 96px; }
  h1 { max-width: 970px; margin-block: 24px; font-size: clamp(2.4rem, 4.5vw, 4rem); }
  .lead { max-width: 760px; color: var(--eq-text-secondary); font-size: 20px; }
  .about-artwork { max-width: 970px; margin: 40px 0 0; }
  .about-artwork img { display: block; width: 100%; height: auto; }
  figcaption { max-width: 760px; margin-top: 12px; color: var(--eq-text-secondary); font-size: 13px; line-height: 1.6; }
  .content { max-width: 760px; margin-top: 64px; }
  section { border-top: 1px solid var(--eq-border); padding-block: 32px; }
  h2 { display: flex; align-items: baseline; gap: 12px; font-size: 26px; margin-bottom: 16px; }
  h2 :global(svg) { flex: 0 0 auto; align-self: center; color: var(--eq-primary); }
  section p { color: var(--eq-text-secondary); }
  section a { display: inline-flex; align-items: center; min-height: 44px; margin-top: 16px; }
  section > p + p { margin-top: 16px; }
  section > a { gap: 8px; }
  .audiences { margin: 0 0 24px; }
  .audiences > div { display: grid; grid-template-columns: 180px 1fr; gap: 20px; padding-block: 16px; border-bottom: 1px solid var(--eq-border); }
  dt { font-size: 15px; font-weight: 650; }
  dd { margin: 0; color: var(--eq-text-secondary); font-size: 15px; line-height: 1.65; }
  .starting-points a { display: flex; justify-content: space-between; gap: 20px; margin-top: 0; padding-block: 18px; border-bottom: 1px solid var(--eq-border); text-decoration: none; }
  .starting-points a:hover strong { text-decoration: underline; text-underline-offset: 4px; }
  .starting-points strong { display: block; font-size: 16px; color: var(--eq-primary-hover); }
  .starting-points small { display: block; margin-top: 6px; color: var(--eq-text-secondary); font-size: 14px; line-height: 1.6; }
  .starting-points :global(svg) { flex: 0 0 auto; color: var(--eq-primary); }
  .content > a { margin-top: 32px; }
  @media (max-width: 639px) {
    .about { padding-block: 32px 64px; }
    .lead { font-size: 18px; }
    .content { margin-top: 40px; }
    .audiences > div { grid-template-columns: 1fr; gap: 6px; }
  }
</style>
