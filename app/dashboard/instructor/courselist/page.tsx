"use client"
import api from "@/utils/axios"
export default function InstructorCoursesPage() {
  const getcourses=async()=>{
    return await api.get('/instructor/courses')
  }
  const courses=getcourses();
  console.log(courses)
  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          My Courses
        </h1>

        <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
          + Create Course
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Course Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Web Development 101
            </h2>
            <p className="text-sm text-slate-400">
              Beginner friendly web course
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
              Published
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded bg-slate-700 text-white text-sm">
              View
            </button>
            <button className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm">
              Publish
            </button>
            <button className="px-3 py-1.5 rounded bg-yellow-600 text-white text-sm">
              Unpublish
            </button>
            <button className="px-3 py-1.5 rounded bg-red-600 text-white text-sm">
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
