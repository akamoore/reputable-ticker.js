import { useState } from 'react'
import './App.css'

const PLATFORM_TONE = {
  linkedin: 'professional, data-driven thought leadership for DTC brand founders',
  instagram: 'approachable, educational content for health-conscious consumers'
}

const PLATFORM_PROMPT = (p) => {
  const isLi = p === 'linkedin'
  return {
    label: isLi ? 'LinkedIn' : 'Instagram',
    tone: PLATFORM_TONE[p],
    postLength: isLi
      ? '150-250 words, line breaks between paragraphs, DO NOT include hashtags in the post body'
      : '80-150 words, with emojis, DO NOT include hashtags in the post body',
    tagType: isLi ? 'LinkedIn company/person names' : 'Instagram handles',
    imageFormat: isLi
      ? 'LinkedIn image or graphic'
      : 'Instagram image, carousel, or Reel thumbnail',
    imageDims: isLi
      ? 'single image 1200x627, infographic, or chart'
      : 'square 1080x1080, carousel slides, or Reel'
  }
}

function buildPrompt(platformKey) {
  const p = PLATFORM_PROMPT(platformKey)
  return `Search for trending DTC health/wellness/supplement topics from the past 1-2 weeks. Then return exactly 4 ready-to-post ${p.label} drafts for Reputable Research (runs evidence-based wellness studies for brands). Tone: ${p.tone}.

Return ONLY a JSON array of 4 objects with keys:
- "trend": the trending topic (1 sentence)
- "post_text": the FULL post text ready to copy-paste (${p.postLength})
- "source_title": title of the article/source you found
- "source_url": URL of the source article
- "hashtags": array of 5-8 relevant trending hashtags (without # prefix)
- "suggested_tags": array of 2-4 ${p.tagType} to tag — real, relevant accounts (journalists, brands, thought leaders in the space) that could amplify reach
- "cta_type": one of "question", "poll", "hot_take", "share_request" — the engagement mechanic used in the post
- "best_time": suggested best day/time to post this for maximum engagement (e.g. "Tuesday 8-9am EST")
- "viral_strategy": a specific, actionable tip for how THIS particular post could go viral — reference a tactic (duet/stitch potential, controversial take, data that surprises, piggyback a news cycle, comment-bait structure, etc.) and explain WHY it would work for this topic (2-3 sentences)
- "image_direction": a detailed visual direction for the ${p.imageFormat} — describe the composition, colors, text overlay, format (${p.imageDims}), mood, and any specific elements to include. Be specific enough that a designer or AI image tool could produce it.`
}

function App() {
  const [platform, setPlatform] = useState('linkedin')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [viewPlatform, setViewPlatform] = useState('linkedin')
  const [generatingImages, setGeneratingImages] = useState({})

  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const googleKey = import.meta.env.VITE_GOOGLE_API_KEY
  const hasImageGen = googleKey && googleKey !== 'your-google-api-key-here'

  const callClaude = async (prompt) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      if (response.status === 429) {
        throw new Error('Rate limit reached — please wait about a minute and try again.')
      }
      throw new Error(errData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    const textBlock = data.content.find(block => block.type === 'text')
    if (!textBlock) throw new Error('No text response received from API')

    let jsonText = textBlock.text.trim()
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonText = jsonMatch[1].trim()
    return JSON.parse(jsonText)
  }

  const generateTopics = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    if (!anthropicKey || anthropicKey === 'your-api-key-here') {
      setError('Please set your Anthropic API key in the .env file (VITE_ANTHROPIC_API_KEY)')
      setLoading(false)
      return
    }

    try {
      if (platform === 'both') {
        const [liTopics, igTopics] = await Promise.all([
          callClaude(buildPrompt('linkedin')),
          callClaude(buildPrompt('instagram'))
        ])
        setResults({ linkedin: liTopics, instagram: igTopics })
        setViewPlatform('linkedin')
      } else {
        const topics = await callClaude(buildPrompt(platform))
        setResults({ [platform]: topics })
        setViewPlatform(platform)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateImage = async (imageDirection, topicIndex) => {
    if (!hasImageGen) return
    const key = `${viewPlatform}-${topicIndex}`
    setGeneratingImages(prev => ({ ...prev, [key]: { loading: true } }))

    try {
      const isIg = viewPlatform === 'instagram'
      const aspectRatio = isIg ? '1:1' : '16:9'
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4-fast:predict?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{
              prompt: `Professional social media graphic for a health/wellness brand. ${imageDirection}. Clean, modern design. No text overlays unless specified.`
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio
            }
          })
        }
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || `Image API error: ${response.status}`)
      }

      const data = await response.json()
      const imageBytes = data.predictions?.[0]?.bytesBase64Encoded
      if (!imageBytes) throw new Error('No image returned from API')

      const imageUrl = `data:image/png;base64,${imageBytes}`
      setGeneratingImages(prev => ({
        ...prev,
        [key]: { loading: false, url: imageUrl }
      }))
    } catch (err) {
      setGeneratingImages(prev => ({
        ...prev,
        [key]: { loading: false, error: err.message }
      }))
    }
  }

  const formatForMunch = (topic) => {
    let text = topic.post_text
    if (topic.hashtags && topic.hashtags.length > 0) {
      text += '\n\n' + topic.hashtags.map(t => `#${t}`).join(' ')
    }
    if (topic.suggested_tags && topic.suggested_tags.length > 0) {
      text += '\n\n' + topic.suggested_tags.join(' ')
    }
    return text
  }

  const exportAllForMunch = () => {
    if (!results) return
    const platforms = Object.keys(results)
    const blocks = []
    platforms.forEach(p => {
      if (platforms.length > 1) {
        blocks.push(`\n${'═'.repeat(20)} ${p.toUpperCase()} ${'═'.repeat(20)}\n`)
      }
      results[p].forEach((topic, i) => {
        const divider = `━━━ Post ${i + 1} of ${results[p].length} ━━━`
        let block = divider + '\n\n'
        block += topic.post_text
        if (topic.hashtags && topic.hashtags.length > 0) {
          block += '\n\n' + topic.hashtags.map(t => `#${t}`).join(' ')
        }
        if (topic.suggested_tags && topic.suggested_tags.length > 0) {
          block += '\n\n' + topic.suggested_tags.join(' ')
        }
        if (topic.best_time) {
          block += `\n\nBest time: ${topic.best_time}`
        }
        if (topic.image_direction) {
          block += `\n\nImage prompt: ${topic.image_direction}`
        }
        blocks.push(block)
      })
    })
    navigator.clipboard.writeText(blocks.join('\n\n\n'))
    setCopiedIndex(-1)
    setCopiedField('munch-all')
    setTimeout(() => { setCopiedIndex(null); setCopiedField(null) }, 2500)
  }

  const copyToClipboard = (text, index, field = 'post') => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setCopiedField(field)
    setTimeout(() => { setCopiedIndex(null); setCopiedField(null) }, 2000)
  }

  const availablePlatforms = results ? Object.keys(results) : []
  const currentTopics = results ? results[viewPlatform] || [] : []
  const isBothMode = results && availablePlatforms.length === 2
  const totalPosts = availablePlatforms.reduce((sum, p) => sum + (results?.[p]?.length || 0), 0)

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
            Find what's buzzing in DTC health and wellness — get ready-to-post ideas tailored to your platform.
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
            <button
              className={`toggle-btn ${platform === 'both' ? 'active' : ''}`}
              onClick={() => setPlatform('both')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              Both
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
                {platform === 'both' ? 'Generating for both platforms...' : 'Searching trends...'}
              </>
            ) : (
              platform === 'both' ? 'Generate for LinkedIn + Instagram' : 'Generate trending topics'
            )}
          </button>
        </div>

        {error && (
          <div className="error-card">
            <p>{error}</p>
          </div>
        )}

        {results && (
          <>
          <div className="export-bar">
            <button className="export-all-btn" onClick={exportAllForMunch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {copiedIndex === -1 && copiedField === 'munch-all'
                ? `Copied all ${totalPosts} posts!`
                : `Export all to Munch Studio`}
            </button>
            <span className="export-hint">
              Copies {isBothMode ? 'all 8 posts (both platforms)' : 'all posts'} with hashtags, tags, timing, and image prompts
            </span>
          </div>

          {isBothMode && (
            <div className="platform-tabs">
              <button
                className={`platform-tab ${viewPlatform === 'linkedin' ? 'active' : ''}`}
                onClick={() => setViewPlatform('linkedin')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn ({results.linkedin?.length || 0})
              </button>
              <button
                className={`platform-tab ${viewPlatform === 'instagram' ? 'active' : ''}`}
                onClick={() => setViewPlatform('instagram')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram ({results.instagram?.length || 0})
              </button>
            </div>
          )}

          <div className="results-grid">
            {currentTopics.map((topic, index) => {
              const imgKey = `${viewPlatform}-${index}`
              const imgState = generatingImages[imgKey]
              return (
              <div key={`${viewPlatform}-${index}`} className="topic-card">
                <div className="card-header-row">
                  <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
                  {isBothMode && (
                    <span className={`platform-badge ${viewPlatform}`}>
                      {viewPlatform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                    </span>
                  )}
                </div>

                <div className="card-section">
                  <span className="card-label">TREND</span>
                  <p className="card-trend">{topic.trend}</p>
                </div>

                <div className="card-section post-section">
                  <span className="card-label">FULL POST</span>
                  <p className="card-post">{topic.post_text}</p>
                  <div className="post-actions">
                    <button
                      className="copy-btn copy-btn-primary"
                      onClick={() => copyToClipboard(topic.post_text, index, 'post')}
                    >
                      {copiedIndex === index && copiedField === 'post' ? (
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
                          Copy post only
                        </>
                      )}
                    </button>
                    <button
                      className="copy-btn munch-btn"
                      onClick={() => copyToClipboard(formatForMunch(topic), index, 'munch')}
                    >
                      {copiedIndex === index && copiedField === 'munch' ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Copied for Munch
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                          </svg>
                          Copy for Munch
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="card-section engagement-section">
                  <span className="card-label">ENGAGEMENT TOOLKIT</span>

                  {topic.hashtags && topic.hashtags.length > 0 && (
                    <div className="engagement-row">
                      <span className="engagement-icon">#</span>
                      <div className="hashtag-list">
                        {topic.hashtags.map((tag, i) => (
                          <span key={i} className="hashtag-chip" onClick={() => copyToClipboard(`#${tag}`, index, `tag-${i}`)}>
                            #{tag}
                            {copiedIndex === index && copiedField === `tag-${i}` && <span className="chip-copied">Copied</span>}
                          </span>
                        ))}
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(topic.hashtags.map(t => `#${t}`).join(' '), index, 'hashtags')}
                      >
                        {copiedIndex === index && copiedField === 'hashtags' ? 'Copied' : 'Copy all'}
                      </button>
                    </div>
                  )}

                  {topic.suggested_tags && topic.suggested_tags.length > 0 && (
                    <div className="engagement-row">
                      <span className="engagement-icon">@</span>
                      <div className="tag-list">
                        {topic.suggested_tags.map((tag, i) => (
                          <span key={i} className="mention-chip" onClick={() => copyToClipboard(tag, index, `mention-${i}`)}>
                            {tag}
                            {copiedIndex === index && copiedField === `mention-${i}` && <span className="chip-copied">Copied</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="engagement-meta">
                    {topic.cta_type && (
                      <span className="meta-badge cta-badge">
                        {topic.cta_type === 'question' && 'Ask a question'}
                        {topic.cta_type === 'poll' && 'Run a poll'}
                        {topic.cta_type === 'hot_take' && 'Hot take'}
                        {topic.cta_type === 'share_request' && 'Share request'}
                      </span>
                    )}
                    {topic.best_time && (
                      <span className="meta-badge time-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {topic.best_time}
                      </span>
                    )}
                  </div>
                </div>

                {topic.viral_strategy && (
                  <div className="card-section viral-section">
                    <span className="card-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      VIRAL STRATEGY
                    </span>
                    <p className="card-body">{topic.viral_strategy}</p>
                  </div>
                )}

                {topic.image_direction && (
                  <div className="card-section image-section">
                    <span className="card-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      IMAGE DIRECTION
                    </span>
                    <p className="card-body">{topic.image_direction}</p>
                    <div className="image-actions">
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(topic.image_direction, index, 'image')}
                      >
                        {copiedIndex === index && copiedField === 'image' ? 'Copied' : 'Copy prompt'}
                      </button>
                      {hasImageGen && !imgState?.url && (
                        <button
                          className="copy-btn generate-img-btn"
                          onClick={() => generateImage(topic.image_direction, index)}
                          disabled={imgState?.loading}
                        >
                          {imgState?.loading ? (
                            <>
                              <span className="spinner-sm" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3v18M3 12h18" />
                              </svg>
                              Generate with Imagen
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {imgState?.error && (
                      <p className="img-error">{imgState.error}</p>
                    )}
                    {imgState?.url && (
                      <div className="generated-image">
                        <img src={imgState.url} alt="Generated post image" />
                        <div className="image-overlay-actions">
                          <a href={imgState.url} target="_blank" rel="noopener noreferrer" className="copy-btn">
                            Open full size
                          </a>
                          <button
                            className="copy-btn generate-img-btn"
                            onClick={() => generateImage(topic.image_direction, index)}
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {topic.source_url && (
                  <div className="card-section source-section">
                    <span className="card-label">SOURCE</span>
                    <a
                      href={topic.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      {topic.source_title || topic.source_url}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(topic.source_url, index, 'source')}
                    >
                      {copiedIndex === index && copiedField === 'source' ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                )}
              </div>
            )})}
          </div>
          </>
        )}

        {!hasImageGen && results && (
          <div className="api-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Add <code>VITE_GOOGLE_API_KEY</code> to your .env file to enable one-click image generation with Google Imagen (500 free images/day)
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
