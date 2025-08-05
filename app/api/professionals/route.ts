import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail, generateCredentialsEmailHTML } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const status = searchParams.get("status")
    const specialty = searchParams.get("specialty")

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const query: any = {}

    if (companyId) {
      query.companyId = Number.parseInt(companyId)
    }

    if (status) {
      query.status = status
    }

    if (specialty) {
      query.specialty = specialty
    }

    const professionals = await collection.find(query).toArray()

    return NextResponse.json({
      success: true,
      data: professionals,
      count: professionals.length,
    })
  } catch (error) {
    console.error("Error fetching professionals:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching professionals",
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
    const requiredFields = ["name", "specialty", "email", "companyId"]
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

    // Generate automatic credentials
    const username = generateUsername(body.name)
    const password = generatePassword()

    const newProfessional = {
      ...body,
      status: body.status || "active",
      rating: body.rating || 0,
      weeklyHours: body.weeklyHours || 40,
      weeklyAppointments: body.weeklyAppointments || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      credentials: {
        username,
        password,
      },
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    // Verificar si el email ya existe
    const existingProfessional = await collection.findOne({ email: body.email })
    if (existingProfessional) {
      return NextResponse.json(
        {
          success: false,
          error: "Professional with this email already exists",
        },
        { status: 409 },
      )
    }

    const result = await collection.insertOne(newProfessional)
    const professionalWithId = { ...newProfessional, _id: result.insertedId }

    // Send credentials via email
    const credentialsResult = await sendCredentials(professionalWithId)

    return NextResponse.json(
      {
        success: true,
        data: professionalWithId,
        credentialsSent: credentialsResult,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating professional:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating professional",
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
    const collection = db.collection("professionals")

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
          error: "Professional not found",
        },
        { status: 404 },
      )
    }

    const updatedProfessional = await collection.findOne({ _id })

    return NextResponse.json({
      success: true,
      data: updatedProfessional,
    })
  } catch (error) {
    console.error("Error updating professional:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error updating professional",
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
    const collection = db.collection("professionals")

    const result = await collection.deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Professional not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Professional deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting professional:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting professional",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper functions
function generateUsername(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/dr\.|dra\./g, "")
    .trim()
    .split(" ")

  const firstName = cleanName[0] || ""
  const lastName = cleanName[cleanName.length - 1] || ""

  return firstName.charAt(0) + lastName + Math.floor(Math.random() * 100)
}

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function sendCredentials(professional: any) {
  try {
    const emailHTML = generateCredentialsEmailHTML(professional)
    const success = await sendEmail({
      to: professional.email,
      subject: "Credenciales de Acceso - MediSchedule",
      html: emailHTML,
      text: `Bienvenido al sistema MediSchedule. Usuario: ${professional.credentials.username}, Contraseña: ${professional.credentials.password}`,
    })

    console.log(`✅ Credentials sent to ${professional.email}: ${success}`)
    return success
  } catch (error) {
    console.error("Error sending credentials:", error)
    return false
  }
}
