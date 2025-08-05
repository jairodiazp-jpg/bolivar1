"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react"

interface Appointment {
  id: number
  date: string
  time: string
  duration: number
  patient: string
  patientEmail: string
  patientPhone: string
  doctor: string
  doctorId: number
  specialty: string
  status: "confirmed" | "pending" | "cancelled"
  type: string
  notes?: string
  location?: string
}

interface CalendarProps {
  appointments?: Appointment[]
  onAppointmentCreate?: (appointment: Omit<Appointment, "id">) => void
  onAppointmentUpdate?: (id: number, appointment: Partial<Appointment>) => void
  onAppointmentDelete?: (id: number) => void
  userType?: "admin" | "empresa" | "profesional"
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    date: "2024-01-15",
    time: "09:00",
    duration: 30,
    patient: "María González",
    patientEmail: "maria.gonzalez@email.com",
    patientPhone: "+57 300 111 2222",
    doctor: "Dr. Carlos Mendoza",
    doctorId: 1,
    specialty: "Cardiología",
    status: "confirmed",
    type: "Consulta",
    notes: "Control rutinario",
    location: "Consultorio 201",
  },
  {
    id: 2,
    date: "2024-01-15",
    time: "10:30",
    duration: 45,
    patient: "Juan Pérez",
    patientEmail: "juan.perez@email.com",
    patientPhone: "+57 300 333 4444",
    doctor: "Dra. Ana García",
    doctorId: 2,
    specialty: "Pediatría",
    status: "pending",
    type: "Control",
    notes: "Vacunación",
    location: "Consultorio 105",
  },
  {
    id: 3,
    date: "2024-01-16",
    time: "14:00",
    duration: 60,
    patient: "Carmen López",
    patientEmail: "carmen.lopez@email.com",
    patientPhone: "+57 300 555 6666",
    doctor: "Dr. Luis Rodríguez",
    doctorId: 3,
    specialty: "Neurología",
    status: "confirmed",
    type: "Consulta",
    notes: "Primera consulta",
    location: "Consultorio 301",
  },
  {
    id: 4,
    date: "2024-01-17",
    time: "11:00",
    duration: 30,
    patient: "Roberto Silva",
    patientEmail: "roberto.silva@email.com",
    patientPhone: "+57 300 777 8888",
    doctor: "Dr. Carlos Mendoza",
    doctorId: 1,
    specialty: "Cardiología",
    status: "cancelled",
    type: "Seguimiento",
    notes: "Paciente canceló",
    location: "Consultorio 201",
  },
  {
    id: 5,
    date: "2024-01-18",
    time: "15:30",
    duration: 45,
    patient: "Ana Martínez",
    patientEmail: "ana.martinez@email.com",
    patientPhone: "+57 300 999 0000",
    doctor: "Dra. María López",
    doctorId: 4,
    specialty: "Ginecología",
    status: "confirmed",
    type: "Consulta",
    notes: "Control anual",
    location: "Consultorio 402",
  },
]

export default function AdvancedCalendar({
  appointments = mockAppointments,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
  userType = "empresa",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null)
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: "",
    time: "",
    duration: 30,
    patient: "",
    patientEmail: "",
    patientPhone: "",
    doctor: "",
    doctorId: 0,
    specialty: "",
    status: "pending",
    type: "Consulta",
    notes: "",
    location: "",
  })

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter((apt) => apt.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      Cardiología: "bg-rose-50 border-l-rose-400 text-rose-800",
      Pediatría: "bg-blue-50 border-l-blue-400 text-blue-800",
      Neurología: "bg-purple-50 border-l-purple-400 text-purple-800",
      Ginecología: "bg-pink-50 border-l-pink-400 text-pink-800",
      Dermatología: "bg-orange-50 border-l-orange-400 text-orange-800",
      Oftalmología: "bg-cyan-50 border-l-cyan-400 text-cyan-800",
      Traumatología: "bg-emerald-50 border-l-emerald-400 text-emerald-800",
      Psiquiatría: "bg-indigo-50 border-l-indigo-400 text-indigo-800",
      Urología: "bg-teal-50 border-l-teal-400 text-teal-800",
    }
    return colors[specialty as keyof typeof colors] || "bg-gray-50 border-l-gray-400 text-gray-800"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault()
    if (draggedAppointment && targetDate !== draggedAppointment.date) {
      onAppointmentUpdate?.(draggedAppointment.id, { date: targetDate })
      setDraggedAppointment(null)
    }
  }

  const handleCreateAppointment = () => {
    if (newAppointment.patient && newAppointment.date && newAppointment.time) {
      onAppointmentCreate?.(newAppointment as Omit<Appointment, "id">)
      setNewAppointment({
        date: "",
        time: "",
        duration: 30,
        patient: "",
        patientEmail: "",
        patientPhone: "",
        doctor: "",
        doctorId: 0,
        specialty: "",
        status: "pending",
        type: "Consulta",
        notes: "",
        location: "",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      onAppointmentUpdate?.(selectedAppointment.id, selectedAppointment)
      setIsEditDialogOpen(false)
      setSelectedAppointment(null)
    }
  }

  const handleDeleteAppointment = (id: number) => {
    onAppointmentDelete?.(id)
    setIsEditDialogOpen(false)
    setSelectedAppointment(null)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return [`${hour}:00`, `${hour}:30`]
  }).flat()

  const doctors = [
    { id: 1, name: "Dr. Carlos Mendoza", specialty: "Cardiología" },
    { id: 2, name: "Dra. Ana García", specialty: "Pediatría" },
    { id: 3, name: "Dr. Luis Rodríguez", specialty: "Neurología" },
    { id: 4, name: "Dra. María López", specialty: "Ginecología" },
    { id: 5, name: "Dr. Fernando Castro", specialty: "Dermatología" },
  ]

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
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Cita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Cita</DialogTitle>
                      <DialogDescription>
                        Completa la información para programar una nueva cita médica
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient">Nombre del Paciente *</Label>
                        <Input
                          id="patient"
                          value={newAppointment.patient}
                          onChange={(e) => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                          placeholder="Nombre completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientEmail">Email del Paciente *</Label>
                        <Input
                          id="patientEmail"
                          type="email"
                          value={newAppointment.patientEmail}
                          onChange={(e) => setNewAppointment({ ...newAppointment, patientEmail: e.target.value })}
                          placeholder="email@ejemplo.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientPhone">Teléfono del Paciente</Label>
                        <Input
                          id="patientPhone"
                          value={newAppointment.patientPhone}
                          onChange={(e) => setNewAppointment({ ...newAppointment, patientPhone: e.target.value })}
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Profesional *</Label>
                        <Select
                          value={newAppointment.doctor}
                          onValueChange={(value) => {
                            const selectedDoctor = doctors.find((d) => d.name === value)
                            setNewAppointment({
                              ...newAppointment,
                              doctor: value,
                              doctorId: selectedDoctor?.id || 0,
                              specialty: selectedDoctor?.specialty || "",
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar profesional" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.name}>
                                {doctor.name} - {doctor.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidad</Label>
                        <Select
                          value={newAppointment.specialty}
                          onValueChange={(value) => setNewAppointment({ ...newAppointment, specialty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar especialidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora *</Label>
                        <Select
                          value={newAppointment.time}
                          onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duración (minutos)</Label>
                        <Select
                          value={newAppointment.duration?.toString()}
                          onValueChange={(value) =>
                            setNewAppointment({ ...newAppointment, duration: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Duración" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="45">45 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1.5 horas</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Cita</Label>
                        <Select
                          value={newAppointment.type}
                          onValueChange={(value) => setNewAppointment({ ...newAppointment, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Consulta">Consulta</SelectItem>
                            <SelectItem value="Control">Control</SelectItem>
                            <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                            <SelectItem value="Procedimiento">Procedimiento</SelectItem>
                            <SelectItem value="Urgencia">Urgencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={newAppointment.location}
                          onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                          placeholder="Consultorio, piso, etc."
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                          id="notes"
                          value={newAppointment.notes}
                          onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                          placeholder="Información adicional, preparación especial, etc."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateAppointment}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={
                          !newAppointment.patient ||
                          !newAppointment.date ||
                          !newAppointment.time ||
                          !newAppointment.patientEmail
                        }
                      >
                        Crear Cita
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-2 h-32"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayAppointments = getAppointmentsForDate(dateStr)
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === "2024-01-15" // Simulated current date
                const isPastDate = new Date(dateStr) < new Date("2024-01-15")

                return (
                  <div
                    key={day}
                    className={`p-2 h-32 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? "bg-green-50 border-green-200" : "border-gray-200"
                    } ${isToday ? "bg-blue-50 border-blue-200" : ""} ${isPastDate ? "bg-gray-50 opacity-60" : ""}`}
                    onClick={() => setSelectedDate(dateStr)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? "text-blue-600" : isPastDate ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-24">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-xs p-2 rounded border-l-2 cursor-move transition-all hover:shadow-md ${getSpecialtyColor(apt.specialty)}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, apt)}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAppointment(apt)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <div className="font-medium truncate">{apt.time}</div>
                          <div className="truncate">{apt.patient}</div>
                          <div className="truncate text-xs opacity-75">{apt.doctor}</div>
                          <Badge className={`text-xs ${getStatusColor(apt.status)}`} size="sm">
                            {apt.status === "confirmed" ? "Conf." : apt.status === "pending" ? "Pend." : "Canc."}
                          </Badge>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium text-center py-1">
                          +{dayAppointments.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>
                {selectedDate
                  ? `Citas del ${new Date(selectedDate).toLocaleDateString("es-ES")}`
                  : "Selecciona una fecha"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {getAppointmentsForDate(selectedDate).length > 0 ? (
                  getAppointmentsForDate(selectedDate).map((apt) => (
                    <div key={apt.id} className="p-4 border rounded-lg space-y-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">{apt.time}</span>
                        <Badge className={getStatusColor(apt.status)}>
                          {apt.status === "confirmed"
                            ? "Confirmada"
                            : apt.status === "pending"
                              ? "Pendiente"
                              : "Cancelada"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{apt.patient}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{apt.patientEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{apt.patientPhone}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {apt.doctor} • {apt.specialty}
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{apt.location}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Tipo: {apt.type} • Duración: {apt.duration} min
                        </div>
                        {apt.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Notas:</strong> {apt.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay citas programadas para esta fecha</p>
                    <Button
                      className="mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setNewAppointment({ ...newAppointment, date: selectedDate })
                        setIsCreateDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Cita
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona una fecha en el calendario para ver las citas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Leyenda de Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: "Cardiología", color: "border-l-rose-400 bg-rose-50" },
                { name: "Pediatría", color: "border-l-blue-400 bg-blue-50" },
                { name: "Neurología", color: "border-l-purple-400 bg-purple-50" },
                { name: "Ginecología", color: "border-l-pink-400 bg-pink-50" },
                { name: "Dermatología", color: "border-l-orange-400 bg-orange-50" },
                { name: "Oftalmología", color: "border-l-cyan-400 bg-cyan-50" },
              ].map((specialty) => (
                <div key={specialty.name} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 border-l-2 ${specialty.color} rounded-sm`}></div>
                  <span className="text-sm">{specialty.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
            <DialogDescription>Modifica la información de la cita médica</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-patient">Nombre del Paciente</Label>
                <Input
                  id="edit-patient"
                  value={selectedAppointment.patient}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, patient: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patientEmail">Email del Paciente</Label>
                <Input
                  id="edit-patientEmail"
                  type="email"
                  value={selectedAppointment.patientEmail}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, patientEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patientPhone">Teléfono del Paciente</Label>
                <Input
                  id="edit-patientPhone"
                  value={selectedAppointment.patientPhone}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, patientPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-doctor">Profesional</Label>
                <Select
                  value={selectedAppointment.doctor}
                  onValueChange={(value) => {
                    const selectedDoctor = doctors.find((d) => d.name === value)
                    setSelectedAppointment({
                      ...selectedAppointment,
                      doctor: value,
                      doctorId: selectedDoctor?.id || selectedAppointment.doctorId,
                      specialty: selectedDoctor?.specialty || selectedAppointment.specialty,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={selectedAppointment.date}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Hora</Label>
                <Select
                  value={selectedAppointment.time}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duración</Label>
                <Select
                  value={selectedAppointment.duration.toString()}
                  onValueChange={(value) =>
                    setSelectedAppointment({ ...selectedAppointment, duration: Number.parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1.5 horas</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(value: "confirmed" | "pending" | "cancelled") =>
                    setSelectedAppointment({ ...selectedAppointment, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  value={selectedAppointment.type}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="Procedimiento">Procedimiento</SelectItem>
                    <SelectItem value="Urgencia">Urgencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  value={selectedAppointment.location}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, location: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Textarea
                  id="edit-notes"
                  value={selectedAppointment.notes}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 bg-transparent"
              onClick={() => selectedAppointment && handleDeleteAppointment(selectedAppointment.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
            <Button onClick={handleEditAppointment} className="bg-green-600 hover:bg-green-700">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
