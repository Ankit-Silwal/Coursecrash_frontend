"use client"

import api from "@/utils/axios"
import { useEffect, useState } from "react"

type Course = {
  _id: string
  title: string
  description: string
  status: "draft" | "published"
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Centralized fetch to reuse after mutations
  const fetchCourses = async () => {
    try {
      const res = await api.get("/instructor/courses")
      const list = res?.data?.data?.courses ?? []
      setCourses(list.filter(Boolean))
    } catch (err) {
      console.error(err)
    }
  }

  /* =======================
     FETCH COURSES
  ======================= */
  useEffect(() => {
    fetchCourses()
  }, [])

  async function createCourse() {
    if (!title.trim() || !description.trim()) return
    try {
      setIsCreating(true)
      const res = await api.post("/instructor/courses", {
        title,
        description,
      })
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
    setCourses((prev) =>
      prev.map((c) =>
        c._id === courseId ? { ...c, status: "published" } : c
      )
    )
  }

  async function unpublishCourse(courseId: string) {
    await api.post(`/instructor/courses/${courseId}/unpublish`)
    setCourses((prev) =>
      prev.map((c) =>
        c._id === courseId ? { ...c, status: "draft" } : c
      )
    )
  }
  async function deleteCourse(courseId: string) {
    await api.delete(`/instructor/courses/${courseId}`)
    setCourses((prev) => prev.filter((c) => c._id !== courseId))
  }

  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          My Courses
        </h1>

        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Course
        </button>
      </div>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4"
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
              className={`px-2 py-1 rounded text-xs ${
                course.status === "published"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {course.status}
            </span>

            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 bg-slate-700 text-white rounded text-sm">
                View
              </button>

              {course.status === "draft" ? (
                <button
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm"
                  onClick={() => publishCourse(course._id)}
                >
                  Publish
                </button>
              ) : (
                <button
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm"
                  onClick={() => unpublishCourse(course._id)}
                >
                  Unpublish
                </button>
              )}

              <button
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-slate-700 text-white rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
                onClick={createCourse}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
