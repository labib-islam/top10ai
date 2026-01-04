'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

interface Tool {
  id: string
  name: string
  slug: string
  generic_description?: string
  website_url?: string
  image_url?: string
  created_at?: string
}

export default function ToolsList() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tools`, {
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
        setTools(data || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load tools')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchTools()
    }
  }, [token])

  const handleDelete = async (id: string, toolName: string) => {
    if (!confirm(`Are you sure you want to delete "${toolName}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/tools/${id}`, {
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
        throw new Error('Failed to delete tool')
      }

      // Remove tool from list
      setTools(tools.filter(tool => tool.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete tool')
    }
  }

  // Filter tools based on search query
  const filteredTools = tools.filter((tool) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.slug.toLowerCase().includes(query) ||
      (tool.generic_description && tool.generic_description.toLowerCase().includes(query))
    )
  })

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
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, slug, or description..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Image
              </th>
              <th className="px-6 pr-12 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tool
              </th>
              <th className="pl-12 pr-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTools.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {tools.length === 0 
                    ? 'No tools found. Create your first tool to get started.'
                    : `No tools match "${searchQuery}". Try a different search term.`
                  }
                </td>
              </tr>
            ) : (
              filteredTools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tool.image_url ? (
                      <img
                        src={tool.image_url}
                        alt={tool.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-6 pr-12 py-4">
                    <div>
                      <Link
                        href={`/admin/tools/${tool.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {tool.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{tool.slug}</p>
                    </div>
                  </td>
                  <td className="pl-12 pr-6 py-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {tool.generic_description || <span className="text-gray-400 italic">No description</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tool.website_url ? (
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tool.created_at ? (
                      new Date(tool.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tools/${tool.id}`}
                        className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/tools/update/${tool.id}`}
                        className="text-green-600 hover:text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(tool.id, tool.name)}
                        className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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

