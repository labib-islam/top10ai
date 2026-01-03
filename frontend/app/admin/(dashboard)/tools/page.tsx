import Link from 'next/link'
import ToolsList from '@/components/admin/tools/ToolsList'

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
          <p className="mt-2 text-gray-600">Manage your AI tools</p>
        </div>
        <Link 
          href="/admin/tools/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
        >
          Add New Tool
        </Link>
      </div>

      {/* Tools List */}
      <ToolsList />
    </div>
  )
}

