import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_FramesImagesBLOB_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_FramesImagesBLOB_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
