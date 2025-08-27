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
    const reportType = searchParams.get("type") || "appointments"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const companyId = searchParams.get("companyId")

    const db = await getDatabase()

    // Build base query
    const query: any = {}
    if (user.type === "empresa" && user.companyId) {
      query.companyId = user.companyId
    } else if (user.type === "profesional") {
      query.doctorId = user.userId
    } else if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    // Add date range if provided
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    switch (reportType) {
      case "appointments":
        return await generateAppointmentsReport(db, query)
      case "professionals":
        return await generateProfessionalsReport(db, query, user)
      case "revenue":
        return await generateRevenueReport(db, query)
      case "performance":
        return await generatePerformanceReport(db, query)
      default:
        return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

async function generateAppointmentsReport(db: any, query: any) {
  const collection = db.collection("appointments")

  const [totalAppointments, appointmentsByStatus, appointmentsBySpecialty, appointmentsByMonth, topDoctors] =
    await Promise.all([
      collection.countDocuments(query),
      collection.aggregate([{ $match: query }, { $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      collection
        .aggregate([{ $match: query }, { $group: { _id: "$specialty", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
        .toArray(),
      collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: { $substr: ["$date", 0, 7] },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: query },
          { $group: { _id: "$doctorName", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
    ])

  return NextResponse.json({
    type: "appointments",
    data: {
      total: totalAppointments,
      byStatus: appointmentsByStatus,
      bySpecialty: appointmentsBySpecialty,
      byMonth: appointmentsByMonth,
      topDoctors,
    },
  })
}

async function generateProfessionalsReport(db: any, query: any, user: any) {
  if (user.type === "profesional") {
    return NextResponse.json({ error: "Sin permisos para este reporte" }, { status: 403 })
  }

  const collection = db.collection("professionals")
  const profQuery = user.type === "empresa" && user.companyId ? { companyId: user.companyId } : {}

  const [totalProfessionals, professionalsByStatus, professionalsBySpecialty, averageRating, topRatedProfessionals] =
    await Promise.all([
      collection.countDocuments(profQuery),
      collection.aggregate([{ $match: profQuery }, { $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      collection
        .aggregate([
          { $match: profQuery },
          { $group: { _id: "$specialty", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      collection
        .aggregate([{ $match: profQuery }, { $group: { _id: null, avgRating: { $avg: { $toDouble: "$rating" } } } }])
        .toArray(),
      collection.find(profQuery).sort({ rating: -1 }).limit(10).toArray(),
    ])

  return NextResponse.json({
    type: "professionals",
    data: {
      total: totalProfessionals,
      byStatus: professionalsByStatus,
      bySpecialty: professionalsBySpecialty,
      averageRating: averageRating[0]?.avgRating || 0,
      topRated: topRatedProfessionals,
    },
  })
}

async function generateRevenueReport(db: any, query: any) {
  const collection = db.collection("appointments")

  const [totalAppointments, revenueByMonth, revenueBySpecialty] = await Promise.all([
    collection.countDocuments({ ...query, status: "completed" }),
    collection
      .aggregate([
        { $match: { ...query, status: "completed" } },
        {
          $group: {
            _id: { $substr: ["$date", 0, 7] },
            appointments: { $sum: 1 },
            revenue: { $sum: 50000 }, // Mock revenue per appointment
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...query, status: "completed" } },
        {
          $group: {
            _id: "$specialty",
            appointments: { $sum: 1 },
            revenue: { $sum: 50000 },
          },
        },
        { $sort: { revenue: -1 } },
      ])
      .toArray(),
  ])

  const totalRevenue = totalAppointments * 50000

  return NextResponse.json({
    type: "revenue",
    data: {
      total: totalRevenue,
      totalAppointments,
      byMonth: revenueByMonth,
      bySpecialty: revenueBySpecialty,
    },
  })
}

async function generatePerformanceReport(db: any, query: any) {
  const appointmentsCollection = db.collection("appointments")

  const [completionRate, cancellationRate, averageDuration, busyHours] = await Promise.all([
    appointmentsCollection
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([{ $match: query }, { $group: { _id: null, avgDuration: { $avg: "$duration" } } }])
      .toArray(),
    appointmentsCollection
      .aggregate([
        { $match: query },
        { $group: { _id: "$time", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray(),
  ])

  const completion = completionRate[0] || { total: 0, completed: 0 }
  const cancellation = cancellationRate[0] || { total: 0, cancelled: 0 }

  return NextResponse.json({
    type: "performance",
    data: {
      completionRate: completion.total > 0 ? (completion.completed / completion.total) * 100 : 0,
      cancellationRate: cancellation.total > 0 ? (cancellation.cancelled / cancellation.total) * 100 : 0,
      averageDuration: averageDuration[0]?.avgDuration || 30,
      busyHours,
    },
  })
}
