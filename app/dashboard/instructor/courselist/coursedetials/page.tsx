export default function CourseDetailsPage()
{
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Course Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold">Course Title</h1>
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
            className="flex-1 min-w-[220px] rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm text-gray-800
                       placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          />

          <select
            className="rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="video">Video</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
          </select>

          <button
            className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white
                       hover:bg-gray-800 active:scale-[0.98] transition"
          >
            Add Lesson
          </button>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">

        {/* Lesson Card */}
        <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 w-6">01</span>
            <div>
              <h4 className="font-medium">Introduction</h4>
              <p className="text-xs text-gray-500">Video lesson</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm text-blue-600 hover:underline">
              Upload
            </button>
            <button className="text-sm text-gray-600 hover:underline">
              Edit
            </button>
            <button className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>

        {/* Lesson Card */}
        <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 w-6">02</span>
            <div>
              <h4 className="font-medium">Getting Started</h4>
              <p className="text-xs text-gray-500">Text lesson</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm text-blue-600 hover:underline">
              Upload
            </button>
            <button className="text-sm text-gray-600 hover:underline">
              Edit
            </button>
            <button className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>

        {/* Lesson Card */}
        <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 w-6">03</span>
            <div>
              <h4 className="font-medium">Advanced Concepts</h4>
              <p className="text-xs text-gray-500">Audio lesson</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm text-blue-600 hover:underline">
              Upload
            </button>
            <button className="text-sm text-gray-600 hover:underline">
              Edit
            </button>
            <button className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
