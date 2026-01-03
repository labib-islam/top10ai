'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ToolCard from './ToolCard'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

interface Tool {
  id: string
  name: string
  slug: string
  generic_description?: string
  website_url?: string
  image_url?: string
  created_at?: string
}

export default function ToolsList() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tools`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch tools')
        }

        const data = await response.json()
        setTools(data || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load tools')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchTools()
    }
  }, [token])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/tools/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete tool')
      }

      // Remove tool from list
      setTools(tools.filter(tool => tool.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete tool')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No tools found. Create your first tool to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onDelete={handleDelete} />
      ))}
    </div>
  )
}

