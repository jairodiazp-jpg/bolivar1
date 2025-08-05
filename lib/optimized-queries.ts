import { getDatabase } from "./mongodb"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS, memoryCache } from "./cache"

// Optimized appointment queries with caching
export const getAppointmentsByDate = createCachedFunction(
  async (date: string, companyId?: number) => {
    const db = await getDatabase()
    const query: any = { date }
    if (companyId) query.companyId = companyId

    return await db.collection("appointments").find(query).sort({ time: 1 }).toArray()
  },
  "appointments-by-date",
  [CACHE_TAGS.APPOINTMENTS],
  CACHE_DURATIONS.SHORT,
)

export const getAppointmentsByProfessional = createCachedFunction(
  async (doctorId: number, startDate: string, endDate: string) => {
    const db = await getDatabase()
    return await db
      .collection("appointments")
      .find({
        doctorId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1, time: 1 })
      .toArray()
  },
  "appointments-by-professional",
  [CACHE_TAGS.APPOINTMENTS],
  CACHE_DURATIONS.SHORT,
)

// Optimized professional queries with indexing hints
export const getProfessionalsByCompany = createCachedFunction(
  async (companyId: number, page = 1, limit = 50) => {
    const cacheKey = `professionals-company-${companyId}-${page}-${limit}`
    const cached = memoryCache.get(cacheKey)
    if (cached) return cached

    const db = await getDatabase()
    const skip = (page - 1) * limit

    const [professionals, total] = await Promise.all([
      db
        .collection("professionals")
        .find({ companyId, status: "active" })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("professionals").countDocuments({ companyId, status: "active" }),
    ])

    const result = {
      professionals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + professionals.length < total,
    }

    memoryCache.set(cacheKey, result, CACHE_DURATIONS.MEDIUM * 1000)
    return result
  },
  "professionals-by-company",
  [CACHE_TAGS.PROFESSIONALS],
  CACHE_DURATIONS.MEDIUM,
)

// Optimized dashboard statistics
export const getDashboardStats = createCachedFunction(
  async (companyId?: number) => {
    const cacheKey = `dashboard-stats-${companyId || "all"}`
    const cached = memoryCache.get(cacheKey)
    if (cached) return cached

    const db = await getDatabase()
    const today = new Date().toISOString().split("T")[0]

    const baseQuery = companyId ? { companyId } : {}

    const [totalAppointments, todayAppointments, confirmedAppointments, activeProfessionals, totalProfessionals] =
      await Promise.all([
        db.collection("appointments").countDocuments(baseQuery),
        db.collection("appointments").countDocuments({ ...baseQuery, date: today }),
        db.collection("appointments").countDocuments({ ...baseQuery, status: "confirmed" }),
        db.collection("professionals").countDocuments({ ...baseQuery, status: "active" }),
        db.collection("professionals").countDocuments(baseQuery),
      ])

    const stats = {
      totalAppointments,
      todayAppointments,
      confirmedAppointments,
      activeProfessionals,
      totalProfessionals,
      confirmationRate: totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0,
      lastUpdated: new Date().toISOString(),
    }

    memoryCache.set(cacheKey, stats, CACHE_DURATIONS.SHORT * 1000)
    return stats
  },
  "dashboard-stats",
  [CACHE_TAGS.APPOINTMENTS, CACHE_TAGS.PROFESSIONALS],
  CACHE_DURATIONS.SHORT,
)

// Batch operations for better performance
export async function batchUpdateAppointments(updates: Array<{ _id: string; data: any }>) {
  const db = await getDatabase()
  const operations = updates.map(({ _id, data }) => ({
    updateOne: {
      filter: { _id },
      update: { $set: { ...data, updatedAt: new Date() } },
    },
  }))

  const result = await db.collection("appointments").bulkWrite(operations)

  // Invalidate cache
  memoryCache.clear()

  return result
}
