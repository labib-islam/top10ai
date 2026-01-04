'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ToolListing } from '@/types'

interface CategoryToolCardProps {
  listing: ToolListing
  index: number
}

export default function CategoryToolCard({ listing, index }: CategoryToolCardProps) {
  const tool = listing.tools
  const isEven = index % 2 === 0
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100">
      <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
        {/* Image Section */}
        {tool.image_url && (
          <div className="relative w-full lg:w-1/3 h-64 lg:h-auto bg-gradient-to-br from-blue-50 to-purple-50">
            <Image
              src={tool.image_url}
              alt={tool.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              {listing.rank_in_category && (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-lg">
                  #{listing.rank_in_category}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Content Section */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {tool.name}
              </h3>
              
              {/* Category-specific description */}
              {listing.category_description && (
                <p className="text-gray-700 text-base leading-relaxed mb-6">
                  {listing.category_description}
                </p>
              )}
              
              {/* Generic description as fallback */}
              {!listing.category_description && tool.generic_description && (
                <p className="text-gray-700 text-base leading-relaxed mb-6">
                  {tool.generic_description}
                </p>
              )}
            </div>
            
            {/* Rank badge for mobile/tablet when no image */}
          {!tool.image_url && listing.rank_in_category && (
            <span className="flex-shrink-0 ml-4 px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg shadow-md">
              #{listing.rank_in_category}
            </span>
          )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/tools/${tool.slug}`}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors group"
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              View Details
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
            </Link>
            {tool.website_url && (
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group"
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
    </div>
  )
}

