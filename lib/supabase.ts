// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://afapthipsouptkvbofal.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYXB0aGlwc291cHRrdmJvZmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTc5MDEsImV4cCI6MjA3NDM5MzkwMX0.f9d_r7Dob5xzSoWFIAxVWq7q9Rm8vJaBximzSFrYoNQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
