"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Activity, Loader2, User, Building2, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<"admin" | "empresa" | "profesional">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("userType", data.user.type)
        localStorage.setItem("userEmail", data.user.email)
        localStorage.setItem("userName", data.user.name)
        localStorage.setItem("userId", data.user.id.toString())

        if (data.user.companyId) {
          localStorage.setItem("companyId", data.user.companyId.toString())
        }

        toast({
          title: "¡Bienvenido!",
          description: `Inicio de sesión exitoso como ${data.user.type}`,
        })

        // Redirect based on user type
        switch (data.user.type) {
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
            router.push("/")
        }
      } else {
        toast({
          title: "Error de autenticación",
          description: data.error || "Credenciales inválidas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDemoCredentials = () => {
    switch (userType) {
      case "admin":
        return { email: "admin@medischedule.com", password: "admin123" }
      case "empresa":
        return { email: "admin@sanrafael.com", password: "sanrafael123" }
      case "profesional":
        return { email: "doctor1@sanrafael.com", password: "doctor123" }
      default:
        return { email: "", password: "" }
    }
  }

  const fillDemoCredentials = () => {
    const credentials = getDemoCredentials()
    setEmail(credentials.email)
    setPassword(credentials.password)
  }

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <UserCheck className="w-4 h-4" />
      case "empresa":
        return <Building2 className="w-4 h-4" />
      case "profesional":
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "empresa":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "profesional":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MediSchedule</h1>
          <p className="text-gray-600">Sistema de Agendamiento Médico</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
              <CardDescription>Accede a tu cuenta para continuar</CardDescription>
            </div>

            {/* User Type Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Usuario</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "empresa", "profesional"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      userType === type
                        ? getUserTypeColor(type)
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      {getUserTypeIcon(type)}
                      <span className="text-xs font-medium capitalize">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Credenciales de Demo</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={getUserTypeColor(userType)}>
                    {getUserTypeIcon(userType)}
                    <span className="ml-1 capitalize">{userType}</span>
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillDemoCredentials}
                    className="text-xs bg-transparent"
                  >
                    Usar Demo
                  </Button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    <strong>Email:</strong> {getDemoCredentials().email}
                  </div>
                  <div>
                    <strong>Contraseña:</strong> {getDemoCredentials().password}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 MediSchedule. Sistema de gestión médica.</p>
        </div>
      </div>
    </div>
  )
}
