export default function Header() {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border)',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'var(--teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--bg)',
        }}>
          R
        </div>
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
        }}>
          Reputable
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--gold)',
          fontWeight: 500,
          background: 'var(--gold-dim)',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
        }}>
          ♥ 42
        </span>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          color: 'var(--muted)',
        }}>
          JD
        </div>
      </div>
    </header>
  )
}
