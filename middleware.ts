import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./app/api/auth/route"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ["/admin", "/empresa", "/profesional"]

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Verificar permisos por tipo de usuario
    if (pathname.startsWith("/admin") && (decoded as any).type !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/empresa") && !["empresa1", "empresa2", "empresa3"].includes((decoded as any).type)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/profesional") && (decoded as any).type !== "profesional") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/empresa/:path*", "/profesional/:path*"],
}
