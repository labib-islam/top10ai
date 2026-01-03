import express from 'express'
import { Request, Response } from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import toolsRoutes from './routes/tools.routes'
import categoriesRoutes from './routes/categories.routes'

dotenv.config()
const app = express()
const port = process.env.PORT || 8800 as number;
app.use(express.json())

// Allow requests from frontend
app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true, // allow cookies
    })
  );

// Single supabase client for interacting with database
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

// Check if connection is initialized
if (supabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    console.log('Connected to database')
}

app.get("/", (req: Request, res: Response) => {
    res.send("Top10AI Backend")
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/tools", toolsRoutes)
app.use("/api/categories", categoriesRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})