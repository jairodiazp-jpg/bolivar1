"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Save,
  Edit,
} from "lucide-react"
import { useRouter } from "next/navigation"
import ProfessionalCalendar from "@/components/professional-calendar"

export default function ProfesionalDashboard() {
  const router = useRouter()
  const [profesional] = useState({
    nombre: "Dr. Carlos Mendoza",
    especialidad: "Cardiología",
    email: "carlos.mendoza@sanrafael.com",
    telefono: "+57 300 123 4567",
    direccion: "Hospital San Rafael, Piso 3",
    foto: "/placeholder.svg?height=100&width=100",
    horasSemanales: 40,
    citasHoy: 8,
    citasSemana: 25,
    rating: 4.9,
    empresa: "Hospital San Rafael",
    totalHorasEsteMes: 168,
  })

  const [citasHoy] = useState([
    {
      id: 1,
      paciente: "María González",
      hora: "09:00",
      tipo: "Consulta",
      estado: "Confirmada",
      telefono: "+57 300 111 2222",
      duracion: 30,
    },
    {
      id: 2,
      paciente: "Juan Pérez",
      hora: "10:30",
      tipo: "Control",
      estado: "Pendiente",
      telefono: "+57 300 333 4444",
      duracion: 45,
    },
    {
      id: 3,
      paciente: "Carmen López",
      hora: "11:00",
      tipo: "Consulta",
      estado: "Confirmada",
      telefono: "+57 300 555 6666",
      duracion: 30,
    },
    {
      id: 4,
      paciente: "Roberto Silva",
      hora: "14:00",
      tipo: "Seguimiento",
      estado: "Cancelada",
      telefono: "+57 300 777 8888",
      duracion: 30,
    },
    {
      id: 5,
      paciente: "Ana Martínez",
      hora: "15:30",
      tipo: "Consulta",
      estado: "Confirmada",
      telefono: "+57 300 999 0000",
      duracion: 45,
    },
  ])

  const [horasTrabajadas, setHorasTrabajadas] = useState([
    { fecha: "2024-01-15", horasInicio: "08:00", horasFin: "17:00", totalHoras: 9, citas: 8, estado: "Completado" },
    { fecha: "2024-01-14", horasInicio: "08:00", horasFin: "16:00", totalHoras: 8, citas: 6, estado: "Completado" },
    { fecha: "2024-01-13", horasInicio: "09:00", horasFin: "18:00", totalHoras: 9, citas: 7, estado: "Completado" },
    { fecha: "2024-01-12", horasInicio: "08:30", horasFin: "17:30", totalHoras: 9, citas: 9, estado: "Completado" },
    { fecha: "2024-01-11", horasInicio: "08:00", horasFin: "16:30", totalHoras: 8.5, citas: 5, estado: "Completado" },
  ])

  const [isAddHoursOpen, setIsAddHoursOpen] = useState(false)
  const [newWorkDay, setNewWorkDay] = useState({
    fecha: "",
    horasInicio: "",
    horasFin: "",
    citas: 0,
    notas: "",
  })

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const handleAddWorkHours = () => {
    if (newWorkDay.fecha && newWorkDay.horasInicio && newWorkDay.horasFin) {
      const startTime = new Date(`2024-01-01 ${newWorkDay.horasInicio}`)
      const endTime = new Date(`2024-01-01 ${newWorkDay.horasFin}`)
      const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

      const newEntry = {
        fecha: newWorkDay.fecha,
        horasInicio: newWorkDay.horasInicio,
        horasFin: newWorkDay.horasFin,
        totalHoras: totalHours,
        citas: newWorkDay.citas,
        estado: "Completado",
        notas: newWorkDay.notas,
      }

      setHorasTrabajadas([newEntry, ...horasTrabajadas])
      setNewWorkDay({
        fecha: "",
        horasInicio: "",
        horasFin: "",
        citas: 0,
        notas: "",
      })
      setIsAddHoursOpen(false)
    }
  }

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "profesional") {
      router.push("/")
    }
  }, [router])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Confirmada":
        return "bg-green-100 text-green-800"
      case "Cancelada":
        return "bg-red-100 text-red-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Confirmada":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Cancelada":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "Pendiente":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Profesional</h1>
                <p className="text-sm text-gray-600">{profesional.nombre}</p>
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
        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profesional.foto || "/placeholder.svg"} alt={profesional.nombre} />
                <AvatarFallback className="text-2xl bg-green-100 text-green-600">
                  {profesional.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profesional.nombre}</h2>
                <p className="text-lg text-green-600 font-medium">{profesional.especialidad}</p>
                <p className="text-sm text-gray-600 mb-2">{profesional.empresa}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profesional.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{profesional.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profesional.direccion}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">★ {profesional.rating}</div>
                <p className="text-sm text-gray-600">Calificación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Citas Hoy</p>
                  <p className="text-3xl font-bold">{profesional.citasHoy}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Citas Semana</p>
                  <p className="text-3xl font-bold">{profesional.citasSemana}</p>
                </div>
                <User className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Horas Mes</p>
                  <p className="text-3xl font-bold">{profesional.totalHorasEsteMes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Calificación</p>
                  <p className="text-3xl font-bold">{profesional.rating}</p>
                </div>
                <Stethoscope className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agenda-profesional" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="agenda-profesional">Agenda Profesional</TabsTrigger>
            <TabsTrigger value="agenda">Mi Agenda</TabsTrigger>
            <TabsTrigger value="horas">Horas Laborales</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda-profesional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Agenda Profesional</span>
                </CardTitle>
                <CardDescription>Vista completa de la agenda médica con todos los profesionales</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[800px]">
                  <ProfessionalCalendar />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Citas de Hoy</span>
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {citasHoy.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cita.paciente}</h3>
                          <p className="text-sm text-gray-600">
                            {cita.tipo} • {cita.duracion} min
                          </p>
                          <p className="text-xs text-gray-500">{cita.telefono}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg text-gray-900">{cita.hora}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(cita.estado)}
                          <Badge className={getEstadoColor(cita.estado)}>{cita.estado}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Registro de Horas Laborales</span>
                    </CardTitle>
                    <CardDescription>Gestiona y registra tus horas de trabajo diarias</CardDescription>
                  </div>
                  <Dialog open={isAddHoursOpen} onOpenChange={setIsAddHoursOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Horas
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Horas Laborales</DialogTitle>
                        <DialogDescription>Registra las horas trabajadas en un día específico</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fecha">Fecha *</Label>
                          <Input
                            id="fecha"
                            type="date"
                            value={newWorkDay.fecha}
                            onChange={(e) => setNewWorkDay({ ...newWorkDay, fecha: e.target.value })}
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="horasInicio">Hora de Inicio *</Label>
                            <Input
                              id="horasInicio"
                              type="time"
                              value={newWorkDay.horasInicio}
                              onChange={(e) => setNewWorkDay({ ...newWorkDay, horasInicio: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="horasFin">Hora de Fin *</Label>
                            <Input
                              id="horasFin"
                              type="time"
                              value={newWorkDay.horasFin}
                              onChange={(e) => setNewWorkDay({ ...newWorkDay, horasFin: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="citas">Número de Citas Atendidas</Label>
                          <Input
                            id="citas"
                            type="number"
                            min="0"
                            value={newWorkDay.citas}
                            onChange={(e) =>
                              setNewWorkDay({ ...newWorkDay, citas: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notas">Notas (Opcional)</Label>
                          <Input
                            id="notas"
                            value={newWorkDay.notas}
                            onChange={(e) => setNewWorkDay({ ...newWorkDay, notas: e.target.value })}
                            placeholder="Observaciones del día..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setIsAddHoursOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddWorkHours}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!newWorkDay.fecha || !newWorkDay.horasInicio || !newWorkDay.horasFin}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Registrar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora Inicio</TableHead>
                      <TableHead>Hora Fin</TableHead>
                      <TableHead>Total Horas</TableHead>
                      <TableHead>Citas</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horasTrabajadas.map((dia, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {new Date(dia.fecha).toLocaleDateString("es-ES", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{dia.horasInicio}</TableCell>
                        <TableCell>{dia.horasFin}</TableCell>
                        <TableCell className="font-semibold">{dia.totalHoras}h</TableCell>
                        <TableCell>{dia.citas}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {dia.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Resumen mensual */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Resumen del Mes</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{profesional.totalHorasEsteMes}h</p>
                      <p className="text-sm text-gray-600">Total Horas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{horasTrabajadas.length}</p>
                      <p className="text-sm text-gray-600">Días Trabajados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {horasTrabajadas.reduce((acc, dia) => acc + dia.citas, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Citas Atendidas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Mi Calendario Personal</span>
                </CardTitle>
                <CardDescription>Vista de calendario con mis citas personales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Vista de calendario personal - En desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Mi Perfil Profesional</span>
                </CardTitle>
                <CardDescription>Información personal y profesional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nombre Completo</Label>
                      <p className="text-lg font-semibold text-gray-900">{profesional.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Especialidad</Label>
                      <p className="text-lg text-green-600">{profesional.especialidad}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Empresa</Label>
                      <p className="text-lg text-gray-900">{profesional.empresa}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Calificación Promedio</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl text-yellow-500">★</span>
                        <span className="text-lg font-semibold">{profesional.rating}/5.0</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Corporativo</Label>
                      <p className="text-lg text-gray-900">{profesional.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
                      <p className="text-lg text-gray-900">{profesional.telefono}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Ubicación</Label>
                      <p className="text-lg text-gray-900">{profesional.direccion}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Horas Semanales</Label>
                      <p className="text-lg font-semibold text-blue-600">{profesional.horasSemanales}h</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
