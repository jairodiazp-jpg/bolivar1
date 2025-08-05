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

    const db = await getDatabase()

    // Obtener estadísticas según el rol del usuario
    let stats: any = {}

    if (user.role === "admin") {
      // Estadísticas globales para admin
      const [
        totalProfessionals,
        totalAppointments,
        totalCompanies,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
      ] = await Promise.all([
        db.collection("professionals").countDocuments(),
        db.collection("appointments").countDocuments(),
        db.collection("companies").countDocuments(),
        db.collection("appointments").countDocuments({
          date: new Date().toISOString().split("T")[0],
        }),
        db.collection("appointments").countDocuments({ status: "pending" }),
        db.collection("appointments").countDocuments({ status: "confirmed" }),
      ])

      stats = {
        totalProfessionals,
        totalAppointments,
        totalCompanies,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        activeProfessionals: await db.collection("professionals").countDocuments({ status: "active" }),
        inactiveProfessionals: await db.collection("professionals").countDocuments({ status: "inactive" }),
      }
    } else if (user.role === "empresa") {
      // Estadísticas de la empresa
      const companyFilter = { companyId: user.companyId }

      const [companyProfessionals, companyAppointments, todayAppointments, pendingAppointments, confirmedAppointments] =
        await Promise.all([
          db.collection("professionals").countDocuments(companyFilter),
          db.collection("appointments").countDocuments(companyFilter),
          db.collection("appointments").countDocuments({
            ...companyFilter,
            date: new Date().toISOString().split("T")[0],
          }),
          db.collection("appointments").countDocuments({ ...companyFilter, status: "pending" }),
          db.collection("appointments").countDocuments({ ...companyFilter, status: "confirmed" }),
        ])

      stats = {
        totalProfessionals: companyProfessionals,
        totalAppointments: companyAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        activeProfessionals: await db
          .collection("professionals")
          .countDocuments({ ...companyFilter, status: "active" }),
        inactiveProfessionals: await db
          .collection("professionals")
          .countDocuments({ ...companyFilter, status: "inactive" }),
      }
    } else if (user.role === "profesional") {
      // Estadísticas del profesional
      const professionalFilter = { doctorId: Number.parseInt(user.id) }

      const [totalAppointments, todayAppointments, pendingAppointments, confirmedAppointments] = await Promise.all([
        db.collection("appointments").countDocuments(professionalFilter),
        db.collection("appointments").countDocuments({
          ...professionalFilter,
          date: new Date().toISOString().split("T")[0],
        }),
        db.collection("appointments").countDocuments({ ...professionalFilter, status: "pending" }),
        db.collection("appointments").countDocuments({ ...professionalFilter, status: "confirmed" }),
      ])

      stats = {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments: await db
          .collection("appointments")
          .countDocuments({ ...professionalFilter, status: "completed" }),
        cancelledAppointments: await db
          .collection("appointments")
          .countDocuments({ ...professionalFilter, status: "cancelled" }),
      }
    }

    // Obtener datos para gráficos (últimos 7 días)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const appointmentsByDay = await Promise.all(
      last7Days.map(async (date) => {
        const filter = user.role === "empresa" ? { companyId: user.companyId, date } : { date }
        const count = await db.collection("appointments").countDocuments(filter)
        return { date, count }
      }),
    )

    return NextResponse.json({
      stats,
      charts: {
        appointmentsByDay,
        last7Days,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
