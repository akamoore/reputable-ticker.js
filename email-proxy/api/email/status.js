module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  res.json({
    connected: true,
    sendgrid_configured: !!process.env.SENDGRID_API_KEY,
    from_email: process.env.DEFAULT_FROM_EMAIL || 'community@reputable.health',
    from_name: process.env.DEFAULT_FROM_NAME || 'Reputable Health',
    unsub_group_configured: !!process.env.SENDGRID_UNSUB_GROUP_ID,
    uptime_seconds: Math.floor(process.uptime()),
  });
};
