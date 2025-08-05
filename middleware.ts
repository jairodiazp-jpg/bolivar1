import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/api/auth"]

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Rutas que requieren autenticación
  const protectedRoutes = ["/admin", "/empresa", "/profesional"]

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for authentication token
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Verificar permisos por tipo de usuario
    if (pathname.startsWith("/admin") && payload.type !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/empresa") && !["empresa1", "empresa2", "empresa3"].includes(payload.type)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/profesional") && payload.type !== "profesional") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.userId.toString())
    requestHeaders.set("x-user-type", payload.type)
    requestHeaders.set("x-user-email", payload.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
}
