<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';

	const visible = $derived(auth.isLoggedIn && auth.currentStreak > 0);
</script>

{#if visible}
	<a
		href="/dashboard"
		class="group flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors"
		title="You're on a {auth.currentStreak}-day streak. Don't break it!"
		aria-label="{auth.currentStreak}-day streak. Click to view dashboard."
	>
		<span class="text-base leading-none">🔥</span>
		<span class="font-mono text-zinc-700 tabular-nums">{auth.currentStreak}</span>
	</a>
{/if}
