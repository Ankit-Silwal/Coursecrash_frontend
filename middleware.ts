import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is an instructor route
  if (pathname.startsWith('/dashboard/instructor')) {
    try {
      // Get the auth token from cookies
      const token = request.cookies.get('auth_token')?.value

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Verify the user role by making an API call
      const response = await fetch('http://localhost:8000/api/auth/status', {
        headers: {
          'Cookie': `auth_token=${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      // Check if user is authenticated and is an instructor or admin
      if (!data.success || !['instructor', 'admin'].includes(data.user?.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      // On error, redirect to login to be safe
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/instructor/:path*'],
}
