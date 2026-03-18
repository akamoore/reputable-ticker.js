import { useState } from 'react'

const FORMATS = [
  { value: 'short-form video (Reels/TikTok/Shorts)', label: 'Short-form (Reels / TikTok)' },
  { value: 'YouTube explainer', label: 'YouTube explainer' },
  { value: 'Instagram carousel narration', label: 'Carousel narration' },
  { value: 'LinkedIn video', label: 'LinkedIn video' },
  { value: 'podcast intro', label: 'Podcast intro' },
]

const DURATIONS = [
  { value: '30 seconds', label: '30s' },
  { value: '60 seconds', label: '60s' },
  { value: '90 seconds', label: '90s' },
  { value: '2 minutes', label: '2 min' },
  { value: '5 minutes', label: '5 min' },
]

const TONES = [
  'Approachable and evidence-based',
  'Bold and provocative',
  'Calm and educational',
  'Energetic and motivational',
  'Professional and data-driven',
]

export default function App() {
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState(FORMATS[0].value)
  const [duration, setDuration] = useState(DURATIONS[1].value)
  const [audience, setAudience] = useState('health-conscious consumers')
  const [tone, setTone] = useState(TONES[0])
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate(e) {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, duration, audience, tone, notes }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }

      const data = await res.json()
      setResult(data.script)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyScript() {
    if (!result?.sections) return
    const text = result.sections
      .map((s) => `[${s.label}] (${s.duration_seconds}s)\nVisual: ${s.visual}\n${s.voiceover}`)
      .join('\n\n')
    const full = `${result.title}\n\nHook: ${result.hook}\n\n${text}\n\nCTA: ${result.cta}`
    navigator.clipboard.writeText(full)
  }

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.dot} />
          <span style={styles.label}>REPUTABLE HEALTH</span>
          <div style={styles.divider} />
          <h1 style={styles.h1}>Script generator</h1>
          <p style={styles.subtitle}>
            AI-powered video scripts for evidence-based wellness content.
          </p>
        </header>

        <form onSubmit={handleGenerate} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Topic *</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. How wearable data proves supplement efficacy"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.fieldLabel}>Format</label>
              <select style={styles.select} value={format} onChange={(e) => setFormat(e.target.value)}>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.fieldLabel}>Duration</label>
              <select style={styles.select} value={duration} onChange={(e) => setDuration(e.target.value)}>
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.fieldLabel}>Audience</label>
              <input
                style={styles.input}
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.fieldLabel}>Tone</label>
              <select style={styles.select} value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Additional notes</label>
            <textarea
              style={{ ...styles.input, minHeight: 72, resize: 'vertical' }}
              placeholder="Optional — specific product, study, or angle to include"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" style={styles.btn} disabled={loading || !topic.trim()}>
            {loading ? 'Generating...' : 'Generate script'}
          </button>
        </form>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {result && result.sections && (
          <div style={styles.result}>
            <div style={styles.resultHeader}>
              <h2 style={styles.h2}>{result.title}</h2>
              <button onClick={copyScript} style={styles.copyBtn}>Copy</button>
            </div>

            <div style={styles.hookCard}>
              <span style={styles.hookLabel}>HOOK</span>
              <p style={styles.hookText}>{result.hook}</p>
            </div>

            <div style={styles.sections}>
              {result.sections.map((section, i) => (
                <div key={i} style={styles.sectionCard}>
                  <div style={styles.sectionTop}>
                    <span style={styles.sectionLabel}>{section.label}</span>
                    <span style={styles.sectionDuration}>{section.duration_seconds}s</span>
                  </div>
                  <p style={styles.visual}>{section.visual}</p>
                  <p style={styles.voiceover}>{section.voiceover}</p>
                </div>
              ))}
            </div>

            <div style={styles.ctaCard}>
              <span style={styles.hookLabel}>CTA</span>
              <p style={styles.hookText}>{result.cta}</p>
            </div>

            <div style={styles.meta}>
              <span style={styles.metaChip}>
                {result.total_duration_seconds}s total
              </span>
              {result.hashtags?.map((tag) => (
                <span key={tag} style={styles.hashChip}>#{tag}</span>
              ))}
            </div>

            {result.platform_notes && (
              <div style={styles.platformNotes}>
                <span style={styles.hookLabel}>PLATFORM NOTES</span>
                <p style={styles.muted}>{result.platform_notes}</p>
              </div>
            )}
          </div>
        )}

        {result && result.raw && (
          <div style={styles.result}>
            <h2 style={styles.h2}>Generated script</h2>
            <pre style={styles.raw}>{result.raw}</pre>
          </div>
        )}

        <footer style={styles.footer}>
          reputable.health
        </footer>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '52px 52px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 720,
    margin: '0 auto',
    padding: 'clamp(1rem, 5vw, 2rem)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#c8e64a',
    boxShadow: '0 0 10px rgba(200,230,74,0.5)',
    margin: '0 auto 12px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#c8e64a',
    textTransform: 'uppercase',
  },
  divider: {
    width: 40,
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '18px auto',
  },
  h1: {
    fontSize: 'clamp(2rem, 6vw, 3rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#999',
    fontSize: '1rem',
    margin: 0,
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 32,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fieldLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  input: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  btn: {
    background: '#c8e64a',
    color: '#222220',
    border: 'none',
    borderRadius: 100,
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'all 0.2s ease',
  },
  error: {
    background: 'rgba(251,113,133,0.1)',
    border: '1px solid rgba(251,113,133,0.3)',
    borderRadius: 12,
    padding: '14px 18px',
    color: '#fb7185',
    fontSize: '0.9rem',
    marginBottom: 24,
  },
  result: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '28px 24px',
    marginBottom: 24,
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  h2: {
    fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
    fontWeight: 600,
    lineHeight: 1.2,
    margin: 0,
  },
  copyBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 100,
    padding: '6px 16px',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  hookCard: {
    background: 'linear-gradient(135deg, rgba(217,255,133,0.08) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(217,255,133,0.3)',
    borderRadius: 12,
    padding: '16px 18px',
    marginBottom: 20,
  },
  hookLabel: {
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.18em',
    color: '#c8e64a',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  },
  hookText: {
    color: '#fff',
    fontSize: '1rem',
    lineHeight: 1.5,
    margin: 0,
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  sectionCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '16px 18px',
  },
  sectionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: '#c8e64a',
    textTransform: 'uppercase',
  },
  sectionDuration: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#999',
  },
  visual: {
    fontSize: '0.85rem',
    color: '#74b9ff',
    fontStyle: 'italic',
    margin: '0 0 8px',
    lineHeight: 1.5,
  },
  voiceover: {
    color: '#f0f0f0',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    margin: 0,
  },
  ctaCard: {
    background: 'linear-gradient(135deg, rgba(217,255,133,0.08) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(217,255,133,0.3)',
    borderRadius: 12,
    padding: '16px 18px',
    marginBottom: 20,
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  metaChip: {
    background: 'rgba(200,230,74,0.1)',
    border: '1px solid rgba(200,230,74,0.3)',
    borderRadius: 100,
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#c8e64a',
  },
  hashChip: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 100,
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#999',
  },
  platformNotes: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: '16px 18px',
    borderLeft: '2px solid rgba(200,230,74,0.3)',
  },
  muted: {
    color: '#999',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    margin: 0,
  },
  raw: {
    color: '#999',
    fontSize: '0.85rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '40px 0',
  },
}
