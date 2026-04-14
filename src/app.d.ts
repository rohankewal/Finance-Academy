import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			session: Session | null;
		}
		interface PageData {}
		interface Error {}
		interface Platform {}
	}
}

export {};
