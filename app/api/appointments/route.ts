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
    const doctorId = searchParams.get("doctorId")
    const date = searchParams.get("date")
    const status = searchParams.get("status")

    const db = await getDatabase()
    const collection = db.collection("appointments")

    // Construir query
    const query: any = {}

    if (user.role === "empresa" && user.companyId) {
      query.companyId = user.companyId
    }

    if (user.role === "profesional") {
      query.doctorId = Number.parseInt(user.id)
    }

    if (doctorId) query.doctorId = Number.parseInt(doctorId)
    if (date) query.date = date
    if (status) query.status = status

    const skip = (page - 1) * limit

    // Obtener appointments con sort, skip y limit
    const appointments = await collection.find(query).sort({ date: -1, time: 1 }).skip(skip).limit(limit).toArray()

    const total = await collection.countDocuments(query)

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const appointmentData = await request.json()

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const newAppointment = {
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
      companyId: user.companyId || 1,
    }

    const result = await collection.insertOne(newAppointment)

    return NextResponse.json({
      success: true,
      appointmentId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
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

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const result = await collection.deleteOne({ _id: id })

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
