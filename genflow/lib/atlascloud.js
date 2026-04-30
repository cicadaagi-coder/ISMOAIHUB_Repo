// Atlas Cloud API wrapper
// All AI generation goes through Atlas Cloud so you only need one API key

const BASE_URL = process.env.ATLAS_CLOUD_BASE_URL || 'https://api.atlascloud.ai/v1'
const API_KEY  = process.env.ATLAS_CLOUD_API_KEY

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  }
}

// ── Image Generation (Seedance 2.0) ───────────────────────────────────────────
export async function generateImage({ prompt, negativePrompt = '', width = 1024, height = 1024, style = '' }) {
  const fullPrompt = style ? `${prompt}, ${style}` : prompt

  const res = await fetch(`${BASE_URL}/images/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'seedance-2.0',
      prompt: fullPrompt,
      negative_prompt: negativePrompt,
      width,
      height,
      num_images: 1,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Atlas Cloud image error: ${err}`)
  }

  const data = await res.json()
  // Returns: { images: [{ url: '...', width, height }] }
  return data.images[0]
}

// ── Multi-angle Image Generation (Seedance 2.0) ───────────────────────────────
export async function generateAngles({ basePrompt, angles, style = '' }) {
  // Runs one generation per angle in parallel
  const promises = angles.map(angle => generateImage({
    prompt: `${basePrompt}, ${angle}`,
    style,
  }))
  return Promise.all(promises)
}

// ── Video Generation (Kling 3.0) ──────────────────────────────────────────────
export async function generateVideo({ imageUrl, motionPrompt, duration = 5 }) {
  const res = await fetch(`${BASE_URL}/videos/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'kling-3.0',
      image_url: imageUrl,
      prompt: motionPrompt,
      duration,
      aspect_ratio: '16:9',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Atlas Cloud video error: ${err}`)
  }

  const data = await res.json()

  // Kling returns a job id - poll until complete
  if (data.status === 'queued' || data.status === 'processing') {
    return pollVideoJob(data.job_id)
  }

  return data
}

async function pollVideoJob(jobId, attempts = 0) {
  if (attempts > 30) throw new Error('Video generation timed out')

  await new Promise(r => setTimeout(r, 3000))  // wait 3s between polls

  const res = await fetch(`${BASE_URL}/videos/jobs/${jobId}`, {
    headers: headers(),
  })

  const data = await res.json()

  if (data.status === 'complete') return data
  if (data.status === 'failed')   throw new Error(`Video generation failed: ${data.error}`)

  return pollVideoJob(jobId, attempts + 1)
}
