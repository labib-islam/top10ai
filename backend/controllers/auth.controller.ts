import { Request, Response } from "express";
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ access_token: data.session?.access_token });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

const verifyToken = async (req: Request, res: Response) => {
    let token: string | undefined;
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ user: data.user });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};
export default { login, verifyToken };