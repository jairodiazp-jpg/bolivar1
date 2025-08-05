import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development"

export interface User {
  id: string
  email: string
  role: "admin" | "empresa" | "profesional"
  name: string
  companyId?: number
}

export function generateToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    return null
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 horas
  })
}

export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
}

// Usuarios de prueba
export const testUsers: User[] = [
  {
    id: "1",
    email: "admin@medischedule.com",
    role: "admin",
    name: "Administrador Sistema",
  },
  {
    id: "2",
    email: "empresa1@segurosbolivar.com",
    role: "empresa",
    name: "Seguros Bolívar",
    companyId: 1,
  },
  {
    id: "3",
    email: "doctor@medischedule.com",
    role: "profesional",
    name: "Dr. Juan Pérez",
    companyId: 1,
  },
]

export function authenticateUser(email: string, password: string): User | null {
  // Validación simple para demo
  const validPasswords = ["admin123", "empresa123", "doctor123"]

  if (!validPasswords.includes(password)) {
    return null
  }

  return testUsers.find((user) => user.email === email) || null
}
