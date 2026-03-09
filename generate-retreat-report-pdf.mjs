import puppeteer from 'puppeteer-core';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'design-retreat-stats-report.html');
const outputPath = path.join(__dirname, 'Optimize_Her_Retreat_Stats_Report.pdf');

// Read and prepare HTML
let html = readFileSync(htmlPath, 'utf-8');
html = html.replace(/<script\s+src\s*=\s*["']https?:\/\/[^"']+["'][^>]*><\/script>/gi, '');
html = html.replace(/<link\s+href\s*=\s*["']https?:\/\/[^"']+["'][^>]*>/gi, '');

// Inline local images as base64
html = html.replace(/src="(images\/[^"]+)"/g, (match, imgPath) => {
  const fullPath = path.join(__dirname, imgPath);
  if (existsSync(fullPath)) {
    const data = readFileSync(fullPath);
    const ext = path.extname(imgPath).slice(1).replace('jpg', 'jpeg');
    const b64 = data.toString('base64');
    return `src="data:image/${ext};base64,${b64}"`;
  }
  console.warn(`⚠  Image not found: ${fullPath}`);
  return match;
});

// Auto-detect Chrome/Chromium
function findChrome() {
  const candidates = [
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  try {
    return execSync('which google-chrome || which chromium-browser || which chromium', { encoding: 'utf-8' }).trim();
  } catch {
    return candidates[0];
  }
}

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
await new Promise(r => setTimeout(r, 1000));

await page.emulateMediaType('print');

// Make all reveals visible, hide fixed background elements for print
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  // Keep the dark background but remove the fixed-position grid overlay
  const pageBg = document.querySelector('.page-bg');
  if (pageBg) {
    pageBg.style.position = 'absolute';
    pageBg.style.height = '100%';
  }
});

await page.pdf({
  path: outputPath,
  format: 'Letter',
  printBackground: true,
  margin: {
    top: '0.4in',
    right: '0.4in',
    bottom: '0.4in',
    left: '0.4in',
  },
  displayHeaderFooter: false,
  preferCSSPageSize: false,
});

await browser.close();
console.log(`✅ PDF saved to: ${outputPath}`);
