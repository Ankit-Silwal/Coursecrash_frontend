"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"
import Link from "next/link"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Checking admin auth via /auth/status...')
      const res = await api.get("/auth/status")
      console.log('Auth status response:', res.data)
      
      const user = res.data.user || res.data.data || res.data
      const role = user?.role
      console.log('User role from sessionId:', role)
      
      if (role !== "admin") {
        console.log('Not admin, redirecting to login')
        setAuthError(`Access denied. Your role is: ${role || 'unknown'}`)
        setTimeout(() => router.push("/login"), 2000)
        return
      }
      
      // Set user details
      console.log('Admin access granted')
      setUser(user)
    } catch (err: any) {
      console.error('Auth check error:', err)
      console.error('Error details:', err.response?.data)
      setAuthError(err.response?.data?.message || "Authentication failed - please log in")
      setTimeout(() => router.push("/login"), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post("/user/logout")
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 border border-red-500 rounded-xl p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-red-300 mb-4">{authError}</p>
          <p className="text-slate-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Welcome, {user?.name || "Admin"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Instructor Applications Card */}
          <Link href="/dashboard/admin/instructor-applications">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instructor Applications</h3>
              <p className="text-slate-400 text-sm">Review and approve instructor applications</p>
            </div>
          </Link>

          {/* User Management Card */}
          <Link href="/dashboard/admin/users">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
              <p className="text-slate-400 text-sm">View and manage all platform users</p>
            </div>
          </Link>

          {/* Instructor Management Card */}
          <Link href="/dashboard/admin/instructors">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instructor Management</h3>
              <p className="text-slate-400 text-sm">Block/unblock instructors</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
