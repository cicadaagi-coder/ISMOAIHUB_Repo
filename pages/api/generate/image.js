import dbConnect from '../../../lib/db'
import { Asset } from '../../../lib/models'
import { requireAuth } from '../../../lib/auth'
import { generateImage, generateAngles } from '../../../lib/atlascloud'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let user
  try { user = requireAuth(req) }
  catch (e) { return res.status(401).json({ error: e.message }) }

  const { prompt, negativePrompt, style, angles, pipelineId, nodeId } = req.body

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

  try {
    await dbConnect()

    let results

    if (angles && angles.length > 0) {
      // Multi-angle generation
      const images = await generateAngles({ basePrompt: prompt, angles, style })
      results = images

      // Save each image as an asset
      await Promise.all(images.map(img =>
        Asset.create({
          userId: user.userId,
          pipelineId,
          nodeId,
          type: 'image',
          url: img.url,
          prompt,
          model: 'seedance-2.0',
          metadata: { width: img.width, height: img.height, style },
        })
      ))
    } else {
      // Single image generation
      const image = await generateImage({ prompt, negativePrompt, style })
      results = [image]

      await Asset.create({
        userId: user.userId,
        pipelineId,
        nodeId,
        type: 'image',
        url: image.url,
        prompt,
        model: 'seedance-2.0',
        metadata: { width: image.width, height: image.height, style },
      })
    }

    return res.status(200).json({ images: results })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
