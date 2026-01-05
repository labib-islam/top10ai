import express from 'express'
import { Request, Response } from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import toolsRoutes from './routes/tools.routes'
import categoriesRoutes from './routes/categories.routes'
import toolCategoryListingsRoutes from './routes/tool-category-listings.routes'

dotenv.config()
const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8800
const HOST = process.env.HOST || "0.0.0.0" // Listen on all interfaces for network access
app.use(express.json())

// Replace the CORS configuration (lines 18-23)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://localhost:3000", "http://10.0.0.96:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
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
// Register nested routes before parent routes to avoid conflicts
app.use("/api", toolCategoryListingsRoutes)
app.use("/api/tools", toolsRoutes)
app.use("/api/categories", categoriesRoutes)

app.listen(PORT, HOST, () => {
    console.log(`Server is running on:`);
    console.log(`- Local:   http://localhost:${PORT}`);
    console.log(`- Network: http://10.0.0.96:${PORT}`);
});