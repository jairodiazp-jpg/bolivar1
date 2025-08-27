import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { sendEmail, generateCredentialsEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || (user.type !== "admin" && user.type !== "empresa")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()
    const { professionals, companyId } = body

    if (!professionals || !Array.isArray(professionals)) {
      return NextResponse.json({ error: "Se requiere un array de profesionales" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")
    const results = []

    for (const prof of professionals) {
      try {
        const { name, specialty, email, phone, weeklyHours } = prof

        if (!name || !specialty || !email || !phone) {
          results.push({
            email,
            success: false,
            error: "Campos requeridos faltantes",
          })
          continue
        }

        // Check if email already exists
        const existingProfessional = await collection.findOne({ email })
        if (existingProfessional) {
          results.push({
            email,
            success: false,
            error: "Email ya existe",
          })
          continue
        }

        // Generate credentials
        const username = email.split("@")[0]
        const password = Math.random().toString(36).slice(-8)

        const professional = {
          name,
          specialty,
          email,
          phone,
          companyId: user.type === "empresa" ? user.companyId : companyId,
          weeklyHours: weeklyHours || 40,
          status: "active",
          rating: "5.0",
          totalHoursThisMonth: 0,
          credentials: {
            username,
            password,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = await collection.insertOne(professional)

        // Send credentials email (async, don't wait)
        sendEmail({
          to: email,
          subject: "Credenciales de Acceso - MediSchedule",
          html: generateCredentialsEmailHTML({
            name,
            specialty,
            companyName: "Hospital",
            credentials: { username, password },
          }),
        }).catch((error) => {
          console.error(`Error sending email to ${email}:`, error)
        })

        results.push({
          email,
          success: true,
          id: result.insertedId,
        })
      } catch (error) {
        results.push({
          email: prof.email,
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: professionals.length,
        success: successCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
