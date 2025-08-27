"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Calendar,
  TrendingUp,
  Activity,
  UserCheck,
  DollarSign,
  BarChart3,
  LogOut,
  Search,
  Plus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import ReportsDashboard from "@/components/reports-dashboard"
import BulkUploadProfessionals from "@/components/bulk-upload-professionals"

interface Professional {
  id: number
  name: string
  specialty: string
  email: string
  phone: string
  status: string
  weeklyHours: number
  rating: string
  totalHoursThisMonth: number
}

export default function EmpresaDashboard() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState("Hospital San Rafael")
  const [companyId, setCompanyId] = useState(1)
  const [stats, setStats] = useState({
    profesionales: 500,
    citasHoy: 125,
    citasMes: 3250,
    ingresosMes: 245000,
    profesionalesActivos: 460,
    citasPendientes: 23,
  })

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const professionalsPerPage = 20

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const storedCompanyId = localStorage.getItem("companyId")

    if (userType !== "empresa") {
      router.push("/")
      return
    }

    if (storedCompanyId) {
      setCompanyId(Number.parseInt(storedCompanyId))
      setCompanyName(storedCompanyId === "1" ? "Hospital San Rafael" : "Clínica Norte")
    }

    loadProfessionals()
  }, [router])

  const loadProfessionals = async () => {
    // Simular datos de profesionales de la empresa
    const mockProfessionals: Professional[] = Array.from({ length: 500 }, (_, i) => ({
      id: i + 1,
      name: `Dr. Profesional ${i + 1}`,
      specialty: ["Cardiología", "Pediatría", "Neurología", "Ginecología", "Dermatología"][i % 5],
      email: `doctor${i + 1}@${companyId === 1 ? "sanrafael" : "clinicanorte"}.com`,
      phone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: Math.random() > 0.1 ? "active" : "inactive",
      weeklyHours: Math.floor(Math.random() * 20) + 30,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      totalHoursThisMonth: Math.floor(Math.random() * 80) + 120,
    }))
    setProfessionals(mockProfessionals)
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("companyId")
    router.push("/")
  }

  const handleBulkUploadComplete = (results: any[]) => {
    const successCount = results.filter((r) => r.success).length
    setStats((prev) => ({
      ...prev,
      profesionales: prev.profesionales + successCount,
      profesionalesActivos: prev.profesionalesActivos + successCount,
    }))
    loadProfessionals()
  }

  const filteredProfessionals = professionals.filter(
    (prof) =>
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedProfessionals = filteredProfessionals.slice(
    (currentPage - 1) * professionalsPerPage,
    currentPage * professionalsPerPage,
  )

  const totalPages = Math.ceil(filteredProfessionals.length / professionalsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
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
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
                <p className="text-sm text-gray-600">Panel de Administración</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Profesionales</p>
                  <p className="text-3xl font-bold">{stats.profesionales}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Citas Hoy</p>
                  <p className="text-3xl font-bold">{stats.citasHoy}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Citas Mes</p>
                  <p className="text-3xl font-bold">{stats.citasMes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Ingresos</p>
                  <p className="text-2xl font-bold">${stats.ingresosMes.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Activos</p>
                  <p className="text-3xl font-bold">{stats.profesionalesActivos}</p>
                </div>
                <UserCheck className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold">{stats.citasPendientes}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profesionales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profesionales">Profesionales</TabsTrigger>
            <TabsTrigger value="citas">Citas</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="profesionales" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Gestión de Profesionales ({filteredProfessionals.length})</span>
                    </CardTitle>
                    <CardDescription>Administra los profesionales de tu empresa</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <BulkUploadProfessionals companyId={companyId} onUploadComplete={handleBulkUploadComplete} />
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Profesional
                    </Button>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar profesionales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profesional</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Horas/Mes</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProfessionals.map((professional) => (
                      <TableRow key={professional.id}>
                        <TableCell className="font-medium">{professional.name}</TableCell>
                        <TableCell>{professional.specialty}</TableCell>
                        <TableCell className="text-sm text-gray-600">{professional.email}</TableCell>
                        <TableCell>{professional.totalHoursThisMonth}h</TableCell>
                        <TableCell>
                          <span className="text-yellow-600">★ {professional.rating}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(professional.status)}>
                            {professional.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {(currentPage - 1) * professionalsPerPage + 1} a{" "}
                    {Math.min(currentPage * professionalsPerPage, filteredProfessionals.length)} de{" "}
                    {filteredProfessionals.length} profesionales
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                      {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="citas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Gestión de Citas</span>
                </CardTitle>
                <CardDescription>Administra las citas médicas de tu empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>El sistema de gestión de citas estará disponible próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reportes" className="space-y-6">
            <ReportsDashboard userType="empresa" companyId={companyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
