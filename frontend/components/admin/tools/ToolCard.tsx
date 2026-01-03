'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ToolCardProps {
  tool: {
    id: string
    name: string
    slug: string
    generic_description?: string
    website_url?: string
    image_url?: string
    created_at?: string
  }
  onDelete?: (id: string) => void
}

export default function ToolCard({ tool, onDelete }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with overlay */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {tool.image_url && !imageError ? (
          <>
            <img
              src={tool.image_url}
              alt={tool.name}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Hover overlay with quick actions */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {tool.website_url && (
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg font-medium hover:bg-white transition-all transform hover:scale-105 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit
              </span>
            </a>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
            {tool.slug}
          </span>
        </div>
        
        {tool.generic_description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {tool.generic_description}
          </p>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tool</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/tools/update/${tool.id}`}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-1.5 group/edit"
            >
              <svg className="w-4 h-4 transition-transform group-hover/edit:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(tool.id)}
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
