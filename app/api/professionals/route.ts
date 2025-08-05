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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const specialty = searchParams.get("specialty")
    const companyId = searchParams.get("companyId")

    const db = await getDatabase()
    const collection = db.collection("professionals")

    // Construir query
    const query: any = {}

    if (user.role === "empresa" && user.companyId) {
      query.companyId = user.companyId
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
      ]
    }

    if (specialty) query.specialty = specialty
    if (companyId) query.companyId = Number.parseInt(companyId)

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
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "empresa")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const professionalData = await request.json()

    const db = await getDatabase()
    const collection = db.collection("professionals")

    // Verificar si el email ya existe
    const existingProfessional = await collection.findOne({ email: professionalData.email })
    if (existingProfessional) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const newProfessional = {
      ...professionalData,
      companyId: user.role === "empresa" ? user.companyId : professionalData.companyId,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
    }

    const result = await collection.insertOne(newProfessional)

    return NextResponse.json({
      success: true,
      professionalId: result.insertedId,
      professional: {
        ...newProfessional,
        _id: result.insertedId,
      },
    })
  } catch (error) {
    console.error("Error creating professional:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID de profesional requerido" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
          updatedBy: user.id,
        },
      },
    )

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
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de profesional requerido" }, { status: 400 })
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
