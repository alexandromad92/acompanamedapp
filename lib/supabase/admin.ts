// Cliente con service_role — SOLO para Route Handlers del servidor
// NUNCA importar desde Client Components
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
