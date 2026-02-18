import ForkDecision from './ForkDecision'

export default function PhaseCard({ phase, isActive, isDone, currentDay, selectedForks, onSelectFork }) {
  const opacity = isActive ? 1 : isDone ? 0.65 : 0.4

  return (
    <div
      style={{
        opacity,
        padding: '1.25rem',
        borderRadius: '12px',
        background: isActive
          ? 'linear-gradient(135deg, var(--surface) 0%, var(--teal-dim) 100%)'
          : 'var(--surface)',
        borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
        transform: isActive ? 'translateX(4px)' : 'translateX(0)',
        transition: 'all 0.35s var(--ease-refined)',
        marginBottom: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{phase.icon}</span>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isActive ? 'var(--teal)' : 'var(--muted)',
        }}>
          {phase.range}
        </span>
      </div>

      <h3 style={{
        fontSize: '1.2rem',
        margin: '0.35rem 0 0.5rem',
        color: 'var(--text)',
      }}>
        {phase.title}
      </h3>

      <p style={{
        fontSize: '0.85rem',
        color: 'var(--muted)',
        lineHeight: 1.6,
        margin: '0 0 0.75rem',
      }}>
        {phase.body}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {phase.pills.map((pill, i) => (
          <span
            key={i}
            style={{
              fontSize: '0.7rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              background: 'var(--teal-dim)',
              color: 'var(--teal)',
              fontWeight: 500,
            }}
          >
            {pill}
          </span>
        ))}
      </div>

      {phase.hasFork && isActive && (
        <ForkDecision
          options={phase.forkOptions}
          phaseId={phase.id}
          selectedForks={selectedForks}
          onSelect={onSelectFork}
        />
      )}
    </div>
  )
}
