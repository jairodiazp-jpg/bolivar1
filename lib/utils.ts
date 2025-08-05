import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(time: string) {
  return time
}

export function formatDateTime(date: string | Date, time?: string) {
  const formattedDate = formatDate(date)
  return time ? `${formattedDate} a las ${time}` : formattedDate
}

export function generateTimeSlots(start: string, end: string, duration = 30) {
  const slots = []
  const startTime = new Date(`2000-01-01T${start}:00`)
  const endTime = new Date(`2000-01-01T${end}:00`)

  const current = new Date(startTime)

  while (current < endTime) {
    slots.push(current.toTimeString().slice(0, 5))
    current.setMinutes(current.getMinutes() + duration)
  }

  return slots
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string) {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone)
}

export function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusText(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada"
    case "pending":
      return "Pendiente"
    case "cancelled":
      return "Cancelada"
    case "completed":
      return "Completada"
    default:
      return "Desconocido"
  }
}
