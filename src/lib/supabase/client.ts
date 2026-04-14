import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Returns a singleton Supabase browser client. Returns null if env vars are not configured. */
export function getSupabaseClient() {
	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) return null;
	if (!_client) {
		_client = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	}
	return _client;
}
