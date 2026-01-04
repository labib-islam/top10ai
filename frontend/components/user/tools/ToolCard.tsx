'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <Link href={`/tools/${tool.slug}`} className="block">
        {tool.image_url && (
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={tool.image_url}
              alt={tool.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          {tool.generic_description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {tool.generic_description}
            </p>
          )}
          <span className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
            View Details
            <svg
              className="ml-2 w-4 h-4"
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
          </span>
        </div>
      </Link>
    </div>
  )
}

