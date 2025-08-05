import { type NextRequest, NextResponse } from "next/server"
import { generateToken, comparePassword } from "@/lib/auth"

export const runtime = "nodejs"

// Mock users for demo - replace with real database
const mockUsers = [
  {
    id: 1,
    email: "admin@medischedule.com",
    password: "YWRtaW4xMjN5b3VyLXN1cGVyLXNlY3JldC1qd3Qta2V5LWNoYW5nZS1pbi1wcm9kdWN0aW9u", // admin123
    name: "Administrador",
    type: "admin" as const,
  },
  {
    id: 2,
    email: "empresa1@segurosbolivar.com",
    password: "ZW1wcmVzYTEyM3lvdXItc3VwZXItc2VjcmV0LWp3dC1rZXktY2hhbmdlLWluLXByb2R1Y3Rpb24=", // empresa123
    name: "Seguros Bolívar",
    type: "empresa1" as const,
    companyId: 1,
  },
  {
    id: 3,
    email: "doctor@medischedule.com",
    password: "ZG9jdG9yMTIzeW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==", // doctor123
    name: "Dr. Juan Pérez",
    type: "profesional" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Find user (in production, query from database)
    const user = mockUsers.find((u) => u.email === email)

    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: user.type,
      name: user.name,
      companyId: user.companyId,
    })

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  // Clear auth cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })

  return response
}
