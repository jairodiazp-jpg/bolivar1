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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const specialty = searchParams.get("specialty")
    const companyId = searchParams.get("companyId")

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const query: any = {}

    if (user.type.startsWith("empresa") && user.companyId) {
      query.companyId = user.companyId
    } else if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    if (specialty) {
      query.specialty = { $regex: specialty, $options: "i" }
    }

    const skip = (page - 1) * limit
    const professionals = await collection.find(query).sort({ name: 1 }).skip(skip).limit(limit).toArray()

    const total = await collection.countDocuments(query)

    return NextResponse.json({
      professionals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching professionals:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || (user.type !== "admin" && !user.type.startsWith("empresa"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()
    const { name, specialty, email, phone, schedule, companyId } = body

    if (!name || !specialty || !email) {
      return NextResponse.json({ error: "Nombre, especialidad y email son requeridos" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    // Check if professional already exists
    const existing = await collection.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Ya existe un profesional con este email" }, { status: 400 })
    }

    const professional = {
      name,
      specialty,
      email,
      phone: phone || "",
      schedule: schedule || {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "09:00", end: "13:00", available: false },
        sunday: { start: "09:00", end: "13:00", available: false },
      },
      companyId: user.type.startsWith("empresa") ? user.companyId : companyId ? Number.parseInt(companyId) : 1,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(professional)

    return NextResponse.json({
      success: true,
      professional: { ...professional, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating professional:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
