import { type NextRequest, NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/optimized-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    const stats = await getDashboardStats(companyId ? Number.parseInt(companyId) : undefined)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching dashboard stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
