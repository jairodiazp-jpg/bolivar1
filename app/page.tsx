"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Stethoscope } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [userType, setUserType] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (email && password && userType) {
      setIsLoading(true)

      // Simular autenticación
      setTimeout(() => {
        localStorage.setItem("userType", userType)
        localStorage.setItem("userEmail", email)

        switch (userType) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "empresa1":
          case "empresa2":
            router.push("/empresa/dashboard")
            break
          case "profesional":
            router.push("/profesional/dashboard")
            break
        }
        setIsLoading(false)
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-green-500 to-green-600 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute top-20 -right-16 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/3 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-1/3 -right-12 w-36 h-36 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-10 left-1/4 w-28 h-28 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-white/15 rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with logo */}
        <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 shadow-lg">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
              <Stethoscope className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="text-white">
            <h1 className="text-lg font-bold tracking-wide">MEDISCHEDULE</h1>
            <p className="text-sm text-white/80 mt-1">Sistema de Agendamiento</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white rounded-t-[2rem] px-6 pt-8 pb-6 shadow-2xl">
          <div className="max-w-sm mx-auto">
            {/* Welcome message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido!</h2>
              <p className="text-gray-600 text-sm">Accede a tu plataforma médica</p>
            </div>

            {/* Login form */}
            <div className="space-y-6">
              {/* User type selection */}
              <div className="space-y-2">
                <Label htmlFor="userType" className="text-gray-700 font-medium">
                  Tipo de Usuario
                </Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors">
                    <SelectValue placeholder="Selecciona tu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Administrador del Sistema</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="empresa1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Hospital San Rafael</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="empresa2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Clínica Norte</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="profesional">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>Profesional de la Salud</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Correo Corporativo
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      userType === "admin"
                        ? "admin@medischedule.com"
                        : userType === "empresa1"
                          ? "usuario@sanrafael.com"
                          : userType === "empresa2"
                            ? "usuario@clinicanorte.com"
                            : userType === "profesional"
                              ? "doctor@sanrafael.com o doctor@clinicanorte.com"
                              : "tu@email.com"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors pl-4 pr-4"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors pl-4 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <button className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Login button */}
              <Button
                onClick={handleLogin}
                disabled={!email || !password || !userType || isLoading}
                className="w-full h-12 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>

              {/* Sign up link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                    Contacta a tu administrador
                  </button>
                </p>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 font-medium mb-2">Credenciales de prueba:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>
                  <strong>Admin:</strong> admin@medischedule.com / admin123
                </p>
                <p>
                  <strong>Hospital San Rafael:</strong> admin@sanrafael.com / empresa123
                </p>
                <p>
                  <strong>Clínica Norte:</strong> admin@clinicanorte.com / empresa123
                </p>
                <p>
                  <strong>Doctor:</strong> carlos.mendoza@sanrafael.com / doctor123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
    </div>
  )
}
