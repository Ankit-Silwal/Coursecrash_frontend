import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is an instructor or admin route
  if (pathname.startsWith('/dashboard/instructor') || pathname.startsWith('/dashboard/admin')) {
    try {
      // Get the sessionId from cookies
      const sessionId = request.cookies.get('sessionId')?.value

      if (!sessionId) {
        // Redirect to appropriate login page
        const loginUrl = pathname.startsWith('/dashboard/admin') ? '/admin/login' : '/login'
        return NextResponse.redirect(new URL(loginUrl, request.url))
      }

      // Session exists, allow access and let ProtectedRoute component handle role verification
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      const loginUrl = pathname.startsWith('/dashboard/admin') ? '/admin/login' : '/login'
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/instructor/:path*', '/dashboard/admin/:path*'],
}
