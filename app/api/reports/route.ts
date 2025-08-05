import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import {
  generateAppointmentsReport,
  generateProfessionalsReport,
  generateFinancialReport,
  generateMetricsReport,
} from "@/lib/pdf-generator"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const companyId = searchParams.get("companyId")

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: "Report type is required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()

    switch (type) {
      case "appointments":
        return await generateAppointmentsReportAPI(db, startDate, endDate, companyId)

      case "professionals":
        return await generateProfessionalsReportAPI(db, companyId)

      case "financial":
        return await generateFinancialReportAPI(db, startDate, endDate, companyId)

      case "metrics":
        return await generateMetricsReportAPI(db, companyId)

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid report type. Available types: appointments, professionals, financial, metrics",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error generating report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function generateAppointmentsReportAPI(
  db: any,
  startDate?: string | null,
  endDate?: string | null,
  companyId?: string | null,
) {
  try {
    const query: any = {}

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    const appointments = await db.collection("appointments").find(query).toArray()

    const pdf = generateAppointmentsReport(
      appointments,
      startDate && endDate ? { start: startDate, end: endDate } : undefined,
    )

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-citas-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating appointments report:", error)
    throw error
  }
}

async function generateProfessionalsReportAPI(db: any, companyId?: string | null) {
  try {
    const query: any = {}

    if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    const professionals = await db.collection("professionals").find(query).toArray()

    const pdf = generateProfessionalsReport(professionals)
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-profesionales-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating professionals report:", error)
    throw error
  }
}

async function generateFinancialReportAPI(
  db: any,
  startDate?: string | null,
  endDate?: string | null,
  companyId?: string | null,
) {
  try {
    // Mock financial data - in real implementation, this would come from a financial transactions collection
    const financialData = {
      period: startDate && endDate ? `${startDate} - ${endDate}` : "Último mes",
      totalIncome: 2450000,
      totalExpenses: 1680000,
      netProfit: 770000,
      transactions: [
        {
          date: "2024-01-15",
          concept: "Consulta Cardiología",
          professional: "Dr. Carlos Mendoza",
          company: "Clínica San Rafael",
          amount: "$150,000",
          status: "Pagado",
        },
        {
          date: "2024-01-15",
          concept: "Control Pediatría",
          professional: "Dra. Ana García",
          company: "Clínica San Rafael",
          amount: "$80,000",
          status: "Pagado",
        },
        {
          date: "2024-01-16",
          concept: "Consulta Neurología",
          professional: "Dr. Luis Rodríguez",
          company: "Centro Médico Norte",
          amount: "$200,000",
          status: "Pendiente",
        },
        {
          date: "2024-01-17",
          concept: "Consulta Ginecología",
          professional: "Dra. María López",
          company: "Hospital Central",
          amount: "$120,000",
          status: "Pagado",
        },
        {
          date: "2024-01-18",
          concept: "Procedimiento Dermatología",
          professional: "Dr. Fernando Castro",
          company: "Clínica San Rafael",
          amount: "$300,000",
          status: "Pagado",
        },
      ],
    }

    const pdf = generateFinancialReport(financialData)
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-financiero-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating financial report:", error)
    throw error
  }
}

async function generateMetricsReportAPI(db: any, companyId?: string | null) {
  try {
    // Get real data for metrics
    const appointments = await db.collection("appointments").find({}).toArray()
    const professionals = await db.collection("professionals").find({}).toArray()

    const confirmedAppointments = appointments.filter((a) => a.status === "confirmed")
    const totalAppointments = appointments.length
    const activeProfessionals = professionals.filter((p) => p.status === "active").length

    const metricsData = {
      totalAppointments,
      confirmationRate:
        totalAppointments > 0 ? Math.round((confirmedAppointments.length / totalAppointments) * 100) : 0,
      activeProfessionals,
      averageRating:
        professionals.length > 0
          ? (professionals.reduce((acc, p) => acc + (p.rating || 0), 0) / professionals.length).toFixed(1)
          : 0,
      averageConsultationTime: 35,
      overallEfficiency: 87,
      monthlyGrowth: 12,
      patientRetention: 78,
      resourceUtilization: 82,
    }

    const pdf = generateMetricsReport(metricsData)
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-metricas-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating metrics report:", error)
    throw error
  }
}
