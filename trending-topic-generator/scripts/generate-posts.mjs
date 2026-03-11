#!/usr/bin/env node
/**
 * Automated post generation script — runs via GitHub Actions on a cron schedule.
 * Generates trending DTC health/wellness posts for LinkedIn and Instagram,
 * then saves them as JSON files in the queue/pending/ directory.
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const QUEUE_DIR = join(__dirname, '..', 'queue', 'pending')

const PLATFORM_PROMPT = (platformKey) => {
  const isLi = platformKey === 'linkedin'
  const label = isLi ? 'LinkedIn' : 'Instagram'
  const tone = isLi
    ? 'professional, data-driven thought leadership for DTC brand founders'
    : 'approachable, educational content for health-conscious consumers'
  const postLength = isLi
    ? '150-250 words, line breaks between paragraphs, DO NOT include hashtags in the post body'
    : '80-150 words, with emojis, DO NOT include hashtags in the post body'
  const tagType = isLi ? 'LinkedIn company/person names' : 'Instagram handles'
  const imageFormat = isLi ? 'LinkedIn image or graphic' : 'Instagram image, carousel, or Reel thumbnail'
  const imageDims = isLi
    ? 'single image 1200x627, infographic, or chart'
    : 'square 1080x1080, carousel slides, or Reel'

  return `Search for trending DTC health/wellness/supplement topics from the past 1-2 weeks. Then return exactly 4 ready-to-post ${label} drafts for Reputable Research (runs evidence-based wellness studies for brands). Tone: ${tone}.

Return ONLY a JSON array of 4 objects with keys:
- "trend": the trending topic (1 sentence)
- "post_text": the FULL post text ready to copy-paste (${postLength})
- "source_title": title of the article/source you found
- "source_url": URL of the source article
- "hashtags": array of 5-8 relevant trending hashtags (without # prefix)
- "suggested_tags": array of 2-4 ${tagType} to tag — real, relevant accounts (journalists, brands, thought leaders in the space) that could amplify reach
- "cta_type": one of "question", "poll", "hot_take", "share_request" — the engagement mechanic used in the post
- "best_time": suggested best day/time to post this for maximum engagement (e.g. "Tuesday 8-9am EST")
- "viral_strategy": a specific, actionable tip for how THIS particular post could go viral — reference a tactic (duet/stitch potential, controversial take, data that surprises, piggyback a news cycle, comment-bait structure, etc.) and explain WHY it would work for this topic (2-3 sentences)
- "image_direction": a detailed visual direction for the ${imageFormat} — describe the composition, colors, text overlay, format (${imageDims}), mood, and any specific elements to include. Be specific enough that a designer or AI image tool could produce it.`
}

async function generateForPlatform(client, platformKey) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
    messages: [{ role: 'user', content: PLATFORM_PROMPT(platformKey) }]
  })

  const textBlock = response.content.find(block => block.type === 'text')
  if (!textBlock) throw new Error(`No text response for ${platformKey}`)

  let jsonText = textBlock.text.trim()
  // Strip markdown code fences if present
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) jsonText = fenceMatch[1].trim()
  // If response still has preamble text, extract the JSON array
  if (!jsonText.startsWith('[')) {
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/)
    if (arrayMatch) jsonText = arrayMatch[0]
  }
  return JSON.parse(jsonText)
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })
  const timestamp = new Date().toISOString().split('T')[0]
  const batchId = `${timestamp}-${Date.now().toString(36)}`

  mkdirSync(QUEUE_DIR, { recursive: true })

  console.log(`Generating posts for batch: ${batchId}`)

  try {
    const [linkedinPosts, instagramPosts] = await Promise.all([
      generateForPlatform(client, 'linkedin'),
      generateForPlatform(client, 'instagram')
    ])

    const batch = {
      id: batchId,
      generated_at: new Date().toISOString(),
      status: 'pending',
      platforms: {
        linkedin: linkedinPosts,
        instagram: instagramPosts
      }
    }

    const filename = `${batchId}.json`
    const filepath = join(QUEUE_DIR, filename)
    writeFileSync(filepath, JSON.stringify(batch, null, 2))
    console.log(`Saved batch to ${filepath}`)
    console.log(`LinkedIn: ${linkedinPosts.length} posts, Instagram: ${instagramPosts.length} posts`)
  } catch (err) {
    console.error('Generation failed:', err.message)
    process.exit(1)
  }
}

main()
