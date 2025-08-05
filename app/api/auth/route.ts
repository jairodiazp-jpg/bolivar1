import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === "login") {
      const user = authenticateUser(email, password)

      if (!user) {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
      }

      const token = generateToken(user)

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          companyId: user.companyId,
        },
      })

      // Establecer cookie HTTP-only
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 horas
      })

      return response
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true })
      response.cookies.delete("auth-token")
      return response
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Aquí podrías verificar el token y devolver info del usuario
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
