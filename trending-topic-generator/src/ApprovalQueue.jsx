import { useState, useEffect } from 'react'

const GITHUB_REPO = 'akamoore/reputable-ticker.js'
const QUEUE_PATH = 'trending-topic-generator/queue'

function ApprovalQueue({ onBack, bufferToken, githubToken }) {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedBatch, setExpandedBatch] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [editText, setEditText] = useState('')
  const [scheduling, setScheduling] = useState({})
  const [scheduledPosts, setScheduledPosts] = useState({})

  useEffect(() => {
    loadPendingBatches()
  }, [])

  const loadPendingBatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = {}
      if (githubToken) headers['Authorization'] = `token ${githubToken}`

      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${QUEUE_PATH}/pending`,
        { headers }
      )

      if (!response.ok) {
        if (response.status === 404) {
          setBatches([])
          return
        }
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const files = await response.json()
      const jsonFiles = files.filter(f => f.name.endsWith('.json'))

      const batchPromises = jsonFiles.map(async (file) => {
        const res = await fetch(file.download_url)
        const data = await res.json()
        data._filename = file.name
        data._sha = file.sha
        return data
      })

      const loaded = await Promise.all(batchPromises)
      loaded.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at))
      setBatches(loaded)

      if (loaded.length > 0) setExpandedBatch(loaded[0].id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (batchId, platform, index, currentText) => {
    setEditingPost({ batchId, platform, index })
    setEditText(currentText)
  }

  const saveEdit = (batchId, platform, index) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId) return batch
      const updated = { ...batch, platforms: { ...batch.platforms } }
      updated.platforms[platform] = [...updated.platforms[platform]]
      updated.platforms[platform][index] = {
        ...updated.platforms[platform][index],
        post_text: editText
      }
      return updated
    }))
    setEditingPost(null)
    setEditText('')
  }

  const removePost = (batchId, platform, index) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId) return batch
      const updated = { ...batch, platforms: { ...batch.platforms } }
      updated.platforms[platform] = updated.platforms[platform].filter((_, i) => i !== index)
      return updated
    }))
  }

  const scheduleToBuffer = async (post, platform, batchId, postIndex) => {
    if (!bufferToken) {
      setError('Add your Buffer access token in Settings to schedule posts')
      return
    }

    const key = `${batchId}-${platform}-${postIndex}`
    setScheduling(prev => ({ ...prev, [key]: true }))

    try {
      // Get Buffer profiles
      const profilesRes = await fetch('https://api.bufferapp.com/1/profiles.json', {
        headers: { 'Authorization': `Bearer ${bufferToken}` }
      })
      if (!profilesRes.ok) throw new Error('Failed to fetch Buffer profiles — check your access token')
      const profiles = await profilesRes.json()

      const serviceMap = { linkedin: 'linkedin', instagram: 'instagram' }
      const targetProfile = profiles.find(p => p.service === serviceMap[platform])
      if (!targetProfile) throw new Error(`No ${platform} profile found in Buffer. Connect it at buffer.com first.`)

      let text = post.post_text
      if (post.hashtags && post.hashtags.length > 0) {
        text += '\n\n' + post.hashtags.map(t => `#${t}`).join(' ')
      }

      const createRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bufferToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          text,
          'profile_ids[]': targetProfile.id,
          top: 'false' // Add to end of queue
        })
      })

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}))
        throw new Error(errData.message || `Buffer API error: ${createRes.status}`)
      }

      setScheduledPosts(prev => ({ ...prev, [key]: true }))
    } catch (err) {
      setError(err.message)
    } finally {
      setScheduling(prev => ({ ...prev, [key]: false }))
    }
  }

  const approveAll = async (batch) => {
    const platforms = Object.keys(batch.platforms)
    for (const platform of platforms) {
      for (let i = 0; i < batch.platforms[platform].length; i++) {
        const key = `${batch.id}-${platform}-${i}`
        if (!scheduledPosts[key]) {
          await scheduleToBuffer(batch.platforms[platform][i], platform, batch.id, i)
        }
      }
    }

    // Move batch to approved in GitHub
    if (githubToken) {
      try {
        await moveBatchToApproved(batch)
      } catch (err) {
        console.error('Failed to move batch to approved:', err)
      }
    }
  }

  const moveBatchToApproved = async (batch) => {
    const headers = {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    }

    // Create file in approved/
    const approvedContent = btoa(JSON.stringify({ ...batch, status: 'approved', approved_at: new Date().toISOString() }, null, 2))
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${QUEUE_PATH}/approved/${batch._filename}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Approve batch ${batch.id}`,
        content: approvedContent
      })
    })

    // Delete from pending/
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${QUEUE_PATH}/pending/${batch._filename}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message: `Remove approved batch ${batch.id} from pending`,
        sha: batch._sha
      })
    })

    setBatches(prev => prev.filter(b => b.id !== batch.id))
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  }

  const totalPendingPosts = batches.reduce((sum, b) => {
    return sum + Object.values(b.platforms).reduce((s, posts) => s + posts.length, 0)
  }, 0)

  return (
    <div className="queue-container">
      <div className="queue-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to generator
        </button>
        <h2>Approval queue</h2>
        <p className="queue-subtitle">
          {totalPendingPosts > 0
            ? `${totalPendingPosts} posts across ${batches.length} batch${batches.length !== 1 ? 'es' : ''} ready for review`
            : 'No pending posts — next batch generates automatically'}
        </p>
      </div>

      {error && (
        <div className="error-card">
          <p>{error}</p>
          <button className="dismiss-btn" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="queue-loading">
          <span className="spinner" />
          Loading pending batches...
        </div>
      )}

      {!loading && batches.length === 0 && (
        <div className="queue-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <h3>Queue is clear</h3>
          <p>New posts will appear here on the next scheduled run (Mon/Wed/Fri at 7 AM EST), or you can trigger one manually from GitHub Actions.</p>
          <button className="generate-btn" onClick={loadPendingBatches}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Refresh queue
          </button>
        </div>
      )}

      {batches.map(batch => (
        <div key={batch.id} className="batch-card">
          <div
            className="batch-header"
            onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
          >
            <div className="batch-info">
              <span className="batch-date">{formatDate(batch.generated_at)}</span>
              <span className="batch-id">Batch {batch.id}</span>
            </div>
            <div className="batch-stats">
              {Object.entries(batch.platforms).map(([platform, posts]) => (
                <span key={platform} className={`platform-count ${platform}`}>
                  {posts.length} {platform}
                </span>
              ))}
            </div>
            <svg
              className={`chevron ${expandedBatch === batch.id ? 'open' : ''}`}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {expandedBatch === batch.id && (
            <div className="batch-content">
              {Object.entries(batch.platforms).map(([platform, posts]) => (
                <div key={platform} className="platform-group">
                  <h4 className="platform-group-label">
                    <span className={`platform-dot ${platform}`} />
                    {platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                  </h4>

                  {posts.map((post, index) => {
                    const key = `${batch.id}-${platform}-${index}`
                    const isEditing = editingPost?.batchId === batch.id
                      && editingPost?.platform === platform
                      && editingPost?.index === index
                    const isScheduled = scheduledPosts[key]
                    const isScheduling = scheduling[key]

                    return (
                      <div key={index} className={`queue-post ${isScheduled ? 'scheduled' : ''}`}>
                        <div className="queue-post-header">
                          <span className="queue-post-trend">{post.trend}</span>
                          {isScheduled && <span className="scheduled-badge">Scheduled</span>}
                        </div>

                        {isEditing ? (
                          <div className="edit-area">
                            <textarea
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={8}
                            />
                            <div className="edit-actions">
                              <button className="save-edit-btn" onClick={() => saveEdit(batch.id, platform, index)}>
                                Save
                              </button>
                              <button className="cancel-edit-btn" onClick={() => setEditingPost(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="queue-post-text">{post.post_text}</p>
                        )}

                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="queue-hashtags">
                            {post.hashtags.map((tag, i) => (
                              <span key={i} className="queue-hashtag">#{tag}</span>
                            ))}
                          </div>
                        )}

                        {post.best_time && (
                          <span className="queue-time">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {post.best_time}
                          </span>
                        )}

                        {!isScheduled && (
                          <div className="queue-post-actions">
                            <button
                              className="queue-action-btn edit"
                              onClick={() => startEdit(batch.id, platform, index, post.post_text)}
                            >
                              Edit
                            </button>
                            <button
                              className="queue-action-btn schedule"
                              onClick={() => scheduleToBuffer(post, platform, batch.id, index)}
                              disabled={isScheduling}
                            >
                              {isScheduling ? 'Scheduling...' : 'Approve & schedule'}
                            </button>
                            <button
                              className="queue-action-btn remove"
                              onClick={() => removePost(batch.id, platform, index)}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              <div className="batch-actions">
                <button
                  className="approve-all-btn"
                  onClick={() => approveAll(batch)}
                  disabled={Object.values(scheduling).some(Boolean)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Approve & schedule all
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ApprovalQueue
