import dbConnect from '../../../lib/db'
import { Asset } from '../../../lib/models'
import { requireAuth } from '../../../lib/auth'
import { generateVideo } from '../../../lib/atlascloud'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let user
  try { user = requireAuth(req) }
  catch (e) { return res.status(401).json({ error: e.message }) }

  const { imageUrl, motionPrompt, duration = 5, pipelineId, nodeId } = req.body

  if (!imageUrl)     return res.status(400).json({ error: 'imageUrl is required' })
  if (!motionPrompt) return res.status(400).json({ error: 'motionPrompt is required' })

  try {
    await dbConnect()

    const result = await generateVideo({ imageUrl, motionPrompt, duration })

    await Asset.create({
      userId: user.userId,
      pipelineId,
      nodeId,
      type: 'video',
      url: result.video_url,
      prompt: motionPrompt,
      model: 'kling-3.0',
      metadata: { duration, sourceImageUrl: imageUrl },
    })

    return res.status(200).json({ videoUrl: result.video_url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
