import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("userType")
    const companyId = searchParams.get("companyId")

    // Mock statistics based on user type
    let stats = {}

    if (userType === "admin") {
      stats = {
        totalEmpresas: 2,
        totalProfesionales: 1000,
        citasHoy: 247,
        citasMes: 6140,
        ingresosMes: 485000,
        profesionalesActivos: 920,
        citasPendientes: 45,
        citasCompletadas: 5890,
        citasCanceladas: 205,
        satisfaccionPromedio: 4.8,
        ocupacionPromedio: 87,
        crecimientoMensual: 12,
      }
    } else if (userType === "empresa") {
      const companyStats =
        companyId === "1"
          ? {
              profesionales: 500,
              citasHoy: 125,
              citasMes: 3250,
              ingresosMes: 245000,
              profesionalesActivos: 460,
            }
          : {
              profesionales: 500,
              citasHoy: 122,
              citasMes: 2890,
              ingresosMes: 240000,
              profesionalesActivos: 460,
            }

      stats = {
        ...companyStats,
        citasPendientes: 23,
        citasCompletadas: 3100,
        citasCanceladas: 127,
        satisfaccionPromedio: 4.7,
        ocupacionPromedio: 85,
        crecimientoMensual: 8,
      }
    } else if (userType === "profesional") {
      stats = {
        citasHoy: 8,
        citasSemana: 35,
        citasMes: 142,
        horasTrabajadasMes: 168,
        pacientesAtendidos: 134,
        calificacionPromedio: 4.9,
        citasPendientes: 12,
        citasCompletadas: 130,
        citasCanceladas: 8,
        ingresosMes: 8500,
        horasDisponibles: 40,
        proximaCita: "2024-01-15T09:00:00Z",
      }
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
