import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is an instructor route
  if (pathname.startsWith('/dashboard/instructor')) {
    try {
      // Get the sessionId from cookies
      const sessionId = request.cookies.get('sessionId')?.value

      if (!sessionId) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Session exists, allow access and let ProtectedRoute component handle role verification
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/instructor/:path*'],
}
