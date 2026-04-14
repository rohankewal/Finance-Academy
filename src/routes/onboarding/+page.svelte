<script lang="ts">
	import OnboardingFlow from '$lib/components/auth/OnboardingFlow.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// If not logged in, redirect to sign in
		if (!auth.loading && !auth.isLoggedIn) {
			goto('/auth/signin');
		}
	});
</script>

<svelte:head>
	<title>Welcome — Finance Academy</title>
</svelte:head>

<div class="min-h-[calc(100vh-var(--topnav-height))] flex items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<p class="text-4xl mb-3">🎓</p>
			<h1 class="text-2xl font-bold text-zinc-900">Welcome to Finance Academy</h1>
			<p class="text-sm text-zinc-500 mt-1">Let's set up your profile in 30 seconds.</p>
		</div>
		<OnboardingFlow />
	</div>
</div>
