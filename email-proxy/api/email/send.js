const sgMail = require('@sendgrid/mail');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'SENDGRID_API_KEY not configured' });

  sgMail.setApiKey(apiKey);

  const { to, from, subject, html, text } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Required: to, subject, html' });
  }

  const recipients = Array.isArray(to) ? to : [to];
  if (recipients.length > 1000) {
    return res.status(400).json({ error: 'Max 1000 recipients. Use /api/email/send-batch.' });
  }

  const defaultFrom = {
    email: process.env.DEFAULT_FROM_EMAIL || 'community@reputable.health',
    name: process.env.DEFAULT_FROM_NAME || 'Reputable Health',
  };

  const msg = {
    to: recipients.map(email => ({ email })),
    from: from ? { email: from, name: defaultFrom.name } : defaultFrom,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  const unsubGroup = parseInt(process.env.SENDGRID_UNSUB_GROUP_ID);
  if (unsubGroup > 0) msg.asm = { groupId: unsubGroup };

  try {
    const [response] = await sgMail.send(msg, recipients.length > 1);
    res.json({
      success: true,
      sent: recipients.length,
      status_code: response.statusCode,
    });
  } catch (err) {
    const detail = err.response?.body?.errors?.[0]?.message || err.message;
    console.error('[SendGrid Error]', detail);
    res.status(err.code || 500).json({ error: 'Send failed', detail });
  }
};
