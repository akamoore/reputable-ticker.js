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
  'Credible and warm — calm authority, real talk',
  'Sharp and contrarian — challenge lazy assumptions',
  'Clear and educational — make the audience smarter',
  'Founder POV — insight-led, first-person commentary',
  'Strategic and direct — outcome-oriented, no fluff',
]

const TOPIC_PRESETS = [
  {
    label: 'Myth vs reality',
    topic: 'Why most wellness brands struggle to prove their claims — and what actually works',
    audience: 'DTC brand founders and marketing leads',
    tone: 'Sharp and contrarian — challenge lazy assumptions',
  },
  {
    label: 'Proof problem',
    topic: 'Most brands don\'t have a product problem — they have a proof problem',
    audience: 'DTC brand founders and marketing leads',
    tone: 'Founder POV — insight-led, first-person commentary',
  },
  {
    label: 'Wearable data',
    topic: 'How wearable data from Oura, Apple Watch, and Whoop creates verified evidence that brands can actually use',
    audience: 'DTC brand founders',
    tone: 'Clear and educational — make the audience smarter',
  },
  {
    label: 'What brands get wrong',
    topic: 'Three mistakes wellness brands make when trying to validate a product claim',
    audience: 'DTC brand founders and marketing leads',
    tone: 'Sharp and contrarian — challenge lazy assumptions',
  },
  {
    label: 'What the data shows',
    topic: 'Breaking down real aggregate results from a completed Reputable wellness study',
    audience: 'health-conscious consumers and brand operators',
    tone: 'Credible and warm — calm authority, real talk',
  },
  {
    label: 'Participant experience',
    topic: 'What it actually looks like to join a Reputable study — the real experience, not just the sign-up',
    audience: 'health-conscious consumers aged 25-45',
    tone: 'Credible and warm — calm authority, real talk',
  },
  {
    label: 'Sleep deep dive',
    topic: 'What happens to your sleep data when you follow a structured supplement protocol for 30 days',
    audience: 'biohackers and sleep optimizers',
    tone: 'Clear and educational — make the audience smarter',
  },
  {
    label: 'Black box problem',
    topic: 'If your research process is a black box, that is a problem — why transparency changes everything in wellness validation',
    audience: 'brand operators and wellness founders',
    tone: 'Founder POV — insight-led, first-person commentary',
  },
  {
    label: 'Claims need evidence',
    topic: 'The wellness market has changed — consumers are more skeptical and claims need to hold up',
    audience: 'e-commerce brand operators',
    tone: 'Strategic and direct — outcome-oriented, no fluff',
  },
  {
    label: 'Behind the protocol',
    topic: 'How Reputable designs study protocols — washout periods, compliance tracking, and why the details matter',
    audience: 'health-conscious consumers and potential sponsors',
    tone: 'Clear and educational — make the audience smarter',
  },
]

const SYSTEM_PROMPT = `You write video scripts for Reputable Health (reputable.health). Reputable connects research sponsors with health-conscious participants to run evidence-based wellness studies.

BRAND VOICE — "Trusted science, spoken like a real person."

Reputable sounds like the smart, credible partner in the room who can actually explain what's happening. You don't overpromise. You don't posture. You make health validation feel modern, real, and useful.

Voice traits:
- Credible, not clinical. Sound evidence-based without sounding academic or cold. The audience should feel "these people know what they're doing," not "I need a PhD to understand this."
- Clear, not jargon-heavy. Concise and outcome-oriented. People should get it in one scroll.
- Confident, not chest-thumping. Real authority, calm and self-assured, never aggressive.
- Human, not robotic. Unique, friendly, relatable. This should feel like a conversation, not a lecture.
- Strategic, not trendy-for-trendy's-sake. The audience is companies, decision-makers, and brands evaluating credibility.

In five words: Credible. Warm. Clear. Modern. Understated.

SCRIPT STRUCTURE — Use this 5-part rhythm:
1. Hook — Say the painful truth fast. Start with tension.
2. Problem — Name what brands or people are struggling with.
3. Reframe — Show why the old way is broken or incomplete.
4. Proof / perspective — Use one data point, example, or concrete observation.
5. Close — End with one sharp takeaway or CTA. Calm authority.

WRITING STYLE:
- Lead with the real problem. Sound like you've seen this before.
- Be specific. Make the audience feel smarter, not sold to.
- Use plain English. Short sentences. Direct observations.
- Never sound like a supplement ad or a generic SaaS company.
- No "game-changing," "revolutionary," "biohacking secret," or "you won't believe."
- More like: "Here's what brands miss." "This is where validation breaks down." "The problem isn't interest. It's evidence."

GOOD EXAMPLE LINES:
- "Trust is not a branding exercise. It's an evidence problem."
- "The wellness market has changed. Claims need to hold up."
- "If your research process is a black box, that's a problem."
- "You shouldn't have to wait until the end of a study to know what's happening."
- "Most brands don't have a product problem. They have a proof problem."

TERMINOLOGY:
- Say "participants" not "subjects" or "users"
- Say "studies" not "trials" (unless actual clinical trial)
- Say "sponsors" not "clients"
- Say "verified evidence" not "proof" (science supports — it doesn't prove)
- Say "aggregate results" not "individual results"

PLATFORM CONTEXT:
- LinkedIn is the primary channel — founder POV, industry observations, sharp opening lines.
- YouTube is the second pillar — explainers, founder commentary, deep dives.
- Instagram supports — carousels, study snapshots, light BTS moments.
- Short-form should feel like smart takes and sharp observations, not influencer content pretending to be science.

The goal is never "go viral at any cost." The goal is: make the right people immediately trust you.`

function getStoredKey() {
  const stored = localStorage.getItem('anthropic_key')
  if (stored) return stored
  return import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

export default function App() {
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState(FORMATS[0].value)
  const [duration, setDuration] = useState(DURATIONS[1].value)
  const [audience, setAudience] = useState('health-conscious consumers')
  const [tone, setTone] = useState(TONES[0]) // 'Credible and warm'
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(getStoredKey)

  function saveKey() {
    localStorage.setItem('anthropic_key', apiKeyInput)
    setShowSettings(false)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!topic.trim()) return

    const apiKey = apiKeyInput
    if (!apiKey) {
      setError('No API key set. Click the settings button to add your Anthropic API key.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const userPrompt = `Write a ${format} video script about: ${topic}

Target duration: ${duration}
Target audience: ${audience}
Tone: ${tone}
${notes ? `Additional notes: ${notes}` : ''}

Return the script as a JSON object with these keys:
- "title": a short, punchy title (8 words or fewer, sentence case)
- "hook": the opening hook line (first 3 seconds — must stop the scroll)
- "sections": an array of script sections, each with:
  - "label": section name (e.g. "Hook", "Problem", "Solution", "Evidence", "CTA")
  - "visual": brief visual direction for this section
  - "voiceover": the exact spoken words
  - "duration_seconds": estimated seconds for this section
- "cta": the closing call-to-action line
- "total_duration_seconds": total estimated duration
- "hashtags": array of 5-8 relevant hashtags (without # prefix)
- "platform_notes": brief tips for adapting this script across platforms (Instagram Reels, TikTok, YouTube Shorts, LinkedIn)

Return ONLY valid JSON, no markdown fences or extra text.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        if (response.status === 429) {
          throw new Error('Rate limit reached — please wait about a minute and try again.')
        }
        throw new Error(errData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      const textBlocks = data.content.filter((b) => b.type === 'text')
      if (!textBlocks.length) throw new Error('No text response received from API')

      let jsonText = textBlocks.map((b) => b.text).join('\n').trim()
      // Strip markdown code fences if present
      jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

      let script
      try {
        script = JSON.parse(jsonText)
      } catch {
        script = { raw: jsonText }
      }
      setResult(script)
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
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={styles.settingsBtn}
            title="API key settings"
          >
            {apiKeyInput ? 'Key set' : 'Set API key'}
          </button>
          <div style={styles.divider} />
          <h1 style={styles.h1}>Script generator</h1>
          <p style={styles.subtitle}>
            AI-powered video scripts for evidence-based wellness content.
          </p>
        </header>

        {showSettings && (
          <div style={styles.settingsPanel}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Anthropic API key</label>
              <input
                style={styles.input}
                type="password"
                placeholder="sk-ant-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
            <button onClick={saveKey} style={{ ...styles.btn, marginTop: 8, padding: '10px 24px', fontSize: '0.85rem' }}>
              Save
            </button>
          </div>
        )}

        <form onSubmit={handleGenerate} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Quick prompts</label>
            <div style={styles.presetGrid}>
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setTopic(preset.topic)
                    setAudience(preset.audience)
                    setTone(preset.tone)
                  }}
                  style={{
                    ...styles.presetChip,
                    ...(topic === preset.topic ? styles.presetChipActive : {}),
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

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
  settingsBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 100,
    padding: '4px 14px',
    color: '#999',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 12,
    verticalAlign: 'middle',
  },
  settingsPanel: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '20px',
    marginBottom: 24,
  },
  presetGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 100,
    padding: '6px 14px',
    color: '#a0a0a0',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  presetChipActive: {
    background: 'rgba(200,230,74,0.1)',
    borderColor: 'rgba(200,230,74,0.3)',
    color: '#c8e64a',
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
