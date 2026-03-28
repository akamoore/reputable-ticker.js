require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// CONFIGURATION
// ============================================================

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const DEFAULT_FROM = {
  email: process.env.DEFAULT_FROM_EMAIL || 'community@reputable.health',
  name: process.env.DEFAULT_FROM_NAME || 'Reputable Health',
};
const UNSUB_GROUP_ID = parseInt(process.env.SENDGRID_UNSUB_GROUP_ID) || 0;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, webhooks)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again in a minute.' },
});
app.use(limiter);

// JSON body parsing
app.use(express.json({ limit: '2mb' }));

// Request logging
app.use((req, res, next) => {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// HELPERS
// ============================================================

function requireSendGrid(res) {
  if (!SENDGRID_API_KEY) {
    res.status(503).json({
      error: 'SendGrid not configured',
      detail: 'Set SENDGRID_API_KEY in .env file. See .env.example.',
    });
    return false;
  }
  return true;
}

function replaceMergeFields(template, mergeFields) {
  if (!template || !mergeFields) return template;
  let result = template;
  for (const [key, value] of Object.entries(mergeFields)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}

// In-memory webhook event log (in production, use a database)
const webhookEvents = [];
const MAX_STORED_EVENTS = 10000;

// ============================================================
// ENDPOINTS
// ============================================================

// Health check / status
app.get('/api/email/status', (req, res) => {
  res.json({
    connected: true,
    sendgrid_configured: !!SENDGRID_API_KEY,
    from_email: DEFAULT_FROM.email,
    from_name: DEFAULT_FROM.name,
    unsub_group_configured: UNSUB_GROUP_ID > 0,
    webhook_events_stored: webhookEvents.length,
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// ──────────────────────────────────────────────
// POST /api/email/send — single or small batch
// ──────────────────────────────────────────────
app.post('/api/email/send', async (req, res) => {
  if (!requireSendGrid(res)) return;

  const { to, from, subject, html, text } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Required fields: to, subject, html' });
  }

  const recipients = Array.isArray(to) ? to : [to];
  if (recipients.length === 0) {
    return res.status(400).json({ error: 'No recipients provided' });
  }
  if (recipients.length > 1000) {
    return res.status(400).json({ error: 'Max 1000 recipients per request. Use /api/email/send-batch for larger lists.' });
  }

  const msg = {
    to: recipients.map(email => ({ email })),
    from: from ? { email: from, name: DEFAULT_FROM.name } : DEFAULT_FROM,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  if (UNSUB_GROUP_ID > 0) {
    msg.asm = { groupId: UNSUB_GROUP_ID };
  }

  try {
    const [response] = await sgMail.send(msg, recipients.length > 1);
    res.json({
      success: true,
      sent: recipients.length,
      status_code: response.statusCode,
      message_id: response.headers?.['x-message-id'] || null,
    });
  } catch (err) {
    const sgError = err.response?.body?.errors?.[0]?.message || err.message;
    console.error('[SendGrid Error]', sgError);
    res.status(err.code || 500).json({
      error: 'SendGrid send failed',
      detail: sgError,
    });
  }
});

// ──────────────────────────────────────────────
// POST /api/email/send-batch — personalized batch
// ──────────────────────────────────────────────
app.post('/api/email/send-batch', async (req, res) => {
  if (!requireSendGrid(res)) return;

  const { recipients, from, subject, html_template, text_template } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Required: recipients array with {email, merge_fields}' });
  }
  if (!subject || !html_template) {
    return res.status(400).json({ error: 'Required fields: subject, html_template' });
  }
  if (recipients.length > 1000) {
    return res.status(400).json({ error: 'Max 1000 recipients per batch' });
  }

  // Validate all recipients have emails
  const invalid = recipients.filter(r => !r.email);
  if (invalid.length > 0) {
    return res.status(400).json({ error: `${invalid.length} recipients missing email address` });
  }

  // Build personalizations — one per recipient with their merge fields
  const personalizations = recipients.map(r => ({
    to: [{ email: r.email }],
    subject: replaceMergeFields(subject, r.merge_fields),
    substitutions: r.merge_fields || {},
  }));

  // SendGrid substitution tags use {{key}} syntax in the html/text body.
  // We send the template as-is and let substitutions handle personalization.
  // But SendGrid substitutions only work within personalizations,
  // so we also do server-side replacement as a fallback.
  const msg = {
    personalizations,
    from: from ? { email: from, name: DEFAULT_FROM.name } : DEFAULT_FROM,
    subject, // fallback subject (overridden per personalization)
    html: html_template,
    text: text_template || html_template.replace(/<[^>]*>/g, ''),
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  if (UNSUB_GROUP_ID > 0) {
    msg.asm = { groupId: UNSUB_GROUP_ID };
  }

  try {
    // SendGrid allows up to 1000 personalizations per request
    const [response] = await sgMail.send(msg);

    res.json({
      success: true,
      sent: recipients.length,
      status_code: response.statusCode,
      message_id: response.headers?.['x-message-id'] || null,
    });
  } catch (err) {
    const sgError = err.response?.body?.errors?.[0]?.message || err.message;
    console.error('[SendGrid Batch Error]', sgError);
    res.status(err.code || 500).json({
      error: 'SendGrid batch send failed',
      detail: sgError,
      // Include partial info if available
      sent: 0,
      attempted: recipients.length,
    });
  }
});

// ──────────────────────────────────────────────
// POST /api/sendgrid/webhooks — event receiver
// ──────────────────────────────────────────────
app.post('/api/sendgrid/webhooks', (req, res) => {
  const events = req.body;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Expected array of events' });
  }

  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] Webhook: ${events.length} events received`);

  for (const event of events) {
    const record = {
      email: event.email,
      event: event.event,
      timestamp: event.timestamp,
      sg_message_id: event.sg_message_id || null,
      url: event.url || null, // for click events
      reason: event.reason || null, // for bounce events
      received_at: new Date().toISOString(),
    };

    webhookEvents.push(record);

    // Log notable events
    if (event.event === 'bounce') {
      console.log(`  BOUNCE: ${event.email} — ${event.reason || 'unknown reason'}`);
    } else if (event.event === 'unsubscribe') {
      console.log(`  UNSUBSCRIBE: ${event.email}`);
    } else if (event.event === 'spam_report') {
      console.log(`  SPAM REPORT: ${event.email}`);
    }
  }

  // Trim stored events to prevent memory growth
  if (webhookEvents.length > MAX_STORED_EVENTS) {
    webhookEvents.splice(0, webhookEvents.length - MAX_STORED_EVENTS);
  }

  // Always return 200 to SendGrid — non-200 causes retries
  res.status(200).json({ received: events.length });
});

// GET webhook events (for dashboard to poll)
app.get('/api/email/events', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
  const since = req.query.since || null;

  let filtered = webhookEvents;
  if (since) {
    filtered = filtered.filter(e => e.received_at > since);
  }

  const recent = filtered.slice(-limit).reverse();
  res.json({
    events: recent,
    total_stored: webhookEvents.length,
  });
});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((err, req, res, next) => {
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================
// START
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('  Reputable Email Proxy');
  console.log('='.repeat(50));
  console.log(`  Port:           ${PORT}`);
  console.log(`  SendGrid:       ${SENDGRID_API_KEY ? 'Configured' : 'NOT CONFIGURED — set SENDGRID_API_KEY in .env'}`);
  console.log(`  From:           ${DEFAULT_FROM.name} <${DEFAULT_FROM.email}>`);
  console.log(`  Unsub Group:    ${UNSUB_GROUP_ID > 0 ? UNSUB_GROUP_ID : 'Not set'}`);
  console.log(`  CORS Origins:   ${allowedOrigins.join(', ')}`);
  console.log(`  Rate Limit:     ${process.env.RATE_LIMIT_MAX || 100} req/min`);
  console.log('='.repeat(50));
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /api/email/status       — connection check');
  console.log('  POST /api/email/send         — send email(s)');
  console.log('  POST /api/email/send-batch   — send personalized batch');
  console.log('  POST /api/sendgrid/webhooks  — receive SendGrid events');
  console.log('  GET  /api/email/events       — read stored webhook events');
  console.log('');
  console.log('To connect from dashboard: add ?proxy=http://localhost:' + PORT + ' to the nurture.html URL');
  console.log('');
});

module.exports = app;
