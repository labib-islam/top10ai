import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = process.env.PORT || 8800 as number;

// Allow requests from frontend
app.use(
    cors({
      origin: ["http://localhost:3000", "https://labib-islam.github.io"],
      credentials: true, // allow cookies
    })
  );

// Single supabase client for interacting with database
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

// Check if connection is initialized
if (supabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    console.log('Connected to database')
}

app.use(express.json())
