import bcrypt from 'bcryptjs'
import dbConnect from '../../lib/db'
import { User } from '../../lib/models'
import { signToken } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    await dbConnect()

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken({ userId: user._id.toString(), email: user.email })

    return res.status(200).json({ token, email: user.email })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
