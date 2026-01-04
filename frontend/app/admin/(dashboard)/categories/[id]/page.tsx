'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import CategoryToolsList from '@/components/admin/categories/CategoryToolsList'
import AddToolToCategoryModal from '@/components/admin/categories/AddToolToCategoryModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const categoryId = params.id as string
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        // Check for token expiration
        if (response.status === 401 || response.status === 403) {
          // Token expired - will be handled by AuthContext
          return
        }

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Check for token expiration
      if (response.status === 401 || response.status === 403) {
        // Token expired - will be handled by AuthContext
        return
      }

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      router.push('/admin/categories')
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
      setDeleting(false)
    }
  }

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
        <Link
          href="/admin/categories"
          className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Categories
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/categories"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{category.name}</h1>
          <p className="mt-2 text-gray-600">Category Details</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/categories/update/${categoryId}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Category
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          {category.image_url ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative w-full aspect-video bg-gray-100">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}

          {/* Quick Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</label>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{category.slug}</p>
              </div>
              {category.display_order !== undefined && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Display Order</label>
                  <p className="mt-1 text-sm text-gray-900 font-semibold text-blue-600">#{category.display_order}</p>
                </div>
              )}
              {category.created_at && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(category.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {category.description && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{category.description}</p>
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{category.id}</dd>
              </div>
              {category.display_order !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Display Order</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{category.display_order}</dd>
                </div>
              )}
              {category.created_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(category.created_at).toLocaleString('en-US')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Tools in Category Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tools in this Category</h2>
            <p className="mt-1 text-sm text-gray-600">Manage tools associated with this category</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Tool
          </button>
        </div>

        <CategoryToolsList 
          categoryId={categoryId} 
          key={refreshKey}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      </div>

      {/* Add Tool Modal */}
      <AddToolToCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={categoryId}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1)
        }}
      />
    </div>
  )
}

