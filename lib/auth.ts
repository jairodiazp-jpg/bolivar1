import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface TokenPayload {
  userId: number
  email: string
  type: "admin" | "empresa" | "profesional"
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
  // In production, use bcrypt or similar
  return Buffer.from(password).toString("base64")
}

export function comparePassword(password: string, hash: string): boolean {
  // In production, use bcrypt or similar
  return Buffer.from(password).toString("base64") === hash
}
