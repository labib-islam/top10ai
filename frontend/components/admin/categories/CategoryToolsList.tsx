'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { ToolListing } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

interface CategoryToolsListProps {
  categoryId: string
  onRefresh?: () => void
}

export default function CategoryToolsList({ categoryId, onRefresh }: CategoryToolsListProps) {
  const router = useRouter()
  const { token } = useAuth()
  const [listings, setListings] = useState<ToolListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ category_description: '', rank_in_category: '' })

  useEffect(() => {
    fetchTools()
  }, [categoryId, token])

  const fetchTools = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/categories/${categoryId}/tools`, {
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
        throw new Error('Failed to fetch tools')
      }

      const data = await response.json()
      setListings(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (listing: ToolListing) => {
    setEditingId(listing.id)
    setEditForm({
      category_description: listing.category_description,
      rank_in_category: listing.rank_in_category?.toString() || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ category_description: '', rank_in_category: '' })
  }

  const handleSaveEdit = async (listingId: string, toolId: string) => {
    try {
      const updateData: any = {
        category_description: editForm.category_description
      }
      
      if (editForm.rank_in_category) {
        updateData.rank_in_category = parseInt(editForm.rank_in_category)
      }

      const response = await fetch(`${API_URL}/api/categories/${categoryId}/tools/${toolId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      // Check for token expiration
      if (response.status === 401 || response.status === 403) {
        // Token expired - will be handled by AuthContext
        return
      }

      if (!response.ok) {
        throw new Error('Failed to update listing')
      }

      setEditingId(null)
      fetchTools()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      alert(err.message || 'Failed to update listing')
    }
  }

  const handleRemove = async (toolId: string, toolName: string) => {
    if (!confirm(`Are you sure you want to remove "${toolName}" from this category?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/categories/${categoryId}/tools/${toolId}`, {
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
        throw new Error('Failed to remove tool')
      }

      fetchTools()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      alert(err.message || 'Failed to remove tool')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Rank
              </th>
              <th className="px-6 pr-12 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tool
              </th>
              <th className="pl-12 pr-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No tools in this category yet. Add your first tool to get started.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === listing.id ? (
                      <input
                        type="number"
                        value={editForm.rank_in_category}
                        onChange={(e) => setEditForm({ ...editForm, rank_in_category: e.target.value })}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Auto"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-blue-600">
                        #{listing.rank_in_category ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 pr-12 py-4">
                    <div className="flex items-center gap-3">
                      {listing.tools.image_url ? (
                        <img
                          src={listing.tools.image_url}
                          alt={listing.tools.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/admin/tools/${listing.tools.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {listing.tools.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{listing.tools.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="pl-12 pr-6 py-4">
                    {editingId === listing.id ? (
                      <textarea
                        value={editForm.category_description}
                        onChange={(e) => setEditForm({ ...editForm, category_description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Category-specific description..."
                      />
                    ) : (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {listing.category_description || <span className="text-gray-400 italic">No description</span>}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === listing.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSaveEdit(listing.id, listing.tool_id)}
                          className="text-green-600 hover:text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(listing)}
                          className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(listing.tool_id, listing.tools.name)}
                          className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

