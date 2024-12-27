import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kytlyvrbqfrqegqxpzbj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dGx5dnJicWZycWVncXhwemJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxODcwMDcsImV4cCI6MjA1MDc2MzAwN30.7LUpCcvkY4LniWSFEWTod9fACpSveNaap30HqPKE1bM"
            

export const supabase = createClient(supabaseUrl, supabaseKey)

