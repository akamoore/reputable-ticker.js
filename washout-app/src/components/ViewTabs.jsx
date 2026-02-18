const tabs = [
  { id: 'journey', label: 'Journey' },
  { id: 'daily', label: 'Daily Q' },
  { id: 'metrics', label: 'Metrics' },
]

export default function ViewTabs({ currentView, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      background: 'var(--surface)',
      borderRadius: '10px',
      padding: '3px',
      marginBottom: '1.5rem',
    }}>
      {tabs.map(tab => {
        const isActive = currentView === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              padding: '0.5rem 0',
              borderRadius: '8px',
              border: 'none',
              background: isActive ? 'var(--surface2)' : 'transparent',
              color: isActive ? 'var(--teal)' : 'var(--muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s var(--ease-refined)',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
