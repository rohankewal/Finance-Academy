import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import type { Database } from '$lib/types/database';

/** Creates a server-side Supabase client using cookie-based sessions. */
export function createSupabaseServerClient(cookies: Cookies) {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookies.set(name, value, { ...(options as Parameters<typeof cookies.set>[2]), path: '/' }),
				);
			},
		},
	});
}

/** Creates a Supabase admin client using the service role key (bypasses RLS). Server-only. */
export function createSupabaseAdminClient() {
	return createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}
