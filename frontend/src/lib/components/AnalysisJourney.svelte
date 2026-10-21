<section class="journey" aria-label="Mulai menggunakan Equora">
  <div class="journey-heading"><h2>Mulai dari mana?</h2><p>Akses lokal tanpa login. Pilih langkah sesuai kebutuhan Anda.</p></div>
  <ol>
    <li><a href="/explore"><span class="step">01</span><strong>Jelajahi data</strong><span aria-hidden="true">→</span></a><p>Lihat peta, pilih provinsi, lalu buka detail wilayah dan sumbernya.</p></li>
    <li><a href="/studio"><span class="step">02</span><strong>Buat simulasi</strong><span aria-hidden="true">→</span></a><p>Atur bobot dan anggaran. Buka hasil tersimpan untuk menguji keputusan, pemerataan, dan bukti sumber.</p><a class="saved" href="/studio#skenario-tersimpan">Buka skenario tersimpan →</a></li>
    <li><a href="/compare"><span class="step">03</span><strong>Bandingkan hasil</strong><span aria-hidden="true">→</span></a><p>Pilih dua snapshot tersimpan untuk menilai perubahan prioritas dan alokasi.</p></li>
  </ol>
  <p class="references">Periksa sumber di <a href="/datasets">katalog dataset</a> dan cara hitung di <a href="/methodology">metodologi</a>. Impor data tersedia melalui menu pengelolaan lokal dan memerlukan token admin.</p>
</section>

<style>
  .journey { text-align: left; border: 1px solid var(--eq-border); border-radius: 16px; padding: 24px; background: var(--eq-surface); }
  .journey-heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 24px; margin-bottom: 20px; }
  h2 { font-size: 20px; margin: 0; }
  p { color: var(--eq-text-secondary); font-size: 14px; line-height: 1.6; margin: 0; }
  ol { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  li > a:first-child { display: flex; gap: 10px; align-items: center; min-height: 44px; text-decoration: none; color: var(--eq-primary-hover); }
  li > a:first-child:hover strong { text-decoration: underline; }
  .step { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--eq-text-secondary); }
  li p { margin-top: 4px; }
  .saved { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; }
  .references { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--eq-border); }
  @media (max-width: 700px) { .journey { padding: 20px; } ol { grid-template-columns: 1fr; gap: 16px; } }
</style>
