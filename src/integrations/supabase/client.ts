
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lljiqniebnmfbytbkjkv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsamlxbmllYm5tZmJ5dGJramt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzODUxOTEsImV4cCI6MjAyOTk2MTE5MX0.ZM0v_SJFV7qDskk_LJ3-lq8bgarMdm8a09GcTgs6tBs";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
