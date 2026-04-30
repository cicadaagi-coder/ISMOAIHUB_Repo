import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

// Middleware helper - call at top of any protected API route
export function requireAuth(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  const decoded = verifyToken(token)
  if (!decoded) throw new Error('Invalid or expired token')
  return decoded   // { userId, email, iat, exp }
}
