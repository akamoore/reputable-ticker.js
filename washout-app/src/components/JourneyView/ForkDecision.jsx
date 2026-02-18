export default function ForkDecision({ options, phaseId, selectedForks, onSelect }) {
  const selected = selectedForks[phaseId]

  return (
    <div className="fork-reveal" style={{ marginTop: '1rem' }}>
      <p style={{
        color: 'var(--gold)',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
      }}>
        ✦ Choose your path
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem',
      }}>
        {options.map((opt, i) => {
          const isSelected = selected === i
          const isHighlight = opt.highlight

          return (
            <button
              key={i}
              onClick={() => onSelect(phaseId, i)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                borderRadius: '10px',
                border: isSelected
                  ? '1.5px solid var(--teal)'
                  : isHighlight
                    ? '1.5px solid var(--teal-mid)'
                    : '1.5px solid var(--border)',
                background: isSelected
                  ? 'var(--teal-dim)'
                  : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.25s var(--ease-refined)',
                color: 'var(--text)',
              }}
            >
              <span style={{
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isHighlight ? 'var(--teal)' : 'var(--muted)',
                marginBottom: '0.4rem',
              }}>
                {opt.label}
              </span>
              <h4 style={{
                fontSize: '1rem',
                margin: '0 0 0.35rem 0',
                color: 'var(--text)',
              }}>
                {opt.title}
              </h4>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--muted)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {opt.desc}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
