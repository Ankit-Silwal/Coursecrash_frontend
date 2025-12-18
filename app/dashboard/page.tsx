"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import api from "@/utils/axios"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get('/auth/status')
        if (res.data.success) {
          setUser(res.data.user)
        } else {
          router.push('/login')
        }
      } catch (err) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [router])

  const handleLogout = () => {
    router.push('/login')
    api.get('/auth/logout')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">CourseCrash</h1>
            <p className="text-slate-400">Learn. Grow. Succeed.</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
            <svg className="w-16 h-16 mx-auto text-indigo-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Session Not Found</h2>
            <p className="text-slate-400 text-sm">Please log in to access your dashboard</p>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold mb-3"
          >
            Go to Login
          </button>

          <button
            onClick={() => router.push('/register')}
            className="w-full py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-white font-semibold"
          >
            Create Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">CourseCrash</h1>
            <p className="text-xs text-indigo-400 mt-1">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="md:col-span-3 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome, {user?.username || user?.email}!
            </h2>
            <p className="text-slate-400">
              Role: <span className="text-indigo-400 font-semibold">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</span>
            </p>
          </div>

          {/* Stats Cards */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="text-indigo-400 text-4xl font-bold mb-2">0</div>
            <p className="text-slate-400">Courses Enrolled</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="text-indigo-400 text-4xl font-bold mb-2">0</div>
            <p className="text-slate-400">In Progress</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="text-indigo-400 text-4xl font-bold mb-2">0</div>
            <p className="text-slate-400">Completed</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <p className="text-slate-400 text-center py-8">No activity yet</p>
        </div>
      </div>
    </div>
  )
}