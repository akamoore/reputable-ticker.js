const express = require('express');
const https = require('https');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration — set these via environment variables in production
const API_HOST = process.env.API_HOST || 'operations.reputablehealth.net';
const API_KEY = process.env.API_KEY || '';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500').split(',');

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

// ============================================================
// SENDGRID EMAIL ENDPOINTS
// ============================================================

app.use(express.json({ limit: '1mb' }));

// Send email via SendGrid
app.post('/api/email/send', async (req, res) => {
  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY not configured' });
  }

  const { to, from, subject, html, text, categories, custom_args } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'to, subject, and html are required' });
  }

  const recipients = Array.isArray(to) ? to : [to];
  const personalizations = recipients.map(email => ({
    to: [{ email }],
    ...(custom_args ? { custom_args } : {}),
  }));

  const payload = JSON.stringify({
    personalizations,
    from: { email: from || 'community@reputable.health', name: 'Reputable Health' },
    subject,
    content: [
      { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
      { type: 'text/html', value: html },
    ],
    ...(categories ? { categories } : {}),
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true },
    },
    asm: { group_id: parseInt(process.env.SENDGRID_UNSUB_GROUP_ID) || 0 },
  });

  const options = {
    hostname: 'api.sendgrid.com',
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const sgReq = https.request(options, sgRes => {
    let body = '';
    sgRes.on('data', chunk => { body += chunk; });
    sgRes.on('end', () => {
      if (sgRes.statusCode >= 200 && sgRes.statusCode < 300) {
        res.json({ success: true, sent: recipients.length, message_id: sgRes.headers['x-message-id'] });
      } else {
        res.status(sgRes.statusCode).json({ error: 'SendGrid error', status: sgRes.statusCode, detail: body });
      }
    });
  });
  sgReq.on('error', err => {
    res.status(502).json({ error: 'Failed to reach SendGrid', detail: err.message });
  });
  sgReq.write(payload);
  sgReq.end();
});

// SendGrid webhook receiver (opens, clicks, bounces, etc.)
app.post('/api/sendgrid/webhooks', (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Expected array of events' });
  }

  // Log events — in production, store these in a database
  console.log(`[SendGrid Webhook] Received ${events.length} events`);
  events.forEach(event => {
    console.log(`  ${event.event}: ${event.email} (msg: ${event.sg_message_id || 'N/A'})`);
  });

  // Always return 200 to SendGrid
  res.status(200).json({ received: events.length });
});

// Check SendGrid connection
app.get('/api/email/status', (req, res) => {
  res.json({
    sendgrid_configured: !!SENDGRID_API_KEY,
    from_email: 'community@reputable.health',
  });
});

app.listen(PORT, () => {
  console.log(`Reputable API proxy listening on port ${PORT}`);
  console.log(`Upstream: https://${API_HOST}/api/recruiting`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  if (!API_KEY) {
    console.warn('WARNING: API_KEY not set — recruiting API requests will fail.');
  }
  if (!SENDGRID_API_KEY) {
    console.warn('WARNING: SENDGRID_API_KEY not set — email endpoints will return errors.');
  }
});
module.exports = app;
