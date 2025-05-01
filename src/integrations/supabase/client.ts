
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ndopdaifnmzdkdjsolbq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3BkYWlmbm16ZGtkanNvbGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODIzNDgsImV4cCI6MjA2MTY1ODM0OH0.08199L9E4T8KGTxZkW83FTjRo058DomUn2v0OarzOBw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});
