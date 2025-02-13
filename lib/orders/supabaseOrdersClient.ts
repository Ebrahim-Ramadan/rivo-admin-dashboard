import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ejvggqlnxnhhqqztxncd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ORDERS_KEY || ''
export const supabase = createClient(supabaseUrl, supabaseKey)