const sgMail = require('@sendgrid/mail');

function replaceMergeFields(template, fields) {
  if (!template || !fields) return template;
  let result = template;
  for (const [key, value] of Object.entries(fields)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'SENDGRID_API_KEY not configured' });

  sgMail.setApiKey(apiKey);

  const { recipients, from, subject, html_template, text_template } = req.body || {};
  if (!recipients || !Array.isArray(recipients) || !recipients.length) {
    return res.status(400).json({ error: 'Required: recipients array with {email, merge_fields}' });
  }
  if (!subject || !html_template) {
    return res.status(400).json({ error: 'Required: subject, html_template' });
  }
  if (recipients.length > 1000) {
    return res.status(400).json({ error: 'Max 1000 recipients per batch' });
  }

  const invalid = recipients.filter(r => !r.email);
  if (invalid.length) {
    return res.status(400).json({ error: `${invalid.length} recipients missing email` });
  }

  const defaultFrom = {
    email: process.env.DEFAULT_FROM_EMAIL || 'community@reputable.health',
    name: process.env.DEFAULT_FROM_NAME || 'Reputable Health',
  };

  const personalizations = recipients.map(r => ({
    to: [{ email: r.email }],
    subject: replaceMergeFields(subject, r.merge_fields),
    substitutions: r.merge_fields || {},
  }));

  const msg = {
    personalizations,
    from: from ? { email: from, name: defaultFrom.name } : defaultFrom,
    subject,
    html: html_template,
    text: text_template || html_template.replace(/<[^>]*>/g, ''),
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  const unsubGroup = parseInt(process.env.SENDGRID_UNSUB_GROUP_ID);
  if (unsubGroup > 0) msg.asm = { groupId: unsubGroup };

  try {
    const [response] = await sgMail.send(msg);
    res.json({
      success: true,
      sent: recipients.length,
      status_code: response.statusCode,
    });
  } catch (err) {
    const detail = err.response?.body?.errors?.[0]?.message || err.message;
    console.error('[SendGrid Batch Error]', detail);
    res.status(err.code || 500).json({ error: 'Batch send failed', detail });
  }
};
