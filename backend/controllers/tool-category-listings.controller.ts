import { Request, Response } from "express";
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Helper to create authenticated Supabase client
const getSupabaseClient = (authToken?: string) => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
  
  if (authToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    })
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Get auth token from request
const getAuthToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return undefined
}

// Helper to calculate default rank for a category
const getDefaultRank = async (categoryId: string, supabase: any): Promise<number> => {
  const { data } = await supabase
    .from('tool_category_listings')
    .select('rank_in_category')
    .eq('category_id', categoryId)
    .order('rank_in_category', { ascending: false })
    .limit(1)
  
  if (!data || data.length === 0) return 1
  const maxRank = data[0].rank_in_category
  return (maxRank ?? 0) + 1
}

// Add tool to category
const addToolToCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params
    const token = getAuthToken(req)
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    const supabase = getSupabaseClient(token)
    const { tool_id, category_description, rank_in_category } = req.body

    // Validate required fields
    if (!tool_id || !category_description) {
      return res.status(400).json({ error: 'tool_id and category_description are required' })
    }

    // Validate tool exists
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', tool_id)
      .single()

    if (toolError || !tool) {
      return res.status(404).json({ error: 'Tool not found' })
    }

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // Calculate default rank if not provided
    let finalRank = rank_in_category
    if (finalRank === undefined || finalRank === null) {
      finalRank = await getDefaultRank(categoryId, supabase)
    }

    // Create listing
    const { data, error } = await supabase
      .from('tool_category_listings')
      .insert({
        tool_id,
        category_id: categoryId,
        category_description,
        rank_in_category: finalRank
      })
      .select('*, tools(*), categories(*)')
      .single()

    if (error) {
      // Check for UNIQUE constraint violation
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Tool is already in this category' })
      }
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Update tool category listing
const updateToolCategoryListing = async (req: Request, res: Response) => {
  try {
    const { categoryId, toolId } = req.params
    const token = getAuthToken(req)
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    const supabase = getSupabaseClient(token)
    const { category_description, rank_in_category } = req.body

    // Check if listing exists
    const { data: existingListing, error: fetchError } = await supabase
      .from('tool_category_listings')
      .select('*')
      .eq('tool_id', toolId)
      .eq('category_id', categoryId)
      .single()

    if (fetchError || !existingListing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {}
    if (category_description !== undefined) {
      updateData.category_description = category_description
    }
    if (rank_in_category !== undefined) {
      updateData.rank_in_category = rank_in_category
    }

    // Update listing
    const { data, error } = await supabase
      .from('tool_category_listings')
      .update(updateData)
      .eq('tool_id', toolId)
      .eq('category_id', categoryId)
      .select('*, tools(*), categories(*)')
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Remove tool from category
const removeToolFromCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, toolId } = req.params
    const token = getAuthToken(req)
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    const supabase = getSupabaseClient(token)

    // Check if listing exists
    const { data: existingListing, error: fetchError } = await supabase
      .from('tool_category_listings')
      .select('id')
      .eq('tool_id', toolId)
      .eq('category_id', categoryId)
      .single()

    if (fetchError || !existingListing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    // Delete listing
    const { error } = await supabase
      .from('tool_category_listings')
      .delete()
      .eq('tool_id', toolId)
      .eq('category_id', categoryId)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Tool removed from category successfully' })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Get all tools in a category
const getToolsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params
    const token = getAuthToken(req)
    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('tool_category_listings')
      .select('*, tools(*)')
      .eq('category_id', categoryId)
      .order('rank_in_category', { ascending: true, nullsFirst: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json(data || [])
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Get all categories for a tool
const getCategoriesByTool = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params
    const token = getAuthToken(req)
    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('tool_category_listings')
      .select('*, categories(*)')
      .eq('tool_id', toolId)
      .order('rank_in_category', { ascending: true, nullsFirst: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json(data || [])
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Get specific tool category listing
const getToolCategoryListing = async (req: Request, res: Response) => {
  try {
    const { categoryId, toolId } = req.params
    const token = getAuthToken(req)
    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('tool_category_listings')
      .select('*, tools(*), categories(*)')
      .eq('tool_id', toolId)
      .eq('category_id', categoryId)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export default {
  addToolToCategory,
  updateToolCategoryListing,
  removeToolFromCategory,
  getToolsByCategory,
  getCategoriesByTool,
  getToolCategoryListing
}

