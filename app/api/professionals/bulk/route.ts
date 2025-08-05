import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail, generateCredentialsEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { professionals } = body

    if (!professionals || !Array.isArray(professionals)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid professionals data",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const collection = db.collection("professionals")

    const results = []
    const createdProfessionals = []

    for (const professionalData of professionals) {
      try {
        // Validar campos requeridos
        const requiredFields = ["name", "specialty", "email", "companyId"]
        const missingFields = requiredFields.filter((field) => !professionalData[field])

        if (missingFields.length > 0) {
          results.push({
            success: false,
            data: professionalData,
            error: `Missing required fields: ${missingFields.join(", ")}`,
          })
          continue
        }

        // Verificar si el email ya existe
        const existingProfessional = await collection.findOne({ email: professionalData.email })
        if (existingProfessional) {
          results.push({
            success: false,
            data: professionalData,
            error: "Professional with this email already exists",
          })
          continue
        }

        // Generate automatic credentials
        const username = generateUsername(professionalData.name)
        const password = generatePassword()

        const newProfessional = {
          ...professionalData,
          status: professionalData.status || "active",
          rating: professionalData.rating || 0,
          weeklyHours: professionalData.weeklyHours || 40,
          weeklyAppointments: professionalData.weeklyAppointments || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          credentials: {
            username,
            password,
          },
          workHours: generateWorkHours(),
          totalHoursThisMonth: Math.floor(Math.random() * 80) + 120,
        }

        const result = await collection.insertOne(newProfessional)
        const professionalWithId = { ...newProfessional, _id: result.insertedId }

        createdProfessionals.push(professionalWithId)

        results.push({
          success: true,
          data: professionalWithId,
          message: "Professional created successfully",
        })
      } catch (error) {
        results.push({
          success: false,
          data: professionalData,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Send credentials emails in background
    sendCredentialsInBackground(createdProfessionals)

    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: professionals.length,
        created: successCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error processing bulk upload",
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

function generateWorkHours() {
  const workHours = []
  const today = new Date()

  // Generar horas de trabajo para los últimos 30 días
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Solo días laborables (lunes a viernes)
    if (date.getDay() >= 1 && date.getDay() <= 5) {
      const startHour = Math.floor(Math.random() * 3) + 7 // 7-9 AM
      const endHour = Math.floor(Math.random() * 3) + 16 // 4-6 PM
      const totalHours = endHour - startHour
      const appointments = Math.floor(Math.random() * 8) + 3 // 3-10 citas

      workHours.push({
        date: date.toISOString().split("T")[0],
        startTime: `${startHour.toString().padStart(2, "0")}:00`,
        endTime: `${endHour.toString().padStart(2, "0")}:00`,
        totalHours,
        appointments,
        status: Math.random() > 0.05 ? "completed" : "pending",
      })
    }
  }

  return workHours.reverse()
}

async function sendCredentialsInBackground(professionals: any[]) {
  // Send emails in background without blocking the response
  setTimeout(async () => {
    for (const professional of professionals) {
      try {
        const emailHTML = generateCredentialsEmailHTML(professional)
        const success = await sendEmail({
          to: professional.email,
          subject: "Credenciales de Acceso - MediSchedule",
          html: emailHTML,
          text: `Bienvenido al sistema MediSchedule. Usuario: ${professional.credentials.username}, Contraseña: ${professional.credentials.password}`,
        })

        console.log(`✅ Credentials sent to ${professional.email}: ${success}`)
      } catch (error) {
        console.error(`❌ Error sending credentials to ${professional.email}:`, error)
      }
    }
  }, 1000)
}
