import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://jkexmeoduleieibebtnf.supabase.co"
const supabaseAnonKey = "sb_publishable_II8BtIkvHUDRQu0ST0HeeA_P3cqy6U4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)