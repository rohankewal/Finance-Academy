<script lang="ts">
	import SignInForm from '$lib/components/auth/SignInForm.svelte';
	import { page } from '$app/stores';

	const redirectTo = $derived($page.url.searchParams.get('redirectTo') ?? '/dashboard');
</script>

<svelte:head>
	<title>Sign in — Finance Academy</title>
</svelte:head>

<div class="min-h-[calc(100vh-var(--topnav-height))] flex items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		<!-- Logo mark -->
		<div class="flex justify-center mb-8">
			<div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
					<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
					<polyline points="17 6 23 6 23 12"></polyline>
				</svg>
			</div>
		</div>

		<div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
			<div class="mb-6 text-center">
				<h1 class="text-xl font-bold text-zinc-900">Sign in to Finance Academy</h1>
				<p class="text-sm text-zinc-500 mt-1">
					Save your progress, earn badges, and build a streak.
				</p>
			</div>

			<SignInForm />

			<p class="mt-6 text-xs text-center text-zinc-400 leading-relaxed">
				No account? Just enter your email — we'll create one automatically.<br />
				All lessons and calculators are free, forever.
			</p>
		</div>

		<p class="mt-4 text-center text-xs text-zinc-400">
			<a href="/" class="hover:text-zinc-600 transition-colors">← Continue without an account</a>
		</p>
	</div>
</div>
