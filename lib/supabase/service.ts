import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client -- bypasses RLS entirely. Only ever import this from
 * server-only code (Route Handlers, webhooks) that has no user session to
 * authenticate through, e.g. the Stripe payment webhook. Never import this
 * from a client component or anything that ships to the browser.
 */
export function createServiceClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
