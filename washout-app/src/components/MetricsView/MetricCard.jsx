import Sparkline from './Sparkline'

export default function MetricCard({ label, value, sub, sparkData }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '1.25rem',
      border: '1px solid var(--border)',
    }}>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        margin: '0 0 0.25rem',
      }}>
        {label}
      </p>
      <p className="metric-value" style={{
        fontSize: '1.75rem',
        fontWeight: 600,
        color: 'var(--text)',
        margin: '0 0 0.15rem',
        fontFamily: "'DM Serif Display', serif",
      }}>
        {value}
      </p>
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--muted)',
        margin: 0,
      }}>
        {sub}
      </p>
      <Sparkline data={sparkData} />
    </div>
  )
}
