"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  CreditCard,
  FileText,
  Plus,
  RefreshCw,
  Maximize2,
  Printer,
  Search,
} from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorName: string
  doctorId: string
  appointmentType: string
  startTime: string
  endTime: string
  date: string
  status: "confirmed" | "pending" | "cancelled"
  notes?: string
  color: string
}

interface Doctor {
  id: string
  name: string
  specialty: string
  avatar: string
}

const doctors: Doctor[] = [
  { id: "1", name: "Matías García", specialty: "Cardiología", avatar: "/placeholder.svg?height=40&width=40&text=MG" },
  { id: "2", name: "Sofía Reyes", specialty: "Pediatría", avatar: "/placeholder.svg?height=40&width=40&text=SR" },
  {
    id: "3",
    name: "Andrea Fuenzalida",
    specialty: "Neurología",
    avatar: "/placeholder.svg?height=40&width=40&text=AF",
  },
  {
    id: "4",
    name: "Catalina Fuentes",
    specialty: "Ginecología",
    avatar: "/placeholder.svg?height=40&width=40&text=CF",
  },
  { id: "5", name: "Gabriel Ortiz", specialty: "Dermatología", avatar: "/placeholder.svg?height=40&width=40&text=GO" },
]

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Bárbara Troncoso",
    patientPhone: "+569 1234 5467",
    patientEmail: "barbara.troncoso@email.com",
    doctorName: "Matías García",
    doctorId: "1",
    appointmentType: "Segunda consulta",
    startTime: "10:00",
    endTime: "12:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-blue-200 border-l-blue-500",
  },
  {
    id: "2",
    patientName: "Patricia Fuenzalida",
    patientPhone: "+569 8765 4321",
    patientEmail: "patricia.fuenzalida@email.com",
    doctorName: "Andrea Fuenzalida",
    doctorId: "3",
    appointmentType: "Primera consulta",
    startTime: "09:00",
    endTime: "11:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-green-200 border-l-green-500",
  },
  {
    id: "3",
    patientName: "Antonia Cardona",
    patientPhone: "+569 1234 5467",
    patientEmail: "antocardona@gmail.com",
    doctorName: "Sofía Reyes",
    doctorId: "2",
    appointmentType: "Primera consulta",
    startTime: "11:00",
    endTime: "13:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-yellow-200 border-l-yellow-500",
    notes: "Ana prefiere estacionar en el -1",
  },
  {
    id: "4",
    patientName: "Laila Serrano",
    patientPhone: "+569 9876 5432",
    patientEmail: "laila.serrano@email.com",
    doctorName: "Catalina Fuentes",
    doctorId: "4",
    appointmentType: "Segunda cita",
    startTime: "10:00",
    endTime: "11:30",
    date: "2024-05-06",
    status: "pending",
    color: "bg-pink-200 border-l-pink-500",
  },
  {
    id: "5",
    patientName: "Macarena Rial",
    patientPhone: "+569 5555 1234",
    patientEmail: "macarena.rial@email.com",
    doctorName: "Gabriel Ortiz",
    doctorId: "5",
    appointmentType: "Primera cita",
    startTime: "09:00",
    endTime: "10:30",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-green-300 border-l-green-600",
  },
  {
    id: "6",
    patientName: "Eloi Zurita",
    patientPhone: "+569 7777 8888",
    patientEmail: "eloi.zurita@email.com",
    doctorName: "Gabriel Ortiz",
    doctorId: "5",
    appointmentType: "Control post operatorio",
    startTime: "11:00",
    endTime: "13:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-blue-300 border-l-blue-600",
  },
  {
    id: "7",
    patientName: "José Molero",
    patientPhone: "+569 3333 4444",
    patientEmail: "jose.molero@email.com",
    doctorName: "Matías García",
    doctorId: "1",
    appointmentType: "Control post operatorio",
    startTime: "14:00",
    endTime: "16:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-green-300 border-l-green-600",
  },
  {
    id: "8",
    patientName: "Félix Nieto",
    patientPhone: "+569 6666 7777",
    patientEmail: "felix.nieto@email.com",
    doctorName: "Sofía Reyes",
    doctorId: "2",
    appointmentType: "Sesión individual",
    startTime: "15:00",
    endTime: "17:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-blue-200 border-l-blue-500",
  },
  {
    id: "9",
    patientName: "Ricardo Quevedo",
    patientPhone: "+569 9999 0000",
    patientEmail: "ricardo.quevedo@email.com",
    doctorName: "Matías García",
    doctorId: "1",
    appointmentType: "Procedimiento",
    startTime: "17:00",
    endTime: "18:00",
    date: "2024-05-06",
    status: "confirmed",
    color: "bg-pink-300 border-l-pink-600",
  },
  {
    id: "10",
    patientName: "Gustavo Florez",
    patientPhone: "+569 1111 2222",
    patientEmail: "gustavo.florez@email.com",
    doctorName: "Catalina Fuentes",
    doctorId: "4",
    appointmentType: "Tercera cita",
    startTime: "14:00",
    endTime: "15:30",
    date: "2024-05-06",
    status: "pending",
    color: "bg-yellow-300 border-l-yellow-600",
  },
]

export default function ProfessionalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 6)) // May 6, 2024
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedBranch, setSelectedBranch] = useState("sucursal-casa-matriz")
  const [selectedAgenda, setSelectedAgenda] = useState("profesional")
  const [selectedProfessional, setSelectedProfessional] = useState("todos")
  const [reservationStatus, setReservationStatus] = useState("reservas-activas")
  const [searchTerm, setSearchTerm] = useState("")

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 9 // Start from 9:00
    return `${hour.toString().padStart(2, "0")}:00`
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setDate(prev.getDate() - 1)
      } else {
        newDate.setDate(prev.getDate() + 1)
      }
      return newDate
    })
  }

  const getAppointmentsForDoctorAndTime = (doctorId: string, timeSlot: string) => {
    return mockAppointments.filter((apt) => {
      const aptStartHour = Number.parseInt(apt.startTime.split(":")[0])
      const slotHour = Number.parseInt(timeSlot.split(":")[0])
      const aptEndHour = Number.parseInt(apt.endTime.split(":")[0])

      return apt.doctorId === doctorId && slotHour >= aptStartHour && slotHour < aptEndHour
    })
  }

  const getAppointmentHeight = (appointment: Appointment) => {
    const startHour = Number.parseInt(appointment.startTime.split(":")[0])
    const startMinute = Number.parseInt(appointment.startTime.split(":")[1])
    const endHour = Number.parseInt(appointment.endTime.split(":")[0])
    const endMinute = Number.parseInt(appointment.endTime.split(":")[1])

    const durationInMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)
    return Math.max(durationInMinutes / 60, 1) * 60 // 60px per hour minimum
  }

  const getAppointmentTop = (appointment: Appointment, baseTimeSlot: string) => {
    const baseHour = Number.parseInt(baseTimeSlot.split(":")[0])
    const aptStartHour = Number.parseInt(appointment.startTime.split(":")[0])
    const aptStartMinute = Number.parseInt(appointment.startTime.split(":")[1])

    const hourDiff = aptStartHour - baseHour
    const minuteOffset = aptStartMinute
    return hourDiff * 60 + minuteOffset // 60px per hour
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  const closeAppointmentModal = () => {
    setSelectedAppointment(null)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderMiniCalendar = () => {
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
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold text-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigateDate("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-gray-500 font-medium p-1">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => (
            <div key={`empty-${i}`} className="p-1"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const isToday = day === currentDate.getDate()
            return (
              <button
                key={day}
                className={`p-1 text-center rounded hover:bg-gray-100 ${
                  isToday ? "bg-purple-100 text-purple-600 font-semibold" : ""
                }`}
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setDate(day)
                  setCurrentDate(newDate)
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Branch Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Selecciona la sucursal</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sucursal-casa-matriz">Sucursal casa matriz</SelectItem>
                <SelectItem value="sucursal-norte">Sucursal Norte</SelectItem>
                <SelectItem value="sucursal-sur">Sucursal Sur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agendas */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Agendas</Label>
            <Select value={selectedAgenda} onValueChange={setSelectedAgenda}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profesional">Profesional</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgencias">Urgencias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Professional Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Profesional</Label>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="/placeholder.svg?height=24&width=24&text=👨‍⚕️"
                alt="Professional"
                className="w-6 h-6 rounded-full"
              />
              <img
                src="/placeholder.svg?height=24&width=24&text=👩‍⚕️"
                alt="Professional"
                className="w-6 h-6 rounded-full"
              />
              <img
                src="/placeholder.svg?height=24&width=24&text=👨‍⚕️"
                alt="Professional"
                className="w-6 h-6 rounded-full"
              />
            </div>
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reservation Status */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Estado de la reserva</Label>
            <Select value={reservationStatus} onValueChange={setReservationStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reservas-activas">Reservas activas</SelectItem>
                <SelectItem value="todas">Todas las reservas</SelectItem>
                <SelectItem value="confirmadas">Confirmadas</SelectItem>
                <SelectItem value="pendientes">Pendientes</SelectItem>
                <SelectItem value="canceladas">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Search */}
          <div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Búsqueda rápida de hora"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mini Calendar */}
          <div>{renderMiniCalendar()}</div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateDate("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                Hoy
              </Button>
              <div className="text-lg font-semibold capitalize">{formatDate(currentDate)}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Printer className="w-4 h-4" />
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            {/* Doctor Headers */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex">
                <div className="w-20 p-4 border-r border-gray-200 flex items-center">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex-1 p-4 border-r border-gray-200 text-center min-w-48">
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={doctor.avatar || "/placeholder.svg"}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <div>
                        <div className="font-semibold text-sm">{doctor.name}</div>
                        <div className="text-xs text-gray-500">{doctor.specialty}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots and Appointments */}
            <div className="relative">
              {timeSlots.map((timeSlot, timeIndex) => (
                <div key={timeSlot} className="flex border-b border-gray-100">
                  <div className="w-20 p-4 border-r border-gray-200 text-sm text-gray-500 font-medium">{timeSlot}</div>
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="flex-1 border-r border-gray-200 min-w-48 relative h-16">
                      {/* Render appointments that start in this time slot */}
                      {getAppointmentsForDoctorAndTime(doctor.id, timeSlot).map((appointment) => {
                        const isFirstSlot =
                          Number.parseInt(appointment.startTime.split(":")[0]) ===
                          Number.parseInt(timeSlot.split(":")[0])
                        if (!isFirstSlot) return null

                        return (
                          <div
                            key={appointment.id}
                            className={`absolute left-1 right-1 rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${appointment.color}`}
                            style={{
                              height: `${getAppointmentHeight(appointment)}px`,
                              top: `${getAppointmentTop(appointment, timeSlot)}px`,
                              zIndex: 5,
                            }}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="text-xs font-semibold text-gray-800 truncate">
                              {appointment.patientName}
                            </div>
                            <div className="text-xs text-gray-600 truncate">{appointment.appointmentType}</div>
                            <div className="text-xs text-gray-500">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={closeAppointmentModal}>
        <DialogContent className="max-w-md">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedAppointment.patientName}</DialogTitle>
                <DialogDescription className="text-base">{selectedAppointment.appointmentType}</DialogDescription>
                <div className="text-sm text-gray-600">
                  {formatDate(currentDate)} • {selectedAppointment.startTime} a {selectedAppointment.endTime} hrs
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Se atenderá con: {selectedAppointment.doctorName}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{selectedAppointment.patientPhone}</span>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Hablar por WhatsApp
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{selectedAppointment.patientEmail}</span>
                </div>

                {selectedAppointment.notes && (
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Comentario interno</div>
                      <div className="text-sm text-gray-600">{selectedAppointment.notes}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">Reservado</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                    <FileText className="w-4 h-4" />
                    <span>Ir a la ficha</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
