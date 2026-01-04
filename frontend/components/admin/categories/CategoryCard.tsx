'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string
    display_order?: number
    image_url?: string
    created_at?: string
  }
  onDelete?: (id: string) => void
}

export default function CategoryCard({ category, onDelete }: CategoryCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCardClick = () => {
    router.push(`/admin/categories/${category.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with overlay */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {category.image_url && !imageError ? (
          <>
            <img
              src={category.image_url}
              alt={category.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              onError={() => setImageError(true)}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {category.name}
            </h3>
            {category.display_order !== undefined && (
              <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                #{category.display_order}
              </span>
            )}
          </div>
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded mb-2">
            {category.slug}
          </span>
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {category.description}
            </p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Category</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/update/${category.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 flex items-center gap-1.5 group/edit"
            >
              <svg className="w-4 h-4 transition-transform group-hover/edit:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete(category.id)
                }}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-1.5 group/delete"
              >
                <svg className="w-4 h-4 transition-transform group-hover/delete:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

