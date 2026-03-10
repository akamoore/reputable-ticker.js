import { useState } from 'react'
import './App.css'

const BRAND_CONTEXT = `Reputable Research Inc. runs real-world evidence studies for DTC health, wellness, and supplement brands. The product sits between research and marketing — it generates credible, evidence-backed claims brands can use. Key angles: low-cost research with zero risk, marketing asset backed by real evidence.`

const PLATFORM_CONTEXT = {
  linkedin: `Target audience: Marketing directors and brand founders at DTC supplement/wellness brands. Tone: professional, data-driven, strategic. Content style: thought leadership, industry insights, case-study teasers, provocative questions about evidence in marketing.`,
  instagram: `Target audience: Health-conscious consumers and potential study participants. Tone: approachable, educational, curiosity-driven. Content style: carousel-ready tips, myth-busting, behind-the-scenes of studies, wellness trends explained simply.`
}

function App() {
  const [platform, setPlatform] = useState('linkedin')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const generateTopics = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your-api-key-here') {
      setError('Please set your Anthropic API key in the .env file (VITE_ANTHROPIC_API_KEY)')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5
          }],
          messages: [{
            role: 'user',
            content: `You are a social media strategist for Reputable Research Inc.

${BRAND_CONTEXT}

Platform: ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
${PLATFORM_CONTEXT[platform]}

Search the web for the latest trending topics, news, and conversations in the DTC health, wellness, and supplement space (from the past 1-2 weeks). Look for regulatory changes, viral health claims, new ingredient trends, industry shifts, consumer behavior changes, or buzzy wellness topics.

Based on what you find, return exactly 4 post ideas. For each, provide:
1. **Trend**: The specific trending topic (1 sentence)
2. **Why it matters**: Why this is relevant to Reputable's audience (2-3 sentences)
3. **Post angle**: How to frame this as a ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} post for Reputable (1-2 sentences)
4. **Hook line**: The opening line of the post — punchy, scroll-stopping, ready to copy-paste

Format your response as a JSON array with 4 objects, each having keys: "trend", "why_it_matters", "post_angle", "hook_line". Return ONLY the JSON array, no other text.`
          }]
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()

      const textBlock = data.content.find(block => block.type === 'text')
      if (!textBlock) {
        throw new Error('No text response received from API')
      }

      let jsonText = textBlock.text.trim()
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }

      const topics = JSON.parse(jsonText)
      setResults(topics)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="container">
        <header className="header">
          <div className="brand-label">
            <span className="status-dot" />
            <span className="label-text">REPUTABLE RESEARCH</span>
          </div>
          <h1>Trending topic generator</h1>
          <p className="subtitle">
            Find what's buzzing in DTC health and wellness — get 4 ready-to-post ideas tailored to your platform.
          </p>
        </header>

        <div className="controls">
          <div className="toggle-group">
            <button
              className={`toggle-btn ${platform === 'linkedin' ? 'active' : ''}`}
              onClick={() => setPlatform('linkedin')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
            <button
              className={`toggle-btn ${platform === 'instagram' ? 'active' : ''}`}
              onClick={() => setPlatform('instagram')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Instagram
            </button>
          </div>

          <button
            className="generate-btn"
            onClick={generateTopics}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Searching trends...
              </>
            ) : (
              'Generate trending topics'
            )}
          </button>
        </div>

        {error && (
          <div className="error-card">
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="results-grid">
            {results.map((topic, index) => (
              <div key={index} className="topic-card">
                <div className="card-number">{String(index + 1).padStart(2, '0')}</div>

                <div className="card-section">
                  <span className="card-label">TREND</span>
                  <p className="card-trend">{topic.trend}</p>
                </div>

                <div className="card-section">
                  <span className="card-label">WHY IT MATTERS</span>
                  <p className="card-body">{topic.why_it_matters}</p>
                </div>

                <div className="card-section">
                  <span className="card-label">POST ANGLE</span>
                  <p className="card-body">{topic.post_angle}</p>
                </div>

                <div className="card-section hook-section">
                  <span className="card-label">HOOK LINE</span>
                  <p className="card-hook">{topic.hook_line}</p>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(topic.hook_line, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        Copy hook
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="footer">
          <span>reputable.health</span>
        </footer>
      </div>
    </div>
  )
}

export default App
