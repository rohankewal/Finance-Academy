import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const PROTECTED_ROUTES = ['/dashboard', '/settings'];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' }),
				);
			},
		},
	});

	// Use getUser() for secure server-side auth (not getSession which trusts the client JWT)
	const {
		data: { user },
	} = await event.locals.supabase.auth.getUser();

	event.locals.session = user
		? (await event.locals.supabase.auth.getSession()).data.session
		: null;

	// Protect routes that require authentication
	const isProtected = PROTECTED_ROUTES.some((r) => event.url.pathname.startsWith(r));
	if (isProtected && !user) {
		throw redirect(303, `/auth/signin?redirectTo=${encodeURIComponent(event.url.pathname)}`);
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Required for Supabase to pass content-range and api-version headers
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});
};
