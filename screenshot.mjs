import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'bio-age-post.html');
const outputPath = path.join(__dirname, 'bio-age-post.jpg');

const browser = await puppeteer.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for fonts to fully load
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 2000));

await page.screenshot({
  path: outputPath,
  type: 'jpeg',
  quality: 100,
  clip: { x: 0, y: 0, width: 1080, height: 1080 },
});

await browser.close();
console.log(`JPEG saved to: ${outputPath}`);
