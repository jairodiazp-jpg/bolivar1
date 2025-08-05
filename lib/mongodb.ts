import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not found, using mock data")
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  try {
    if (!process.env.MONGODB_URI) {
      // Retornar mock database si no hay MongoDB
      return getMockDatabase() as any
    }

    const client = await clientPromise
    return client.db("medischedule")
  } catch (error) {
    console.log("MongoDB connection failed, using mock data:", error)
    return getMockDatabase() as any
  }
}

export default clientPromise

// Generar datos de prueba
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
  ]

  const professionals = []

  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const specialty = specialties[Math.floor(Math.random() * specialties.length)]
    const companyId = i <= 50 ? 1 : 2
    const companyName = companyId === 1 ? "Hospital San Rafael" : "Clínica Norte"

    professionals.push({
      _id: i.toString(),
      name: `Dr. ${firstName} ${lastName}`,
      specialty,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyId === 1 ? "sanrafael" : "clinicanorte"}.com`,
      phone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      companyId,
      companyName,
      weeklyHours: Math.floor(Math.random() * 20) + 30,
      weeklyAppointments: Math.floor(Math.random() * 30) + 15,
      status: Math.random() > 0.1 ? "active" : "inactive",
      photo: `/placeholder.svg?height=100&width=100&text=${firstName}`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      totalHoursThisMonth: Math.floor(Math.random() * 80) + 120,
    })
  }

  return professionals
}

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
  ]

  const appointmentTypes = ["Consulta", "Control", "Seguimiento", "Procedimiento", "Urgencia"]
  const statuses = ["confirmed", "pending", "cancelled"]

  for (let i = 1; i <= 200; i++) {
    const professionalId = Math.floor(Math.random() * 100) + 1
    const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * 60) - 30)

    const hour = Math.floor(Math.random() * 10) + 8
    const minute = Math.random() > 0.5 ? "00" : "30"
    const time = `${hour.toString().padStart(2, "0")}:${minute}`

    appointments.push({
      _id: i.toString(),
      patientName,
      patientEmail: `${patientName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      patientPhone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      doctorId: professionalId,
      doctorName: `Dr. ${patientName.split(" ")[0]}`,
      specialty: "Medicina General",
      date: date.toISOString().split("T")[0],
      time,
      duration: [30, 45, 60][Math.floor(Math.random() * 3)],
      type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: Math.random() > 0.5 ? "Paciente requiere seguimiento especial" : "",
      location: `Consultorio ${Math.floor(Math.random() * 50) + 101}`,
      companyId: professionalId <= 50 ? 1 : 2,
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
      professionals: 50,
      monthlyAppointments: 325,
      status: "active",
      createdAt: "2024-01-01",
      description: "Hospital de alta complejidad",
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
      professionals: 50,
      monthlyAppointments: 289,
      status: "active",
      createdAt: "2024-01-01",
      description: "Clínica especializada",
      logo: "/placeholder.svg?height=100&width=100&text=CN",
      website: "https://clinicanorte.com",
      nit: "900.654.321-8",
    },
  ],
}

function getMockDatabase() {
  return {
    collection: (name: string) => ({
      find: (query: any = {}) => ({
        sort: (sortQuery: any) => ({
          skip: (skip: number) => ({
            limit: (limit: number) => ({
              toArray: async () => {
                const data = mockData[name as keyof typeof mockData] || []
                return Array.isArray(data) ? data.slice(skip, skip + limit) : []
              },
            }),
          }),
        }),
        skip: (skip: number) => ({
          limit: (limit: number) => ({
            toArray: async () => {
              const data = mockData[name as keyof typeof mockData] || []
              return Array.isArray(data) ? data.slice(skip, skip + limit) : []
            },
          }),
        }),
        limit: (limit: number) => ({
          toArray: async () => {
            const data = mockData[name as keyof typeof mockData] || []
            return Array.isArray(data) ? data.slice(0, limit) : []
          },
        }),
        toArray: async () => {
          const data = mockData[name as keyof typeof mockData] || []
          if (Object.keys(query).length === 0) return Array.isArray(data) ? data : []

          return Array.isArray(data)
            ? data.filter((item: any) => {
                return Object.entries(query).every(([key, value]) => {
                  if (key === "date" && typeof value === "object" && value.$gte && value.$lte) {
                    return item[key] >= value.$gte && item[key] <= value.$lte
                  }
                  return item[key] === value
                })
              })
            : []
        },
      }),
      findOne: async (query: any) => {
        const data = mockData[name as keyof typeof mockData] || []
        return Array.isArray(data)
          ? data.find((item: any) => {
              return Object.entries(query).every(([key, value]) => item[key] === value)
            })
          : null
      },
      insertOne: async (doc: any) => {
        const data = mockData[name as keyof typeof mockData] as any[]
        if (Array.isArray(data)) {
          const newDoc = { ...doc, _id: (data.length + 1).toString() }
          data.push(newDoc)
          return { insertedId: newDoc._id }
        }
        return { insertedId: "1" }
      },
      updateOne: async (query: any, update: any) => {
        const data = mockData[name as keyof typeof mockData] as any[]
        if (Array.isArray(data)) {
          const index = data.findIndex((item: any) =>
            Object.entries(query).every(([key, value]) => item[key] === value),
          )
          if (index !== -1) {
            data[index] = { ...data[index], ...update.$set }
            return { matchedCount: 1, modifiedCount: 1 }
          }
        }
        return { matchedCount: 0, modifiedCount: 0 }
      },
      deleteOne: async (query: any) => {
        const data = mockData[name as keyof typeof mockData] as any[]
        if (Array.isArray(data)) {
          const index = data.findIndex((item: any) =>
            Object.entries(query).every(([key, value]) => item[key] === value),
          )
          if (index !== -1) {
            data.splice(index, 1)
            return { deletedCount: 1 }
          }
        }
        return { deletedCount: 0 }
      },
      countDocuments: async (query: any = {}) => {
        const data = mockData[name as keyof typeof mockData] || []
        if (!Array.isArray(data)) return 0
        if (Object.keys(query).length === 0) return data.length

        return data.filter((item: any) => {
          return Object.entries(query).every(([key, value]) => item[key] === value)
        }).length
      },
    }),
  }
}
