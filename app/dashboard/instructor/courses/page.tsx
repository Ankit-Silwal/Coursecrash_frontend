"use client"

import api from "@/utils/axios"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/ProtectedRoute"

type Course = {
  _id: string
  title: string
  description: string
  status: "draft" | "published"
}

type Enrollment = {
  _id: string
  studentId: {
    _id: string
    username: string
    email: string
  }
  courseId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

function InstructorCoursesPageContent() {
  const [courses, setCourses] = useState<Course[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollmentTab, setEnrollmentTab] = useState<"pending" | "approved" | "all">("pending")
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)

  /* =======================
     FETCH COURSES
  ======================= */
  const fetchCourses = async () => {
    try {
      const res = await api.get("/instructor/courses")
      const list = res?.data?.data?.courses ?? []
      setCourses(list.filter(Boolean))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  /* =======================
     ACTIONS
  ======================= */
  async function createCourse() {
    if (!title.trim() || !description.trim()) return
    try {
      setIsCreating(true)
      await api.post("/instructor/courses", { title, description })
      setShowCreateModal(false)
      setTitle("")
      setDescription("")
      await fetchCourses()
    } catch (err: any) {
      console.error("Create failed:", err.response?.data || err.message)
    } finally {
      setIsCreating(false)
    }
  }

  async function publishCourse(courseId: string) {
    await api.post(`/instructor/courses/${courseId}/publish`)
    setCourses(prev =>
      prev.map(c =>
        c._id === courseId ? { ...c, status: "published" } : c
      )
    )
  }

  async function unpublishCourse(courseId: string) {
    await api.post(`/instructor/courses/${courseId}/unpublish`)
    setCourses(prev =>
      prev.map(c =>
        c._id === courseId ? { ...c, status: "draft" } : c
      )
    )
  }

  async function deleteCourse(courseId: string) {
    await api.delete(`/instructor/courses/${courseId}`)
    setCourses(prev => prev.filter(c => c._id !== courseId))
  }

  /* =======================
     ENROLLMENT FUNCTIONS
  ======================= */
  async function fetchEnrollments() {
    try {
      setLoadingEnrollments(true)
      const res = await api.get(
        selectedCourseId
          ? `/instructor/enrollments?courseId=${selectedCourseId}`
          : "/instructor/enrollments"
      )

      // Backends sometimes wrap differently; normalize the list
      let allEnrollments =
        res.data?.data?.enrollments ||
        res.data?.enrollments ||
        res.data?.data ||
        []
      
      // Filter by selected course if one is selected
      if (selectedCourseId) {
        allEnrollments = allEnrollments.filter((e: Enrollment) => e.courseId === selectedCourseId)
      }
      
      setEnrollments(
        (allEnrollments || [])
          .filter(Boolean)
          .map((e: Enrollment) => ({
            ...e,
            status: e.status || "pending",
          }))
      )
    } catch (err) {
      console.error("Failed to fetch enrollments:", err)
    } finally {
      setLoadingEnrollments(false)
    }
  }

  async function acceptEnrollment(enrollmentId: string) {
    try {
      await api.post(`/instructor/enrollments/${enrollmentId}/accept`)
      fetchEnrollments()
    } catch (err) {
      console.error("Failed to accept enrollment:", err)
    }
  }

  async function rejectEnrollment(enrollmentId: string) {
    try {
      await api.post(`/instructor/enrollments/${enrollmentId}/reject`)
      fetchEnrollments()
    } catch (err) {
      console.error("Failed to reject enrollment:", err)
    }
  }

  async function approveEnrollment(enrollmentId: string) {
    try {
      await api.post(`/instructor/enrollments/${enrollmentId}/approve`)
      fetchEnrollments()
    } catch (err) {
      console.error("Failed to approve enrollment:", err)
    }
  }

  async function revokeEnrollment(enrollmentId: string) {
    try {
      await api.post(`/instructor/enrollments/${enrollmentId}/revoke`)
      fetchEnrollments()
    } catch (err) {
      console.error("Failed to revoke enrollment:", err)
    }
  }

  async function acceptAllEnrollments() {
    try {
      await api.post("/instructor/enrollments/accept-all")
      fetchEnrollments()
    } catch (err) {
      console.error("Failed to accept all enrollments:", err)
    }
  }

  async function rejectAllEnrollments() {
    try {
      await api.post("/instructor/enrollments/reject-all")
      fetchEnrollments()
    } catch (err) {
      console.error("Failed to reject all enrollments:", err)
    }
  }

  function openEnrollmentModal(courseId?: string) {
    setSelectedCourseId(courseId || null)
    setShowEnrollmentModal(true)
    setEnrollmentTab("pending")
  }

  useEffect(() => {
    if (showEnrollmentModal) {
      fetchEnrollments()
    }
  }, [showEnrollmentModal, selectedCourseId])

  const filteredEnrollments = enrollments.filter(e => {
    if (enrollmentTab === "all") return true
    return e.status === enrollmentTab
  })

  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          My Courses
        </h1>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition text-white"
            onClick={() => openEnrollmentModal()}
          >
            Enrollments
          </button>
          
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-white"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Course
          </button>
        </div>
      </div>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div
            key={course._id}
            className="
              bg-slate-900
              border border-slate-700
              rounded-xl
              p-5
              space-y-4
              transition
              hover:bg-slate-800
              hover:border-slate-600
              hover:shadow-lg
            "
          >
            <div>
              <h2 className="text-lg font-semibold text-white">
                {course.title}
              </h2>
              <p className="text-sm text-slate-400">
                {course.description}
              </p>
            </div>

            <span
              className={`inline-block px-2 py-1 rounded text-xs ${course.status === "published"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
                }`}
            >
              {course.status}
            </span>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/instructor/courses/${course._id}`}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 transition text-white rounded text-sm"
              >
                View
              </Link>

              <button
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 transition text-white rounded text-sm"
                onClick={() => openEnrollmentModal(course._id)}
              >
                Enrollments
              </button>

              {course.status === "draft" ? (
                <button
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded text-sm"
                  onClick={() => publishCourse(course._id)}
                >
                  Publish
                </button>
              ) : (
                <button
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 transition text-white rounded text-sm"
                  onClick={() => unpublishCourse(course._id)}
                >
                  Unpublish
                </button>
              )}

              <button
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 transition text-white rounded text-sm"
                onClick={() => deleteCourse(course._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md z-10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create New Course
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">
                Course Title
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white resize-none
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 transition text-white rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded disabled:opacity-60"
                onClick={createCourse}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLLMENT MODAL */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEnrollmentModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedCourseId ? "Course Enrollments" : "All Enrollments"}
              </h2>
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-slate-700">
              <button
                onClick={() => setEnrollmentTab("pending")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  enrollmentTab === "pending"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setEnrollmentTab("approved")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  enrollmentTab === "approved"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setEnrollmentTab("all")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  enrollmentTab === "all"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
            </div>

            {/* Bulk Actions */}
            {enrollmentTab === "pending" && filteredEnrollments.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={acceptAllEnrollments}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 transition text-white rounded text-sm"
                >
                  Accept All
                </button>
                <button
                  onClick={rejectAllEnrollments}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 transition text-white rounded text-sm"
                >
                  Reject All
                </button>
              </div>
            )}

            {/* Enrollments List */}
            {loadingEnrollments ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No {enrollmentTab !== "all" ? enrollmentTab : ""} enrollments found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnrollments.map(enrollment => (
                  <div
                    key={enrollment._id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">
                          {enrollment.studentId?.username || "Unknown Student"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {enrollment.studentId?.email}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Requested: {new Date(enrollment.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            enrollment.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : enrollment.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {enrollment.status}
                        </span>

                        {enrollment.status === "pending" && (
                          <>
                            <button
                              onClick={() => acceptEnrollment(enrollment._id)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 transition text-white rounded text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectEnrollment(enrollment._id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 transition text-white rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {enrollment.status === "approved" && (
                          <button
                            onClick={() => revokeEnrollment(enrollment._id)}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 transition text-white rounded text-sm"
                          >
                            Revoke
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
      )}
    </div>
  )
}

export default function InstructorCoursesPage() {
  return (
    <ProtectedRoute requiredRoles={['instructor', 'admin']}>
      <InstructorCoursesPageContent />
    </ProtectedRoute>
  )
}
