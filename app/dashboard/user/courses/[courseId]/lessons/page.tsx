"use client"

import api from "@/utils/axios"
import { use, useEffect, useState } from "react"
import Link from "next/link"

type PageProps = {
  params: Promise<{
    courseId: string
  }>
}

type Lesson = {
  _id: string
  courseId?: string
  title: string
  type: string
  order: number
  contentUrl: string
}

type LessonType = "VIDEO" | "PDF" | "AUDIO" | "TEXT"

function formatLessonType(type: LessonType) {
  switch (type) {
    case "VIDEO": return "Video"
    case "PDF": return "PDF"
    case "AUDIO": return "Audio"
    case "TEXT": return "Text"
    default: return type
  }
}

export default function CourseLessonsPage({ params }: PageProps) {
  const { courseId } = use(params)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonContent, setLessonContent] = useState<any>(null)
  const [contentLoading, setContentLoading] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchLessons()
    }
  }, [courseId])

  const fetchLessons = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log('Fetching lessons for courseId:', courseId)
      
      const res = await api.get(`/user/courses/${courseId}/lessons`)
      
      console.log('Lessons response:', res.data)
      
      const list = res.data.data?.lessons || res.data.lessons || []
      setLessons(list)
      
      // Auto-select first lesson if available
      if (list.length > 0 && !selectedLesson) {
        handleLessonClick(list[0])
      }
    } catch (err: any) {
      console.error('Fetch lessons error:', err)
      const errorMsg = err.response?.data?.message || err.message || "Failed to load lessons"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fetchLessonContent = async (lessonId: string) => {
    try {
      setContentLoading(true)
      setError("")
      
      console.log('Fetching content for lesson:', lessonId, 'course:', courseId)
      
      // Try different API patterns based on your backend
      let res;
      
      try {
        // Method 1: Query parameter
        res = await api.get(`/user/lessons/${lessonId}`, {
          params: { courseId }
        })
      } catch (err1) {
        console.log('Method 1 failed, trying Method 2...')
        try {
          // Method 2: In URL path
          res = await api.get(`/user/courses/${courseId}/lessons/${lessonId}`)
        } catch (err2) {
          console.log('Method 2 failed, trying Method 3...')
          // Method 3: POST with body
          res = await api.post(`/user/lessons/${lessonId}`, {
            courseId
          })
        }
      }
      
      console.log('Lesson content response:', res.data)
      
      const content = res.data.data || res.data
      setLessonContent(content)
      
    } catch (err: any) {
      console.error('Fetch lesson content error:', err)
      console.error('Error response:', err.response?.data)
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.message || 
                      "Failed to load lesson content"
      setError(errorMsg)
    } finally {
      setContentLoading(false)
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setLessonContent(null)
    fetchLessonContent(lesson._id)
  }

  const getDownloadLink = async (lessonId: string) => {
    try {
      setError("")
      
      console.log('Getting download link for lesson:', lessonId, 'course:', courseId)
      
      const res = await api.post("/user/lessons/getlink", { 
        lessonId, 
        courseId 
      })
      
      console.log('Download link response:', res.data)
      
      const downloadUrl = res.data.data?.downloadUrl || 
                         res.data.data?.url || 
                         res.data.downloadUrl ||
                         res.data.url
      
      if (downloadUrl) {
        window.open(downloadUrl, "_blank")
      } else {
        setError("Download link not available")
      }
    } catch (err: any) {
      console.error('Get download link error:', err)
      const errorMsg = err.response?.data?.message || "Failed to get download link"
      setError(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/dashboard/user/courses" 
            className="text-white hover:text-indigo-400 transition"
          >
            ← Back to Courses
          </Link>
          <div className="text-slate-400 text-sm">
            Course ID: {courseId}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError("")}
              className="text-red-300 hover:text-red-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Course Lessons</h3>
              <span className="text-sm text-slate-400">{lessons.length} total</span>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading lessons...
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-slate-400 mb-2">No lessons available</p>
                <p className="text-slate-500 text-sm">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <button
                      key={lesson._id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition ${
                        selectedLesson?._id === lesson._id
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-indigo-500 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          selectedLesson?._id === lesson._id
                            ? "bg-white text-indigo-600"
                            : "bg-slate-600 text-slate-300"
                        }`}>
                          {lesson.order || index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{lesson.title}</p>
                          <p className="text-xs opacity-70">
                            {formatLessonType(lesson.type as LessonType)}
                            {lesson.contentUrl && ' • Available'}
                          </p>
                        </div>
                        {selectedLesson?._id === lesson._id && (
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="mb-6 pb-6 border-b border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedLesson.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Type: {formatLessonType(selectedLesson.type as LessonType)}</span>
                        <span>•</span>
                        <span>Lesson {selectedLesson.order}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {contentLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading lesson content...</p>
                  </div>
                ) : lessonContent ? (
                  <div className="space-y-6">
                    {/* VIDEO Content */}
                    {selectedLesson.type === "VIDEO" && lessonContent.contentUrl && (
                      <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                        <video
                          controls
                          controlsList="nodownload"
                          className="w-full"
                          src={lessonContent.contentUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* TEXT Content */}
                    {selectedLesson.type === "TEXT" && lessonContent.content && (
                      <div className="prose prose-invert max-w-none">
                        <div className="bg-slate-700/30 rounded-lg p-6 text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {lessonContent.content}
                        </div>
                      </div>
                    )}

                    {/* PDF Content */}
                    {selectedLesson.type === "PDF" && lessonContent.contentUrl && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                          <iframe
                            src={lessonContent.contentUrl}
                            className="w-full h-[700px]"
                            title={selectedLesson.title}
                          />
                        </div>
                        <button
                          onClick={() => getDownloadLink(selectedLesson._id)}
                          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download PDF
                        </button>
                      </div>
                    )}

                    {/* AUDIO Content */}
                    {selectedLesson.type === "AUDIO" && lessonContent.contentUrl && (
                      <div className="space-y-4">
                        <div className="bg-slate-700/30 rounded-lg p-6">
                          <audio
                            controls
                            controlsList="nodownload"
                            className="w-full"
                            src={lessonContent.contentUrl}
                          >
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                        <button
                          onClick={() => getDownloadLink(selectedLesson._id)}
                          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Audio
                        </button>
                      </div>
                    )}

                    {/* No Content Available */}
                    {!lessonContent.contentUrl && !lessonContent.content && (
                      <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-slate-400 mb-2">No content available yet</p>
                        <p className="text-slate-500 text-sm">The instructor hasn't uploaded content for this lesson</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p>Click on a lesson to view content</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <svg className="w-20 h-20 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-slate-400 text-lg mb-2">Select a lesson to get started</p>
                <p className="text-slate-500 text-sm">Choose a lesson from the sidebar to view its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}