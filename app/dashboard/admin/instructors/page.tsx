"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"
import Link from "next/link"

type Instructor = {
  _id: string
  name: string
  email: string
  role: string
  isBlocked?: boolean
  createdAt: string
}

export default function InstructorsManagementPage() {
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
      // Fetch all users and filter instructors
      const res = await api.get("/admin/allusers")
      const allUsers = res.data.data || res.data.users || []
      const instructorUsers = allUsers.filter((u: any) => u.role === "instructor")
      setInstructors(instructorUsers)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load instructors")
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (instructorId: string) => {
    try {
      setError("")
      setSuccess("")
      await api.post(`/admin/instructors/${instructorId}/block`)
      setSuccess("Instructor blocked successfully")
      await fetchInstructors()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to block instructor")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleUnblock = async (instructorId: string) => {
    try {
      setError("")
      setSuccess("")
      await api.post(`/admin/instructors/${instructorId}/unblock`)
      setSuccess("Instructor unblocked successfully")
      await fetchInstructors()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unblock instructor")
      setTimeout(() => setError(""), 3000)
    }
  }

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
          <p className="text-slate-400">Block or unblock instructors</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
            {success}
          </div>
        )}

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
                      {instructor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{instructor.name}</h3>
                      <p className="text-sm text-slate-400 mb-2">{instructor.email}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Joined: {new Date(instructor.createdAt).toLocaleDateString()}</span>
                        {instructor.isBlocked && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">
                            Blocked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {instructor.isBlocked ? (
                      <button
                        onClick={() => handleUnblock(instructor._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlock(instructor._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"
                      >
                        Block
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
