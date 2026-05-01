import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      `Missing env vars: ${!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''}${!serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`
    )
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
