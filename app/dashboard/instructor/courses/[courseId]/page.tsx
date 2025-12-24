"use client"
import { use } from 'react'
import api from '@/utils/axios'
import { useEffect, useState } from 'react'

type PageProps = {
  params: Promise<{
    courseId: string
  }>
}

type Lesson = {
  _id: string
  courseId: string
  title: string
  type: string
  order: number
  contentUrl: string 
}

type LessonType = "VIDEO" | "PDF" | "AUDIO" | "TEXT";

function formatLessonType(type: LessonType) {
  switch (type) {
    case "VIDEO": return "Video";
    case "PDF": return "PDF";
    case "AUDIO": return "Audio";
    case "TEXT": return "Text";
  }
}

export default function CourseDetailsPage({ params }: PageProps) {
  const { courseId } = use(params)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonType, setLessonType] = useState<LessonType>('VIDEO')
  const [loading, setLoading] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null)

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/instructor/courses/${courseId}/lessons`)
      const list = res.data.data?.lessons || res.data.lessons || [];
      
      const lessonsWithOrder = list
        .filter((lesson: any) => lesson && lesson._id)
        .map((lesson: Lesson, index: number) => ({
          ...lesson,
          order: lesson.order ?? index + 1
        }))
      
      setLessons(lessonsWithOrder);
    } catch (err) {
      console.error('Fetch lessons error:', err);
      setError('Failed to fetch lessons')
    }
  }

  const createLesson = async () => {
    if (!lessonTitle.trim()) {
      setError('Please enter a lesson title')
      setTimeout(() => setError(''), 3000)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post(`/instructor/courses/${courseId}/lessons`, {
        courseId,
        title: lessonTitle,
        type: lessonType,
        order: lessons.length + 1,
      })
      
      console.log('Create lesson full response:', res.data)
      
      // Try multiple possible response structures
      let lessonData = null
      
      // Check different possible nested structures
      if (res.data.data?.lesson) {
        lessonData = res.data.data.lesson
      } else if (res.data.lesson) {
        lessonData = res.data.lesson
      } else if (res.data.data && res.data.data._id) {
        lessonData = res.data.data
      } else if (res.data._id) {
        lessonData = res.data
      }
      
      console.log('Extracted lesson data:', lessonData)
      
      // If we still don't have valid lesson data, refetch instead
      if (!lessonData || !lessonData._id) {
        console.log('No valid lesson data in response, refetching all lessons...')
        await fetchLessons()
        setLessonTitle('')
        setSuccess('Lesson created successfully')
        setTimeout(() => setSuccess(''), 3000)
        setLoading(false)
        return
      }
      
      // Create properly structured lesson object
      const newLesson: Lesson = {
        _id: lessonData._id,
        courseId: lessonData.courseId || courseId,
        title: lessonData.title || lessonTitle,
        type: lessonData.type || lessonType,
        order: lessonData.order ?? lessons.length + 1,
        contentUrl: lessonData.contentUrl || ''
      }
      
      console.log('Adding new lesson to state:', newLesson)
      setLessons([...lessons, newLesson])
      setLessonTitle('')
      setSuccess('Lesson created successfully')
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      console.error('Create lesson error:', err)
      console.error('Error response:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create lesson'
      setError(errorMessage)
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (lessonId: string) => {
    try {
      await api.delete(`/instructor/lessons/${lessonId}`)
      
      const remainingLessons = lessons.filter(l => l._id !== lessonId)
      const reorderedLessons = remainingLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }))
      
      setLessons(reorderedLessons)
      setDeleteModalOpen(false)
      setLessonToDelete(null)
      setSuccess('Lesson deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Delete lesson error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to delete lesson'
      setError(errorMessage)
      setTimeout(() => setError(''), 3000)
      setDeleteModalOpen(false)
      setLessonToDelete(null)
    }
  }

  const openDeleteModal = (lessonId: string) => {
    setLessonToDelete(lessonId)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setLessonToDelete(null)
  }

  const handleUpload = async (lessonId: string) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploadingId(lessonId)
      setError('')
      setSuccess('')

      try {
        // Step 1: Get signed URL
        const signedUrlRes = await api.post('/instructor/uploads/sign', {
          courseId,
          lessonId,
          fileType: file.type,
        })
        
        const { uploadUrl, filePath } = signedUrlRes.data
        
        if (!uploadUrl || !filePath) {
          throw new Error('Invalid signed URL response')
        }
        
        // Step 2: Upload file to signed URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          }
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`)
        }

        // Step 3: Update lesson URL in database
        const updateRes = await api.post('/instructor/lessons/update-url', {
          courseId,
          lessonId,
          contentUrl: filePath,
        })

        console.log('Update response:', updateRes.data)

        // Update local state
        setLessons(prevLessons =>
          prevLessons.map(l =>
            l._id === lessonId ? { ...l, contentUrl: filePath } : l
          )
        )
        
        setSuccess('File uploaded successfully')
        setTimeout(() => setSuccess(''), 3000)
        
      } catch (err: any) {
        console.error('Upload error:', err)
        console.error('Error response:', err.response?.data)
        
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            err.message || 
                            'Failed to upload file'
        setError(errorMessage)
        setTimeout(() => setError(''), 5000)
      } finally {
        setUploadingId(null)
      }
    }
    
    fileInput.click()
  }

  useEffect(() => {
    if (courseId) {
      fetchLessons()
    }
  }, [courseId])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Alerts */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Course Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold">Course Lessons</h1>
        <p className="text-sm text-gray-500">
          Manage lessons for this course
        </p>
      </div>

      {/* Add Lesson Box */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-5">
        <h3 className="font-medium mb-4 text-gray-800">
          Add New Lesson
        </h3>

        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Lesson title"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                createLesson()
              }
            }}
            className="flex-1 min-w-[220px] rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm text-gray-800
                       placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          />

          <select
            value={lessonType}
            onChange={(e) => setLessonType(e.target.value as LessonType)}
            className="rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="VIDEO">Video</option>
            <option value="TEXT">Text</option>
            <option value="AUDIO">Audio</option>
            <option value="PDF">PDF</option>
          </select>

          <button
            onClick={createLesson}
            disabled={loading}
            className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white
                       hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Add Lesson'}
          </button>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No lessons yet. Create one to get started!</p>
          </div>
        ) : (
          lessons
            .filter(lesson => lesson && lesson._id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((lesson) => (
              <div
                key={lesson._id}
                className="
                  flex items-center justify-between
                  rounded-lg
                  border border-gray-200
                  bg-gray-100
                  p-4
                  transition
                  hover:bg-gray-200
                  hover:border-gray-300
                  hover:shadow-sm
                "
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-sm text-gray-500 w-6 text-center">
                    {lesson.order || '-'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-xs text-gray-600">
                      {formatLessonType(lesson.type as LessonType)} lesson
                      {lesson.contentUrl && ' • Content uploaded'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUpload(lesson._id)}
                    disabled={uploadingId === lesson._id}
                    className="text-sm text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingId === lesson._id ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={() => openDeleteModal(lesson._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Lesson
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => lessonToDelete && deleteLesson(lessonToDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}