// JWT auth helpers - use with real secret in production
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export interface JwtPayload {
  userId: string
  email: string
  role: string
  farmId?: string
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const jwt = await import("jsonwebtoken")
  return jwt.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const jwt = await import("jsonwebtoken")
    const decoded = jwt.default.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch {
    return null
  }
}
