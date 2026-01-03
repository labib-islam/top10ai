import ToolForm from '@/components/admin/tools/ToolForm'

export default function CreateToolPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Tool</h1>
        <p className="mt-2 text-gray-600">Add a new AI tool to your collection</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ToolForm />
      </div>
    </div>
  )
}

