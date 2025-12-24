"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"
import Link from "next/link"

type Application = {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  status: "pending" | "approved" | "rejected"
  appliedAt: string
  bio?: string
  expertise?: string[]
}

export default function InstructorApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

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
      await fetchApplications()
    } catch (err: any) {
      console.error('Auth check failed:', err)
      router.push("/login")
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/instructor-applications")
      const appData = res.data.data || res.data.applications || res.data || []
      // Ensure it's always an array
      const appArray = Array.isArray(appData) ? appData : []
      setApplications(appArray)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load applications")
      setApplications([]) // Reset to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (instructorId: string) => {
    try {
      setError("")
      setSuccess("")
      await api.post(`/admin/instructor-applications/${instructorId}/approve`)
      setSuccess("Instructor application approved")
      await fetchApplications()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve application")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleReject = async (instructorId: string) => {
    try {
      setError("")
      setSuccess("")
      await api.post(`/admin/instructor-applications/${instructorId}/reject`)
      setSuccess("Instructor application rejected")
      await fetchApplications()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject application")
      setTimeout(() => setError(""), 3000)
    }
  }

  const filteredApplications = Array.isArray(applications) ? applications.filter(app => {
    if (filter === "all") return true
    return app.status === filter
  }) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/admin" className="text-white hover:text-purple-400 transition">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Instructor Applications</h1>
          <p className="text-slate-400">Review and manage instructor applications</p>
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-xs opacity-75">
                ({applications.filter(a => status === "all" || a.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400">No {filter !== "all" ? filter : ""} applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {app.userId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{app.userId.name}</h3>
                        <p className="text-sm text-slate-400">{app.userId.email}</p>
                      </div>
                    </div>

                    {app.bio && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-300">{app.bio}</p>
                      </div>
                    )}

                    {app.expertise && app.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {app.expertise.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        app.status === "approved" ? "bg-green-500/20 text-green-300" :
                        app.status === "rejected" ? "bg-red-500/20 text-red-300" :
                        "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {app.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(app.userId._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(app.userId._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
