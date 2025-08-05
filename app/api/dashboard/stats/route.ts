import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

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

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    const db = await getDatabase()

    // Build query based on user type
    const query: any = {}
    if (user.type === "empresa" && user.companyId) {
      query.companyId = user.companyId
    } else if (user.type === "profesional") {
      query.doctorId = user.userId
    } else if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    const today = new Date().toISOString().split("T")[0]
    const thisMonth = new Date().toISOString().slice(0, 7)

    // Get appointments stats
    const appointmentsCollection = db.collection("appointments")

    const [appointmentsToday, appointmentsThisMonth, appointmentsByStatus, appointmentsBySpecialty] = await Promise.all(
      [
        appointmentsCollection.countDocuments({ ...query, date: today }),
        appointmentsCollection.countDocuments({
          ...query,
          date: { $regex: `^${thisMonth}` },
        }),
        appointmentsCollection
          .aggregate([{ $match: query }, { $group: { _id: "$status", count: { $sum: 1 } } }])
          .toArray(),
        appointmentsCollection
          .aggregate([
            { $match: query },
            { $group: { _id: "$specialty", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ])
          .toArray(),
      ],
    )

    // Get professionals stats if admin or empresa
    let professionalsStats = null
    if (user.type === "admin" || user.type === "empresa") {
      const professionalsCollection = db.collection("professionals")
      const profQuery = user.type === "empresa" && user.companyId ? { companyId: user.companyId } : {}

      const [totalProfessionals, activeProfessionals, professionalsBySpecialty] = await Promise.all([
        professionalsCollection.countDocuments(profQuery),
        professionalsCollection.countDocuments({ ...profQuery, status: "active" }),
        professionalsCollection
          .aggregate([
            { $match: profQuery },
            { $group: { _id: "$specialty", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ])
          .toArray(),
      ])

      professionalsStats = {
        total: totalProfessionals,
        active: activeProfessionals,
        bySpecialty: professionalsBySpecialty,
      }
    }

    // Calculate revenue (mock calculation)
    const revenue = appointmentsThisMonth * 50000 // $50k per appointment average

    const stats = {
      appointments: {
        today: appointmentsToday,
        thisMonth: appointmentsThisMonth,
        byStatus: appointmentsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        bySpecialty: appointmentsBySpecialty,
      },
      professionals: professionalsStats,
      revenue: {
        thisMonth: revenue,
        average: Math.round(revenue / new Date().getDate()),
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
