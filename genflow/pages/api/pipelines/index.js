import dbConnect from '../../../lib/db'
import { Pipeline } from '../../../lib/models'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  let user
  try { user = requireAuth(req) }
  catch (e) { return res.status(401).json({ error: e.message }) }

  await dbConnect()

  // GET /api/pipelines - list all pipelines for this user
  if (req.method === 'GET') {
    const pipelines = await Pipeline.find({ userId: user.userId })
      .sort({ updatedAt: -1 })
      .select('name nodes connections updatedAt createdAt')
    return res.status(200).json({ pipelines })
  }

  // POST /api/pipelines - create new pipeline
  if (req.method === 'POST') {
    const { name, nodes, connections } = req.body
    const pipeline = await Pipeline.create({
      userId: user.userId,
      name: name || 'Untitled Pipeline',
      nodes: nodes || [],
      connections: connections || [],
    })
    return res.status(201).json({ pipeline })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
