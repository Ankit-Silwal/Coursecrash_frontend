"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"
import Link from "next/link"

type User = {
  _id: string
  name: string
  email: string
  role: "user" | "instructor" | "admin"
  createdAt: string
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  const checkAuthAndFetch = async () => {
    try {
      const authRes = await api.get("/user/me")
      if (authRes.data.data?.role !== "admin") {
        router.push("/login")
        return
      }
      await fetchUsers()
    } catch (err) {
      router.push("/admin/login")
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/ausers")
      setUsers(res.data.data || res.data.users || [])
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (userId: string) => {
    setUserToDelete(userId)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setError("")
      setSuccess("")
      await api.delete(`/admin/users/${userToDelete}`)
      setSuccess("User deleted successfully")
      await fetchUsers()
      closeDeleteModal()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user")
      closeDeleteModal()
      setTimeout(() => setError(""), 3000)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500/20 text-purple-300"
      case "instructor": return "bg-blue-500/20 text-blue-300"
      default: return "bg-slate-600 text-slate-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/admin" className="text-white hover:text-blue-400 transition">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">View and manage all platform users</p>
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

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDeleteModal(user._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-3">Delete User</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
