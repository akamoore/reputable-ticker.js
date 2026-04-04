const https = require('https');

module.exports = (req, res) => {
  const API_KEY = process.env.SENDGRID_API_KEY || '';
  const days = parseInt(req.query.days, 10) || 30;

  if (!API_KEY) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY not configured' });
  }

  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const path = '/v3/stats?start_date=' + startDate + '&end_date=' + endDate + '&aggregated_by=day';

  const options = {
    hostname: 'api.sendgrid.com',
    path: path,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json',
    },
  };

  var upstream = https.request(options, function(upstreamRes) {
    var body = '';
    upstreamRes.on('data', function(chunk) { body += chunk; });
    upstreamRes.on('end', function() {
      try {
        var raw = JSON.parse(body);
        if (!Array.isArray(raw)) {
          res.setHeader('Content-Type', 'application/json');
          return res.status(upstreamRes.statusCode).send(body);
        }

        var daily = raw.map(function(d) {
          var m = (d.stats && d.stats[0] && d.stats[0].metrics) || {};
          return {
            date: d.date,
            requests: m.requests || 0,
            delivered: m.delivered || 0,
            opens: m.opens || 0,
            unique_opens: m.unique_opens || 0,
            clicks: m.clicks || 0,
            unique_clicks: m.unique_clicks || 0,
            bounces: m.bounces || 0,
            spam_reports: m.spam_reports || 0,
            unsubscribes: m.unsubscribes || 0,
          };
        });

        var totals = { sent: 0, delivered: 0, opens: 0, unique_opens: 0, clicks: 0, unique_clicks: 0, bounces: 0, spam_reports: 0, unsubscribes: 0 };
        for (var i = 0; i < daily.length; i++) {
          totals.sent += daily[i].requests;
          totals.delivered += daily[i].delivered;
          totals.opens += daily[i].opens;
          totals.unique_opens += daily[i].unique_opens;
          totals.clicks += daily[i].clicks;
          totals.unique_clicks += daily[i].unique_clicks;
          totals.bounces += daily[i].bounces;
          totals.spam_reports += daily[i].spam_reports;
          totals.unsubscribes += daily[i].unsubscribes;
        }
        totals.open_rate = totals.delivered > 0
          ? ((totals.unique_opens / totals.delivered) * 100).toFixed(1) + '%'
          : '0%';

        var output = {
          updated_at: new Date().toISOString(),
          period: { start: startDate, end: endDate },
          totals: totals,
          daily: daily,
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        res.status(200).json(output);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse SendGrid response', detail: e.message });
      }
    });
  });

  upstream.on('error', function(err) {
    res.status(502).json({ error: 'Failed to reach SendGrid API', detail: err.message });
  });

  upstream.setTimeout(15000, function() {
    upstream.destroy();
    res.status(504).json({ error: 'SendGrid API timed out' });
  });

  upstream.end();
};
