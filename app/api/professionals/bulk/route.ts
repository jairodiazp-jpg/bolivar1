import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { professionals } = body

    if (!professionals || !Array.isArray(professionals)) {
      return NextResponse.json({ success: false, error: "Datos de profesionales inválidos" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (let i = 0; i < professionals.length; i++) {
      const prof = professionals[i]

      try {
        // Validate required fields
        if (!prof.name || !prof.specialty || !prof.email || !prof.phone) {
          errors.push({
            row: i + 1,
            error: "Campos requeridos faltantes",
            data: prof,
          })
          continue
        }

        // Simulate creating professional
        const newProfessional = {
          id: Math.floor(Math.random() * 10000),
          name: prof.name,
          specialty: prof.specialty,
          email: prof.email,
          phone: prof.phone,
          companyId: prof.companyId || 1,
          status: prof.status || "active",
          weeklyHours: prof.weeklyHours || 40,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          totalHoursThisMonth: Math.floor(Math.random() * 80) + 120,
          createdAt: new Date().toISOString(),
        }

        results.push({
          success: true,
          data: newProfessional,
          row: i + 1,
        })

        // Simulate email sending delay
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        errors.push({
          row: i + 1,
          error: "Error procesando profesional",
          data: prof,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: professionals.length,
        successful: results.length,
        failed: errors.length,
      },
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
