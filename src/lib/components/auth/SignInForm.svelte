<script lang="ts">
	import { getSupabaseClient } from '$lib/supabase/client';
	import { PUBLIC_SITE_URL } from '$env/static/public';

	let email = $state('');
	let submitted = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!email.trim()) return;
		loading = true;
		error = '';

		const supabase = getSupabaseClient();
		if (!supabase) {
			error = 'Auth not configured. Add your Supabase credentials.';
			loading = false;
			return;
		}

		// Stash localStorage progress in a cookie so the server-side callback
		// can migrate it to the DB after the magic link is clicked.
		try {
			const raw = localStorage.getItem('finance-academy-progress');
			if (raw) {
				document.cookie = `fa_migrate=${encodeURIComponent(raw)}; max-age=3600; path=/; SameSite=Lax`;
			}
		} catch {
			// localStorage unavailable — nothing to migrate
		}

		const redirectTo = `${PUBLIC_SITE_URL}/auth/callback`;
		const { error: err } = await supabase.auth.signInWithOtp({
			email: email.trim(),
			options: { emailRedirectTo: redirectTo },
		});

		if (err) {
			error = err.message;
		} else {
			submitted = true;
		}
		loading = false;
	}
</script>

{#if submitted}
	<div class="text-center py-6 flex flex-col items-center gap-3">
		<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
			📬
		</div>
		<div>
			<p class="font-semibold text-zinc-900">Check your email</p>
			<p class="text-sm text-zinc-500 mt-1">
				We sent a sign-in link to <strong>{email}</strong>.
				Click it to continue — no password needed.
			</p>
		</div>
		<button
			type="button"
			onclick={() => { submitted = false; email = ''; }}
			class="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
		>
			Use a different email
		</button>
	</div>
{:else}
	<form onsubmit={submit} class="flex flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<label for="email" class="text-sm font-medium text-zinc-700">Email address</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="you@example.com"
				required
				autocomplete="email"
				class="px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-zinc-400"
			/>
		</div>

		{#if error}
			<p class="text-sm text-danger rounded-lg bg-danger/5 border border-danger/15 px-3 py-2">
				{error}
			</p>
		{/if}

		<button
			type="submit"
			disabled={loading || !email.trim()}
			class="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{loading ? 'Sending…' : 'Send magic link'}
		</button>

		<p class="text-xs text-center text-zinc-400">
			No password needed. We'll email you a one-click sign-in link.
		</p>
	</form>
{/if}
