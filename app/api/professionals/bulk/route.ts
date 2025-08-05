import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "empresa")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { professionals } = await request.json()

    if (!Array.isArray(professionals) || professionals.length === 0) {
      return NextResponse.json({ error: "Lista de profesionales requerida" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const results = {
      success: 0,
      errors: [] as any[],
      duplicates: 0,
    }

    for (let i = 0; i < professionals.length; i++) {
      const professional = professionals[i]

      try {
        // Validar campos requeridos
        if (!professional.name || !professional.email || !professional.specialty) {
          results.errors.push({
            row: i + 1,
            error: "Campos requeridos: name, email, specialty",
            data: professional,
          })
          continue
        }

        // Verificar duplicados
        const existing = await collection.findOne({ email: professional.email })
        if (existing) {
          results.duplicates++
          results.errors.push({
            row: i + 1,
            error: "Email ya existe",
            data: professional,
          })
          continue
        }

        // Crear profesional
        const newProfessional = {
          ...professional,
          companyId: user.role === "empresa" ? user.companyId : professional.companyId || 1,
          status: professional.status || "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.id,
        }

        await collection.insertOne(newProfessional)
        results.success++
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: "Error al procesar",
          data: professional,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        total: professionals.length,
        success: results.success,
        errors: results.errors.length,
        duplicates: results.duplicates,
        errorDetails: results.errors,
      },
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
