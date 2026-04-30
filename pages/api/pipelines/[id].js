import dbConnect from '../../../lib/db'
import { Pipeline } from '../../../lib/models'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  let user
  try { user = requireAuth(req) }
  catch (e) { return res.status(401).json({ error: e.message }) }

  const { id } = req.query
  await dbConnect()

  const pipeline = await Pipeline.findOne({ _id: id, userId: user.userId })
  if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' })

  // PUT /api/pipelines/[id] - save/update pipeline
  if (req.method === 'PUT') {
    const { name, nodes, connections } = req.body
    pipeline.name        = name        ?? pipeline.name
    pipeline.nodes       = nodes       ?? pipeline.nodes
    pipeline.connections = connections ?? pipeline.connections
    pipeline.updatedAt   = new Date()
    await pipeline.save()
    return res.status(200).json({ pipeline })
  }

  // DELETE /api/pipelines/[id]
  if (req.method === 'DELETE') {
    await pipeline.deleteOne()
    return res.status(200).json({ message: 'Deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
