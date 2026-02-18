export default function InsightBanner({ currentDay }) {
  let text
  if (currentDay <= 6) {
    text = "Your HRV is trending down since your study ended — this is expected and validates your intervention's effect."
  } else if (currentDay <= 13) {
    text = "One week in. Your resting heart rate is stabilizing and sleep quality metrics are beginning to normalize."
  } else if (currentDay <= 20) {
    text = "Halfway through your washout. Metrics are approaching your pre-study baseline — the rebaseline is working."
  } else {
    text = "Your metrics have stabilized and converged on your true baseline. You're washout-ready."
  }

  return (
    <div style={{
      background: 'var(--teal-dim)',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      border: '1px solid var(--teal-mid)',
      marginBottom: '1.25rem',
    }}>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--teal)',
        margin: '0 0 0.35rem',
      }}>
        ✦ Insight
      </p>
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text)',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {text}
      </p>
    </div>
  )
}
