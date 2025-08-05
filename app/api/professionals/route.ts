import { type NextRequest, NextResponse } from "next/server"

// Mock database for professionals
const professionals: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const search = searchParams.get("search")
    const specialty = searchParams.get("specialty")

    let filteredProfessionals = professionals

    if (companyId) {
      filteredProfessionals = filteredProfessionals.filter((prof) => prof.companyId === Number.parseInt(companyId))
    }

    if (search) {
      filteredProfessionals = filteredProfessionals.filter(
        (prof) =>
          prof.name.toLowerCase().includes(search.toLowerCase()) ||
          prof.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (specialty) {
      filteredProfessionals = filteredProfessionals.filter((prof) => prof.specialty === specialty)
    }

    return NextResponse.json({
      success: true,
      data: filteredProfessionals,
      total: filteredProfessionals.length,
    })
  } catch (error) {
    console.error("Error fetching professionals:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, specialty, email, phone, companyId, status = "active", weeklyHours = 40 } = body

    // Validate required fields
    if (!name || !specialty || !email || !phone) {
      return NextResponse.json({ success: false, error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Check if email already exists
    const existingProfessional = professionals.find((prof) => prof.email === email)
    if (existingProfessional) {
      return NextResponse.json({ success: false, error: "El email ya está registrado" }, { status: 400 })
    }

    // Create new professional
    const newProfessional = {
      id: professionals.length + 1,
      name,
      specialty,
      email,
      phone,
      companyId: companyId || 1,
      status,
      weeklyHours,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      totalHoursThisMonth: Math.floor(Math.random() * 80) + 120,
      createdAt: new Date().toISOString(),
    }

    professionals.push(newProfessional)

    return NextResponse.json({
      success: true,
      data: newProfessional,
      message: "Profesional creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating professional:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, specialty, email, phone, status, weeklyHours } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 })
    }

    const professionalIndex = professionals.findIndex((prof) => prof.id === id)
    if (professionalIndex === -1) {
      return NextResponse.json({ success: false, error: "Profesional no encontrado" }, { status: 404 })
    }

    // Update professional
    professionals[professionalIndex] = {
      ...professionals[professionalIndex],
      name: name || professionals[professionalIndex].name,
      specialty: specialty || professionals[professionalIndex].specialty,
      email: email || professionals[professionalIndex].email,
      phone: phone || professionals[professionalIndex].phone,
      status: status || professionals[professionalIndex].status,
      weeklyHours: weeklyHours || professionals[professionalIndex].weeklyHours,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: professionals[professionalIndex],
      message: "Profesional actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating professional:", error)
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

    const professionalIndex = professionals.findIndex((prof) => prof.id === Number.parseInt(id))
    if (professionalIndex === -1) {
      return NextResponse.json({ success: false, error: "Profesional no encontrado" }, { status: 404 })
    }

    // Remove professional
    const deletedProfessional = professionals.splice(professionalIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedProfessional,
      message: "Profesional eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting professional:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
