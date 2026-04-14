<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { getSupabaseClient } from '$lib/supabase/client';
	import type { Badge, UserBadge } from '$lib/types/database';

	let allBadges = $state<Badge[]>([]);
	let earnedBadges = $state<UserBadge[]>([]);
	let loading = $state(true);

	onMount(async () => {
		const supabase = getSupabaseClient();
		if (!supabase) { loading = false; return; }

		const [badgesRes, earnedRes] = await Promise.all([
			supabase.from('badges').select('*').order('display_order'),
			auth.user
				? supabase.from('user_badges').select('*').eq('user_id', auth.user.id)
				: Promise.resolve({ data: [] }),
		]);

		allBadges = (badgesRes.data ?? []) as Badge[];
		earnedBadges = (earnedRes.data ?? []) as UserBadge[];
		loading = false;
	});

	const earnedSlugs = $derived(new Set(earnedBadges.map((b) => b.badge_slug)));
	const earnedCount = $derived(earnedBadges.length);
</script>

<svelte:head>
	<title>Badges — Finance Academy</title>
	<meta name="description" content="Earn badges by completing lessons, maintaining streaks, and using calculators on Finance Academy." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-zinc-900">Badges</h1>
		<p class="text-zinc-500 mt-1 text-sm">
			{#if auth.isLoggedIn}
				You've earned <strong class="text-zinc-700">{earnedCount}</strong> of {allBadges.length} badges.
			{:else}
				<a href="/auth/signin" class="text-primary font-medium hover:underline">Sign in</a> to track which badges you've earned.
			{/if}
		</p>
	</div>

	{#if loading}
		<div class="text-zinc-400 text-sm">Loading…</div>
	{:else}
		<div class="grid sm:grid-cols-2 gap-3">
			{#each allBadges as badge}
				{@const earned = earnedSlugs.has(badge.slug)}
				<div
					class="flex items-center gap-4 p-4 bg-white rounded-xl border transition-all
						{earned ? 'border-zinc-200 shadow-sm' : 'border-zinc-100 opacity-60'}"
				>
					<span class="text-3xl shrink-0 {earned ? '' : 'grayscale'}">{badge.emoji}</span>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2">
							<p class="font-semibold text-zinc-900 text-sm">{badge.name}</p>
							{#if earned}
								<span class="text-[10px] bg-success/10 text-success font-semibold px-1.5 py-0.5 rounded-full shrink-0">Earned</span>
							{/if}
						</div>
						<p class="text-xs text-zinc-500 mt-0.5 leading-relaxed">{badge.description}</p>
					</div>
					{#if !earned}
						<span class="text-zinc-300 shrink-0">🔒</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
