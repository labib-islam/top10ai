import { Request, Response } from "express";
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Helper to create Supabase client for storage (uses service role key)
const getSupabaseStorageClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Add this to .env
  
  return createClient(supabaseUrl, supabaseServiceKey)
}
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

// Get all tools
const getAllTools = async (req: Request, res: Response) => {
  try {
    const token = getAuthToken(req)
    const supabase = getSupabaseClient(token)
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Get single tool by ID
const getToolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const token = getAuthToken(req)
    const supabase = getSupabaseClient(token)
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return res.status(404).json({ error: error.message })
    }
    
    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Get single tool by slug
const getToolBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const token = getAuthToken(req)
    const supabase = getSupabaseClient(token)
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      return res.status(404).json({ error: error.message })
    }
    
    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Create new tool (requires authentication)
const createTool = async (req: Request, res: Response) => {
  try {
    const token = getAuthToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    const supabase = getSupabaseClient(token)
    const storageClient = getSupabaseStorageClient()

    // Handle image upload if provided
    let image_url = null
    if (req.file) {
      const file = req.file
      const fileExt = file.originalname.split('.').pop()
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`
      const filePath = `tools/${fileName}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await storageClient.storage
        .from('assets') // Your storage bucket name
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        })
      
      if (uploadError) {
        return res.status(400).json({ error: `Image upload failed: ${uploadError.message}` })
      }
      
      // Get public URL
      const { data: urlData } = storageClient.storage
        .from('assets')
        .getPublicUrl(filePath)
      
      image_url = urlData.publicUrl
    }

    // Prepare tool data - remove 'image' field and add image_url
    const { image, ...restBody } = req.body
    const toolData = {
      ...restBody,
      image_url: image_url || req.body.image_url || null // Use uploaded image, provided URL, or null
    }

    const { data, error } = await supabase
      .from('tools')
      .insert(toolData)
      .select()
      .single()
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(201).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Update tool (requires authentication)
const updateTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const token = getAuthToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    const supabase = getSupabaseClient(token)
    const storageClient = getSupabaseStorageClient()

    // Get current tool to find existing image
    const { data: currentTool, error: fetchError } = await supabase
      .from('tools')
      .select('image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return res.status(404).json({ error: 'Tool not found' })
    }

    // Handle image upload if provided
    let image_url = req.body.image_url || currentTool.image_url // Keep existing if no new image
    if (req.file) {
      // Delete previous image if it exists
      if (currentTool.image_url) {
        try {
          // Extract file path from URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/assets/tools/filename.jpg
          const urlParts = currentTool.image_url.split('/public/assets/')
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1]
            await storageClient.storage
              .from('assets')
              .remove([oldFilePath])
          }
        } catch (deleteError) {
          // Log error but don't fail the update if deletion fails
          console.error('Failed to delete old image:', deleteError)
        }
      }

      // Upload new image
      const file = req.file
      const fileExt = file.originalname.split('.').pop()
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`
      const filePath = `tools/${fileName}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await storageClient.storage
        .from('assets')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        })
      
      if (uploadError) {
        return res.status(400).json({ error: `Image upload failed: ${uploadError.message}` })
      }
      
      // Get public URL
      const { data: urlData } = storageClient.storage
        .from('assets')
        .getPublicUrl(filePath)
      
      image_url = urlData.publicUrl
    }

    // Prepare tool data - remove 'image' field and add image_url
    const { image, ...restBody } = req.body
    const toolData = {
      ...restBody,
      image_url: image_url || null
    }

    const { data, error } = await supabase
      .from('tools')
      .update(toolData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

// Delete tool (requires authentication)
const deleteTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const token = getAuthToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    const supabase = getSupabaseClient(token)
    const storageClient = getSupabaseStorageClient()

    // Get tool to find associated image
    const { data: tool, error: fetchError } = await supabase
      .from('tools')
      .select('image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return res.status(404).json({ error: 'Tool not found' })
    }

    // Delete image from storage if it exists
    if (tool.image_url) {
      try {
        // Extract file path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/assets/tools/filename.jpg
        const urlParts = tool.image_url.split('/public/assets/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          const { error: deleteImageError } = await storageClient.storage
            .from('assets')
            .remove([filePath])
          
          if (deleteImageError) {
            console.error('Failed to delete image from storage:', deleteImageError)
            // Continue with tool deletion even if image deletion fails
          }
        }
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError)
        // Continue with tool deletion even if image deletion fails
      }
    }

    // Delete tool from database
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id)
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json({ message: 'Tool deleted successfully' })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export default {
  getAllTools,
  getToolById,
  getToolBySlug,
  createTool,
  updateTool,
  deleteTool
}

