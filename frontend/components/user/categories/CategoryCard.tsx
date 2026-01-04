'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
    >
      {category.image_url && (
        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-gray-600 text-sm line-clamp-2">
          {category.description}
        </p>
      )}
    </Link>
  )
}

