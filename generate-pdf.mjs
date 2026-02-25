import puppeteer from 'puppeteer-core';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'verified-evidence-program.html');
const outputPath = path.join(__dirname, 'Verified_Evidence_Program_Reputable_Health.pdf');

// Read HTML — only strip the external <script> tag that blocks page load.
// Keep the Google Fonts <link> and let images load normally.
let html = readFileSync(htmlPath, 'utf-8');
html = html.replace(/<script\s+src\s*=\s*["']https?:\/\/[^"']+["'][^>]*><\/script>/gi, '');

// Auto-detect Chrome/Chromium location
function findChrome() {
  const candidates = [
    // Common Linux paths
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // macOS paths
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  // Try `which`
  try {
    return execSync('which google-chrome || which chromium-browser || which chromium', { encoding: 'utf-8' }).trim();
  } catch {
    return candidates[0]; // fallback
  }
}

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();

// Set a wide viewport so desktop layout is used
await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

// Track failed image loads
const failedImages = [];
page.on('requestfailed', req => {
  if (req.resourceType() === 'image') {
    failedImages.push(req.url());
  }
});

// Load the page and wait for network to settle (images, fonts, icons)
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

// Extra buffer for any slow assets
await new Promise(r => setTimeout(r, 2000));

// Emulate print media so @media print rules apply during PDF generation
await page.emulateMediaType('print');

// Make all reveals visible and hide non-printable elements
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  const aura = document.querySelector('.aura-bg');
  if (aura) aura.style.display = 'none';
  const grid = document.querySelector('.grid-overlay');
  if (grid) grid.style.display = 'none';

  document.querySelectorAll('.section-spacer, .section-spacer-lg').forEach(el => {
    el.style.display = 'none';
  });
});

await page.pdf({
  path: outputPath,
  format: 'Letter',
  printBackground: true,
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in',
  },
  displayHeaderFooter: false,
  preferCSSPageSize: false,
});

await browser.close();

if (failedImages.length > 0) {
  console.warn(`\n⚠  ${failedImages.length} image(s) failed to load:`);
  failedImages.forEach(url => console.warn(`   - ${url}`));
  console.warn('\nThe PDF was generated but those images will be missing.');
  console.warn('Run this script on a machine with internet access to include them.\n');
}

console.log(`PDF saved to: ${outputPath}`);
