import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { migrateLocalProgress } from '$lib/gamification/migrate';

export const GET: RequestHandler = async ({ url, locals: { supabase }, cookies }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';

	if (code) {
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error && data.user) {
			// Migrate any localStorage progress stored when the user requested the magic link
			const rawProgress = cookies.get('fa_migrate');
			if (rawProgress) {
				try {
					await migrateLocalProgress(data.user.id, supabase, decodeURIComponent(rawProgress));
				} catch {
					// Migration errors are non-fatal — user still signs in successfully
				}
				// Clear the migration cookie
				cookies.delete('fa_migrate', { path: '/' });
			}

			// Redirect to onboarding for new users (checked client-side) or dashboard
			throw redirect(303, next === '/dashboard' ? '/onboarding' : next);
		}
	}

	// Auth failed — redirect to sign-in with error message
	throw redirect(303, '/auth/signin?error=auth_failed');
};
