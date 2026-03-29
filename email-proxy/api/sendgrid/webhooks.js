module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Expected array of events' });
  }

  console.log(`[Webhook] ${events.length} events received`);
  for (const event of events) {
    if (event.event === 'bounce') console.log(`  BOUNCE: ${event.email} — ${event.reason || 'unknown'}`);
    if (event.event === 'unsubscribe') console.log(`  UNSUBSCRIBE: ${event.email}`);
    if (event.event === 'spam_report') console.log(`  SPAM: ${event.email}`);
  }

  // Always 200 to SendGrid — non-200 causes retries
  res.status(200).json({ received: events.length });
};
