export default function DaySlider({ currentDay, onChange }) {
  const label = currentDay === 0 ? 'Study End' : `Day ${currentDay}`

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
    }}>
      <span style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--teal)',
        minWidth: '100px',
        fontFamily: "'DM Serif Display', serif",
      }}>
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={30}
        value={currentDay}
        onChange={e => onChange(e.target.value)}
        aria-label="Simulate day"
        style={{ flex: 1 }}
      />
    </div>
  )
}
