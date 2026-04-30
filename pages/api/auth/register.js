import bcrypt from 'bcryptjs'
import dbConnect from '../../lib/db'
import { User } from '../../lib/models'
import { signToken } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 8)  return res.status(400).json({ error: 'Password must be at least 8 characters' })

  try {
    await dbConnect()

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Account already exists with this email' })

    const hash = await bcrypt.hash(password, 12)
    const user = await User.create({ email, password: hash })

    const token = signToken({ userId: user._id.toString(), email: user.email })

    return res.status(201).json({ token, email: user.email })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
