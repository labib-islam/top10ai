'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { CategoryListing } from '@/types'

interface ToolCategoryCardProps {
  listing: CategoryListing
}

export default function ToolCategoryCard({ listing }: ToolCategoryCardProps) {
  const category = listing.categories
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200">
      <div className="flex flex-col sm:flex-row">
        {/* Category Image */}
        {category.image_url && (
          <div className="relative w-full sm:w-32 h-32 sm:h-auto bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 left-2">
              {listing.rank_in_category && (
                <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm rounded-full shadow-md">
                  #{listing.rank_in_category}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Category Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {category.name}
                </Link>
                {!category.image_url && listing.rank_in_category && (
                  <span className="flex-shrink-0 px-2 py-1 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs rounded shadow-sm">
                    #{listing.rank_in_category}
                  </span>
                )}
              </div>
              
              {/* Category-specific description */}
              {listing.category_description && (
                <p className="text-gray-700 text-sm leading-relaxed mb-2 line-clamp-2">
                  {listing.category_description}
                </p>
              )}
              
              {/* Category description as secondary info */}
              {category.description && !listing.category_description && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <Link
                href={`/categories/${category.slug}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 group"
              >
                View Category
                <svg
                  className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

