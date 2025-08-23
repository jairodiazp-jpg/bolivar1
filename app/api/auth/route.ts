import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = "your-secret-key-here"

// Simulación de base de datos de usuarios
const users = [
  {
    id: 1,
    email: "admin@medischedule.com",
    password: "admin123",
    type: "admin",
    name: "Administrador Sistema",
  },
  {
    id: 2,
    email: "empresa1@medischedule.com",
    password: "empresa123",
    type: "empresa1",
    name: "Clínica San Rafael",
  },
  {
    id: 3,
    email: "empresa2@medischedule.com",
    password: "empresa123",
    type: "empresa2",
    name: "Centro Médico Norte",
  },
  {
    id: 4,
    email: "empresa3@medischedule.com",
    password: "empresa123",
    type: "empresa3",
    name: "Hospital Central",
  },
  {
    id: 5,
    email: "doctor@medischedule.com",
    password: "doctor123",
    type: "profesional",
    name: "Dr. Carlos Mendoza",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    // Validar credenciales
    const user = users.find((u) => u.email === email && u.password === password && u.type === userType)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: user.type,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        type: user.type,
        name: user.name,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Middleware para verificar JWT
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
