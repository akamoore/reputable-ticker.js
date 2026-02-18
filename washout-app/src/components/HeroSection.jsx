export default function HeroSection({ currentDay, activePhase }) {
  return (
    <section className="animate-in" style={{ marginBottom: '1.5rem' }}>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--teal)',
        margin: '0 0 0.35rem',
      }}>
        Washout Journey
      </p>
      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        margin: '0 0 0.35rem',
        color: 'var(--text)',
        lineHeight: 1.2,
      }}>
        {activePhase ? activePhase.title : 'Your Journey'}
      </h1>
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--muted)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {currentDay === 0
          ? 'Your study has ended. Your washout begins now.'
          : `Day ${currentDay} of 30 — ${activePhase?.range ?? ''}`
        }
      </p>
    </section>
  )
}
