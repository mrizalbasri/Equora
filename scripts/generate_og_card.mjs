import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import playwright from '../frontend/node_modules/@playwright/test/index.js';
const { chromium } = playwright;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const logoBuffer = fs.readFileSync(path.join(rootDir, 'frontend/static/images/brand/equora-logo.webp'));
const logoDataUri = `data:image/webp;base64,${logoBuffer.toString('base64')}`;

const artworkBuffer = fs.readFileSync(path.join(rootDir, 'frontend/static/images/landing/school-editorial.webp'));
const artworkDataUri = `data:image/webp;base64,${artworkBuffer.toString('base64')}`;

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #091829;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  /* Ambient background glows */
  .glow-top-left {
    position: absolute;
    top: -120px;
    left: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(18, 100, 216, 0.45) 0%, rgba(9, 24, 41, 0) 70%);
    pointer-events: none;
  }
  .glow-bottom-right {
    position: absolute;
    bottom: -150px;
    right: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(30, 64, 175, 0.35) 0%, rgba(9, 24, 41, 0) 70%);
    pointer-events: none;
  }

  /* Grid pattern overlay */
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Main container */
  .card-container {
    position: relative;
    z-index: 10;
    width: 1120px;
    height: 550px;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 40px;
    align-items: center;
  }

  /* Left column */
  .left-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 20px 0;
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-logo {
    width: 54px;
    height: 54px;
    filter: drop-shadow(0 4px 12px rgba(18, 100, 216, 0.5));
  }
  .brand-name {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #ffffff;
  }
  .brand-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 9999px;
    background: rgba(18, 100, 216, 0.25);
    border: 1px solid rgba(56, 189, 248, 0.4);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #7dd3fc;
  }

  .content-block {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .headline {
    font-size: 46px;
    font-weight: 750;
    line-height: 1.08;
    letter-spacing: -0.035em;
    color: #f8fafc;
  }
  .headline span {
    color: #60a5fa;
  }
  .description {
    font-size: 19px;
    line-height: 1.5;
    color: #94a3b8;
    max-width: 560px;
  }

  .indicators-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
  }
  .indicator-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }
  .indicator-pill svg {
    width: 14px;
    height: 14px;
    fill: #38bdf8;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 14px;
    font-weight: 550;
    color: #64748b;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 18px;
  }
  .url-label {
    color: #38bdf8;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .meta-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #475569;
  }

  /* Right column (Illustration preview card) */
  .right-col {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .preview-frame {
    position: relative;
    width: 100%;
    background: #ffffff;
    border-radius: 20px;
    padding: 12px;
    box-shadow: 
      0 20px 40px -10px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.15),
      0 0 50px rgba(18, 100, 216, 0.25);
    overflow: hidden;
  }
  .preview-image {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 12px;
  }
  .preview-tag {
    position: absolute;
    bottom: 22px;
    right: 22px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    color: #f1f5f9;
  }
</style>
</head>
<body>
  <div class="glow-top-left"></div>
  <div class="glow-bottom-right"></div>
  <div class="grid-pattern"></div>

  <div class="card-container">
    <div class="left-col">
      <div class="brand-row">
        <img class="brand-logo" src="${logoDataUri}" alt="Equora logo" />
        <span class="brand-name">EQUORA</span>
        <span class="brand-badge">Data Fasilitas Pendidikan</span>
      </div>

      <div class="content-block">
        <h1 class="headline">Beda wilayah.<br /><span>Beda kebutuhan.</span></h1>
        <p class="description">
          Telusuri fasilitas sekolah antarprovinsi dengan data terbuka Kemendikdasmen, periksa bukti sumber, dan uji simulasi prioritas alokasi.
        </p>

        <div class="indicators-row">
          <div class="indicator-pill">
            <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            Sanitasi Dasar
          </div>
          <div class="indicator-pill">
            <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            Air Minum Layak
          </div>
          <div class="indicator-pill">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Internet Pengajaran
          </div>
          <div class="indicator-pill">
            <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Komputer
          </div>
        </div>
      </div>

      <div class="footer-meta">
        <span class="url-label">equora.id</span>
        <span class="meta-dot"></span>
        <span>Peta GIS & Profil Daerah</span>
        <span class="meta-dot"></span>
        <span>Simulasi Kebijakan MCDA</span>
      </div>
    </div>

    <div class="right-col">
      <div class="preview-frame">
        <img class="preview-image" src="${artworkDataUri}" alt="Equora School Illustration" />
        <span class="preview-tag">Eksplorasi & Simulasi</span>
      </div>
    </div>
  </div>
</body>
</html>`;

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2 // 2x for ultra-sharp rendering
  });
  await page.setContent(html, { waitUntil: 'networkidle' });
  
  const tmpPngPath = path.join(rootDir, 'tmp', 'og-raw.png');
  fs.mkdirSync(path.join(rootDir, 'tmp'), { recursive: true });
  await page.screenshot({ path: tmpPngPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log('Raw screenshot captured:', tmpPngPath);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
