"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Star, Activity, LogOut, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Appointment {
  id: number
  patientName: string
  date: string
  time: string
  status: "confirmed" | "completed" | "cancelled" | "pending"
  notes: string
}

export default function ProfesionalDashboard() {
  const router = useRouter()
  const [professionalName, setProfessionalName] = useState("Dr. Carlos Mendoza")
  const [stats, setStats] = useState({
    citasHoy: 8,
    citasSemana: 35,
    citasMes: 142,
    horasTrabajadasMes: 168,
    pacientesAtendidos: 134,
    calificacionPromedio: 4.9,
    citasPendientes: 12,
    citasCompletadas: 130,
    citasCanceladas: 8,
    proximaCita: "09:00",
  })

  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const userName = localStorage.getItem("userName")

    if (userType !== "profesional") {
      router.push("/")
      return
    }

    if (userName) {
      setProfessionalName(userName)
    }

    loadAppointments()
  }, [router])

  const loadAppointments = async () => {
    // Simular datos de citas del profesional
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        patientName: "Juan Pérez",
        date: "2024-01-15",
        time: "09:00",
        status: "confirmed",
        notes: "Consulta de control cardiológico",
      },
      {
        id: 2,
        patientName: "María García",
        date: "2024-01-15",
        time: "10:30",
        status: "confirmed",
        notes: "Primera consulta",
      },
      {
        id: 3,
        patientName: "Carlos López",
        date: "2024-01-15",
        time: "11:00",
        status: "pending",
        notes: "Seguimiento post-operatorio",
      },
      {
        id: 4,
        patientName: "Ana Martínez",
        date: "2024-01-15",
        time: "14:00",
        status: "completed",
        notes: "Consulta completada exitosamente",
      },
      {
        id: 5,
        patientName: "Luis Rodríguez",
        date: "2024-01-15",
        time: "15:30",
        status: "cancelled",
        notes: "Paciente canceló por motivos personales",
      },
    ]
    setAppointments(mockAppointments)
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const todayAppointments = appointments.filter((apt) => apt.date === "2024-01-15")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{professionalName}</h1>
                <p className="text-sm text-gray-600">Panel Profesional</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Citas Hoy</p>
                  <p className="text-3xl font-bold">{stats.citasHoy}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Esta Semana</p>
                  <p className="text-3xl font-bold">{stats.citasSemana}</p>
                </div>
                <Clock className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Este Mes</p>
                  <p className="text-3xl font-bold">{stats.citasMes}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Calificación</p>
                  <p className="text-3xl font-bold">{stats.calificacionPromedio}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="hoy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hoy">Citas de Hoy</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="hoy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Citas de Hoy - {new Date().toLocaleDateString("es-ES")}</span>
                </CardTitle>
                <CardDescription>
                  Tienes {todayAppointments.length} citas programadas para hoy. Próxima cita: {stats.proximaCita}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-600">{appointment.time}</p>
                          <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status === "confirmed" && "Confirmada"}
                          {appointment.status === "completed" && "Completada"}
                          {appointment.status === "cancelled" && "Cancelada"}
                          {appointment.status === "pending" && "Pendiente"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Calendario de Citas</span>
                </CardTitle>
                <CardDescription>Vista general de tus citas programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>El calendario interactivo estará disponible próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Citas Completadas</span>
                      <span className="text-lg font-bold text-green-600">{stats.citasCompletadas}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">Citas Pendientes</span>
                      <span className="text-lg font-bold text-yellow-600">{stats.citasPendientes}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Citas Canceladas</span>
                      <span className="text-lg font-bold text-red-600">{stats.citasCanceladas}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Horas Trabajadas</span>
                      <span className="text-lg font-bold text-blue-600">{stats.horasTrabajadasMes}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">{stats.calificacionPromedio}</div>
                      <div className="text-sm text-gray-600">Calificación Promedio</div>
                      <div className="flex justify-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(stats.calificacionPromedio)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{stats.pacientesAtendidos}</div>
                        <div className="text-sm text-gray-600">Pacientes Atendidos</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
