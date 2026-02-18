export default function Sparkline({ data }) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '3px',
      height: '32px',
      marginTop: '0.5rem',
    }}>
      {data.map((val, i) => {
        const height = ((val - min) / range) * 100
        const isLast = i === data.length - 1

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(height, 10)}%`,
              borderRadius: '2px',
              background: isLast ? 'var(--teal)' : 'var(--teal-dim)',
              transition: 'height 0.3s var(--ease-refined)',
            }}
          />
        )
      })}
    </div>
  )
}
