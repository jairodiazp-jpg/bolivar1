"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Activity,
  UserCheck,
  DollarSign,
  BarChart3,
  PieChart,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import ReportsDashboard from "@/components/reports-dashboard"
import BulkUploadProfessionals from "@/components/bulk-upload-professionals"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalEmpresas: 2,
    totalProfesionales: 1000,
    citasHoy: 247,
    citasMes: 6140,
    ingresosMes: 485000,
    profesionalesActivos: 920,
  })

  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: "Hospital San Rafael",
      email: "admin@sanrafael.com",
      phone: "+57 1 234 5678",
      address: "Calle 123 #45-67, Bogotá",
      professionals: 500,
      monthlyAppointments: 3250,
      status: "active",
      description: "Hospital de alta complejidad con más de 20 especialidades médicas",
      nit: "900.123.456-7",
      website: "https://sanrafael.com",
    },
    {
      id: 2,
      name: "Clínica Norte",
      email: "admin@clinicanorte.com",
      phone: "+57 1 345 6789",
      address: "Carrera 78 #90-12, Bogotá",
      professionals: 500,
      monthlyAppointments: 2890,
      status: "active",
      description: "Clínica especializada en medicina preventiva y diagnóstica",
      nit: "900.654.321-8",
      website: "https://clinicanorte.com",
    },
  ])

  const [professionals, setProfessionals] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false)
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    nit: "",
    website: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const professionalsPerPage = 20

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "admin") {
      router.push("/")
    }

    // Simular carga de profesionales
    loadProfessionals()
  }, [router])

  const loadProfessionals = async () => {
    // Simular datos de profesionales
    const mockProfessionals = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Dr. Profesional ${i + 1}`,
      specialty: ["Cardiología", "Pediatría", "Neurología", "Ginecología", "Dermatología"][i % 5],
      email: `doctor${i + 1}@${i < 500 ? "sanrafael" : "clinicanorte"}.com`,
      phone: `+57 300 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      companyId: i < 500 ? 1 : 2,
      companyName: i < 500 ? "Hospital San Rafael" : "Clínica Norte",
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
    router.push("/")
  }

  const handleCreateCompany = () => {
    const newId = Math.max(...companies.map((c) => c.id)) + 1
    const companyToAdd = {
      ...newCompany,
      id: newId,
      professionals: 0,
      monthlyAppointments: 0,
      status: "active",
    }
    setCompanies([...companies, companyToAdd])
    setNewCompany({
      name: "",
      email: "",
      phone: "",
      address: "",
      description: "",
      nit: "",
      website: "",
    })
    setIsCreateCompanyOpen(false)
  }

  const handleEditCompany = () => {
    if (editingCompany) {
      setCompanies(companies.map((c) => (c.id === editingCompany.id ? editingCompany : c)))
      setIsEditCompanyOpen(false)
      setEditingCompany(null)
    }
  }

  const handleDeleteCompany = (id) => {
    setCompanies(companies.filter((c) => c.id !== id))
  }

  const handleBulkUploadComplete = (results) => {
    // Actualizar estadísticas después de la carga masiva
    const successCount = results.filter((r) => r.success).length
    setStats((prev) => ({
      ...prev,
      totalProfesionales: prev.totalProfesionales + successCount,
      profesionalesActivos: prev.profesionalesActivos + successCount,
    }))

    // Recargar la lista de profesionales
    loadProfessionals()
  }

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = selectedCompany === "" || prof.companyId.toString() === selectedCompany
    return matchesSearch && matchesCompany
  })

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
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
                <p className="text-sm text-gray-600">Sistema de Agendamiento Médico</p>
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
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Empresas</p>
                  <p className="text-3xl font-bold">{stats.totalEmpresas}</p>
                </div>
                <Building2 className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Profesionales</p>
                  <p className="text-3xl font-bold">{stats.totalProfesionales}</p>
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
        </div>

        {/* Main Content */}
        <Tabs defaultValue="empresas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="profesionales">Profesionales</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="empresas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>Gestión de Empresas</span>
                    </CardTitle>
                    <CardDescription>Administra las empresas registradas en el sistema</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <BulkUploadProfessionals onUploadComplete={handleBulkUploadComplete} />
                    <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Empresa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Crear Nueva Empresa</DialogTitle>
                          <DialogDescription>
                            Completa la información para registrar una nueva empresa médica
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Empresa *</Label>
                            <Input
                              id="name"
                              value={newCompany.name}
                              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                              placeholder="Hospital o Clínica"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nit">NIT *</Label>
                            <Input
                              id="nit"
                              value={newCompany.nit}
                              onChange={(e) => setNewCompany({ ...newCompany, nit: e.target.value })}
                              placeholder="900.123.456-7"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Corporativo *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newCompany.email}
                              onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                              placeholder="admin@empresa.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono *</Label>
                            <Input
                              id="phone"
                              value={newCompany.phone}
                              onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                              placeholder="+57 1 234 5678"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Sitio Web</Label>
                            <Input
                              id="website"
                              value={newCompany.website}
                              onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                              placeholder="https://empresa.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Dirección *</Label>
                            <Input
                              id="address"
                              value={newCompany.address}
                              onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                              placeholder="Calle 123 #45-67, Ciudad"
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              value={newCompany.description}
                              onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                              placeholder="Descripción de la empresa y servicios"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setIsCreateCompanyOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleCreateCompany}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!newCompany.name || !newCompany.email || !newCompany.phone}
                          >
                            Crear Empresa
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-600">{company.email}</p>
                          <p className="text-sm text-gray-600">{company.phone}</p>
                          <p className="text-xs text-gray-500 mt-1">{company.address}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm font-medium text-green-600">
                              {company.professionals} profesionales
                            </span>
                            <span className="text-sm text-gray-500">{company.monthlyAppointments} citas/mes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {company.status === "active" ? "Activa" : "Inactiva"}
                        </Badge>
                        <BulkUploadProfessionals companyId={company.id} onUploadComplete={handleBulkUploadComplete} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCompany(company)
                            setIsEditCompanyOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profesionales" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Gestión de Profesionales ({filteredProfessionals.length})</span>
                    </CardTitle>
                    <CardDescription>Administra todos los profesionales del sistema</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <BulkUploadProfessionals onUploadComplete={handleBulkUploadComplete} />
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar profesionales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Todas las empresas</option>
                      <option value="1">Hospital San Rafael</option>
                      <option value="2">Clínica Norte</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profesional</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Empresa</TableHead>
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
                        <TableCell>{professional.companyName}</TableCell>
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

          <TabsContent value="metricas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Distribución por Empresa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-blue-900">Hospital San Rafael</h4>
                        <p className="text-sm text-blue-600">500 profesionales • 3,250 citas/mes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">52.9%</p>
                        <p className="text-xs text-blue-500">del total</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-green-900">Clínica Norte</h4>
                        <p className="text-sm text-green-600">500 profesionales • 2,890 citas/mes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">47.1%</p>
                        <p className="text-xs text-green-500">del total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Top Especialidades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Cardiología", count: 120, color: "bg-red-500" },
                      { name: "Pediatría", count: 115, color: "bg-blue-500" },
                      { name: "Neurología", count: 98, color: "bg-purple-500" },
                      { name: "Ginecología", count: 87, color: "bg-pink-500" },
                      { name: "Dermatología", count: 76, color: "bg-orange-500" },
                    ].map((specialty) => (
                      <div key={specialty.name} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${specialty.color} rounded-full`}></div>
                        <div className="flex-1 flex justify-between">
                          <span className="text-sm font-medium">{specialty.name}</span>
                          <span className="text-sm text-gray-600">{specialty.count} profesionales</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reportes" className="space-y-6">
            <ReportsDashboard userType="admin" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Company Dialog */}
      <Dialog open={isEditCompanyOpen} onOpenChange={setIsEditCompanyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>Modifica la información de la empresa</DialogDescription>
          </DialogHeader>
          {editingCompany && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre de la Empresa</Label>
                <Input
                  id="edit-name"
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nit">NIT</Label>
                <Input
                  id="edit-nit"
                  value={editingCompany.nit}
                  onChange={(e) => setEditingCompany({ ...editingCompany, nit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingCompany.email}
                  onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={editingCompany.phone}
                  onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Sitio Web</Label>
                <Input
                  id="edit-website"
                  value={editingCompany.website}
                  onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input
                  id="edit-address"
                  value={editingCompany.address}
                  onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editingCompany.description}
                  onChange={(e) => setEditingCompany({ ...editingCompany, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditCompanyOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditCompany} className="bg-green-600 hover:bg-green-700">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
