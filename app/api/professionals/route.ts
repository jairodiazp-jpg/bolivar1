import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { sendEmail, generateCredentialsEmailHTML } from "@/lib/email"

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
    const search = searchParams.get("search") || ""
    const companyId = searchParams.get("companyId")
    const specialty = searchParams.get("specialty")

    const db = await getDatabase()
    const collection = db.collection("professionals")

    // Build query
    const query: any = {}

    if (user.type === "empresa" && user.companyId) {
      query.companyId = user.companyId
    } else if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
      ]
    }

    if (specialty) {
      query.specialty = specialty
    }

    const skip = (page - 1) * limit
    const professionals = await collection.find(query).skip(skip).limit(limit).toArray()

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
    if (!user || (user.type !== "admin" && user.type !== "empresa")) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()
    const { name, specialty, email, phone, companyId, weeklyHours } = body

    if (!name || !specialty || !email || !phone) {
      return NextResponse.json({ error: "Campos requeridos: name, specialty, email, phone" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    // Check if email already exists
    const existingProfessional = await collection.findOne({ email })
    if (existingProfessional) {
      return NextResponse.json({ error: "Ya existe un profesional con este email" }, { status: 400 })
    }

    // Generate credentials
    const username = email.split("@")[0]
    const password = Math.random().toString(36).slice(-8)

    const professional = {
      name,
      specialty,
      email,
      phone,
      companyId: user.type === "empresa" ? user.companyId : companyId,
      weeklyHours: weeklyHours || 40,
      status: "active",
      rating: "5.0",
      totalHoursThisMonth: 0,
      credentials: {
        username,
        password,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(professional)

    // Send credentials email
    try {
      await sendEmail({
        to: email,
        subject: "Credenciales de Acceso - MediSchedule",
        html: generateCredentialsEmailHTML({
          name,
          specialty,
          companyName: "Hospital",
          credentials: { username, password },
        }),
      })
    } catch (emailError) {
      console.error("Error sending credentials email:", emailError)
    }

    return NextResponse.json({
      success: true,
      professional: { ...professional, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating professional:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
    }

    const result = await collection.updateOne({ _id: id }, { $set: updateFields })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating professional:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const result = await collection.deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting professional:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
