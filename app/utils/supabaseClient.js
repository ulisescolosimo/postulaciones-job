import { createClient } from '@supabase/supabase-js';

const supabaseUrl = `https://atsvymtevynaelwzfjzh.supabase.co`
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0c3Z5bXRldnluYWVsd3pmanpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTY5MDEsImV4cCI6MjA1NDM5MjkwMX0.WkDQ0GH422dYHGel9WpMV8nZmND1GMa2HYF2OQCgIBw`;

export const supabase = createClient(supabaseUrl, supabaseKey);