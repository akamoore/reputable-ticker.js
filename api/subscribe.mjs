/**
 * Newsletter Signup Handler — SendGrid Integration
 *
 * Adds a contact to a SendGrid marketing contact list.
 *
 * Environment variables required:
 *   SENDGRID_API_KEY   — Your SendGrid API key (starts with "SG.")
 *   SENDGRID_LIST_ID   — The ID of the contact list to add subscribers to
 *
 * Request body (JSON):
 *   { "email": "...", "first_name": "...", "last_name": "..." }
 *
 * Deployment options:
 *   - Vercel Serverless Function: rename to api/subscribe.js and export default
 *   - Netlify Function: wrap in exports.handler with event/context
 *   - Express: import and mount as app.post('/api/subscribe', handler)
 *   - Standalone: run with node (see bottom of file)
 */

// ── SendGrid Marketing Contacts API ────────────────────────────

const SENDGRID_API_BASE = 'https://api.sendgrid.com/v3';

/**
 * Add or update a contact in SendGrid Marketing Contacts and
 * optionally assign them to a specific list.
 */
async function addContact({ email, firstName, lastName }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const listId = process.env.SENDGRID_LIST_ID;

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  const contact = { email };
  if (firstName) contact.first_name = firstName;
  if (lastName) contact.last_name = lastName;

  const body = { contacts: [contact] };
  if (listId) {
    body.list_ids = [listId];
  }

  const res = await fetch(`${SENDGRID_API_BASE}/marketing/contacts`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.errors?.[0]?.message || `SendGrid API error (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

// ── Validation ──────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Request handler (framework-agnostic) ────────────────────────

export async function handler(req) {
  // Only accept POST
  if (req.method && req.method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed' } };
  }

  const { email, first_name, last_name } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return { status: 400, body: { error: 'A valid email address is required.' } };
  }

  try {
    const result = await addContact({
      email,
      firstName: first_name,
      lastName: last_name,
    });

    return {
      status: 200,
      body: {
        message: 'Successfully subscribed!',
        job_id: result.job_id,
      },
    };
  } catch (err) {
    console.error('SendGrid error:', err.message);

    // If SendGrid says the contact already exists, return 409
    if (err.message.toLowerCase().includes('already exist')) {
      return { status: 409, body: { error: 'This email is already subscribed.' } };
    }

    return {
      status: err.status || 500,
      body: { error: 'Failed to subscribe. Please try again later.' },
    };
  }
}

// ── Vercel / Netlify / Edge adapter ─────────────────────────────
// Vercel Serverless Functions (Node.js runtime)
export default async function vercelHandler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const result = await handler({ method: req.method, body: req.body });
  return res.status(result.status).json(result.body);
}

// ── Express adapter ─────────────────────────────────────────────
export function expressHandler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  handler({ method: req.method, body: req.body })
    .then((result) => res.status(result.status).json(result.body))
    .catch(() => res.status(500).json({ error: 'Internal server error' }));
}

// ── Standalone server (for local development) ───────────────────
// Run: SENDGRID_API_KEY=SG.xxx node api/subscribe.mjs --serve
if (process.argv.includes('--serve')) {
  const { createServer } = await import('node:http');
  const PORT = process.env.PORT || 3001;

  const server = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    if (req.url !== '/api/subscribe' || req.method !== 'POST') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not found' }));
    }

    // Parse JSON body
    let body = '';
    for await (const chunk of req) body += chunk;

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }

    const result = await handler({ method: 'POST', body: parsed });
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
  });

  server.listen(PORT, () => {
    console.log(`Subscribe API listening on http://localhost:${PORT}/api/subscribe`);
  });
}
