"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"
import Link from "next/link"

type Instructor = {
  _id: string
  username?: string
  name?: string
  email?: string
  role?: string
  isBlocked?: boolean
  createdAt?: string
}

export default function InstructorsManagementPage() {
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  const checkAuthAndFetch = async () => {
    try {
      const authRes = await api.get("/auth/status")
      const user = authRes.data.user || authRes.data.data || authRes.data
      if (user?.role !== "admin") {
        router.push("/login")
        return
      }
      await fetchInstructors()
    } catch (err: any) {
      console.error('Auth check failed:', err)
      router.push("/login")
    }
  }

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await api.get("/admin/allinstructors")
      const list = res.data?.data?.instructors || res.data?.instructors || []
      const arr = Array.isArray(list) ? list : []
      setInstructors(arr)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load instructors")
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }

  // Block/Unblock actions removed per request

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/admin" className="text-white hover:text-orange-400 transition">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Instructor Management</h1>
          <p className="text-slate-400">View instructors</p>
        </div>

        {/* Removed All/Blocked toggle */}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {/* Success alert removed */}

        {/* Instructors List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading instructors...</p>
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No instructors found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {instructors.map((instructor) => (
              <div
                key={instructor._id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                      {(instructor.name || instructor.username || "I").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{instructor.name || instructor.username || "Unknown"}</h3>
                      <p className="text-sm text-slate-400 mb-2">{instructor.email || "N/A"}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Joined: {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : "N/A"}</span>
                        {/* Removed blocked badge */}
                      </div>
                    </div>
                  </div>

                  {/* Block/Unblock controls removed */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
