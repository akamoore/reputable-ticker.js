import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'verified-evidence-program.html');
const outputPath = path.join(__dirname, 'Verified_Evidence_Program_Reputable_Health.pdf');

// Read HTML and strip external scripts/imports that block rendering
let html = readFileSync(htmlPath, 'utf-8');
html = html.replace(/@import\s+url\([^)]+\)\s*;?/g, '');
html = html.replace(/<script\s+src\s*=\s*["']https?:\/\/[^"']+["'][^>]*><\/script>/gi, '');
html = html.replace(/<link\s+href\s*=\s*["']https?:\/\/fonts[^"']+["'][^>]*>/gi, '');

const browser = await puppeteer.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();

// Intercept requests - block external fonts/scripts, allow images
await page.setRequestInterception(true);
page.on('request', req => {
  const type = req.resourceType();
  if (['font', 'stylesheet', 'script'].includes(type) && req.url().startsWith('http')) {
    req.abort();
  } else {
    req.continue();
  }
});

// Set a wide viewport so desktop layout is used
await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

// Load the page
await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

// Give images time to load
await new Promise(r => setTimeout(r, 4000));

// Make all reveals visible and inject PDF-specific overrides
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  // Hide the fixed background elements (they don't render well in PDF)
  const aura = document.querySelector('.aura-bg');
  if (aura) aura.style.display = 'none';
  const grid = document.querySelector('.grid-overlay');
  if (grid) grid.style.display = 'none';

  // Remove spacers - page breaks handle spacing
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
console.log(`PDF saved to: ${outputPath}`);
