import { NextResponse, type NextRequest } from 'next/server'

// Optimistic check: verifica si existe cookie de sesión de Supabase
// sin hacer llamadas de red (requerido en Next.js 16 Proxy)
function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = hasSupabaseSession(request)

  // Rutas protegidas: redirigir a login si no hay sesión
  if (
    !isAuthenticated &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/medico') ||
      pathname.startsWith('/checkout'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
