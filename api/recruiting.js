const https = require('https');

module.exports = (req, res) => {
  const API_HOST = process.env.API_HOST || 'operations.reputablehealth.net';
  const API_KEY = process.env.API_KEY || '';
  const days = parseInt(req.query.days, 10) || 30;
  const scope = typeof req.query.scope === 'string' ? req.query.scope : '';

  if (!API_KEY) {
    return res.status(500).json({ error: 'API_KEY not configured on proxy server' });
  }

  const params = new URLSearchParams({ days: String(days) });
  if (scope) params.set('scope', scope);

  const options = {
    hostname: API_HOST,
    path: `/api/recruiting?${params.toString()}`,
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
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(upstreamRes.statusCode).send(body);
    });
  });

  upstream.on('error', (err) => {
    res.status(502).json({ error: 'Failed to reach upstream API', detail: err.message });
  });

  upstream.setTimeout(15000, () => {
    upstream.destroy();
    res.status(504).json({ error: 'Upstream API timed out' });
  });

  upstream.end();
};
