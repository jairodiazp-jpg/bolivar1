import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface TokenPayload {
  userId: number
  email: string
  type: "admin" | "empresa1" | "empresa2" | "empresa3" | "profesional"
  name: string
  companyId?: number
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function hashPassword(password: string): string {
  // Simple hash for demo - use bcrypt in production
  return Buffer.from(password + JWT_SECRET).toString("base64")
}

export function comparePassword(password: string, hash: string): boolean {
  return Buffer.from(password + JWT_SECRET).toString("base64") === hash
}
