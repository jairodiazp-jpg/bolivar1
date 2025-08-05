"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Users, Activity } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          action: "login",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirigir según el rol del usuario
        switch (data.user.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "empresa":
            router.push("/empresa/dashboard")
            break
          case "profesional":
            router.push("/profesional/dashboard")
            break
          default:
            router.push("/dashboard")
        }
      } else {
        setError(data.error || "Error de autenticación")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const testCredentials = [
    { role: "Admin", email: "admin@medischedule.com", password: "admin123" },
    { role: "Empresa", email: "empresa1@segurosbolivar.com", password: "empresa123" },
    { role: "Doctor", email: "doctor@medischedule.com", password: "doctor123" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Información */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">MediSchedule</h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistema integral de gestión de citas médicas para profesionales de la salud
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Calendar className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Gestión de Citas</h3>
              <p className="text-sm text-gray-600">Programa y administra citas médicas de forma eficiente</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Users className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Profesionales</h3>
              <p className="text-sm text-gray-600">Gestiona perfiles y horarios de profesionales médicos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Activity className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Reportes</h3>
              <p className="text-sm text-gray-600">Analiza estadísticas y genera reportes detallados</p>
            </div>
          </div>

          {/* Credenciales de prueba */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Credenciales de Prueba</h3>
            <div className="space-y-3">
              {testCredentials.map((cred, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{cred.role}:</span>
                  <div className="text-right">
                    <div className="text-gray-600">{cred.email}</div>
                    <div className="text-gray-500">{cred.password}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Login */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
