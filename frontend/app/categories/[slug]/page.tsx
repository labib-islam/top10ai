'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CategoryToolCard from '@/components/user/tools/CategoryToolCard'
import type { Category, ToolListing } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [toolListings, setToolListings] = useState<ToolListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        
        // Fetch category by slug directly
        const categoryRes = await fetch(`${API_URL}/api/categories/slug/${slug}`)
        if (!categoryRes.ok) {
          if (categoryRes.status === 404) {
            setError('Category not found')
            setLoading(false)
            return
          }
          throw new Error('Failed to fetch category')
        }
        
        const foundCategory = await categoryRes.json()
        setCategory(foundCategory)
        
        // Now fetch tools for this category
        try {
          const toolsRes = await fetch(`${API_URL}/api/categories/${foundCategory.id}/tools`)
          if (toolsRes.ok) {
            const toolsData = await toolsRes.json()
            setToolListings(Array.isArray(toolsData) ? toolsData : [])
          } else {
            // If tools endpoint fails, still show category but with empty tools list
            console.warn('Failed to fetch tools for category:', toolsRes.status, toolsRes.statusText)
            // Try to get error message
            try {
              const errorData = await toolsRes.json()
              console.warn('Error details:', errorData)
            } catch {
              // Ignore JSON parse errors
            }
            setToolListings([])
          }
        } catch (toolsErr: any) {
          // If tools fetch fails completely, still show category
          console.warn('Error fetching tools:', toolsErr)
          setToolListings([])
        }
      } catch (err: any) {
        console.error('Error fetching category data:', err)
        setError(err.message || 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategoryData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The category you are looking for does not exist.'}</p>
            <Link
              href="/categories"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Category Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {category.image_url && (
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/categories" className="hover:text-blue-600">Categories</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{category.name}</span>
              </nav>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              AI Tools in {category.name}
            </h2>
            <p className="text-lg text-gray-600">
              {toolListings.length} {toolListings.length === 1 ? 'tool' : 'tools'} available
            </p>
          </div>

          {toolListings.length > 0 ? (
            <div className="space-y-8">
              {toolListings.map((listing, index) => (
                <CategoryToolCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No tools yet</h3>
              <p className="mt-2 text-gray-600">
                This category doesn't have any tools listed yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Back to Categories Link */}
      <section className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/categories"
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
            Back to All Categories
          </Link>
        </div>
      </section>
    </div>
  )
}

