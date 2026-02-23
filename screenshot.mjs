import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = process.argv[2] || 'bio-age-post';
const htmlPath = path.join(__dirname, `${input}.html`);
const outputPath = path.join(__dirname, `${input}.jpg`);

// Read HTML and strip external resources that block rendering offline
let html = readFileSync(htmlPath, 'utf-8');
html = html.replace(/@import\s+url\([^)]+\)\s*;?/g, '/* @import removed for offline render */');
html = html.replace(/<script\s+src\s*=\s*["']https?:\/\/[^"']+["'][^>]*><\/script>/gi, '<!-- external script removed -->');

const browser = await puppeteer.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', req => {
  if (['font', 'stylesheet', 'script'].includes(req.resourceType()) && req.url().startsWith('http')) {
    req.abort();
  } else {
    req.continue();
  }
});
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

// Let layout settle
await new Promise(r => setTimeout(r, 1000));

// Find the .canvas element and screenshot just that region
const canvasEl = await page.$('.canvas') || await page.$('body');
const box = await canvasEl.boundingBox();

await page.screenshot({
  path: outputPath,
  type: 'jpeg',
  quality: 100,
  clip: { x: box.x, y: box.y, width: 1080, height: 1080 },
});

await browser.close();
console.log(`JPEG saved to: ${outputPath}`);
