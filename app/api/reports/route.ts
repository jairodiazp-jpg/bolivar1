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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "appointments"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const format = searchParams.get("format") || "json"

    const db = await getDatabase()

    const baseQuery: any = {}
    if (user.type === "profesional") {
      baseQuery.doctorId = user.userId
    } else if (user.type.startsWith("empresa") && user.companyId) {
      baseQuery.companyId = user.companyId
    }

    // Add date range filter
    if (startDate && endDate) {
      baseQuery.date = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    let data: any[] = []

    if (type === "appointments") {
      const collection = db.collection("appointments")
      data = await collection.find(baseQuery).sort({ date: -1 }).toArray()
    } else if (type === "professionals") {
      if (user.type === "admin" || user.type.startsWith("empresa")) {
        const collection = db.collection("professionals")
        const profQuery: any = {}
        if (user.type.startsWith("empresa") && user.companyId) {
          profQuery.companyId = user.companyId
        }
        data = await collection.find(profQuery).sort({ name: 1 }).toArray()
      }
    }

    if (format === "csv") {
      // Convert to CSV format
      if (data.length === 0) {
        return new Response("No data available", {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${type}-report.csv"`,
          },
        })
      }

      const headers = Object.keys(data[0]).filter((key) => key !== "_id")
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              if (typeof value === "string" && value.includes(",")) {
                return `"${value}"`
              }
              return value || ""
            })
            .join(","),
        ),
      ].join("\n")

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-report.csv"`,
        },
      })
    }

    return NextResponse.json({
      type,
      data,
      total: data.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
