import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const companyId = searchParams.get("companyId")

    // Mock report generation
    const reportData = {
      type,
      startDate,
      endDate,
      companyId,
      generatedAt: new Date().toISOString(),
      data: [],
    }

    switch (type) {
      case "appointments":
        reportData.data = [
          {
            id: 1,
            patientName: "Juan Pérez",
            professionalName: "Dr. Carlos Mendoza",
            date: "2024-01-15",
            time: "09:00",
            status: "confirmed",
          },
          {
            id: 2,
            patientName: "María García",
            professionalName: "Dra. Ana López",
            date: "2024-01-15",
            time: "10:30",
            status: "completed",
          },
        ]
        break

      case "professionals":
        reportData.data = [
          {
            id: 1,
            name: "Dr. Carlos Mendoza",
            specialty: "Cardiología",
            totalAppointments: 45,
            rating: 4.8,
            status: "active",
          },
          {
            id: 2,
            name: "Dra. Ana López",
            specialty: "Pediatría",
            totalAppointments: 38,
            rating: 4.9,
            status: "active",
          },
        ]
        break

      case "metrics":
        reportData.data = {
          totalAppointments: 6140,
          completedAppointments: 5890,
          cancelledAppointments: 205,
          pendingAppointments: 45,
          averageRating: 4.8,
          occupancyRate: 87,
          revenue: 485000,
        }
        break

      case "financial":
        reportData.data = {
          totalRevenue: 485000,
          totalExpenses: 320000,
          netProfit: 165000,
          profitMargin: 34,
          revenueBySpecialty: [
            { specialty: "Cardiología", revenue: 125000 },
            { specialty: "Pediatría", revenue: 98000 },
            { specialty: "Neurología", revenue: 87000 },
          ],
        }
        break

      default:
        return NextResponse.json({ success: false, error: "Tipo de reporte no válido" }, { status: 400 })
    }

    // In a real application, you would generate a PDF here
    // For now, we'll return the data as JSON
    return NextResponse.json({
      success: true,
      data: reportData,
      message: "Reporte generado exitosamente",
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
