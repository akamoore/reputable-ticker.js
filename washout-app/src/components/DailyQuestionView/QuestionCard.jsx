import { questions, answerOptions } from '../../data/questions'

export default function QuestionCard({ currentDay, selectedOption, onAnswer }) {
  const question = questions[currentDay - 1]
  const isAnswered = selectedOption !== null

  if (!question) {
    return (
      <div style={{
        background: 'var(--surface)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <p style={{ color: 'var(--muted)' }}>No question available for this day.</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      marginBottom: '1rem',
    }}>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--teal)',
        margin: '0 0 0.5rem',
      }}>
        Day {currentDay} — Daily Check-in
      </p>

      <h3 style={{
        fontSize: '1.1rem',
        margin: '0 0 1.25rem',
        lineHeight: 1.5,
        color: 'var(--text)',
      }}>
        {question}
      </h3>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: isAnswered ? '1rem' : 0,
      }}>
        {answerOptions.map((opt, i) => {
          const isSelected = selectedOption === opt
          return (
            <button
              key={i}
              onClick={() => onAnswer(opt)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: isSelected
                  ? '1.5px solid var(--teal)'
                  : '1.5px solid var(--border)',
                background: isSelected ? 'var(--teal-dim)' : 'var(--surface2)',
                color: isSelected ? 'var(--teal)' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'all 0.2s var(--ease-refined)',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--gold)',
            fontWeight: 600,
            background: 'var(--gold-dim)',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
          }}>
            +5 ♥ heartbeats
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--teal)',
          }}>
            ✓ Submitted
          </span>
        </div>
      )}
    </div>
  )
}
