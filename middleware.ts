import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Usamos uma proteção simples no App Router ou podemos usar withAuth do NextAuth
export function middleware(request: NextRequest) {
  // O token do NextAuth fica nos cookies. Em produção, os nomes dos cookies podem variar.
  // Uma forma mais segura é usar o middleware exportado pelo next-auth
  return NextResponse.next();
}

// Exportamos o middleware do NextAuth para proteger todas as rotas por padrão
export { default } from "next-auth/middleware"

export const config = {
  matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)'],
}
