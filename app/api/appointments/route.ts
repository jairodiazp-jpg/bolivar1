import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { sendEmail, generateAppointmentEmailHTML } from "@/lib/email"
import { sendWhatsAppMessage, formatAppointmentWhatsApp } from "@/lib/twilio"

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
    } else if (user.type === "empresa" && user.companyId) {
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
      doctorId,
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
      doctorId,
      doctorName: doctorName || "Dr. Desconocido",
      specialty: specialty || "Medicina General",
      date,
      time,
      duration: duration || 30,
      type: type || "Consulta",
      status: "confirmed",
      notes: notes || "",
      location: location || "Consultorio",
      companyId: user.type === "empresa" ? user.companyId : companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(appointment)

    // Send confirmation email
    try {
      await sendEmail({
        to: patientEmail,
        subject: "Confirmación de Cita Médica - MediSchedule",
        html: generateAppointmentEmailHTML(appointment),
      })
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
    }

    // Send WhatsApp notification if phone is provided
    if (patientPhone) {
      try {
        await sendWhatsAppMessage({
          to: patientPhone,
          message: formatAppointmentWhatsApp(appointment),
        })
      } catch (whatsappError) {
        console.error("Error sending WhatsApp:", whatsappError)
      }
    }

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

    const result = await collection.updateOne({ _id: id }, { $set: updateFields })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    // If status changed, send notification
    if (status) {
      const appointment = await collection.findOne({ _id: id })
      if (appointment && appointment.patientEmail) {
        try {
          let subject = "Actualización de Cita Médica"
          if (status === "cancelled") {
            subject = "Cita Cancelada - MediSchedule"
          } else if (status === "confirmed") {
            subject = "Cita Confirmada - MediSchedule"
          }

          await sendEmail({
            to: appointment.patientEmail,
            subject,
            html: generateAppointmentEmailHTML({ ...appointment, status }),
          })
        } catch (emailError) {
          console.error("Error sending status update email:", emailError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
