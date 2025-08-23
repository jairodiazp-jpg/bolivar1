import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail, generateAppointmentEmailHTML } from "@/lib/email"
import { sendWhatsAppMessage, formatAppointmentWhatsApp } from "@/lib/twilio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const doctorId = searchParams.get("doctorId")
    const companyId = searchParams.get("companyId")
    const status = searchParams.get("status")

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const query: any = {}

    if (date) {
      query.date = date
    }

    if (doctorId) {
      query.doctorId = Number.parseInt(doctorId)
    }

    if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    if (status) {
      query.status = status
    }

    const appointments = await collection.find(query).toArray()

    return NextResponse.json({
      success: true,
      data: appointments,
      count: appointments.length,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching appointments",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar campos requeridos
    const requiredFields = ["patientName", "patientEmail", "doctorName", "date", "time", "specialty"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 },
      )
    }

    const newAppointment = {
      ...body,
      status: body.status || "pending",
      duration: body.duration || 30,
      type: body.type || "Consulta",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const result = await collection.insertOne(newAppointment)
    const appointmentWithId = { ...newAppointment, _id: result.insertedId }

    // Send notifications
    const notificationResult = await sendNotifications(appointmentWithId)

    return NextResponse.json(
      {
        success: true,
        data: appointmentWithId,
        notifications: notificationResult,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating appointment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { _id, ...updateData } = body

    if (!_id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID is required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    // Verificar si existe
    const existingAppointment = await collection.findOne({ _id })
    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
        },
        { status: 404 },
      )
    }

    const result = await collection.updateOne(
      { _id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
        },
        { status: 404 },
      )
    }

    const updatedAppointment = await collection.findOne({ _id })

    // Send update notifications if status changed to confirmed
    let notificationResult = null
    if (updateData.status === "confirmed" && existingAppointment.status !== "confirmed") {
      notificationResult = await sendNotifications(updatedAppointment)
    }

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      notifications: notificationResult,
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error updating appointment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID is required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const collection = db.collection("appointments")

    const result = await collection.deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting appointment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Enhanced notification function with better error handling
async function sendNotifications(appointment: any) {
  const results = {
    email: { success: false, error: null },
    whatsapp: { success: false, error: null },
  }

  try {
    // Send email notification
    if (appointment.patientEmail) {
      const emailHTML = generateAppointmentEmailHTML(appointment)
      const emailSuccess = await sendEmail({
        to: appointment.patientEmail,
        subject: `Confirmación de Cita - ${appointment.doctorName}`,
        html: emailHTML,
        text: `Tu cita con ${appointment.doctorName} está programada para el ${appointment.date} a las ${appointment.time}`,
      })
      results.email.success = emailSuccess
    }
  } catch (error) {
    results.email.error = error instanceof Error ? error.message : "Unknown email error"
    console.error("Error sending email:", error)
  }

  try {
    // Send WhatsApp notification
    if (appointment.patientPhone) {
      const whatsappMessage = formatAppointmentWhatsApp(appointment)
      const whatsappSuccess = await sendWhatsAppMessage({
        to: appointment.patientPhone,
        message: whatsappMessage,
      })
      results.whatsapp.success = whatsappSuccess
    }
  } catch (error) {
    results.whatsapp.error = error instanceof Error ? error.message : "Unknown WhatsApp error"
    console.error("Error sending WhatsApp:", error)
  }

  // Log successful notifications
  console.log(
    `📧 Email: ${results.email.success ? "✅" : "❌"}, WhatsApp: ${results.whatsapp.success ? "✅" : "❌"} for appointment ${appointment._id}`,
  )

  return results
}
