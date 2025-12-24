"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import api from "@/utils/axios"

type Enrollment = {
  _id: string
  userId: string
  courseId: string
  status: string
  createdAt: string
  updatedAt: string
  course?: {
    _id: string
    title: string
    description: string
    thumbnail?: string
    price: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applyingForInstructor, setApplyingForInstructor] = useState(false)
  const [applyMessage, setApplyMessage] = useState("")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)

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

  // Fetch enrollments when user is loaded
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return
      
      setLoadingEnrollments(true)
      try {
        const res = await api.get('/user/enrollments/approved')
        console.log('Enrollments response:', res.data)
        
        // Handle different possible response structures
        const enrollmentsData = res.data.data?.enrollments || 
                               res.data.enrollments || 
                               res.data.data || 
                               []
        
        setEnrollments(enrollmentsData)
      } catch (err) {
        console.error('Failed to fetch enrollments:', err)
        setEnrollments([])
      } finally {
        setLoadingEnrollments(false)
      }
    }

    fetchEnrollments()
  }, [user])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {})
    } finally {
      setUser(null)
      setEnrollments([])
      router.push('/login')
    }
  }

  const handleApplyInstructor = async () => {
    try {
      setApplyingForInstructor(true)
      setApplyMessage("")
      const res = await api.post('/user/apply-instructor')
      setApplyMessage(res.data.message || 'Application submitted successfully!')
      setTimeout(() => setApplyMessage(""), 3000)
    } catch (err: any) {
      setApplyMessage(err.response?.data?.message || 'Failed to apply. Please try again.')
    } finally {
      setApplyingForInstructor(false)
    }
  }

  const handleViewCourse = (courseId: string) => {
    router.push(`/dashboard/user/courses/${courseId}`)
  }

  // Calculate stats
  const totalEnrolled = enrollments.length
  const inProgress = enrollments.filter(e => e.status === 'approved').length
  const completed = 0 // You can add completion tracking later

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
            <p className="text-slate-400 mb-4">
              Role: <span className="text-indigo-400 font-semibold">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <button
                  onClick={() => router.push('/dashboard/instructor/courses')}
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold"
                >
                  Go to Instructor Dashboard
                </button>
              )}
              {user?.role === 'user' && (
                <>
                  <button
                    onClick={() => router.push('/dashboard/user/courses')}
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition text-white font-semibold"
                  >
                    Browse Courses
                  </button>
                  <button
                    onClick={handleApplyInstructor}
                    disabled={applyingForInstructor}
                    className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition text-white font-semibold disabled:opacity-50"
                  >
                    {applyingForInstructor ? 'Applying...' : 'Apply to be Instructor'}
                  </button>
                </>
              )}
            </div>
            {applyMessage && (
              <div className={`mt-3 p-3 rounded text-sm ${applyMessage.includes('success') || applyMessage.includes('successfully') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {applyMessage}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="text-indigo-400 text-4xl font-bold mb-2">{totalEnrolled}</div>
            <p className="text-slate-400">Courses Enrolled</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="text-indigo-400 text-4xl font-bold mb-2">{inProgress}</div>
            <p className="text-slate-400">In Progress</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="text-indigo-400 text-4xl font-bold mb-2">{completed}</div>
            <p className="text-slate-400">Completed</p>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">My Enrolled Courses</h3>
          
          {loadingEnrollments ? (
            <div className="text-center py-8">
              <div className="text-slate-400">Loading your courses...</div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-slate-400 text-lg mb-4">You haven't enrolled in any courses yet</p>
              <button
                onClick={() => router.push('/dashboard/user/courses')}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold"
              >
                Browse Available Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="bg-slate-700/30 border border-slate-600 rounded-xl p-6 hover:border-indigo-500 transition cursor-pointer"
                  onClick={() => enrollment.course && handleViewCourse(enrollment.course._id)}
                >
                  {enrollment.course?.thumbnail && (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <h4 className="text-lg font-bold text-white mb-2">
                    {enrollment.course?.title || 'Untitled Course'}
                  </h4>
                  
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {enrollment.course?.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      enrollment.status === 'approved' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {enrollment.status === 'approved' ? 'Active' : 'Pending'}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        enrollment.course && handleViewCourse(enrollment.course._id)
                      }}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Continue Learning →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          
          {enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment._id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Enrolled in <span className="font-semibold">{enrollment.course?.title || 'Course'}</span>
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}