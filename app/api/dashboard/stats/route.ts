import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get current date info
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const today = new Date().toISOString().split("T")[0]

    // Build base query based on user type
    const baseQuery: any = {}
    if (user.type === "profesional") {
      baseQuery.doctorId = user.userId
    } else if (user.type.startsWith("empresa") && user.companyId) {
      baseQuery.companyId = user.companyId
    }

    // Get appointments stats
    const appointmentsCollection = db.collection("appointments")

    const [
      totalAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      confirmedAppointments,
      pendingAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      appointmentsCollection.countDocuments(baseQuery),
      appointmentsCollection.countDocuments({ ...baseQuery, date: today }),
      appointmentsCollection.countDocuments({
        ...baseQuery,
        createdAt: { $gte: startOfWeek },
      }),
      appointmentsCollection.countDocuments({
        ...baseQuery,
        createdAt: { $gte: startOfMonth },
      }),
      appointmentsCollection.countDocuments({ ...baseQuery, status: "confirmed" }),
      appointmentsCollection.countDocuments({ ...baseQuery, status: "pending" }),
      appointmentsCollection.countDocuments({ ...baseQuery, status: "cancelled" }),
    ])

    // Get professionals stats (only for admin and empresa users)
    let professionalsStats = null
    if (user.type === "admin" || user.type.startsWith("empresa")) {
      const professionalsCollection = db.collection("professionals")
      const profQuery: any = {}
      if (user.type.startsWith("empresa") && user.companyId) {
        profQuery.companyId = user.companyId
      }

      const [totalProfessionals, activeProfessionals] = await Promise.all([
        professionalsCollection.countDocuments(profQuery),
        professionalsCollection.countDocuments({ ...profQuery, status: "active" }),
      ])

      professionalsStats = {
        total: totalProfessionals,
        active: activeProfessionals,
        inactive: totalProfessionals - activeProfessionals,
      }
    }

    // Get recent appointments
    const recentAppointments = await appointmentsCollection.find(baseQuery).sort({ createdAt: -1 }).limit(5).toArray()

    const stats = {
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: weekAppointments,
        thisMonth: monthAppointments,
        confirmed: confirmedAppointments,
        pending: pendingAppointments,
        cancelled: cancelledAppointments,
      },
      professionals: professionalsStats,
      recent: recentAppointments,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
