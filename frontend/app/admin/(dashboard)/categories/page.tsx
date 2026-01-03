export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">Manage tool categories</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-500">No categories yet</p>
          <p className="text-sm text-gray-400 mt-2">Create your first category to get started</p>
        </div>
      </div>
    </div>
  )
}

