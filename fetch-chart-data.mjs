#!/usr/bin/env node
// Run locally: node fetch-chart-data.mjs
// Fetches Meta Ads + AppsFlyer data into data/ folder for the dashboard charts.

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

const META_ACCESS_TOKEN = 'EAAMFJ4efZBA4BQhaXKpZClERlEKe9D3AfKscXDIeVuNfAC7lCVXm00jBsLornvKTQTDcqSZBSWT8ufdhjaeqZBdAa5F6q7TSVGFwAjtJW5pt7wE1SZCYWayZBGsAmsLPe5KqTpXyg3MBvvOtXE6sTNzEgRR1jSNZCPAM0ZCtwiRYjnO3uN7azO7UZCQhW91kkBwZDZD';
const META_AD_ACCOUNT_ID = 'act_2045754205850315';

const APPSFLYER_API_TOKEN = 'eyJhbGciOiJBMjU2S1ciLCJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoiSldUIiwiemlwIjoiREVGIn0.vmZysoZFTxaeZWQfil-QydbdypHOEj9CRaG8u0fXlorTPQT86vYewg.iZs3q_aecRPcu4Wj.WqJnq-ulCXk8kTPcNwtyp4K2ED73nL06vLshTxdCoo-2FZXQxRCxLKnhCuCaCll8YLAEC9fgxe_QwDwrYzh7gqKy2s9WLq9o0dMbhTfq6nzIRBtEn7zf0J97TPYjqQVmNixasaekaM41E1ZFr1_t0PbxTQDTokjdWfqQr5DU2d1zywMukn_oT_NYc97tcGzTZVrSDXZtNhVd__jrNExips_-Qvv3RV_YdOQDuAdXLyKI0px1hrP1JkZya2wQ1JvJKPj8_yNTeowcQ8YqDNPxwND4uI5jsLqizDyKdSsAJpOlLQTXJj8-b3FGpX8uNRlznMlCOdcZysSnuO6d1V9pYzKrIqmS.a4L4sUi6P1MyOjOr_R9JuQ';
const APPSFLYER_APP_ID = 'id6451213618';

const FROM_DATE = '2026-01-01';
const TO_DATE = new Date().toISOString().slice(0, 10);

async function fetchMetaAds() {
  console.log('Fetching Meta Ads daily insights...');
  const timeRange = JSON.stringify({ since: FROM_DATE, until: TO_DATE });
  const url = `https://graph.facebook.com/v21.0/${META_AD_ACCOUNT_ID}/insights?fields=spend,clicks,impressions,cpc&time_increment=1&time_range=${encodeURIComponent(timeRange)}&level=account&limit=500&access_token=${META_ACCESS_TOKEN}`;

  try {
    const resp = await fetch(url);
    const raw = await resp.json();

    if (raw.error) {
      console.error('✗ Meta Ads API error:', raw.error.message);
      return;
    }

    const daily = (raw.data || []).map(row => ({
      date: row.date_start,
      spend: parseFloat(row.spend || 0),
      clicks: parseInt(row.clicks || 0),
      impressions: parseInt(row.impressions || 0),
      cpc: parseFloat(row.cpc || 0),
    })).sort((a, b) => a.date.localeCompare(b.date));

    const result = {
      updated_at: new Date().toISOString(),
      period: { start: FROM_DATE, end: TO_DATE },
      daily,
      ads: [],
    };

    const outPath = join(dataDir, 'meta-ads-stats.json');
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`✓ Saved data/meta-ads-stats.json (${daily.length} days)`);
  } catch (err) {
    console.error('✗ Meta Ads fetch failed:', err.message);
  }
}

async function fetchAppsFlyer() {
  console.log('Fetching AppsFlyer installs...');

  // Try multiple API base URLs (AppsFlyer uses different hosts)
  const baseUrls = [
    'https://hq.appsflyer.com',
    'https://api3.appsflyer.com',
    'https://api2.appsflyer.com',
  ];
  const path = `/api/agg-data/export/app/${APPSFLYER_APP_ID}/installs_report/v5?from=${FROM_DATE}&to=${TO_DATE}&timezone=America/New_York&groupings=date&kpis=installs,loyal_users`;

  let text = null;
  for (const base of baseUrls) {
    const url = base + path;
    console.log(`  Trying ${base}...`);
    try {
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${APPSFLYER_API_TOKEN}`,
          'accept': 'text/csv',
        },
      });
      text = await resp.text();
      if (resp.ok && text && text.toLowerCase().includes('date')) {
        console.log(`  ✓ Got response from ${base}`);
        break;
      }
      console.log(`  ✗ ${base} returned ${resp.status}: ${text.slice(0, 100)}`);
      text = null;
    } catch (err) {
      console.log(`  ✗ ${base} failed: ${err.message}`);
    }
  }

  try {
    if (!text || !text.toLowerCase().includes('date')) {
      console.error('✗ AppsFlyer: no valid response from any endpoint');
      console.error('  You can manually export a CSV from the AppsFlyer dashboard');
      console.error('  and save it as data/appsflyer-stats.json (see README for format)');
      return;
    }

    // Parse CSV
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const daily = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });

      const date = row['Date'] || row['date'] || '';
      const installs = parseInt(row['Installs'] || row['installs'] || 0);
      if (date) daily.push({ date, installs });
    }

    daily.sort((a, b) => a.date.localeCompare(b.date));

    const result = {
      updated_at: new Date().toISOString(),
      period: { start: FROM_DATE, end: TO_DATE },
      daily,
      bySource: [],
    };

    const outPath = join(dataDir, 'appsflyer-stats.json');
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`✓ Saved data/appsflyer-stats.json (${daily.length} days)`);
  } catch (err) {
    console.error('✗ AppsFlyer fetch failed:', err.message);
  }
}

await fetchMetaAds();
await fetchAppsFlyer();
console.log('\nDone! Commit & push the new files in data/ to update the dashboard.');
