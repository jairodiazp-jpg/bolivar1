import { type NextRequest, NextResponse } from "next/server"

// Mock appointments data
const appointments: any[] = [
  {
    id: 1,
    patientName: "Juan Pérez",
    professionalName: "Dr. Carlos Mendoza",
    specialty: "Cardiología",
    date: "2024-01-15",
    time: "09:00",
    status: "confirmed",
    companyId: 1,
    professionalId: 1,
    notes: "Consulta de control",
  },
  {
    id: 2,
    patientName: "María García",
    professionalName: "Dra. Ana López",
    specialty: "Pediatría",
    date: "2024-01-15",
    time: "10:30",
    status: "pending",
    companyId: 1,
    professionalId: 2,
    notes: "Primera consulta",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const professionalId = searchParams.get("professionalId")
    const date = searchParams.get("date")
    const status = searchParams.get("status")

    let filteredAppointments = appointments

    if (companyId) {
      filteredAppointments = filteredAppointments.filter((apt) => apt.companyId === Number.parseInt(companyId))
    }

    if (professionalId) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => apt.professionalId === Number.parseInt(professionalId),
      )
    }

    if (date) {
      filteredAppointments = filteredAppointments.filter((apt) => apt.date === date)
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter((apt) => apt.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredAppointments,
      total: filteredAppointments.length,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientName, professionalId, professionalName, specialty, date, time, notes, companyId } = body

    // Validate required fields
    if (!patientName || !professionalId || !date || !time) {
      return NextResponse.json({ success: false, error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Check for conflicts
    const existingAppointment = appointments.find(
      (apt) => apt.professionalId === professionalId && apt.date === date && apt.time === time,
    )

    if (existingAppointment) {
      return NextResponse.json({ success: false, error: "Ya existe una cita en esa fecha y hora" }, { status: 400 })
    }

    // Create new appointment
    const newAppointment = {
      id: appointments.length + 1,
      patientName,
      professionalId,
      professionalName: professionalName || "Dr. Profesional",
      specialty: specialty || "Medicina General",
      date,
      time,
      status: "confirmed",
      companyId: companyId || 1,
      notes: notes || "",
      createdAt: new Date().toISOString(),
    }

    appointments.push(newAppointment)

    return NextResponse.json({
      success: true,
      data: newAppointment,
      message: "Cita creada exitosamente",
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 })
    }

    const appointmentIndex = appointments.findIndex((apt) => apt.id === id)
    if (appointmentIndex === -1) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 })
    }

    // Update appointment
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      status: status || appointments[appointmentIndex].status,
      notes: notes || appointments[appointmentIndex].notes,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: appointments[appointmentIndex],
      message: "Cita actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 })
    }

    const appointmentIndex = appointments.findIndex((apt) => apt.id === Number.parseInt(id))
    if (appointmentIndex === -1) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 })
    }

    // Remove appointment
    const deletedAppointment = appointments.splice(appointmentIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedAppointment,
      message: "Cita eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
