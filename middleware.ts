import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/", "/api/auth"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Si no hay token y no es ruta pública, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si hay token, permitir acceso
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|placeholder).*)"],
}
