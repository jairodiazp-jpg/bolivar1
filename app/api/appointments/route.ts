import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

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
    const date = searchParams.get("date")
    const doctorId = searchParams.get("doctorId")
    const status = searchParams.get("status")
    const companyId = searchParams.get("companyId")

    const db = await getDatabase()
    const collection = db.collection("appointments")

    // Build query based on user type
    const query: any = {}

    if (user.type === "profesional") {
      query.doctorId = user.userId
    } else if (user.type.startsWith("empresa") && user.companyId) {
      query.companyId = user.companyId
    } else if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    if (date) {
      query.date = date
    }

    if (doctorId) {
      query.doctorId = Number.parseInt(doctorId)
    }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    // Fix MongoDB query chain
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
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await request.json()
    const {
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName,
      specialty,
      date,
      time,
      duration,
      type,
      notes,
      location,
      companyId,
    } = body

    if (!patientName || !patientEmail || !doctorId || !date || !time) {
      return NextResponse.json(
        { error: "Campos requeridos: patientName, patientEmail, doctorId, date, time" },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    // Check for conflicts
    const conflictingAppointment = await collection.findOne({
      doctorId: Number.parseInt(doctorId),
      date,
      time,
      status: { $in: ["confirmed", "pending"] },
    })

    if (conflictingAppointment) {
      return NextResponse.json({ error: "Ya existe una cita en esa fecha y hora" }, { status: 400 })
    }

    const appointment = {
      patientName,
      patientEmail,
      patientPhone: patientPhone || "",
      doctorId: Number.parseInt(doctorId),
      doctorName: doctorName || "Dr. Desconocido",
      specialty: specialty || "Medicina General",
      date,
      time,
      duration: duration || 30,
      type: type || "Consulta",
      status: "confirmed",
      notes: notes || "",
      location: location || "Consultorio",
      companyId: user.type.startsWith("empresa") ? user.companyId : companyId ? Number.parseInt(companyId) : 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(appointment)

    return NextResponse.json({
      success: true,
      appointment: { ...appointment, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
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
    const { id, status, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
    }

    if (status) {
      updateFields.status = status
    }

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating appointment:", error)
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
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
