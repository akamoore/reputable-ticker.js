import Anthropic from '@anthropic-ai/sdk';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/generate', async (req, res) => {
  const { topic, format, duration, audience, tone, notes } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured. Copy .env.example to .env and add your key.',
    });
  }

  const formatLabel = format || 'short-form video';
  const durationLabel = duration || '60 seconds';
  const audienceLabel = audience || 'health-conscious consumers';
  const toneLabel = tone || 'approachable and evidence-based';

  const systemPrompt = `You are a video script writer for Reputable Health (reputable.health), a company that connects research sponsors with health-conscious participants to run evidence-based wellness studies.

Follow these voice guidelines:
- Approachable, not corporate. "Here's what we found" not "Data indicates."
- Evidence-based — always cite the study, the protocol, the data.
- Participant-first — center the human experience.
- Trustworthy — lead with transparency.
- Educational — explain complex science simply.

Terminology rules:
- Say "participants" not "subjects" or "users"
- Say "studies" not "trials" (unless actual clinical trial)
- Say "sponsors" not "clients"
- Say "verified evidence" not "proof"
- Say "aggregate results" not "individual results"

Write scripts that are punchy, clear, and built for the specified video format.`;

  const userPrompt = `Write a ${formatLabel} video script about: ${topic}

Target duration: ${durationLabel}
Target audience: ${audienceLabel}
Tone: ${toneLabel}
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

Return ONLY valid JSON, no markdown fences or extra text.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      system: systemPrompt,
    });

    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    let script;
    try {
      script = JSON.parse(text);
    } catch {
      script = { raw: text };
    }

    res.json({ script });
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.status(502).json({ error: 'Failed to generate script', detail: err.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Script generator API running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
  }
});
