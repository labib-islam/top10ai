export interface Tool {
  id: string
  name: string
  slug: string
  generic_description?: string
  website_url?: string
  image_url?: string
  created_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order?: number
  created_at?: string
}

export interface ToolListing {
  id: string
  category_id: string
  tool_id: string
  category_description: string
  rank_in_category?: number
  tools: Tool
}

export interface CategoryListing {
  id: string
  category_id: string
  tool_id: string
  category_description: string
  rank_in_category?: number
  categories: Category
}

