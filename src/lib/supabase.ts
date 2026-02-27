import { createClient } from '@supabase/supabase-js';

// Guaranteed Fallbacks for 100% Connectivity
const FALLBACK_URL = 'https://biqfjrvnnuoxrzfcyjcl.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcWZqcnZubnVveHJ6ZmN5amNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzg2NjIsImV4cCI6MjA4NzY1NDY2Mn0.AXS_Oy6dQ8KM9sFfnLU_t4cf8louTxVRBEEMDrviqZ8';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'pocketpilot-pro' }
  }
});
