<script lang="ts">
  import PublicShell from '#lib/components/PublicShell.svelte';
  import Icon from '#lib/components/Icon.svelte';

  const paths = [
    { label: 'Pahami daerah', title: 'Bagaimana kondisi di daerah saya?', description: 'Pilih provinsi dan lihat fasilitas pendidikan pada jenjang yang sama.', href: '/daerah', action: 'Lihat kondisi provinsi', icon: 'compass', detail: 'Mulai dari wilayah, lalu baca angkanya bersama konteks.', items: ['Provinsi pilihan Anda', 'Indikator fasilitas pendidikan', 'Pembanding pada jenjang dan periode yang sama'] },
    { label: 'Telusuri sumber', title: 'Dari mana angka ini berasal?', description: 'Periksa definisi, periode, dan cakupan sebelum menggunakan sebuah angka.', href: '/datasets', action: 'Periksa katalog dataset', icon: 'database', detail: 'Sebuah angka baru bermakna ketika asalnya jelas.', items: ['Definisi dan satuan indikator', 'Periode dan cakupan data', 'Berkas sumber dan catatan kualitas'] },
    { label: 'Coba simulasi', title: 'Bagaimana jika prioritasnya diubah?', description: 'Ubah asumsi dan bandingkan pilihan alokasi dalam model simulasi.', href: '/studio', action: 'Buka Studio simulasi', icon: 'development', detail: 'Jelajahi pilihan, lalu periksa asumsi di balik hasilnya.', items: ['Bobot kebutuhan yang Anda tentukan', 'Batas anggaran, biaya, dan kapasitas', 'Hasil simulasi untuk dibandingkan'] },
  ] as const;
  let selected = $state(0);
  const current = $derived(paths[selected]);
</script>

<svelte:head>
  <title>Tentang Equora | Data publik dan keputusan yang terukur</title>
  <meta name="description" content="Kenali Equora: pahami fasilitas pendidikan di provinsi Anda, telusuri sumber data, dan jelajahi pilihan melalui simulasi." />
</svelte:head>

<PublicShell>
  <article class="eq-container about">
    <header class="intro">
      <div class="intro-copy">
        <h1>Kenali daerahnya.<br />Periksa datanya.<br /><span>Pahami pilihannya.</span></h1>
        <p class="lead">Equora membantu Anda memahami perbedaan akses fasilitas pendidikan antardaerah, menelusuri sumbernya, dan mencoba pilihan alokasi sumber daya.</p>
        <a class="eq-button eq-button-primary" href="/daerah">Lihat kondisi provinsi <Icon name="arrow" size={18} /></a>
        <a class="intro-link" href="/#pratinjau">Kenali alur analisis</a>
      </div>
      <figure class="artwork">
        <img src="/images/editorial/education-discussion.webp" alt="Ilustrasi tiga pendidik mendiskusikan kebutuhan fasilitas pendidikan di perpustakaan." width="1536" height="1024" decoding="async" />
        <figcaption>Di balik setiap angka, ada kebutuhan pendidikan yang perlu dipahami.</figcaption>
      </figure>
    </header>

    <ul class="context" aria-label="Cakupan dan status Equora">
      <li><strong>Tingkat provinsi</strong><span>Data agregat, bukan per sekolah</span></li>
      <li><strong>2025/2026</strong><span>Konteks tahun ajaran</span></li>
      <li><strong>Review lokal</strong><span>Data dan fitur masih ditinjau</span></li>
    </ul>

    <section class="journey" id="cara-kerja" aria-labelledby="journey-title">
      <div class="section-heading"><h2 id="journey-title">Mulai dari pertanyaan Anda.</h2><p>Pilih kebutuhan Anda untuk melihat bagaimana Equora membantu.</p></div>
      <div class="journey-layout">
        <div class="choices" aria-label="Pilih alur Equora">
          {#each paths as path, index}
            <button class:chosen={selected === index} aria-pressed={selected === index} aria-controls="journey-preview" onclick={() => selected = index}>
              <span class="choice-icon"><Icon name={path.icon} size={22} /></span>
              <span><strong>{path.label}</strong><small>{path.title}</small></span>
              <Icon name="arrow" size={18} />
            </button>
          {/each}
        </div>
        <div id="journey-preview" class="preview" aria-live="polite" aria-atomic="true">
          <span class="preview-label">Cara kerja Equora</span>
          <h3>{current.detail}</h3>
          <p>{current.description}</p>
          <ol>{#each current.items as item}<li>{item}</li>{/each}</ol>
          <a href={current.href} class="eq-button eq-button-primary">{current.action}<Icon name="arrow" size={18} /></a>
          <small class="preview-note">Panduan fitur. Buka halaman terkait untuk melihat data atau menjalankan simulasi.</small>
        </div>
      </div>
    </section>

    <section class="purpose" aria-labelledby="purpose-title">
      <h2 id="purpose-title">Angka saja<br />belum cukup.</h2>
      <div><p class="purpose-lead">Dua angka terlihat sebanding. Tetapi apakah tahun, jenjang, dan definisinya sama?</p><p>Equora dibangun untuk menghadirkan konteks bersama data. Anda dapat membaca perbedaan akses, memeriksa asal angka, lalu memahami bagaimana asumsi memengaruhi pilihan alokasi.</p><a href="/methodology">Pelajari cara membaca hasil <Icon name="arrow" size={18} /></a></div>
    </section>

    <section class="audience" aria-labelledby="audience-title">
      <h2 id="audience-title">Satu ruang, beragam sudut pandang.</h2>
      <dl><div><dt>Warga dan komunitas</dt><dd>Kenali fasilitas pendidikan di provinsi Anda dan temukan konteks pembandingnya.</dd></div><div><dt>Mahasiswa dan peneliti</dt><dd>Periksa definisi, periode, serta cakupan sumber sebelum memakai angka dalam kajian.</dd></div><div><dt>Analis dan pembelajar kebijakan</dt><dd>Jelajahi pengaruh bobot kebutuhan dan batas sumber daya melalui simulasi.</dd></div></dl>
      <p class="access-note">Penelusuran data dan simulasi dapat digunakan tanpa login.</p>
    </section>

    <section class="transparency" aria-labelledby="transparency-title">
      <div class="section-heading"><h2 id="transparency-title">Terbuka tentang data.<br />Jelas tentang batasnya.</h2><p>Periksa konteks ini sebelum membawa hasil ke dalam kajian atau diskusi.</p></div>
      <div class="disclosures">
        <details open><summary>Apa yang bisa disimpulkan dari data?</summary><div><p>Persentase akses menunjukkan proporsi sekolah yang memenuhi definisi fasilitas pada sumbernya. Bandingkan indikator, jenjang, dan periode yang sama.</p><p>Data agregat provinsi tidak menggambarkan kondisi setiap sekolah. Nilai yang tidak tersedia ditandai terpisah dan tidak dianggap nol.</p><a href="/datasets">Periksa sumber dan kualitas data <Icon name="arrow" size={16} /></a></div></details>
        <details><summary>Apakah hasil simulasi merupakan keputusan resmi?</summary><div><p>Hasil alokasi bergantung pada data, bobot, dan asumsi yang digunakan. Hasil ini bukan keputusan anggaran resmi, prediksi dampak pendidikan, atau pengganti kajian lapangan.</p><a href="/methodology#limits">Baca batas interpretasi <Icon name="arrow" size={16} /></a></div></details>
        <details><summary>Sejauh mana Equora dikembangkan?</summary><div><p>Penjelajah data, peta provinsi, katalog dataset, simulasi, serta penyimpanan dan perbandingan skenario tersedia untuk review lokal. Hosting publik belum dipilih dan lisensi redistribusi data masih perlu diverifikasi.</p><p>Equora disiapkan untuk Web In Action, MIA 2026.</p><a href="https://github.com/mrizalbasri/Equora">Lihat kode dan dokumentasi proyek <Icon name="external" size={16} /></a></div></details>
      </div>
    </section>

    <footer class="closing"><div><h2>Mulai dari daerah<br />yang Anda kenal.</h2><p>Pilih provinsi, temukan konteksnya, lalu ajukan pertanyaan berikutnya.</p></div><a class="eq-button eq-button-primary" href="/daerah">Jelajahi provinsi Anda <Icon name="arrow" size={18} /></a></footer>
  </article>
</PublicShell>

<style>
  .about { padding-block: 64px 80px; }
  .intro { display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; gap: 48px; }
  h1 { margin: 0 0 24px; font-size: clamp(2.5rem, 4.5vw, 4.25rem); line-height: 1.08; letter-spacing: -.035em; }
  h1 span { color: var(--eq-primary); }
  .lead { max-width: 54ch; color: var(--eq-text-secondary); font-size: 18px; line-height: 1.75; margin-bottom: 28px; }
  .intro-link { display: inline-flex; align-items: center; min-height: 48px; margin: 12px 0 0 20px; text-underline-offset: 5px; }
  .artwork { margin: 0; }
  .artwork img { width: 100%; height: auto; display: block; border-radius: 16px; }
  figcaption { margin-top: 14px; font-size: 13px; line-height: 1.6; color: var(--eq-text-secondary); }
  .context { list-style: none; padding: 24px 0; margin: 48px 0 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; border-block: 1px solid var(--eq-border); }
  .context strong, .context span { display: block; } .context strong { font-size: 15px; } .context span { margin-top: 5px; font-size: 13px; color: var(--eq-text-secondary); }
  section { margin-top: 88px; scroll-margin-top: 110px; }
  h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); line-height: 1.2; letter-spacing: -.025em; margin: 0; text-wrap: balance; }
  .section-heading { display: flex; justify-content: space-between; align-items: end; gap: 32px; margin-bottom: 32px; }
  .section-heading p { max-width: 36ch; color: var(--eq-text-secondary); line-height: 1.7; margin: 0; }
  .journey-layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 32px; align-items: start; }
  .choices { display: flex; flex-direction: column; gap: 8px; }
  .choices button { display: flex; align-items: center; gap: 16px; width: 100%; min-height: 100px; padding: 20px; border: 1px solid transparent; border-radius: 12px; background: transparent; text-align: left; color: var(--eq-text); cursor: pointer; transition: background-color 180ms ease, border-color 180ms ease; }
  .choices button:hover { background: var(--eq-surface-subtle); } .choices button.chosen { background: var(--eq-primary-tint); border-color: var(--eq-primary); }
  .choices button > :global(svg) { margin-left: auto; flex-shrink: 0; color: var(--eq-primary); }
  .choice-icon { color: var(--eq-primary); flex-shrink: 0; } .choices strong { display: block; font-size: 18px; } .choices small { display: block; margin-top: 6px; color: var(--eq-text-secondary); font-size: 14px; line-height: 1.5; }
  .preview { background: var(--eq-surface); border: 1px solid var(--eq-border); border-radius: 16px; padding: 36px; min-height: 390px; }
  .preview-label { font-size: 13px; color: var(--eq-text-secondary); } .preview h3 { font-size: 26px; line-height: 1.3; margin: 16px 0; text-wrap: balance; } .preview p { color: var(--eq-text-secondary); line-height: 1.7; }
  .preview ol { padding-left: 22px; margin: 24px 0; } .preview li { padding: 7px 0 7px 7px; line-height: 1.6; } .preview li::marker { color: var(--eq-primary); font-weight: 700; }
  .preview-note { display: block; color: var(--eq-text-secondary); font-size: 12px; line-height: 1.6; margin-top: 16px; }
  .purpose { display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; padding: 48px; background: var(--eq-primary-tint); border-radius: 16px; }
  .purpose p { color: var(--eq-text-secondary); line-height: 1.8; } .purpose .purpose-lead { color: var(--eq-text); font-size: 21px; margin-bottom: 16px; }
  section a { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; text-underline-offset: 5px; }
  .purpose a { margin-top: 16px; } .audience dl { margin: 32px 0 20px; } .audience dl > div { display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; padding: 24px 0; border-bottom: 1px solid var(--eq-border); }
  dt { font-weight: 650; font-size: 18px; } dd { margin: 0; color: var(--eq-text-secondary); line-height: 1.75; } .access-note { font-size: 14px; color: var(--eq-text-secondary); }
  .transparency { display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; } .transparency .section-heading { display: block; } .transparency .section-heading p { margin-top: 20px; }
  details { border-bottom: 1px solid var(--eq-border); } summary { cursor: pointer; padding: 22px 4px; font-size: 17px; font-weight: 600; line-height: 1.5; } summary::marker { color: var(--eq-primary); } details > div { padding: 0 4px 24px; } details p { color: var(--eq-text-secondary); line-height: 1.8; margin-bottom: 12px; }
  .closing { margin-top: 88px; padding-top: 48px; border-top: 1px solid var(--eq-border); display: flex; align-items: center; justify-content: space-between; gap: 32px; } .closing p { color: var(--eq-text-secondary); margin-top: 16px; max-width: 48ch; line-height: 1.7; } .closing a { flex-shrink: 0; }
  @media (max-width: 900px) { .intro { gap: 28px; } .intro-link { margin-left: 0; } .section-heading { display: block; } .section-heading p { margin-top: 16px; } .purpose { padding: 32px; gap: 28px; } .transparency { gap: 28px; } }
  @media (max-width: 639px) { .about { padding-block: 32px 56px; } .intro, .journey-layout, .purpose, .transparency { grid-template-columns: 1fr; } .intro { gap: 28px; } h1 { font-size: clamp(2.35rem, 9.5vw, 3.6rem); } .lead { font-size: 17px; } .intro-link { margin-left: 0; display: flex; width: fit-content; } .artwork img { max-height: 230px; object-fit: cover; } .context { grid-template-columns: 1fr; gap: 16px; margin-top: 28px; } .context li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; } .context span { margin: 0; } section { margin-top: 52px; } .journey-layout { gap: 20px; } .choices button { min-height: 84px; padding: 16px; } .preview { padding: 24px; min-height: 0; } .preview h3 { font-size: 23px; } .purpose { padding: 28px 24px; gap: 20px; } .audience dl > div { grid-template-columns: 1fr; gap: 10px; } .closing { margin-top: 52px; padding-top: 32px; align-items: start; flex-direction: column; } }
</style>
