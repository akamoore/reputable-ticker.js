const markers = [
  { day: 0, label: '0' },
  { day: 7, label: '7' },
  { day: 14, label: '14', isDecision: true },
  { day: 21, label: '21' },
  { day: 30, label: '30', isDecision: true },
]

export default function TimelineTrack({ currentDay, progress, onMarkerClick }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Progress bar */}
      <div style={{
        position: 'relative',
        height: '4px',
        background: 'var(--surface2)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--teal)',
          borderRadius: '2px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>

      {/* Markers */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        position: 'relative',
      }}>
        {markers.map(m => {
          const isPast = currentDay >= m.day
          const isActive = currentDay === m.day || (m.day === 0 && currentDay === 0)

          return (
            <button
              key={m.day}
              onClick={() => onMarkerClick(m.day)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 2px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: m.isDecision ? '14px' : '10px',
                height: m.isDecision ? '14px' : '10px',
                borderRadius: '50%',
                background: isActive
                  ? 'var(--teal)'
                  : isPast
                    ? 'var(--teal)'
                    : 'var(--surface2)',
                boxShadow: isActive ? '0 0 10px rgba(62, 207, 178, 0.5)' : 'none',
                transition: 'all 0.3s var(--ease-refined)',
                fontSize: '7px',
                lineHeight: 1,
                color: 'var(--bg)',
              }}>
                {m.isDecision ? '✦' : ''}
              </span>
              <span style={{
                fontSize: '0.65rem',
                color: isPast ? 'var(--teal)' : 'var(--muted)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {m.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
