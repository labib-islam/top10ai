'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CategoryCard from '@/components/user/categories/CategoryCard'
import ToolCard from '@/components/user/tools/ToolCard'
import type { Tool, Category } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export default function Home() {
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tools and categories in parallel
        const [toolsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/tools`),
          fetch(`${API_URL}/api/categories`)
        ])

        if (toolsRes.ok) {
          const toolsData = await toolsRes.json()
          // Get first 6 tools as featured
          setFeaturedTools(Array.isArray(toolsData) ? toolsData.slice(0, 6) : [])
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          // Sort by display_order if available, otherwise by name
          const sorted = Array.isArray(categoriesData) 
            ? categoriesData.sort((a: Category, b: Category) => {
                if (a.display_order !== undefined && b.display_order !== undefined) {
                  return a.display_order - b.display_order
                }
                return a.name.localeCompare(b.name)
              })
            : []
          setCategories(sorted.slice(0, 8)) // Show first 8 categories
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover the Best
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Tools & Resources
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore curated collections of top AI tools, organized by category. 
              Find the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Browse Categories
              </Link>
              <Link
                href="/tools"
                className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View All Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse AI tools organized by category to find exactly what you need
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Tools Section */}
      <section id="tools" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured AI Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of the best AI tools and resources
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : featuredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No tools available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Discover hundreds of AI tools and resources to boost your productivity
          </p>
          <Link
            href="#categories"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
