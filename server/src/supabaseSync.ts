import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export async function testSupabaseConnection() {
  if (!supabaseUrl || !supabaseKey) {
    console.log('[Supabase Sync] Missing SUPABASE_URL or keys in .env');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('categories').select('id, name').limit(5);

    if (error) {
      console.error('[Supabase Sync] Connection test error:', error.message);
      return false;
    }

    console.log('[Supabase Sync] Successfully connected to Supabase! Categories found:', data?.length || 0);
    return true;
  } catch (err: any) {
    console.error('[Supabase Sync] Unexpected connection error:', err.message);
    return false;
  }
}
