"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Upload,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Building2,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdvancedCalendar from "@/components/advanced-calendar"
import ReportsDashboard from "@/components/reports-dashboard"

export default function EmpresaDashboard() {
  const router = useRouter()
  const [profesionales, setProfesionales] = useState([
    {
      id: 1,
      nombre: "Dr. Carlos Mendoza",
      especialidad: "Cardiología",
      email: "carlos.mendoza@clinica.com",
      telefono: "+57 300 123 4567",
      horasSemanales: 40,
      citasSemana: 25,
      estado: "Activo",
      foto: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      nombre: "Dra. Ana García",
      especialidad: "Pediatría",
      email: "ana.garcia@clinica.com",
      telefono: "+57 300 234 5678",
      horasSemanales: 35,
      citasSemana: 30,
      estado: "Activo",
      foto: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      nombre: "Dr. Luis Rodríguez",
      especialidad: "Neurología",
      email: "luis.rodriguez@clinica.com",
      telefono: "+57 300 345 6789",
      horasSemanales: 38,
      citasSemana: 20,
      estado: "Inactivo",
      foto: "/placeholder.svg?height=40&width=40",
    },
  ])

  const [citas, setCitas] = useState([
    {
      id: 1,
      paciente: "María González",
      profesional: "Dr. Carlos Mendoza",
      fecha: "2024-01-15",
      hora: "09:00",
      especialidad: "Cardiología",
      estado: "Confirmada",
      tipo: "Consulta",
    },
    {
      id: 2,
      paciente: "Juan Pérez",
      profesional: "Dra. Ana García",
      fecha: "2024-01-15",
      hora: "10:30",
      especialidad: "Pediatría",
      estado: "Pendiente",
      tipo: "Control",
    },
    {
      id: 3,
      paciente: "Carmen López",
      profesional: "Dr. Luis Rodríguez",
      fecha: "2024-01-15",
      hora: "14:00",
      especialidad: "Neurología",
      estado: "Cancelada",
      tipo: "Consulta",
    },
  ])

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (!userType || !["empresa1", "empresa2", "empresa3"].includes(userType)) {
      router.push("/")
    }
  }, [router])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Activo":
      case "Confirmada":
        return "bg-green-100 text-green-800"
      case "Inactivo":
      case "Cancelada":
        return "bg-red-100 text-red-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Empresa</h1>
                <p className="text-sm text-gray-600">Clínica San Rafael</p>
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
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Profesionales</p>
                  <p className="text-3xl font-bold">{profesionales.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Citas Hoy</p>
                  <p className="text-3xl font-bold">{citas.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Horas Semana</p>
                  <p className="text-3xl font-bold">
                    {profesionales.reduce((acc, prof) => acc + prof.horasSemanales, 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Activos</p>
                  <p className="text-3xl font-bold">{profesionales.filter((p) => p.estado === "Activo").length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profesionales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profesionales">Profesionales</TabsTrigger>
            <TabsTrigger value="citas">Citas</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="profesionales" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Gestión de Profesionales</span>
                    </CardTitle>
                    <CardDescription>Administra los profesionales de tu empresa</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Upload className="w-4 h-4 mr-2" />
                          Carga Masiva
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Carga Masiva de Profesionales</DialogTitle>
                          <DialogDescription>
                            Sube un archivo Excel o CSV con la información de los profesionales
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="file">Archivo Excel/CSV</Label>
                            <Input id="file" type="file" accept=".xlsx,.xls,.csv" />
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Formato: Nombre, Especialidad, Email, Teléfono</span>
                          </div>
                          <Button className="w-full bg-green-600 hover:bg-green-700">Procesar Archivo</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Nuevo Profesional
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profesionales.map((profesional) => (
                    <div
                      key={profesional.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={profesional.foto || "/placeholder.svg"}
                          alt={profesional.nombre}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{profesional.nombre}</h3>
                          <p className="text-sm text-gray-600">{profesional.especialidad}</p>
                          <p className="text-xs text-gray-500">{profesional.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{profesional.horasSemanales}h/semana</p>
                          <p className="text-gray-600">{profesional.citasSemana} citas</p>
                        </div>
                        <Badge className={getEstadoColor(profesional.estado)}>{profesional.estado}</Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="citas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Gestión de Citas</span>
                    </CardTitle>
                    <CardDescription>Administra las citas médicas de tu empresa</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cita
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {citas.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cita.paciente}</h3>
                          <p className="text-sm text-gray-600">
                            {cita.profesional} • {cita.especialidad}
                          </p>
                          <p className="text-xs text-gray-500">
                            {cita.fecha} a las {cita.hora}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{cita.tipo}</p>
                        </div>
                        <Badge className={getEstadoColor(cita.estado)}>{cita.estado}</Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-6">
            <AdvancedCalendar userType="empresa" />
          </TabsContent>

          <TabsContent value="reportes" className="space-y-6">
            <ReportsDashboard userType="empresa" companyId={1} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
