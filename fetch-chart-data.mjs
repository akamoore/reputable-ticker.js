#!/usr/bin/env node
// Run locally: node fetch-chart-data.mjs
// Fetches Meta Ads + AppsFlyer data into data/ folder for the dashboard charts.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

// Load .env file if present
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || 'act_2045754205850315';
const APPSFLYER_API_TOKEN = process.env.APPSFLYER_API_TOKEN;
const APPSFLYER_APP_ID = process.env.APPSFLYER_APP_ID || 'id6451213618';

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

  // AppsFlyer Pull API — aggregate data endpoint
  // Docs: https://dev.appsflyer.com/hc/reference/get_app-id-partners-by-date-report-v5-1
  const url = `https://hq1.appsflyer.com/api/agg-data/export/app/${APPSFLYER_APP_ID}/partners_by_date_report/v5?from=${FROM_DATE}&to=${TO_DATE}`;

  let text = null;
  let succeeded = false;
  try {
    console.log(`  Fetching from hq1.appsflyer.com...`);
    const resp = await fetch(url, {
      headers: {
        'Accept': 'text/csv',
        'Authorization': `Bearer ${APPSFLYER_API_TOKEN}`,
      },
      signal: AbortSignal.timeout(15000),
    });
    text = await resp.text();
    if (!resp.ok) {
      console.error(`  ✗ HTTP ${resp.status}: ${text.slice(0, 200)}`);
    } else if (!text || !text.toLowerCase().includes('date')) {
      console.error(`  ✗ Unexpected response:`, text.slice(0, 200));
    } else {
      console.log(`  ✓ Success`);
      succeeded = true;
    }
  } catch (err) {
    console.error(`  ✗ Fetch failed:`, err.message);
  }

  if (!succeeded) {
    console.error('✗ AppsFlyer API request failed');
    return;
  }

  try {

    // Parse CSV
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    // Aggregate installs by date (CSV has multiple rows per date, one per source)
    const byDate = {};

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });

      const date = row['Date'] || row['date'] || '';
      const installs = parseInt(row['Installs'] || row['installs'] || 0);
      if (date) byDate[date] = (byDate[date] || 0) + installs;
    }

    const daily = Object.entries(byDate)
      .map(([date, installs]) => ({ date, installs }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalInstalls = daily.reduce((sum, d) => sum + d.installs, 0);

    const result = {
      updated_at: new Date().toISOString(),
      period: { start: FROM_DATE, end: TO_DATE },
      totals: { installs: totalInstalls, sessions: 0, uninstalls: 0 },
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
