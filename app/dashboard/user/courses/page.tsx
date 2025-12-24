"use client"

import api from "@/utils/axios"
import { useEffect, useState } from "react"
import Link from "next/link"

type Course = {
  _id: string
  title: string
  description: string
  status: "published"
  instructor?: {
    username: string
  }
}

type EnrolledCourse = Course & {
  enrollmentId: string
  enrollmentStatus: string
}

export default function UserCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"available" | "enrolled">("available")
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchCourses()
    fetchEnrollments()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get("/user/courses")
      const courseList = res.data.data?.courses || []
      setCourses(courseList)
    } catch (err) {
      console.error("Failed to fetch courses:", err)
      setError("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      // New endpoint returns approved enrollments with course details
      const res = await api.get("/user/enrollments/approved")
      const list = res.data?.data?.enrollments || res.data?.enrollments || res.data?.data || []
      setEnrollments(list)
    } catch (err) {
      console.error("Failed to fetch enrollments:", err)
      setEnrollments([])
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingId(courseId)
      setError("")
      setSuccess("")
      
      const res = await api.post(`/user/apply/${courseId}/enroll`)
      
      setSuccess(res.data.message || "Successfully enrolled in course!")
      setTimeout(() => setSuccess(""), 3000)
      
      // Refresh courses
      fetchCourses()
      fetchEnrollments()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to enroll in course"
      setError(errorMsg)
    } finally {
      setEnrollingId(null)
    }
  }

  // Derived lists
  const approvedEnrollments = (enrollments || []).filter((e: any) => e && (e.status === "approved" || e.enrollmentStatus === "approved"))

  const enrollmentMap = new Map<string, any>(
    approvedEnrollments
      .map((e: any) => [e.courseId || e.course?._id || "", e])
      .filter(([id]) => !!id)
  )

  const enrolledCourses: EnrolledCourse[] = approvedEnrollments
    .map((e: any) => {
      const course = e.course || courses.find((c: any) => c._id === (e.courseId || e.course?._id))
      if (!course) return null
      return {
        ...course,
        enrollmentStatus: e.status || e.enrollmentStatus || "approved",
        enrollmentId: e._id || "",
      }
    })
    .filter(Boolean) as EnrolledCourse[]

  const availableCourses: Course[] = courses.filter((c: any) => {
    return !enrollmentMap.has(c._id)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">CourseCrash</h1>
            <p className="text-xs text-indigo-400 mt-1">Student Dashboard</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-white font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setTab("available")}
            className={`px-4 py-2 font-semibold transition ${
              tab === "available"
                ? "text-white border-b-2 border-indigo-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Available Courses
          </button>
          <button
            onClick={() => setTab("enrolled")}
            className={`px-4 py-2 font-semibold transition ${
              tab === "enrolled"
                ? "text-white border-b-2 border-indigo-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            My Courses
          </button>
        </div>

        {/* Available Courses */}
        {tab === "available" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Available Courses</h2>
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading courses...</div>
            ) : availableCourses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No courses available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map(course => (
                  <div
                    key={course._id}
                    className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      {course.description}
                    </p>
                    {course.instructor && (
                      <p className="text-xs text-slate-500 mb-4">
                        Instructor: {course.instructor.username}
                      </p>
                    )}
                    {(() => {
                      const enr = enrollmentMap.get(course._id)
                      if (enr && enr.status === "pending") {
                        return (
                          <div className="w-full px-4 py-2 bg-yellow-600/30 border border-yellow-500 text-yellow-200 rounded font-semibold text-center">
                            Enrollment Pending
                          </div>
                        )
                      }
                      return (
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={enrollingId === course._id}
                          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded font-semibold disabled:opacity-50"
                        >
                          {enrollingId === course._id ? "Enrolling..." : "Enroll Now"}
                        </button>
                      )
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enrolled Courses */}
        {tab === "enrolled" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                You haven't enrolled in any courses yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <div
                    key={course._id}
                    className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      {course.description}
                    </p>
                    <span className="inline-block px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 mb-4">
                      Enrolled
                    </span>
                    <Link
                      href={`/dashboard/user/courses/${course._id}/lessons`}
                      className="block w-full px-4 py-2 bg-green-600 hover:bg-green-500 transition text-white rounded font-semibold text-center"
                    >
                      View Lessons
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
