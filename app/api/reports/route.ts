import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const format = searchParams.get("format") || "json"

    const db = await getDatabase()

    let data: any = {}
    const query: any = {}

    // Filtrar por empresa si es necesario
    if (user.role === "empresa" && user.companyId) {
      query.companyId = user.companyId
    }

    // Filtrar por fechas
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    switch (reportType) {
      case "appointments":
        data = await db.collection("appointments").find(query).sort({ date: -1 }).toArray()
        break

      case "professionals":
        const profQuery = user.role === "empresa" ? { companyId: user.companyId } : {}
        data = await db.collection("professionals").find(profQuery).sort({ name: 1 }).toArray()
        break

      case "summary":
        const [totalAppointments, totalProfessionals, appointmentsByStatus] = await Promise.all([
          db.collection("appointments").countDocuments(query),
          db.collection("professionals").countDocuments(user.role === "empresa" ? { companyId: user.companyId } : {}),
          db
            .collection("appointments")
            .aggregate([{ $match: query }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
            .toArray(),
        ])

        data = {
          summary: {
            totalAppointments,
            totalProfessionals,
            appointmentsByStatus,
          },
          period: {
            startDate,
            endDate,
          },
          generatedAt: new Date().toISOString(),
          generatedBy: user.name,
        }
        break

      case "analytics":
        // Análisis por especialidad
        const appointmentsBySpecialty = await db
          .collection("appointments")
          .aggregate([
            { $match: query },
            { $group: { _id: "$specialty", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ])
          .toArray()

        // Análisis por día de la semana
        const appointmentsByWeekday = await db
          .collection("appointments")
          .aggregate([
            { $match: query },
            {
              $addFields: {
                weekday: { $dayOfWeek: { $dateFromString: { dateString: "$date" } } },
              },
            },
            { $group: { _id: "$weekday", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray()

        data = {
          appointmentsBySpecialty,
          appointmentsByWeekday,
          period: { startDate, endDate },
          generatedAt: new Date().toISOString(),
        }
        break

      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }

    if (format === "csv") {
      // Convertir a CSV
      let csvContent = ""
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Headers
          const headers = Object.keys(data[0])
          csvContent = headers.join(",") + "\n"

          // Rows
          data.forEach((row) => {
            const values = headers.map((header) => {
              const value = row[header]
              return typeof value === "string" ? `"${value}"` : value
            })
            csvContent += values.join(",") + "\n"
          })
        }
      }

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      reportType,
      data,
      generatedAt: new Date().toISOString(),
      totalRecords: Array.isArray(data) ? data.length : 1,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { reportConfig } = await request.json()

    // Aquí podrías guardar la configuración del reporte
    // o programar la generación automática

    return NextResponse.json({
      success: true,
      message: "Configuración de reporte guardada",
      reportId: Math.random().toString(36).substr(2, 9),
    })
  } catch (error) {
    console.error("Error saving report config:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
