import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || (user.type !== "admin" && !user.type.startsWith("empresa"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()
    const { professionals } = body

    if (!Array.isArray(professionals) || professionals.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de profesionales" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const results = {
      success: 0,
      errors: [] as any[],
      total: professionals.length,
    }

    for (let i = 0; i < professionals.length; i++) {
      const prof = professionals[i]

      try {
        // Validate required fields
        if (!prof.name || !prof.specialty || !prof.email) {
          results.errors.push({
            row: i + 1,
            error: "Nombre, especialidad y email son requeridos",
            data: prof,
          })
          continue
        }

        // Check if already exists
        const existing = await collection.findOne({ email: prof.email })
        if (existing) {
          results.errors.push({
            row: i + 1,
            error: "Email ya existe",
            data: prof,
          })
          continue
        }

        const professional = {
          name: prof.name,
          specialty: prof.specialty,
          email: prof.email,
          phone: prof.phone || "",
          schedule: prof.schedule || {
            monday: { start: "09:00", end: "17:00", available: true },
            tuesday: { start: "09:00", end: "17:00", available: true },
            wednesday: { start: "09:00", end: "17:00", available: true },
            thursday: { start: "09:00", end: "17:00", available: true },
            friday: { start: "09:00", end: "17:00", available: true },
            saturday: { start: "09:00", end: "13:00", available: false },
            sunday: { start: "09:00", end: "13:00", available: false },
          },
          companyId: user.type.startsWith("empresa")
            ? user.companyId
            : prof.companyId
              ? Number.parseInt(prof.companyId)
              : 1,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await collection.insertOne(professional)
        results.success++
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Error desconocido",
          data: prof,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
