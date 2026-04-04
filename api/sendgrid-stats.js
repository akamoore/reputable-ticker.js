const https = require('https');

module.exports = (req, res) => {
  const API_KEY = process.env.SENDGRID_API_KEY || '';
  const days = parseInt(req.query.days, 10) || 30;

  if (!API_KEY) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY not configured' });
  }

  // Calculate date range
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const options = {
    hostname: 'api.sendgrid.com',
    path: `/v3/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=day`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const upstream = https.request(options, (upstreamRes) => {
    let body = '';
    upstreamRes.on('data', chunk => { body += chunk; });
    upstreamRes.on('end', () => {
      try {
        const raw = JSON.parse(body);
        if (!Array.isArray(raw)) {
          res.setHeader('Content-Type', 'application/json');
          res.status(upstreamRes.statusCode).send(body);
          return;
        }

        const daily = raw.map(d => ({
          date: d.date,
          requests: d.stats[0]?.metrics?.requests || 0,
          delivered: d.stats[0]?.metrics?.delivered || 0,
          opens: d.stats[0]?.metrics?.opens || 0,
          unique_opens: d.stats[0]?.metrics?.unique_opens || 0,
          clicks: d.stats[0]?.metrics?.clicks || 0,
          unique_clicks: d.stats[0]?.metrics?.unique_clicks || 0,
          bounces: d.stats[0]?.metrics?.bounces || 0,
          spam_reports: d.stats[0]?.metrics?.spam_reports || 0,
          unsubscribes: d.stats[0]?.metrics?.unsubscribes || 0,
        }));

        const totals = daily.reduce((acc, d) => ({
          sent: acc.sent + d.requests,
          delivered: acc.delivered + d.delivered,
          opens: acc.opens + d.opens,
          unique_opens: acc.unique_opens + d.unique_opens,
          clicks: acc.clicks + d.clicks,
          unique_clicks: acc.unique_clicks + d.unique_clicks,
          bounces: acc.bounces + d.bounces,
          spam_reports: acc.spam_reports + d.spam_reports,
          unsubscribes: acc.unsubscribes + d.unsubscribes,
        }), { sent: 0, delivered: 0, opens: 0, unique_opens: 0, clicks: 0, unique_clicks: 0, bounces: 0, spam_reports: 0, unsubscribes: 0 });

        totals.open_rate = totals.delivered > 0
          ? ((totals.unique_opens / totals.delivered) * 100).toFixed(1) + '%'
          : '0%';

        const output = {
          updated_at: new Date().toISOString(),
          period: { start: startDate, end: endDate },
          totals,
          daily,
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        res.status(200).json(output);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse SendGrid response', detail: e.message });
      }
    });
  });

  upstream.on('error', (err) => {
    res.status(502).json({ error: 'Failed to reach SendGrid API', detail: err.message });
  });

  upstream.setTimeout(15000, () => {
    upstream.destroy();
    res.status(504).json({ error: 'SendGrid API timed out' });
  });

  upstream.end();
};
