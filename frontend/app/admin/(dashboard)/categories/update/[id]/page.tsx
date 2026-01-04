'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export default function UpdateCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const categoryId = params.id as string
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch category')
        }

        const data = await response.json()
        setCategory(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    if (categoryId && token) {
      fetchCategory()
    }
  }, [categoryId, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Category not found'}</p>
        </div>
        <button
          onClick={() => router.push('/admin/categories')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Categories
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Update Category</h1>
        <p className="mt-2 text-gray-600">Edit category information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CategoryForm categoryId={categoryId} initialData={category} />
      </div>
    </div>
  )
}

