'use client'

import { useState, useEffect } from 'react'
import ToolCard from '@/components/user/tools/ToolCard'
import type { Tool } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tools`)

        if (response.ok) {
          const data = await response.json()
          const toolsList = Array.isArray(data) ? data : []
          setTools(toolsList)
          setFilteredTools(toolsList)
        }
      } catch (error) {
        console.error('Failed to fetch tools:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  // Filter tools based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTools(tools)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.slug.toLowerCase().includes(query) ||
        (tool.generic_description && tool.generic_description.toLowerCase().includes(query))
    )
    setFilteredTools(filtered)
  }, [searchQuery, tools])

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            All AI Tools
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover the best AI tools and resources to boost your productivity
          </p>
        </div>
      </section>

      {/* Search and Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Found {filteredTools.length} tool{filteredTools.length === 1 ? '' : 's'}
              </p>
            )}
          </div>

          {/* Tools Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No tools found matching your search.' : 'No tools available yet.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

