const express = require('express');
const https = require('https');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration — set these via environment variables in production
const API_HOST = process.env.API_HOST || 'operations.reputablehealth.net';
const API_KEY = process.env.API_KEY || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500').split(',');

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint — forwards GET /api/recruiting?days=N to the upstream API
app.get('/api/recruiting', (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API_KEY not configured on proxy server' });
  }

  const options = {
    hostname: API_HOST,
    path: `/api/recruiting?days=${days}`,
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
      'Accept': 'application/json'
    }
  };

  const upstream = https.request(options, (upstreamRes) => {
    let body = '';
    upstreamRes.on('data', chunk => { body += chunk; });
    upstreamRes.on('end', () => {
      res.status(upstreamRes.statusCode);
      res.setHeader('Content-Type', 'application/json');
      res.send(body);
    });
  });

  upstream.on('error', (err) => {
    console.error('Upstream request failed:', err.message);
    res.status(502).json({ error: 'Failed to reach upstream API', detail: err.message });
  });

  upstream.setTimeout(15000, () => {
    upstream.destroy();
    res.status(504).json({ error: 'Upstream API timed out' });
  });

  upstream.end();
});

app.listen(PORT, () => {
  console.log(`Reputable API proxy listening on port ${PORT}`);
  console.log(`Upstream: https://${API_HOST}/api/recruiting`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  if (!API_KEY) {
    console.warn('WARNING: API_KEY not set — requests will fail. Set the API_KEY environment variable.');
  }
});
module.exports = app;
