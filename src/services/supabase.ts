import { createClient } from '@supabase/supabase-js';

// We'll use Vite environment variables. 
// If they are missing, the app will gracefully wait for them to be added.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
