import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/medischedule"
const options = {}

let client: MongoClient
let db: Db

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }

  if (!db) {
    db = client.db("medischedule")
  }

  return { client, db }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

// Generar 1000 profesionales (500 por empresa)
function generateProfessionals() {
  const specialties = [
    "Cardiología",
    "Pediatría",
    "Neurología",
    "Ginecología",
    "Dermatología",
    "Oftalmología",
    "Traumatología",
    "Psiquiatría",
    "Urología",
    "Endocrinología",
    "Gastroenterología",
    "Neumología",
    "Oncología",
    "Radiología",
    "Anestesiología",
    "Medicina Interna",
    "Medicina Familiar",
    "Cirugía General",
    "Ortopedia",
    "Otorrinolaringología",
  ]

  const firstNames = [
    "Carlos",
    "Ana",
    "Luis",
    "María",
    "Fernando",
    "Carmen",
    "Roberto",
    "Patricia",
    "Miguel",
    "Laura",
    "José",
    "Isabel",
    "Antonio",
    "Rosa",
    "Manuel",
    "Elena",
    "Francisco",
    "Pilar",
    "Javier",
    "Mercedes",
    "Rafael",
    "Dolores",
    "Ángel",
    "Concepción",
    "David",
    "Teresa",
    "Daniel",
    "Francisca",
    "Alejandro",
    "Antonia",
    "Jesús",
    "Josefa",
    "Sergio",
    "Rosario",
    "Pablo",
    "Esperanza",
    "Álvaro",
    "Encarnación",
    "Adrián",
    "Asunción",
  ]

  const lastNames = [
    "García",
    "Rodríguez",
    "González",
    "Fernández",
    "López",
    "Martínez",
    "Sánchez",
    "Pérez",
    "Gómez",
    "Martín",
    "Jiménez",
    "Ruiz",
    "Hernández",
    "Díaz",
    "Moreno",
    "Muñoz",
    "Álvarez",
    "Romero",
    "Alonso",
    "Gutiérrez",
    "Navarro",
    "Torres",
    "Domínguez",
    "Vázquez",
    "Ramos",
    "Gil",
    "Ramírez",
    "Serrano",
    "Blanco",
    "Suárez",
    "Molina",
    "Morales",
    "Ortega",
    "Delgado",
    "Castro",
    "Ortiz",
    "Rubio",
    "Marín",
    "Sanz",
    "Iglesias",
  ]

  const professionals = []

  // Hospital San Rafael (500 profesionales)
  for (let i = 1; i <= 500; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)]
    const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)]
    const specialty = specialties[Math.floor(Math.random() * specialties.length)]
    const name = `Dr. ${firstName} ${lastName1}`
    const email = `${firstName.toLowerCase()}.${lastName1.toLowerCase()}@sanrafael.com`

    professionals.push({
      _id: i.toString(),
      name,
      specialty,
      email,
      phone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      companyId: 1,
      companyName: "Hospital San Rafael",
      weeklyHours: Math.floor(Math.random() * 20) + 30, // 30-50 horas
      weeklyAppointments: Math.floor(Math.random() * 30) + 15, // 15-45 citas
      status: Math.random() > 0.1 ? "active" : "inactive", // 90% activos
      photo: `/placeholder.svg?height=100&width=100&text=${firstName}`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      credentials: {
        username: `${firstName.toLowerCase()}${lastName1.toLowerCase()}`,
        password: "medico123",
      },
      workHours: generateWorkHours(),
      totalHoursThisMonth: Math.floor(Math.random() * 80) + 120, // 120-200 horas
    })
  }

  // Clínica Norte (500 profesionales)
  for (let i = 501; i <= 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)]
    const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)]
    const specialty = specialties[Math.floor(Math.random() * specialties.length)]
    const name = `Dr. ${firstName} ${lastName1}`
    const email = `${firstName.toLowerCase()}.${lastName1.toLowerCase()}@clinicanorte.com`

    professionals.push({
      _id: i.toString(),
      name,
      specialty,
      email,
      phone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      companyId: 2,
      companyName: "Clínica Norte",
      weeklyHours: Math.floor(Math.random() * 20) + 30, // 30-50 horas
      weeklyAppointments: Math.floor(Math.random() * 30) + 15, // 15-45 citas
      status: Math.random() > 0.1 ? "active" : "inactive", // 90% activos
      photo: `/placeholder.svg?height=100&width=100&text=${firstName}`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      credentials: {
        username: `${firstName.toLowerCase()}${lastName1.toLowerCase()}`,
        password: "medico123",
      },
      workHours: generateWorkHours(),
      totalHoursThisMonth: Math.floor(Math.random() * 80) + 120, // 120-200 horas
    })
  }

  return professionals
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

  return workHours.reverse() // Orden cronológico
}

// Generar citas para los 1000 profesionales
function generateAppointments() {
  const appointments = []
  const patientNames = [
    "María González",
    "Juan Pérez",
    "Carmen López",
    "Roberto Silva",
    "Ana Martínez",
    "Luis Rodríguez",
    "Isabel Fernández",
    "Carlos Sánchez",
    "Rosa García",
    "Miguel Torres",
    "Elena Ruiz",
    "Francisco Moreno",
    "Pilar Jiménez",
    "Antonio Díaz",
    "Mercedes Álvarez",
    "José Romero",
    "Teresa Navarro",
    "Manuel Gutiérrez",
    "Dolores Vázquez",
    "Ángel Ramos",
  ]

  const appointmentTypes = ["Consulta", "Control", "Seguimiento", "Procedimiento", "Urgencia"]
  const statuses = ["confirmed", "pending", "cancelled"]

  // Generar 2000 citas distribuidas entre los profesionales
  for (let i = 1; i <= 2000; i++) {
    const professionalId = Math.floor(Math.random() * 1000) + 1
    const professional = generateProfessionals().find((p) => p._id === professionalId.toString())
    const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * 60) - 30) // ±30 días

    const hour = Math.floor(Math.random() * 10) + 8 // 8-17
    const minute = Math.random() > 0.5 ? "00" : "30"
    const time = `${hour.toString().padStart(2, "0")}:${minute}`

    appointments.push({
      _id: i.toString(),
      patientName,
      patientEmail: `${patientName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      patientPhone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      doctorId: professionalId,
      doctorName: professional?.name || "Dr. Desconocido",
      specialty: professional?.specialty || "Medicina General",
      date: date.toISOString().split("T")[0],
      time,
      duration: [30, 45, 60][Math.floor(Math.random() * 3)],
      type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: Math.random() > 0.5 ? "Paciente requiere seguimiento especial" : "",
      location: `Consultorio ${Math.floor(Math.random() * 50) + 101}`,
      companyId: professional?.companyId || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  return appointments
}

export const mockData = {
  appointments: generateAppointments(),
  professionals: generateProfessionals(),
  companies: [
    {
      _id: "1",
      name: "Hospital San Rafael",
      email: "admin@sanrafael.com",
      phone: "+57 1 234 5678",
      address: "Calle 123 #45-67, Bogotá",
      professionals: 500,
      monthlyAppointments: 3250,
      status: "active",
      createdAt: "2024-01-01",
      description: "Hospital de alta complejidad con más de 20 especialidades médicas",
      logo: "/placeholder.svg?height=100&width=100&text=HSR",
      website: "https://sanrafael.com",
      nit: "900.123.456-7",
    },
    {
      _id: "2",
      name: "Clínica Norte",
      email: "admin@clinicanorte.com",
      phone: "+57 1 345 6789",
      address: "Carrera 78 #90-12, Bogotá",
      professionals: 500,
      monthlyAppointments: 2890,
      status: "active",
      createdAt: "2024-01-01",
      description: "Clínica especializada en medicina preventiva y diagnóstica",
      logo: "/placeholder.svg?height=100&width=100&text=CN",
      website: "https://clinicanorte.com",
      nit: "900.654.321-8",
    },
  ],
  workHours: [], // Se genera dinámicamente en generateWorkHours()
}

// Función para simular base de datos cuando no hay MongoDB
export async function getMockDatabase() {
  return {
    collection: (name: string) => ({
      find: (query: any = {}) => ({
        toArray: async () => {
          const data = mockData[name as keyof typeof mockData] || []
          if (Object.keys(query).length === 0) return data

          // Filtrado simple para queries
          return data.filter((item: any) => {
            return Object.entries(query).every(([key, value]) => {
              if (key === "date" && typeof value === "object" && value.$gte && value.$lte) {
                return item[key] >= value.$gte && item[key] <= value.$lte
              }
              return item[key] === value
            })
          })
        },
        limit: (limit: number) => ({
          toArray: async () => {
            const data = mockData[name as keyof typeof mockData] || []
            return data.slice(0, limit)
          },
        }),
        skip: (skip: number) => ({
          limit: (limit: number) => ({
            toArray: async () => {
              const data = mockData[name as keyof typeof mockData] || []
              return data.slice(skip, skip + limit)
            },
          }),
        }),
      }),
      findOne: async (query: any) => {
        const data = mockData[name as keyof typeof mockData] || []
        return data.find((item: any) => {
          return Object.entries(query).every(([key, value]) => item[key] === value)
        })
      },
      insertOne: async (doc: any) => {
        const data = mockData[name as keyof typeof mockData] as any[]
        const newDoc = { ...doc, _id: (data.length + 1).toString() }
        data.push(newDoc)
        return { insertedId: newDoc._id }
      },
      updateOne: async (query: any, update: any) => {
        const data = mockData[name as keyof typeof mockData] as any[]
        const index = data.findIndex((item: any) => Object.entries(query).every(([key, value]) => item[key] === value))
        if (index !== -1) {
          data[index] = { ...data[index], ...update.$set }
          return { matchedCount: 1, modifiedCount: 1 }
        }
        return { matchedCount: 0, modifiedCount: 0 }
      },
      deleteOne: async (query: any) => {
        const data = mockData[name as keyof typeof mockData] as any[]
        const index = data.findIndex((item: any) => Object.entries(query).every(([key, value]) => item[key] === value))
        if (index !== -1) {
          data.splice(index, 1)
          return { deletedCount: 1 }
        }
        return { deletedCount: 0 }
      },
      countDocuments: async (query: any = {}) => {
        const data = mockData[name as keyof typeof mockData] || []
        if (Object.keys(query).length === 0) return data.length

        return data.filter((item: any) => {
          return Object.entries(query).every(([key, value]) => item[key] === value)
        }).length
      },
    }),
  }
}
