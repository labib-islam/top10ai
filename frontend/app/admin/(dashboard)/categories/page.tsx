import Link from 'next/link'
import CategoriesList from '@/components/admin/categories/CategoriesList'

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">Manage tool categories</p>
        </div>
        <Link 
          href="/admin/categories/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
        >
          Add New Category
        </Link>
      </div>

      {/* Categories List */}
      <CategoriesList />
    </div>
  )
}

