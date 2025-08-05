import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"

// Mock user data - in production, this would come from a database
const mockUsers = [
  // Admin user
  {
    id: 1,
    email: "admin@medischedule.com",
    password: "admin123",
    name: "Administrador Sistema",
    type: "admin",
  },
  // Company users
  {
    id: 2,
    email: "admin@sanrafael.com",
    password: "sanrafael123",
    name: "Admin Hospital San Rafael",
    type: "empresa",
    companyId: 1,
  },
  {
    id: 3,
    email: "admin@clinicanorte.com",
    password: "clinicanorte123",
    name: "Admin Clínica Norte",
    type: "empresa",
    companyId: 2,
  },
]

// Generate professional users
for (let i = 1; i <= 1000; i++) {
  const companyId = i <= 500 ? 1 : 2
  const companyDomain = companyId === 1 ? "sanrafael" : "clinicanorte"

  mockUsers.push({
    id: i + 10,
    email: `doctor${i}@${companyDomain}.com`,
    password: "doctor123",
    name: `Dr. Profesional ${i}`,
    type: "profesional",
    companyId,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: user.type,
      name: user.name,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        companyId: user.companyId,
      },
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Auth endpoint working" })
}
