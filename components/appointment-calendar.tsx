"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from "lucide-react"

interface Appointment {
  id: number
  date: string
  time: string
  patient: string
  doctor: string
  specialty: string
  status: "confirmed" | "pending" | "cancelled"
  type: string
}

const appointments: Appointment[] = [
  {
    id: 1,
    date: "2024-01-15",
    time: "09:00",
    patient: "María González",
    doctor: "Dr. Carlos Mendoza",
    specialty: "Cardiología",
    status: "confirmed",
    type: "Consulta",
  },
  {
    id: 2,
    date: "2024-01-15",
    time: "10:30",
    patient: "Juan Pérez",
    doctor: "Dra. Ana García",
    specialty: "Pediatría",
    status: "pending",
    type: "Control",
  },
  {
    id: 3,
    date: "2024-01-16",
    time: "14:00",
    patient: "Carmen López",
    doctor: "Dr. Luis Rodríguez",
    specialty: "Neurología",
    status: "confirmed",
    type: "Consulta",
  },
  {
    id: 4,
    date: "2024-01-17",
    time: "11:00",
    patient: "Roberto Silva",
    doctor: "Dr. Carlos Mendoza",
    specialty: "Cardiología",
    status: "cancelled",
    type: "Seguimiento",
  },
]

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15)) // January 15, 2024
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
      Cardiología: "bg-rose-50 border-l-rose-400",
      Pediatría: "bg-blue-50 border-l-blue-400",
      Neurología: "bg-purple-50 border-l-purple-400",
      Ginecología: "bg-pink-50 border-l-pink-400",
      Dermatología: "bg-orange-50 border-l-orange-400",
    }
    return colors[specialty as keyof typeof colors] || "bg-gray-50 border-l-gray-400"
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
                <div key={`empty-${i}`} className="p-2 h-24"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayAppointments = getAppointmentsForDate(dateStr)
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === "2024-01-15" // Simulated current date

                return (
                  <div
                    key={day}
                    className={`p-2 h-24 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? "bg-green-50 border-green-200" : "border-gray-200"
                    } ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-xs p-1 rounded border-l-2 ${getSpecialtyColor(apt.specialty)}`}
                        >
                          <div className="font-medium truncate">{apt.time}</div>
                          <div className="truncate">{apt.patient}</div>
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500 font-medium">+{dayAppointments.length - 2} más</div>
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
                    <div key={apt.id} className="p-4 border rounded-lg space-y-2">
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
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{apt.patient}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {apt.doctor} • {apt.specialty}
                        </div>
                        <div className="text-sm text-gray-500">Tipo: {apt.type}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay citas programadas para esta fecha</p>
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
    </div>
  )
}
