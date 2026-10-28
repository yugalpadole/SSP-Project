import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[eBazaar Database] Connected to Supabase Cloud Database successfully!');
  } catch (err) {
    console.warn('[eBazaar Database] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[eBazaar Database] No Supabase credentials found in .env. Running on local SQLite database.');
}

export function isSupabaseConnected(): boolean {
  return supabase !== null;
}
