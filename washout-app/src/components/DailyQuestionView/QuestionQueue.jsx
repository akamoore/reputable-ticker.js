import { questions } from '../../data/questions'

export default function QuestionQueue({ currentDay }) {
  const upcoming = []

  for (let i = 1; i <= 2; i++) {
    const dayIndex = currentDay + i - 1
    if (dayIndex < questions.length) {
      upcoming.push({
        day: currentDay + i,
        question: questions[dayIndex],
        opacity: i === 1 ? 0.4 : 0.25,
      })
    }
  }

  if (upcoming.length === 0) return null

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        marginBottom: '0.75rem',
      }}>
        Coming up
      </p>

      {upcoming.map((item, i) => (
        <div
          key={i}
          style={{
            opacity: item.opacity,
            background: 'var(--surface)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            border: '1px solid var(--border)',
            marginBottom: '0.5rem',
            transition: 'opacity 0.3s var(--ease-refined)',
          }}
        >
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--muted)',
            margin: '0 0 0.25rem',
          }}>
            Day {item.day}
          </p>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {currentDay >= 3 && i === 1 ? 'Unlocks tomorrow...' : item.question}
          </p>
        </div>
      ))}
    </div>
  )
}
