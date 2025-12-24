import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '@/utils/axios'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: string | string[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Normalize requiredRoles to array
  const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const res = await api.get('/auth/status')
        
        if (res.data.success && allowedRoles.includes(res.data.user?.role)) {
          setIsAuthorized(true)
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Authorization check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Unauthorized</div>
      </div>
    )
  }

  return <>{children}</>
}
