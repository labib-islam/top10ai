'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ToolCategoryCard from '@/components/user/categories/ToolCategoryCard'
import type { Tool, CategoryListing } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export default function ToolDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [tool, setTool] = useState<Tool | null>(null)
  const [categoryListings, setCategoryListings] = useState<CategoryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchToolData = async () => {
      try {
        setLoading(true)
        
        // Fetch tool by slug directly
        const toolRes = await fetch(`${API_URL}/api/tools/slug/${slug}`)
        if (!toolRes.ok) {
          if (toolRes.status === 404) {
            setError('Tool not found')
            setLoading(false)
            return
          }
          throw new Error('Failed to fetch tool')
        }
        
        const foundTool = await toolRes.json()
        setTool(foundTool)
        
        // Now fetch categories for this tool
        try {
          const categoriesRes = await fetch(`${API_URL}/api/tools/${foundTool.id}/categories`)
          if (categoriesRes.ok) {
            const categoriesData = await categoriesRes.json()
            setCategoryListings(Array.isArray(categoriesData) ? categoriesData : [])
          } else {
            console.warn('Failed to fetch categories for tool:', categoriesRes.status, categoriesRes.statusText)
            setCategoryListings([])
          }
        } catch (categoriesErr: any) {
          console.warn('Error fetching categories:', categoriesErr)
          setCategoryListings([])
        }
      } catch (err: any) {
        console.error('Error fetching tool data:', err)
        setError(err.message || 'Failed to load tool')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchToolData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tool Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The tool you are looking for does not exist.'}</p>
            <Link
              href="/tools"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Tools
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Tool Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-blue-600">Tools</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{tool.name}</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {tool.image_url && (
              <div className="relative w-full lg:w-96 h-64 lg:h-96 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
                <Image
                  src={tool.image_url}
                  alt={tool.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {tool.name}
              </h1>
              
              {tool.generic_description && (
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {tool.generic_description}
                </p>
              )}
              
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <svg
                    className="mr-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Visit Website
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categoryListings.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Featured In Categories
            </h2>
            
            <div className="space-y-3">
              {categoryListings.map((listing) => (
                <ToolCategoryCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Tools Link */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/tools"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg
              className="mr-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to All Tools
          </Link>
        </div>
      </section>
    </div>
  )
}

