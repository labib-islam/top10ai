'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

interface Tool {
  id: string
  name: string
  slug: string
  image_url?: string
}

interface AddToolToCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  onSuccess: () => void
}

export default function AddToolToCategoryModal({
  isOpen,
  onClose,
  categoryId,
  onSuccess,
}: AddToolToCategoryModalProps) {
  const { token } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [categoryDescription, setCategoryDescription] = useState('')
  const [rankInCategory, setRankInCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchTools()
      // Reset form when modal opens
      setSelectedTool(null)
      setCategoryDescription('')
      setRankInCategory('')
      setSearchQuery('')
      setError('')
    }
  }, [isOpen, categoryId, token])

  useEffect(() => {
    if (searchQuery) {
      const filtered = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredTools(filtered)
    } else {
      setFilteredTools(tools.slice(0, 10)) // Show first 10 when no search
    }
  }, [searchQuery, tools])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        // Don't close if clicking the modal backdrop
        if ((event.target as HTMLElement).closest('.modal-backdrop')) {
          return
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchTools = async () => {
    try {
      setLoading(true)
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
      setFilteredTools((data || []).slice(0, 10))
    } catch (err: any) {
      setError(err.message || 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool)
    setSearchQuery(tool.name)
    setFilteredTools([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedTool) {
      setError('Please select a tool')
      return
    }

    if (!categoryDescription.trim()) {
      setError('Category description is required')
      return
    }

    setSubmitting(true)
    try {
      const body: any = {
        tool_id: selectedTool.id,
        category_description: categoryDescription,
      }

      if (rankInCategory) {
        body.rank_in_category = parseInt(rankInCategory)
      }

      const response = await fetch(`${API_URL}/api/categories/${categoryId}/tools`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      // Check for token expiration
      if (response.status === 401 || response.status === 403) {
        // Token expired - will be handled by AuthContext
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add tool to category')
      }

      // Success - close modal and refresh
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add tool to category')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto modal-backdrop">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50 z-[100]"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative z-[101] inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Add Tool to Category</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-300 p-3">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Tool Selector */}
                <div className="relative">
                  <label htmlFor="tool" className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Tool <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (selectedTool && e.target.value !== selectedTool.name) {
                          setSelectedTool(null)
                        }
                      }}
                      onFocus={() => {
                        if (tools.length > 0 && !selectedTool) {
                          setFilteredTools(tools.slice(0, 10))
                        }
                      }}
                      placeholder="Search for a tool..."
                      className="w-full px-4 py-2.5 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                    />
                    {selectedTool && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTool(null)
                          setSearchQuery('')
                        }}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {!selectedTool && searchQuery && filteredTools.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      {filteredTools.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => handleSelectTool(tool)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          {tool.image_url ? (
                            <img
                              src={tool.image_url}
                              alt={tool.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                            <p className="text-xs text-gray-500">{tool.slug}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedTool && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                      {selectedTool.image_url ? (
                        <img
                          src={selectedTool.image_url}
                          alt={selectedTool.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedTool.name}</p>
                        <p className="text-xs text-gray-500">{selectedTool.slug}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Description */}
                <div>
                  <label htmlFor="category_description" className="block text-sm font-semibold text-gray-900 mb-2">
                    Category Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="category_description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 resize-y"
                    placeholder="Describe this tool in the context of this category..."
                  />
                </div>

                {/* Rank in Category */}
                <div>
                  <label htmlFor="rank_in_category" className="block text-sm font-semibold text-gray-900 mb-2">
                    Rank in Category (Optional)
                  </label>
                  <input
                    type="number"
                    id="rank_in_category"
                    value={rankInCategory}
                    onChange={(e) => setRankInCategory(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                    placeholder="Auto-assigned if not provided"
                  />
                  <p className="mt-1.5 text-xs text-gray-600">
                    Lower numbers appear first. Leave empty to auto-assign.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || !selectedTool || !categoryDescription.trim()}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Tool'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-lg border-2 border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

