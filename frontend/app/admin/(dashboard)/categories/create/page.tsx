import CategoryForm from '@/components/admin/categories/CategoryForm'

export default function CreateCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Category</h1>
        <p className="mt-2 text-gray-600">Add a new category to organize your tools</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CategoryForm />
      </div>
    </div>
  )
}

